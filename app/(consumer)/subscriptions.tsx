import React, { useEffect, useState, useCallback } from 'react';
import { StyleSheet, View, Text, ScrollView, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { 
  Calendar, 
  Droplet, 
  ChevronRight, 
  Plus, 
  Clock, 
  MapPin, 
  ShieldCheck,
  Zap,
  ArrowLeft
} from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { consumerService } from '@/services/consumerService';

export default function Subscriptions() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme ?? 'light'];
  
  const [subscription, setSubscription] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSubscription();
  }, []);

  const fetchSubscription = useCallback(async () => {
    try {
      setLoading(true);
      const data = await consumerService.getActiveSubscription();
      setSubscription(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      fetchSubscription();
    }, [fetchSubscription])
  );
  
  if (loading) {
     return (
       <View style={[styles.container, { backgroundColor: theme.background, justifyContent: 'center' }]}>
         <ActivityIndicator size="large" color={theme.primary} />
       </View>
     );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={[styles.backBtn, { borderColor: theme.border }]}>
          <ArrowLeft size={24} color={theme.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: theme.text }]}>My Subscriptions</Text>
        <View style={{ width: 44 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {!subscription ? (
          <View style={styles.emptyContainer}>
            <LinearGradient
              colors={['#0EA5E9', '#2563EB']}
              style={styles.heroCard}
            >
               <Calendar size={64} color="white" strokeWidth={1.5} />
               <Text style={styles.heroTitle}>Hassle-free Water</Text>
               <Text style={styles.heroSub}>Set up a recurring schedule and never run out of water again.</Text>
               <TouchableOpacity 
                 style={styles.heroBtn}
                 onPress={() => router.push('/(consumer)/home')} // Direct them to browse vendors
               >
                 <Text style={styles.heroBtnText}>Find a Vendor</Text>
               </TouchableOpacity>
            </LinearGradient>

            <View style={styles.benefitsSection}>
               <Text style={[styles.sectionTitle, { color: theme.text }]}>Why Subscribe?</Text>
               <View style={styles.benefitItem}>
                  <View style={[styles.iconWrap, { backgroundColor: '#10B98115' }]}>
                     <Zap size={20} color="#10B981" />
                  </View>
                  <View style={styles.benefitInfo}>
                     <Text style={[styles.benefitTitle, { color: theme.text }]}>Priority Delivery</Text>
                     <Text style={[styles.benefitText, { color: theme.icon }]}>Subscribers get their water delivered first every morning.</Text>
                  </View>
               </View>
               <View style={styles.benefitItem}>
                  <View style={[styles.iconWrap, { backgroundColor: '#8B5CF615' }]}>
                     <Clock size={20} color="#8B5CF6" />
                  </View>
                  <View style={styles.benefitInfo}>
                     <Text style={[styles.benefitTitle, { color: theme.text }]}>Fixed Schedule</Text>
                     <Text style={[styles.benefitText, { color: theme.icon }]}>Pick your preferred days and we&apos;ll handle the rest.</Text>
                  </View>
               </View>
            </View>
          </View>
        ) : (
          <View style={styles.activeSubContainer}>
            <View style={[styles.subCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
              <View style={styles.subCardHeader}>
                 <View style={styles.subTypeLabel}>
                    <ShieldCheck size={16} color={theme.primary} />
                    <Text style={[styles.subTypeName, { color: theme.primary }]}>{subscription.type.toUpperCase()} PLAN</Text>
                 </View>
                 <View style={[styles.statusBadge, { backgroundColor: '#10B98120' }]}>
                    <View style={[styles.statusDot, { backgroundColor: '#10B981' }]} />
                    <Text style={[styles.statusText, { color: '#10B981' }]}>ACTIVE</Text>
                 </View>
              </View>

              <Text style={[styles.vendorName, { color: theme.text }]}>{subscription.vendor?.businessName || subscription.vendor?.name}</Text>
              
              <View style={[styles.divider, { backgroundColor: theme.border }]} />

              <View style={styles.subDetails}>
                 <View style={styles.detailRow}>
                    <Droplet size={18} color={theme.icon} />
                    <Text style={[styles.detailText, { color: theme.text }]}>{subscription.quantity} Cans per delivery</Text>
                 </View>
                 <View style={styles.detailRow}>
                    <Calendar size={18} color={theme.icon} />
                    <Text style={[styles.detailText, { color: theme.text }]}>Frequency: {subscription.frequency}</Text>
                 </View>
                 <View style={styles.detailRow}>
                    <Clock size={18} color={theme.icon} />
                    <Text style={[styles.detailText, { color: theme.text }]}>Next delivery: {subscription.nextDelivery ? new Date(subscription.nextDelivery).toDateString() : 'TBD'}</Text>
                 </View>
              </View>

              <TouchableOpacity style={[styles.manageBtn, { backgroundColor: theme.primary }]}>
                 <Text style={styles.manageBtnText}>Manage Schedule</Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity 
              style={[styles.pauseBtn, { borderColor: theme.error + '30' }]}
              onPress={() => Alert.alert('Pause Subscription', 'Are you sure you want to pause your deliveries?')}
            >
               <Text style={{ color: theme.error, fontWeight: '700' }}>Pause Subscription</Text>
            </TouchableOpacity>
          </View>
        )}
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
    paddingTop: 60,
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '800',
  },
  backBtn: {
    width: 44,
    height: 44,
    borderRadius: 14,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 40,
  },
  emptyContainer: {},
  heroCard: {
    borderRadius: 32,
    padding: 32,
    alignItems: 'center',
    marginBottom: 32,
  },
  heroTitle: {
    color: 'white',
    fontSize: 24,
    fontWeight: '900',
    marginTop: 20,
    textAlign: 'center',
  },
  heroSub: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 14,
    textAlign: 'center',
    marginTop: 8,
    lineHeight: 20,
  },
  heroBtn: {
    backgroundColor: 'white',
    paddingVertical: 14,
    paddingHorizontal: 28,
    borderRadius: 16,
    marginTop: 24,
  },
  heroBtnText: {
    color: '#0EA5E9',
    fontWeight: '800',
    fontSize: 15,
  },
  benefitsSection: {
     marginTop: 10,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '800',
    marginBottom: 20,
  },
  benefitItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 16,
    marginBottom: 24,
  },
  iconWrap: {
    width: 44,
    height: 44,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  benefitInfo: {
    flex: 1,
  },
  benefitTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 4,
  },
  benefitText: {
    fontSize: 13,
    lineHeight: 18,
  },
  activeSubContainer: {
    gap: 20,
  },
  subCard: {
    borderRadius: 28,
    borderWidth: 1,
    padding: 24,
  },
  subCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  subTypeLabel: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  subTypeName: {
    fontSize: 12,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 10,
    gap: 6,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  statusText: {
    fontSize: 10,
    fontWeight: '800',
  },
  vendorName: {
     fontSize: 22,
     fontWeight: '800',
     marginBottom: 16,
  },
  divider: {
    height: 1,
    opacity: 0.1,
    marginBottom: 20,
  },
  subDetails: {
    gap: 12,
    marginBottom: 24,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  detailText: {
    fontSize: 15,
    fontWeight: '600',
  },
  manageBtn: {
    height: 56,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  manageBtnText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '700',
  },
  pauseBtn: {
    height: 56,
    borderRadius: 18,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
  }
});
