import { useWallet } from '../context/WalletContext';
import { useIsMobile } from '../hooks/useMediaQuery';

export default function WalletConnect() {
  const { address, isConnecting, error, connect, disconnect, clearError } = useWallet();
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
    connectBtn: {
      background: '#f0b90b',
      border: 'none',
      borderRadius: 6,
      color: '#0b0e11',
      padding: mobile ? '7px 14px' : '8px 20px',
      cursor: 'pointer',
      fontSize: mobile ? 13 : 14,
      fontWeight: 600,
      transition: 'background 0.15s',
      whiteSpace: 'nowrap' as const,
    } as React.CSSProperties,
    connectBtnDisabled: {
      background: '#474d57',
      border: 'none',
      borderRadius: 6,
      color: '#707a8a',
      padding: mobile ? '7px 14px' : '8px 20px',
      cursor: 'not-allowed',
      fontSize: mobile ? 13 : 14,
      fontWeight: 600,
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
      <button
        onClick={connect}
        disabled={isConnecting}
        style={!isConnecting ? styles.connectBtn : styles.connectBtnDisabled}
        onMouseEnter={(e) => {
          if (!isConnecting) e.currentTarget.style.background = '#e0a800';
        }}
        onMouseLeave={(e) => {
          if (!isConnecting) e.currentTarget.style.background = '#f0b90b';
        }}
      >
        {isConnecting ? 'Connecting...' : mobile ? 'Connect' : 'Connect Wallet'}
      </button>
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
