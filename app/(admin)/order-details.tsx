import React, { useEffect, useState, useCallback } from 'react';
import { StyleSheet, View, Text, ScrollView, TouchableOpacity, Image, ActivityIndicator, Alert, Linking } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { 
  ArrowLeft, 
  Package, 
  MapPin, 
  Calendar, 
  CreditCard, 
  Phone, 
  MessageSquare,
  ChevronRight,
  Droplet,
  CheckCircle2,
  XCircle,
  Truck,
  Store,
  User as UserIcon
} from 'lucide-react-native';
import { adminService } from '@/services/adminService';
import { LinearGradient } from 'expo-linear-gradient';
import UserAvatar from '@/components/UserAvatar';

export default function AdminOrderDetails() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme ?? 'light'];
  
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  const fetchOrderDetails = useCallback(async () => {
    try {
      setLoading(true);
      const data = await adminService.getOrderById(id as string);
      setOrder(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    if (id) {
      fetchOrderDetails();
    }
  }, [id, fetchOrderDetails]);

  const updateStatus = async (status: string) => {
    try {
      setUpdating(true);
      await adminService.updateOrderStatus(id as string, status);
      Alert.alert('Success', `Order status updated to ${status.replace('_', ' ')}`);
      await fetchOrderDetails();
    } catch (err: any) {
      Alert.alert('Error', err.message);
    } finally {
      setUpdating(false);
    }
  };

  const handleCall = (phone?: string) => {
    if (phone) {
      Linking.openURL(`tel:${phone}`);
    }
  };

  if (loading) {
    return (
      <View style={[styles.container, { backgroundColor: theme.background, justifyContent: 'center' }]}>
        <ActivityIndicator size="large" color={theme.primary} />
      </View>
    );
  }

  if (!order) {
    return (
      <View style={[styles.container, { backgroundColor: theme.background, justifyContent: 'center', alignItems: 'center' }]}>
        <Text style={{ color: theme.icon }}>Order not found</Text>
        <TouchableOpacity onPress={() => router.back()} style={{ marginTop: 20 }}>
          <Text style={{ color: theme.primary }}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'delivered': return '#10B981';
      case 'out_for_delivery': return '#0EA5E9';
      case 'confirmed': return '#8B5CF6';
      case 'pending': return '#F59E0B';
      case 'cancelled': return '#EF4444';
      default: return theme.icon;
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={[styles.backBtn, { backgroundColor: theme.card }]}>
          <ArrowLeft size={24} color={theme.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: theme.text }]}>Order Details (Admin)</Text>
        <View style={{ width: 44 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Status Card */}
        <View style={[styles.statusCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
          <View style={styles.statusTop}>
            <View>
              <Text style={[styles.orderNumber, { color: theme.icon }]}>ORDER #{order._id.slice(-6).toUpperCase()}</Text>
              <Text style={[styles.statusText, { color: getStatusColor(order.status) }]}>
                {order.status.replace('_', ' ').toUpperCase()}
              </Text>
            </View>
            <View style={[styles.statusIconWrap, { backgroundColor: getStatusColor(order.status) + '15' }]}>
              <Package size={24} color={getStatusColor(order.status)} />
            </View>
          </View>
          <View style={[styles.divider, { backgroundColor: theme.border }]} />
          <View style={styles.orderMeta}>
            <View style={styles.metaItem}>
               <Calendar size={16} color={theme.icon} />
               <Text style={[styles.metaText, { color: theme.text }]}>
                 {new Date(order.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}
               </Text>
            </View>
            <View style={styles.metaItem}>
               <Droplet size={16} color={theme.icon} />
               <Text style={[styles.metaText, { color: theme.text }]}>{order.quantity} Jars</Text>
            </View>
          </View>
        </View>

        {/* User Roles Stack */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>Stakeholders</Text>
          
          {/* Consumer */}
          <View style={[styles.roleCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
             <UserAvatar 
                uri={order.consumer?.profilePic} 
                size={44} 
                name={order.consumer?.name} 
                style={{ marginRight: 12 }}
             />
             <View style={styles.roleInfo}>
                <Text style={[styles.roleLabel, { color: theme.icon }]}>Consumer</Text>
                <Text style={[styles.roleName, { color: theme.text }]}>{order.consumer?.name || 'Unknown'}</Text>
                <Text style={[styles.roleSubtitle, { color: theme.icon }]}>{order.consumer?.phone || 'No phone'}</Text>
             </View>
             <TouchableOpacity onPress={() => handleCall(order.consumer?.phone)} style={styles.roleCall}>
                <Phone size={18} color={theme.primary} />
             </TouchableOpacity>
          </View>

          {/* Vendor */}
          <View style={[styles.roleCard, { backgroundColor: theme.card, borderColor: theme.border, marginTop: 12 }]}>
             <UserAvatar 
                uri={order.vendor?.profilePic} 
                size={44} 
                name={order.vendor?.businessName || order.vendor?.name} 
                style={{ marginRight: 12 }}
             />
             <View style={styles.roleInfo}>
                <Text style={[styles.roleLabel, { color: theme.icon }]}>Vendor</Text>
                <Text style={[styles.roleName, { color: theme.text }]}>{order.vendor?.businessName || order.vendor?.name || 'Unassigned'}</Text>
                <Text style={[styles.roleSubtitle, { color: theme.icon }]}>{order.vendor?.phone || 'No phone'}</Text>
             </View>
             <TouchableOpacity onPress={() => handleCall(order.vendor?.phone)} style={styles.roleCall}>
                <Phone size={18} color={theme.primary} />
             </TouchableOpacity>
          </View>

          {/* Delivery Boy */}
          {order.deliveryBoy && (
            <View style={[styles.roleCard, { backgroundColor: theme.card, borderColor: theme.border, marginTop: 12 }]}>
               <UserAvatar 
                  uri={order.deliveryBoy?.profilePic} 
                  size={44} 
                  name={order.deliveryBoy?.name} 
                  style={{ marginRight: 12 }}
               />
               <View style={styles.roleInfo}>
                  <Text style={[styles.roleLabel, { color: theme.icon }]}>Delivery Personnel</Text>
                  <Text style={[styles.roleName, { color: theme.text }]}>{order.deliveryBoy?.name || 'Assigned'}</Text>
                  <Text style={[styles.roleSubtitle, { color: theme.icon }]}>{order.deliveryBoy?.phone || 'No phone'}</Text>
               </View>
               <TouchableOpacity onPress={() => handleCall(order.deliveryBoy?.phone)} style={styles.roleCall}>
                  <Phone size={18} color={theme.primary} />
               </TouchableOpacity>
            </View>
          )}
        </View>

        {/* Delivery Address */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>Delivery Address</Text>
          <View style={[styles.addressCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
            <MapPin size={20} color={theme.error} />
            <Text style={[styles.addressText, { color: theme.text }]}>{order.address || order.consumer?.address || 'Address not provided'}</Text>
          </View>
        </View>

        {/* Admin Actions */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>Administrative Control</Text>
          <View style={styles.actionGrid}>
            {order.status === 'pending' && (
              <TouchableOpacity 
                style={[styles.actionBtn, { backgroundColor: '#8B5CF6' }]} 
                onPress={() => updateStatus('confirmed')}
                disabled={updateStatus === undefined || updating}
              >
                <CheckCircle2 size={20} color="white" />
                <Text style={styles.actionBtnText}>Force Confirm</Text>
              </TouchableOpacity>
            )}

            {order.status !== 'delivered' && order.status !== 'cancelled' && (
               <TouchableOpacity 
                 style={[styles.actionBtn, { backgroundColor: theme.error }]} 
                 onPress={() => Alert.alert('Cancel Order', 'Are you sure you want to FORCE CANCEL this order?', [
                   { text: 'No' },
                   { text: 'Yes', onPress: () => updateStatus('cancelled') }
                 ])}
                 disabled={updating}
               >
                 <XCircle size={20} color="white" />
                 <Text style={styles.actionBtnText}>Force Cancel</Text>
               </TouchableOpacity>
            )}
            
            {order.status === 'out_for_delivery' && (
               <TouchableOpacity 
                 style={[styles.actionBtn, { backgroundColor: '#10B981' }]} 
                 onPress={() => updateStatus('delivered')}
                 disabled={updating}
               >
                 <CheckCircle2 size={20} color="white" />
                 <Text style={styles.actionBtnText}>Mark as Delivered</Text>
               </TouchableOpacity>
            )}
          </View>
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>

      {updating && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color="white" />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 20,
  },
  backBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.05)',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '800',
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 10,
  },
  statusCard: {
    padding: 20,
    borderRadius: 28,
    borderWidth: 1,
    marginBottom: 24,
  },
  statusTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  orderNumber: {
    fontSize: 12,
    fontWeight: '700',
    marginBottom: 4,
  },
  statusText: {
    fontSize: 20,
    fontWeight: '900',
  },
  statusIconWrap: {
    width: 50,
    height: 50,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  divider: {
    height: 1,
    opacity: 0.1,
  },
  orderMeta: {
    flexDirection: 'row',
    marginTop: 16,
    gap: 20,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  metaText: {
    fontSize: 14,
    fontWeight: '600',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '800',
    marginBottom: 12,
  },
  roleCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: 20,
    borderWidth: 1,
  },
  roleIcon: {
    width: 44,
    height: 44,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  roleInfo: {
    flex: 1,
  },
  roleLabel: {
    fontSize: 10,
    fontWeight: '700',
    textTransform: 'uppercase',
    marginBottom: 2,
  },
  roleName: {
    fontSize: 15,
    fontWeight: '700',
  },
  roleSubtitle: {
    fontSize: 12,
  },
  roleCall: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: 'rgba(14, 165, 233, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  addressCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 24,
    borderWidth: 1,
    gap: 12,
  },
  addressText: {
    flex: 1,
    fontSize: 14,
    fontWeight: '500',
    lineHeight: 20,
  },
  actionGrid: {
    gap: 12,
  },
  actionBtn: {
    height: 60,
    borderRadius: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  actionBtnText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '700',
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 999,
  }
});
