import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { WalletProvider, useWallet } from './src/context/WalletContext';
import LandingScreen from './src/screens/LandingScreen';
import SplitBillScreen from './src/screens/SplitBillScreen';
import HistoryScreen from './src/screens/HistoryScreen';
import EventLogScreen from './src/screens/EventLogScreen';
import { Button, Card } from './src/components/ui';
import { colors } from './src/theme';

type Tab = 'split' | 'history' | 'events';

const tabs: { id: Tab; label: string; requiresWallet: boolean }[] = [
  { id: 'split', label: 'Split Bill', requiresWallet: false },
  { id: 'history', label: 'History', requiresWallet: true },
  { id: 'events', label: 'On-Chain', requiresWallet: true },
];

function AppContent() {
  const { isConnected, address, balance, disconnect } = useWallet();
  const [page, setPage] = useState<'landing' | 'app'>('landing');
  const [activeTab, setActiveTab] = useState<Tab>('split');

  if (page === 'landing') {
    return (
      <>
        <LandingScreen onEnter={() => setPage('app')} />
        <StatusBar style="light" />
      </>
    );
  }

  return (
    <SafeAreaView style={styles.flex} edges={['top', 'left', 'right']}>
      <View style={styles.header}>
        <View style={styles.brandRow}>
          <View style={styles.logo}>
            <Text style={styles.logoText}>SB</Text>
          </View>
          <Text style={styles.brandName}>SplitBill</Text>
          <View style={styles.testnetBadge}>
            <Text style={styles.testnetBadgeText}>TESTNET</Text>
          </View>
        </View>
        {isConnected && (
          <View style={styles.walletCluster}>
            <Text style={styles.walletAddress}>
              {address!.slice(0, 4)}...{address!.slice(-4)}
            </Text>
            <Pressable onPress={disconnect}>
              <Text style={styles.disconnectText}>Disconnect</Text>
            </Pressable>
          </View>
        )}
      </View>

      {!isConnected ? (
        <View style={styles.notConnected}>
          <Card style={styles.notConnectedCard}>
            <Text style={styles.notConnectedEmoji}>💸</Text>
            <Text style={styles.notConnectedTitle}>Wallet disconnected</Text>
            <Text style={styles.notConnectedDesc}>
              Connect your mobile wallet to split bills and send XLM.
            </Text>
            <Button label="Go to Wallet" onPress={() => setPage('landing')} />
          </Card>
        </View>
      ) : (
        <>
          {activeTab === 'split' && <SplitBillScreen />}
          {activeTab === 'history' && <HistoryScreen />}
          {activeTab === 'events' && <EventLogScreen />}
        </>
      )}

      <View style={styles.tabBar}>
        {tabs.map((tab) => {
          const enabled = !tab.requiresWallet || isConnected;
          const active = activeTab === tab.id;
          return (
            <Pressable
              key={tab.id}
              disabled={!enabled}
              onPress={() => setActiveTab(tab.id)}
              style={[styles.tab, !enabled && styles.tabDisabled]}
            >
              <Text style={[styles.tabText, active && styles.tabTextActive]}>
                {tab.label}
              </Text>
              {active && <View style={styles.tabIndicator} />}
            </Pressable>
          );
        })}
      </View>

      <StatusBar style="light" />
    </SafeAreaView>
  );
}

export default function App() {
  return (
    <SafeAreaProvider>
      <WalletProvider>
        <AppContent />
      </WalletProvider>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
    backgroundColor: colors.canvas,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.hairline,
    backgroundColor: colors.canvas,
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  logo: {
    backgroundColor: colors.primary,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  logoText: {
    color: colors.onPrimary,
    fontWeight: '800',
    fontSize: 14,
  },
  brandName: {
    color: colors.body,
    fontSize: 16,
    fontWeight: '700',
  },
  testnetBadge: {
    backgroundColor: colors.card,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  testnetBadgeText: {
    color: colors.muted,
    fontSize: 9,
    fontWeight: '600',
  },
  walletCluster: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  walletAddress: {
    color: colors.body,
    fontSize: 13,
    fontFamily: 'monospace',
  },
  disconnectText: {
    color: colors.muted,
    fontSize: 13,
  },
  notConnected: {
    flex: 1,
    padding: 16,
    justifyContent: 'center',
  },
  notConnectedCard: {
    alignItems: 'center',
    gap: 8,
    paddingVertical: 32,
  },
  notConnectedEmoji: {
    fontSize: 32,
  },
  notConnectedTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.body,
  },
  notConnectedDesc: {
    fontSize: 13,
    color: colors.muted,
    textAlign: 'center',
    marginBottom: 8,
  },
  tabBar: {
    flexDirection: 'row',
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.hairline,
    backgroundColor: colors.canvas,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 12,
    position: 'relative',
  },
  tabDisabled: {
    opacity: 0.4,
  },
  tabText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.muted,
  },
  tabTextActive: {
    color: colors.primary,
  },
  tabIndicator: {
    position: 'absolute',
    top: 0,
    height: 2,
    width: 32,
    backgroundColor: colors.primary,
    borderBottomLeftRadius: 2,
    borderBottomRightRadius: 2,
  },
});
