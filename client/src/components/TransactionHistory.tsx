import { useState, useEffect } from 'react';
import { useWallet } from '../context/WalletContext';

const API_URL = import.meta.env.VITE_API_URL || 'https://splitbill-h0q9.onrender.com';

interface Transaction {
  id: string;
  senderAddress: string;
  recipientAddress: string;
  amount: string;
  txHash: string | null;
  status: string;
  network: string;
  createdAt: string;
}

export default function TransactionHistory() {
  const { address: walletAddress } = useWallet();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function fetchTransactions() {
      try {
        const res = await fetch(`${API_URL}/api/transactions`);
        if (!res.ok) throw new Error('Failed to fetch');
        const data = await res.json();
        setTransactions(data);
      } catch {
        setError('Could not load history');
      } finally {
        setLoading(false);
      }
    }
    fetchTransactions();
  }, []);

  const myTxs = walletAddress
    ? transactions.filter(
        (t) =>
          t.senderAddress === walletAddress ||
          t.recipientAddress === walletAddress,
      )
    : transactions;

  const statusColors: Record<string, string> = {
    success: '#0ecb81',
    failed: '#f6465d',
    pending: '#f0b90b',
  };

  const statusLabels: Record<string, string> = {
    success: 'Sent',
    failed: 'Failed',
    pending: 'Pending',
  };

  const btnPrimary = {
    width: '100%',
    padding: '10px',
    borderRadius: 4,
    border: 'none',
    background: '#f0b90b',
    color: '#0b0e11',
    fontSize: 14,
    fontWeight: 700,
    cursor: 'pointer',
  } as React.CSSProperties;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <h3 style={{ fontSize: 16, fontWeight: 600, color: '#eaecef' }}>
        Transaction History
      </h3>

      {loading && (
        <div style={{
          background: '#1e2329', border: '1px solid #2b3139',
          borderRadius: 4, padding: 32, textAlign: 'center',
        }}>
          <div style={{ fontSize: 13, color: '#848e9c' }}>Loading...</div>
        </div>
      )}

      {error && (
        <div style={{
          background: '#1e2329', border: '1px solid #2b3139',
          borderRadius: 4, padding: 32, textAlign: 'center',
        }}>
          <div style={{ fontSize: 13, color: '#f6465d' }}>{error}</div>
          <button
            onClick={() => { setLoading(true); setError(''); }}
            style={{ ...btnPrimary, width: 'auto', marginTop: 12, padding: '6px 16px' }}
          >
            Retry
          </button>
        </div>
      )}

      {!loading && !error && myTxs.length === 0 && (
        <div style={{
          background: '#1e2329', border: '1px solid #2b3139',
          borderRadius: 4, padding: 32, textAlign: 'center',
        }}>
          <div style={{ fontSize: 28, marginBottom: 8 }}>📋</div>
          <div style={{ fontSize: 13, color: '#848e9c' }}>
            No transactions yet. Split a bill to get started.
          </div>
        </div>
      )}

      {!loading && !error && myTxs.length > 0 && (
        <div style={{
          background: '#1e2329', borderRadius: 4, border: '1px solid #2b3139', overflow: 'hidden',
        }}>
          <div style={{
            padding: '10px 12px', borderBottom: '1px solid #2b3139',
            fontSize: 11, color: '#848e9c', fontWeight: 600,
            textTransform: 'uppercase', letterSpacing: '0.5px',
          }}>
            {myTxs.length} transaction{myTxs.length !== 1 ? 's' : ''}
          </div>
          {myTxs.map((tx) => {
            const isSender = tx.senderAddress === walletAddress;
            return (
              <div key={tx.id} style={{
                padding: '10px 12px', borderBottom: '1px solid #2b3139',
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                  <div style={{ fontSize: 12, color: '#eaecef' }}>
                    {isSender ? 'To' : 'From'}{' '}
                    {isSender
                      ? `${tx.recipientAddress.slice(0, 6)}...${tx.recipientAddress.slice(-4)}`
                      : `${tx.senderAddress.slice(0, 6)}...${tx.senderAddress.slice(-4)}`}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span style={{
                      fontSize: 11, fontWeight: 600,
                      color: statusColors[tx.status] || '#848e9c',
                    }}>
                      {statusLabels[tx.status] || tx.status}
                    </span>
                    <div style={{
                      width: 8, height: 8, borderRadius: '50%',
                      background: statusColors[tx.status] || '#848e9c',
                    }} />
                  </div>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: 13, fontWeight: 600, color: isSender ? '#f6465d' : '#0ecb81' }}>
                    {isSender ? '-' : '+'}{tx.amount} XLM
                  </span>
                  <span style={{ fontSize: 11, color: '#5e6673' }}>
                    {new Date(tx.createdAt).toLocaleDateString()} {new Date(tx.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
                {tx.txHash && (
                  <div style={{
                    fontSize: 10, color: '#5e6673', marginTop: 3,
                    wordBreak: 'break-all', fontFamily: 'monospace',
                  }}>
                    {tx.txHash}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      <button
        onClick={() => {
          setLoading(true);
          setError('');
          fetch(`${API_URL}/api/transactions`)
            .then((r) => r.json())
            .then((data) => { setTransactions(data); setLoading(false); })
            .catch(() => { setError('Could not load history'); setLoading(false); });
        }}
        style={btnPrimary}
        onMouseEnter={(e) => e.currentTarget.style.background = '#e0a800'}
        onMouseLeave={(e) => e.currentTarget.style.background = '#f0b90b'}
      >
        Refresh
      </button>
    </div>
  );
}
