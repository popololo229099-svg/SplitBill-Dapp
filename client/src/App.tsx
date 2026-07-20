import { WalletProvider, useWallet } from './context/WalletContext';
import WalletConnect from './components/WalletConnect';
import BalanceDisplay from './components/BalanceDisplay';
import SplitBillCalculator from './components/SplitBillCalculator';

function AppContent() {
  const { isConnected } = useWallet();

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
    }}>
      {/* Header */}
      <header style={{
        background: '#161a1e',
        borderBottom: '1px solid #2b3139',
        position: 'sticky',
        top: 0,
        zIndex: 10,
      }}>
        <div style={{
          maxWidth: 1200, margin: '0 auto', padding: '0 24px',
          height: 56, display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{
              background: '#f0b90b', color: '#0b0e11',
              fontWeight: 800, fontSize: 18, letterSpacing: '-0.5px',
              padding: '2px 6px', borderRadius: 2,
            }}>
              SB
            </span>
            <span style={{
              fontSize: 16, fontWeight: 700, color: '#eaecef',
              letterSpacing: '-0.3px',
            }}>
              SplitBill
            </span>
            <span style={{
              fontSize: 10, color: '#848e9c', marginLeft: 4,
              background: '#2b3139', padding: '1px 6px', borderRadius: 2, fontWeight: 600,
            }}>
              TESTNET
            </span>
          </div>
          <WalletConnect />
        </div>
      </header>

      {/* Tabs */}
      <div style={{
        background: '#161a1e',
        borderBottom: '1px solid #2b3139',
      }}>
        <div style={{
          maxWidth: 1200, margin: '0 auto', padding: '0 24px',
          display: 'flex', gap: 0,
        }}>
          <div style={{
            padding: '12px 16px', fontSize: 14, fontWeight: 600, color: '#f0b90b',
            borderBottom: '2px solid #f0b90b', cursor: 'pointer',
          }}>
            Split Bill
          </div>
          <div style={{
            padding: '12px 16px', fontSize: 14, fontWeight: 500, color: '#848e9c',
            cursor: 'not-allowed', opacity: 0.5,
          }}>
            History
          </div>
        </div>
      </div>

      {/* Main content */}
      <main style={{
        flex: 1,
        background: '#0b0e11',
        padding: '24px 0',
      }}>
        <div style={{ maxWidth: 520, margin: '0 auto', padding: '0 16px' }}>
          {!isConnected && (
            <div style={{
              background: '#1e2329',
              border: '1px solid #2b3139',
              borderRadius: 4,
              padding: '48px 24px',
              textAlign: 'center',
              marginTop: 24,
            }}>
              <div style={{ fontSize: 32, marginBottom: 16 }}>💸</div>
              <h2 style={{
                fontSize: 18, fontWeight: 600, color: '#eaecef',
                marginBottom: 8,
              }}>
                Split bills with anyone
              </h2>
              <p style={{
                fontSize: 13, color: '#848e9c', lineHeight: 1.6,
                maxWidth: 360, margin: '0 auto 24px',
              }}>
                Connect your Freighter wallet to split bills and send XLM to multiple people on the Stellar testnet.
              </p>
              <div style={{ maxWidth: 280, margin: '0 auto' }}>
                <WalletConnect />
              </div>
            </div>
          )}

          {isConnected && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <BalanceDisplay />
              <div style={{
                background: '#1e2329',
                border: '1px solid #2b3139',
                borderRadius: 4,
                padding: 20,
              }}>
                <SplitBillCalculator />
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer style={{
        background: '#161a1e',
        borderTop: '1px solid #2b3139',
        padding: '12px 24px',
        textAlign: 'center',
        fontSize: 11,
        color: '#474d57',
      }}>
        SplitBill · Powered by Stellar · Testnet
      </footer>
    </div>
  );
}

export default function App() {
  return (
    <WalletProvider>
      <AppContent />
    </WalletProvider>
  );
}
