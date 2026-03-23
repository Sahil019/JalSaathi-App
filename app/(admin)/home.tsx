import React, { useCallback, useState } from 'react';
import { StyleSheet, View, Text, ScrollView, TouchableOpacity, Dimensions, ActivityIndicator, Platform } from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useAuth } from '@/context/AuthContext';
import { useNotifications } from '@/context/NotificationContext';
import { adminService } from '@/services/adminService';
import { 
  BarChart3, 
  Users, 
  Store, 
  ShoppingBag,
  TrendingUp,
  Truck,
  Activity,
  ArrowRight,
  Bell,
  Wallet,
  Zap,
  Layers,
  LogOut
} from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';

import Avatar from '@/components/Avatar';
import UserAvatar from '@/components/UserAvatar';

const { width } = Dimensions.get('window');

export default function SuperAdminDashboard() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme ?? 'light'];
  const isDark = colorScheme === 'dark';
  const { user, signOut } = useAuth();
  const { unreadCount } = useNotifications();

  const [stats, setStats] = useState<any>(null);
  const [activities, setActivities] = useState<any[]>([]);
  const [recentOrders, setRecentOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const [statsData, activitiesData, ordersData] = await Promise.all([
        adminService.getDashboardStats(),
        adminService.getRecentActivities(),
        adminService.getAllOrders()
      ]);
      setStats(statsData);
      setActivities(Array.isArray(activitiesData) ? activitiesData : []);
      setRecentOrders(Array.isArray(ordersData) ? ordersData.slice(0, 5) : []);
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

  const platformEarnings = stats?.platformEarnings || 0;
  const totalRevenue = stats?.totalRevenue || 0;

  return (
    <View style={[styles.container, { backgroundColor: '#020617' }]}>
      {/* Nebula Glows */}
      <View style={[styles.glow, { top: -100, right: -100, backgroundColor: '#4F46E520' }]} />
      <View style={[styles.glow, { bottom: -100, left: -100, backgroundColor: '#7C3AED15' }]} />

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Modern Header */}
        <View style={styles.header}>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Avatar size={54} showEdit={true} />
            <View style={{ marginLeft: 15 }}>
              <Text style={styles.headerGreeting}>NAMASTE, {user?.name?.split(' ')[0] || 'ADMIN'}</Text>
              <Text style={styles.headerSubtitle}>System Pulse: <Text style={{ color: '#10B981', fontWeight: '900' }}>Active</Text></Text>
            </View>
          </View>
          <View style={styles.headerActions}>
            <TouchableOpacity 
              style={styles.iconBtn}
              onPress={() => router.push('/notifications')}
            >
              <BlurView intensity={20} tint="dark" style={StyleSheet.absoluteFill} />
              <Bell size={22} color="white" />
              {unreadCount > 0 && <View style={styles.notifyBadge} />}
            </TouchableOpacity>
            <TouchableOpacity style={styles.iconBtn} onPress={signOut}>
               <BlurView intensity={20} tint="dark" style={StyleSheet.absoluteFill} />
               <LogOut size={22} color="#EF4444" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Platform Earnings Centerpiece */}
        <View style={styles.centerpieceContainer}>
          <LinearGradient 
            colors={['#4F46E530', '#7C3AED20']} 
            start={{ x: 0, y: 0 }} 
            end={{ x: 1, y: 1 }} 
            style={styles.revenueCard}
          >
            <View style={styles.revenueHeader}>
               <View style={styles.earningsIconWrap}>
                 <Zap size={20} color="#F59E0B" fill="#F59E0B" />
               </View>
               <Text style={styles.revenueLabel}>PLATFORM EARNINGS (5%)</Text>
            </View>
            <View style={styles.revenueMainRow}>
               <Text style={styles.revenueCurrency}>₹</Text>
               <Text style={styles.revenueValue}>{platformEarnings.toLocaleString()}</Text>
               <View style={styles.liveTag}>
                  <View style={styles.liveDot} />
                  <Text style={styles.liveText}>LIVE</Text>
               </View>
            </View>
            <Text style={styles.revenueAltLabel}>Processing volume: ₹{totalRevenue.toLocaleString()}</Text>
          </LinearGradient>
        </View>

        {/* Stats Grid */}
        <View style={styles.statsGrid}>
           {[
             { label: 'Network Reach', value: stats?.activeUsers || '0', sub: 'Active Consumers', icon: Users, color: '#3B82F6' },
             { label: 'Active Partners', value: stats?.totalVendors || '0', sub: 'Verified Vendors', icon: Store, color: '#8B5CF6' },
             { label: 'Flow Logistics', value: stats?.totalOrders || '0', sub: 'LTD Orders', icon: ShoppingBag, color: '#06B6D4' },
             { label: 'Fleet Nodes', value: '12', sub: 'Verified Vehicles', icon: Truck, color: '#10B981' },
           ].map((item, idx) => (
             <BlurView key={idx} intensity={15} tint="dark" style={styles.statCard}>
                <View style={[styles.statIconWrap, { backgroundColor: item.color + '15' }]}>
                   <item.icon size={18} color={item.color} />
                </View>
                <Text style={styles.statValSmall}>{item.value}</Text>
                <Text style={styles.statLabelSmall}>{item.label}</Text>
                <Text style={styles.statSubSmall}>{item.sub}</Text>
             </BlurView>
           ))}
        </View>

        {/* Priority Streams (Orders) */}
        <View style={styles.sectionHeader}>
           <Text style={styles.sectionTitle}>PRIORITY STREAMS</Text>
           <TouchableOpacity onPress={() => router.push('/(admin)/orders')}>
              <Text style={styles.viewAllText}>Full History <ArrowRight size={14} color="#6366F1" /></Text>
           </TouchableOpacity>
        </View>

        <View style={styles.orderStack}>
            {recentOrders.map((order, idx) => (
              <BlurView key={idx} intensity={10} tint="dark" style={styles.orderCard}>
                 <UserAvatar 
                   uri={order.consumer?.profilePic} 
                   size={40} 
                   name={order.consumer?.name} 
                   style={{ marginRight: 14 }}
                 />
                 <View style={styles.orderInfo}>
                    <Text style={styles.orderCustName}>{order.consumer?.name || 'Customer'}</Text>
                    <Text style={styles.orderLocation}>{order.area || 'Active Zone'}</Text>
                 </View>
                <View style={styles.orderPriceInfo}>
                   <Text style={styles.orderAmt}>₹{order.totalAmount}</Text>
                   <View style={styles.feeTag}>
                     <Text style={styles.feeValue}>+₹{(order.platformFee || 0)} fee</Text>
                   </View>
                </View>
             </BlurView>
           ))}
        </View>

        {/* Platform Pulse */}
        <View style={styles.sectionHeader}>
           <Text style={styles.sectionTitle}>SYSTEM PULSE</Text>
           <Activity size={16} color="#4F46E5" />
        </View>

        <View style={styles.pulseContainer}>
            {activities.slice(0, 5).map((activity, idx) => (
              <View key={idx} style={styles.pulseRow}>
                 <View style={styles.pulseLineWrap}>
                    <UserAvatar 
                      uri={activity.profilePic} 
                      size={32} 
                      name={activity.name} 
                    />
                    {idx !== 4 && <View style={styles.pulseLine} />}
                 </View>
                <View style={styles.pulseContent}>
                   <Text style={styles.pulseLabel}>{activity.action}</Text>
                   <Text style={styles.pulseDetail}>{activity.details}</Text>
                   <Text style={styles.pulseTime}>{new Date(activity.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</Text>
                </View>
             </View>
           ))}
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Analytics Shortcut */}
      <TouchableOpacity 
        style={styles.fab}
        onPress={() => router.push('/(admin)/revenue')}
      >
        <LinearGradient colors={['#6366F1', '#8B5CF6']} style={styles.fabGrad}>
           <BarChart3 size={24} color="white" />
        </LinearGradient>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  glow: {
    position: 'absolute',
    width: 300,
    height: 300,
    borderRadius: 150,
  },
  scrollContent: { paddingHorizontal: 20, paddingTop: 60 },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 30,
  },
  headerGreeting: { fontSize: 13, fontWeight: '900', color: '#6366F1', letterSpacing: 1.5 },
  headerSubtitle: { fontSize: 24, fontWeight: '900', color: 'white', letterSpacing: -0.5 },
  headerActions: { flexDirection: 'row', gap: 12 },
  iconBtn: {
    width: 48,
    height: 48,
    borderRadius: 14,
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#FFFFFF10'
  },
  notifyBadge: {
    position: 'absolute',
    top: 12,
    right: 12,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#EF4444',
    borderWidth: 1,
    borderColor: '#020617'
  },
  centerpieceContainer: { marginBottom: 24 },
  revenueCard: {
    borderRadius: 28,
    padding: 24,
    borderWidth: 1,
    borderColor: '#FFFFFF10',
    overflow: 'hidden'
  },
  revenueHeader: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 16 },
  earningsIconWrap: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: '#F59E0B20',
    justifyContent: 'center',
    alignItems: 'center'
  },
  revenueLabel: { color: '#94A3B8', fontSize: 12, fontWeight: '800', letterSpacing: 1 },
  revenueMainRow: { flexDirection: 'row', alignItems: 'flex-end', gap: 6, marginBottom: 8 },
  revenueCurrency: { color: 'white', fontSize: 24, fontWeight: '300', marginBottom: 6 },
  revenueValue: { color: 'white', fontSize: 42, fontWeight: '900', letterSpacing: -1 },
  liveTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#EF444420',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    marginBottom: 12,
    marginLeft: 10
  },
  liveDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#EF4444' },
  liveText: { color: '#EF4444', fontSize: 10, fontWeight: '900' },
  revenueAltLabel: { color: '#64748B', fontSize: 13, fontWeight: '600' },
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginBottom: 30 },
  statCard: {
    width: (width - 52) / 2,
    borderRadius: 24,
    padding: 20,
    borderWidth: 1,
    borderColor: '#FFFFFF08',
    overflow: 'hidden'
  },
  statIconWrap: { width: 36, height: 36, borderRadius: 10, justifyContent: 'center', alignItems: 'center', marginBottom: 16 },
  statValSmall: { color: 'white', fontSize: 22, fontWeight: '900' },
  statLabelSmall: { color: '#94A3B8', fontSize: 12, fontWeight: '800', marginBottom: 2 },
  statSubSmall: { color: '#475569', fontSize: 10, fontWeight: '600' },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  sectionTitle: { color: '#6366F1', fontSize: 12, fontWeight: '900', letterSpacing: 2 },
  viewAllText: { color: 'white', fontSize: 13, fontWeight: '700' },
  orderStack: { gap: 10, marginBottom: 30 },
  orderCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#FFFFFF08',
    overflow: 'hidden'
  },
  orderIndicator: { width: 3, height: 30, borderRadius: 1.5, marginRight: 14 },
  orderInfo: { flex: 1 },
  orderCustName: { color: 'white', fontSize: 15, fontWeight: '800' },
  orderLocation: { color: '#64748B', fontSize: 12, fontWeight: '600', marginTop: 2 },
  orderPriceInfo: { alignItems: 'flex-end' },
  orderAmt: { color: 'white', fontSize: 16, fontWeight: '900' },
  feeTag: { backgroundColor: '#10B98115', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4, marginTop: 4 },
  feeValue: { color: '#10B981', fontSize: 10, fontWeight: '900' },
  pulseContainer: { paddingLeft: 10 },
  pulseRow: { flexDirection: 'row', gap: 16, marginBottom: 12 },
  pulseLineWrap: { alignItems: 'center' },
  pulseDot: { width: 10, height: 10, borderRadius: 5, marginTop: 6 },
  pulseLine: { width: 1, flex: 1, backgroundColor: '#FFFFFF10', marginVertical: 4 },
  pulseContent: { flex: 1, paddingBottom: 20 },
  pulseLabel: { color: 'white', fontSize: 14, fontWeight: '800' },
  pulseDetail: { color: '#64748B', fontSize: 12, marginTop: 2 },
  pulseTime: { color: '#475569', fontSize: 10, marginTop: 6, fontWeight: '700' },
  fab: {
    position: 'absolute',
    bottom: 30,
    right: 30,
    width: 64,
    height: 64,
    borderRadius: 32,
    elevation: 8,
    shadowColor: '#6366F1',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 15,
  },
  fabGrad: { flex: 1, borderRadius: 32, justifyContent: 'center', alignItems: 'center' }
});
