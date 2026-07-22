import { useWallet } from '../context/WalletContext';
import { useIsMobile } from '../hooks/useMediaQuery';

export default function BalanceDisplay() {
  const { balance, isConnected } = useWallet();
  const mobile = useIsMobile();

  if (!isConnected) return null;

  const isLoading = balance === null;

  return (
    <div style={{
      background: '#1e2329',
      borderRadius: 4,
      border: '1px solid #2b3139',
      padding: mobile ? '12px 14px' : '16px 20px',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
    }}>
      <div>
        <div style={{
          fontSize: mobile ? 10 : 11,
          color: '#707a8a',
          textTransform: 'uppercase',
          letterSpacing: '0.5px',
          marginBottom: 2,
        }}>
          Wallet Balance
        </div>
        {isLoading ? (
          <div style={{
            width: 100, height: 20, borderRadius: 6,
            background: 'linear-gradient(90deg, #1e2329 25%, #2b3139 50%, #1e2329 75%)',
            backgroundSize: '800px 100%',
            animation: 'shimmer 1.5s infinite linear',
          }} />
        ) : (
          <div style={{
            fontSize: mobile ? 18 : 20,
            fontWeight: 700,
            color: '#eaecef',
          }}>
            {parseFloat(balance).toFixed(2)}
            <span style={{
              fontSize: mobile ? 10 : 12,
              fontWeight: 400,
              color: '#707a8a',
              marginLeft: 4,
            }}>XLM</span>
          </div>
        )}
      </div>
      <div style={{ textAlign: 'right' }}>
        <div style={{
          fontSize: mobile ? 10 : 11,
          color: '#707a8a',
          textTransform: 'uppercase',
          letterSpacing: '0.5px',
          marginBottom: 2,
        }}>
          Network
        </div>
        <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
          <div style={{
            fontSize: mobile ? 10 : 11,
            color: '#f0b90b',
            fontWeight: 600,
            background: 'rgba(240, 185, 11, 0.1)',
            padding: mobile ? '2px 6px' : '2px 8px',
            borderRadius: 12,
          }}>
            Testnet
          </div>
          <div style={{
            fontSize: mobile ? 9 : 10,
            color: '#3b82f6',
            fontWeight: 600,
            background: 'rgba(59, 130, 246, 0.1)',
            padding: '2px 6px',
            borderRadius: 12,
          }}>
            Contract
          </div>
        </div>
      </div>
    </div>
  );
}
