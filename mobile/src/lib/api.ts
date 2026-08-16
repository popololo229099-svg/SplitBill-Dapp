const API_URL = process.env.EXPO_PUBLIC_API_URL ?? 'https://splitbill-h0q9.onrender.com';

export interface TransactionRecord {
  id: string;
  senderAddress: string;
  recipientAddress: string;
  amount: string;
  txHash: string | null;
  status: string;
  network: string;
  createdAt: string;
}

export async function saveTransaction(tx: {
  senderAddress: string;
  recipientAddress: string;
  amount: string;
  txHash?: string;
  status: string;
}): Promise<void> {
  try {
    await fetch(`${API_URL}/api/transactions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(tx),
    });
  } catch {
    // silently fail — persistence must never block the payment flow
  }
}

export async function fetchTransactions(): Promise<TransactionRecord[]> {
  const res = await fetch(`${API_URL}/api/transactions`);
  if (!res.ok) throw new Error('Failed to fetch transactions');
  return res.json();
}
