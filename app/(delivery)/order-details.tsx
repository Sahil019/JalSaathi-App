import React, { useEffect, useState, useCallback } from 'react';
import { StyleSheet, View, Text, ScrollView, TouchableOpacity, Image, ActivityIndicator, Alert, Linking } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { 
  ArrowLeft, 
  MapPin, 
  Phone, 
  Navigation,
  Package,
  CheckCircle2
} from 'lucide-react-native';
import { deliveryService } from '@/services/deliveryService';
import { LinearGradient } from 'expo-linear-gradient';
import UserAvatar from '@/components/UserAvatar';

export default function DeliveryOrderDetails() {
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
      const data = await deliveryService.getOrderById(id as string);
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

  const handleStatusUpdate = async (status: string) => {
    try {
      setUpdating(true);
      await deliveryService.updateOrderStatus(id as string, status);
      Alert.alert('Success', `Order marked as ${status}`);
      await fetchOrderDetails();
    } catch (err: any) {
      Alert.alert('Error', err.message);
    } finally {
      setUpdating(false);
    }
  };

  const handleCall = () => {
     if (order?.consumer?.phone) {
        Linking.openURL(`tel:${order.consumer.phone}`);
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
        <Text style={{ color: theme.icon }}>Order details not found</Text>
        <TouchableOpacity onPress={() => router.back()} style={{ marginTop: 20 }}>
          <Text style={{ color: theme.primary }}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={[styles.backBtn, { backgroundColor: theme.card }]}>
          <ArrowLeft size={24} color={theme.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: theme.text }]}>Delivery Assignment</Text>
        <View style={{ width: 44 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Customer Card */}
        <View style={[styles.card, { backgroundColor: theme.card, borderColor: theme.border }]}>
           <View style={styles.cardHeader}>
              <View style={[styles.statusTag, { backgroundColor: order.status === 'out_for_delivery' ? '#0EA5E920' : '#10B98120' }]}>
                 <Text style={[styles.statusTagText, { color: order.status === 'out_for_delivery' ? '#0EA5E9' : '#10B981' }]}>
                    {order.status.replace('_', ' ').toUpperCase()}
                 </Text>
              </View>
              <Text style={[styles.orderId, { color: theme.icon }]}>ID: #{order._id.slice(-6).toUpperCase()}</Text>
           </View>

           <View style={styles.customerRow}>
               <UserAvatar 
                 uri={order.consumer?.profilePic} 
                 size={60} 
                 name={order.consumer?.name} 
                 style={styles.custImg}
               />
              <View style={{ flex: 1 }}>
                 <Text style={[styles.custName, { color: theme.text }]}>{order.consumer?.name || 'Customer'}</Text>
                 <Text style={[styles.custMeta, { color: theme.icon }]}>{order.quantity} Jars • Cash to collect: ₹{order.totalAmount}</Text>
              </View>
              <TouchableOpacity onPress={handleCall} style={[styles.iconAction, { backgroundColor: '#10B98115' }]}>
                 <Phone size={20} color="#10B981" />
              </TouchableOpacity>
           </View>

           <View style={[styles.divider, { backgroundColor: theme.border }]} />

           <View style={styles.addressBox}>
              <MapPin size={20} color={theme.error} />
              <View style={{ flex: 1 }}>
                 <Text style={[styles.addressText, { color: theme.text }]}>{order.address || order.consumer?.address || 'Address loading...'}</Text>
                 <Text style={{ color: theme.icon, fontSize: 12, marginTop: 4 }}>Gurgaon Sector 45 Zone</Text>
              </View>
           </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.actionSection}>
           <TouchableOpacity style={styles.navigateBtn}>
              <LinearGradient colors={['#0EA5E9', '#38BDF8']} style={styles.btnGradient}>
                 <Navigation size={22} color="white" />
                 <Text style={styles.btnText}>Open Navigation</Text>
              </LinearGradient>
           </TouchableOpacity>

           {order.status === 'out_for_delivery' && (
              <TouchableOpacity 
                 style={styles.deliverBtn} 
                 onPress={() => handleStatusUpdate('delivered')}
                 disabled={updating}
              >
                 <LinearGradient colors={['#10B981', '#34D399']} style={styles.btnGradient}>
                    {updating ? <ActivityIndicator color="white" /> : (
                       <>
                          <CheckCircle2 size={22} color="white" />
                          <Text style={styles.btnText}>Mark as Delivered</Text>
                       </>
                    )}
                 </LinearGradient>
              </TouchableOpacity>
           )}
        </View>

        {/* Details Section */}
        <View style={styles.infoSection}>
           <Text style={[styles.sectionTitle, { color: theme.text }]}>Order Breakdown</Text>
           <View style={[styles.infoCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
              <View style={styles.infoRow}>
                 <Text style={{ color: theme.icon }}>Standard Jars</Text>
                 <Text style={{ color: theme.text, fontWeight: '700' }}>x {order.quantity}</Text>
              </View>
              <View style={styles.infoRow}>
                 <Text style={{ color: theme.icon }}>Order Placed</Text>
                 <Text style={{ color: theme.text, fontWeight: '700' }}>{new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</Text>
              </View>
              <View style={[styles.divider, { backgroundColor: theme.border, marginVertical: 12 }]} />
              <View style={styles.infoRow}>
                 <Text style={{ color: theme.icon, fontWeight: '800' }}>Total Payment</Text>
                 <Text style={{ color: theme.primary, fontWeight: '900', fontSize: 18 }}>₹{order.totalAmount}</Text>
              </View>
           </View>
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
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
  card: {
    padding: 20,
    borderRadius: 28,
    borderWidth: 1,
    marginBottom: 24,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  statusTag: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 10,
  },
  statusTagText: {
    fontSize: 10,
    fontWeight: '900',
  },
  orderId: {
    fontSize: 12,
    fontWeight: '700',
  },
  customerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    marginBottom: 20,
  },
  custImg: {
    width: 60,
    height: 60,
    borderRadius: 20,
  },
  custName: {
    fontSize: 20,
    fontWeight: '800',
    marginBottom: 4,
  },
  custMeta: {
    fontSize: 13,
  },
  iconAction: {
    width: 48,
    height: 48,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  divider: {
    height: 1,
    opacity: 0.1,
    marginBottom: 20,
  },
  addressBox: {
    flexDirection: 'row',
    gap: 12,
  },
  addressText: {
    fontSize: 15,
    fontWeight: '600',
    lineHeight: 22,
  },
  actionSection: {
    gap: 12,
    marginBottom: 32,
  },
  navigateBtn: {
    borderRadius: 20,
    overflow: 'hidden',
  },
  deliverBtn: {
    borderRadius: 20,
    overflow: 'hidden',
  },
  btnGradient: {
    height: 64,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
  },
  btnText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '800',
  },
  infoSection: {
     marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '800',
    marginBottom: 16,
  },
  infoCard: {
     padding: 20,
     borderRadius: 24,
     borderWidth: 1,
  },
  infoRow: {
     flexDirection: 'row',
     justifyContent: 'space-between',
     alignItems: 'center',
     marginBottom: 8,
  }
});
