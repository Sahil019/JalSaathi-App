import React, { useCallback } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, ScrollView, Image, RefreshControl } from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useAuth } from '@/context/AuthContext';
import { 
  Navigation, 
  Package, 
  MapPin, 
  CheckCircle2, 
  Power,
  TrendingUp,
  Clock
} from 'lucide-react-native';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import UserAvatar from '@/components/UserAvatar';

import { deliveryService } from '@/services/deliveryService';
import { vendorService } from '@/services/vendorService';

export default function DeliveryHome() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme ?? 'light'];
  const { user, signOut } = useAuth();
  
  const [profile, setProfile] = React.useState<any>(null);
  const [activeOrder, setActiveOrder] = React.useState<any>(null);
  const [recentOrders, setRecentOrders] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(true);

  const fetchDeliveryData = useCallback(async () => {
    try {
      setLoading(true);
      const [profileData, orders] = await Promise.all([
        deliveryService.getProfile(),
        deliveryService.getAssignedOrders()
      ]);
      
      setProfile(profileData);
      
      const allOrders = Array.isArray(orders) ? orders : [];
      const currentOrder = allOrders.find((o: any) => o.status === 'out_for_delivery' || o.status === 'confirmed');
      setActiveOrder(currentOrder);
      // Last 5 delivered orders
      const done = allOrders.filter((o: any) => o.status === 'delivered').slice(0, 5);
      setRecentOrders(done);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      fetchDeliveryData();
    }, [fetchDeliveryData])
  );

  const toggleStatus = async () => {
    const nextStatus = profile?.status === 'AVAILABLE' ? 'OFFLINE' : 'AVAILABLE';
    try {
      await deliveryService.updateStatus(nextStatus);
      setProfile({ ...profile, status: nextStatus });
    } catch (err) {
      alert('Failed to update status');
    }
  };

  const markAsDelivered = async () => {
    if (!activeOrder) return;
    try {
      setLoading(true);
      await deliveryService.updateOrderStatus(activeOrder._id, 'delivered');
      alert('Order marked as delivered!');
      await fetchDeliveryData();
    } catch (err: any) {
      alert(err.message || 'Failed to update order');
    } finally {
      setLoading(false);
    }
  };

  const isOnline = profile?.status === 'AVAILABLE';

  return (
    <ScrollView 
      style={[styles.container, { backgroundColor: theme.background }]}
      refreshControl={<RefreshControl refreshing={loading} onRefresh={fetchDeliveryData} />}
    >
      <View style={styles.header}>
        <View>
          <Text style={[styles.title, { color: theme.text }]}>Hello, {user?.name?.split(' ')[0] || 'Partner'}</Text>
           <Text style={[styles.subtitle, { color: theme.icon }]}>You&apos;re currently {isOnline ? 'Online' : 'Offline'}</Text>
        </View>
        <TouchableOpacity 
          style={[styles.statusToggle, { backgroundColor: isOnline ? '#10B981' : theme.error }]}
          onPress={toggleStatus}
        >
          <Power size={20} color="white" />
        </TouchableOpacity>
      </View>

      {/* Daily Performance Stats */}
      <View style={styles.statsGrid}>
        <View style={[styles.statItem, { backgroundColor: theme.card, borderColor: theme.border }]}>
          <View style={[styles.iconBox, { backgroundColor: '#3B82F620' }]}>
            <Package size={20} color="#3B82F6" />
          </View>
          <Text style={[styles.statVal, { color: theme.text }]}>{profile?.insights?.totalDeliveries || '0'}</Text>
          <Text style={[styles.statLab, { color: theme.icon }]}>Deliveries</Text>
        </View>
        <View style={[styles.statItem, { backgroundColor: theme.card, borderColor: theme.border }]}>
          <View style={[styles.iconBox, { backgroundColor: '#10B98120' }]}>
            <TrendingUp size={20} color="#10B981" />
          </View>
          <Text style={[styles.statVal, { color: theme.text }]}>₹{(profile?.insights?.totalDeliveries || 0) * 10}</Text>
          <Text style={[styles.statLab, { color: theme.icon }]}>Est. Earnings</Text>
        </View>
        <View style={[styles.statItem, { backgroundColor: theme.card, borderColor: theme.border }]}>
          <View style={[styles.iconBox, { backgroundColor: '#F59E0B20' }]}>
            <Clock size={20} color="#F59E0B" />
          </View>
          <Text style={[styles.statVal, { color: theme.text }]}>{profile?.insights?.performanceScore?.toFixed(1) || '5.0'}</Text>
          <Text style={[styles.statLab, { color: theme.icon }]}>Rating</Text>
        </View>
      </View>

      {/* Active Assignment */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>Active Assignment</Text>
          <View style={styles.liveBadge}>
             <View style={styles.liveDot} />
             <Text style={styles.liveText}>LIVE</Text>
          </View>
        </View>

        {activeOrder ? (
          <TouchableOpacity 
            style={[styles.assignmentCard, { backgroundColor: theme.card, borderColor: theme.border }]}
            // @ts-ignore
            onPress={() => router.push({ pathname: '/(delivery)/order-details', params: { id: activeOrder._id } })}
          >
             <View style={styles.assignmentTop}>
                <View style={styles.customerRow}>
                   <UserAvatar 
                      uri={activeOrder.consumer?.profilePic} 
                      size={44} 
                      name={activeOrder.consumer?.name} 
                    />
                   <View>
                      <Text style={[styles.custName, { color: theme.text }]}>{activeOrder.consumer?.name || 'Customer'}</Text>
                      <Text style={[styles.custDist, { color: theme.icon }]}>{activeOrder.area || 'Nearby'}</Text>
                   </View>
                </View>
                <View style={[styles.qtyBadge, { backgroundColor: theme.primary + '15' }]}>
                   <Text style={[styles.qtyText, { color: theme.primary }]}>{activeOrder.quantity} Jars</Text>
                </View>
             </View>
             
             <View style={styles.addressBox}>
                <MapPin size={16} color={theme.icon} />
                <Text style={[styles.addressTxt, { color: theme.icon }]}>{activeOrder.consumer?.address || 'Loading address...'}</Text>
             </View>
  
             <View style={styles.actionGridRow}>
               <TouchableOpacity style={styles.navigateBtnHalf}>
                  <LinearGradient
                    colors={['#0EA5E9', '#38BDF8']}
                    style={styles.navGradient}
                  >
                     <Navigation size={18} color="white" />
                     <Text style={styles.navTxt}>Navigate</Text>
                  </LinearGradient>
               </TouchableOpacity>

               {activeOrder.status === 'confirmed' ? (
                 <TouchableOpacity 
                   style={styles.deliverBtn} 
                   onPress={async () => {
                     try {
                        setLoading(true);
                        await deliveryService.updateOrderStatus(activeOrder._id, 'out_for_delivery');
                        alert('Order picked up! Consumer is tracking you.');
                        fetchDeliveryData();
                     } catch (err: any) {
                        alert(err.message);
                     } finally {
                        setLoading(false);
                     }
                   }}
                   disabled={loading}
                 >
                    <LinearGradient
                      colors={['#F59E0B', '#FFAA00']}
                      style={styles.navGradient}
                    >
                       <Package size={18} color="white" />
                       <Text style={styles.navTxt}>Pick Up</Text>
                    </LinearGradient>
                 </TouchableOpacity>
               ) : (
                 <TouchableOpacity style={styles.deliverBtn} onPress={markAsDelivered} disabled={loading}>
                    <LinearGradient
                      colors={['#10B981', '#34D399']}
                      style={styles.navGradient}
                    >
                       <CheckCircle2 size={18} color="white" />
                       <Text style={styles.navTxt}>Delivered</Text>
                    </LinearGradient>
                 </TouchableOpacity>
               )}
             </View>
          </TouchableOpacity>
        ) : (
          <View style={[styles.emptyCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
             <Text style={{ color: theme.icon }}>No active assignments.</Text>
          </View>
        )}
      </View>

      {/* Recent Deliveries - Real Data */}
      <View style={styles.section}>
         <Text style={[styles.sectionTitle, { color: theme.text }]}>Recent Deliveries</Text>
         <View style={styles.historyList}>
            {recentOrders.length > 0 ? recentOrders.map((order: any) => (
               <View key={order._id} style={[styles.historyItem, { borderBottomColor: theme.border }]}>
                  <View style={styles.histLeft}>
                     <View style={[styles.checkIcon, { backgroundColor: '#10B98115' }]}>
                        <CheckCircle2 size={18} color="#10B981" />
                     </View>
                     <View>
                        <Text style={[styles.histName, { color: theme.text }]}>Order #{order._id?.slice(-5).toUpperCase()}</Text>
                        <Text style={[styles.histTime, { color: theme.icon }]}>{order.consumer?.name || 'Customer'} • Delivered</Text>
                     </View>
                  </View>
                  <Text style={[styles.histAmt, { color: theme.text }]}>₹{order.totalAmount || 0}</Text>
               </View>
            )) : (
               <View style={[styles.emptyCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
                 <Text style={{ color: theme.icon, textAlign: 'center' }}>No completed deliveries yet</Text>
               </View>
            )}
         </View>
      </View>
      
      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 60,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 32,
  },
  title: {
    fontSize: 26,
    fontWeight: '800',
  },
  subtitle: {
    fontSize: 15,
  },
  statusToggle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 32,
  },
  statItem: {
    width: '31%',
    padding: 16,
    borderRadius: 20,
    borderWidth: 1,
    alignItems: 'center',
  },
  iconBox: {
    width: 36,
    height: 36,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  statVal: {
    fontSize: 18,
    fontWeight: '800',
  },
  statLab: {
    fontSize: 11,
    fontWeight: '500',
  },
  section: {
    marginBottom: 32,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
  liveBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EF444415',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    gap: 4,
  },
  liveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#EF4444',
  },
  liveText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#EF4444',
  },
  assignmentCard: {
    padding: 20,
    borderRadius: 24,
    borderWidth: 1,
  },
  emptyCard: {
    padding: 30,
    borderRadius: 24,
    borderWidth: 1,
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
  },
  assignmentTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  customerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  custImg: {
    width: 44,
    height: 44,
    borderRadius: 14,
  },
  custName: {
    fontSize: 16,
    fontWeight: '700',
  },
  custDist: {
    fontSize: 12,
  },
  qtyBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
  },
  qtyText: {
    fontSize: 12,
    fontWeight: '700',
  },
  addressBox: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 20,
  },
  addressTxt: {
    flex: 1,
    fontSize: 13,
    lineHeight: 18,
  },
  navigateBtnHalf: {
    flex: 1,
    borderRadius: 16,
    overflow: 'hidden',
  },
  deliverBtn: {
    flex: 1,
    borderRadius: 16,
    overflow: 'hidden',
  },
  actionGridRow: {
    flexDirection: 'row',
    gap: 12,
  },
  navGradient: {
    height: 52,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 10,
  },
  navTxt: {
    color: 'white',
    fontSize: 15,
    fontWeight: '700',
  },
  historyList: {
    gap: 0,
  },
  historyItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  histLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  checkIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  histName: {
    fontSize: 15,
    fontWeight: '600',
  },
  histTime: {
    fontSize: 12,
  },
  histAmt: {
    fontSize: 15,
    fontWeight: '700',
  }
});
