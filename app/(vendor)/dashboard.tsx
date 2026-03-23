import React, { useCallback, useState } from 'react';
import { StyleSheet, View, Text, ScrollView, TouchableOpacity, Image, Dimensions, Platform } from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useAuth } from '@/context/AuthContext';
import { useNotifications } from '@/context/NotificationContext';
import { 
  TrendingUp, 
  Package, 
  Users, 
  ArrowUpRight,
  ChevronRight,
  Activity,
  UserPlus,
  BookText,
  Truck,
  ArrowRight,
  Bell,
  LogOut,
  Droplet,
  MapPin,
  CalendarCheck,
  DollarSign
} from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import Avatar from '@/components/Avatar';
import UserAvatar from '@/components/UserAvatar';
import Animated, { 
  useSharedValue, 
  useAnimatedScrollHandler, 
  useAnimatedStyle, 
  interpolate,
  Extrapolation
} from 'react-native-reanimated';

import { vendorService } from '@/services/vendorService';

const { width } = Dimensions.get('window');

// Using images provided by the user for a high-end feel
const HeroBg = require('@/assets/images/hero_img.png');
const JarIcon = require('@/assets/images/jar_img.png');

export default function VendorDashboard() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme ?? 'light'];
  const isDark = colorScheme === 'dark';
  const { user, signOut } = useAuth();
  const { unreadCount } = useNotifications();

  const [stats, setStats] = useState<any>(null);
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const scrollY = useSharedValue(0);

  const fetchDashboardData = useCallback(async () => {
    try {
      const [statsData, ordersData] = await Promise.all([
        vendorService.getDashboardStats(),
        vendorService.getOrders()
      ]);
      setStats(statsData);
      setOrders(ordersData);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      fetchDashboardData();
    }, [fetchDashboardData])
  );

  const scrollHandler = useAnimatedScrollHandler({
    onScroll: (event) => {
      scrollY.value = event.contentOffset.y;
    },
  });

  const headerStyle = useAnimatedStyle(() => {
    return {
      backgroundColor: interpolate(scrollY.value, [0, 50], ['transparent', theme.background], Extrapolation.CLAMP),
      borderBottomWidth: interpolate(scrollY.value, [40, 60], [0, 1], Extrapolation.CLAMP),
      borderBottomColor: theme.border,
    };
  });

  const dashboardStats = [
    { label: 'Pending', value: stats?.pendingDeliveries || '0', icon: Package, color: '#6366F1', desc: 'Deliveries' },
    { label: 'Earnings', value: `₹${stats?.todaysEarnings || '0'}`, icon: TrendingUp, color: '#10B981', desc: 'Today' },
    { label: 'Collect', value: `₹${stats?.toCollect || '0'}`, icon: Users, color: '#F59E0B', desc: 'Unpaid' },
  ];

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
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <Avatar size={44} showEdit={true} />
          <View style={{ marginLeft: 12 }}>
            <Text style={[styles.title, { color: theme.text, fontSize: 18 }]}>Operations</Text>
            <Text style={[styles.subtitle, { color: theme.icon }]}>{user?.name?.split(' ')[0] || 'Partner'}</Text>
          </View>
        </View>
        <View style={styles.headerRight}>
          <TouchableOpacity 
            style={[styles.iconBtn, { borderColor: theme.border }]}
            onPress={() => router.push('/notifications')}
          >
            <Bell size={22} color={theme.text} />
            {unreadCount > 0 && <View style={styles.badge} />}
          </TouchableOpacity>
          <TouchableOpacity style={[styles.iconBtn, { borderColor: theme.error + '40' }]} onPress={signOut}>
            <LogOut size={20} color={theme.error} />
          </TouchableOpacity>
        </View>
      </Animated.View>

      <Animated.ScrollView 
        onScroll={scrollHandler}
        scrollEventThrottle={16}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Main Stats Header Section */}
        <View style={styles.heroSection}>
           <Image source={HeroBg} style={styles.heroBg} resizeMode="cover" />
           <BlurView intensity={isDark ? 40 : 20} tint={isDark ? "dark" : "light"} style={styles.heroOverlay}>
              <View style={styles.statsRow}>
                 {dashboardStats.map((stat, idx) => (
                    <View key={idx} style={styles.headerStatBox}>
                       <View style={[styles.statIconWrap, { backgroundColor: stat.color + '20' }]}>
                          <stat.icon size={18} color={stat.color} />
                       </View>
                       <Text style={styles.headerStatValue}>{stat.value}</Text>
                       <Text style={styles.headerStatLabel}>{stat.label}</Text>
                    </View>
                 ))}
              </View>
           </BlurView>
        </View>

        {/* Operational Pulse / Activity */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: theme.text }]}>Operations Hub</Text>
            <View style={styles.activePill}>
               <Activity size={12} color="#10B981" />
               <Text style={styles.activeText}>SYSTEM NORMAL</Text>
            </View>
          </View>
          <View style={styles.hubGrid}>
            {[
              { label: 'Staff Team', icon: Users, route: '/(vendor)/staff', color: '#8B5CF6', desc: 'Drivers & Helpers' },
              { label: 'Pricing & Fees', icon: DollarSign, route: '/(vendor)/profile-settings', color: '#10B981', desc: 'Can price & delivery' },
              { label: 'Credit Ledger', icon: BookText, route: '/(vendor)/ledger', color: '#3B82F6', desc: 'Payment tracking' },
              { label: ' Operational Pulse', icon: Activity, route: '/(vendor)/pulse', color: '#EF4444', desc: 'Real-time performance' },
              { label: 'New Requests', icon: UserPlus, route: '/(vendor)/requests', color: '#F59E0B', desc: 'New subscriptions' },
              { label: 'Fleet / Vehicles', icon: Truck, route: '/(vendor)/vehicles', color: '#10B981', desc: 'Logistics' },
            ].map((item, idx) => (
              <TouchableOpacity 
                key={idx} 
                style={[styles.hubItem, { backgroundColor: theme.card, borderColor: theme.border }]}
                // @ts-ignore
                onPress={() => router.push(item.route)}
              >
                <View style={[styles.hubIconBox, { backgroundColor: item.color + '10' }]}>
                   <item.icon size={22} color={item.color} />
                </View>
                <View style={styles.hubContent}>
                   <Text style={[styles.hubLabel, { color: theme.text }]}>{item.label}</Text>
                   <Text style={[styles.hubDesc, { color: theme.icon }]} numberOfLines={1}>{item.desc}</Text>
                </View>
                <ChevronRight size={16} color={theme.border} />
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Activity Feed for Orders */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: theme.text }]}>Recent Activity</Text>
            <TouchableOpacity onPress={() => router.push('/(vendor)/orders')} style={styles.viewMoreBtn}>
              <Text style={{ color: theme.primary, fontWeight: '800' }}>Full Feed</Text>
              <ArrowUpRight size={16} color={theme.primary} />
            </TouchableOpacity>
          </View>
          
          <View style={styles.orderFeed}>
            {orders.map((order, idx) => (
              <TouchableOpacity 
                key={order._id} 
                style={[styles.feedItem, { backgroundColor: theme.card, borderColor: theme.border }]}
                // @ts-ignore
                onPress={() => router.push({ pathname: '/(vendor)/order-details', params: { id: order._id } })}
              >
                <View style={styles.feedIcon}>
                   <UserAvatar 
                      uri={order.consumer?.profilePic} 
                      size={48} 
                      name={order.consumer?.name} 
                      style={{ borderRadius: 18 }}
                   />
                   {idx < orders.length - 1 && <View style={[styles.feedLine, { backgroundColor: theme.border }]} />}
                </View>
                
                <View style={styles.feedMain}>
                   <View style={styles.feedTopRow}>
                      <Text style={[styles.customerName, { color: theme.text }]}>{order.consumer?.name || 'Customer'}</Text>
                      <View style={[styles.statusBadge, { 
                        backgroundColor: order.status === 'pending' ? '#F59E0B20' : order.status === 'delivered' ? '#10B98120' : '#3B82F620'
                      }]}>
                        <Text style={[styles.statusText, { 
                          color: order.status === 'pending' ? '#F59E0B' : order.status === 'delivered' ? '#10B981' : '#3B82F6'
                        }]}>{order.status.toUpperCase()}</Text>
                      </View>
                   </View>
                   <Text style={[styles.feedDetail, { color: theme.icon }]}>
                      {order.quantity} Jars delivered to {order.consumer?.address || 'nearby location'}
                   </Text>
                   <View style={styles.feedBottomRow}>
                      <View style={styles.metaInfo}>
                         <CalendarCheck size={12} color={theme.icon} />
                         <Text style={[styles.metaText, { color: theme.icon }]}>Just now</Text>
                      </View>
                      <Text style={[styles.metaAmount, { color: theme.text }]}>₹{order.totalAmount}</Text>
                   </View>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={{ height: 120 }} />
      </Animated.ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  topHeader: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'ios' ? 50 : 40,
    paddingBottom: 15,
    zIndex: 100,
  },
  headerLeft: { flex: 1 },
  title: { fontSize: 26, fontWeight: '900', letterSpacing: -0.5 },
  subtitle: { fontSize: 16, fontWeight: '600', opacity: 0.8 },
  headerRight: { flexDirection: 'row', gap: 10 },
  iconBtn: {
    width: 48,
    height: 48,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
  },
  badge: {
    position: 'absolute',
    top: 14,
    right: 14,
    backgroundColor: '#EF4444',
    width: 8,
    height: 8,
    borderRadius: 4,
    borderWidth: 1.5,
    borderColor: 'white',
  },
  
  scrollContent: { paddingTop: Platform.OS === 'ios' ? 110 : 100 },

  heroSection: { marginHorizontal: 20, height: 160, borderRadius: 28, overflow: 'hidden', marginBottom: 32 },
  heroBg: { width: '100%', height: '100%' },
  heroOverlay: { position: 'absolute', bottom: 0, left: 0, right: 0, top: 0, justifyContent: 'center', paddingHorizontal: 20 },
  statsRow: { flexDirection: 'row', justifyContent: 'space-between' },
  headerStatBox: { alignItems: 'center', flex: 1 },
  statIconWrap: { width: 44, height: 44, borderRadius: 14, justifyContent: 'center', alignItems: 'center', marginBottom: 12 },
  headerStatValue: { color: 'white', fontSize: 22, fontWeight: '900' },
  headerStatLabel: { color: 'rgba(255,255,255,0.7)', fontSize: 10, fontWeight: '900', textTransform: 'uppercase', letterSpacing: 1 },

  section: { paddingHorizontal: 20, marginBottom: 35 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  sectionTitle: { fontSize: 20, fontWeight: '900' },
  activePill: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: '#10B98115', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 12 },
  activeText: { color: '#10B981', fontSize: 9, fontWeight: '900' },

  hubGrid: { gap: 12 },
  hubItem: { flexDirection: 'row', alignItems: 'center', padding: 18, borderRadius: 24, borderWidth: 1, gap: 16 },
  hubIconBox: { width: 52, height: 52, borderRadius: 18, justifyContent: 'center', alignItems: 'center' },
  hubContent: { flex: 1, gap: 4 },
  hubLabel: { fontSize: 16, fontWeight: '800' },
  hubDesc: { fontSize: 12, fontWeight: '600', opacity: 0.7 },

  viewMoreBtn: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  orderFeed: { gap: 0 },
  feedItem: { flexDirection: 'row', gap: 16, marginBottom: 0, paddingVertical: 12 },
  feedIcon: { alignItems: 'center' },
  avatar: { width: 48, height: 48, borderRadius: 18, justifyContent: 'center', alignItems: 'center', zIndex: 1 },
  feedLine: { width: 2, flex: 1, marginTop: 4, opacity: 0.5 },
  feedMain: { flex: 1, gap: 8, paddingBottom: 20 },
  feedTopRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  customerName: { fontSize: 16, fontWeight: '800' },
  statusBadge: { paddingVertical: 4, paddingHorizontal: 10, borderRadius: 8 },
  statusText: { fontSize: 10, fontWeight: '900' },
  feedDetail: { fontSize: 14, fontWeight: '600' },
  feedBottomRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  metaInfo: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  metaText: { fontSize: 11, fontWeight: '600' },
  metaAmount: { fontSize: 15, fontWeight: '900' }
});
