import { useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useWallet } from '../context/WalletContext';
import { Button, Card, Field } from '../components/ui';
import { colors } from '../theme';

interface Props {
  onEnter: () => void;
}

export default function LandingScreen({ onEnter }: Props) {
  const { isConnected, isConnecting, balance, createWallet, importWallet, error, clearError } = useWallet();
  const [showImport, setShowImport] = useState(false);
  const [secretKey, setSecretKey] = useState('');

  async function handleCreate() {
    clearError();
    await createWallet();
  }

  async function handleImport() {
    clearError();
    await importWallet(secretKey);
  }

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
        <View style={styles.logoRow}>
          <View style={styles.logo}>
            <Text style={styles.logoText}>SB</Text>
          </View>
          <View style={styles.badges}>
            <View style={styles.badge}>
              <Text style={styles.badgeText}>TESTNET</Text>
            </View>
            <View style={[styles.badge, styles.badgeInfo]}>
              <Text style={[styles.badgeText, styles.badgeTextInfo]}>CONTRACT</Text>
            </View>
          </View>
        </View>

        <Text style={styles.title}>SplitBill</Text>
        <Text style={styles.subtitle}>
          Split bills with anyone on the Stellar network. Every payment is recorded on-chain via a
          Soroban smart contract.
        </Text>

        {isConnected ? (
          <Card style={styles.connectedCard}>
            <View style={styles.connectedRow}>
              <View>
                <Text style={styles.connectedLabel}>Wallet Balance</Text>
                <Text style={styles.connectedBalance}>
                  {balance === null ? '—' : parseFloat(balance).toFixed(2)}
                  <Text style={styles.connectedUnit}> XLM</Text>
                </Text>
              </View>
              <Button label="Enter SplitBill" onPress={onEnter} />
            </View>
          </Card>
        ) : (
          <Card style={styles.walletCard}>
            <Text style={styles.walletTitle}>Create your mobile wallet</Text>
            <Text style={styles.walletDesc}>
              A self-custody Stellar keypair is generated on your device and stored in the secure
              enclave. Your funds and keys never leave your phone.
            </Text>
            <Button
              label="Create Mobile Wallet"
              onPress={handleCreate}
              loading={isConnecting}
            />
            <Button
              label={showImport ? 'Cancel Import' : 'Import Existing Key'}
              onPress={() => {
                clearError();
                setShowImport((s) => !s);
              }}
              variant="outline"
              style={styles.importToggle}
            />
            {showImport && (
              <View style={styles.importBox}>
                <Field
                  label="Secret Key (S...)"
                  value={secretKey}
                  onChangeText={setSecretKey}
                  placeholder="Paste your Stellar secret key"
                  autoCapitalize="none"
                  autoCorrect={false}
                  secureTextEntry
                />
                <Button
                  label="Import Wallet"
                  onPress={handleImport}
                  loading={isConnecting}
                  variant={secretKey.trim() ? 'primary' : 'disabled'}
                />
              </View>
            )}
            {error ? <Text style={styles.error}>{error}</Text> : null}
          </Card>
        )}

        <Text style={styles.footnote}>
          Non-custodial · Open source · On-chain
        </Text>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
    backgroundColor: colors.canvas,
  },
  container: {
    flexGrow: 1,
    padding: 24,
    justifyContent: 'center',
  },
  logoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 32,
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
    fontSize: 18,
  },
  badges: {
    flexDirection: 'row',
    gap: 6,
  },
  badge: {
    backgroundColor: colors.primarySoft,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  badgeText: {
    color: colors.primary,
    fontSize: 10,
    fontWeight: '600',
  },
  badgeInfo: {
    backgroundColor: colors.infoSoft,
  },
  badgeTextInfo: {
    color: colors.info,
  },
  title: {
    fontSize: 40,
    fontWeight: '700',
    color: colors.body,
    letterSpacing: -0.5,
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 15,
    color: colors.muted,
    lineHeight: 22,
    marginBottom: 32,
  },
  walletCard: {
    gap: 12,
  },
  walletTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.body,
  },
  walletDesc: {
    fontSize: 13,
    color: colors.muted,
    lineHeight: 19,
    marginBottom: 4,
  },
  importToggle: {
    marginTop: 4,
  },
  importBox: {
    gap: 12,
  },
  connectedCard: {
    gap: 12,
  },
  connectedRow: {
    gap: 16,
  },
  connectedLabel: {
    fontSize: 11,
    color: colors.muted,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  connectedBalance: {
    fontSize: 26,
    fontWeight: '700',
    color: colors.body,
  },
  connectedUnit: {
    fontSize: 13,
    fontWeight: '400',
    color: colors.muted,
  },
  error: {
    color: colors.down,
    fontSize: 13,
    marginTop: 4,
  },
  footnote: {
    marginTop: 40,
    textAlign: 'center',
    fontSize: 12,
    color: colors.muted,
  },
});
