import React, { useEffect, useState, useCallback } from 'react';
import { StyleSheet, View, Text, ScrollView, TouchableOpacity, Image, ActivityIndicator, Alert, TextInput, Dimensions } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { 
  ArrowLeft, 
  MapPin, 
  Phone, 
  Droplet,
  Clock,
  Star,
  ShoppingCart,
  Send,
  Zap,
  Calendar,
  ShieldCheck
} from 'lucide-react-native';
import { consumerService } from '@/services/consumerService';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';

const JalsaathiLogo = require('@/assets/images/jalsaathi_main.png');
const { height, width } = Dimensions.get('window');

export default function VendorDetailsScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme ?? 'light'];
  
  const [vendor, setVendor] = useState<any>(null);
  const [request, setRequest] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [quantity, setQuantity] = useState(1);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const [vData, rData] = await Promise.all([
        consumerService.getVendorById(id as string),
        consumerService.getMyVendorRequests()
      ]);
      
      setVendor(vData.vendor || vData); // Handle both {vendor: ...} and direct object
      
      const foundRequest = rData.requests?.find((r: any) => r.vendor?._id === id);
      setRequest(foundRequest);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    if (id) {
      fetchData();
    }
  }, [id, fetchData]);

  const handleConnect = async () => {
    try {
      setActionLoading(true);
      await consumerService.createVendorRequest(id as string);
      Alert.alert('Success', 'Request sent to vendor. Please wait for approval.');
      fetchData();
    } catch (err: any) {
      Alert.alert('Error', err.message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleOrder = async () => {
    if (!request || request.status !== 'accepted') {
      Alert.alert('Request Pending', 'Please wait for vendor to approve your connection.');
      return;
    }
    
    if (!vendor) return;

    // Navigate to Order Summary screen with vendor details
    router.push({
      // @ts-ignore
      pathname: '/(consumer)/order-summary',
      params: {
        vendorId: id as string,
        vendorName: vendor.businessName || vendor.name || 'Unknown Vendor',
        pricePerCan: String(vendor.pricePerCan || 30),
        vendorLocation: vendor.address || vendor.area || '',
      },
    });
  };

  const handleSubscribe = async () => {
    if (!request || request.status !== 'accepted') {
      Alert.alert('Request Pending', 'Please wait for vendor to approve your connection.');
      return;
    }

    Alert.alert(
      'Subscribe to Vendor',
      `Setup a ${quantity} jar regular supply with ${vendor.businessName}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Subscribe (Daily)',
          onPress: async () => {
            try {
              setActionLoading(true);
              await consumerService.createSubscription({
                vendorId: id as string,
                type: 'monthly',
                quantity,
                frequency: 'Daily',
                startDate: new Date().toISOString()
              });
              Alert.alert('Subscribed!', 'Your daily supply has been scheduled.', [
                { text: 'View Subscriptions', onPress: () => router.push('/(consumer)/subscriptions') }
              ]);
            } catch (err: any) {
              Alert.alert('Subscription Failed', err.message);
            } finally {
              setActionLoading(false);
            }
          }
        }
      ]
    );
  };

  if (loading) {
    return (
      <View style={[styles.container, { backgroundColor: theme.background, justifyContent: 'center' }]}>
        <ActivityIndicator size="large" color={theme.primary} />
      </View>
    );
  }

  if (!vendor) {
    return (
      <View style={[styles.container, { backgroundColor: theme.background, justifyContent: 'center', alignItems: 'center' }]}>
        <Text style={{ color: theme.icon }}>Vendor not found</Text>
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
        <Text style={[styles.headerTitle, { color: theme.text }]}>Vendor Details</Text>
        <View style={{ width: 44 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* ─── BRAND BILLBOARD ─── */}
        <View style={styles.bannerContainer}>
          <Image 
            source={JalsaathiLogo} 
            style={styles.bannerImg} 
            resizeMode="cover"
          />
          <LinearGradient 
             colors={['rgba(0,0,0,0.1)', 'rgba(0,0,0,0.5)']} 
             style={StyleSheet.absoluteFill} 
          />
          <View style={styles.badgeRow}>
             <BlurView intensity={30} tint="dark" style={styles.certBadge}>
                <ShieldCheck size={14} color="#10B981" />
                <Text style={styles.badgeText}>ISI CERTIFIED VENDOR</Text>
             </BlurView>
          </View>
        </View>
        
        <View style={styles.contentWrap}>
           <View style={styles.titleRow}>
             <View>
               <Text style={[styles.vendorName, { color: theme.text }]}>{vendor.businessName || vendor.name}</Text>
               <View style={styles.ratingRow}>
                 <Star size={14} color="#F59E0B" fill="#F59E0B" />
                 <Text style={[styles.ratingText, { color: theme.icon }]}>4.8 • Verified Partner</Text>
               </View>
             </View>
             <TouchableOpacity style={[styles.callBtn, { backgroundColor: '#10B98115' }]}>
               <Phone size={22} color="#10B981" />
             </TouchableOpacity>
           </View>

           <View style={[styles.divider, { backgroundColor: theme.border }]} />

           {/* Stats Grid */}
           <View style={styles.statsGrid}>
             <View style={styles.statItem}>
               <Zap size={20} color={theme.primary} />
               <Text style={[styles.statVal, { color: theme.text }]}>₹{vendor.pricePerCan}</Text>
               <Text style={[styles.statLab, { color: theme.icon }]}>Per Jar</Text>
             </View>
             <View style={styles.statItem}>
               <Clock size={20} color="#F59E0B" />
               <Text style={[styles.statVal, { color: theme.text }]}>30-45</Text>
               <Text style={[styles.statLab, { color: theme.icon }]}>Mins</Text>
             </View>
             <View style={styles.statItem}>
               <MapPin size={20} color="#EF4444" />
               <Text style={[styles.statVal, { color: theme.text }]}>{vendor.serviceRadius}km</Text>
               <Text style={[styles.statLab, { color: theme.icon }]}>Range</Text>
             </View>
           </View>

           <View style={styles.section}>
             <Text style={[styles.sectionTitle, { color: theme.text }]}>About</Text>
             <Text style={[styles.description, { color: theme.icon }]}>
               {vendor.description || "Leading pure water supplier in your locality. We ensure quality, hygiene, and timely delivery of RO treated drinking water cans."}
             </Text>
           </View>

            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: theme.text }]}>Location</Text>
              <View style={[styles.addressItem, { backgroundColor: theme.card, borderColor: theme.border }]}>
                 <MapPin size={20} color={theme.error} />
                 <Text style={[styles.addressText, { color: theme.text }]}>{vendor.address || vendor.area || "H.No 45, Civil Lines, Gurgaon"}</Text>
              </View>
            </View>

            {/* ─── PREMIUM JAR ORDERING SECTION ─── */}
            <View style={styles.section}>
               <Text style={[styles.sectionTitle, { color: theme.text }]}>Quick Order</Text>
               <LinearGradient 
                 colors={['#6366F1', '#8B5CF6']} 
                 start={{ x: 0, y: 0 }} 
                 end={{ x: 1, y: 1 }} 
                 style={styles.jarCard}
               >
                  <View style={styles.jarImageWrap}>
                     <BlurView intensity={20} tint="light" style={StyleSheet.absoluteFill} />
                     <View style={styles.jarIconBox}>
                        <Droplet size={60} color="white" fill="white" />
                        <View style={styles.jarLabelBox}>
                           <Text style={styles.jarLabelText}>20L</Text>
                        </View>
                     </View>
                  </View>
                  <View style={styles.jarInfoBox}>
                     <Text style={styles.jarTitle}>Premium Pure Water</Text>
                     <Text style={styles.jarSub}>Multi-stage filtration jar</Text>
                     <View style={styles.jarPriceBox}>
                        <Text style={styles.jarPriceVal}>₹{vendor.pricePerCan}</Text>
                        <Text style={styles.jarPriceUnit}>/ JAR</Text>
                     </View>
                  </View>
               </LinearGradient>
            </View>
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Persistent Bottom Bar */}
      <View style={[styles.bottomBar, { backgroundColor: theme.card, borderTopColor: theme.border }]}>
        {!request ? (
          <TouchableOpacity 
            style={styles.primaryAction} 
            onPress={handleConnect}
            disabled={actionLoading}
          >
            <LinearGradient colors={['#0EA5E9', '#38BDF8']} style={styles.btnGradient}>
              {actionLoading ? <ActivityIndicator color="white" /> : (
                <>
                  <Send size={20} color="white" />
                  <Text style={styles.primaryActionText}>Connect with Vendor</Text>
                </>
              )}
            </LinearGradient>
          </TouchableOpacity>
        ) : request.status === 'pending' ? (
          <View style={[styles.pendingBar, { backgroundColor: '#F59E0B20' }]}>
            <Clock size={20} color="#F59E0B" />
            <Text style={[styles.pendingText, { color: '#F59E0B' }]}>Approval Pending</Text>
          </View>
        ) : (
          <View style={styles.orderControls}>
             <View style={styles.qtyPicker}>
                <TouchableOpacity onPress={() => setQuantity(Math.max(1, quantity-1))} style={styles.qtyBtn}>
                  <Text style={[styles.qtyBtnText, { color: theme.primary }]}>-</Text>
                </TouchableOpacity>
                <Text style={[styles.qtyVal, { color: theme.text }]}>{quantity}</Text>
                <TouchableOpacity onPress={() => setQuantity(quantity+1)} style={styles.qtyBtn}>
                  <Text style={[styles.qtyBtnText, { color: theme.primary }]}>+</Text>
                </TouchableOpacity>
             </View>
             <TouchableOpacity style={[styles.qtyBtn, { backgroundColor: theme.primary + '10' }]} onPress={handleSubscribe}>
                <Calendar size={20} color={theme.primary} />
             </TouchableOpacity>
             <TouchableOpacity style={styles.orderAction} onPress={handleOrder}>
                <LinearGradient colors={['#10B981', '#34D399']} style={styles.orderGradient}>
                   <ShoppingCart size={20} color="white" />
                   <Text style={styles.primaryActionText}>Order Now</Text>
                </LinearGradient>
             </TouchableOpacity>
          </View>
        )}
      </View>
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
    paddingBottom: 40,
  },
  bannerContainer: {
    height: 220,
    width: '100%',
    overflow: 'hidden',
  },
  bannerImg: {
    width: '100%',
    height: '100%',
  },
  badgeRow: {
    position: 'absolute',
    top: 20,
    right: 20,
  },
  certBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  badgeText: { color: 'white', fontSize: 10, fontWeight: '900', letterSpacing: 0.5 },
  contentWrap: {
    paddingHorizontal: 20,
    paddingTop: 24,
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  vendorName: {
    fontSize: 26,
    fontWeight: '900',
    marginBottom: 4,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  ratingText: {
    fontSize: 14,
    fontWeight: '600',
  },
  callBtn: {
    width: 52,
    height: 52,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  divider: {
    height: 1,
    marginVertical: 24,
    opacity: 0.1,
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 32,
  },
  statItem: {
    alignItems: 'center',
  },
  statVal: {
    fontSize: 18,
    fontWeight: '900',
    marginTop: 8,
  },
  statLab: {
    fontSize: 12,
    marginTop: 2,
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '800',
    marginBottom: 12,
  },
  description: {
    fontSize: 14,
    lineHeight: 22,
  },
  addressItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 18,
    borderRadius: 22,
    borderWidth: 1,
    gap: 12,
  },
  addressText: {
    flex: 1,
    fontSize: 14,
    fontWeight: '500',
    lineHeight: 20,
  },
  jarCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    borderRadius: 30,
    gap: 20,
    elevation: 8,
    shadowColor: '#6366F1',
    shadowOpacity: 0.2,
    shadowRadius: 15,
  },
  jarImageWrap: {
     width: 100,
     height: 100,
     borderRadius: 24,
     justifyContent: 'center',
     alignItems: 'center',
     overflow: 'hidden',
  },
  jarIconBox: {
     padding: 10,
     alignItems: 'center',
  },
  jarLabelBox: {
     position: 'absolute',
     bottom: -5,
     backgroundColor: '#0EA5E9',
     paddingHorizontal: 8,
     paddingVertical: 2,
     borderRadius: 10,
  },
  jarLabelText: { color: 'white', fontSize: 10, fontWeight: '900' },
  jarInfoBox: { flex: 1 },
  jarTitle: { color: 'white', fontSize: 18, fontWeight: '900' },
  jarSub: { color: 'rgba(255,255,255,0.7)', fontSize: 12, fontWeight: '600', marginTop: 2 },
  jarPriceBox: { flexDirection: 'row', alignItems: 'baseline', gap: 4, marginTop: 12 },
  jarPriceVal: { color: 'white', fontSize: 22, fontWeight: '900' },
  jarPriceUnit: { color: 'white', fontSize: 10, fontWeight: '700', opacity: 0.8 },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 100,
    paddingHorizontal: 20,
    paddingTop: 15,
    borderTopWidth: 1,
    elevation: 20,
  },
  primaryAction: {
    height: 60,
    borderRadius: 20,
    overflow: 'hidden',
  },
  btnGradient: {
    height: '100%',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 10,
  },
  primaryActionText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '800',
  },
  pendingBar: {
    height: 60,
    borderRadius: 20,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
  },
  pendingText: {
    fontSize: 16,
    fontWeight: '800',
  },
  orderControls: {
    flexDirection: 'row',
    gap: 12,
  },
  qtyPicker: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.05)',
    borderRadius: 20,
    paddingHorizontal: 12,
    gap: 16,
  },
  qtyBtn: {
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  qtyBtnText: {
    fontSize: 24,
    fontWeight: '700',
  },
  qtyVal: {
    fontSize: 18,
    fontWeight: '800',
    minWidth: 20,
    textAlign: 'center',
  },
  orderAction: {
    flex: 1,
    height: 60,
    borderRadius: 20,
    overflow: 'hidden',
  },
  orderGradient: {
    height: '100%',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 10,
  }
});
