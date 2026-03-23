import * as StellarSdk from '@stellar/stellar-sdk';

export const NETWORK_PASSPHRASE = StellarSdk.Networks.TESTNET;
export const HORIZON_URL = 'https://horizon-testnet.stellar.org';
export const FRIENDBOT_URL = 'https://friendbot.stellar.org';

export const server = new StellarSdk.Horizon.Server(HORIZON_URL);

export function generateKeypair() {
  const keypair = StellarSdk.Keypair.random();
  return { publicKey: keypair.publicKey(), secretKey: keypair.secret() };
}

export function keypairFromSecret(secretKey) {
  const keypair = StellarSdk.Keypair.fromSecret(secretKey);
  return { publicKey: keypair.publicKey(), secretKey: keypair.secret() };
}

export function isValidPublicKey(address) {
  try { StellarSdk.Keypair.fromPublicKey(address); return true; }
  catch { return false; }
}

export function isValidSecretKey(secret) {
  try { StellarSdk.Keypair.fromSecret(secret); return true; }
  catch { return false; }
}

export async function fundWithFriendbot(publicKey) {
  const response = await fetch(`${FRIENDBOT_URL}?addr=${encodeURIComponent(publicKey)}`);
  if (!response.ok) {
    const err = await response.json();
    throw new Error(err?.detail || 'Friendbot funding failed');
  }
  return response.json();
}

export async function getAccountDetails(publicKey) {
  const account = await server.loadAccount(publicKey);
  const xlmBalance = account.balances.find((b) => b.asset_type === 'native')?.balance || '0';
  return {
    xlmBalance,
    sequence: account.sequence,
    subentryCount: account.subentry_count,
    balances: account.balances,
  };
}

export async function sendXLM(secretKey, destination, amount, memo = '') {
  const senderKeypair = StellarSdk.Keypair.fromSecret(secretKey);
  const senderAccount = await server.loadAccount(senderKeypair.publicKey());

  const transactionBuilder = new StellarSdk.TransactionBuilder(senderAccount, {
    fee: StellarSdk.BASE_FEE,
    networkPassphrase: NETWORK_PASSPHRASE,
  });

  let destinationExists = true;
  try { await server.loadAccount(destination); }
  catch { destinationExists = false; }

  if (destinationExists) {
    transactionBuilder.addOperation(
      StellarSdk.Operation.payment({
        destination,
        asset: StellarSdk.Asset.native(),
        amount: amount.toString(),
      })
    );
  } else {
    transactionBuilder.addOperation(
      StellarSdk.Operation.createAccount({
        destination,
        startingBalance: amount.toString(),
      })
    );
  }

  if (memo) transactionBuilder.addMemo(StellarSdk.Memo.text(memo));
  const transaction = transactionBuilder.setTimeout(30).build();
  transaction.sign(senderKeypair);
  return server.submitTransaction(transaction);
}

export async function getRecentTransactions(publicKey, limit = 10) {
  const transactions = await server
    .transactions()
    .forAccount(publicKey)
    .order('desc')
    .limit(limit)
    .call();
  return transactions.records;
}

export function formatAddress(address, chars = 6) {
  if (!address || address.length <= chars * 2) return address;
  return `${address.slice(0, chars)}...${address.slice(-chars)}`;
}

export function formatXLM(amount) {
  const num = parseFloat(amount);
  if (isNaN(num)) return '0.0000000';
  return num.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 7 });
}
