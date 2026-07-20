import freighterApi from '@stellar/freighter-api';

const TESTNET_PASSPHRASE = 'Test SDF Network ; September 2015';
const HORIZON_URL = 'https://horizon-testnet.stellar.org';

export async function checkFreighterInstalled(): Promise<boolean> {
  try {
    const result = await freighterApi.isConnected();
    return result.isConnected;
  } catch {
    return false;
  }
}

export async function connectWallet(): Promise<string> {
  const installed = await checkFreighterInstalled();
  if (!installed) {
    throw new Error('Freighter wallet not installed. Please install the Freighter browser extension.');
  }
  const result = await freighterApi.requestAccess();
  if (result.error) {
    throw new Error(result.error.message);
  }
  return result.address;
}

export async function getStoredPublicKey(): Promise<string | null> {
  try {
    const result = await freighterApi.requestAccess();
    if (!result.error) {
      return result.address;
    }
    return null;
  } catch {
    return null;
  }
}

export async function getWalletNetwork(): Promise<string> {
  try {
    const result = await freighterApi.getNetwork();
    return result.network;
  } catch {
    return 'testnet';
  }
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

export async function signTransaction(xdr: string): Promise<{ signedXdr: string; signerAddress: string }> {
  const result = await freighterApi.signTransaction(xdr, {
    networkPassphrase: TESTNET_PASSPHRASE,
  });
  if (result.error) {
    throw new Error(result.error.message);
  }
  return { signedXdr: result.signedTxXdr, signerAddress: result.signerAddress };
}
