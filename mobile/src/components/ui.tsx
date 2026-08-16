import { ActivityIndicator, Pressable, StyleSheet, Text, TextInput, View, type StyleProp, type TextInputProps, type ViewStyle } from 'react-native';
import { colors, radii } from '../theme';

interface ButtonProps {
  label: string;
  onPress: () => void;
  variant?: 'primary' | 'outline' | 'disabled';
  loading?: boolean;
  style?: StyleProp<ViewStyle>;
}

export function Button({ label, onPress, variant = 'primary', loading, style }: ButtonProps) {
  const disabled = variant === 'disabled' || loading;
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={({ pressed }) => [
        styles.button,
        variant === 'primary' && styles.buttonPrimary,
        variant === 'primary' && pressed && styles.buttonPrimaryPressed,
        variant === 'outline' && styles.buttonOutline,
        variant === 'disabled' && styles.buttonDisabled,
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={variant === 'outline' ? colors.body : colors.onPrimary} />
      ) : (
        <Text
          style={[
            styles.buttonLabel,
            variant === 'primary' && styles.buttonLabelPrimary,
            variant === 'outline' && styles.buttonLabelOutline,
            variant === 'disabled' && styles.buttonLabelDisabled,
          ]}
        >
          {label}
        </Text>
      )}
    </Pressable>
  );
}

export function Card({ children, style }: { children: React.ReactNode; style?: StyleProp<ViewStyle> }) {
  return <View style={[styles.card, style]}>{children}</View>;
}

export function Field({ label, ...props }: TextInputProps & { label: string }) {
  return (
    <View style={styles.field}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <TextInput
        placeholderTextColor={colors.muted}
        style={styles.input}
        {...props}
      />
    </View>
  );
}

export function Badge({ text, tone = 'primary' }: { text: string; tone?: 'primary' | 'info' | 'muted' }) {
  const toneStyle =
    tone === 'info'
      ? { background: colors.infoSoft, color: colors.info }
      : tone === 'muted'
        ? { background: colors.elevated, color: colors.muted }
        : { background: colors.primarySoft, color: colors.primary };
  return (
    <View style={[styles.badge, { backgroundColor: toneStyle.background }]}>
      <Text style={[styles.badgeText, { color: toneStyle.color }]}>{text}</Text>
    </View>
  );
}

export function SectionTitle({ text }: { text: string }) {
  return (
    <Text style={styles.sectionTitle}>{text}</Text>
  );
}

export function Row({ left, right }: { left: React.ReactNode; right: React.ReactNode }) {
  return (
    <View style={styles.row}>
      <Text style={styles.rowLeft}>{left}</Text>
      {typeof right === 'string' ? <Text style={styles.rowRight}>{right}</Text> : right}
    </View>
  );
}

const styles = StyleSheet.create({
  button: {
    height: 48,
    borderRadius: radii.sm,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
  },
  buttonPrimary: {
    backgroundColor: colors.primary,
  },
  buttonPrimaryPressed: {
    backgroundColor: colors.primaryActive,
  },
  buttonOutline: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: colors.elevated,
  },
  buttonDisabled: {
    backgroundColor: colors.primaryDisabled,
  },
  buttonLabel: {
    fontSize: 14,
    fontWeight: '700',
  },
  buttonLabelPrimary: {
    color: colors.onPrimary,
  },
  buttonLabelOutline: {
    color: colors.body,
  },
  buttonLabelDisabled: {
    color: colors.muted,
  },
  card: {
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.hairline,
    borderRadius: radii.md,
    padding: 16,
  },
  field: {
    marginBottom: 14,
  },
  fieldLabel: {
    fontSize: 12,
    color: colors.muted,
    marginBottom: 6,
    fontWeight: '500',
  },
  input: {
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.hairline,
    borderRadius: radii.sm,
    color: colors.body,
    fontSize: 14,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: radii.sm,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '600',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.body,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  rowLeft: {
    fontSize: 13,
    color: colors.muted,
  },
  rowRight: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.body,
  },
});
