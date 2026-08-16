import * as SecureStore from 'expo-secure-store';
import * as StellarSdk from '@stellar/stellar-sdk';

const SECRET_KEY_NAME = 'splitbill_secret';

export interface WalletKeypair {
  publicKey: string;
  secretKey: string;
}

export async function getSecretKey(): Promise<string | null> {
  return SecureStore.getItemAsync(SECRET_KEY_NAME);
}

export async function createWallet(): Promise<WalletKeypair> {
  const pair = StellarSdk.Keypair.random();
  const secretKey = pair.secret();
  await SecureStore.setItemAsync(SECRET_KEY_NAME, secretKey);
  return { publicKey: pair.publicKey(), secretKey };
}

export async function importWallet(secretKey: string): Promise<WalletKeypair> {
  const pair = StellarSdk.Keypair.fromSecret(secretKey.trim());
  await SecureStore.setItemAsync(SECRET_KEY_NAME, pair.secret());
  return { publicKey: pair.publicKey(), secretKey: pair.secret() };
}

export async function restoreWallet(): Promise<string | null> {
  const secretKey = await getSecretKey();
  if (!secretKey) return null;
  try {
    return StellarSdk.Keypair.fromSecret(secretKey).publicKey();
  } catch {
    return null;
  }
}

export async function deleteWallet(): Promise<void> {
  await SecureStore.deleteItemAsync(SECRET_KEY_NAME);
}
