import React, { useEffect, useState, useCallback } from 'react';
import { StyleSheet, View, Text, ScrollView, TouchableOpacity, Image, ActivityIndicator } from 'react-native';
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
  Clock,
  History
} from 'lucide-react-native';
import { consumerService } from '@/services/consumerService';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';

export default function OrderDetailsScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme ?? 'light'];
  
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const fetchOrderDetails = useCallback(async () => {
    try {
      setLoading(true);
      const data = await consumerService.getOrderById(id as string);
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
        <TouchableOpacity onPress={() => router.push('/(consumer)/orders')} style={{ marginTop: 20 }}>
          <Text style={{ color: theme.primary, fontWeight: '700' }}>Go to History</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'delivered': return '#10B981';
      case 'out_for_delivery': return '#0EA5E9';
      case 'confirmed': return '#F59E0B';
      case 'pending': return '#64748B';
      default: return '#EF4444';
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <BlurView intensity={30} style={styles.headerBlur}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={[styles.backBtn, { backgroundColor: theme.card }]}>
            <ArrowLeft size={22} color={theme.text} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: theme.text }]}>Order Details</Text>
          <TouchableOpacity style={[styles.backBtn, { backgroundColor: theme.card }]}>
            <History size={20} color={theme.text} />
          </TouchableOpacity>
        </View>
      </BlurView>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Status Card with Glossy Feel */}
        <LinearGradient
          colors={[getStatusColor(order.status), getStatusColor(order.status) + 'CC']}
          style={styles.statusGradient}
        >
           <View style={styles.statusInner}>
              <View>
                 <Text style={styles.orderLabel}>ORDER #{order._id.slice(-6).toUpperCase()}</Text>
                 <Text style={styles.statusMain}>{order.status.replace('_', ' ').toUpperCase()}</Text>
              </View>
              <View style={styles.statusIconWrap}>
                 <Package size={32} color="white" />
              </View>
           </View>
           <View style={styles.statusFooter}>
              <Clock size={14} color="rgba(255,255,255,0.8)" />
              <Text style={styles.statusTime}>Status updated on {new Date(order.updatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</Text>
           </View>
        </LinearGradient>

        <View style={styles.mainContent}>
          {/* Quick Info Grid */}
          <View style={styles.infoGrid}>
             <View style={[styles.infoItem, { backgroundColor: theme.card, borderColor: theme.border }]}>
                <Calendar size={20} color={theme.primary} />
                <Text style={[styles.infoLabel, { color: theme.icon }]}>Date</Text>
                <Text style={[styles.infoVal, { color: theme.text }]}>{new Date(order.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}</Text>
             </View>
             <View style={[styles.infoItem, { backgroundColor: theme.card, borderColor: theme.border }]}>
                <Droplet size={20} color="#34D399" />
                <Text style={[styles.infoLabel, { color: theme.icon }]}>Quantity</Text>
                <Text style={[styles.infoVal, { color: theme.text }]}>{order.quantity} Jars</Text>
             </View>
             <View style={[styles.infoItem, { backgroundColor: theme.card, borderColor: theme.border }]}>
                <CreditCard size={20} color="#8B5CF6" />
                <Text style={[styles.infoLabel, { color: theme.icon }]}>Payment</Text>
                <Text style={[styles.infoVal, { color: theme.text }]}>{order.paymentStatus?.toUpperCase() || 'PAID'}</Text>
             </View>
          </View>

          {/* Vendor Details */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: theme.text }]}>Vendor Details</Text>
            <TouchableOpacity 
              style={[styles.vendorCard, { backgroundColor: theme.card, borderColor: theme.border }]}
              onPress={() => router.push({ pathname: '/(consumer)/vendor-details', params: { id: order.vendor?._id } })}
            >
              <Image source={{ uri: `https://picsum.photos/100?random=${order.vendor?._id}` }} style={styles.vendorImg} />
              <View style={styles.vendorInfo}>
                <Text style={[styles.vendorName, { color: theme.text }]}>{order.vendor?.businessName || order.vendor?.name}</Text>
                <Text style={[styles.vendorSub, { color: theme.icon }]}>{order.vendor?.area || 'Nearby Vendor'}</Text>
              </View>
              <ChevronRight size={20} color={theme.icon} />
            </TouchableOpacity>
          </View>

          {/* Delivery Timeline - Premium Style */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: theme.text }]}>Order Journey</Text>
            <View style={[styles.timelineCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
              {[
                { label: 'Order Placed', time: '10:00 AM', done: true },
                { label: 'Confirmed', time: '10:05 AM', done: ['confirmed','out_for_delivery','delivered'].includes(order.status) },
                { label: 'Out for Delivery', time: '---', done: ['out_for_delivery','delivered'].includes(order.status) },
                { label: 'Delivered', time: '---', done: order.status === 'delivered' },
              ].map((step, idx, arr) => (
                <View key={idx} style={styles.timelineItem}>
                  <View style={styles.timelineLeft}>
                    <View style={[styles.timelineDot, {
                      backgroundColor: step.done ? '#10B981' : theme.background,
                      borderColor: step.done ? '#10B981' : theme.border,
                    }]}>
                      {step.done && <CheckCircle2 size={12} color="white" />}
                    </View>
                    {idx < arr.length - 1 && (
                      <View style={[styles.timelineLine, { backgroundColor: step.done ? '#10B981' : theme.border }]} />
                    )}
                  </View>
                  <View style={styles.timelineRight}>
                    <Text style={[styles.timelineLabel, {
                      color: step.done ? theme.text : theme.icon,
                      fontWeight: step.done ? '800' : '600',
                    }]}>{step.label}</Text>
                    {step.done && <Text style={[styles.timelineTime, { color: theme.icon }]}>{step.time}</Text>}
                  </View>
                </View>
              ))}
            </View>
          </View>

          {/* Receipt Section */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: theme.text }]}>Order Receipt</Text>
            <BlurView intensity={20} style={[styles.receiptCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
               <View style={styles.receiptRow}>
                  <Text style={[styles.receiptLabel, { color: theme.icon }]}>Water Cans (x{order.quantity})</Text>
                  <Text style={[styles.receiptVal, { color: theme.text }]}>₹{order.totalAmount}</Text>
               </View>
               <View style={styles.receiptRow}>
                  <Text style={[styles.receiptLabel, { color: theme.icon }]}>Delivery Charges</Text>
                  <Text style={[styles.receiptVal, { color: '#10B981' }]}>FREE</Text>
               </View>
               <View style={[styles.divider, { backgroundColor: theme.border, marginVertical: 15 }]} />
               <View style={styles.receiptRow}>
                  <Text style={[styles.totalLabel, { color: theme.text }]}>Total Amount Paid</Text>
                  <Text style={[styles.totalVal, { color: theme.primary }]}>₹{order.totalAmount}</Text>
               </View>
               <View style={styles.paymentMethod}>
                  <LinearGradient colors={['#F8FAFC', '#F1F5F9']} style={styles.paymentBadge}>
                     <CreditCard size={14} color={theme.icon} />
                     <Text style={[styles.paymentText, { color: theme.icon }]}>via {order.paymentStatus === 'paid' ? 'Wallet' : 'Cash'}</Text>
                  </LinearGradient>
               </View>
            </BlurView>
          </View>

          {/* Actions */}
          <View style={styles.actionRow}>
            <TouchableOpacity style={[styles.miniAction, { backgroundColor: theme.card, borderColor: theme.border }]}>
               <Phone size={20} color={theme.primary} />
               <Text style={[styles.miniActionText, { color: theme.text }]}>Call Vendor</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.miniAction, { backgroundColor: theme.card, borderColor: theme.border }]}>
               <MessageSquare size={20} color={theme.primary} />
               <Text style={[styles.miniActionText, { color: theme.text }]}>Support</Text>
            </TouchableOpacity>
          </View>

          {order.status === 'delivered' && (
            <TouchableOpacity 
              style={styles.reorderBtn}
              onPress={() => router.push({ pathname: '/(consumer)/vendor-details', params: { id: order.vendor?._id } })}
            >
              <LinearGradient colors={['#0EA5E9', '#38BDF8']} style={styles.btnGradient}>
                 <Text style={styles.btnText}>Order Again</Text>
              </LinearGradient>
            </TouchableOpacity>
          )}

          {order.status === 'out_for_delivery' && (
             <TouchableOpacity 
               style={styles.reorderBtn}
               onPress={() => router.push('/(consumer)/track')}
             >
               <LinearGradient colors={['#10B981', '#34D399']} style={styles.btnGradient}>
                  <Text style={styles.btnText}>Track Live Location</Text>
               </LinearGradient>
             </TouchableOpacity>
          )}

          <View style={{ height: 60 }} />
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  headerBlur: {
    paddingTop: 55,
    paddingBottom: 15,
    zIndex: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  backBtn: {
    width: 44,
    height: 44,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.05)',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '900',
  },
  scrollContent: {
    paddingBottom: 40,
  },
  statusGradient: {
    padding: 30,
    paddingTop: 40,
    borderBottomLeftRadius: 40,
    borderBottomRightRadius: 40,
  },
  statusInner: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  orderLabel: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 12,
    fontWeight: '800',
    marginBottom: 4,
  },
  statusMain: {
    color: 'white',
    fontSize: 28,
    fontWeight: '900',
  },
  statusIconWrap: {
    width: 64,
    height: 64,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  statusFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 20,
    gap: 8,
  },
  statusTime: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 12,
    fontWeight: '600',
  },
  mainContent: {
    paddingTop: 24,
    paddingHorizontal: 20,
  },
  infoGrid: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 32,
  },
  infoItem: {
    flex: 1,
    padding: 16,
    borderRadius: 20,
    borderWidth: 1,
    alignItems: 'center',
    gap: 6,
  },
  infoLabel: {
    fontSize: 11,
    fontWeight: '700',
  },
  infoVal: {
    fontSize: 14,
    fontWeight: '800',
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '900',
    marginBottom: 16,
  },
  vendorCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 24,
    borderWidth: 1,
  },
  vendorImg: {
    width: 50,
    height: 50,
    borderRadius: 15,
    marginRight: 14,
  },
  vendorInfo: {
    flex: 1,
  },
  vendorName: {
    fontSize: 16,
    fontWeight: '800',
  },
  vendorSub: {
    fontSize: 12,
    fontWeight: '600',
  },
  timelineCard: {
    padding: 24,
    borderRadius: 28,
    borderWidth: 1,
  },
  timelineItem: {
    flexDirection: 'row',
    gap: 16,
  },
  timelineLeft: {
    alignItems: 'center',
    width: 24,
  },
  timelineDot: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  timelineLine: {
    width: 2,
    flex: 1,
    marginVertical: 4,
  },
  timelineRight: {
    flex: 1,
    paddingBottom: 25,
  },
  timelineLabel: {
    fontSize: 15,
  },
  timelineTime: {
    fontSize: 12,
    marginTop: 4,
  },
  receiptCard: {
    padding: 24,
    borderRadius: 32,
    borderWidth: 1,
    overflow: 'hidden',
  },
  receiptRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  receiptLabel: {
    fontSize: 14,
    fontWeight: '600',
  },
  receiptVal: {
    fontSize: 14,
    fontWeight: '700',
  },
  divider: {
    height: 1,
    opacity: 0.1,
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: '800',
  },
  totalVal: {
    fontSize: 22,
    fontWeight: '900',
  },
  paymentMethod: {
    marginTop: 20,
  },
  paymentBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 12,
    gap: 8,
    alignSelf: 'flex-start',
  },
  paymentText: {
    fontSize: 12,
    fontWeight: '800',
  },
  actionRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20,
  },
  miniAction: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 18,
    borderWidth: 1,
    gap: 10,
  },
  miniActionText: {
    fontSize: 14,
    fontWeight: '700',
  },
  reorderBtn: {
    borderRadius: 20,
    overflow: 'hidden',
    elevation: 5,
    shadowColor: '#0EA5E9',
    shadowOpacity: 0.3,
    shadowRadius: 15,
    shadowOffset: { width: 0, height: 8 },
  },
  btnGradient: {
    height: 60,
    justifyContent: 'center',
    alignItems: 'center',
  },
  btnText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '900',
  },
});

