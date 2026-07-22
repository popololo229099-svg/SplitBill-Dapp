import { useState, useCallback } from 'react';
import { useWallet } from '../context/WalletContext';
import { buildPaymentTransaction, buildRecordSplitTx, submitSignedTransaction, CONTRACT_ADDRESS } from '../utils/contract';
import { signTransactionWithKit } from '../utils/wallet-kit';
import { useIsMobile } from '../hooks/useMediaQuery';

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
    // silently fail
  }
}

type TxPhase = 'idle' | 'building' | 'awaiting_signature' | 'submitting' | 'recording' | 'success' | 'error';
type ActiveView = 'setup' | 'review' | 'sending' | 'result';

interface TxRecipient {
  address: string;
  amount: string;
  phase: TxPhase;
  hash?: string;
  contractTxHash?: string;
  error?: string;
  errorType?: string;
}

export default function SplitBillCalculator() {
  const { balance, refreshBalance, address: walletAddress } = useWallet();
  const mobile = useIsMobile();

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
      phase: 'building' as TxPhase,
    }));
    setTransactions(recipients);

    for (let i = 0; i < recipients.length; i++) {
      try {
        setPhase(i, 'building');

        const xdr = await buildPaymentTransaction(walletAddress!, recipients[i].address, recipients[i].amount);

        setPhase(i, 'awaiting_signature');

        const { signedTxXdr } = await signTransactionWithKit(xdr);

        setPhase(i, 'submitting');

        const result = await submitSignedTransaction(signedTxXdr);

        setHashAndPhase(i, result.hash, 'recording');

        const contractXdr = await buildRecordSplitTx(
          walletAddress!,
          recipients[i].address,
          recipients[i].amount,
        );

        try {
          const { signedTxXdr: contractSigned } = await signTransactionWithKit(contractXdr);
          const contractResult = await submitSignedTransaction(contractSigned);
          setContractHash(i, contractResult.hash);
        } catch (contractErr: any) {
          console.warn('Contract recording failed (non-blocking):', contractErr);
        }

        setPhase(i, 'success');

        saveTransaction({
          senderAddress: walletAddress!,
          recipientAddress: recipients[i].address,
          amount: recipients[i].amount,
          txHash: result.hash,
          status: 'success',
        });
      } catch (e: any) {
        const msg = e?.message || e?.toString() || 'Transaction failed';
        let errorType = 'unknown';

        if (msg.includes('insufficient') || msg.includes('BALANCE')) {
          errorType = 'insufficient_balance';
        } else if (msg.includes('reject') || msg.includes('denied') || msg.includes('User declined') || msg.includes('user_cancelled')) {
          errorType = 'transaction_rejected';
        } else if (msg.includes('not found') || msg.includes('NOT_FOUND') || msg.includes('seqnum')) {
          errorType = 'account_not_found';
        } else if (msg.includes('timeout') || msg.includes('TIMEOUT')) {
          errorType = 'timeout';
        }

        setErrorAndPhase(i, msg, errorType);

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

  const setPhase = useCallback((i: number, phase: TxPhase) => {
    setTransactions((prev) => {
      const next = [...prev];
      next[i] = { ...next[i], phase };
      return next;
    });
  }, []);

  const setHashAndPhase = useCallback((i: number, hash: string, phase: TxPhase) => {
    setTransactions((prev) => {
      const next = [...prev];
      next[i] = { ...next[i], hash, phase };
      return next;
    });
  }, []);

  const setContractHash = useCallback((i: number, contractTxHash: string) => {
    setTransactions((prev) => {
      const next = [...prev];
      next[i] = { ...next[i], contractTxHash };
      return next;
    });
  }, []);

  const setErrorAndPhase = useCallback((i: number, error: string, errorType: string) => {
    setTransactions((prev) => {
      const next = [...prev];
      next[i] = { ...next[i], phase: 'error', error, errorType };
      return next;
    });
  }, []);

  const allSuccess = transactions.length > 0 && transactions.every((t) => t.phase === 'success');
  const completedCount = transactions.filter((t) => t.phase === 'success' || t.phase === 'error').length;

  const inputBase = {
    width: '100%',
    padding: mobile ? '10px 12px' : '8px 12px',
    borderRadius: 6,
    border: '1px solid #2b3139',
    background: '#1e2329',
    color: '#eaecef',
    fontSize: mobile ? 14 : 13,
    outline: 'none',
    transition: 'border-color 0.15s',
  } as React.CSSProperties;

  const labelStyle = {
    fontSize: mobile ? 11 : 12,
    color: '#707a8a',
    marginBottom: 4,
    fontWeight: 500,
  } as React.CSSProperties;

  const btnPrimary = {
    width: '100%',
    padding: mobile ? '12px' : '10px',
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
    padding: mobile ? '12px' : '10px',
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

  const phaseColors: Record<string, string> = {
    idle: '#707a8a',
    building: '#f0b90b',
    awaiting_signature: '#f0b90b',
    submitting: '#f0b90b',
    recording: '#3b82f6',
    success: '#0ecb81',
    error: '#f6465d',
  };

  const phaseLabels: Record<string, string> = {
    idle: 'Pending',
    building: 'Building...',
    awaiting_signature: 'Sign in Wallet...',
    submitting: 'Submitting...',
    recording: 'Recording...',
    success: 'Success',
    error: 'Failed',
  };

  const errorTypeLabels: Record<string, string> = {
    insufficient_balance: 'Insufficient Balance',
    transaction_rejected: 'Transaction Rejected',
    account_not_found: 'Account Not Found',
    timeout: 'Transaction Timeout',
    unknown: 'Transaction Failed',
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {activeView === 'setup' && (
        <>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ fontSize: mobile ? 15 : 16, fontWeight: 600, color: '#eaecef' }}>Split a Bill</h3>
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
                    placeholder={mobile ? `G... address #${i + 1}` : `G... address of person ${i + 1}`}
                    style={inputBase}
                  />
                  {participants.length > 2 && (
                    <button onClick={() => removeParticipant(i)} style={{
                      background: 'none', border: 'none', color: '#707a8a',
                      cursor: 'pointer', fontSize: 16, padding: '2px 4px',
                      lineHeight: 1, flexShrink: 0,
                    }}
                      onMouseEnter={(e) => e.currentTarget.style.color = '#f6465d'}
                      onMouseLeave={(e) => e.currentTarget.style.color = '#707a8a'}
                    >
                      x
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
            padding: mobile ? '10px 12px' : '8px 12px',
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
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
              &larr;
            </button>
            <h3 style={{ fontSize: mobile ? 15 : 16, fontWeight: 600, color: '#eaecef' }}>Confirm Transaction</h3>
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
            <div style={{ padding: '0 12px 10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
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
              Smart Contract
            </div>
            <div style={{ padding: '10px 12px' }}>
              <div style={{ fontSize: 12, color: '#707a8a', marginBottom: 4 }}>Contract Address</div>
              <div style={{
                fontSize: mobile ? 10 : 11,
                color: '#eaecef',
                fontFamily: 'monospace',
                wordBreak: 'break-all',
                lineHeight: 1.4,
              }}>
                {CONTRACT_ADDRESS}
              </div>
              <div style={{ fontSize: 11, color: '#3b82f6', marginTop: 4 }}>
                Each payment will be recorded on-chain via this contract
              </div>
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
                padding: mobile ? '8px 10px' : '8px 12px',
                borderBottom: i < validParticipants.length - 1 ? '1px solid #2b3139' : 'none',
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              }}>
                <div>
                  <div style={{ fontSize: 11, color: '#707a8a' }}>#{i + 1}</div>
                  <div style={{ fontSize: mobile ? 11 : 12, color: '#eaecef' }}>
                    {addr.slice(0, mobile ? 4 : 6)}...{addr.slice(-4)}
                  </div>
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
          <h3 style={{ fontSize: mobile ? 15 : 16, fontWeight: 600, color: '#eaecef' }}>
            {activeView === 'sending'
              ? `Processing... (${completedCount}/${transactions.length})`
              : allSuccess ? 'All Payments Sent!' : 'Payment Results'}
          </h3>

          {activeView === 'sending' && (
            <div style={{
              background: '#1e2329', borderRadius: 8, border: '1px solid #2b3139',
              padding: 12,
            }}>
              <div style={{
                height: 4, background: '#2b3139', borderRadius: 2, overflow: 'hidden',
              }}>
                <div style={{
                  height: '100%',
                  background: '#f0b90b',
                  borderRadius: 2,
                  transition: 'width 0.3s ease',
                  width: `${(completedCount / transactions.length) * 100}%`,
                }} />
              </div>
            </div>
          )}

          {allSuccess && (
            <div style={{
              background: 'rgba(14, 203, 129, 0.1)', border: '1px solid #0ecb81',
              borderRadius: 8, padding: mobile ? 12 : 16, textAlign: 'center',
            }}>
              <div style={{ fontSize: 28, marginBottom: 8 }}>&#x2713;</div>
              <div style={{ fontSize: mobile ? 14 : 15, fontWeight: 600, color: '#0ecb81', marginBottom: 4 }}>
                Successfully sent {totalAmount} XLM
              </div>
              <div style={{ fontSize: 12, color: '#707a8a' }}>
                to {validParticipants.length} recipient{validParticipants.length > 1 ? 's' : ''} &middot; recorded on-chain
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
                padding: mobile ? '8px 10px' : '10px 12px',
                borderBottom: i < transactions.length - 1 ? '1px solid #2b3139' : 'none',
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                  <div style={{ fontSize: mobile ? 11 : 12, color: '#eaecef' }}>
                    {tx.address.slice(0, mobile ? 4 : 6)}...{tx.address.slice(-4)}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span style={{ fontSize: 11, fontWeight: 600, color: phaseColors[tx.phase] }}>
                      {phaseLabels[tx.phase]}
                    </span>
                    <div style={{
                      width: 8, height: 8, borderRadius: '50%',
                      background: phaseColors[tx.phase],
                      opacity: tx.phase === 'submitting' || tx.phase === 'awaiting_signature' || tx.phase === 'recording' ? 0.6 : 1,
                    }} />
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
                    Payment: <a
                      href={`https://stellar.expert/explorer/testnet/tx/${tx.hash}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{ color: '#3b82f6', textDecoration: 'none' }}
                    >{tx.hash.slice(0, 16)}...</a>
                  </div>
                )}
                {tx.contractTxHash && (
                  <div style={{
                    fontSize: 10, color: '#5e6673', marginTop: 2, wordBreak: 'break-all',
                    fontFamily: 'monospace',
                  }}>
                    Contract: <a
                      href={`https://stellar.expert/explorer/testnet/tx/${tx.contractTxHash}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{ color: '#3b82f6', textDecoration: 'none' }}
                    >{tx.contractTxHash.slice(0, 16)}...</a>
                  </div>
                )}
                {tx.error && (
                  <div style={{ marginTop: 4 }}>
                    <div style={{
                      fontSize: 10, fontWeight: 600, color: '#f6465d',
                      background: 'rgba(246, 70, 93, 0.1)',
                      padding: '2px 6px', borderRadius: 3, display: 'inline-block',
                    }}>
                      {errorTypeLabels[tx.errorType || 'unknown']}
                    </div>
                    <div style={{ fontSize: 11, color: '#f6465d', marginTop: 3 }}>
                      {tx.error}
                    </div>
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
