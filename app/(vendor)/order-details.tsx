import React, { useEffect, useState, useCallback } from 'react';
import { StyleSheet, View, Text, ScrollView, TouchableOpacity, Image, ActivityIndicator, Alert, Linking, Dimensions, Platform } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import * as Lucide from 'lucide-react-native';
import { vendorService } from '@/services/vendorService';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';

const { width } = Dimensions.get('window');

export default function VendorOrderDetails() {
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
      const data = await vendorService.getOrderById(id as string);
      setOrder(data);
    } catch (err) {
      console.error(err);
      setOrder(null);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    if (id) fetchOrderDetails();
  }, [id, fetchOrderDetails]);

  const updateStatus = async (status: string) => {
    try {
      setUpdating(true);
      await vendorService.updateOrderStatus(id as string, status);
      Alert.alert('Success ✨', `Order is now ${status.replace('_', ' ')}`);
      await fetchOrderDetails();
    } catch (err: any) {
      Alert.alert('Update Failed', err.message);
    } finally {
      setUpdating(false);
    }
  };

  const handleCall = () => {
    if (order?.consumer?.phone) Linking.openURL(`tel:${order.consumer.phone}`);
  };

  if (loading) {
    return (
      <View style={[styles.container, { backgroundColor: theme.background, justifyContent: 'center' }]}>
        <ActivityIndicator size="large" color="#8B5CF6" />
      </View>
    );
  }

  if (!order) {
    return (
      <View style={[styles.container, { backgroundColor: theme.background, justifyContent: 'center', alignItems: 'center', padding: 40 }]}>
        <Lucide.AlertCircle size={64} color={theme.icon} />
        <Text style={[styles.errorTitle, { color: theme.text }]}>Order Not Found</Text>
        <Text style={[styles.errorSub, { color: theme.icon }]}>This order might have been deleted or the link is invalid.</Text>
        <TouchableOpacity onPress={() => router.back()} style={styles.goBackBtn}>
          <Text style={styles.goBackTxt}>Go Back to Orders</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const statusMap: any = {
    pending: { label: 'PENDING', color: '#F59E0B', icon: Lucide.Clock, bg: '#F59E0B15' },
    confirmed: { label: 'CONFIRMED', color: '#8B5CF6', icon: Lucide.CheckCircle2, bg: '#8B5CF615' },
    out_for_delivery: { label: 'DISPATCHED', color: '#0EA5E9', icon: Lucide.Truck, bg: '#0EA5E915' },
    delivered: { label: 'DELIVERED', color: '#10B981', icon: Lucide.CheckCircle2, bg: '#10B98115' },
    cancelled: { label: 'CANCELLED', color: '#EF4444', icon: Lucide.XCircle, bg: '#EF444415' },
  };

  const currentStatus = statusMap[order.status] || statusMap.pending;

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      {/* Dynamic Background Header */}
      <View style={{ height: 160, backgroundColor: currentStatus.color, position: 'absolute', top: 0, left: 0, right: 0 }}>
         <LinearGradient colors={[currentStatus.color, currentStatus.color + '50']} style={StyleSheet.absoluteFill} />
      </View>

      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backCircle}>
          <Lucide.ArrowLeft size={22} color="white" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Order Details</Text>
        <TouchableOpacity style={styles.backCircle}>
          <Lucide.MoreVertical size={20} color="white" />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        
        {/* Main Status Float Card */}
        <View style={[styles.statusFloatCard, { backgroundColor: theme.card }]}>
           <View style={styles.statusRow}>
              <View>
                 <Text style={[styles.orderIdText, { color: theme.icon }]}>ORDER ID: #{order._id.slice(-8).toUpperCase()}</Text>
                 <Text style={[styles.statusLabelLarge, { color: currentStatus.color }]}>{currentStatus.label}</Text>
              </View>
              <View style={[styles.statusIconWrap, { backgroundColor: currentStatus.bg }]}>
                 <currentStatus.icon size={28} color={currentStatus.color} />
              </View>
           </View>
           
           <View style={[styles.miniDivider, { backgroundColor: theme.border }]} />
           
           <View style={styles.statsGrid}>
              <View style={styles.statBox}>
                 <Lucide.ShoppingBag size={18} color={theme.icon} />
                 <Text style={[styles.statVal, { color: theme.text }]}>{order.quantity} Jars</Text>
              </View>
              <View style={styles.statBox}>
                 <Lucide.CreditCard size={18} color={theme.icon} />
                 <Text style={[styles.statVal, { color: theme.text }]}>₹{order.totalAmount}</Text>
              </View>
              <View style={styles.statBox}>
                 <Lucide.Calendar size={18} color={theme.icon} />
                 <Text style={[styles.statVal, { color: theme.text }]}>{new Date(order.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}</Text>
              </View>
           </View>
        </View>

        {/* Customer Section - Branded */}
        <Text style={styles.sectionLabel}>CUSTOMER INFORMATION</Text>
        <View style={[styles.customerBrandedCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
           <View style={styles.customerRow}>
              <View style={[styles.initialCircle, { backgroundColor: '#8B5CF620' }]}>
                 <Text style={{ color: '#8B5CF6', fontWeight: '900', fontSize: 18 }}>{(order.consumer?.name || '?')[0]}</Text>
              </View>
              <View style={{ flex: 1 }}>
                 <Text style={[styles.custName, { color: theme.text }]}>{order.consumer?.name || 'Guest User'}</Text>
                 <Text style={[styles.custPhone, { color: theme.icon }]}>{order.consumer?.phone || 'No phone'}</Text>
              </View>
              <View style={styles.custActionRow}>
                 <TouchableOpacity onPress={handleCall} style={[styles.roundAction, { backgroundColor: '#10B98115' }]}>
                    <Lucide.Phone size={20} color="#10B981" />
                 </TouchableOpacity>
                 <TouchableOpacity style={[styles.roundAction, { backgroundColor: '#0EA5E915' }]}>
                    <Lucide.MessageSquare size={20} color="#0EA5E9" />
                 </TouchableOpacity>
              </View>
           </View>
        </View>

        {/* Delivery Location Section */}
        <Text style={styles.sectionLabel}>DELIVERY LOCATION</Text>
        <View style={[styles.addressCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
           <View style={[styles.mapSim, { backgroundColor: theme.background }]}>
              <Lucide.MapPin size={30} color="#EF4444" />
              <View style={styles.pathSim} />
           </View>
           <View style={styles.addressInfo}>
              <Text style={[styles.addressTxt, { color: theme.text }]}>{order.address || order.consumer?.address || 'Standard Delivery'}</Text>
              <TouchableOpacity style={styles.dirBtn}>
                 <Lucide.Navigation2 size={14} color="#8B5CF6" />
                 <Text style={styles.dirBtnTxt}>Get Directions</Text>
              </TouchableOpacity>
           </View>
        </View>

        {/* Assigned Delivery Partner - AI FEEDBACK */}
        {order.deliveryBoy && (
           <>
            <Text style={styles.sectionLabel}>ASSIGNED PARTNER</Text>
            <View style={[styles.customerBrandedCard, { backgroundColor: theme.card, borderColor: theme.border, marginBottom: 25 }]}>
               <View style={styles.customerRow}>
                  <View style={[styles.initialCircle, { backgroundColor: '#10B98120' }]}>
                     <Lucide.Truck size={24} color="#10B981" />
                  </View>
                  <View style={{ flex: 1 }}>
                     <Text style={[styles.custName, { color: theme.text }]}>{order.deliveryBoy?.name || 'Logistics Partner'}</Text>
                     <Text style={[styles.custPhone, { color: theme.icon }]}>{order.deliveryBoy?.phone || 'On standby'}</Text>
                  </View>
                  <TouchableOpacity 
                    onPress={() => order.deliveryBoy?.phone && Linking.openURL(`tel:${order.deliveryBoy.phone}`)}
                    style={[styles.roundAction, { backgroundColor: '#10B98115' }]}
                  >
                     <Lucide.Phone size={20} color="#10B981" />
                  </TouchableOpacity>
               </View>
            </View>
           </>
        )}

        {/* Payment Logic Section */}
        <Text style={styles.sectionLabel}>PAYMENT DETAILS</Text>
        <View style={[styles.paymentCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
           <View style={styles.payRow}>
              <Lucide.ShieldCheck size={20} color={order.paymentStatus === 'paid' ? '#10B981' : '#64748B'} />
              <Text style={[styles.payTxt, { color: theme.text }]}>Status: <Text style={{ fontWeight: '900', color: order.paymentStatus === 'paid' ? '#10B981' : '#F59E0B' }}>{order.paymentStatus?.toUpperCase() || 'UNPAID'}</Text></Text>
           </View>
           {order.notes && (
             <View style={styles.notesBox}>
                <Text style={[styles.notesTxt, { color: theme.icon }]}>Note: {order.notes}</Text>
             </View>
           )}
        </View>

        <View style={{ height: 160 }} />
      </ScrollView>

      {/* Floating Action Dock - Startup Style */}
      <View style={[styles.actionDock, { backgroundColor: theme.card }]}>
         <BlurView intensity={Platform.OS === 'ios' ? 20 : 0} style={StyleSheet.absoluteFill} />
         
         {order.status === 'pending' && (
           <TouchableOpacity 
             style={[styles.primaryAction, { backgroundColor: '#8B5CF6' }]}
             onPress={() => updateStatus('confirmed')}
             activeOpacity={0.8}
           >
              <Lucide.CheckCircle2 size={24} color="white" />
              <Text style={styles.primaryActionTxt}>CONFIRM ORDER</Text>
           </TouchableOpacity>
         )}

         {order.status === 'confirmed' && (
           <TouchableOpacity 
             style={[styles.primaryAction, { backgroundColor: '#0EA5E9' }]}
             onPress={() => updateStatus('out_for_delivery')}
             activeOpacity={0.8}
           >
              <Lucide.Truck size={24} color="white" />
              <Text style={styles.primaryActionTxt}>DISPATCH NOW</Text>
           </TouchableOpacity>
         )}

         {order.status === 'out_for_delivery' && (
           <TouchableOpacity 
             style={[styles.primaryAction, { backgroundColor: '#10B981' }]}
             onPress={() => updateStatus('delivered')}
             activeOpacity={0.8}
           >
              <Lucide.PackagePlus size={24} color="white" />
              <Text style={styles.primaryActionTxt}>MARK DELIVERED</Text>
           </TouchableOpacity>
         )}

         {['pending', 'confirmed'].includes(order.status) && (
           <TouchableOpacity 
             style={styles.secondaryAction}
             onPress={() => Alert.alert('Cancel Order', 'Reason required', [{ text: 'No' }, { text: 'Cancel Order', onPress: () => updateStatus('cancelled'), style: 'destructive' }])}
           >
              <Lucide.Trash2 size={20} color="#EF4444" />
              <Text style={styles.secondaryActionTxt}>Reject</Text>
           </TouchableOpacity>
         )}

         {['delivered', 'cancelled'].includes(order.status) && (
           <TouchableOpacity style={[styles.primaryAction, { backgroundColor: theme.border }]} disabled>
              <Text style={[styles.primaryActionTxt, { color: theme.icon }]}>ORDER ARCHIVED</Text>
           </TouchableOpacity>
         )}
      </View>

      {updating && (
        <View style={styles.overlay}>
           <BlurView intensity={30} tint="dark" style={StyleSheet.absoluteFill} />
           <ActivityIndicator size="large" color="white" />
           <Text style={{ color: 'white', marginTop: 15, fontWeight: '800' }}>Processing Request...</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    height: 120,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 40,
    zIndex: 10,
  },
  headerTitle: { color: 'white', fontSize: 20, fontWeight: '900', letterSpacing: -0.5 },
  backCircle: {
    width: 44, height: 44, borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center', alignItems: 'center',
  },
  scrollContent: { paddingHorizontal: 20, paddingTop: 10 },
  statusFloatCard: {
    padding: 24,
    borderRadius: 32,
    marginTop: -30,
    elevation: 20,
    shadowColor: '#000', shadowOpacity: 0.15, shadowRadius: 20,
    marginBottom: 25,
  },
  statusRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  orderIdText: { fontSize: 11, fontWeight: '800', letterSpacing: 1 },
  statusLabelLarge: { fontSize: 28, fontWeight: '900', letterSpacing: -1, marginTop: 4 },
  statusIconWrap: { width: 64, height: 64, borderRadius: 22, justifyContent: 'center', alignItems: 'center' },
  miniDivider: { height: 1, marginBottom: 20, opacity: 0.05 },
  statsGrid: { flexDirection: 'row', justifyContent: 'space-between' },
  statBox: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  statVal: { fontSize: 14, fontWeight: '800' },
  sectionLabel: { fontSize: 12, fontWeight: '900', color: '#64748B', marginBottom: 12, letterSpacing: 1.5, marginLeft: 5 },
  customerBrandedCard: {
    padding: 20, borderRadius: 24, borderWidth: 1.5, marginBottom: 25,
  },
  customerRow: { flexDirection: 'row', alignItems: 'center', gap: 15 },
  initialCircle: { width: 56, height: 56, borderRadius: 18, justifyContent: 'center', alignItems: 'center' },
  custName: { fontSize: 18, fontWeight: '800' },
  custPhone: { fontSize: 13, fontWeight: '600' },
  custActionRow: { flexDirection: 'row', gap: 10 },
  roundAction: { width: 44, height: 44, borderRadius: 22, justifyContent: 'center', alignItems: 'center' },
  addressCard: { borderRadius: 24, borderWidth: 1.5, overflow: 'hidden', marginBottom: 25 },
  mapSim: { height: 120, justifyContent: 'center', alignItems: 'center', position: 'relative' },
  pathSim: { position: 'absolute', bottom: 30, width: 200, height: 1, backgroundColor: 'rgba(0,0,0,0.05)', borderRadius: 1 },
  addressInfo: { padding: 20, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 15 },
  addressTxt: { flex: 1, fontSize: 14, fontWeight: '600', lineHeight: 22 },
  dirBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: '#efe7ff', padding: 10, borderRadius: 12 },
  dirBtnTxt: { color: '#8B5CF6', fontSize: 11, fontWeight: '900' },
  paymentCard: { padding: 20, borderRadius: 24, borderWidth: 1.5, marginBottom: 25 },
  payRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  payTxt: { fontSize: 15, fontWeight: '700' },
  notesBox: { marginTop: 12, paddingTop: 12, borderTopWidth: 1, borderTopColor: 'rgba(0,0,0,0.05)' },
  notesTxt: { fontSize: 13, fontStyle: 'italic' },
  actionDock: {
    position: 'absolute',
    bottom: 0, left: 0, right: 0,
    paddingHorizontal: 20, paddingTop: 20, paddingBottom: 40,
    borderTopLeftRadius: 30, borderTopRightRadius: 30,
    flexDirection: 'row', gap: 12,
    elevation: 30, shadowColor: '#000', shadowOpacity: 0.2, shadowRadius: 20,
  },
  primaryAction: {
    flex: 2, height: 64, borderRadius: 22,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 12,
    elevation: 5,
  },
  primaryActionTxt: { color: 'white', fontSize: 16, fontWeight: '900', letterSpacing: 0.5 },
  secondaryAction: {
    flex: 1, height: 64, borderRadius: 22,
    borderWidth: 2, borderColor: '#EF444420',
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
  },
  secondaryActionTxt: { color: '#EF4444', fontSize: 14, fontWeight: '800' },
  overlay: { ...StyleSheet.absoluteFillObject, justifyContent: 'center', alignItems: 'center', zIndex: 999 },
  errorTitle: { fontSize: 24, fontWeight: '900', marginTop: 20 },
  errorSub: { fontSize: 15, textAlign: 'center', marginTop: 10, lineHeight: 22 },
  goBackBtn: { backgroundColor: '#8B5CF6', paddingVertical: 14, paddingHorizontal: 30, borderRadius: 20, marginTop: 30 },
  goBackTxt: { color: 'white', fontWeight: '900' },
});
