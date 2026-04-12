export interface User {
  id: number;
  stellar_wallet: string;
  role: 'user' | 'freelancer' | 'juror';
  reputation_score: number;
  created_at: Date;
}

export interface Agreement {
  id: number;
  client_id: number;
  freelancer_id: number;
  title: string;
  description: string;
  amount: number;
  escrow_contract_id?: string;
  status: 'pending' | 'locked' | 'completed' | 'disputed';
  created_at: Date;
  updated_at: Date;
}

export interface Dispute {
  id: number;
  agreement_id: number;
  initiator_id: number;
  reason: string;
  status: 'open' | 'voting' | 'resolved';
  outcome?: 'client_won' | 'freelancer_won' | 'split';
  created_at: Date;
}

export interface Evidence {
  id: number;
  dispute_id: number;
  submitted_by: number;
  ipfs_hash: string;
  description?: string;
  created_at: Date;
}

export interface JuryVote {
  id: number;
  dispute_id: number;
  juror_id: number;
  vote: 'client_won' | 'freelancer_won' | 'split';
  created_at: Date;
}
