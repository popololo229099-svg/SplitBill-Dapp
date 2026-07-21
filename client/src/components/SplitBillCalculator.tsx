import { useState } from 'react';
import { useWallet } from '../context/WalletContext';
import { buildPaymentTransaction } from '../utils/stellar';
import { signTransaction } from '../utils/freighter';
import { submitSignedTransaction } from '../utils/stellar';

const API_URL = import.meta.env.VITE_API_URL || 'https://splitbill-h0q9.onrender.com';

async function saveTransaction(tx: {
  senderAddress: string;
  recipientAddress: string;
  amount: string;
  txHash?: string;
  status: string;
}) {
  try {
    await fetch(`${API_URL}/api/transactions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(tx),
    });
  } catch {
    // silently fail — don't block the UI
  }
}

type TxStatus = 'idle' | 'building' | 'awaiting_signature' | 'submitting' | 'success' | 'error';
type ActiveView = 'setup' | 'review' | 'sending' | 'result';

interface TxRecipient {
  address: string;
  amount: string;
  status: TxStatus;
  hash?: string;
  error?: string;
}

export default function SplitBillCalculator() {
  const { balance, refreshBalance, address: walletAddress } = useWallet();

  const [participants, setParticipants] = useState<string[]>(['', '']);
  const [totalAmount, setTotalAmount] = useState('');
  const [activeView, setActiveView] = useState<ActiveView>('setup');
  const [transactions, setTransactions] = useState<TxRecipient[]>([]);

  const validParticipants = participants.filter((p) => p.trim() !== '');
  const splitAmount = totalAmount && validParticipants.length > 0
    ? (parseFloat(totalAmount) / validParticipants.length).toFixed(7)
    : '0';
  const totalAsNumber = parseFloat(totalAmount) || 0;
  const balanceAsNumber = parseFloat(balance || '0');
  const isOverBalance = totalAsNumber > balanceAsNumber;
  const isFormValid = validParticipants.length >= 2 && totalAsNumber > 0 && !isOverBalance;

  function addParticipant() {
    setParticipants([...participants, '']);
  }

  function updateParticipant(index: number, value: string) {
    const updated = [...participants];
    updated[index] = value;
    setParticipants(updated);
  }

  function removeParticipant(index: number) {
    if (participants.length <= 2) return;
    setParticipants(participants.filter((_, i) => i !== index));
  }

  function goToReview() {
    setActiveView('review');
  }

  function backToSetup() {
    setActiveView('setup');
    setTransactions([]);
  }

  async function sendAllPayments() {
    setActiveView('sending');

    const recipients: TxRecipient[] = validParticipants.map((addr) => ({
      address: addr.trim(),
      amount: splitAmount,
      status: 'building' as TxStatus,
    }));
    setTransactions(recipients);

    for (let i = 0; i < recipients.length; i++) {
      try {
        setTransactions((prev) => {
          const next = [...prev];
          next[i] = { ...next[i], status: 'building' };
          return next;
        });

        const xdr = await buildPaymentTransaction(walletAddress!, recipients[i].address, recipients[i].amount);

        setTransactions((prev) => {
          const next = [...prev];
          next[i] = { ...next[i], status: 'awaiting_signature' };
          return next;
        });

        const { signedXdr } = await signTransaction(xdr);

        setTransactions((prev) => {
          const next = [...prev];
          next[i] = { ...next[i], status: 'submitting' };
          return next;
        });

        const result = await submitSignedTransaction(signedXdr);

        setTransactions((prev) => {
          const next = [...prev];
          next[i] = { ...next[i], status: 'success', hash: result.hash };
          return next;
        });

        saveTransaction({
          senderAddress: walletAddress!,
          recipientAddress: recipients[i].address,
          amount: recipients[i].amount,
          txHash: result.hash,
          status: 'success',
        });
      } catch (e: any) {
        setTransactions((prev) => {
          const next = [...prev];
          next[i] = { ...next[i], status: 'error', error: e.message || 'Transaction failed' };
          return next;
        });

        saveTransaction({
          senderAddress: walletAddress!,
          recipientAddress: recipients[i].address,
          amount: recipients[i].amount,
          status: 'failed',
        });
      }
    }

    setActiveView('result');
    await refreshBalance();
  }

  const allSuccess = transactions.length > 0 && transactions.every((t) => t.status === 'success');

  const inputBase = {
    width: '100%',
    padding: '8px 12px',
    borderRadius: 6,
    border: '1px solid #2b3139',
    background: '#1e2329',
    color: '#eaecef',
    fontSize: 13,
    outline: 'none',
    transition: 'border-color 0.15s',
  } as React.CSSProperties;

  const labelStyle = {
    fontSize: 12,
    color: '#707a8a',
    marginBottom: 4,
    fontWeight: 500,
  } as React.CSSProperties;

  const btnPrimary = {
    width: '100%',
    padding: '10px',
    borderRadius: 6,
    border: 'none',
    background: '#f0b90b',
    color: '#0b0e11',
    fontSize: 14,
    fontWeight: 700,
    cursor: 'pointer',
    transition: 'background 0.15s',
  } as React.CSSProperties;

  const btnDisabled = {
    width: '100%',
    padding: '10px',
    borderRadius: 6,
    border: 'none',
    background: '#474d57',
    color: '#707a8a',
    fontSize: 14,
    fontWeight: 700,
    cursor: 'not-allowed',
  } as React.CSSProperties;

  const btnOutline = {
    padding: '8px 16px',
    borderRadius: 6,
    border: '1px solid #474d57',
    background: 'transparent',
    color: '#eaecef',
    fontSize: 13,
    cursor: 'pointer',
  } as React.CSSProperties;

  const statusColors = {
    idle: '#707a8a',
    building: '#f0b90b',
    awaiting_signature: '#f0b90b',
    submitting: '#f0b90b',
    success: '#0ecb81',
    error: '#f6465d',
  };

  const statusLabels = {
    idle: 'Pending',
    building: 'Building...',
    awaiting_signature: 'Sign in Freighter...',
    submitting: 'Submitting...',
    success: 'Success',
    error: 'Failed',
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {activeView === 'setup' && (
        <>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ fontSize: 16, fontWeight: 600, color: '#eaecef' }}>Split a Bill</h3>
          </div>

          <div>
            <div style={labelStyle}>Total Bill (XLM)</div>
            <div style={{ position: 'relative' }}>
              <input
                type="number"
                step="0.0000001"
                min="0"
                value={totalAmount}
                onChange={(e) => setTotalAmount(e.target.value)}
                placeholder="0.00"
                style={{ ...inputBase, paddingRight: 40 }}
              />
              <span style={{
                position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)',
                fontSize: 12, color: '#707a8a', fontWeight: 600,
              }}>
                XLM
              </span>
            </div>
            {isOverBalance && (
              <div style={{ color: '#f6465d', fontSize: 11, marginTop: 4 }}>
                Insufficient balance
              </div>
            )}
          </div>

          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
              <span style={labelStyle}>Participants ({validParticipants.length})</span>
              {isFormValid && (
                <div style={{
                  background: '#1e2329', borderRadius: 6, padding: '4px 10px',
                  fontSize: 12, color: '#f0b90b', fontWeight: 600,
                  border: '1px solid #2b3139',
                }}>
                  {splitAmount} XLM each
                </div>
              )}
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {participants.map((participant, i) => (
                <div key={i} style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                  <div style={{
                    width: 22, height: 22, borderRadius: '50%',
                    background: '#2b3139', color: '#707a8a',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 11, fontWeight: 600, flexShrink: 0,
                  }}>
                    {i + 1}
                  </div>
                  <input
                    value={participant}
                    onChange={(e) => updateParticipant(i, e.target.value)}
                    placeholder={`G... address of person ${i + 1}`}
                    style={inputBase}
                  />
                  {participants.length > 2 && (
                    <button onClick={() => removeParticipant(i)} style={{
                      background: 'none', border: 'none', color: '#707a8a',
                      cursor: 'pointer', fontSize: 16, padding: '2px 4px',
                      lineHeight: 1,
                    }}
                      onMouseEnter={(e) => e.currentTarget.style.color = '#f6465d'}
                      onMouseLeave={(e) => e.currentTarget.style.color = '#707a8a'}
                    >
                      ×
                    </button>
                  )}
                </div>
              ))}
            </div>

            <button onClick={addParticipant} style={{
              ...btnOutline, width: '100%', marginTop: 8, fontSize: 12, color: '#707a8a',
            }}
              onMouseEnter={(e) => { e.currentTarget.style.borderColor = '#f0b90b'; e.currentTarget.style.color = '#f0b90b'; }}
              onMouseLeave={(e) => { e.currentTarget.style.borderColor = '#474d57'; e.currentTarget.style.color = '#707a8a'; }}
            >
              + Add participant
            </button>
          </div>

          <div style={{
            background: '#1e2329', borderRadius: 8, border: '1px solid #2b3139',
            padding: '8px 12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          }}>
            <span style={{ fontSize: 12, color: '#707a8a' }}>You pay</span>
            <span style={{ fontSize: 14, fontWeight: 700, color: '#f0b90b' }}>
              {validParticipants.length > 0 ? totalAmount || '0' : '0'}
              <span style={{ fontSize: 11, color: '#707a8a', fontWeight: 400, marginLeft: 3 }}>XLM</span>
            </span>
          </div>

          <button
            onClick={goToReview}
            disabled={!isFormValid}
            style={isFormValid ? btnPrimary : btnDisabled}
            onMouseEnter={(e) => { if (isFormValid) e.currentTarget.style.background = '#e0a800'; }}
            onMouseLeave={(e) => { if (isFormValid) e.currentTarget.style.background = '#f0b90b'; }}
          >
            Review & Confirm
          </button>
        </>
      )}

      {activeView === 'review' && (
        <>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 4 }}>
            <button onClick={backToSetup} style={{
              background: 'none', border: 'none', color: '#707a8a', cursor: 'pointer', fontSize: 16, padding: 0,
            }}>
              ←
            </button>
            <h3 style={{ fontSize: 16, fontWeight: 600, color: '#eaecef' }}>Confirm Transaction</h3>
          </div>

          <div style={{
            background: '#1e2329', borderRadius: 8, border: '1px solid #2b3139', overflow: 'hidden',
          }}>
            <div style={{ padding: '10px 12px', borderBottom: '1px solid #2b3139', fontSize: 11, color: '#707a8a', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              Summary
            </div>
            <div style={{ padding: '10px 12px', display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ fontSize: 13, color: '#707a8a' }}>Total amount</span>
              <span style={{ fontSize: 14, fontWeight: 600, color: '#eaecef' }}>{totalAmount} XLM</span>
            </div>
            <div style={{ padding: '0 12px 10px', display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ fontSize: 13, color: '#707a8a' }}>Recipients</span>
              <span style={{ fontSize: 14, fontWeight: 600, color: '#eaecef' }}>{validParticipants.length} people</span>
            </div>
            <div style={{ padding: '0 12px 10px', display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ fontSize: 13, color: '#707a8a' }}>Each receives</span>
              <span style={{ fontSize: 14, fontWeight: 600, color: '#0ecb81' }}>{splitAmount} XLM</span>
            </div>
            <div style={{ padding: '0 12px 10px', display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ fontSize: 13, color: '#707a8a' }}>Network</span>
              <span style={{
                fontSize: 11, color: '#f0b90b', fontWeight: 600,
                background: 'rgba(240, 185, 11, 0.1)', padding: '2px 6px', borderRadius: 4,
              }}>
                Stellar Testnet
              </span>
            </div>
          </div>

          <div style={{
            background: '#1e2329', borderRadius: 8, border: '1px solid #2b3139', overflow: 'hidden',
          }}>
            <div style={{ padding: '10px 12px', borderBottom: '1px solid #2b3139', fontSize: 11, color: '#707a8a', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              Recipients
            </div>
            {validParticipants.map((addr, i) => (
              <div key={i} style={{
                padding: '8px 12px', borderBottom: i < validParticipants.length - 1 ? '1px solid #2b3139' : 'none',
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              }}>
                <div>
                  <div style={{ fontSize: 11, color: '#707a8a' }}>#{i + 1}</div>
                  <div style={{ fontSize: 12, color: '#eaecef' }}>{addr.slice(0, 6)}...{addr.slice(-4)}</div>
                </div>
                <span style={{ fontSize: 13, fontWeight: 600, color: '#eaecef' }}>{splitAmount} XLM</span>
              </div>
            ))}
          </div>

          <button
            onClick={sendAllPayments}
            style={btnPrimary}
            onMouseEnter={(e) => e.currentTarget.style.background = '#e0a800'}
            onMouseLeave={(e) => e.currentTarget.style.background = '#f0b90b'}
          >
            Confirm & Send {validParticipants.length} Payment{validParticipants.length > 1 ? 's' : ''}
          </button>
        </>
      )}

      {(activeView === 'sending' || activeView === 'result') && (
        <>
          <h3 style={{ fontSize: 16, fontWeight: 600, color: '#eaecef' }}>
            {activeView === 'sending' ? 'Processing Payments' : allSuccess ? 'All Payments Sent!' : 'Payment Results'}
          </h3>

          {allSuccess && (
            <div style={{
              background: 'rgba(14, 203, 129, 0.1)', border: '1px solid #0ecb81',
              borderRadius: 8, padding: 16, textAlign: 'center',
            }}>
              <div style={{ fontSize: 28, marginBottom: 8 }}>✓</div>
              <div style={{ fontSize: 15, fontWeight: 600, color: '#0ecb81', marginBottom: 4 }}>
                Successfully sent {totalAmount} XLM
              </div>
              <div style={{ fontSize: 12, color: '#707a8a' }}>
                to {validParticipants.length} recipient{validParticipants.length > 1 ? 's' : ''}
              </div>
            </div>
          )}

          <div style={{
            background: '#1e2329', borderRadius: 8, border: '1px solid #2b3139', overflow: 'hidden',
          }}>
            <div style={{ padding: '10px 12px', borderBottom: '1px solid #2b3139', fontSize: 11, color: '#707a8a', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              Transactions
            </div>
            {transactions.map((tx, i) => (
              <div key={i} style={{
                padding: '10px 12px',
                borderBottom: i < transactions.length - 1 ? '1px solid #2b3139' : 'none',
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                  <div style={{ fontSize: 12, color: '#eaecef' }}>
                    {tx.address.slice(0, 6)}...{tx.address.slice(-4)}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span style={{ fontSize: 11, fontWeight: 600, color: statusColors[tx.status] }}>
                      {statusLabels[tx.status]}
                    </span>
                    {tx.status !== 'idle' && tx.status !== 'building' && (
                      <div style={{
                        width: 8, height: 8, borderRadius: '50%',
                        background: statusColors[tx.status],
                        opacity: tx.status === 'submitting' || tx.status === 'awaiting_signature' ? 0.6 : 1,
                      }} />
                    )}
                  </div>
                </div>
                <div style={{ fontSize: 11, color: '#707a8a' }}>
                  {tx.amount} XLM
                </div>
                {tx.hash && (
                  <div style={{
                    fontSize: 10, color: '#5e6673', marginTop: 3, wordBreak: 'break-all',
                    fontFamily: 'monospace',
                  }}>
                    {tx.hash}
                  </div>
                )}
                {tx.error && (
                  <div style={{ fontSize: 11, color: '#f6465d', marginTop: 3 }}>
                    {tx.error}
                  </div>
                )}
              </div>
            ))}
          </div>

          <button
            onClick={backToSetup}
            style={btnPrimary}
            onMouseEnter={(e) => e.currentTarget.style.background = '#e0a800'}
            onMouseLeave={(e) => e.currentTarget.style.background = '#f0b90b'}
          >
            Split Another Bill
          </button>
        </>
      )}
    </div>
  );
}
