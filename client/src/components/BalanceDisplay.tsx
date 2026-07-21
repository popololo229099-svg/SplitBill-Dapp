import { useWallet } from '../context/WalletContext';

export default function BalanceDisplay() {
  const { balance, isConnected } = useWallet();

  if (!isConnected) return null;

  return (
    <div style={{
      background: '#1e2329',
      borderRadius: 4,
      border: '1px solid #2b3139',
      padding: '16px 20px',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
    }}>
      <div>
        <div style={{ fontSize: 11, color: '#707a8a', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 2 }}>
          Wallet Balance
        </div>
        <div style={{ fontSize: 20, fontWeight: 700, color: '#eaecef' }}>
          {balance !== null ? `${parseFloat(balance).toFixed(2)}` : '---'}
          <span style={{ fontSize: 12, fontWeight: 400, color: '#707a8a', marginLeft: 4 }}>XLM</span>
        </div>
      </div>
      <div style={{ textAlign: 'right' }}>
        <div style={{ fontSize: 11, color: '#707a8a', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 2 }}>
          Network
        </div>
        <div style={{
          fontSize: 11, color: '#f0b90b', fontWeight: 600,
          background: 'rgba(240, 185, 11, 0.1)',
          padding: '2px 8px',
      borderRadius: 12,
          display: 'inline-block',
        }}>
          Testnet
        </div>
      </div>
    </div>
  );
}
