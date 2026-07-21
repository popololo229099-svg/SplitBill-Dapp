import { useState } from 'react';
import { WalletProvider, useWallet } from './context/WalletContext';
import WalletConnect from './components/WalletConnect';
import BalanceDisplay from './components/BalanceDisplay';
import SplitBillCalculator from './components/SplitBillCalculator';
import TransactionHistory from './components/TransactionHistory';
import LandingPage from './components/LandingPage';
import { useIsMobile } from './hooks/useMediaQuery';

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
  const mobile = useIsMobile();

  if (page === 'landing') {
    return <LandingPage onEnter={() => setPage('app')} />;
  }

  const px = mobile ? '12px' : '32px';

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
          maxWidth: 1280, margin: '0 auto', padding: `0 ${px}`,
          height: 64, display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        }}>
          <div
            style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}
            onClick={() => setPage('landing')}
            onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.opacity = '0.8'; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.opacity = '1'; }}
          >
            <span style={{
              background: C.primary, color: '#181a20',
              fontWeight: 800, fontSize: 18, letterSpacing: '-0.5px',
              padding: '2px 6px', borderRadius: 2,
            }}>SB</span>
            {!mobile && (
              <>
                <span style={{
                  fontSize: 16, fontWeight: 700, color: C.body,
                  letterSpacing: '-0.3px',
                }}>SplitBill</span>
                <span style={{
                  fontSize: 10, color: C.muted, marginLeft: 4,
                  background: C.surfaceCard, padding: '1px 6px', borderRadius: 2, fontWeight: 600,
                }}>TESTNET</span>
              </>
            )}
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
          maxWidth: 1280, margin: '0 auto', padding: `0 ${px}`,
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
                padding: '12px 16px', fontSize: mobile ? 13 : 14, fontWeight: 600,
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
        padding: mobile ? '16px 0' : '24px 0',
      }}>
        <div style={{ maxWidth: 520, margin: '0 auto', padding: `0 ${mobile ? 12 : 16}px` }}>
          {!isConnected && (
            <div style={{
              background: C.surfaceCard,
              border: `1px solid ${C.hairline}`,
              borderRadius: 12,
              padding: mobile ? '32px 16px' : '48px 24px',
              textAlign: 'center',
              marginTop: mobile ? 12 : 24,
            }}>
              <div style={{ fontSize: 32, marginBottom: 16 }}>💸</div>
              <h2 style={{
                fontSize: mobile ? 18 : 20, fontWeight: 600, color: C.body,
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
                padding: mobile ? 16 : 24,
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
              padding: mobile ? 16 : 24,
            }}>
              <TransactionHistory />
            </div>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer style={{
        background: C.canvasDark,
        borderTop: `1px solid ${C.hairline}`,
        padding: mobile ? '24px 12px' : '32px 32px',
      }}>
        <div style={{
          maxWidth: 1280, margin: '0 auto',
          display: 'flex', flexDirection: mobile ? 'column' : 'row',
          justifyContent: 'space-between', alignItems: mobile ? 'flex-start' : 'flex-start',
          gap: mobile ? 24 : 32,
          flexWrap: 'wrap',
        }}>
          {/* Brand */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, minWidth: mobile ? 0 : 180 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{
                background: C.primary, color: '#181a20',
                fontWeight: 800, fontSize: 14, padding: '2px 5px', borderRadius: 2,
              }}>SB</span>
              <span style={{ fontSize: 14, fontWeight: 600, color: C.body }}>SplitBill</span>
            </div>
            <span style={{ fontSize: 12, color: C.muted, lineHeight: 1.5 }}>
              Split bills with anyone on the Stellar network.
            </span>
          </div>

          {/* Links */}
          <div style={{
            display: 'flex', gap: mobile ? 32 : 48, flexWrap: 'wrap',
            flexDirection: mobile ? 'column' : 'row',
          }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <span style={{ fontSize: 12, fontWeight: 600, color: C.mutedStrong, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Product</span>
              <a href="#" onClick={(e) => { e.preventDefault(); setActiveTab('split'); }} style={{ fontSize: 13, color: C.muted, textDecoration: 'none', cursor: 'pointer' }}>Split Bill</a>
              <a href="#" onClick={(e) => { e.preventDefault(); if (isConnected) setActiveTab('history'); }} style={{ fontSize: 13, color: isConnected ? C.muted : C.mutedStrong, textDecoration: 'none', cursor: isConnected ? 'pointer' : 'default' }}>History</a>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <span style={{ fontSize: 12, fontWeight: 600, color: C.mutedStrong, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Resources</span>
              <a href="https://stellar.org" target="_blank" rel="noopener noreferrer" style={{ fontSize: 13, color: C.muted, textDecoration: 'none' }}>Stellar</a>
              <a href="https://www.freighter.app/" target="_blank" rel="noopener noreferrer" style={{ fontSize: 13, color: C.muted, textDecoration: 'none' }}>Freighter</a>
              <a href="https://github.com/ankitapolu/xlm-payment-dapp" target="_blank" rel="noopener noreferrer" style={{ fontSize: 13, color: C.muted, textDecoration: 'none' }}>GitHub</a>
            </div>
          </div>

          {/* Bottom bar */}
          <div style={{
            width: '100%', borderTop: `1px solid ${C.hairline}`,
            paddingTop: 16, marginTop: 8,
            display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 8,
          }}>
            <span style={{ fontSize: 12, color: C.muted }}>
              &copy; {new Date().getFullYear()} SplitBill &middot; Stellar Testnet
            </span>
            <span style={{ fontSize: 12, color: C.muted }}>
              Non-custodial &middot; Open source
            </span>
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
