import { useCallback, useEffect, useState } from 'react';
import { RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native';
import { getSplits, getTotalSplits, CONTRACT_ADDRESS, type SplitRecord } from '../lib/stellar';
import { Button, Card, SectionTitle } from '../components/ui';
import { colors } from '../theme';

export default function EventLogScreen() {
  const [splits, setSplits] = useState<SplitRecord[]>([]);
  const [total, setTotal] = useState(0n);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');

  const fetchSplits = useCallback(async () => {
    try {
      const [totalSplits, recentSplits] = await Promise.all([getTotalSplits(), getSplits(0, 20)]);
      setTotal(totalSplits);
      setSplits(recentSplits);
      setError('');
    } catch {
      setError('Failed to load on-chain records');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchSplits();
    const interval = setInterval(fetchSplits, 15000);
    return () => clearInterval(interval);
  }, [fetchSplits]);

  async function onRefresh() {
    setRefreshing(true);
    await fetchSplits();
  }

  return (
    <ScrollView
      style={styles.flex}
      contentContainerStyle={styles.content}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.muted} />}
    >
      <View style={styles.headerRow}>
        <SectionTitle text="On-Chain Event Log" />
        <View style={styles.totalBadge}>
          <Text style={styles.totalText}>{total.toString()} total</Text>
        </View>
      </View>

      <Card>
        <Text style={styles.cardHeader}>Contract</Text>
        <Text style={styles.contractAddress}>{CONTRACT_ADDRESS}</Text>

        {loading && <Text style={styles.mutedText}>Loading...</Text>}

        {error && !loading && <Text style={styles.errorText}>{error}</Text>}

        {!loading && !error && splits.length === 0 && (
          <Text style={styles.mutedText}>
            No on-chain records yet. Split a bill to create the first record.
          </Text>
        )}

        {!loading && !error && splits.length > 0 && (
          <>
            <Text style={[styles.cardHeader, styles.recentHeader]}>Recent Records</Text>
            {splits.map((split) => (
              <View key={Number(split.id)} style={styles.splitRow}>
                <View style={styles.splitRowTop}>
                  <View style={styles.splitIdentity}>
                    <View style={styles.idBadge}>
                      <Text style={styles.idBadgeText}>#{split.id.toString()}</Text>
                    </View>
                    <Text style={styles.addressText}>
                      {String(split.sender).slice(0, 6)}...{String(split.sender).slice(-4)}
                    </Text>
                    <Text style={styles.arrow}>→</Text>
                    <Text style={styles.addressText}>
                      {String(split.recipient).slice(0, 6)}...{String(split.recipient).slice(-4)}
                    </Text>
                  </View>
                  <Text style={styles.amountText}>{split.amount} XLM</Text>
                </View>
                <Text style={styles.dateText}>
                  {new Date(Number(split.timestamp) * 1000).toLocaleString()}
                </Text>
              </View>
            ))}
          </>
        )}
      </Card>

      <Button label="Refresh Records" onPress={() => { setLoading(true); setError(''); fetchSplits(); }} />
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
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  totalBadge: {
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.hairline,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
  },
  totalText: {
    color: colors.muted,
    fontSize: 12,
  },
  cardHeader: {
    fontSize: 11,
    color: colors.muted,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 8,
  },
  recentHeader: {
    marginTop: 12,
  },
  contractAddress: {
    fontSize: 10,
    color: colors.mutedStrong,
    fontFamily: 'monospace',
    marginBottom: 8,
  },
  mutedText: {
    color: colors.muted,
    fontSize: 13,
    textAlign: 'center',
    paddingVertical: 16,
  },
  errorText: {
    color: colors.down,
    fontSize: 13,
    textAlign: 'center',
    paddingVertical: 16,
  },
  splitRow: {
    paddingVertical: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.hairline,
  },
  splitRowTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  splitIdentity: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  idBadge: {
    backgroundColor: colors.primary,
    paddingHorizontal: 5,
    paddingVertical: 1,
    borderRadius: 3,
  },
  idBadgeText: {
    color: colors.onPrimary,
    fontSize: 10,
    fontWeight: '600',
  },
  addressText: {
    fontSize: 12,
    color: colors.body,
  },
  arrow: {
    fontSize: 11,
    color: colors.muted,
  },
  amountText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.up,
  },
  dateText: {
    fontSize: 10,
    color: colors.mutedStrong,
  },
});
