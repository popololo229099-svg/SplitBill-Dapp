import { useState } from 'react';
import { WalletProvider, useWallet } from './context/WalletContext';
import WalletConnect from './components/WalletConnect';
import BalanceDisplay from './components/BalanceDisplay';
import SplitBillCalculator from './components/SplitBillCalculator';
import TransactionHistory from './components/TransactionHistory';
import LandingPage from './components/LandingPage';

const C = {
  canvasDark: '#0b0e11',
  surfaceCard: '#1e2329',
  surfaceElevated: '#2b3139',
  primary: '#fcd535',
  primaryActive: '#f0b90b',
  body: '#eaecef',
  muted: '#707a8a',
  mutedStrong: '#929aa5',
  hairline: '#2b3139',
  onDark: '#ffffff',
};

type Tab = 'split' | 'history';

function AppContent() {
  const { isConnected } = useWallet();
  const [activeTab, setActiveTab] = useState<Tab>('split');
  const [page, setPage] = useState<'landing' | 'app'>('landing');

  if (page === 'landing') {
    return <LandingPage onEnter={() => setPage('app')} />;
  }

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    }}>
      {/* Top Nav */}
      <header style={{
        background: C.canvasDark,
        borderBottom: `1px solid ${C.hairline}`,
        position: 'sticky',
        top: 0,
        zIndex: 10,
      }}>
        <div style={{
          maxWidth: 1280, margin: '0 auto', padding: '0 32px',
          height: 64, display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }} onClick={() => setPage('landing')}>
            <span style={{
              background: C.primary, color: '#181a20',
              fontWeight: 800, fontSize: 18, letterSpacing: '-0.5px',
              padding: '2px 6px', borderRadius: 2,
            }}>SB</span>
            <span style={{
              fontSize: 16, fontWeight: 700, color: C.body,
              letterSpacing: '-0.3px',
            }}>SplitBill</span>
            <span style={{
              fontSize: 10, color: C.muted, marginLeft: 4,
              background: C.surfaceCard, padding: '1px 6px', borderRadius: 2, fontWeight: 600,
            }}>TESTNET</span>
          </div>
          <WalletConnect />
        </div>
      </header>

      {/* Tabs */}
      <div style={{
        background: C.canvasDark,
        borderBottom: `1px solid ${C.hairline}`,
      }}>
        <div style={{
          maxWidth: 1280, margin: '0 auto', padding: '0 32px',
          display: 'flex', gap: 0,
        }}>
          {(['split', 'history'] as Tab[]).map((tab) => (
            <div
              key={tab}
              onClick={() => {
                if (tab === 'history' && !isConnected) return;
                setActiveTab(tab);
              }}
              style={{
                padding: '12px 16px', fontSize: 14, fontWeight: 600,
                color: activeTab === tab ? C.primary : C.muted,
                borderBottom: activeTab === tab ? `2px solid ${C.primary}` : '2px solid transparent',
                cursor: tab === 'history' && !isConnected ? 'not-allowed' : 'pointer',
                opacity: tab === 'history' && !isConnected ? 0.5 : 1,
                transition: 'color 0.15s, border-color 0.15s',
              }}
            >
              {tab === 'split' ? 'Split Bill' : 'History'}
            </div>
          ))}
        </div>
      </div>

      {/* Main content */}
      <main style={{
        flex: 1,
        background: C.canvasDark,
        padding: '24px 0',
      }}>
        <div style={{ maxWidth: 520, margin: '0 auto', padding: '0 16px' }}>
          {!isConnected && (
            <div style={{
              background: C.surfaceCard,
              border: `1px solid ${C.hairline}`,
              borderRadius: 12,
              padding: '48px 24px',
              textAlign: 'center',
              marginTop: 24,
            }}>
              <div style={{ fontSize: 32, marginBottom: 16 }}>💸</div>
              <h2 style={{
                fontSize: 20, fontWeight: 600, color: C.body,
                marginBottom: 8,
              }}>
                Split bills with anyone
              </h2>
              <p style={{
                fontSize: 14, color: C.muted, lineHeight: 1.5,
                maxWidth: 360, margin: '0 auto 24px',
              }}>
                Connect your Freighter wallet to split bills and send XLM to multiple people on the Stellar testnet.
              </p>
              <div style={{ maxWidth: 280, margin: '0 auto' }}>
                <WalletConnect />
              </div>
            </div>
          )}

          {isConnected && activeTab === 'split' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <BalanceDisplay />
              <div style={{
                background: C.surfaceCard,
                border: `1px solid ${C.hairline}`,
                borderRadius: 12,
                padding: 24,
              }}>
                <SplitBillCalculator />
              </div>
            </div>
          )}

          {isConnected && activeTab === 'history' && (
            <div style={{
              background: C.surfaceCard,
              border: `1px solid ${C.hairline}`,
              borderRadius: 12,
              padding: 24,
            }}>
              <TransactionHistory />
            </div>
          )}
        </div>
      </main>

      {/* Footer — light on dark (DESIGN.md: footer-light) */}
      <footer style={{
        background: '#fafafa',
        borderTop: `1px solid ${C.hairline}`,
        padding: '20px 32px',
      }}>
        <div style={{
          maxWidth: 1280, margin: '0 auto',
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          flexWrap: 'wrap', gap: 12,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{
              background: C.primary, color: '#181a20',
              fontWeight: 800, fontSize: 14, padding: '2px 5px', borderRadius: 2,
            }}>SB</span>
            <span style={{ fontSize: 14, fontWeight: 600, color: '#181a20' }}>SplitBill</span>
          </div>
          <div style={{ fontSize: 13, color: C.muted }}>
            Powered by Stellar · Testnet
          </div>
        </div>
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
