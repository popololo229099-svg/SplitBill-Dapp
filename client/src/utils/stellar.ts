import * as StellarSdk from '@stellar/stellar-sdk';

const TESTNET_PASSPHRASE = 'Test SDF Network ; September 2015';
const HORIZON_URL = 'https://horizon-testnet.stellar.org';

export async function buildPaymentTransaction(
  sourcePublicKey: string,
  destination: string,
  amount: string,
): Promise<string> {
  const server = new StellarSdk.Horizon.Server(HORIZON_URL);
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
  const server = new StellarSdk.Horizon.Server(HORIZON_URL);
  const transaction = StellarSdk.TransactionBuilder.fromXDR(signedXdr, TESTNET_PASSPHRASE);
  const result = await server.submitTransaction(transaction);
  return { hash: result.hash, successful: result.successful };
}
