import React, { useState, useEffect, useCallback } from 'react';
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  TextInput,
  Dimensions,
  Platform,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import {
  ArrowLeft,
  ShoppingCart,
  MapPin,
  Droplet,
  CreditCard,
  CheckCircle,
  Minus,
  Plus,
  Truck,
  Clock,
  Zap,
  Edit2,
  ShieldCheck
} from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { consumerService } from '@/services/consumerService';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { width } = Dimensions.get('window');

export default function OrderSummaryScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme ?? 'light'];
  const params = useLocalSearchParams<{
    vendorId: string;
    vendorName: string;
    pricePerCan: string;
    vendorLocation: string;
    deliveryAddress?: string;
    deliveryBaseFee?: string;
    deliveryPerKmFee?: string;
  }>();

  const vendorId = params.vendorId || '';
  const vendorName = params.vendorName || 'Unknown Vendor';
  const pricePerCan = parseFloat(params.pricePerCan || '30');

  const [quantity, setQuantity] = useState(1);
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [isEditingAddress, setIsEditingAddress] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<'wallet' | 'cash'>('wallet');
  const [loading, setLoading] = useState(false);
  const [placed, setPlaced] = useState(false);
  const [initialLoad, setInitialLoad] = useState(true);
  const [vendorRel, setVendorRel] = useState<any>(null);

  // Load saved address and vendor relationship
  useEffect(() => {
    const loadSavedData = async () => {
      try {
        setInitialLoad(true);
        // 1. Try AsyncStorage
        const savedAddress = await AsyncStorage.getItem('last_delivery_address');
        
        // 2. Try Latest Order from API as fallback/refresh
        const latestOrder = await consumerService.getLatestOrder();
        
        if (latestOrder && latestOrder.address) {
          setDeliveryAddress(latestOrder.address);
          await AsyncStorage.setItem('last_delivery_address', latestOrder.address);
        } else if (savedAddress) {
          setDeliveryAddress(savedAddress);
        }

        // 3. Fetch Relationship to get distance-based delivery charge
        if (vendorId) {
          const { requests } = await consumerService.getMyVendorRequests();
          const rel = requests.find((r: any) => 
            (r.vendor?._id === vendorId || r.vendor === vendorId) && 
            r.status === 'accepted'
          );
          if (rel) setVendorRel(rel);
        }
      } catch (err) {
        console.error('Failed to load data', err);
      } finally {
        setInitialLoad(false);
      }
    };
    loadSavedData();
  }, [vendorId]);

  const subtotal = quantity * pricePerCan;
  const deliveryFee = vendorRel?.deliveryCharge ?? parseFloat(params.deliveryBaseFee || '20');
  const total = subtotal + deliveryFee;

  const handlePlaceOrder = async () => {
    if (!vendorId) {
      Alert.alert('Error', 'Vendor information missing. Please go back and try again.');
      return;
    }
    if (!deliveryAddress.trim()) {
      Alert.alert('Address Required', 'Please enter a delivery address.');
      setIsEditingAddress(true);
      return;
    }
    try {
      setLoading(true);
      await consumerService.createOrder({
        vendorId,
        quantity,
        address: deliveryAddress,
        notes: `Payment: ${paymentMethod}`,
      });
      
      // Save address for future
      await AsyncStorage.setItem('last_delivery_address', deliveryAddress);
      
      setPlaced(true);
    } catch (err: any) {
      Alert.alert('Order Failed', err.message || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (placed) {
    return (
      <View style={[styles.container, { backgroundColor: theme.background, justifyContent: 'center', alignItems: 'center' }]}>
        <LinearGradient colors={['#10B981', '#34D399']} style={styles.successCircle}>
          <CheckCircle size={60} color="white" />
        </LinearGradient>
        <Text style={[styles.successTitle, { color: theme.text }]}>Order Placed! 🎉</Text>
        <Text style={[styles.successSub, { color: theme.icon }]}>
          Your {quantity} jar{quantity > 1 ? 's' : ''} will be delivered soon.
        </Text>
        <TouchableOpacity
          style={styles.trackBtn}
          onPress={() => router.replace('/(consumer)/track')}
        >
          <LinearGradient colors={['#6366F1', '#8B5CF6']} style={styles.trackBtnGrad}>
            <Truck size={20} color="white" />
            <Text style={styles.trackBtnText}>Track My Order</Text>
          </LinearGradient>
        </TouchableOpacity>
        <TouchableOpacity style={{ marginTop: 20 }} onPress={() => router.replace('/(consumer)/home')}>
          <Text style={{ color: theme.icon, fontWeight: '600' }}>Back to Home</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={[styles.backBtn, { borderColor: theme.border, backgroundColor: theme.card }]}>
          <ArrowLeft size={22} color={theme.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: theme.text }]}>Checkout</Text>
        <View style={{ width: 44 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

        {/* Vendor Info Card - SOLID & DARK for contrast */}
        <LinearGradient colors={['#1E1B4B', '#312E81']} style={styles.vendorBanner}>
          <View style={styles.vendorBannerInner}>
            <View style={[styles.vendorIconWrap, { backgroundColor: 'rgba(255,255,255,0.1)' }]}>
              <Droplet size={28} color="#818CF8" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.vendorBannerName}>{vendorName}</Text>
              <View style={styles.etaRow}>
                <ShieldCheck size={14} color="#10B981" />
                <Text style={styles.etaText}>Verified JalSaathi Partner</Text>
              </View>
            </View>
            <View style={styles.priceTag}>
               <Text style={styles.priceTagVal}>₹{pricePerCan}</Text>
               <Text style={styles.priceTagUnit}>/jar</Text>
            </View>
          </View>
        </LinearGradient>

        <Text style={styles.sectionLabel}>ORDER DETAILS</Text>

        {/* Quantity Selector - Enhanced Visibility */}
        <View style={[styles.card, { backgroundColor: theme.card, borderColor: theme.border, shadowOpacity: 0.1 }]}>
          <View style={styles.qtyRow}>
            <View style={styles.qtyInfo}>
              <Text style={[styles.qtyLabel, { color: theme.text }]}>Number of Jars</Text>
              <Text style={[styles.qtySub, { color: theme.icon }]}>Standard 20L Cans</Text>
            </View>
            <View style={[styles.qtyControls, { backgroundColor: theme.background, borderWidth: 1, borderColor: theme.border }]}>
              <TouchableOpacity
                onPress={() => setQuantity(Math.max(1, quantity - 1))}
                style={[styles.qtyControlBtn]}
              >
                <Minus size={20} color={theme.text} />
              </TouchableOpacity>
              <Text style={[styles.qtyNumber, { color: theme.text }]}>{quantity}</Text>
              <TouchableOpacity
                onPress={() => setQuantity(quantity + 1)}
                style={[styles.qtyControlBtn, { backgroundColor: '#6366F120' }]}
              >
                <Plus size={20} color="#6366F1" />
              </TouchableOpacity>
            </View>
          </View>
        </View>

        <Text style={styles.sectionLabel}>DELIVERY ADDRESS</Text>

        {/* Delivery Address - Auto Save & Faster Flow */}
        <View style={[styles.card, { backgroundColor: theme.card, borderColor: isEditingAddress ? '#6366F1' : theme.border }]}>
          {isEditingAddress ? (
            <View style={{ gap: 12 }}>
               <TextInput
                 style={[styles.addressTextInput, { color: theme.text, backgroundColor: theme.background, borderColor: theme.border }]}
                 placeholder="Enter your house no, building, street..."
                 placeholderTextColor={theme.icon}
                 value={deliveryAddress}
                 onChangeText={setDeliveryAddress}
                 multiline
                 autoFocus
               />
               <TouchableOpacity 
                 style={styles.saveAddressBtn}
                 onPress={() => {
                   if(deliveryAddress.trim()) setIsEditingAddress(false);
                   else Alert.alert('Invalid', 'Please enter a valid address');
                 }}
               >
                  <Text style={styles.saveAddressTxt}>Save Address</Text>
               </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.addressDisplayRow}>
               <View style={styles.addressIconWrap}>
                  <MapPin size={22} color="#EF4444" />
               </View>
               <View style={{ flex: 1 }}>
                  {initialLoad ? (
                    <ActivityIndicator size="small" color={theme.primary} />
                  ) : (
                    <Text style={[styles.addressText, { color: theme.text }]}>
                      {deliveryAddress || 'No address saved yet'}
                    </Text>
                  )}
               </View>
               <TouchableOpacity 
                 style={styles.editBtn} 
                 onPress={() => setIsEditingAddress(true)}
               >
                  <Edit2 size={16} color={theme.primary} />
                  <Text style={[styles.editBtnTxt, { color: theme.primary }]}>Change</Text>
               </TouchableOpacity>
            </View>
          )}
        </View>

        <Text style={styles.sectionLabel}>PAYMENT METHOD</Text>

        {/* Payment Method - High Contrast */}
        <View style={[styles.card, { backgroundColor: theme.card, borderColor: theme.border }]}>
          <View style={styles.paymentOptions}>
            {[
              { key: 'wallet', label: 'JalSaathi Wallet', icon: Zap, color: '#818CF8' },
              { key: 'cash', label: 'Cash on Delivery', icon: CreditCard, color: '#10B981' },
            ].map((opt) => {
              const IconComp = opt.icon;
              const active = paymentMethod === opt.key;
              return (
                <TouchableOpacity
                  key={opt.key}
                  style={[
                    styles.paymentOption,
                    {
                      borderColor: active ? opt.color : theme.border,
                      backgroundColor: active ? opt.color + '10' : theme.background,
                    },
                  ]}
                  onPress={() => setPaymentMethod(opt.key as 'wallet' | 'cash')}
                >
                  <View style={[styles.paymentIconWrap, { backgroundColor: active ? opt.color : theme.border + '40' }]}>
                    <IconComp size={18} color={active ? 'white' : theme.icon} />
                  </View>
                  <View style={{ flex: 1 }}>
                     <Text style={[styles.paymentLabel, { color: active ? theme.text : theme.icon, fontWeight: active ? '800' : '600' }]}>
                       {opt.label}
                     </Text>
                     {active && <Text style={{ fontSize: 10, color: opt.color, fontWeight: '700' }}>SELECTED</Text>}
                  </View>
                  {active && <CheckCircle size={20} color={opt.color} />}
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        <Text style={styles.sectionLabel}>BILLING SUMMARY</Text>

        {/* Price Breakdown - Professional Look */}
        <View style={[styles.card, { backgroundColor: theme.card, borderColor: theme.border, paddingVertical: 10 }]}>
          <View style={styles.priceRow}>
            <Text style={[styles.priceLabel, { color: theme.icon }]}>Water Cans (x{quantity})</Text>
            <Text style={[styles.priceValue, { color: theme.text }]}>₹{subtotal}</Text>
          </View>

          <View style={styles.priceRow}>
            <Text style={[styles.priceLabel, { color: theme.icon }]}>Delivery Charges</Text>
            <Text style={[styles.priceValue, { color: deliveryFee === 0 ? '#10B981' : theme.text }]}>
              {deliveryFee === 0 ? 'FREE' : `₹${deliveryFee}`}
            </Text>
          </View>

          {deliveryFee === 0 && (
            <View style={[styles.freeDeliveryBadge, { backgroundColor: '#10B98110' }]}>
              <Text style={{ color: '#10B981', fontSize: 11, fontWeight: '800' }}>
                EXCELLENT! NO DELIVERY FEE APPLIED
              </Text>
            </View>
          )}

          <View style={[styles.divider, { backgroundColor: theme.border }]} />

          <View style={styles.totalRow}>
            <Text style={[styles.totalLabel, { color: theme.text }]}>To Pay</Text>
            <Text style={[styles.totalValue, { color: theme.text }]}>₹{total}</Text>
          </View>
        </View>

        <View style={{ height: 140 }} />
      </ScrollView>

      {/* Place Order Button - ULTRA CONTRAST */}
      <View style={[styles.bottomBar, { backgroundColor: theme.background, borderTopColor: theme.border }]}>
        <View style={styles.bottomInfo}>
          <Text style={[styles.bottomTotal, { color: theme.text }]}>₹{total}</Text>
          <Text style={[styles.bottomSub, { color: theme.icon }]}>Grand Total</Text>
        </View>
        <TouchableOpacity
          style={styles.placeOrderBtn}
          onPress={handlePlaceOrder}
          disabled={loading}
          activeOpacity={0.8}
        >
          <LinearGradient colors={['#6366F1', '#8B5CF6']} style={styles.placeOrderGrad}>
            {loading ? (
              <ActivityIndicator color="white" />
            ) : (
              <>
                <Text style={styles.placeOrderText}>PLACE ORDER</Text>
                <ArrowLeft size={20} color="white" style={{ transform: [{ rotate: '180deg' }] }} />
              </>
            )}
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 55,
    paddingHorizontal: 20,
    paddingBottom: 16,
  },
  headerTitle: { fontSize: 22, fontWeight: '900', letterSpacing: -0.5 },
  backBtn: {
    width: 44,
    height: 44,
    borderRadius: 12,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollContent: { paddingHorizontal: 20, paddingTop: 8 },
  vendorBanner: {
    borderRadius: 24,
    padding: 24,
    marginBottom: 25,
  },
  vendorBannerInner: { flexDirection: 'row', alignItems: 'center', gap: 16 },
  vendorIconWrap: {
    width: 60,
    height: 60,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  vendorBannerName: { color: 'white', fontSize: 20, fontWeight: '900', marginBottom: 2 },
  etaRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  etaText: { color: '#34D399', fontSize: 13, fontWeight: '700' },
  priceTag: {
    backgroundColor: 'rgba(255,255,255,0.15)',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    alignItems: 'center',
  },
  priceTagVal: { color: 'white', fontSize: 18, fontWeight: '900' },
  priceTagUnit: { color: 'rgba(255,255,255,0.6)', fontSize: 10, fontWeight: '700' },
  sectionLabel: { fontSize: 12, fontWeight: '800', color: '#64748B', marginBottom: 12, marginTop: 10, letterSpacing: 1 },
  card: {
    borderRadius: 24,
    padding: 20,
    marginBottom: 20,
    borderWidth: 1.5,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 10,
  },
  qtyRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  qtyInfo: { gap: 2 },
  qtyLabel: { fontSize: 16, fontWeight: '800' },
  qtySub: { fontSize: 12, fontWeight: '600' },
  qtyControls: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 14,
    padding: 4,
    gap: 12,
  },
  qtyControlBtn: {
    width: 44,
    height: 44,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  qtyNumber: { fontSize: 22, fontWeight: '900', minWidth: 32, textAlign: 'center' },
  addressDisplayRow: { flexDirection: 'row', alignItems: 'center', gap: 15 },
  addressIconWrap: { width: 44, height: 44, borderRadius: 12, backgroundColor: '#FEF2F2', justifyContent: 'center', alignItems: 'center' },
  addressText: { fontSize: 15, fontWeight: '600', lineHeight: 22 },
  editBtn: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: '#EEF2FF', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 10 },
  editBtnTxt: { fontSize: 12, fontWeight: '800' },
  addressTextInput: {
    borderWidth: 1,
    borderRadius: 16,
    padding: 16,
    minHeight: 100,
    fontSize: 16,
    textAlignVertical: 'top',
  },
  saveAddressBtn: {
    backgroundColor: '#6366F1',
    height: 50,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  saveAddressTxt: { color: 'white', fontWeight: '800', fontSize: 15 },
  paymentOptions: { gap: 12 },
  paymentOption: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 15,
    borderWidth: 2,
    borderRadius: 18,
    padding: 16,
  },
  paymentIconWrap: { width: 36, height: 36, borderRadius: 10, justifyContent: 'center', alignItems: 'center' },
  paymentLabel: { fontSize: 15 },
  priceRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  priceLabel: { fontSize: 15, fontWeight: '600' },
  priceValue: { fontSize: 15, fontWeight: '800' },
  freeDeliveryBadge: {
    padding: 10,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 15,
  },
  divider: { height: 1, marginVertical: 10, opacity: 0.1 },
  totalRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 5 },
  totalLabel: { fontSize: 18, fontWeight: '900' },
  totalValue: { fontSize: 24, fontWeight: '900' },
  bottomBar: {
    position: 'absolute',
    bottom: 0, left: 0, right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: Platform.OS === 'ios' ? 40 : 25,
    borderTopWidth: 1,
    gap: 16,
    elevation: 30,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 20,
  },
  bottomInfo: { flex: 1 },
  bottomTotal: { fontSize: 26, fontWeight: '900' },
  bottomSub: { fontSize: 12, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.5 },
  placeOrderBtn: { borderRadius: 22, overflow: 'hidden', flex: 1.5 },
  placeOrderGrad: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 18,
    gap: 12,
  },
  placeOrderText: { color: 'white', fontSize: 18, fontWeight: '900', letterSpacing: 1 },
  successCircle: {
    width: 120, height: 120, borderRadius: 60,
    justifyContent: 'center', alignItems: 'center', marginBottom: 28,
  },
  successTitle: { fontSize: 32, fontWeight: '900', marginBottom: 10 },
  successSub: { fontSize: 17, textAlign: 'center', marginBottom: 40, paddingHorizontal: 40, lineHeight: 26 },
  trackBtn: { borderRadius: 20, overflow: 'hidden', width: '80%' },
  trackBtnGrad: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 20,
    gap: 15,
  },
  trackBtnText: { color: 'white', fontSize: 20, fontWeight: '900' },
});
