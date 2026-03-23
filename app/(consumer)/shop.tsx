import React, { useState, useEffect, useCallback } from 'react';
import { StyleSheet, View, Text, Image, TouchableOpacity, Dimensions, ActivityIndicator, Alert, Platform } from 'react-native';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  interpolate, 
  useAnimatedScrollHandler,
  withSpring,
  withRepeat,
  withSequence,
  withTiming,
  Extrapolation
} from 'react-native-reanimated';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useRouter, useFocusEffect } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { 
  ShoppingCart, 
  Minus, 
  Plus, 
  Droplet, 
  Zap, 
  Clock, 
  ShieldCheck, 
  ArrowRight,
  Info,
  Star,
  MapPin,
  Flame
} from 'lucide-react-native';
import { consumerService } from '@/services/consumerService';
import { BlurView } from 'expo-blur';

const { width, height } = Dimensions.get('window');

// Using the new high-quality images provided by the user
const JarImageMain = require('@/assets/images/jar_bg_removed.png');
const JarImageAlt = require('@/assets/images/jar_img.png');

export default function ShopScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const theme = Colors[colorScheme ?? 'light'];
  
  const [quantity, setQuantity] = useState(1);
  const [vendor, setVendor] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Animation Shared Values
  const scrollY = useSharedValue(0);
  const jarPulse = useSharedValue(1);

  const fetchBestVendor = useCallback(async () => {
    try {
      setLoading(true);
      const data = await consumerService.getNearbyVendors();
      if (data && data.vendors && data.vendors.length > 0) {
        setVendor(data.vendors[0]);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      fetchBestVendor();
    }, [fetchBestVendor])
  );

  useEffect(() => {
    // Pulse animation for the jar
    jarPulse.value = withRepeat(
      withSequence(
        withTiming(1.05, { duration: 1500 }),
        withTiming(1.0, { duration: 1500 })
      ),
      -1,
      true
    );
  }, []);

  const scrollHandler = useAnimatedScrollHandler({
    onScroll: (event) => {
      scrollY.value = event.contentOffset.y;
    },
  });

  const jarAnimatedStyle = useAnimatedStyle(() => {
    const scale = interpolate(
      scrollY.value,
      [0, 200],
      [1, 0.6],
      Extrapolation.CLAMP
    );
    const translateY = interpolate(
      scrollY.value,
      [0, 300],
      [0, -100],
      Extrapolation.CLAMP
    );
    return {
      transform: [
        { scale: scale * jarPulse.value },
        { translateY: translateY }
      ],
      opacity: interpolate(scrollY.value, [400, 500], [1, 0], Extrapolation.CLAMP)
    };
  });

  const headerAnimatedStyle = useAnimatedStyle(() => {
    const opacity = interpolate(scrollY.value, [0, 50], [1, 0], Extrapolation.CLAMP);
    return { opacity };
  });

  const glassCardStyle = useAnimatedStyle(() => {
    const translateY = interpolate(scrollY.value, [0, 200], [0, -50], Extrapolation.CLAMP);
    return { transform: [{ translateY }] };
  });

  const miniHeaderStyle = useAnimatedStyle(() => {
    const opacity = interpolate(scrollY.value, [400, 500], [0, 1], Extrapolation.CLAMP);
    const translateY = interpolate(scrollY.value, [400, 500], [-30, 0], Extrapolation.CLAMP);
    return { 
      opacity, 
      transform: [{ translateY }],
    };
  });

  const handleQuickOrder = () => {
    if (!vendor) {
      Alert.alert('No Vendors', 'No vendors are currently active in your area.');
      return;
    }
    
    router.push({
      pathname: '/(consumer)/order-summary',
      params: {
        vendorId: vendor._id,
        vendorName: vendor.businessName || vendor.name,
        pricePerCan: String(vendor.pricePerCan || 30),
        vendorLocation: vendor.address || vendor.area || '',
        deliveryBaseFee: String(vendor.deliveryBaseFee || 10),
        deliveryPerKmFee: String(vendor.deliveryPerKmFee || 5),
      }
    });
  };

  if (loading) {
    return (
      <View style={[styles.container, { backgroundColor: theme.background, justifyContent: 'center' }]}>
        <ActivityIndicator size="large" color={theme.primary} />
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      {/* Dynamic Background Gradient */}
      <View style={StyleSheet.absoluteFill}>
        <LinearGradient
          colors={isDark ? ['#020617', '#1E1B4B', '#020617'] : ['#F8FAFC', '#EEF2FF', '#F8FAFC']}
          style={StyleSheet.absoluteFill}
        />
        <View style={[styles.bgCircle, { backgroundColor: theme.primary, opacity: 0.1 }]} />
      </View>

      <Animated.ScrollView
        onScroll={scrollHandler}
        scrollEventThrottle={16}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Floating Header Header */}
        <Animated.View style={[styles.header, headerAnimatedStyle]}>
          <View style={styles.headerTop}>
            <View style={styles.brandBadge}>
              <Flame size={14} color="#F59E0B" />
              <Text style={styles.brandBadgeText}>JalSaathi Exclusive</Text>
            </View>
            <TouchableOpacity style={styles.iconBtn}>
              <Info size={20} color={theme.icon} />
            </TouchableOpacity>
          </View>
          <Text style={[styles.title, { color: theme.text }]}>Hydration Premium</Text>
          <Text style={[styles.subtitle, { color: theme.icon }]}>Elite 20L Spring Water</Text>
        </Animated.View>

        {/* Product Showcase - Hero Section */}
        <View style={styles.heroSection}>
          <Animated.View style={[styles.jarContainer, jarAnimatedStyle]}>
             <Image source={JarImageMain} style={styles.jarImage} resizeMode="contain" />
             {/* Dynamic Glow behind jar */}
             <View style={[styles.jarGlow, { backgroundColor: theme.primary }]} />
          </Animated.View>
        </View>

        {/* Glassmorphic Order Card */}
        <Animated.View style={[styles.glassCardContainer, glassCardStyle]}>
          <BlurView intensity={isDark ? 30 : 60} tint={isDark ? "dark" : "light"} style={styles.glassCard}>
            <View style={styles.priceSection}>
              <View>
                <Text style={[styles.productLabel, { color: theme.icon }]}>PREMIUM QUALITY</Text>
                <Text style={[styles.productName, { color: theme.text }]}>20L Ultra-Purified</Text>
              </View>
              <View style={styles.priceTag}>
                 <Text style={[styles.currency, { color: theme.primary }]}>₹</Text>
                 <Text style={[styles.price, { color: theme.text }]}>{vendor?.pricePerCan || 30}</Text>
                 <Text style={[styles.perUnit, { color: theme.icon }]}>/jar</Text>
              </View>
            </View>

            <View style={styles.vendorBrief}>
              <View style={styles.vendorRow}>
                <MapPin size={14} color={theme.success} />
                <Text style={[styles.vendorText, { color: theme.icon }]} numberOfLines={1}>
                  Delivering from: {vendor?.businessName || 'Elite Springs'}
                </Text>
              </View>
              <View style={styles.ratingRow}>
                <Star size={12} fill="#F59E0B" color="#F59E0B" />
                <Text style={[styles.ratingText, { color: theme.text }]}>4.9/5 Excellent Service</Text>
              </View>
            </View>

            <View style={styles.controlRow}>
               <View style={[styles.qtyControl, { backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)' }]}>
                  <TouchableOpacity onPress={() => setQuantity(Math.max(1, quantity-1))} style={styles.qtyBtn}>
                     <Minus size={20} color={theme.text} />
                  </TouchableOpacity>
                  <Text style={[styles.qtyVal, { color: theme.text }]}>{quantity}</Text>
                  <TouchableOpacity onPress={() => setQuantity(quantity+1)} style={styles.qtyBtn}>
                     <Plus size={20} color={theme.primary} />
                  </TouchableOpacity>
               </View>
               
               <View style={styles.totalBox}>
                  <Text style={[styles.totalLabel, { color: theme.icon }]}>Total Amount</Text>
                  <Text style={[styles.totalVal, { color: theme.text }]}>₹{ (vendor?.pricePerCan || 30) * quantity }</Text>
               </View>
            </View>

            <TouchableOpacity 
              onPress={handleQuickOrder}
              activeOpacity={0.9}
              style={styles.mainOrderBtn}
            >
              <LinearGradient 
                colors={['#6366F1', '#8B5CF6']} 
                start={{ x: 0, y: 0 }} 
                end={{ x: 1, y: 0 }}
                style={styles.orderBtnGradient}
              >
                <View style={styles.btnContent}>
                  <Zap size={22} color="white" fill="white" />
                  <Text style={styles.orderBtnText}>Instant Delivery</Text>
                  <ArrowRight size={20} color="white" />
                </View>
              </LinearGradient>
            </TouchableOpacity>
          </BlurView>
        </Animated.View>

        {/* Features Scrolling Section */}
        <View style={styles.featureGrid}>
          {[
            { icon: Clock, label: 'Super Fast', desc: 'Ships in 30m', color: '#F59E0B' },
            { icon: ShieldCheck, label: 'Certified', desc: 'ISI Quality', color: '#10B981' },
            { icon: Droplet, label: 'Mineral+', desc: 'Healthy pH', color: '#0EA5E9' },
          ].map((f, i) => (
            <BlurView key={i} intensity={25} tint={isDark ? "dark" : "light"} style={styles.featureItem}>
               <View style={[styles.featureIconBox, { backgroundColor: f.color + '20' }]}>
                  <f.icon size={22} color={f.color} />
               </View>
               <View>
                 <Text style={[styles.featureLabel, { color: theme.text }]}>{f.label}</Text>
                 <Text style={[styles.featureDesc, { color: theme.icon }]}>{f.desc}</Text>
               </View>
            </BlurView>
          ))}
        </View>

        <View style={styles.spacer} />
      </Animated.ScrollView>

      {/* Floating Header when scrolling */}
      <Animated.View style={[styles.miniHeader, miniHeaderStyle]}>
         <BlurView intensity={80} tint={isDark ? "dark" : "light"} style={styles.miniHeaderBlur}>
            <View style={styles.miniHeaderContent}>
               <View style={styles.miniHeaderInfo}>
                  <Droplet size={20} color={theme.primary} />
                  <Text style={[styles.miniHeaderTitle, { color: theme.text }]}>JalSaathi</Text>
               </View>
               <TouchableOpacity onPress={handleQuickOrder}>
                  <LinearGradient colors={['#6366F1', '#8B5CF6']} style={styles.miniOrderBtn}>
                     <Text style={styles.miniOrderBtnText}>Order Now</Text>
                  </LinearGradient>
               </TouchableOpacity>
            </View>
         </BlurView>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContent: { paddingTop: Platform.OS === 'ios' ? 60 : 40, paddingBottom: 150 },
  bgCircle: {
    position: 'absolute',
    top: -100,
    right: -100,
    width: 300,
    height: 300,
    borderRadius: 150,
  },
  header: { paddingHorizontal: 25, marginBottom: 20 },
  headerTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15 },
  brandBadge: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    gap: 6, 
    backgroundColor: '#F59E0B20', 
    paddingHorizontal: 12, 
    paddingVertical: 6, 
    borderRadius: 20 
  },
  brandBadgeText: { color: '#F59E0B', fontSize: 10, fontWeight: '900', textTransform: 'uppercase', letterSpacing: 1 },
  iconBtn: { padding: 8 },
  title: { fontSize: 34, fontWeight: '900', letterSpacing: -1 },
  subtitle: { fontSize: 18, fontWeight: '600', opacity: 0.8 },
  
  heroSection: { height: 320, justifyContent: 'center', alignItems: 'center', zIndex: 10 },
  jarContainer: { width: width * 0.8, height: 350, justifyContent: 'center', alignItems: 'center' },
  jarImage: { width: '100%', height: '100%', zIndex: 2 },
  jarGlow: { 
    position: 'absolute', 
    width: 180, 
    height: 250, 
    borderRadius: 100, 
    opacity: 0.2, 
    zIndex: 1 
  },

  glassCardContainer: { marginHorizontal: 20, marginTop: -40, zIndex: 20 },
  glassCard: { padding: 24, borderRadius: 32, overflow: 'hidden', borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' },
  priceSection: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 },
  productLabel: { fontSize: 10, fontWeight: '800', letterSpacing: 2, marginBottom: 4 },
  productName: { fontSize: 24, fontWeight: '900' },
  priceTag: { alignItems: 'flex-end' },
  currency: { fontSize: 16, fontWeight: '800' },
  price: { fontSize: 32, fontWeight: '900', lineHeight: 32 },
  perUnit: { fontSize: 12, fontWeight: '600' },

  vendorBrief: { gap: 8, marginBottom: 24 },
  vendorRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  vendorText: { fontSize: 13, fontWeight: '600' },
  ratingRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  ratingText: { fontSize: 12, fontWeight: '700' },

  controlRow: { flexDirection: 'row', alignItems: 'center', gap: 20, marginBottom: 25 },
  qtyControl: { 
    flex: 1.5,
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'space-between', 
    padding: 6, 
    borderRadius: 20 
  },
  qtyBtn: { width: 45, height: 45, justifyContent: 'center', alignItems: 'center' },
  qtyVal: { fontSize: 22, fontWeight: '900' },
  totalBox: { flex: 1, alignItems: 'center' },
  totalLabel: { fontSize: 10, fontWeight: '700', textTransform: 'uppercase' },
  totalVal: { fontSize: 20, fontWeight: '900' },

  mainOrderBtn: { borderRadius: 24, overflow: 'hidden', shadowColor: '#6366F1', shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.4, shadowRadius: 20, elevation: 10 },
  orderBtnGradient: { paddingVertical: 18, paddingHorizontal: 20 },
  btnContent: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 12 },
  orderBtnText: { color: 'white', fontSize: 18, fontWeight: '900' },

  featureGrid: { paddingHorizontal: 20, marginTop: 40, gap: 12 },
  featureItem: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    gap: 16, 
    padding: 16, 
    borderRadius: 24,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)'
  },
  featureIconBox: { width: 50, height: 50, borderRadius: 15, justifyContent: 'center', alignItems: 'center' },
  featureLabel: { fontSize: 16, fontWeight: '800' },
  featureDesc: { fontSize: 13, fontWeight: '600', opacity: 0.7 },

  spacer: { height: 100 },

  miniHeader: {
    position: 'absolute',
    top: 50,
    left: 20,
    right: 20,
    zIndex: 100,
  },
  miniHeaderBlur: {
    height: 60,
    borderRadius: 30,
    paddingHorizontal: 15,
    justifyContent: 'center',
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  miniHeaderContent: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  miniHeaderInfo: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  miniHeaderTitle: { fontSize: 16, fontWeight: '800' },
  miniOrderBtn: { paddingHorizontal: 18, paddingVertical: 8, borderRadius: 20 },
  miniOrderBtnText: { color: 'white', fontSize: 12, fontWeight: '900' }
});
