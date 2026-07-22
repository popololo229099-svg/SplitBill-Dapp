#![no_std]
use soroban_sdk::{contract, contractimpl, contracttype, symbol_short, Address, Env, String, Vec};

#[contracttype]
pub struct SplitRecord {
    pub id: u64,
    pub sender: Address,
    pub recipient: Address,
    pub amount: String,
    pub timestamp: u64,
}

#[derive(Clone)]
#[contracttype]
pub enum DataKey {
    Splits,
    TotalSplits,
    Split(u64),
}

#[contract]
pub struct Contract;

#[contractimpl]
impl Contract {
    pub fn initialize(env: Env) {
        if env.storage().instance().has(&DataKey::TotalSplits) {
            panic!("already initialized");
        }
        env.storage()
            .instance()
            .set(&DataKey::TotalSplits, &0u64);
    }

    pub fn record_split(
        env: Env,
        sender: Address,
        recipient: Address,
        amount: String,
    ) -> u64 {
        sender.require_auth();

        let total: u64 = env
            .storage()
            .instance()
            .get(&DataKey::TotalSplits)
            .unwrap_or(0);
        let new_id = total + 1;
        let timestamp = env.ledger().timestamp();

        let record = SplitRecord {
            id: new_id,
            sender: sender.clone(),
            recipient: recipient.clone(),
            amount: amount.clone(),
            timestamp,
        };

        env.storage()
            .instance()
            .set(&DataKey::Split(new_id), &record);
        env.storage()
            .instance()
            .set(&DataKey::TotalSplits, &new_id);

        env.events().publish(
            (symbol_short!("SPLIT"),),
            (
                new_id,
                sender,
                recipient,
                amount,
                timestamp,
            ),
        );

        new_id
    }

    pub fn get_total_splits(env: Env) -> u64 {
        env.storage()
            .instance()
            .get(&DataKey::TotalSplits)
            .unwrap_or(0)
    }

    pub fn get_split(env: Env, id: u64) -> SplitRecord {
        env.storage()
            .instance()
            .get(&DataKey::Split(id))
            .expect("split not found")
    }

    pub fn get_splits(env: Env, start: u64, limit: u32) -> Vec<SplitRecord> {
        let total = env
            .storage()
            .instance()
            .get(&DataKey::TotalSplits)
            .unwrap_or(0u64);

        let mut result = Vec::new(&env);
        let mut count = 0u32;
        let mut i = if start == 0 { total } else { start };

        while i > 0 && count < limit {
            if let Some(record) = env.storage().instance().get(&DataKey::Split(i)) {
                result.push_back(record);
                count += 1;
            }
            i -= 1;
        }

        result
    }
}

mod test;
