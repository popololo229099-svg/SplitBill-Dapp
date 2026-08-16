import { useCallback, useEffect, useState } from 'react';
import { RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useWallet } from '../context/WalletContext';
import { fetchTransactions, type TransactionRecord } from '../lib/api';
import { Button, Card, SectionTitle } from '../components/ui';
import { colors } from '../theme';

const statusColors: Record<string, string> = {
  success: colors.up,
  failed: colors.down,
  pending: colors.primary,
};

const statusLabels: Record<string, string> = {
  success: 'Sent',
  failed: 'Failed',
  pending: 'Pending',
};

export default function HistoryScreen() {
  const { address } = useWallet();
  const [transactions, setTransactions] = useState<TransactionRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    try {
      const data = await fetchTransactions();
      setTransactions(data);
      setError('');
    } catch {
      setError('Could not load history');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function onRefresh() {
    setRefreshing(true);
    await load();
  }

  const myTxs = address
    ? transactions.filter(
        (t) => t.senderAddress === address || t.recipientAddress === address,
      )
    : transactions;

  return (
    <ScrollView
      style={styles.flex}
      contentContainerStyle={styles.content}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.muted} />}
    >
      <SectionTitle text="Transaction History" />

      {loading && <Card><Text style={styles.mutedText}>Loading...</Text></Card>}

      {error && !loading && (
        <Card>
          <Text style={styles.errorText}>{error}</Text>
          <Button label="Retry" onPress={() => { setLoading(true); setError(''); load(); }} style={styles.retryButton} />
        </Card>
      )}

      {!loading && !error && myTxs.length === 0 && (
        <Card style={styles.empty}>
          <Text style={styles.emptyEmoji}>📋</Text>
          <Text style={styles.mutedText}>No transactions yet. Split a bill to get started.</Text>
        </Card>
      )}

      {!loading && !error && myTxs.length > 0 && (
        <Card>
          <Text style={styles.cardHeader}>
            {myTxs.length} transaction{myTxs.length !== 1 ? 's' : ''}
          </Text>
          {myTxs.map((tx) => {
            const isSender = tx.senderAddress === address;
            return (
              <View key={tx.id} style={styles.txRow}>
                <View style={styles.txRowTop}>
                  <Text style={styles.txParty}>
                    {isSender ? 'To' : 'From'}{' '}
                    {isSender
                      ? `${tx.recipientAddress.slice(0, 6)}...${tx.recipientAddress.slice(-4)}`
                      : `${tx.senderAddress.slice(0, 6)}...${tx.senderAddress.slice(-4)}`}
                  </Text>
                  <View style={styles.statusRow}>
                    <View style={[styles.dot, { backgroundColor: statusColors[tx.status] || colors.muted }]} />
                    <Text style={[styles.statusText, { color: statusColors[tx.status] || colors.muted }]}>
                      {statusLabels[tx.status] || tx.status}
                    </Text>
                  </View>
                </View>
                <View style={styles.txRowBottom}>
                  <Text style={[styles.amountText, { color: isSender ? colors.down : colors.up }]}>
                    {isSender ? '-' : '+'}{tx.amount} XLM
                  </Text>
                  <Text style={styles.dateText}>
                    {new Date(tx.createdAt).toLocaleDateString()}{' '}
                    {new Date(tx.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </Text>
                </View>
                {tx.txHash && <Text style={styles.hashText}>{tx.txHash}</Text>}
              </View>
            );
          })}
        </Card>
      )}

      <Button label="Refresh" onPress={() => { setLoading(true); setError(''); load(); }} />
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
    gap: 14,
  },
  cardHeader: {
    fontSize: 11,
    color: colors.muted,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 8,
  },
  mutedText: {
    color: colors.muted,
    fontSize: 13,
    textAlign: 'center',
  },
  errorText: {
    color: colors.down,
    fontSize: 13,
    textAlign: 'center',
    marginBottom: 8,
  },
  retryButton: {
    marginTop: 4,
  },
  empty: {
    alignItems: 'center',
    gap: 8,
    paddingVertical: 24,
  },
  emptyEmoji: {
    fontSize: 28,
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
    marginBottom: 4,
  },
  txParty: {
    fontSize: 13,
    color: colors.body,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '600',
  },
  txRowBottom: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  amountText: {
    fontSize: 13,
    fontWeight: '600',
  },
  dateText: {
    fontSize: 11,
    color: colors.mutedStrong,
  },
  hashText: {
    fontSize: 10,
    color: colors.mutedStrong,
    marginTop: 3,
    fontFamily: 'monospace',
  },
});
