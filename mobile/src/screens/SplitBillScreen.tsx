import { useRef, useState } from 'react';
import { ScrollView, StyleSheet, Text, TextInput, View, type TextInputProps } from 'react-native';
import { useWallet } from '../context/WalletContext';
import {
  buildPaymentTransaction,
  buildRecordSplitTx,
  CONTRACT_ADDRESS,
  submitSignedTransaction,
  signWithSecret,
} from '../lib/stellar';
import { getSecretKey } from '../lib/wallet';
import { saveTransaction } from '../lib/api';
import { track } from '../lib/mixpanel';
import { Button, Card, Field, Row, SectionTitle } from '../components/ui';
import { colors } from '../theme';

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

const phaseColors: Record<TxPhase, string> = {
  idle: colors.muted,
  building: colors.primary,
  awaiting_signature: colors.primary,
  submitting: colors.primary,
  recording: colors.info,
  success: colors.up,
  error: colors.down,
};

const phaseLabels: Record<TxPhase, string> = {
  idle: 'Pending',
  building: 'Building...',
  awaiting_signature: 'Signing...',
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

function RecipientInput({ index, value, onChangeText, removable, onRemove }: {
  index: number;
  value: string;
  onChangeText: (v: string) => void;
  removable: boolean;
  onRemove: () => void;
}) {
  const props: TextInputProps = {
    placeholder: `G... address #${index + 1}`,
    autoCapitalize: 'none',
    autoCorrect: false,
    placeholderTextColor: colors.muted,
  };
  return (
    <View style={styles.recipientRow}>
      <View style={styles.recipientIndex}>
        <Text style={styles.recipientIndexText}>{index + 1}</Text>
      </View>
      <TextInput
        {...props}
        value={value}
        onChangeText={onChangeText}
        style={styles.recipientInput}
      />
      {removable && (
        <Text style={styles.removeButton} onPress={onRemove}>
          x
        </Text>
      )}
    </View>
  );
}

export default function SplitBillScreen() {
  const { balance, address, refreshBalance } = useWallet();
  const secretRef = useRef<string | null>(null);

  const [participants, setParticipants] = useState<string[]>(['', '']);
  const [totalAmount, setTotalAmount] = useState('');
  const [activeView, setActiveView] = useState<ActiveView>('setup');
  const [transactions, setTransactions] = useState<TxRecipient[]>([]);

  const validParticipants = participants.filter((p) => p.trim() !== '');
  const splitAmount =
    totalAmount && validParticipants.length > 0
      ? (parseFloat(totalAmount) / validParticipants.length).toFixed(7)
      : '0';
  const totalAsNumber = parseFloat(totalAmount) || 0;
  const balanceAsNumber = parseFloat(balance || '0');
  const isOverBalance = totalAsNumber > balanceAsNumber;
  const isFormValid = validParticipants.length >= 2 && totalAsNumber > 0 && !isOverBalance;

  function addParticipant() {
    setParticipants((prev) => [...prev, '']);
  }

  function updateParticipant(index: number, value: string) {
    setParticipants((prev) => {
      const next = [...prev];
      next[index] = value;
      return next;
    });
  }

  function removeParticipant(index: number) {
    if (participants.length <= 2) return;
    setParticipants((prev) => prev.filter((_, i) => i !== index));
  }

  function goToReview() {
    track('bill_split_initiated', {
      total_amount: totalAsNumber,
      recipient_count: validParticipants.length,
      split_amount: parseFloat(splitAmount),
    });
    setActiveView('review');
  }

  function backToSetup() {
    setActiveView('setup');
    setTransactions([]);
  }

  function setPhase(i: number, phase: TxPhase) {
    setTransactions((prev) => {
      const next = [...prev];
      next[i] = { ...next[i], phase };
      return next;
    });
  }

  function setHashAndPhase(i: number, hash: string, phase: TxPhase) {
    setTransactions((prev) => {
      const next = [...prev];
      next[i] = { ...next[i], hash, phase };
      return next;
    });
  }

  function setContractHash(i: number, contractTxHash: string) {
    setTransactions((prev) => {
      const next = [...prev];
      next[i] = { ...next[i], contractTxHash };
      return next;
    });
  }

  function setErrorAndPhase(i: number, error: string, errorType: string) {
    setTransactions((prev) => {
      const next = [...prev];
      next[i] = { ...next[i], phase: 'error', error, errorType };
      return next;
    });
  }

  function classifyError(msg: string): string {
    if (msg.includes('insufficient') || msg.includes('BALANCE')) return 'insufficient_balance';
    if (msg.includes('reject') || msg.includes('denied') || msg.includes('User declined') || msg.includes('user_cancelled')) return 'transaction_rejected';
    if (msg.includes('not found') || msg.includes('NOT_FOUND') || msg.includes('seqnum')) return 'account_not_found';
    if (msg.includes('timeout') || msg.includes('TIMEOUT')) return 'timeout';
    return 'unknown';
  }

  async function sendAllPayments() {
    if (!address) return;
    setActiveView('sending');

    const recipients: TxRecipient[] = validParticipants.map((addr) => ({
      address: addr.trim(),
      amount: splitAmount,
      phase: 'idle' as TxPhase,
    }));
    setTransactions(recipients);

    if (secretRef.current === null) {
      secretRef.current = await getSecretKey();
    }
    const secretKey = secretRef.current;

    let succeededCount = 0;
    let failedCount = 0;

    for (let i = 0; i < recipients.length; i++) {
      try {
        setPhase(i, 'building');

        const xdr = await buildPaymentTransaction(address, recipients[i].address, recipients[i].amount);

        setPhase(i, 'awaiting_signature');

        const signedXdr = signWithSecret(secretKey!, xdr);

        setPhase(i, 'submitting');

        const result = await submitSignedTransaction(signedXdr);

        setHashAndPhase(i, result.hash, 'recording');

        try {
          const contractXdr = await buildRecordSplitTx(address, recipients[i].address, recipients[i].amount);
          const contractSigned = signWithSecret(secretKey!, contractXdr);
          const contractResult = await submitSignedTransaction(contractSigned);
          setContractHash(i, contractResult.hash);
        } catch {
          // contract recording is non-blocking
        }

        setPhase(i, 'success');
        succeededCount++;

        saveTransaction({
          senderAddress: address,
          recipientAddress: recipients[i].address,
          amount: recipients[i].amount,
          txHash: result.hash,
          status: 'success',
        });
      } catch (e) {
        const msg = e instanceof Error ? e.message : String(e);
        const errorType = classifyError(msg);
        setErrorAndPhase(i, msg, errorType);
        failedCount++;

        saveTransaction({
          senderAddress: address,
          recipientAddress: recipients[i].address,
          amount: recipients[i].amount,
          status: 'failed',
        });
      }
    }

    const resultProps = {
      total_amount: totalAsNumber,
      recipient_count: recipients.length,
      succeeded_count: succeededCount,
    };

    if (failedCount === 0) {
      track('bill_split_completed', resultProps);
    } else {
      track('bill_split_failed', { ...resultProps, failed_count: failedCount });
    }

    setActiveView('result');
    await refreshBalance();
  }

  const completedCount = transactions.filter((t) => t.phase === 'success' || t.phase === 'error').length;
  const allSuccess = transactions.length > 0 && transactions.every((t) => t.phase === 'success');

  return (
    <ScrollView
      style={styles.flex}
      contentContainerStyle={styles.content}
      keyboardShouldPersistTaps="handled"
    >
      {activeView === 'setup' && (
        <View style={styles.gap}>
          <SectionTitle text="Split a Bill" />

          <Field
            label="Total Bill (XLM)"
            value={totalAmount}
            onChangeText={setTotalAmount}
            placeholder="0.00"
            keyboardType="decimal-pad"
          />
          {isOverBalance && <Text style={styles.errorText}>Insufficient balance</Text>}

          <View style={styles.participantHeader}>
            <Text style={styles.fieldLabel}>Participants ({validParticipants.length})</Text>
            {isFormValid && (
              <View style={styles.splitChip}>
                <Text style={styles.splitChipText}>{splitAmount} XLM each</Text>
              </View>
            )}
          </View>

          {participants.map((participant, i) => (
            <RecipientInput
              key={i}
              index={i}
              value={participant}
              onChangeText={(v) => updateParticipant(i, v)}
              removable={participants.length > 2}
              onRemove={() => removeParticipant(i)}
            />
          ))}

          <Button label="+ Add participant" onPress={addParticipant} variant="outline" />

          <Card>
            <Row left="You pay" right={`${validParticipants.length > 0 ? totalAmount || '0' : '0'} XLM`} />
          </Card>

          <Button
            label="Review & Confirm"
            onPress={goToReview}
            variant={isFormValid ? 'primary' : 'disabled'}
          />
        </View>
      )}

      {activeView === 'review' && (
        <View style={styles.gap}>
          <View style={styles.reviewHeader}>
            <Text style={styles.backButton} onPress={backToSetup}>
              {'<'}
            </Text>
            <SectionTitle text="Confirm Transaction" />
          </View>

          <Card>
            <Text style={styles.cardHeader}>Summary</Text>
            <Row left="Total amount" right={`${totalAmount} XLM`} />
            <Row left="Recipients" right={`${validParticipants.length} people`} />
            <Row
              left="Each receives"
              right={<Text style={styles.upText}>{splitAmount} XLM</Text>}
            />
            <Row
              left="Network"
              right={
                <View style={styles.networkBadge}>
                  <Text style={styles.networkBadgeText}>Stellar Testnet</Text>
                </View>
              }
            />
          </Card>

          <Card>
            <Text style={styles.cardHeader}>Smart Contract</Text>
            <Text style={styles.mutedSmall}>Contract Address</Text>
            <Text style={styles.contractAddress}>{CONTRACT_ADDRESS}</Text>
            <Text style={styles.infoText}>
              Each payment will be recorded on-chain via this contract
            </Text>
          </Card>

          <Card>
            <Text style={styles.cardHeader}>Recipients</Text>
            {validParticipants.map((addr, i) => (
              <View key={i} style={styles.reviewRecipientRow}>
                <View>
                  <Text style={styles.mutedSmall}>#{i + 1}</Text>
                  <Text style={styles.recipientAddress}>
                    {addr.slice(0, 4)}...{addr.slice(-4)}
                  </Text>
                </View>
                <Text style={styles.amountText}>{splitAmount} XLM</Text>
              </View>
            ))}
          </Card>

          <Button
            label={`Confirm & Send ${validParticipants.length} Payment${validParticipants.length > 1 ? 's' : ''}`}
            onPress={sendAllPayments}
          />
        </View>
      )}

      {(activeView === 'sending' || activeView === 'result') && (
        <View style={styles.gap}>
          <SectionTitle
            text={
              activeView === 'sending'
                ? `Processing... (${completedCount}/${transactions.length})`
                : allSuccess
                  ? 'All Payments Sent!'
                  : 'Payment Results'
            }
          />

          {activeView === 'sending' && transactions.length > 0 && (
            <View style={styles.progressTrack}>
              <View
                style={[
                  styles.progressFill,
                  { width: `${(completedCount / transactions.length) * 100}%` },
                ]}
              />
            </View>
          )}

          {allSuccess && (
            <View style={styles.successBanner}>
              <Text style={styles.successTitle}>Successfully sent {totalAmount} XLM</Text>
              <Text style={styles.successSub}>
                to {validParticipants.length} recipient{validParticipants.length > 1 ? 's' : ''} · recorded on-chain
              </Text>
            </View>
          )}

          <Card>
            <Text style={styles.cardHeader}>Transactions</Text>
            {transactions.map((tx, i) => (
              <View key={i} style={styles.txRow}>
                <View style={styles.txRowTop}>
                  <Text style={styles.recipientAddress}>
                    {tx.address.slice(0, 4)}...{tx.address.slice(-4)}
                  </Text>
                  <View style={styles.txStatus}>
                    <View style={[styles.dot, { backgroundColor: phaseColors[tx.phase] }]} />
                    <Text style={[styles.txPhaseText, { color: phaseColors[tx.phase] }]}>
                      {phaseLabels[tx.phase]}
                    </Text>
                  </View>
                </View>
                <Text style={styles.mutedSmall}>{tx.amount} XLM</Text>
                {tx.error && (
                  <View style={styles.errorBox}>
                    <Text style={styles.errorType}>
                      {errorTypeLabels[tx.errorType || 'unknown']}
                    </Text>
                    <Text style={styles.errorMessage}>{tx.error}</Text>
                  </View>
                )}
              </View>
            ))}
          </Card>

          <Button label="Split Another Bill" onPress={backToSetup} />
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
    backgroundColor: colors.canvas,
  },
  content: {
    padding: 16,
    paddingBottom: 32,
  },
  gap: {
    gap: 14,
  },
  fieldLabel: {
    fontSize: 12,
    color: colors.muted,
    fontWeight: '500',
  },
  participantHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  splitChip: {
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.hairline,
    borderRadius: 6,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  splitChipText: {
    color: colors.primary,
    fontSize: 12,
    fontWeight: '600',
  },
  recipientRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  recipientIndex: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: colors.elevated,
    alignItems: 'center',
    justifyContent: 'center',
  },
  recipientIndexText: {
    color: colors.muted,
    fontSize: 11,
    fontWeight: '600',
  },
  recipientInput: {
    flex: 1,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.hairline,
    borderRadius: 6,
    color: colors.body,
    fontSize: 14,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  removeButton: {
    color: colors.muted,
    fontSize: 16,
    padding: 4,
  },
  errorText: {
    color: colors.down,
    fontSize: 12,
    marginTop: 4,
  },
  reviewHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  backButton: {
    color: colors.muted,
    fontSize: 20,
    padding: 4,
  },
  cardHeader: {
    fontSize: 11,
    color: colors.muted,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 8,
  },
  mutedSmall: {
    fontSize: 11,
    color: colors.muted,
  },
  upText: {
    color: colors.up,
    fontWeight: '600',
    fontSize: 14,
  },
  networkBadge: {
    backgroundColor: colors.primarySoft,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  networkBadgeText: {
    color: colors.primary,
    fontSize: 11,
    fontWeight: '600',
  },
  contractAddress: {
    fontSize: 10,
    color: colors.body,
    fontFamily: 'monospace',
    marginTop: 4,
    marginBottom: 6,
  },
  infoText: {
    fontSize: 11,
    color: colors.info,
  },
  reviewRecipientRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.hairline,
  },
  recipientAddress: {
    fontSize: 13,
    color: colors.body,
    marginTop: 2,
  },
  amountText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.body,
  },
  progressTrack: {
    height: 4,
    backgroundColor: colors.elevated,
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: colors.primary,
  },
  successBanner: {
    backgroundColor: colors.upSoft,
    borderWidth: 1,
    borderColor: colors.up,
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
  },
  successTitle: {
    color: colors.up,
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 4,
  },
  successSub: {
    color: colors.muted,
    fontSize: 12,
  },
  txRow: {
    paddingVertical: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.hairline,
  },
  txRowTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 2,
  },
  txStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  txPhaseText: {
    fontSize: 11,
    fontWeight: '600',
  },
  errorBox: {
    marginTop: 6,
  },
  errorType: {
    fontSize: 10,
    fontWeight: '600',
    color: colors.down,
    backgroundColor: colors.downSoft,
    alignSelf: 'flex-start',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 3,
    overflow: 'hidden',
  },
  errorMessage: {
    fontSize: 11,
    color: colors.down,
    marginTop: 3,
  },
});
