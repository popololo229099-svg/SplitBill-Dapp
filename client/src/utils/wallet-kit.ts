import { StellarWalletsKit, SwkAppDarkTheme } from '@creit.tech/stellar-wallets-kit';
import type { ISwkModule, SwkTheme } from '@creit.tech/stellar-wallets-kit';
import { FreighterModule } from '@creit.tech/stellar-wallets-kit/modules/freighter';
import { LobstrModule } from '@creit.tech/stellar-wallets-kit/modules/lobstr';
import { AlbedoModule } from '@creit.tech/stellar-wallets-kit/modules/albedo';

const TESTNET_PASSPHRASE = 'Test SDF Network ; September 2015';

const swkTheme: SwkTheme = {
  ...SwkAppDarkTheme,
  'background': '#1e2329',
  'background-secondary': '#0b0e11',
  'foreground-strong': '#ffffff',
  'foreground': '#eaecef',
  'foreground-secondary': '#707a8a',
  'primary': '#f0b90b',
  'primary-foreground': '#0b0e11',
  'border': 'rgba(43, 49, 57, 1)',
  'border-radius': '0.5rem',
  'font-family': '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
};

let initialized = false;

export function initWalletKit(): void {
  if (initialized) return;

  const modules: ISwkModule[] = [
    new FreighterModule(),
    new LobstrModule(),
    new AlbedoModule(),
  ];

  StellarWalletsKit.init({
    modules,
    network: TESTNET_PASSPHRASE,
    theme: swkTheme,
  });

  initialized = true;
}

export async function openAuthModal(): Promise<string> {
  initWalletKit();
  const result = await StellarWalletsKit.authModal();
  return result.address;
}

export async function getAddressFromKit(): Promise<string | null> {
  try {
    const { address } = await StellarWalletsKit.getAddress();
    return address;
  } catch {
    return null;
  }
}

export async function signTransactionWithKit(xdr: string): Promise<{ signedTxXdr: string; signerAddress: string }> {
  initWalletKit();
  const result = await StellarWalletsKit.signTransaction(xdr, {
    networkPassphrase: TESTNET_PASSPHRASE,
  });
  return result;
}

export async function disconnectKit(): Promise<void> {
  try {
    await StellarWalletsKit.disconnect();
  } catch {
    // ignore
  }
}

export { StellarWalletsKit };
