import * as StellarSdk from '@stellar/stellar-sdk';

export const TESTNET_PASSPHRASE = 'Test SDF Network ; September 2015';
export const HORIZON_URL = 'https://horizon-testnet.stellar.org';
export const RPC_URL = 'https://soroban-testnet.stellar.org';
export const CONTRACT_ADDRESS = 'CBPZMTQ46FGY32Q3WPSORPIAW46Q2BLP5WAU2TJCSDQCOSR4TN5XFG62';

const server = new StellarSdk.Horizon.Server(HORIZON_URL);
const rpc = new StellarSdk.rpc.Server(RPC_URL);

export interface SplitRecord {
  id: bigint;
  sender: string;
  recipient: string;
  amount: string;
  timestamp: bigint;
}

export async function buildPaymentTransaction(
  sourcePublicKey: string,
  destination: string,
  amount: string,
): Promise<string> {
  const account = await server.loadAccount(sourcePublicKey);

  const transaction = new StellarSdk.TransactionBuilder(account, {
    fee: StellarSdk.BASE_FEE,
    networkPassphrase: TESTNET_PASSPHRASE,
  })
    .addOperation(
      StellarSdk.Operation.payment({
        destination,
        asset: StellarSdk.Asset.native(),
        amount,
      }),
    )
    .setTimeout(30)
    .build();

  return transaction.toXDR();
}

export async function buildRecordSplitTx(
  senderPublicKey: string,
  recipientPublicKey: string,
  amount: string,
): Promise<string> {
  const sourceAccount = await server.loadAccount(senderPublicKey);

  const contract = new StellarSdk.Contract(CONTRACT_ADDRESS);
  const op = contract.call(
    'record_split',
    StellarSdk.Address.fromString(senderPublicKey).toScVal(),
    StellarSdk.Address.fromString(recipientPublicKey).toScVal(),
    StellarSdk.nativeToScVal(amount, { type: 'string' }),
  );

  const transaction = new StellarSdk.TransactionBuilder(sourceAccount, {
    fee: StellarSdk.BASE_FEE,
    networkPassphrase: TESTNET_PASSPHRASE,
  })
    .addOperation(op)
    .setTimeout(120)
    .build();

  return transaction.toXDR();
}

export function signWithSecret(secretKey: string, xdr: string): string {
  const keypair = StellarSdk.Keypair.fromSecret(secretKey);
  const transaction = StellarSdk.TransactionBuilder.fromXDR(xdr, TESTNET_PASSPHRASE);
  transaction.sign(keypair);
  return transaction.toXDR();
}

export async function submitSignedTransaction(
  signedXdr: string,
): Promise<{ hash: string; successful: boolean }> {
  const transaction = StellarSdk.TransactionBuilder.fromXDR(signedXdr, TESTNET_PASSPHRASE);
  const result = await server.submitTransaction(transaction);
  return { hash: result.hash, successful: result.successful };
}

export async function fetchBalance(publicKey: string): Promise<string> {
  const response = await fetch(`${HORIZON_URL}/accounts/${publicKey}`);
  if (!response.ok) {
    throw new Error('Failed to fetch balance');
  }
  const data = await response.json();
  const xlmBalance = data.balances.find((b: { asset_type: string }) => b.asset_type === 'native');
  return xlmBalance ? xlmBalance.balance : '0';
}

const readOnlyAccount = new StellarSdk.Account(
  'GAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAWHF',
  '0',
);

function readOnlyTx(builder: (contract: StellarSdk.Contract) => StellarSdk.Transaction): StellarSdk.Transaction {
  const contract = new StellarSdk.Contract(CONTRACT_ADDRESS);
  return builder(contract);
}

export async function getTotalSplits(): Promise<bigint> {
  try {
    const tx = readOnlyTx((contract) =>
      new StellarSdk.TransactionBuilder(readOnlyAccount, {
        fee: '100',
        networkPassphrase: TESTNET_PASSPHRASE,
      })
        .addOperation(contract.call('get_total_splits'))
        .build(),
    );
    const result = await rpc.simulateTransaction(tx);

    if ('result' in result && result.result) {
      const val = StellarSdk.scValToNative(result.result.retval);
      return BigInt(val);
    }
    return 0n;
  } catch {
    return 0n;
  }
}

export async function getSplits(start: number, limit: number): Promise<SplitRecord[]> {
  try {
    const tx = readOnlyTx((contract) =>
      new StellarSdk.TransactionBuilder(readOnlyAccount, {
        fee: '100',
        networkPassphrase: TESTNET_PASSPHRASE,
      })
        .addOperation(
          contract.call(
            'get_splits',
            StellarSdk.nativeToScVal(start, { type: 'u64' }),
            StellarSdk.nativeToScVal(limit, { type: 'u32' }),
          ),
        )
        .build(),
    );
    const result = await rpc.simulateTransaction(tx);

    if ('result' in result && result.result) {
      return StellarSdk.scValToNative(result.result.retval);
    }
    return [];
  } catch {
    return [];
  }
}
