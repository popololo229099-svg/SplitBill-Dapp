import { useWallet } from '../context/WalletContext';
import { useIsMobile } from '../hooks/useMediaQuery';
import { WALLET_OPTIONS } from '../utils/wallet-kit';

export default function WalletConnect() {
  const { address, isConnecting, error, connectWallet, disconnect, clearError } = useWallet();
  const mobile = useIsMobile();

  const styles = {
    container: {
      display: 'flex',
      alignItems: 'center',
      gap: mobile ? 6 : 8,
    } as React.CSSProperties,
    connectedBtn: {
      display: 'flex',
      alignItems: 'center',
      gap: 6,
      background: '#1e2329',
      border: '1px solid #2b3139',
      borderRadius: 6,
      padding: mobile ? '6px 8px' : '7px 12px',
      cursor: 'default',
      fontSize: mobile ? 12 : 13,
    } as React.CSSProperties,
    dot: {
      width: 6,
      height: 6,
      borderRadius: '50%',
      background: '#0ecb81',
      flexShrink: 0,
    } as React.CSSProperties,
    disconnectBtn: {
      background: 'none',
      border: '1px solid #474d57',
      borderRadius: 6,
      color: '#eaecef',
      padding: mobile ? '6px 8px' : '7px 12px',
      cursor: 'pointer',
      fontSize: mobile ? 12 : 13,
    } as React.CSSProperties,
    walletBtn: {
      background: '#1e2329',
      border: '1px solid #2b3139',
      borderRadius: 6,
      color: '#eaecef',
      padding: mobile ? '6px 10px' : '7px 14px',
      cursor: 'pointer',
      fontSize: mobile ? 12 : 13,
      fontWeight: 500,
      display: 'flex',
      alignItems: 'center',
      gap: 5,
      transition: 'border-color 0.15s, background 0.15s',
      whiteSpace: 'nowrap' as const,
    } as React.CSSProperties,
    walletBtnDisabled: {
      background: '#1a1e24',
      border: '1px solid #2b3139',
      borderRadius: 6,
      color: '#474d57',
      padding: mobile ? '6px 10px' : '7px 14px',
      cursor: 'not-allowed',
      fontSize: mobile ? 12 : 13,
      fontWeight: 500,
      display: 'flex',
      alignItems: 'center',
      gap: 5,
      whiteSpace: 'nowrap' as const,
    } as React.CSSProperties,
    walletIcon: {
      fontSize: 14,
      lineHeight: 1,
    } as React.CSSProperties,
    errorBanner: {
      background: 'rgba(246, 70, 93, 0.1)',
      border: '1px solid #f6465d',
      borderRadius: 6,
      padding: '8px 12px',
      fontSize: 12,
      color: '#f6465d',
      lineHeight: 1.4,
      maxWidth: mobile ? 200 : 300,
    } as React.CSSProperties,
    errorDismiss: {
      background: 'none',
      border: 'none',
      color: '#f6465d',
      cursor: 'pointer',
      fontSize: 14,
      padding: 0,
      marginLeft: 6,
      float: 'right',
      lineHeight: 1,
    } as React.CSSProperties,
    walletBadge: {
      fontSize: 9,
      color: '#707a8a',
      background: '#2b3139',
      padding: '1px 4px',
      borderRadius: 3,
      marginLeft: 2,
      display: mobile ? 'none' : 'inline',
    } as React.CSSProperties,
  };

  if (address) {
    return (
      <div style={styles.container}>
        <div style={styles.connectedBtn}>
          <div style={styles.dot} />
          <span>{address.slice(0, mobile ? 4 : 6)}...{address.slice(-4)}</span>
          <span style={styles.walletBadge}>Multi-Wallet</span>
        </div>
        <button style={styles.disconnectBtn} onClick={disconnect}>
          {mobile ? '×' : 'Disconnect'}
        </button>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6, alignItems: 'flex-end' }}>
      <div style={{ display: 'flex', gap: mobile ? 4 : 6, flexWrap: 'wrap', justifyContent: 'flex-end' }}>
        {WALLET_OPTIONS.map((wallet) => (
          <button
            key={wallet.id}
            onClick={() => connectWallet(wallet.id)}
            disabled={isConnecting}
            style={isConnecting ? styles.walletBtnDisabled : styles.walletBtn}
            onMouseEnter={(e) => {
              if (!isConnecting) {
                e.currentTarget.style.borderColor = '#f0b90b';
                e.currentTarget.style.background = '#252930';
              }
            }}
            onMouseLeave={(e) => {
              if (!isConnecting) {
                e.currentTarget.style.borderColor = '#2b3139';
                e.currentTarget.style.background = '#1e2329';
              }
            }}
            title={`Connect with ${wallet.name}`}
          >
            <span style={styles.walletIcon}>{wallet.icon}</span>
            {isConnecting ? 'Connecting...' : wallet.name}
          </button>
        ))}
      </div>
      {error && (
        <div style={styles.errorBanner}>
          <button style={styles.errorDismiss} onClick={clearError}>&times;</button>
          <strong>{error.type === 'wallet_not_found' ? 'Wallet Not Found' :
            error.type === 'transaction_rejected' ? 'Rejected' :
            error.type === 'insufficient_balance' ? 'Insufficient Balance' :
            'Connection Error'}</strong>
          <div style={{ marginTop: 2 }}>{error.message}</div>
        </div>
      )}
    </div>
  );
}
