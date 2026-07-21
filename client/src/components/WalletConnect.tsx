import { useWallet } from '../context/WalletContext';

export default function WalletConnect() {
  const { address, isConnecting, isInstalled, error, connect, disconnect } = useWallet();

  const styles = {
    container: {
      display: 'flex',
      alignItems: 'center',
      gap: 8,
    } as React.CSSProperties,
    connectedBtn: {
      display: 'flex',
      alignItems: 'center',
      gap: 8,
      background: '#1e2329',
      border: '1px solid #2b3139',
      borderRadius: 6,
      padding: '7px 12px',
      cursor: 'default',
      fontSize: 13,
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
      padding: '7px 12px',
      cursor: 'pointer',
      fontSize: 13,
    } as React.CSSProperties,
    connectBtn: {
      background: '#f0b90b',
      border: 'none',
      borderRadius: 6,
      color: '#0b0e11',
      padding: '8px 20px',
      cursor: 'pointer',
      fontSize: 14,
      fontWeight: 600,
      transition: 'background 0.15s',
    } as React.CSSProperties,
    connectBtnDisabled: {
      background: '#474d57',
      border: 'none',
      borderRadius: 6,
      color: '#707a8a',
      padding: '8px 20px',
      cursor: 'not-allowed',
      fontSize: 14,
      fontWeight: 600,
    } as React.CSSProperties,
    warning: {
      background: '#1e1a2a',
      border: '1px solid #f0b90b',
      borderRadius: 6,
      padding: '8px 12px',
      fontSize: 12,
      color: '#f0b90b',
      lineHeight: 1.4,
    } as React.CSSProperties,
    error: {
      color: '#f6465d',
      fontSize: 12,
      marginTop: 6,
    } as React.CSSProperties,
    link: {
      color: '#f0b90b',
      fontWeight: 600,
      textDecoration: 'underline',
      cursor: 'pointer',
    } as React.CSSProperties,
  };

  if (address) {
    return (
      <div style={styles.container}>
        <div style={styles.connectedBtn}>
          <div style={styles.dot} />
          <span>{address.slice(0, 6)}...{address.slice(-4)}</span>
        </div>
        <button style={styles.disconnectBtn} onClick={disconnect}>
          Disconnect
        </button>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6, alignItems: 'flex-end' }}>
      {!isInstalled && (
        <div style={styles.warning}>
          Install <a href="https://www.freighter.app/" target="_blank" style={styles.link}>Freighter</a> to continue
        </div>
      )}
      <button
        onClick={connect}
        disabled={isConnecting || !isInstalled}
        style={isInstalled && !isConnecting ? styles.connectBtn : styles.connectBtnDisabled}
        onMouseEnter={(e) => {
          if (isInstalled && !isConnecting) e.currentTarget.style.background = '#e0a800';
        }}
        onMouseLeave={(e) => {
          if (isInstalled && !isConnecting) e.currentTarget.style.background = '#f0b90b';
        }}
      >
        {isConnecting ? 'Connecting...' : 'Connect Wallet'}
      </button>
      {error && <div style={styles.error}>{error}</div>}
    </div>
  );
}
