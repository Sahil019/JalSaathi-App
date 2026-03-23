import React, { useEffect, useState } from 'react';
import { StyleSheet, View, Text, ScrollView, TouchableOpacity, ActivityIndicator, Dimensions } from 'react-native';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { 
  ArrowLeft, 
  Wallet, 
  TrendingUp, 
  Calendar, 
  ArrowDownLeft,
  ArrowUpRight,
  BarChart3,
  Star
} from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { deliveryService } from '@/services/deliveryService';

const { width } = Dimensions.get('window');

export default function DeliveryEarnings() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme ?? 'light'];
  
  const [loading, setLoading] = useState(true);
  const [earnings, setEarnings] = useState<any>(null);

  useEffect(() => {
    fetchEarnings();
  }, []);

  const fetchEarnings = async () => {
    try {
      setLoading(true);
      const data = await deliveryService.getEarningsSummary();
      setEarnings(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

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
        <Text style={[styles.headerTitle, { color: theme.text }]}>Earnings</Text>
        <TouchableOpacity style={[styles.dateChip, { backgroundColor: theme.card, borderColor: theme.border }]}>
           <Calendar size={16} color={theme.primary} />
           <Text style={[styles.dateText, { color: theme.text }]}>Weekly</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <LinearGradient
          colors={['#0EA5E9', '#2563EB']}
          style={styles.balanceCard}
        >
           <View style={styles.balanceHeader}>
              <View>
                 <Text style={styles.balanceLabel}>Est. Total Earnings</Text>
                 <Text style={styles.balanceAmt}>₹{(earnings?.estimatedEarnings || 0).toLocaleString()}</Text>
              </View>
              <View style={styles.walletIcon}>
                 <Wallet size={32} color="white" />
              </View>
           </View>
           <TouchableOpacity style={styles.withdrawBtn}>
              <Text style={styles.withdrawText}>Request Payout</Text>
           </TouchableOpacity>
        </LinearGradient>

        <View style={styles.statsRow}>
           <View style={[styles.statBox, { backgroundColor: theme.card, borderColor: theme.border }]}>
              <View style={[styles.iconWrap, { backgroundColor: '#10B98115' }]}>
                 <BarChart3 size={18} color="#10B981" />
              </View>
              <Text style={[styles.statLab, { color: theme.icon }]}>Total Deliveries</Text>
              <Text style={[styles.statVal, { color: theme.text }]}>{earnings?.totalDeliveries || 0}</Text>
           </View>
           <View style={[styles.statBox, { backgroundColor: theme.card, borderColor: theme.border }]}>
              <View style={[styles.iconWrap, { backgroundColor: '#F59E0B15' }]}>
                 <Star size={18} color="#F59E0B" />
              </View>
              <Text style={[styles.statLab, { color: theme.icon }]}>Performance</Text>
              <Text style={[styles.statVal, { color: theme.text }]}>{earnings?.performanceScore?.toFixed(1) || '5.0'}</Text>
           </View>
        </View>

        <View style={styles.section}>
           <View style={styles.sectionHeader}>
              <Text style={[styles.sectionTitle, { color: theme.text }]}>Service Details</Text>
           </View>
           
           <View style={[styles.infoCard, { backgroundColor: theme.card, borderColor: theme.border, padding: 20, borderRadius: 24, borderWidth: 1 }]}>
              <Text style={{ color: theme.icon, marginBottom: 8 }}>Partner: <Text style={{ color: theme.text, fontWeight: '700' }}>{earnings?.profile?.name || 'Loading...'}</Text></Text>
              <Text style={{ color: theme.icon, marginBottom: 8 }}>Vendor: <Text style={{ color: theme.text, fontWeight: '700' }}>{earnings?.profile?.vendor?.businessName || earnings?.profile?.vendor?.name || 'N/A'}</Text></Text>
              <Text style={{ color: theme.icon }}>Status: <Text style={{ color: '#10B981', fontWeight: '800' }}>{earnings?.profile?.status || 'OFFLINE'}</Text></Text>
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
  dateChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 12,
    borderWidth: 1,
    gap: 8,
  },
  dateText: {
    fontSize: 12,
    fontWeight: '700',
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 10,
  },
  balanceCard: {
    borderRadius: 32,
    padding: 24,
    marginBottom: 24,
  },
  balanceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  balanceLabel: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4,
  },
  balanceAmt: {
    color: 'white',
    fontSize: 32,
    fontWeight: '900',
  },
  walletIcon: {
    width: 60,
    height: 60,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  withdrawBtn: {
    backgroundColor: 'white',
    height: 54,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  withdrawText: {
    color: '#2563EB',
    fontSize: 16,
    fontWeight: '800',
  },
  statsRow: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 32,
  },
  statBox: {
    flex: 1,
    padding: 20,
    borderRadius: 24,
    borderWidth: 1,
  },
  iconWrap: {
    width: 38,
    height: 38,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  statLab: {
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 4,
  },
  statVal: {
    fontSize: 20,
    fontWeight: '800',
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
    fontWeight: '800',
  },
  historyList: {
    gap: 12,
  },
  historyItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderRadius: 20,
    borderWidth: 1,
  },
  historyLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  historyIcon: {
    width: 44,
    height: 44,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  historyDate: {
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 2,
  },
  historyMeta: {
    fontSize: 12,
  },
  historyAmt: {
    fontSize: 16,
    fontWeight: '800',
  },
  infoCard: {
     padding: 20,
     borderRadius: 24,
     borderWidth: 1,
  }
});
