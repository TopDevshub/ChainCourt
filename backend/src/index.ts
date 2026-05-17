import express from 'express';
import cors from 'cors';

const app = express();
app.use(cors());
app.use(express.json());


const PORT = process.env.PORT || 3001;

// AI Mock Feature Integration
const generateAISummary = async (evidence: string) => {
  // In a real scenario, this would call OpenAI/Anthropic APIs
  console.log('Generating AI Evidence Summary for:', evidence);
  return `AI Summary: Based on the provided evidence (${evidence.length} characters), the client's requirements were not fully met by the contractor. Recommended action: Partial Refund or Jury Review.`;
};

app.post('/api/dispute', async (req, res) => {
  const { escrowId, evidence } = req.body;
  
  // 1. Generate AI Summary
  const aiSummary = await generateAISummary(evidence);
  
  // 2. Interact with Smart Contract (Mocked for now)
  // Here we would use stellar-sdk/soroban-client to call the raise_dispute function on the deployed contract
  console.log(`Calling smart contract for Escrow ID: ${escrowId} with AI Summary...`);
  
  res.json({
    success: true,
    message: 'Dispute raised successfully with AI insights.',
    data: {
      escrowId,
      aiSummary,
      contractStatus: 'Disputed'
    }
  });
});

app.listen(PORT, () => {
  console.log(`ChainCourt Backend API listening on port ${PORT}`);
});
