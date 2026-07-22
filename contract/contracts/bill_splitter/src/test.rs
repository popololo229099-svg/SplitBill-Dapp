#![cfg(test)]

use super::*;
use soroban_sdk::{testutils::Address as _, testutils::Ledger, IntoVal, Env, String};

fn create_split(
    env: &Env,
    client: &ContractClient,
    sender: &Address,
    recipient: &Address,
    amount: &str,
) -> u64 {
    let amt = String::from_str(env, amount);
    client
        .mock_auths(&[soroban_sdk::testutils::MockAuth {
            address: sender,
            invoke: &soroban_sdk::testutils::MockAuthInvoke {
                contract: &client.address,
                fn_name: "record_split",
                args: (sender, recipient, amt.clone()).into_val(env),
                sub_invokes: &[],
            },
        }])
        .record_split(sender, recipient, &amt)
}

fn setup() -> (Env, ContractClient<'static>) {
    let env = Env::default();
    let contract_id = env.register_contract(None, Contract);
    let client = ContractClient::new(&env, &contract_id);
    client.initialize();
    (env, client)
}

#[test]
fn test_initialize_and_record_split() {
    let (env, client) = setup();

    let sender = Address::generate(&env);
    let recipient = Address::generate(&env);

    let id = create_split(&env, &client, &sender, &recipient, "10.5");
    assert_eq!(id, 1);

    let total = client.get_total_splits();
    assert_eq!(total, 1);

    let record = client.get_split(&1);
    assert_eq!(record.sender, sender);
    assert_eq!(record.recipient, recipient);
    assert_eq!(record.amount, String::from_str(&env, "10.5"));
}

#[test]
fn test_multiple_splits() {
    let (env, client) = setup();

    let s1 = Address::generate(&env);
    let s2 = Address::generate(&env);
    let r1 = Address::generate(&env);
    let r2 = Address::generate(&env);

    create_split(&env, &client, &s1, &r1, "5.0");
    create_split(&env, &client, &s2, &r2, "3.0");

    assert_eq!(client.get_total_splits(), 2);

    let splits = client.get_splits(&0, &10);
    assert_eq!(splits.len(), 2);
}

#[test]
#[should_panic(expected = "already initialized")]
fn test_double_init() {
    let (_, client) = setup();
    client.initialize();
}

#[test]
fn test_get_splits_pagination() {
    let (env, client) = setup();

    let sender = Address::generate(&env);
    let recipient = Address::generate(&env);

    for i in 0..5 {
        create_split(&env, &client, &sender, &recipient, "1.0");
        env.ledger().set_timestamp(1000 * (i + 1));
    }

    let page1 = client.get_splits(&0, &3);
    assert_eq!(page1.len(), 3);
    assert_eq!(page1.get(0).unwrap().id, 5);
    assert_eq!(page1.get(1).unwrap().id, 4);
    assert_eq!(page1.get(2).unwrap().id, 3);

    let page2 = client.get_splits(&2, &3);
    assert_eq!(page2.len(), 2);
    assert_eq!(page2.get(0).unwrap().id, 2);
    assert_eq!(page2.get(1).unwrap().id, 1);
}

#[test]
fn test_get_splits_empty() {
    let (_, client) = setup();
    let splits = client.get_splits(&0, &10);
    assert_eq!(splits.len(), 0);
}

#[test]
fn test_get_total_splits_initial_zero() {
    let (_, client) = setup();
    assert_eq!(client.get_total_splits(), 0);
}

#[test]
#[should_panic(expected = "split not found")]
fn test_get_split_not_found() {
    let (_, client) = setup();
    client.get_split(&999);
}

#[test]
fn test_record_split_same_sender_recipient() {
    let (env, client) = setup();

    let addr = Address::generate(&env);

    create_split(&env, &client, &addr, &addr, "1.0");

    assert_eq!(client.get_total_splits(), 1);
    let record = client.get_split(&1);
    assert_eq!(record.sender, addr);
    assert_eq!(record.recipient, addr);
}

#[test]
fn test_split_amounts_various() {
    let (env, client) = setup();

    let sender = Address::generate(&env);
    let recipient = Address::generate(&env);

    let amounts = ["0.0000001", "9999999.9999999", "1", "0.5"];
    for (i, amt_str) in amounts.iter().enumerate() {
        create_split(&env, &client, &sender, &recipient, amt_str);

        let record = client.get_split(&(i as u64 + 1));
        assert_eq!(record.amount, String::from_str(&env, amt_str));
    }

    assert_eq!(client.get_total_splits(), 4);
}

#[test]
fn test_event_emission() {
    let (env, client) = setup();

    let sender = Address::generate(&env);
    let recipient = Address::generate(&env);

    env.ledger().set_timestamp(1700000000);

    create_split(&env, &client, &sender, &recipient, "25.0");

    let record = client.get_split(&1);
    assert_eq!(record.sender, sender);
    assert_eq!(record.recipient, recipient);
    assert_eq!(record.amount, String::from_str(&env, "25.0"));
    assert_eq!(record.timestamp, 1700000000);
}
