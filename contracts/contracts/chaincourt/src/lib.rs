#![no_std]
use soroban_sdk::{
    contract, contractimpl, contracttype, symbol_short, token, Address, Env, String, Symbol, Map, vec, Vec
};

#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub enum EscrowState {
    Active,
    Disputed,
    Voting,
    Resolved,
}

#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub enum VoteOption {
    Client,
    Contractor,
}

#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub struct Escrow {
    pub id: String,
    pub client: Address,
    pub contractor: Address,
    pub amount: i128,
    pub state: EscrowState,
    pub ai_summary: String,
    pub votes_client: u32,
    pub votes_contractor: u32,
}

#[contracttype]
pub enum DataKey {
    Escrow(String), // Use escrow ID as key
    JurorVote(String, Address), // escrow_id, juror_address
}

#[contract]
pub struct ChainCourtContract;

#[contractimpl]
impl ChainCourtContract {
    pub fn create_escrow(
        env: Env,
        id: String,
        token: Address,
        client: Address,
        contractor: Address,
        amount: i128,
    ) {
        client.require_auth();

        let escrow = Escrow {
            id: id.clone(),
            client: client.clone(),
            contractor,
            amount,
            state: EscrowState::Active,
            ai_summary: String::from_str(&env, ""),
            votes_client: 0,
            votes_contractor: 0,
        };

        let token_client = token::Client::new(&env, &token);
        token_client.transfer(&client, &env.current_contract_address(), &amount);

        env.storage().instance().set(&DataKey::Escrow(id.clone()), &escrow);
        env.events().publish((symbol_short!("escrow"), symbol_short!("created")), id);
    }

    pub fn raise_dispute(env: Env, id: String, caller: Address, ai_summary: String) {
        caller.require_auth();
        
        let key = DataKey::Escrow(id.clone());
        let mut escrow: Escrow = env.storage().instance().get(&key).unwrap();
        
        if escrow.state != EscrowState::Active {
            panic!("Escrow is not active");
        }

        escrow.state = EscrowState::Disputed;
        escrow.ai_summary = ai_summary;
        env.storage().instance().set(&key, &escrow);
        
        env.events().publish((symbol_short!("escrow"), symbol_short!("disputed")), id);
    }

    pub fn escalate_to_jury(env: Env, id: String, caller: Address) {
        caller.require_auth();
        
        let key = DataKey::Escrow(id.clone());
        let mut escrow: Escrow = env.storage().instance().get(&key).unwrap();
        
        if escrow.state != EscrowState::Disputed {
            panic!("Escrow is not in Disputed state");
        }

        escrow.state = EscrowState::Voting;
        env.storage().instance().set(&key, &escrow);
        
        env.events().publish((symbol_short!("escrow"), symbol_short!("voting")), id);
    }

    pub fn cast_vote(env: Env, id: String, juror: Address, vote: VoteOption) {
        juror.require_auth();
        
        let key = DataKey::Escrow(id.clone());
        let mut escrow: Escrow = env.storage().instance().get(&key).unwrap();
        
        if escrow.state != EscrowState::Voting {
            panic!("Escrow is not in Voting state");
        }

        let vote_key = DataKey::JurorVote(id.clone(), juror.clone());
        if env.storage().instance().has(&vote_key) {
            panic!("Juror has already voted");
        }

        match vote {
            VoteOption::Client => escrow.votes_client += 1,
            VoteOption::Contractor => escrow.votes_contractor += 1,
        }

        env.storage().instance().set(&vote_key, &true);
        env.storage().instance().set(&key, &escrow);
        env.events().publish((symbol_short!("escrow"), symbol_short!("voted")), (id, juror));
    }

    pub fn execute_verdict(env: Env, id: String, token: Address) {
        let key = DataKey::Escrow(id.clone());
        let mut escrow: Escrow = env.storage().instance().get(&key).unwrap();
        
        if escrow.state != EscrowState::Voting {
            panic!("Escrow is not in Voting state");
        }

        // Require at least 3 total votes for a verdict
        let total_votes = escrow.votes_client + escrow.votes_contractor;
        if total_votes < 3 {
            panic!("Not enough votes to execute verdict");
        }

        let winner = if escrow.votes_client > escrow.votes_contractor {
            escrow.client.clone()
        } else {
            escrow.contractor.clone()
        };

        escrow.state = EscrowState::Resolved;
        env.storage().instance().set(&key, &escrow);
        
        let token_client = token::Client::new(&env, &token);
        token_client.transfer(&env.current_contract_address(), &winner, &escrow.amount);
        
        env.events().publish((symbol_short!("escrow"), symbol_short!("resolved")), (id, winner));
    }
    
    pub fn get_escrow(env: Env, id: String) -> Escrow {
        let key = DataKey::Escrow(id);
        env.storage().instance().get(&key).unwrap()
    }
}
