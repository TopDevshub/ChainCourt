import express from 'express';
import cors from 'cors';
import { PrismaClient } from '@prisma/client';
import OpenAI from 'openai';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const prisma = new PrismaClient();
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const PORT = process.env.PORT || 3001;

// POST /api/escrow - Create a new escrow record
app.post('/api/escrow', async (req, res) => {
  try {
    const { id, client, contractor, amount, txHash } = req.body;
    if (!txHash) {
      return res.status(400).json({ success: false, error: 'Transaction hash is required' });
    }
    // In a production app, we would verify txHash with Stellar RPC here.
    
    const escrow = await prisma.escrow.create({
      data: {
        id: id || crypto.randomUUID(),
        client,
        contractor,
        amount: parseFloat(amount),
      },
    });
    res.json({ success: true, data: escrow });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: 'Failed to create escrow' });
  }
});

// GET /api/escrow - Fetch escrows with optional filtering by public key
app.get('/api/escrow', async (req, res) => {
  try {
    const { publicKey } = req.query;
    
    let whereClause = {};
    if (publicKey && typeof publicKey === 'string') {
      whereClause = {
        OR: [
          { client: publicKey },
          { contractor: publicKey }
        ]
      };
    }

    const escrows = await prisma.escrow.findMany({
      where: whereClause,
      orderBy: { createdAt: 'desc' }
    });
    res.json({ success: true, data: escrows });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: 'Failed to fetch escrows' });
  }
});

// GET /api/escrow/:id - Fetch an escrow record
app.get('/api/escrow/:id', async (req, res) => {
  try {
    const escrow = await prisma.escrow.findUnique({
      where: { id: req.params.id },
    });
    if (!escrow) {
      return res.status(404).json({ success: false, error: 'Escrow not found' });
    }
    res.json({ success: true, data: escrow });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: 'Failed to fetch escrow' });
  }
});

// POST /api/dispute/analyze - Generate AI analysis for a dispute
app.post('/api/dispute/analyze', async (req, res) => {
  const { evidence } = req.body;
  try {
    if (!process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY === 'mock-key-for-now') {
      return res.status(500).json({ success: false, error: 'OpenAI API key missing.' });
    }

    const response = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        { role: 'system', content: 'You are an unbiased AI arbitration oracle. Summarize the following evidence and recommend an outcome.' },
        { role: 'user', content: evidence }
      ],
    });
    
    const aiSummary = response.choices[0]?.message?.content || "No summary provided by AI";
    res.json({ success: true, data: { aiSummary } });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: 'Failed to analyze dispute' });
  }
});

// POST /api/dispute - Raise a dispute after on-chain tx
app.post('/api/dispute', async (req, res) => {
  const { escrowId, aiSummary, txHash } = req.body;
  if (!txHash) return res.status(400).json({ success: false, error: 'Transaction hash is required' });

  try {
    const updatedEscrow = await prisma.escrow.update({
      where: { id: escrowId },
      data: {
        state: 'Disputed',
        aiSummary: aiSummary,
      },
    });
    
    res.json({
      success: true,
      message: 'Dispute recorded successfully.',
      data: updatedEscrow
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: 'Failed to process dispute' });
  }
});

// POST /api/dispute/escalate - Escalate to human jury
app.post('/api/dispute/escalate', async (req, res) => {
  const { escrowId, txHash } = req.body;
  if (!txHash) return res.status(400).json({ success: false, error: 'Transaction hash is required' });

  try {
    const updatedEscrow = await prisma.escrow.update({
      where: { id: escrowId },
      data: { state: 'Voting' },
    });
    res.json({ success: true, data: updatedEscrow });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: 'Failed to escalate to jury' });
  }
});

// POST /api/vote - Juror casts a vote
app.post('/api/vote', async (req, res) => {
  const { escrowId, jurorId, voteFor, txHash } = req.body;
  if (!txHash) return res.status(400).json({ success: false, error: 'Transaction hash is required' });

  try {
    // Check if already voted
    const existingVote = await prisma.vote.findUnique({
      where: { escrowId_jurorId: { escrowId, jurorId } }
    });
    
    if (existingVote) {
      return res.status(400).json({ success: false, error: 'Juror has already voted on this dispute' });
    }

    // Cast vote transaction
    const result = await prisma.$transaction(async (tx: any) => {
      const vote = await tx.vote.create({
        data: { escrowId, jurorId, voteFor }
      });
      
      const escrow = await tx.escrow.update({
        where: { id: escrowId },
        data: {
          votesClient: voteFor === 'Client' ? { increment: 1 } : undefined,
          votesContractor: voteFor === 'Contractor' ? { increment: 1 } : undefined,
        }
      });
      
      // If 3 votes reached, resolve it automatically
      if (escrow.votesClient + escrow.votesContractor >= 3) {
        return await tx.escrow.update({
          where: { id: escrowId },
          data: { state: 'Resolved' }
        });
      }
      return escrow;
    });

    res.json({ success: true, data: result });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: 'Failed to cast vote' });
  }
});

app.listen(PORT, () => {
  console.log(`ChainCourt Backend API listening on port ${PORT}`);
});
