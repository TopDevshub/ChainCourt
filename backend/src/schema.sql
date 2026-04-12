CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    stellar_wallet VARCHAR(56) UNIQUE NOT NULL,
    role VARCHAR(20) DEFAULT 'user', -- user, freelancer, juror
    reputation_score INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE agreements (
    id SERIAL PRIMARY KEY,
    client_id INT REFERENCES users(id),
    freelancer_id INT REFERENCES users(id),
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    amount NUMERIC NOT NULL,
    escrow_contract_id VARCHAR(56), -- Soroban contract address/instance
    status VARCHAR(20) DEFAULT 'pending', -- pending, locked, completed, disputed
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE disputes (
    id SERIAL PRIMARY KEY,
    agreement_id INT REFERENCES agreements(id),
    initiator_id INT REFERENCES users(id),
    reason TEXT NOT NULL,
    status VARCHAR(20) DEFAULT 'open', -- open, voting, resolved
    outcome VARCHAR(20), -- client_won, freelancer_won, split
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE evidence (
    id SERIAL PRIMARY KEY,
    dispute_id INT REFERENCES disputes(id),
    submitted_by INT REFERENCES users(id),
    ipfs_hash VARCHAR(255) NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE jury_votes (
    id SERIAL PRIMARY KEY,
    dispute_id INT REFERENCES disputes(id),
    juror_id INT REFERENCES users(id),
    vote VARCHAR(20) NOT NULL, -- client_won, freelancer_won, split
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(dispute_id, juror_id)
);
