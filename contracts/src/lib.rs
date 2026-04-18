#![no_std]
use soroban_sdk::{contract, contractimpl, contracttype, Address, Env, String, symbol_short};

#[contracttype]
pub enum DataKey {
    Token,
    Admin,
    Balance(Address),
    Allowance(Address, Address),
}

#[contract]
pub struct StellarPayToken;

#[contractimpl]
impl StellarPayToken {
    /// Initialize the token with name, symbol, and admin
    pub fn initialize(env: Env, name: String, symbol: String, admin: Address) {
        if env.storage().instance().has(&DataKey::Token) {
            panic!("already initialized");
        }
        
        env.storage().instance().set(&DataKey::Token, &(name, symbol, 0i128));
        env.storage().instance().set(&DataKey::Admin, &admin);
    }

    /// Get token information (name, symbol, total_supply)
    pub fn get_info(env: Env) -> (String, String, i128) {
        env.storage().instance()
            .get(&DataKey::Token)
            .unwrap_or_else(|| panic!("token not initialized"))
    }

    /// Get the admin address
    pub fn get_admin(env: Env) -> Address {
        env.storage().instance()
            .get(&DataKey::Admin)
            .unwrap_or_else(|| panic!("admin not set"))
    }

    /// Mint new tokens (admin only)
    pub fn mint(env: Env, to: Address, amount: i128) {
        let admin = Self::get_admin(env.clone());
        admin.require_auth();
        
        if amount <= 0 {
            panic!("amount must be positive");
        }

        let mut balance = Self::balance(env.clone(), to.clone());
        balance += amount;
        env.storage().instance().set(&DataKey::Balance(to), &balance);

        let (_, _, mut total_supply) = Self::get_info(env.clone());
        total_supply += amount;
        env.storage().instance().set(&DataKey::Token, &(
            Self::get_info(env.clone()).0,
            Self::get_info(env.clone()).1,
            total_supply
        ));

        env.events().publish(
            symbol_short!("mint"),
            (to, amount),
        );
    }

    /// Burn tokens (admin only)
    pub fn burn(env: Env, from: Address, amount: i128) {
        let admin = Self::get_admin(env.clone());
        admin.require_auth();
        
        let balance = Self::balance(env.clone(), from.clone());
        if balance < amount {
            panic!("insufficient balance");
        }

        let new_balance = balance - amount;
        env.storage().instance().set(&DataKey::Balance(from), &new_balance);

        let (_, _, mut total_supply) = Self::get_info(env.clone());
        total_supply -= amount;
        env.storage().instance().set(&DataKey::Token, &(
            Self::get_info(env.clone()).0,
            Self::get_info(env.clone()).1,
            total_supply
        ));

        env.events().publish(
            symbol_short!("burn"),
            (from, amount),
        );
    }

    /// Transfer tokens
    pub fn transfer(env: Env, from: Address, to: Address, amount: i128) {
        from.require_auth();
        
        if amount <= 0 {
            panic!("amount must be positive");
        }

        let from_balance = Self::balance(env.clone(), from.clone());
        if from_balance < amount {
            panic!("insufficient balance");
        }

        let to_balance = Self::balance(env.clone(), to.clone());
        
        env.storage().instance().set(&DataKey::Balance(from), &(from_balance - amount));
        env.storage().instance().set(&DataKey::Balance(to), &(to_balance + amount));

        env.events().publish(
            symbol_short!("transfer"),
            (from, to, amount),
        );
    }

    /// Approve spending of tokens
    pub fn approve(env: Env, owner: Address, spender: Address, amount: i128) {
        owner.require_auth();
        
        if amount < 0 {
            panic!("amount must be non-negative");
        }

        env.storage().instance().set(&DataKey::Allowance(owner, spender), &amount);

        env.events().publish(
            symbol_short!("approve"),
            (owner, spender, amount),
        );
    }

    /// Transfer tokens from approved address
    pub fn transfer_from(env: Env, spender: Address, from: Address, to: Address, amount: i128) {
        spender.require_auth();
        
        if amount <= 0 {
            panic!("amount must be positive");
        }

        let allowance = Self::allowance(env.clone(), from.clone(), spender.clone());
        if allowance < amount {
            panic!("insufficient allowance");
        }

        let from_balance = Self::balance(env.clone(), from.clone());
        if from_balance < amount {
            panic!("insufficient balance");
        }

        let to_balance = Self::balance(env.clone(), to.clone());
        
        // Update balances
        env.storage().instance().set(&DataKey::Balance(from), &(from_balance - amount));
        env.storage().instance().set(&DataKey::Balance(to), &(to_balance + amount));
        
        // Update allowance
        let new_allowance = allowance - amount;
        env.storage().instance().set(&DataKey::Allowance(from, spender), &new_allowance);

        env.events().publish(
            symbol_short!("transfer_from"),
            (from, to, amount),
        );
    }

    /// Get balance of an address
    pub fn balance(env: Env, addr: Address) -> i128 {
        env.storage().instance()
            .get(&DataKey::Balance(addr))
            .unwrap_or(0)
    }

    /// Get allowance amount
    pub fn allowance(env: Env, owner: Address, spender: Address) -> i128 {
        env.storage().instance()
            .get(&DataKey::Allowance(owner, spender))
            .unwrap_or(0)
    }

    /// Decimals (fixed at 7 for Stellar compatibility)
    pub fn decimals(_env: Env) -> u32 {
        7
    }
}
