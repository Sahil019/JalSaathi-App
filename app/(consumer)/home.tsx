import React, { useCallback, useState } from 'react';
import { StyleSheet, View, Text, ScrollView, TouchableOpacity, Image, Dimensions, Alert, Platform } from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useAuth } from '@/context/AuthContext';
import { useNotifications } from '@/context/NotificationContext';
import Avatar from '@/components/Avatar';
import { 
  Calendar, 
  Droplet, 
  MapPin,
  Bell,
  Search,
  Zap,
  Star,
  Flame,
  ShieldCheck,
  TrendingUp,
  ChevronRight,
  ArrowRight,
  Wallet
} from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import Animated, { 
  useSharedValue, 
  useAnimatedScrollHandler, 
  useAnimatedStyle, 
  interpolate,
  Extrapolation,
  withSpring
} from 'react-native-reanimated';

import { consumerService } from '@/services/consumerService';

const { width } = Dimensions.get('window');

const HeroImage = require('@/assets/images/hero_img.png');
const JarIcon = require('@/assets/images/jar_bg_removed.png');

export default function ConsumerHome() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const theme = Colors[colorScheme ?? 'light'];
  const { user } = useAuth();
  const { unreadCount } = useNotifications();
  
  const [stats, setStats] = useState<any>(null);
  const [vendors, setVendors] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const scrollY = useSharedValue(0);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const [statsData, vendorsData] = await Promise.all([
        consumerService.getHomeStats(),
        consumerService.getNearbyVendors()
      ]);
      setStats(statsData);
      setVendors(vendorsData.vendors || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      fetchData();
    }, [fetchData])
  );

  const scrollHandler = useAnimatedScrollHandler({
    onScroll: (event) => {
      scrollY.value = event.contentOffset.y;
    },
  });

  const headerStyle = useAnimatedStyle(() => {
    return {
      backgroundColor: interpolate(scrollY.value, [0, 50], [0, 1]) > 0.5 ? theme.background : 'transparent',
      borderBottomWidth: interpolate(scrollY.value, [40, 60], [0, 1], Extrapolation.CLAMP),
      borderBottomColor: theme.border,
    } as any;
  });

  const heroScaleStyle = useAnimatedStyle(() => {
    return {
      transform: [
        { scale: interpolate(scrollY.value, [-100, 0], [1.2, 1], Extrapolation.CLAMP) }
      ],
    };
  });

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      {/* Background Gradient Layer */}
      <View style={StyleSheet.absoluteFill}>
        <LinearGradient
          colors={isDark ? ['#020617', '#1E1B4B', '#020617'] : ['#F8FAFC', '#EEF2FF', '#F8FAFC']}
          style={StyleSheet.absoluteFill}
        />
      </View>

      <Animated.View style={[styles.topHeader, headerStyle]}>
         <View style={[styles.headerLeft, { flexDirection: 'row', alignItems: 'center' }]}>
            <Avatar size={40} showEdit={true} />
            <View style={{ marginLeft: 10 }}>
              <Text style={[styles.welcome, { color: theme.icon }]}>Namaste,</Text>
              <Text style={[styles.userName, { color: theme.text }]}>{user?.name || 'Friend'}</Text>
            </View>
         </View>
         <View style={styles.headerRight}>
            <TouchableOpacity style={[styles.iconCircle, { backgroundColor: theme.card, borderColor: theme.border }]}>
               <Search size={22} color={theme.text} />
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.iconCircle, { backgroundColor: theme.card, borderColor: theme.border }]}
              onPress={() => router.push('/notifications')}
            >
               <Bell size={22} color={theme.text} />
               {unreadCount > 0 && (
                 <View style={styles.badge}>
                   <Text style={styles.badgeText}>{unreadCount}</Text>
                 </View>
               )}
            </TouchableOpacity>
         </View>
      </Animated.View>

      <Animated.ScrollView 
        onScroll={scrollHandler}
        scrollEventThrottle={16}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Dynamic Hero Banner */}
        <Animated.View style={[styles.heroContainer, heroScaleStyle]}>
           <Image source={HeroImage} style={styles.heroBg} resizeMode="cover" />
           <BlurView intensity={isDark ? 40 : 20} tint={isDark ? "dark" : "light"} style={styles.heroOverlay}>
              <View style={styles.heroContent}>
                 <View style={styles.heroStats}>
                    <View style={styles.heroStatItem}>
                       <Text style={styles.heroStatVal}>{stats?.totalOrders || '0'}</Text>
                       <Text style={styles.heroStatLab}>Orders</Text>
                    </View>
                    <View style={styles.heroStatDivider} />
                    <View style={styles.heroStatItem}>
                       <Text style={styles.heroStatVal}>₹{stats?.walletBalance || '0'}</Text>
                       <Text style={styles.heroStatLab}>Wallet</Text>
                    </View>
                    <View style={styles.heroStatDivider} />
                    <View style={styles.heroStatItem}>
                       <Text style={styles.heroStatVal}>{stats?.rewardPoints || '0'}</Text>
                       <Text style={styles.heroStatLab}>Points</Text>
                    </View>
                 </View>
                 <TouchableOpacity 
                   style={styles.heroCta}
                   onPress={() => router.push('/(consumer)/shop')}
                 >
                    <LinearGradient
                      colors={['#6366F1', '#8B5CF6']}
                      style={styles.ctaGrad}
                    >
                       <Text style={styles.ctaText}>Order Now</Text>
                       <Zap size={16} color="white" />
                    </LinearGradient>
                 </TouchableOpacity>
              </View>
           </BlurView>
        </Animated.View>

        {/* Categories Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: theme.text }]}>Explore Services</Text>
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.catScroll}>
            <View style={styles.catItem}>
              <LinearGradient colors={['#3B82F615', '#3B82F605']} style={styles.catBox}>
                <Droplet size={28} color="#3B82F6" />
                <Text style={[styles.catLabel, { color: theme.text }]}>20L Cans</Text>
                <Text style={styles.catSub}>Fastest</Text>
              </LinearGradient>
            </View>
            <View style={styles.catItem}>
              <LinearGradient colors={['#10B98115', '#10B98105']} style={styles.catBox}>
                <Calendar size={28} color="#10B981" />
                <Text style={[styles.catLabel, { color: theme.text }]}>Subscription</Text>
                <Text style={styles.catSub}>Easy</Text>
              </LinearGradient>
            </View>
            <View style={styles.catItem}>
              <LinearGradient colors={['#F59E0B15', '#F59E0B05']} style={styles.catBox}>
                <TrendingUp size={28} color="#F59E0B" />
                <Text style={[styles.catLabel, { color: theme.text }]}>Bulk Order</Text>
                <Text style={styles.catSub}>Events</Text>
              </LinearGradient>
            </View>
          </ScrollView>
        </View>

        {/* Nearby Vendors */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: theme.text }]}>Nearby Pure Water</Text>
            <TouchableOpacity onPress={() => router.push('/(consumer)/shop')}>
               <Text style={[styles.seeAll, { color: theme.primary }]}>View Map</Text>
            </TouchableOpacity>
          </View>
          
          <View style={styles.vendorGrid}>
            {vendors.map((vendor) => (
              <TouchableOpacity 
                key={vendor._id} 
                style={[styles.vendorCard, { backgroundColor: theme.card, borderColor: theme.border }]}
                onPress={() => router.push({ pathname: '/(consumer)/shop', params: { vendorId: vendor._id } })}
              >
                <View style={styles.vendorHeader}>
                  <View style={[styles.vendorIcon, { backgroundColor: theme.primary + '15' }]}>
                    <Store size={22} color={theme.primary} />
                  </View>
                  <View style={styles.vendorRating}>
                    <Star size={12} color="#F59E0B" fill="#F59E0B" />
                    <Text style={[styles.ratingVal, { color: theme.text }]}>4.8</Text>
                  </View>
                </View>
                <Text style={[styles.vendorName, { color: theme.text }]} numberOfLines={1}>{vendor.businessName || vendor.name}</Text>
                <View style={styles.vendorMeta}>
                   <MapPin size={12} color={theme.icon} />
                   <Text style={[styles.vendorDist, { color: theme.icon }]}>{vendor.area || 'Nearby'}</Text>
                </View>
                <View style={styles.priceRow}>
                   <Text style={[styles.priceTag, { color: theme.primary }]}>₹{vendor.pricePerCan || '30'}</Text>
                   <ArrowRight size={14} color={theme.icon} />
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Benefits Section */}
        <View style={styles.benefitsSection}>
           <Text style={[styles.benefitTitle, { color: theme.text }]}>The JalSaathi Promise</Text>
           <View style={styles.benefitRow}>
              <View style={[styles.benefitCard, { backgroundColor: theme.card }]}>
                 <ShieldCheck size={24} color="#10B981" />
                 <Text style={[styles.benefitLab, { color: theme.text }]}>Certified Quality</Text>
              </View>
              <View style={[styles.benefitCard, { backgroundColor: theme.card }]}>
                 <Zap size={24} color="#F59E0B" />
                 <Text style={[styles.benefitLab, { color: theme.text }]}>30 Min Delivery</Text>
              </View>
           </View>
        </View>

        <View style={{ height: 120 }} />
      </Animated.ScrollView>
    </View>
  );
}

const Store = ({ size, color }: any) => <Droplet size={size} color={color} />;

const styles = StyleSheet.create({
  container: { flex: 1 },
  topHeader: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 120,
    paddingTop: 60,
    paddingHorizontal: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    zIndex: 100,
  },
  headerLeft: {},
  welcome: { fontSize: 13, fontWeight: '700', opacity: 0.6 },
  userName: { fontSize: 18, fontWeight: '900' },
  headerRight: { flexDirection: 'row', gap: 12 },
  iconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
  },
  badge: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: '#EF4444',
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
    borderWidth: 2,
    borderColor: 'white',
  },
  badgeText: { color: 'white', fontSize: 9, fontWeight: '900' },
  scrollContent: {},
  heroContainer: {
    height: 380,
    width: width,
    marginBottom: 20,
    justifyContent: 'flex-end',
  },
  heroBg: { ...StyleSheet.absoluteFillObject, width: width, height: 380 },
  heroOverlay: {
    height: 160,
    borderTopLeftRadius: 40,
    borderTopRightRadius: 40,
    overflow: 'hidden',
    padding: 24,
  },
  heroContent: { flex: 1, justifyContent: 'space-between' },
  heroStats: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center' },
  heroStatItem: { alignItems: 'center', flex: 1 },
  heroStatVal: { fontSize: 22, fontWeight: '900', color: 'white' },
  heroStatLab: { fontSize: 12, color: 'rgba(255,255,255,0.6)', marginTop: 2 },
  heroStatDivider: { width: 1, height: 30, backgroundColor: 'rgba(255,255,255,0.1)' },
  heroCta: { height: 54, borderRadius: 16, overflow: 'hidden', marginTop: 20 },
  ctaGrad: { flex: 1, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 10 },
  ctaText: { color: 'white', fontSize: 16, fontWeight: '800' },
  section: { paddingHorizontal: 20, marginBottom: 32 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  sectionTitle: { fontSize: 20, fontWeight: '800' },
  seeAll: { fontSize: 14, fontWeight: '700' },
  catScroll: { gap: 15 },
  catItem: { width: 140 },
  catBox: { padding: 20, borderRadius: 24, alignItems: 'center', borderWidth: 1, borderColor: '#FFFFFF05' },
  catLabel: { fontSize: 15, fontWeight: '800', marginTop: 12 },
  catSub: { fontSize: 11, color: '#64748B', marginTop: 4 },
  vendorGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 16 },
  vendorCard: { width: (width - 56) / 2, padding: 16, borderRadius: 24, borderWidth: 1 },
  vendorHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  vendorIcon: { width: 44, height: 44, borderRadius: 14, justifyContent: 'center', alignItems: 'center' },
  vendorRating: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: '#F59E0B15', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 },
  ratingVal: { fontSize: 12, fontWeight: '800' },
  vendorName: { fontSize: 16, fontWeight: '800', marginBottom: 6 },
  vendorMeta: { flexDirection: 'row', alignItems: 'center', gap: 4, marginBottom: 12 },
  vendorDist: { fontSize: 12 },
  priceRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  priceTag: { fontSize: 18, fontWeight: '900' },
  benefitsSection: { paddingHorizontal: 20, marginBottom: 40 },
  benefitTitle: { fontSize: 18, fontWeight: '800', textAlign: 'center', marginBottom: 20 },
  benefitRow: { flexDirection: 'row', gap: 15 },
  benefitCard: { flex: 1, padding: 20, borderRadius: 24, alignItems: 'center' },
  benefitLab: { fontSize: 14, fontWeight: '700', marginTop: 12, textAlign: 'center' },
});
