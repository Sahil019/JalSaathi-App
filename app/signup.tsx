import React, { useState, useRef } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Dimensions,
  StatusBar,
} from 'react-native';
import { useRouter } from 'expo-router';
import { ArrowLeft } from 'lucide-react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  withSequence,
  withDelay,
  FadeInDown,
  FadeInUp,
  interpolate,
  Extrapolation,
} from 'react-native-reanimated';

import { authService } from '@/services/authService';

const { width: W, height: H } = Dimensions.get('window');

const JAL_BLUE = '#0EA5E9';
const JAL_BLUE_DARK = '#0369A1';
const OFF_WHITE = '#F8FAFC';
const CARD_BG = '#FFFFFF';
const MUTED = '#64748B';
const BORDER = '#E2E8F0';
const DARK = '#0F172A';

// ─── Floating decorative pin blobs in the background ─────────────────────────

const BG_BLOBS = [
  { top: -40, left: -40, size: 180, opacity: 0.12, delay: 0 },
  { top: 60, right: -60, size: 140, opacity: 0.15, delay: 100 },
  { top: H * 0.25, left: -30, size: 100, opacity: 0.1, delay: 200 },
  { top: H * 0.55, right: -20, size: 160, opacity: 0.12, delay: 150 },
];

// ─── Animated Field ────────────────────────────────────────────────────────────

interface FieldProps {
  label: string;
  placeholder: string;
  value: string;
  onChangeText: (t: string) => void;
  icon: string;
  keyboardType?: any;
  autoCapitalize?: any;
  secureTextEntry?: boolean;
  enteringDelay?: number;
}

const AnimatedField = ({
  label,
  placeholder,
  value,
  onChangeText,
  icon,
  keyboardType = 'default',
  autoCapitalize = 'sentences',
  secureTextEntry = false,
  enteringDelay = 0,
}: FieldProps) => {
  const focused = useSharedValue(0);
  const labelY = useSharedValue(value ? -22 : 0);
  const labelScale = useSharedValue(value ? 0.78 : 1);

  const containerAnim = useAnimatedStyle(() => ({
    borderColor: focused.value === 1
      ? JAL_BLUE
      : BORDER,
    shadowOpacity: interpolate(focused.value, [0, 1], [0, 0.12], Extrapolation.CLAMP),
    shadowRadius: interpolate(focused.value, [0, 1], [0, 10], Extrapolation.CLAMP),
  }));

  const floatLabelAnim = useAnimatedStyle(() => ({
    transform: [
      { translateY: labelY.value },
      { scale: labelScale.value },
    ],
    color: focused.value === 1 ? JAL_BLUE : MUTED,
  }));

  const iconAnim = useAnimatedStyle(() => ({
    transform: [{ scale: interpolate(focused.value, [0, 1], [1, 1.15], Extrapolation.CLAMP) }],
    opacity: interpolate(focused.value, [0, 1], [0.45, 1], Extrapolation.CLAMP),
  }));

  const handleFocus = () => {
    focused.value = withTiming(1, { duration: 200 });
    labelY.value = withSpring(-22, { damping: 14 });
    labelScale.value = withSpring(0.78, { damping: 14 });
  };

  const handleBlur = () => {
    focused.value = withTiming(0, { duration: 200 });
    if (!value) {
      labelY.value = withSpring(0, { damping: 14 });
      labelScale.value = withSpring(1, { damping: 14 });
    }
  };

  return (
    <Animated.View entering={FadeInDown.delay(enteringDelay).springify()}>
      <Animated.View style={[styles.fieldWrapper, containerAnim]}>
        {/* Floating label */}
        <Animated.Text style={[styles.floatLabel, floatLabelAnim]}>
          {label}
        </Animated.Text>

        {/* Icon */}
        <Animated.Text style={[styles.fieldIcon, iconAnim]}>{icon}</Animated.Text>

        {/* Input */}
        <TextInput
          style={styles.fieldInput}
          placeholder={value ? '' : placeholder}
          placeholderTextColor="transparent"
          value={value}
          onChangeText={onChangeText}
          onFocus={handleFocus}
          onBlur={handleBlur}
          keyboardType={keyboardType}
          autoCapitalize={autoCapitalize}
          secureTextEntry={secureTextEntry}
        />

        {/* Active bottom bar */}
        <Animated.View
          style={[
            styles.fieldBar,
            useAnimatedStyle(() => ({
              width: `${interpolate(focused.value, [0, 1], [0, 100], Extrapolation.CLAMP)}%`,
            })),
          ]}
        />
      </Animated.View>
    </Animated.View>
  );
};

// ─── Main Screen ──────────────────────────────────────────────────────────────

export default function SignupScreen() {
  const router = useRouter();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [role, setRole] = useState<'consumer' | 'admin'>('consumer');
  const [businessName, setBusinessName] = useState('');
  const [success, setSuccess] = useState(false);


  // Button press animation
  const btnScale = useSharedValue(1);
  const btnAnim = useAnimatedStyle(() => ({ transform: [{ scale: btnScale.value }] }));

  // Shake animation for error
  const shakeX = useSharedValue(0);
  const shakeAnim = useAnimatedStyle(() => ({ transform: [{ translateX: shakeX.value }] }));

  const triggerShake = () => {
    shakeX.value = withSequence(
      withTiming(-10, { duration: 60 }),
      withTiming(10, { duration: 60 }),
      withTiming(-8, { duration: 60 }),
      withTiming(8, { duration: 60 }),
      withTiming(0, { duration: 60 }),
    );
  };

  const handleSignup = async () => {
    if (!name || !email || !phone || !password) {
      setError('Please fill all fields');
      triggerShake();
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      triggerShake();
      return;
    }

    btnScale.value = withSequence(withSpring(0.94), withSpring(1));
    setLoading(true);
    setError('');
    try {
      await authService.register({ name, email, phone, password, role, businessName });
      setSuccess(true);
      setTimeout(() => {
        router.replace('/');
      }, 1200);
    } catch (err: any) {
      setError(err.message || 'Registration failed');
      triggerShake();
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.root}
    >
      <StatusBar barStyle="dark-content" backgroundColor={OFF_WHITE} />

      {/* ── Decorative blobs ── */}
      {BG_BLOBS.map((b, i) => (
        <View
          key={i}
          style={[
            styles.blob,
            {
              width: b.size,
              height: b.size,
              borderRadius: b.size / 2,
              opacity: b.opacity,
              top: b.top,
              left: (b as any).left,
              right: (b as any).right,
            },
          ]}
        />
      ))}

      {/* ── Diagonal accent strip ── */}
      <View style={styles.accentStrip} />

      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Back button */}
        <Animated.View entering={FadeInDown.delay(0).springify()} style={styles.backRow}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn} activeOpacity={0.7}>
            <ArrowLeft size={18} color={JAL_BLUE} />
            <Text style={styles.backText}>Back</Text>
          </TouchableOpacity>
        </Animated.View>

        {/* ── Logo + heading ── */}
        <Animated.View entering={FadeInDown.delay(60).springify()} style={styles.logoRow}>
          <View style={styles.logoBox}>
            <Text style={styles.logoP}>💧</Text>
          </View>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(100).springify()}>
          <Text style={styles.heading}>Create your{'\n'}account.</Text>
          <Text style={styles.subheading}>Join the JalSaathi community</Text>
        </Animated.View>

        {/* ── Error banner ── */}
        {error ? (
          <Animated.View style={[styles.errorBanner, shakeAnim]} entering={FadeInDown.springify()}>
            <Text style={styles.errorBannerIcon}>⚠️</Text>
            <Text style={styles.errorBannerText}>{error}</Text>
          </Animated.View>
        ) : null}

        {/* ── Success ── */}
        {success && (
          <Animated.View style={styles.successBanner} entering={FadeInDown.springify()}>
            <Text style={styles.successText}>🎉 Account created! Redirecting…</Text>
          </Animated.View>
        )}

        {/* ── Role Selector ── */}
        <Animated.View entering={FadeInDown.delay(120).springify()} style={styles.roleContainer}>
          <TouchableOpacity 
            style={[styles.roleBtn, role === 'consumer' && { backgroundColor: JAL_BLUE }]}
            onPress={() => setRole('consumer')}
          >
            <Text style={[styles.roleBtnText, role === 'consumer' && { color: 'white' }]}>I'm a User</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.roleBtn, role === 'admin' && { backgroundColor: JAL_BLUE }]}
            onPress={() => setRole('admin')}
          >
            <Text style={[styles.roleBtnText, role === 'admin' && { color: 'white' }]}>I'm a Partner</Text>
          </TouchableOpacity>
        </Animated.View>

        {/* ── Form card ── */}
        <Animated.View entering={FadeInUp.delay(140).springify()} style={styles.card}>
          {role === 'admin' && (
            <AnimatedField
              label="Business Name"
              placeholder="e.g. Ganga Water Services"
              value={businessName}
              onChangeText={setBusinessName}
              icon="🏢"
              enteringDelay={160}
            />
          )}
          <AnimatedField
            label="Full Name"
            placeholder="Your full name"
            value={name}
            onChangeText={setName}
            icon="👤"
            enteringDelay={180}
          />
          <AnimatedField
            label="Email Address"
            placeholder="you@email.com"
            value={email}
            onChangeText={setEmail}
            icon="✉️"
            keyboardType="email-address"
            autoCapitalize="none"
            enteringDelay={220}
          />
          <AnimatedField
            label="Phone Number"
            placeholder="+91 XXXXX XXXXX"
            value={phone}
            onChangeText={setPhone}
            icon="📱"
            keyboardType="phone-pad"
            autoCapitalize="none"
            enteringDelay={260}
          />
          <AnimatedField
            label="Password"
            placeholder="Min. 8 characters"
            value={password}
            onChangeText={setPassword}
            icon="🔒"
            secureTextEntry
            enteringDelay={300}
          />
          <AnimatedField
            label="Confirm Password"
            placeholder="Repeat password"
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            icon="🔑"
            secureTextEntry
            enteringDelay={340}
          />
        </Animated.View>

        {/* ── CTA Button ── */}
        <Animated.View entering={FadeInDown.delay(400).springify()} style={btnAnim}>
          <TouchableOpacity
            style={[styles.cta, loading && styles.ctaLoading]}
            onPress={handleSignup}
            activeOpacity={0.88}
            disabled={loading}
            onPressIn={() => { btnScale.value = withSpring(0.96); }}
            onPressOut={() => { btnScale.value = withSpring(1); }}
          >
            {/* Glossy inner highlight */}
            <View style={styles.ctaGloss} />
            <Text style={styles.ctaText}>
              {loading ? 'Creating account…' : success ? '✓ Done!' : 'Create Account'}
            </Text>
          </TouchableOpacity>
        </Animated.View>

        {/* ── Divider ── */}
        <Animated.View entering={FadeInDown.delay(440).springify()} style={styles.dividerRow}>
          <View style={styles.dividerLine} />
          <Text style={styles.dividerText}>or</Text>
          <View style={styles.dividerLine} />
        </Animated.View>

        {/* ── Login link ── */}
        <Animated.View entering={FadeInDown.delay(480).springify()} style={styles.loginRow}>
          <Text style={styles.loginText}>Already have an account?</Text>
          <TouchableOpacity onPress={() => router.replace('/')} activeOpacity={0.7}>
            <Text style={styles.loginLink}> Log in</Text>
          </TouchableOpacity>
        </Animated.View>

        {/* ── Terms ── */}
        <Animated.View entering={FadeInDown.delay(520).springify()}>
          <Text style={styles.terms}>
            By signing up, you agree to our{' '}
            <Text style={styles.termsLink}>Terms of Service</Text>
            {' '}and{' '}
            <Text style={styles.termsLink}>Privacy Policy</Text>
          </Text>
        </Animated.View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: OFF_WHITE,
  },

  // Blobs
  blob: {
    position: 'absolute',
    backgroundColor: JAL_BLUE,
  },

  // Diagonal strip
  accentStrip: {
    position: 'absolute',
    top: -80,
    right: -120,
    width: 320,
    height: 320,
    borderRadius: 60,
    backgroundColor: JAL_BLUE,
    opacity: 0.04,
    transform: [{ rotate: '30deg' }],
  },

  scroll: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingTop: Platform.OS === 'android' ? (StatusBar.currentHeight ?? 0) + 16 : 56,
    paddingBottom: 48,
  },

  // Back
  backRow: { marginBottom: 24 },
  backBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: '#fff',
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 8,
    gap: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
    borderWidth: 1,
    borderColor: BORDER,
  },
  backText: { fontSize: 13, fontWeight: '600', color: JAL_BLUE },

  // Logo
  logoRow: { marginBottom: 20 },
  logoBox: { flexDirection: 'row', alignItems: 'flex-start', alignSelf: 'flex-start' },
  logoP: {
    color: JAL_BLUE,
    fontSize: 42,
    fontWeight: '900',
    lineHeight: 46,
  },
  logoDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: JAL_BLUE,
    marginTop: 4,
    marginLeft: 2,
  },

  // Headings
  heading: {
    fontSize: 36,
    fontWeight: '900',
    color: DARK,
    letterSpacing: -1.5,
    lineHeight: 42,
    marginBottom: 8,
  },
  subheading: {
    fontSize: 15,
    color: MUTED,
    fontWeight: '500',
    marginBottom: 28,
  },

  // Error / Success
  errorBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF0F1',
    borderRadius: 14,
    padding: 14,
    marginBottom: 16,
    borderLeftWidth: 4,
    borderLeftColor: JAL_BLUE,
    gap: 10,
  },
  errorBannerIcon: { fontSize: 16 },
  errorBannerText: { flex: 1, fontSize: 13, color: '#CC0020', fontWeight: '600' },

  successBanner: {
    backgroundColor: '#F0FFF4',
    borderRadius: 14,
    padding: 14,
    marginBottom: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#10B981',
    alignItems: 'center',
  },
  successText: { fontSize: 14, color: '#166534', fontWeight: '700' },

  // Form card
  card: {
    backgroundColor: CARD_BG,
    borderRadius: 28,
    padding: 20,
    gap: 4,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.07,
    shadowRadius: 24,
    elevation: 4,
    borderWidth: 1,
    borderColor: BORDER,
  },

  // Field
  fieldWrapper: {
    position: 'relative',
    borderWidth: 1.5,
    borderColor: BORDER,
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingTop: 22,
    paddingBottom: 10,
    marginBottom: 12,
    backgroundColor: '#FAFAFA',
    shadowColor: JAL_BLUE,
    shadowOffset: { width: 0, height: 0 },
    elevation: 0,
  },
  floatLabel: {
    position: 'absolute',
    left: 44,
    top: 17,
    fontSize: 15,
    fontWeight: '500',
    transformOrigin: 'left center',
  },
  fieldIcon: {
    position: 'absolute',
    left: 14,
    top: 14,
    fontSize: 17,
  },
  fieldInput: {
    fontSize: 15,
    color: DARK,
    fontWeight: '500',
    paddingLeft: 28,
    paddingTop: 2,
    minHeight: 28,
  },
  fieldBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    height: 2.5,
    backgroundColor: JAL_BLUE,
    borderBottomLeftRadius: 16,
    borderBottomRightRadius: 16,
  },

  // CTA
  cta: {
    height: 60,
    borderRadius: 20,
    backgroundColor: JAL_BLUE,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
    overflow: 'hidden',
    shadowColor: JAL_BLUE,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 8,
  },
  ctaLoading: { opacity: 0.75 },
  ctaGloss: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '50%',
    backgroundColor: 'rgba(255,255,255,0.12)',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  ctaText: {
    fontSize: 17,
    fontWeight: '800',
    color: '#fff',
    letterSpacing: 0.3,
  },

  roleContainer: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 6,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    gap: 6,
  },
  roleBtn: {
    flex: 1,
    height: 44,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  roleBtnText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#64748B',
  },

  // Divider
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 20,
  },
  dividerLine: { flex: 1, height: 1, backgroundColor: BORDER },
  dividerText: { fontSize: 13, color: MUTED, fontWeight: '600' },

  // Login
  loginRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  loginText: { fontSize: 14, color: MUTED, fontWeight: '500' },
  loginLink: { fontSize: 14, color: JAL_BLUE, fontWeight: '800' },

  // Terms
  terms: {
    fontSize: 12,
    color: MUTED,
    textAlign: 'center',
    lineHeight: 18,
  },
  termsLink: { color: JAL_BLUE, fontWeight: '600' },
});