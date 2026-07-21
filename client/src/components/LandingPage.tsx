import { useState, useEffect } from 'react';
import { useIsMobile } from '../hooks/useMediaQuery';

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
  tradingUp: '#0ecb81',
  tradingDown: '#f6465d',
};

interface Props {
  onEnter: () => void;
}

function useCountUp(target: number, duration: number) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    let current = 0;
    const increment = target / (duration / 16);
    const timer = setInterval(() => {
      current += increment;
      if (current >= target) {
        setCount(target);
        clearInterval(timer);
      } else {
        setCount(Math.floor(current));
      }
    }, 16);
    return () => clearInterval(timer);
  }, [target, duration]);
  return count;
}

export default function LandingPage({ onEnter }: Props) {
  const [hoveredFeature, setHoveredFeature] = useState<number | null>(null);
  const [hoveredCta, setHoveredCta] = useState(false);
  const [visible, setVisible] = useState(false);
  const mobile = useIsMobile();

  useEffect(() => {
    setVisible(true);
  }, []);

  const users = useCountUp(316258026, 2000);
  const volume = useCountUp(429423449, 2200);

  const features = [
    { icon: '⚡', title: 'Instant Settlement', desc: 'Send XLM across the Stellar network in under 5 seconds with near-zero fees.' },
    { icon: '🔒', title: 'Non-Custodial', desc: 'Your keys, your crypto. Freighter keeps your assets under your control at all times.' },
    { icon: '👥', title: 'Split Any Bill', desc: 'Add any number of participants and divide the bill equally with a single click.' },
    { icon: '📊', title: 'Full Transparency', desc: 'Every transaction is recorded on-chain with a verifiable hash and timestamp.' },
  ];

  const steps = [
    { num: '01', title: 'Connect Wallet', desc: 'Link your Freighter wallet to get started in seconds.' },
    { num: '02', title: 'Split the Bill', desc: 'Enter the total amount and add your friends\' Stellar addresses.' },
    { num: '03', title: 'Confirm & Send', desc: 'Review the split, sign in Freighter, and payments are sent instantly.' },
  ];

  const px = mobile ? '16px' : '32px';

  return (
    <div style={{
      minHeight: '100vh',
      background: C.canvasDark,
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      opacity: visible ? 1 : 0,
      transition: 'opacity 0.6s ease',
    }}>

      {/* Top Nav */}
      <nav style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 50,
        background: 'rgba(11, 14, 17, 0.85)',
        backdropFilter: 'blur(12px)',
        borderBottom: `1px solid ${C.hairline}`,
        height: 64, display: 'flex', alignItems: 'center',
      }}>
        <div style={{
          maxWidth: 1280, width: '100%', margin: '0 auto', padding: `0 ${px}`,
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{
              background: C.primary, color: '#181a20',
              fontWeight: 800, fontSize: 18, letterSpacing: '-0.5px',
              padding: '2px 6px', borderRadius: 2,
            }}>SB</span>
            {!mobile && (
              <>
                <span style={{
                  fontSize: 16, fontWeight: 700, color: C.body, letterSpacing: '-0.3px',
                }}>SplitBill</span>
                <span style={{
                  fontSize: 10, color: C.muted, marginLeft: 4,
                  background: C.surfaceCard, padding: '1px 6px', borderRadius: 2, fontWeight: 600,
                }}>TESTNET</span>
              </>
            )}
          </div>
          <button
            onClick={onEnter}
            style={{
              background: C.primary, color: '#181a20', border: 'none',
              borderRadius: 6, padding: mobile ? '8px 14px' : '8px 20px',
              fontSize: mobile ? 13 : 14, fontWeight: 600,
              cursor: 'pointer',
            }}
          >{mobile ? 'Launch' : 'Launch App'}</button>
        </div>
      </nav>

      {/* Hero */}
      <section style={{
        padding: `${mobile ? '120px' : '144px'} ${px} 80px`,
        maxWidth: 1280, margin: '0 auto', textAlign: 'center',
      }}>
        <div style={{
          display: 'inline-block',
          background: C.surfaceCard, border: `1px solid ${C.hairline}`,
          borderRadius: 9999, padding: '6px 16px', marginBottom: 32,
          fontSize: mobile ? 12 : 13, color: C.muted, fontWeight: 500,
        }}>
          Powered by <span style={{ color: C.primary, fontWeight: 600 }}>Stellar</span> Testnet
        </div>
        <h1 style={{
          fontSize: mobile ? 36 : 64, fontWeight: 700, color: C.body, lineHeight: 1.1,
          letterSpacing: '-1px', margin: '0 0 20px', maxWidth: 800,
          marginLeft: 'auto', marginRight: 'auto',
        }}>
          Split bills with{' '}
          <span style={{ color: C.primary }}>anyone</span>,{' '}
          <br />instantly.
        </h1>
        <p style={{
          fontSize: mobile ? 15 : 18, color: C.muted, lineHeight: 1.6,
          maxWidth: 560, margin: '0 auto 40px',
        }}>
          Connect your Freighter wallet, divide any bill among friends,
          and send XLM on Stellar — all in under 5 seconds.
        </p>
        <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
          <button
            onClick={onEnter}
            onMouseEnter={() => setHoveredCta(true)}
            onMouseLeave={() => setHoveredCta(false)}
            style={{
              background: hoveredCta ? C.primaryActive : C.primary,
              color: '#181a20', border: 'none', borderRadius: 9999,
              padding: mobile ? '12px 24px' : '14px 32px',
              fontSize: mobile ? 13 : 14, fontWeight: 600,
              cursor: 'pointer', transition: 'background 0.15s',
            }}
          >Get Started</button>
          <a
            href="https://github.com/ankitapolu/xlm-payment-dapp"
            target="_blank" rel="noopener noreferrer"
            style={{
              background: C.surfaceCard, color: C.body,
              border: `1px solid ${C.hairline}`, borderRadius: 6,
              padding: mobile ? '12px 20px' : '14px 24px',
              fontSize: mobile ? 13 : 14, fontWeight: 600,
              cursor: 'pointer', textDecoration: 'none', display: 'inline-block',
            }}
          >View on GitHub</a>
        </div>
      </section>

      {/* Stats */}
      <section style={{
        borderTop: `1px solid ${C.hairline}`,
        borderBottom: `1px solid ${C.hairline}`,
        padding: `${mobile ? 32 : 48}px ${px}`,
      }}>
        <div style={{
          maxWidth: 1280, margin: '0 auto',
          display: 'grid', gridTemplateColumns: mobile ? 'repeat(2, 1fr)' : 'repeat(4, 1fr)',
          gap: mobile ? 24 : 32,
        }}>
          {[
            { value: users.toLocaleString(), label: 'Users on Stellar' },
            { value: `$${volume.toLocaleString()}`, label: 'Daily Volume (USD)' },
            { value: '< 5s', label: 'Settlement Time' },
            { value: '$0.0001', label: 'Avg Transaction Fee' },
          ].map((stat, i) => (
            <div key={i} style={{ textAlign: 'center' }}>
              <div style={{
                fontSize: mobile ? 28 : 40, fontWeight: 700, color: C.primary,
                letterSpacing: '-0.3px', lineHeight: 1.1,
              }}>{stat.value}</div>
              <div style={{
                fontSize: mobile ? 11 : 13, color: C.muted, marginTop: 4, fontWeight: 500,
              }}>{stat.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section style={{ padding: `${mobile ? 48 : 80}px ${px}` }}>
        <div style={{ maxWidth: 1280, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: mobile ? 32 : 48 }}>
            <h2 style={{
              fontSize: mobile ? 28 : 40, fontWeight: 600, color: C.body,
              letterSpacing: '-0.3px', margin: '0 0 12px',
            }}>Why SplitBill?</h2>
            <p style={{ fontSize: 14, color: C.muted, maxWidth: 480, margin: '0 auto' }}>
              Built on Stellar for speed, transparency, and near-zero fees.
            </p>
          </div>
          <div style={{
            display: 'grid', gridTemplateColumns: mobile ? '1fr' : 'repeat(auto-fit, minmax(260px, 1fr))',
            gap: 16,
          }}>
            {features.map((f, i) => (
              <div
                key={i}
                onMouseEnter={() => setHoveredFeature(i)}
                onMouseLeave={() => setHoveredFeature(null)}
                style={{
                  background: hoveredFeature === i ? C.surfaceElevated : C.surfaceCard,
                  border: `1px solid ${hoveredFeature === i ? C.primary : C.hairline}`,
                  borderRadius: 12, padding: mobile ? 20 : 24,
                  transition: 'all 0.2s ease',
                }}
              >
                <div style={{ fontSize: 32, marginBottom: 16 }}>{f.icon}</div>
                <h3 style={{ fontSize: 16, fontWeight: 600, color: C.body, margin: '0 0 8px' }}>{f.title}</h3>
                <p style={{ fontSize: 14, color: C.muted, lineHeight: 1.5, margin: 0 }}>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section style={{ padding: `${mobile ? 48 : 80}px ${px}` }}>
        <div style={{ maxWidth: 1280, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: mobile ? 32 : 48 }}>
            <h2 style={{
              fontSize: mobile ? 28 : 40, fontWeight: 600, color: C.body,
              letterSpacing: '-0.3px', margin: '0 0 12px',
            }}>How it works</h2>
            <p style={{ fontSize: 14, color: C.muted }}>Three steps to split any bill.</p>
          </div>
          <div style={{
            display: 'grid', gridTemplateColumns: mobile ? '1fr' : 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: 16,
          }}>
            {steps.map((s, i) => (
              <div key={i} style={{
                background: C.surfaceCard, border: `1px solid ${C.hairline}`,
                borderRadius: 12, padding: mobile ? 24 : 32, position: 'relative',
              }}>
                <div style={{
                  fontSize: mobile ? 36 : 48, fontWeight: 700, color: C.surfaceElevated,
                  position: 'absolute', top: 16, right: 20, lineHeight: 1,
                }}>{s.num}</div>
                <h3 style={{
                  fontSize: 16, fontWeight: 600, color: C.primary,
                  margin: '0 0 12px', position: 'relative',
                }}>{s.title}</h3>
                <p style={{
                  fontSize: 14, color: C.muted, lineHeight: 1.5, margin: 0, position: 'relative',
                }}>{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Band */}
      <section style={{ padding: `0 ${px} ${mobile ? 48 : 80}px` }}>
        <div style={{
          maxWidth: 1280, margin: '0 auto',
          background: C.surfaceCard, border: `1px solid ${C.hairline}`,
          borderRadius: 12, padding: mobile ? '24px' : '48px',
          display: 'flex', alignItems: mobile ? 'stretch' : 'center',
          justifyContent: 'space-between', flexDirection: mobile ? 'column' : 'row',
          gap: 16,
        }}>
          <h2 style={{
            fontSize: mobile ? 22 : 32, fontWeight: 600, color: C.body,
            letterSpacing: '0', margin: 0,
          }}>Ready to split your first bill?</h2>
          <button
            onClick={onEnter}
            style={{
              background: C.primary, color: '#181a20', border: 'none',
              borderRadius: 6, padding: '12px 24px', fontSize: 14,
              fontWeight: 600, cursor: 'pointer', whiteSpace: 'nowrap',
              width: mobile ? '100%' : 'auto',
            }}
          >Launch App →</button>
        </div>
      </section>

      {/* Trust Badges */}
      <section style={{ padding: `0 ${px} ${mobile ? 48 : 80}px` }}>
        <div style={{
          maxWidth: 1280, margin: '0 auto',
          display: 'flex', justifyContent: 'center', gap: 12, flexWrap: 'wrap',
        }}>
          {['Non-Custodial', 'Open Source', 'Stellar Testnet', 'Zero Fees'].map((badge, i) => (
            <div key={i} style={{
              background: C.surfaceCard, border: `1px solid ${C.hairline}`,
              borderRadius: 8, padding: mobile ? '10px 16px' : '12px 20px',
              fontSize: mobile ? 13 : 14, fontWeight: 600, color: C.body,
            }}>{badge}</div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer style={{
        background: C.canvasDark, borderTop: `1px solid ${C.hairline}`,
        padding: mobile ? '32px 16px' : '48px 32px',
      }}>
        <div style={{
          maxWidth: 1280, margin: '0 auto',
          display: 'flex', flexDirection: mobile ? 'column' : 'row',
          justifyContent: 'space-between', alignItems: mobile ? 'flex-start' : 'center',
          gap: 16,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{
              background: C.primary, color: '#181a20',
              fontWeight: 800, fontSize: 14, padding: '2px 5px', borderRadius: 2,
            }}>SB</span>
            <span style={{ fontSize: 14, fontWeight: 600, color: C.body }}>SplitBill</span>
          </div>
          <div style={{ fontSize: 13, color: C.muted }}>
            Powered by Stellar &middot; Built for Level 1
          </div>
        </div>
      </footer>
    </div>
  );
}
