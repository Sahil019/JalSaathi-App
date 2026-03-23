import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { useFocusEffect, useRouter } from 'expo-router';
import {
  AlertCircle,
  ArrowLeft,
  CheckCircle2,
  ChevronRight,
  Clock,
  Droplet,
  MessageSquare,
  Navigation,
  Phone,
  ShieldCheck,
  Star,
  Truck
} from 'lucide-react-native';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Animated as RNAnimated,
  Dimensions,
  Image,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import Animated, {
  Extrapolate,
  interpolate,
  useAnimatedScrollHandler,
  useAnimatedStyle,
  useSharedValue,
} from 'react-native-reanimated';

const JalsaathiLogo = require('@/assets/images/jalsaathi_main.png');
import { consumerService } from '@/services/consumerService';
import UserAvatar from '@/components/UserAvatar';

const { width, height } = Dimensions.get('window');
const HERO_HEIGHT = height * 0.35; // Ideal height for full banner coverage

// Animated pulsing dot for status
function PulseDot() {
  const scale = useRef(new RNAnimated.Value(1)).current;
  const opacity = useRef(new RNAnimated.Value(0.6)).current;

  useEffect(() => {
    const loop = RNAnimated.loop(
      RNAnimated.parallel([
        RNAnimated.sequence([
          RNAnimated.timing(scale, { toValue: 1.8, duration: 900, useNativeDriver: true }),
          RNAnimated.timing(scale, { toValue: 1, duration: 900, useNativeDriver: true }),
        ]),
        RNAnimated.sequence([
          RNAnimated.timing(opacity, { toValue: 0, duration: 900, useNativeDriver: true }),
          RNAnimated.timing(opacity, { toValue: 0.6, duration: 900, useNativeDriver: true }),
        ]),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, []);

  return (
    <View style={{ width: 12, height: 12, justifyContent: 'center', alignItems: 'center' }}>
      <RNAnimated.View
        style={{
          position: 'absolute',
          width: 12,
          height: 12,
          borderRadius: 6,
          backgroundColor: '#10B981',
          transform: [{ scale }],
          opacity,
        }}
      />
      <View style={{ width: 7, height: 7, borderRadius: 3.5, backgroundColor: '#10B981' }} />
    </View>
  );
}

export default function TrackDelivery() {
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme ?? 'light'];
  const router = useRouter();

  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [eta, setEta] = useState(15);
  const [isFocused, setIsFocused] = useState(false);

  const scrollY = useSharedValue(0);

  useFocusEffect(
    useCallback(() => {
      setIsFocused(true);
      return () => setIsFocused(false);
    }, [])
  );

  const fetchLatestOrder = useCallback(async () => {
    try {
      const data = await consumerService.getLatestOrder();
      if (data && data._id) {
        setOrder(data);
        if (data.status === 'delivered' && isFocused) {
          router.replace({ pathname: '/(consumer)/delivered', params: { id: data._id } });
          return;
        }
        setEta(data.status === 'out_for_delivery' ? 12 : 28); // Dynamic feeling placeholders
      } else {
        setOrder(null);
      }
    } catch (err) {
      console.error('Tracking Error:', err);
    } finally {
      if (loading) setLoading(false);
    }
  }, [isFocused, router, loading]);

  useEffect(() => {
    if (!isFocused) return;
    fetchLatestOrder();
    const interval = setInterval(fetchLatestOrder, 6000);
    return () => clearInterval(interval);
  }, [isFocused, fetchLatestOrder]);

  const scrollHandler = useAnimatedScrollHandler((event) => {
    scrollY.value = event.contentOffset.y;
  });

  const heroParallax = useAnimatedStyle(() => ({
    transform: [
      {
        translateY: interpolate(scrollY.value, [0, HERO_HEIGHT], [0, HERO_HEIGHT * 0.35], Extrapolate.CLAMP),
      },
    ],
  }));

  const sheetStyle = useAnimatedStyle(() => ({
    transform: [
      {
        translateY: interpolate(scrollY.value, [0, HERO_HEIGHT], [0, -40], Extrapolate.CLAMP),
      },
    ],
  }));

  if (loading && !order) {
    return (
      <View style={[styles.container, { backgroundColor: '#0D1B2A', justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color="#8B5CF6" />
        <Text style={{ color: '#64748B', marginTop: 12, fontSize: 13, fontWeight: '600' }}>
          Locating your delivery…
        </Text>
      </View>
    );
  }

  const isOutForDelivery = order?.status === 'out_for_delivery';

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <StatusBar barStyle="light-content" />

      {/* Fixed top nav */}
      <View style={styles.fixedNav}>
        <TouchableOpacity onPress={() => router.back()} style={styles.navBtn}>
          <BlurView intensity={70} tint="dark" style={StyleSheet.absoluteFill} />
          <ArrowLeft size={20} color="white" />
        </TouchableOpacity>
        <View style={styles.navCenter}>
          <PulseDot />
          <Text style={styles.navTitle}>Live Tracking</Text>
        </View>
        <TouchableOpacity style={styles.navBtn}>
          <BlurView intensity={70} tint="dark" style={StyleSheet.absoluteFill} />
          <ShieldCheck size={20} color="#10B981" />
        </TouchableOpacity>
      </View>

      <Animated.ScrollView
        onScroll={scrollHandler}
        scrollEventThrottle={16}
        contentContainerStyle={{ paddingTop: 0 }}
        showsVerticalScrollIndicator={false}
      >
        {/* ─── FULL IMAGE HERO ZONE ─── */}
        <View style={styles.heroContainer}>
          <Animated.View style={[StyleSheet.absoluteFill, heroParallax]}>
            <Image 
              source={JalsaathiLogo} 
              style={styles.heroImage} 
              resizeMode="cover"
            />
            <LinearGradient 
              colors={['rgba(0,0,0,0.1)', 'rgba(0,0,0,0.4)']} 
              style={StyleSheet.absoluteFill} 
            />
          </Animated.View>

        </View>

        {/* ─── FLOATING PREMIUM GLASS ETA CARD ─── Moved outside to prevent overflow clipping */}
        <View style={styles.etaCardWrapper}>
          <BlurView intensity={100} tint="light" style={StyleSheet.absoluteFill} />
          {/* Subtle brand tint overlay */}
          <View style={[StyleSheet.absoluteFill, { backgroundColor: '#6366F104' }]} />

          <View style={styles.etaContainer}>
             <View style={styles.etaTimeBlock}>
                <Text style={[styles.etaMinutes, { color: '#0F172A' }]}>{eta}</Text>
                <View style={{ marginLeft: 5 }}>
                   <Text style={[styles.etaUnit, { color: theme.primary }]}>MINS</Text>
                   <Text style={[styles.etaLabel, { color: '#64748B' }]}>TO GO</Text>
                </View>
             </View>

             <View style={styles.etaDivider} />

             <View style={styles.etaStatusBlock}>
                <Text style={[styles.etaStatusMain, { color: '#0F172A' }]}>
                   {isOutForDelivery ? 'Out for delivery' : 'Ready soon'}
                </Text>
                <View style={styles.liveTag}>
                   <View style={[styles.liveDot, { backgroundColor: '#10B981' }]}/>
                   <Text style={[styles.liveTabText, { color: '#10B981' }]}>REALTIME</Text>
                </View>
             </View>

             <TouchableOpacity style={styles.etaCallBtn} activeOpacity={0.85}>
                <LinearGradient 
                   colors={[theme.accent, theme.primary]} 
                   style={StyleSheet.absoluteFill} 
                />
                <Phone size={16} color="white" />
                <Text style={styles.etaCallText}>CALL</Text>
             </TouchableOpacity>
          </View>
        </View>

        {/* ─── MAIN CONTENT SHEET ─── */}
        <Animated.View style={[styles.mainSheet, { backgroundColor: theme.background }, sheetStyle]}>
          <View style={styles.sheetHandle} />

          <View style={styles.orderHeaderRow}>
            <View>
              <Text style={[styles.orderId, { color: theme.icon }]}>
                ORDER #{order?._id?.slice(-8).toUpperCase() ?? '—'}
              </Text>
              <Text style={[styles.bigStatus, { color: theme.text }]}>
                {isOutForDelivery ? 'Out for delivery' : 'Preparing your jars'}
              </Text>
              <Text style={[styles.subStatus, { color: theme.icon }]}>
                {isOutForDelivery ? 'Driver is with your water jars' : 'ISI certified hygiene check in progress'}
              </Text>
            </View>
            <View style={[styles.statusIconBox, { backgroundColor: isOutForDelivery ? `${theme.primary}15` : `${theme.success}15` }]}>
              {isOutForDelivery ? <Truck size={24} color={theme.primary} /> : <Droplet size={24} color={theme.success} fill={theme.success} />}
            </View>
          </View>

          {/* Tracking Journey */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: theme.text }]}>Journey Timeline</Text>
            <View style={[styles.treeCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
              {[
                { label: 'Order Received', desc: 'Vendor confirmed your request', done: true, time: '12:02' },
                { label: 'Quality Checked', desc: 'ISI Certified water filled', done: true, time: '12:10' },
                { label: 'In Transit', desc: 'Driver carrying 20L jars', active: isOutForDelivery, done: order?.status === 'delivered', time: '12:15' },
                { label: 'Arrived', desc: 'Water delivered to doorstep', active: order?.status === 'delivered', last: true },
              ].map((step, idx) => (
                <View key={idx} style={styles.treeStep}>
                  <View style={styles.treeIndicator}>
                    <View style={[styles.treeNode, {
                      backgroundColor: step.done ? theme.success : step.active ? theme.accent : theme.background,
                      borderColor: step.done ? theme.success : step.active ? theme.accent : theme.border,
                    }]}>
                      {step.done ? <CheckCircle2 size={12} color="white" /> : step.active ? <View style={styles.activeNodeDot} /> : null}
                    </View>
                    {!step.last && <View style={[styles.treeLine, { backgroundColor: step.done ? theme.success : theme.border }]} />}
                  </View>
                  <View style={styles.treeContent}>
                    <View style={styles.treeTop}>
                      <Text style={[styles.treeLabel, { color: step.done || step.active ? theme.text : theme.icon, fontWeight: step.active ? '900' : '700' }]}>{step.label}</Text>
                      {step.time && <Text style={[styles.treeTime, { color: theme.icon }]}>{step.time}</Text>}
                    </View>
                    <Text style={[styles.treeDesc, { color: theme.icon }]}>{step.desc}</Text>
                  </View>
                </View>
              ))}
            </View>
          </View>

          {/* Delivery Partner */}
          {order?.deliveryBoy ? (
            <LinearGradient colors={['#8B5CF6', '#6366F1']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.driverCard}>
              <UserAvatar 
                uri={order.deliveryBoy.profilePic || order.deliveryBoy.avatar} 
                size={60} 
                name={order.deliveryBoy.name} 
                style={styles.driverImage}
              />
              <View style={{ flex: 1, marginLeft: 14 }}>
                <Text style={styles.driverName} numberOfLines={1}>{order?.deliveryBoy?.name}</Text>
                <View style={styles.starRow}>
                  <Star size={12} color="white" fill="white" />
                  <Text style={styles.starText}>{order?.deliveryBoy?.rating || '4.9'} · Best Partner</Text>
                </View>
              </View>
              <View style={styles.driverActions}>
                <TouchableOpacity style={styles.circleBtn}><Phone size={18} color="#8B5CF6" /></TouchableOpacity>
                <TouchableOpacity style={styles.circleBtn}><MessageSquare size={18} color="#8B5CF6" /></TouchableOpacity>
              </View>
            </LinearGradient>
          ) : (
            <View style={[styles.assigningBanner, { backgroundColor: theme.card, borderColor: theme.border }]}>
               <View style={[styles.assigningIcon, { backgroundColor: `${theme.primary}15` }]}>
                  <Truck size={20} color={theme.primary} />
               </View>
               <View style={{ flex: 1 }}>
                  <Text style={[styles.helpText, { color: theme.text }]}>Assigning Partner</Text>
                  <Text style={{ color: theme.icon, fontSize: 13, marginTop: 2 }}>Nearest partner is preparing your delivery</Text>
               </View>
            </View>
          )}

          <TouchableOpacity style={[styles.helpBanner, { backgroundColor: theme.card, borderColor: theme.border }]}>
            <AlertCircle size={20} color={theme.icon} />
            <Text style={[styles.helpText, { flex: 1, color: theme.text }]}>Need help with order?</Text>
            <ChevronRight size={18} color={theme.icon} />
          </TouchableOpacity>
        </Animated.View>
      </Animated.ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  fixedNav: {
    position: 'absolute',
    top: 50,
    left: 20,
    right: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    zIndex: 30,
  },
  navBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.3)',
  },
  navCenter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: 'rgba(0,0,0,0.45)',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 22,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  navTitle: { color: 'white', fontSize: 13, fontWeight: '800', letterSpacing: 0.5 },

  heroContainer: {
    height: HERO_HEIGHT,
    overflow: 'hidden',
    justifyContent: 'flex-end',
    backgroundColor: '#0F172A',
  },
  heroImage: {
    width: '100%',
    height: '100%',
  },
  etaCardWrapper: {
    alignSelf: 'center',
    width: width * 0.88, // Smaller width
    marginTop: -40, // Floating overlap
    height: 80, // Smaller height
    borderRadius: 40, // 40px/pill radius requested
    overflow: 'hidden',
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.85)',
    backgroundColor: 'rgba(255,255,255,0.55)', // A bit more 'whitess' as requested
    shadowColor: '#6366F1', shadowOpacity: 0.12, shadowRadius: 20, elevation: 12,
    zIndex: 100, // Top priority
  },
  etaContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    gap: 12,
  },
  etaTimeBlock: { 
     flexDirection: 'row', 
     alignItems: 'center',
  },
  etaMinutes: { 
    fontSize: 38, 
    fontWeight: '900', 
    letterSpacing: -2,
    textShadowColor: 'rgba(0,0,0,0.05)', // Subtle edge shadow
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 1,
  },
  etaUnit: { fontSize: 10, fontWeight: '900', letterSpacing: 1 },
  etaLabel: { fontSize: 8, fontWeight: '900', letterSpacing: 0.5 },
  etaStatusBlock: { flex: 1, justifyContent: 'center' },
  etaDivider: { width: 1.5, height: 28, backgroundColor: 'rgba(0,0,0,0.1)' },
  etaStatusMain: { 
     fontSize: 14, 
     fontWeight: '900', 
     marginBottom: 2,
     textShadowColor: 'rgba(0,0,0,0.02)',
     textShadowOffset: { width: 0, height: 1 },
     textShadowRadius: 1,
  },
  liveTag: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  liveDot: { width: 5, height: 5, borderRadius: 2.5 },
  liveTabText: { fontSize: 9, fontWeight: '900', letterSpacing: 1 },
  etaCallBtn: {
    height: 54, width: 62, borderRadius: 27, justifyContent: 'center', alignItems: 'center', gap: 2,
    overflow: 'hidden',
  },
  etaCallText: { color: 'white', fontSize: 9, fontWeight: '900', marginTop: 1 },

  mainSheet: {
    borderTopLeftRadius: 40, borderTopRightRadius: 40, paddingTop: 16, paddingHorizontal: 24,
    minHeight: height * 0.7, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 25, elevation: 10,
  },
  sheetHandle: { width: 40, height: 4, backgroundColor: '#E2E8F0', borderRadius: 2, alignSelf: 'center', marginBottom: 32 },
  orderHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 35 },
  orderId: { fontSize: 11, fontWeight: '800', letterSpacing: 1.2, marginBottom: 8 },
  bigStatus: { fontSize: 28, fontWeight: '900', letterSpacing: -0.5, lineHeight: 32 },
  subStatus: { fontSize: 15, fontWeight: '500', marginTop: 6, lineHeight: 20 },
  statusIconBox: { width: 56, height: 56, borderRadius: 18, justifyContent: 'center', alignItems: 'center' },

  section: { marginBottom: 32 },
  sectionTitle: { fontSize: 18, fontWeight: '900', marginBottom: 16 },
  treeCard: { padding: 24, borderRadius: 30, borderWidth: 1.5 },
  treeStep: { flexDirection: 'row', gap: 18 },
  treeIndicator: { alignItems: 'center', width: 22 },
  treeNode: { width: 22, height: 22, borderRadius: 11, borderWidth: 2, justifyContent: 'center', alignItems: 'center', zIndex: 2 },
  activeNodeDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: 'white' },
  treeLine: { width: 2.5, flex: 1, marginVertical: 4, opacity: 0.3 },
  treeContent: { flex: 1, paddingBottom: 26 },
  treeTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  treeLabel: { fontSize: 16 },
  treeTime: { fontSize: 11, fontWeight: '800' },
  treeDesc: { fontSize: 13, marginTop: 4, lineHeight: 18 },

  driverCard: { flexDirection: 'row', alignItems: 'center', padding: 22, borderRadius: 30, marginBottom: 18, elevation: 8 },
  driverImage: { width: 60, height: 60, borderRadius: 20, borderWidth: 2, borderColor: 'white' },
  driverName: { color: 'white', fontSize: 18, fontWeight: '900' },
  starRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 5 },
  starText: { color: 'rgba(255,255,255,0.9)', fontSize: 12, fontWeight: '700' },
  driverActions: { flexDirection: 'row', gap: 12 },
  circleBtn: { width: 46, height: 46, borderRadius: 23, backgroundColor: 'white', justifyContent: 'center', alignItems: 'center' },

  assigningBanner: { flexDirection: 'row', alignItems: 'center', padding: 20, borderRadius: 24, borderWidth: 1.5, gap: 15, marginBottom: 18 },
  assigningIcon: { width: 48, height: 48, borderRadius: 16, justifyContent: 'center', alignItems: 'center' },
  helpBanner: { flexDirection: 'row', alignItems: 'center', padding: 20, borderRadius: 24, borderWidth: 1.5, gap: 15, marginBottom: 30 },
  helpText: { fontSize: 15, fontWeight: '800' },
});