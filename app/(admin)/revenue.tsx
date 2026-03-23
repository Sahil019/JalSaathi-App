import React, { useEffect, useState, useCallback } from 'react';
import { StyleSheet, View, Text, ScrollView, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { TrendingUp, DollarSign, Wallet, Download, Activity } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { adminService } from '@/services/adminService';

export default function AdminRevenue() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme ?? 'light'];

  const [stats, setStats] = useState<any>(null);
  const [reportData, setReportData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [range, setRange] = useState('30days');

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const [statsData, rData] = await Promise.all([
        adminService.getDashboardStats(),
        adminService.getReports(range)
      ]);
      setStats(statsData);
      setReportData(rData);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [range]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const chartData = reportData?.monthlyData?.map((m: any) => m.revenue) || [45, 60, 55, 80, 75, 95, 85];
  const chartLabels = reportData?.monthlyData?.map((m: any) => m.month) || ['J','F','M','A','M','J','J'];
  const maxVal = Math.max(...chartData);

  const handleExport = async () => {
    try {
      Alert.alert('Generating Report', 'Creating summary for ' + range + '...');
      const response = await adminService.getReportsExport(range);
      Alert.alert('Success', 'Profit & Loss statement remains ready in memory. Link: ' + (response.url || 'Internal Storage'));
    } catch (err: any) {
      Alert.alert('Error', err.message);
    }
  };

  if (loading && !reportData) {
     return (
       <View style={[styles.container, { backgroundColor: theme.background, justifyContent: 'center' }]}>
         <ActivityIndicator size="large" color={theme.primary} />
       </View>
     );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      {/* Precision Header */}
      <View style={styles.header}>
        <View>
          <Text style={[styles.title, { color: theme.text }]}>Revenue</Text>
          <View style={styles.liveMeta}>
             <View style={styles.liveDot} />
             <Text style={[styles.subtitle, { color: theme.icon }]}>Real-time Insights</Text>
          </View>
        </View>
        <TouchableOpacity 
          style={[styles.exportCircle, { backgroundColor: theme.primary }]}
          onPress={handleExport}
        >
           <Download size={22} color="white" />
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollInside}>
        {/* Sub Header Filters */}
        <View style={styles.filterRow}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ flexGrow: 0 }}>
             {['7days', '30days', '90days', '1year'].map((r) => (
                <TouchableOpacity 
                  key={r} 
                  onPress={() => setRange(r)}
                  style={[
                    styles.rangeChip, 
                    range === r ? { backgroundColor: theme.primary, borderColor: theme.primary } : { backgroundColor: theme.card, borderColor: theme.border }
                  ]}
                >
                   <Text style={[styles.rangeTxt, { color: range === r ? 'white' : theme.text }]}>
                      {r === '7days' ? '1 Week' : r === '30days' ? '1 Month' : r === '90days' ? 'Quarter' : 'Yearly'}
                   </Text>
                </TouchableOpacity>
             ))}
          </ScrollView>
        </View>

        {/* Main Revenue Card */}
        <LinearGradient
          colors={['#0EA5E9', '#2563EB']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.mainRevCard}
        >
           <View>
              <Text style={styles.revLabel}>Total Revenue Generated</Text>
              <Text style={styles.revValue}>₹{stats?.totalRevenue?.toLocaleString() || '0'}</Text>
           </View>
           <View style={styles.revBadge}>
              <TrendingUp size={16} color="white" />
              <Text style={styles.badgeText}>+18.2%</Text>
           </View>
        </LinearGradient>

        <View style={styles.mainContent}>
          {/* Stats Grid */}
          <View style={styles.statsRow}>
             <View style={[styles.statBox, { backgroundColor: theme.card, borderColor: theme.border }]}>
                <View style={[styles.iconWrap, { backgroundColor: '#10B98115' }]}>
                   <DollarSign size={20} color="#10B981" />
                </View>
                <Text style={[styles.statLab, { color: theme.icon }]}>Platform Fee</Text>
                <Text style={[styles.statVal, { color: theme.text }]}>₹{(stats?.totalRevenue * 0.1 || 0).toFixed(0)}</Text>
             </View>
             <View style={[styles.statBox, { backgroundColor: theme.card, borderColor: theme.border }]}>
                <View style={[styles.iconWrap, { backgroundColor: '#F59E0B15' }]}>
                   <Wallet size={20} color="#F59E0B" />
                </View>
                <Text style={[styles.statLab, { color: theme.icon }]}>Due Payouts</Text>
                <Text style={[styles.statVal, { color: theme.text }]}>₹32,450</Text>
             </View>
          </View>

          {/* Chart Section */}
          <View style={styles.section}>
             <View style={styles.sectionHeader}>
                <Text style={[styles.sectionTitle, { color: theme.text }]}>Revenue Trend</Text>
                <Activity size={18} color={theme.icon} />
             </View>
             <View style={[styles.chartContainer, { backgroundColor: theme.card, borderColor: theme.border }]}>
                <View style={styles.chartBars}>
                    {(chartData as number[]).map((val: number, i: number) => (
                      <View key={i} style={styles.barWrap}>
                         <View style={[styles.bar, { 
                            height: (val / (maxVal || 1)) * 120, 
                            backgroundColor: i === (chartData.length - 1) ? theme.primary : theme.primary + '30' 
                         }]} />
                         <Text style={[styles.barLab, { color: theme.icon }]}>{chartLabels[i]}</Text>
                      </View>
                    ))}
                </View>
             </View>
          </View>

          {/* Top Vendors */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: theme.text }]}>Power Partners</Text>
            <View style={styles.vendorList}>
              {reportData?.topVendors?.map((v: any, i: number) => (
                <View key={i} style={[styles.vendorItem, { backgroundColor: theme.card, borderColor: theme.border }]}>
                  <View style={styles.vendorMain}>
                    <View style={[styles.rankBadge, { backgroundColor: i === 0 ? '#F59E0B' : theme.border }]}>
                      <Text style={{ color: 'white', fontWeight: '800', fontSize: 10 }}>#{i + 1}</Text>
                    </View>
                    <View>
                      <Text style={[styles.vName, { color: theme.text }]}>{v.name}</Text>
                      <Text style={[styles.vOrders, { color: theme.icon }]}>{v.orders} Orders</Text>
                    </View>
                  </View>
                  <Text style={[styles.vRevenue, { color: theme.primary }]}>₹{v.revenue.toLocaleString()}</Text>
                </View>
              ))}
            </View>
          </View>
        </View>

        <View style={{ height: 60 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingTop: 60,
    paddingHorizontal: 25,
    paddingBottom: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    fontSize: 30,
    fontWeight: '900',
    letterSpacing: -0.5,
  },
  liveMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 2,
  },
  liveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#10B981',
  },
  subtitle: {
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  exportCircle: {
    width: 52,
    height: 52,
    borderRadius: 26,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
    shadowColor: '#0EA5E9',
    shadowOpacity: 0.3,
    shadowRadius: 10,
  },
  scrollInside: {
    paddingBottom: 40,
  },
  filterRow: {
    paddingHorizontal: 25,
    marginBottom: 25,
  },
  rangeChip: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 14,
    borderWidth: 1,
    marginRight: 10,
  },
  rangeTxt: {
    fontSize: 13,
    fontWeight: '800',
  },
  mainRevCard: {
    marginHorizontal: 25,
    padding: 28,
    borderRadius: 35,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 30,
    elevation: 10,
    shadowColor: '#2563EB',
    shadowOpacity: 0.3,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 12 },
  },
  revLabel: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 13,
    fontWeight: '700',
    marginBottom: 4,
  },
  revValue: {
    color: 'white',
    fontSize: 36,
    fontWeight: '900',
  },
  revBadge: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  badgeText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '800',
  },
  mainContent: {
    paddingHorizontal: 25,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 15,
    marginBottom: 35,
  },
  statBox: {
    flex: 1,
    padding: 20,
    borderRadius: 24,
    borderWidth: 1,
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.05,
  },
  iconWrap: {
    width: 44,
    height: 44,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 15,
  },
  statLab: {
    fontSize: 11,
    fontWeight: '700',
    marginBottom: 4,
  },
  statVal: {
    fontSize: 20,
    fontWeight: '900',
  },
  section: {
    marginBottom: 35,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '900',
  },
  chartContainer: {
    padding: 24,
    borderRadius: 30,
    borderWidth: 1,
  },
  chartBars: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    height: 140,
  },
  barWrap: {
    alignItems: 'center',
    gap: 10,
  },
  bar: {
    width: 26,
    borderRadius: 8,
  },
  barLab: {
    fontSize: 12,
    fontWeight: '800',
  },
  vendorList: {
    gap: 12,
  },
  vendorItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderRadius: 22,
    borderWidth: 1,
  },
  vendorMain: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  rankBadge: {
    width: 26,
    height: 26,
    borderRadius: 13,
    justifyContent: 'center',
    alignItems: 'center',
  },
  vName: {
    fontSize: 15,
    fontWeight: '800',
  },
  vOrders: {
    fontSize: 12,
    fontWeight: '600',
  },
  vRevenue: {
    fontSize: 18,
    fontWeight: '900',
  }
});
