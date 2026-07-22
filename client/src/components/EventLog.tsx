import { useState, useEffect, useCallback } from 'react';
import { useWallet } from '../context/WalletContext';
import { getSplits, getTotalSplits, CONTRACT_ADDRESS, type SplitRecord } from '../utils/contract';
import { SkeletonList } from './SkeletonLoader';

export default function EventLog() {
  const { isConnected } = useWallet();
  const [splits, setSplits] = useState<SplitRecord[]>([]);
  const [total, setTotal] = useState(0n);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchSplits = useCallback(async () => {
    try {
      setLoading(true);
      const [totalSplits, recentSplits] = await Promise.all([
        getTotalSplits(),
        getSplits(0, 20),
      ]);
      setTotal(totalSplits);
      setSplits(recentSplits);
      setError('');
    } catch {
      setError('Failed to load on-chain records');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isConnected) {
      fetchSplits();
      const interval = setInterval(fetchSplits, 15000);
      return () => clearInterval(interval);
    }
  }, [isConnected, fetchSplits]);

  if (!isConnected) return null;

  const btnRefresh = {
    width: '100%',
    padding: '10px',
    borderRadius: 6,
    border: 'none',
    background: '#f0b90b',
    color: '#0b0e11',
    fontSize: 14,
    fontWeight: 700,
    cursor: 'pointer',
  } as React.CSSProperties;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h3 style={{ fontSize: 16, fontWeight: 600, color: '#eaecef' }}>On-Chain Event Log</h3>
        <div style={{
          fontSize: 12, color: '#707a8a',
          background: '#1e2329', padding: '2px 8px', borderRadius: 4,
          border: '1px solid #2b3139',
        }}>
          {total.toString()} total
        </div>
      </div>

      <div style={{
        background: '#1e2329', borderRadius: 8, border: '1px solid #2b3139', overflow: 'hidden',
      }}>
        <div style={{ padding: '10px 12px', borderBottom: '1px solid #2b3139' }}>
          <div style={{ fontSize: 11, color: '#707a8a', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            Contract
          </div>
          <div style={{ fontSize: 10, color: '#5e6673', fontFamily: 'monospace', marginTop: 4, wordBreak: 'break-all' }}>
            <a
              href={`https://stellar.expert/explorer/testnet/contract/${CONTRACT_ADDRESS}`}
              target="_blank"
              rel="noopener noreferrer"
              style={{ color: '#3b82f6', textDecoration: 'none' }}
            >
              {CONTRACT_ADDRESS}
            </a>
          </div>
        </div>

        {loading && (
          <SkeletonList count={3} />
        )}

        {error && (
          <div style={{ padding: 24, textAlign: 'center' }}>
            <div style={{ fontSize: 13, color: '#f6465d' }}>{error}</div>
          </div>
        )}

        {!loading && !error && splits.length === 0 && (
          <div style={{ padding: 24, textAlign: 'center' }}>
            <div style={{ fontSize: 28, marginBottom: 8 }}>⛓️</div>
            <div style={{ fontSize: 13, color: '#707a8a' }}>
              No on-chain records yet. Split a bill to create the first record.
            </div>
          </div>
        )}

        {!loading && !error && splits.length > 0 && (
          <>
            <div style={{ padding: '10px 12px', borderBottom: '1px solid #2b3139', fontSize: 11, color: '#707a8a', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              Recent Records
            </div>
            {splits.map((split) => (
              <div key={Number(split.id)} style={{
                padding: '10px 12px',
                borderBottom: '1px solid #2b3139',
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{
                      fontSize: 10, fontWeight: 600, color: '#0b0e11',
                      background: '#f0b90b', padding: '1px 5px', borderRadius: 3,
                    }}>
                      #{split.id.toString()}
                    </span>
                    <span style={{ fontSize: 12, color: '#eaecef' }}>
                      {String(split.sender).slice(0, 6)}...{String(split.sender).slice(-4)}
                    </span>
                    <span style={{ fontSize: 11, color: '#707a8a' }}>→</span>
                    <span style={{ fontSize: 12, color: '#eaecef' }}>
                      {String(split.recipient).slice(0, 6)}...{String(split.recipient).slice(-4)}
                    </span>
                  </div>
                  <span style={{ fontSize: 13, fontWeight: 600, color: '#0ecb81' }}>
                    {split.amount} XLM
                  </span>
                </div>
                <div style={{ fontSize: 10, color: '#5e6673' }}>
                  {new Date(Number(split.timestamp) * 1000).toLocaleString()}
                </div>
              </div>
            ))}
          </>
        )}
      </div>

      <button
        onClick={fetchSplits}
        style={btnRefresh}
        onMouseEnter={(e) => e.currentTarget.style.background = '#e0a800'}
        onMouseLeave={(e) => e.currentTarget.style.background = '#f0b90b'}
      >
        Refresh Records
      </button>
    </div>
  );
}
