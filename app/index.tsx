import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Dimensions,
  StatusBar,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Mail, Lock, ArrowRight } from 'lucide-react-native';
import { useAuth } from '@/context/AuthContext';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  withSequence,
  withSpring,
  FadeInDown,
  FadeInUp,
  interpolate,
  Extrapolation,
} from 'react-native-reanimated';

const { width: W, height: H } = Dimensions.get('window');

// ─── Colors ───────────────────────────────────────────────────────────────────
const C = {
  bg:       '#020617',
  border:   'rgba(255,255,255,0.10)',
  blue:     '#0EA5E9',
  blueMid:  '#38BDF8',
  blueGlow: 'rgba(14,165,233,0.35)',
  white:    '#FFFFFF',
  muted:    'rgba(255,255,255,0.45)',
  error:    '#F87171',
  success:  '#4ADE80',
};

// ─── Demo roles ───────────────────────────────────────────────────────────────
const ROLES = [
  { key: 'consumer',    label: 'Consumer', emoji: '🛒', color: '#0EA5E9' },
  { key: 'vendor',      label: 'Vendor',   emoji: '🏢',  color: '#10B981' },
  { key: 'admin',       label: 'Admin',    emoji: '⚙️',  color: '#8B5CF6' },
  { key: 'delivery_boy',label: 'Delivery', emoji: '🚴', color: '#F59E0B' },
  { key: 'superadmin',  label: 'Super',    emoji: '👑', color: '#EC4899' },
];

// ─── Animated orb background ─────────────────────────────────────────────────
const Orb = ({ color, size, ix, iy, dx, dy, dur }: {
  color: string; size: number;
  ix: number; iy: number; dx: number; dy: number; dur: number;
}) => {
  const x = useSharedValue(ix);
  const y = useSharedValue(iy);
  const s = useSharedValue(1);

  useEffect(() => {
    x.value = withRepeat(withTiming(ix + dx, { duration: dur }), -1, true);
    y.value = withRepeat(withTiming(iy + dy, { duration: dur * 1.2 }), -1, true);
    s.value = withRepeat(withTiming(1.4, { duration: dur * 0.85 }), -1, true);
  }, []);

  const anim = useAnimatedStyle(() => ({
    transform: [{ translateX: x.value }, { translateY: y.value }, { scale: s.value }],
  }));

  return (
    <Animated.View style={[{
      position: 'absolute', width: size, height: size,
      borderRadius: size / 2, backgroundColor: color, opacity: 0.18,
    }, anim]} />
  );
};

// ─── Input field ──────────────────────────────────────────────────────────────
interface FieldProps {
  icon: React.ReactNode;
  placeholder: string;
  value: string;
  onChangeText: (t: string) => void;
  secureTextEntry?: boolean;
  keyboardType?: any;
  autoCapitalize?: any;
  rightEl?: React.ReactNode;
  delay?: number;
}

const Field = ({ icon, placeholder, value, onChangeText,
  secureTextEntry = false, keyboardType = 'default',
  autoCapitalize = 'none', rightEl, delay = 0 }: FieldProps) => {
  const focused = useSharedValue(0);

  const wrapAnim = useAnimatedStyle(() => ({
    borderColor: `rgba(14,165,233,${interpolate(focused.value, [0, 1], [0.15, 0.8], Extrapolation.CLAMP)})`,
    backgroundColor: `rgba(255,255,255,${interpolate(focused.value, [0, 1], [0.04, 0.09], Extrapolation.CLAMP)})`,
  }));

  return (
    <Animated.View entering={FadeInDown.delay(delay).springify()}>
      <Animated.View style={[styles.fieldWrap, wrapAnim]}>
        <View style={styles.fieldIcon}>{icon}</View>
        <TextInput
          style={styles.fieldInput}
          placeholder={placeholder}
          placeholderTextColor={C.muted}
          value={value}
          onChangeText={onChangeText}
          secureTextEntry={secureTextEntry}
          keyboardType={keyboardType}
          autoCapitalize={autoCapitalize}
          onFocus={() => { focused.value = withTiming(1, { duration: 180 }); }}
          onBlur={()  => { focused.value = withTiming(0, { duration: 180 }); }}
        />
        {rightEl && <View style={styles.fieldRight}>{rightEl}</View>}
      </Animated.View>
    </Animated.View>
  );
};

// ─── Role chip ────────────────────────────────────────────────────────────────
const RoleChip = ({ role, onPress, isLoading }: {
  role: typeof ROLES[0]; onPress: () => void; isLoading: boolean;
}) => {
  const sc = useSharedValue(1);
  const anim = useAnimatedStyle(() => ({ transform: [{ scale: sc.value }] }));

  return (
    <Animated.View style={anim}>
      <TouchableOpacity
        style={[styles.roleChip, { borderColor: role.color + '55', opacity: isLoading ? 0.6 : 1 }]}
        onPress={onPress}
        activeOpacity={0.8}
        disabled={isLoading}
        onPressIn={() => { sc.value = withSpring(0.90); }}
        onPressOut={() => { sc.value = withSpring(1); }}
      >
        <LinearGradient
          colors={[role.color + '25', role.color + '08']}
          style={styles.roleInner}
        >
          <Text style={styles.roleEmoji}>{isLoading ? '⏳' : role.emoji}</Text>
          <Text style={[styles.roleText, { color: role.color }]}>{role.label}</Text>
        </LinearGradient>
      </TouchableOpacity>
    </Animated.View>
  );
};

// ─── Screen ───────────────────────────────────────────────────────────────────
export default function LoginScreen() {
  const router = useRouter();
  const { signIn, demoSignIn } = useAuth();

  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [error, setError]       = useState('');
  const [loading, setLoading]   = useState(false);
  const [success, setSuccess]   = useState(false);
  const [demoRole, setDemoRole] = useState<string | null>(null);

  const btnScale = useSharedValue(1);
  const btnAnim  = useAnimatedStyle(() => ({ transform: [{ scale: btnScale.value }] }));
  const shakeX   = useSharedValue(0);
  const shakeAnim = useAnimatedStyle(() => ({ transform: [{ translateX: shakeX.value }] }));
  const logoY    = useSharedValue(0);

  useEffect(() => {
    logoY.value = withRepeat(
      withSequence(withTiming(-7, { duration: 2200 }), withTiming(0, { duration: 2200 })),
      -1, true
    );
  }, []);
  const logoAnim = useAnimatedStyle(() => ({ transform: [{ translateY: logoY.value }] }));

  const shake = () => {
    shakeX.value = withSequence(
      withTiming(-11, { duration: 55 }), withTiming(11, { duration: 55 }),
      withTiming(-7,  { duration: 55 }), withTiming(7,  { duration: 55 }),
      withTiming(0,   { duration: 55 }),
    );
  };

  const handleLogin = async () => {
    if (!email || !password) { setError('Please enter email and password'); shake(); return; }
    btnScale.value = withSequence(withSpring(0.93), withSpring(1));
    setLoading(true); setError('');
    try {
      await signIn(email, password);
      setSuccess(true);
    } catch (e: any) {
      setError(e.message || 'Login failed'); shake();
    } finally { setLoading(false); }
  };

  const handleDemo = async (role: string) => {
    setDemoRole(role); setError('');
    try { await demoSignIn(role); }
    catch (e: any) { setError(e.message || 'Demo login failed'); shake(); }
    finally { setDemoRole(null); }
  };

  return (
    <View style={styles.root}>
      <StatusBar barStyle="light-content" backgroundColor={C.bg} />

      {/* Brand image BG */}
      <Image
        source={require('../assets/images/jalsaathi_main.png')}
        style={[StyleSheet.absoluteFill, { opacity: 0.07 }]}
        resizeMode="cover"
        blurRadius={6}
      />

      {/* Orbs */}
      <Orb color={C.blue}    size={320} ix={-80}     iy={-80}       dx={140}  dy={120}  dur={11000} />
      <Orb color={C.blueMid} size={260} ix={W - 140} iy={H - 300}   dx={-110} dy={-90}  dur={13000} />
      <Orb color="#8B5CF6"   size={180} ix={W * 0.3} iy={H * 0.42}  dx={60}   dy={-90}  dur={9500}  />

      {/* Gradient vignette */}
      <LinearGradient
        colors={[C.bg, 'transparent', C.bg + 'DD', C.bg]}
        locations={[0, 0.22, 0.68, 1]}
        style={StyleSheet.absoluteFill}
      />

      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
        <ScrollView
          contentContainerStyle={styles.scroll}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >

          {/* ── Logo hero ── */}
          <Animated.View entering={FadeInDown.delay(0).springify()} style={styles.hero}>
            <Animated.View style={[styles.logoRing, logoAnim]}>
              <View style={styles.logoGlow} />
              <Image
                source={require('../assets/images/jalsaathi_main.png')}
                style={styles.logoImg}
                resizeMode="contain"
              />
            </Animated.View>
            <Animated.View entering={FadeInDown.delay(80).springify()} style={{ alignItems: 'center' }}>
              <Text style={styles.brand}>JalSaathi</Text>
              <Text style={styles.tagline}>Water delivery reinvented ✦</Text>
            </Animated.View>
          </Animated.View>

          {/* ── Banners ── */}
          {!!error && (
            <Animated.View entering={FadeInDown.springify()} style={[styles.errBanner, shakeAnim]}>
              <Text style={styles.errIcon}>⚠️</Text>
              <Text style={styles.errText}>{error}</Text>
              <TouchableOpacity onPress={() => setError('')}>
                <Text style={styles.errClose}>✕</Text>
              </TouchableOpacity>
            </Animated.View>
          )}
          {success && (
            <Animated.View entering={FadeInDown.springify()} style={styles.okBanner}>
              <Text style={styles.okText}>✓ Welcome back! Redirecting…</Text>
            </Animated.View>
          )}

          {/* ── Glass form card ── */}
          <Animated.View entering={FadeInUp.delay(120).springify()}>
            <BlurView intensity={Platform.OS === 'ios' ? 50 : 12} tint="dark" style={styles.card}>
              <Text style={styles.cardTitle}>Sign in</Text>

              <Field
                icon={<Mail size={18} color={C.blue} />}
                placeholder="Email address"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                delay={160}
              />

              <View style={{ height: 12 }} />

              <Field
                icon={<Lock size={18} color={C.blue} />}
                placeholder="Password"
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPass}
                delay={200}
                rightEl={
                  <TouchableOpacity onPress={() => setShowPass(p => !p)}>
                    <Text style={styles.showHide}>{showPass ? 'Hide' : 'Show'}</Text>
                  </TouchableOpacity>
                }
              />

              <Animated.View entering={FadeInDown.delay(240).springify()} style={styles.forgotRow}>
                <TouchableOpacity>
                  <Text style={styles.forgotTxt}>Forgot password?</Text>
                </TouchableOpacity>
              </Animated.View>

              {/* Sign in CTA */}
              <Animated.View entering={FadeInDown.delay(280).springify()} style={btnAnim}>
                <TouchableOpacity
                  onPress={handleLogin}
                  activeOpacity={0.88}
                  disabled={loading || success}
                  onPressIn={() => { btnScale.value = withSpring(0.95); }}
                  onPressOut={() => { btnScale.value = withSpring(1); }}
                >
                  <LinearGradient
                    colors={[C.blue, C.blueMid]}
                    start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
                    style={[styles.cta, (loading || success) && { opacity: 0.7 }]}
                  >
                    <View style={styles.ctaGloss} />
                    <Text style={styles.ctaTxt}>
                      {loading ? 'Signing in…' : success ? '✓  Done!' : 'Sign In'}
                    </Text>
                    {!loading && !success && <ArrowRight size={20} color={C.white} />}
                  </LinearGradient>
                </TouchableOpacity>
              </Animated.View>
            </BlurView>
          </Animated.View>

          {/* ── Demo login ── */}
          <Animated.View entering={FadeInDown.delay(360).springify()} style={styles.demoWrap}>
            <View style={styles.divRow}>
              <View style={styles.divLine} />
              <Text style={styles.divTxt}>Quick Demo Login</Text>
              <View style={styles.divLine} />
            </View>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.rolesRow}
            >
              {ROLES.map((r, i) => (
                <Animated.View key={r.key} entering={FadeInDown.delay(400 + i * 55).springify()}>
                  <RoleChip
                    role={r}
                    onPress={() => handleDemo(r.key)}
                    isLoading={demoRole === r.key}
                  />
                </Animated.View>
              ))}
            </ScrollView>
          </Animated.View>

          {/* ── Sign up link ── */}
          <Animated.View entering={FadeInDown.delay(560).springify()} style={styles.signupRow}>
            <Text style={styles.signupTxt}>New here?</Text>
            <TouchableOpacity onPress={() => router.push('/signup')} activeOpacity={0.7}>
              <Text style={styles.signupLink}> Create Account →</Text>
            </TouchableOpacity>
          </Animated.View>

          {/* ── Footer ── */}
          <Animated.View entering={FadeInDown.delay(600).springify()} style={styles.footer}>
            <Text style={styles.footerTxt}>💧 JalSaathi • Powered by trust</Text>
          </Animated.View>

        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: C.bg },

  scroll: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingTop: H * 0.10,
    paddingBottom: 48,
  },

  // Hero
  hero: { alignItems: 'center', marginBottom: 32 },
  logoRing: {
    width: 112, height: 112, borderRadius: 56,
    alignItems: 'center', justifyContent: 'center',
    marginBottom: 20,
    borderWidth: 1.5,
    borderColor: 'rgba(14,165,233,0.4)',
    backgroundColor: 'rgba(14,165,233,0.08)',
  },
  logoGlow: {
    position: 'absolute',
    width: 144, height: 144, borderRadius: 72,
    backgroundColor: C.blueGlow, opacity: 0.5,
  },
  logoImg: { width: 80, height: 80, borderRadius: 20 },
  brand: {
    fontSize: 40, fontWeight: '900', color: C.white,
    letterSpacing: -1.5, textAlign: 'center',
  },
  tagline: { fontSize: 14, color: C.muted, textAlign: 'center', marginTop: 4, fontWeight: '500' },

  // Banners
  errBanner: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    backgroundColor: 'rgba(248,113,113,0.12)',
    borderRadius: 14, padding: 14, marginBottom: 16,
    borderWidth: 1, borderColor: 'rgba(248,113,113,0.3)',
  },
  errIcon: { fontSize: 15 },
  errText: { flex: 1, fontSize: 13, color: C.error, fontWeight: '600' },
  errClose: { fontSize: 13, color: C.muted },
  okBanner: {
    backgroundColor: 'rgba(74,222,128,0.1)',
    borderRadius: 14, padding: 14, marginBottom: 16,
    borderWidth: 1, borderColor: 'rgba(74,222,128,0.3)',
    alignItems: 'center',
  },
  okText: { fontSize: 14, color: C.success, fontWeight: '700' },

  // Card
  card: {
    borderRadius: 28, padding: 24,
    overflow: 'hidden',
    borderWidth: 1, borderColor: C.border,
    marginBottom: 28,
  },
  cardTitle: {
    fontSize: 26, fontWeight: '800', color: C.white,
    letterSpacing: -0.8, marginBottom: 20,
  },

  // Field
  fieldWrap: {
    flexDirection: 'row', alignItems: 'center',
    borderWidth: 1.5, borderRadius: 16,
    paddingHorizontal: 14, paddingVertical: 14,
  },
  fieldIcon: { marginRight: 12 },
  fieldInput: { flex: 1, fontSize: 15, color: C.white, fontWeight: '500' },
  fieldRight: { marginLeft: 8 },
  showHide: { fontSize: 12, fontWeight: '700', color: C.blue },

  forgotRow: { alignItems: 'flex-end', marginTop: 10, marginBottom: 20 },
  forgotTxt: { fontSize: 13, color: C.blue, fontWeight: '700' },

  // CTA
  cta: {
    height: 60, borderRadius: 18,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10,
    overflow: 'hidden',
    shadowColor: C.blue,
    shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.45, shadowRadius: 20,
    elevation: 10,
  },
  ctaGloss: {
    position: 'absolute', top: 0, left: 0, right: 0, height: '48%',
    backgroundColor: 'rgba(255,255,255,0.14)',
    borderTopLeftRadius: 18, borderTopRightRadius: 18,
  },
  ctaTxt: { fontSize: 18, fontWeight: '800', color: C.white, letterSpacing: 0.2 },

  // Demo
  demoWrap: { marginBottom: 28 },
  divRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 16 },
  divLine: { flex: 1, height: 1, backgroundColor: C.border },
  divTxt: { fontSize: 11, color: C.muted, fontWeight: '600', letterSpacing: 0.8 },
  rolesRow: { gap: 12, paddingBottom: 4 },

  roleChip: { borderWidth: 1.5, borderRadius: 18, overflow: 'hidden' },
  roleInner: {
    paddingVertical: 12, paddingHorizontal: 18,
    alignItems: 'center', gap: 5, minWidth: 76,
  },
  roleEmoji: { fontSize: 22 },
  roleText: { fontSize: 11, fontWeight: '800', letterSpacing: 0.4 },

  // Sign up
  signupRow: {
    flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginBottom: 24,
  },
  signupTxt: { fontSize: 14, color: C.muted, fontWeight: '500' },
  signupLink: { fontSize: 14, color: C.blue, fontWeight: '800' },

  // Footer
  footer: { alignItems: 'center' },
  footerTxt: { fontSize: 12, color: 'rgba(255,255,255,0.18)', fontWeight: '500' },
});