import * as StellarSdk from '@stellar/stellar-sdk';

const TESTNET_PASSPHRASE = 'Test SDF Network ; September 2015';
const HORIZON_URL = 'https://horizon-testnet.stellar.org';
const RPC_URL = 'https://soroban-testnet.stellar.org';
const CONTRACT_ADDRESS = 'CDC2GGOQ6BATKV6GI56G3FV5GIFGTJ57IPJ6EO5KEAXBTGKXXGD66VSS';

const server = new StellarSdk.Horizon.Server(HORIZON_URL);
const rpc = new StellarSdk.rpc.Server(RPC_URL);

export { CONTRACT_ADDRESS };

export interface SplitRecord {
  id: bigint;
  sender: string;
  recipient: string;
  amount: string;
  timestamp: bigint;
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

export async function submitSignedTransaction(signedXdr: string): Promise<{ hash: string; successful: boolean }> {
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
  const xlmBalance = data.balances.find((b: any) => b.asset_type === 'native');
  return xlmBalance ? xlmBalance.balance : '0';
}

export async function getTotalSplits(): Promise<bigint> {
  try {
    const contract = new StellarSdk.Contract(CONTRACT_ADDRESS);
    const result = await rpc.simulateTransaction(
      (() => {
        const account = new StellarSdk.Account('GAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAWHF', '0');
        return new StellarSdk.TransactionBuilder(account, {
          fee: '100',
          networkPassphrase: TESTNET_PASSPHRASE,
        })
          .addOperation(contract.call('get_total_splits'))
          .build();
      })(),
    );

    if (result.result) {
      const val = StellarSdk.scValToNative(result.result.xdr);
      return BigInt(val);
    }
    return 0n;
  } catch {
    return 0n;
  }
}

export async function getSplits(start: number, limit: number): Promise<SplitRecord[]> {
  try {
    const contract = new StellarSdk.Contract(CONTRACT_ADDRESS);
    const result = await rpc.simulateTransaction(
      (() => {
        const account = new StellarSdk.Account('GAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAWHF', '0');
        return new StellarSdk.TransactionBuilder(account, {
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
          .build();
      })(),
    );

    if (result.result) {
      const val = StellarSdk.scValToNative(result.result.xdr);
      return val;
    }
    return [];
  } catch {
    return [];
  }
}
