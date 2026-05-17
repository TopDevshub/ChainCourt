#![no_std]
use soroban_sdk::{contract, contractimpl, contracttype, Address, Env, String};

#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub enum EscrowState {
    Active,
    Disputed,
    Resolved,
}

#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub struct Escrow {
    pub client: Address,
    pub contractor: Address,
    pub amount: i128,
    pub state: EscrowState,
    pub ai_summary: String, // AI Evidence Summary or AI Decision
}

#[contract]
pub struct ChainCourtContract;

const ESCROW_KEY: &str = "Escrow";

#[contractimpl]
impl ChainCourtContract {
    pub fn create_escrow(env: Env, client: Address, contractor: Address, amount: i128) {
        client.require_auth();
        let escrow = Escrow {
            client,
            contractor,
            amount,
            state: EscrowState::Active,
            ai_summary: String::from_str(&env, ""),
        };
        env.storage().instance().set(&String::from_str(&env, ESCROW_KEY), &escrow);
    }

    pub fn raise_dispute(env: Env, caller: Address, ai_summary: String) {
        caller.require_auth();
        let mut escrow: Escrow = env.storage().instance().get(&String::from_str(&env, ESCROW_KEY)).unwrap();
        escrow.state = EscrowState::Disputed;
        escrow.ai_summary = ai_summary;
        env.storage().instance().set(&String::from_str(&env, ESCROW_KEY), &escrow);
    }

    pub fn resolve_dispute(env: Env, oracle: Address, winner: Address) {
        oracle.require_auth();
        let mut escrow: Escrow = env.storage().instance().get(&String::from_str(&env, ESCROW_KEY)).unwrap();
        escrow.state = EscrowState::Resolved;
        env.storage().instance().set(&String::from_str(&env, ESCROW_KEY), &escrow);
        // Note: Actual token transfer logic would be implemented here using token contracts
    }
    
    pub fn get_escrow(env: Env) -> Escrow {
        env.storage().instance().get(&String::from_str(&env, ESCROW_KEY)).unwrap()
    }
}
