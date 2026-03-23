import React, { useCallback, useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  RefreshControl,
  Image,
  TextInput,
} from 'react-native';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useFocusEffect } from 'expo-router';
import {
  Truck,
  Shield,
  Clock,
  AlertTriangle,
  CheckCircle,
  User,
  Activity,
  Search,
  ChevronRight,
  ShieldCheck,
  Dot
} from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { vendorService } from '@/services/vendorService';

interface VehicleInfo {
  _id: string;
  name: string;
  vehicleNumber?: string;
  vehicleType?: string;
  vehicleModel?: string;
  status?: string;
  documentsStatus?: string;
  totalDeliveries?: number;
}

export default function VendorVehiclesScreen() {
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme ?? 'light'];
  const [staff, setStaff] = useState<VehicleInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const filteredStaff = staff.filter(s => 
    s.name?.toLowerCase().includes(searchQuery.toLowerCase()) || 
    s.vehicleNumber?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const fetchStaff = useCallback(async () => {
    try {
      const data = await vendorService.getStaff();
      setStaff(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useFocusEffect(useCallback(() => { fetchStaff(); }, [fetchStaff]));

  const onRefresh = () => { setRefreshing(true); fetchStaff(); };

  const getStatusColor = (status?: string) => {
    if (status === 'AVAILABLE') return '#10B981';
    if (status === 'BUSY') return '#0EA5E9';
    return '#94A3B8';
  };

  if (loading && !refreshing) {
    return (
      <View style={[styles.container, { backgroundColor: theme.background, justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color={theme.primary} />
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      {/* Dynamic Header */}
      <LinearGradient colors={['#0EA5E9', '#2563EB']} style={styles.headerGrad}>
        <View style={styles.headerTop}>
           <View>
              <Text style={styles.headerTitle}>Active Fleet</Text>
              <Text style={styles.headerSub}>{staff.length} Vehicles Registered</Text>
           </View>
           <TouchableOpacity style={styles.headerAction}>
              <Activity size={20} color="white" />
           </TouchableOpacity>
        </View>

        {/* Floating Search Bar */}
        <View style={[styles.searchBox, { backgroundColor: 'white' }]}>
           <Search size={18} color="#64748B" />
           <TextInput 
             style={styles.searchInput}
             placeholder="Search by driver or vehicle number..."
             placeholderTextColor="#94A3B8"
             value={searchQuery}
             onChangeText={setSearchQuery}
           />
           {searchQuery ? (
             <TouchableOpacity onPress={() => setSearchQuery('')}>
                <Text style={{ color: '#0EA5E9', fontWeight: '800', fontSize: 12 }}>Clear</Text>
             </TouchableOpacity>
           ) : null}
        </View>
      </LinearGradient>

      {/* Stats Summary Line */}
      <View style={styles.statsSummary}>
         <View style={styles.sumItem}>
            <View style={[styles.sumDot, { backgroundColor: '#10B981' }]} />
            <Text style={[styles.sumText, { color: theme.icon }]}>{staff.filter(s => s.status === 'AVAILABLE').length} Available</Text>
         </View>
         <View style={styles.sumItem}>
            <View style={[styles.sumDot, { backgroundColor: '#0EA5E9' }]} />
            <Text style={[styles.sumText, { color: theme.icon }]}>{staff.filter(s => s.status === 'BUSY').length} On Duty</Text>
         </View>
      </View>

      <FlatList
        data={filteredStaff}
        keyExtractor={(item) => item._id}
        contentContainerStyle={styles.list}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={theme.primary} />}
        renderItem={({ item }) => {
          const statusColor = getStatusColor(item.status);
          return (
            <TouchableOpacity
              style={[styles.vehicleCard, { backgroundColor: theme.card, borderColor: theme.border }]}
              activeOpacity={0.9}
            >
              <View style={styles.cardMain}>
                <View style={[styles.avatarContainer, { backgroundColor: theme.primary + '15' }]}>
                   <User size={24} color={theme.primary} />
                   <View style={[styles.onlineDot, { backgroundColor: statusColor }]} />
                </View>

                <View style={styles.infoCol}>
                   <View style={styles.nameRow}>
                      <Text style={[styles.staffName, { color: theme.text }]}>{item.name}</Text>
                      <ShieldCheck size={16} color="#10B981" />
                   </View>
                   <Text style={[styles.subInfo, { color: theme.icon }]}>
                     {item.vehicleType || 'Delivery Agent'} • {item.totalDeliveries || 0} Trips
                   </Text>
                </View>

                <View style={[styles.statusBadge, { borderColor: statusColor + '40' }]}>
                   <Text style={[styles.statusTxt, { color: statusColor }]}>{item.status || 'OFFLINE'}</Text>
                </View>
              </View>

              <View style={[styles.divider, { backgroundColor: theme.border, opacity: 0.1 }]} />

              <View style={styles.cardFooter}>
                 <View style={styles.plateContainer}>
                    <View style={styles.plateHeader}><Text style={styles.plateHeaderText}>IND</Text></View>
                    <Text style={styles.plateNumber}>{item.vehicleNumber || 'HR 26 AZ 0000'}</Text>
                 </View>
                 
                 <View style={styles.performance}>
                    <Text style={[styles.perfLabel, { color: theme.icon }]}>Performance</Text>
                    <View style={styles.perfBar}>
                       <View style={[styles.perfFill, { width: '85%', backgroundColor: '#10B981' }]} />
                    </View>
                 </View>
              </View>
            </TouchableOpacity>
          );
        }}
        ListEmptyComponent={
          !loading ? (
            <View style={styles.emptyState}>
              <Truck size={64} color={theme.border} />
              <Text style={[styles.emptyTitle, { color: theme.text }]}>No records match</Text>
              <Text style={[styles.emptySub, { color: theme.icon }]}>Try searching with a different name or number.</Text>
            </View>
          ) : null
        }
      />

      <View style={{ height: 20 }} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  headerGrad: {
    paddingTop: 60,
    paddingBottom: 35,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 35,
    borderBottomRightRadius: 35,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  headerTitle: { color: 'white', fontSize: 26, fontWeight: '900' },
  headerSub: { color: 'rgba(255,255,255,0.8)', fontSize: 13, fontWeight: '600' },
  headerAction: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 15,
    height: 50,
    borderRadius: 18,
    gap: 10,
    elevation: 10,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 15,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    fontWeight: '600',
    color: '#1E293B',
  },
  statsSummary: {
    flexDirection: 'row',
    paddingHorizontal: 25,
    paddingVertical: 20,
    gap: 20,
  },
  sumItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  sumDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  sumText: {
    fontSize: 12,
    fontWeight: '800',
  },
  list: { paddingHorizontal: 20, gap: 16, paddingBottom: 40 },
  vehicleCard: {
    borderRadius: 28,
    padding: 18,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3,
  },
  cardMain: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 15,
  },
  avatarContainer: {
    width: 55,
    height: 55,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  onlineDot: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    width: 14,
    height: 14,
    borderRadius: 7,
    borderWidth: 3,
    borderColor: 'white',
  },
  infoCol: {
    flex: 1,
    gap: 2,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  staffName: { fontSize: 17, fontWeight: '800' },
  subInfo: { fontSize: 12, fontWeight: '600' },
  statusBadge: {
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 10,
    borderWidth: 1,
  },
  statusTxt: { fontSize: 10, fontWeight: '900' },
  divider: { height: 1, marginVertical: 15 },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  plateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderWidth: 2,
    borderColor: '#E2E8F0',
    borderRadius: 8,
    paddingRight: 10,
    overflow: 'hidden',
  },
  plateHeader: {
    backgroundColor: '#334155',
    paddingHorizontal: 5,
    paddingVertical: 4,
    justifyContent: 'center',
  },
  plateHeaderText: {
    color: '#fff',
    fontSize: 8,
    fontWeight: '900',
  },
  plateNumber: {
    fontSize: 14,
    fontWeight: '900',
    color: '#1E293B',
    paddingLeft: 8,
    letterSpacing: 1,
  },
  performance: {
    alignItems: 'flex-end',
    gap: 5,
  },
  perfLabel: { fontSize: 10, fontWeight: '700' },
  perfBar: {
    width: 80,
    height: 5,
    backgroundColor: '#F1F5F9',
    borderRadius: 3,
    overflow: 'hidden',
  },
  perfFill: { height: '100%', borderRadius: 3 },
  emptyState: {
    alignItems: 'center',
    paddingTop: 80,
    gap: 12,
  },
  emptyTitle: { fontSize: 20, fontWeight: '900' },
  emptySub: { fontSize: 14, textAlign: 'center', lineHeight: 20, paddingHorizontal: 40 },
});

