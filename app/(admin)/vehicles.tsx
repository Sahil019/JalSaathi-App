import React, { useCallback, useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  TextInput,
} from 'react-native';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useFocusEffect } from 'expo-router';
import {
  Truck,
  Shield,
  User,
  Activity,
  Search,
  Store,
} from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { adminService } from '@/services/adminService';

interface DeliveryBoy {
  _id: string;
  name: string;
  email?: string;
  phone?: string;
  vehicleNumber?: string;
  vehicleType?: string;
  vehicleModel?: string;
  status?: string;
  documentsStatus?: string;
  vendor?: { businessName?: string; name?: string };
  totalDeliveries?: number;
}

export default function AdminVehiclesScreen() {
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme ?? 'light'];
  const [deliveryBoys, setDeliveryBoys] = useState<DeliveryBoy[]>([]);
  const [filtered, setFiltered] = useState<DeliveryBoy[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchData = useCallback(async () => {
    try {
      const data = await adminService.getAllDeliveryBoys();
      const arr = Array.isArray(data) ? data : [];
      setDeliveryBoys(arr);
      setFiltered(arr);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useFocusEffect(useCallback(() => { fetchData(); }, [fetchData]));

  const handleSearch = (q: string) => {
    setSearchQuery(q);
    if (!q.trim()) {
      setFiltered(deliveryBoys);
      return;
    }
    const lower = q.toLowerCase();
    setFiltered(
      deliveryBoys.filter(
        (d) =>
          d.name?.toLowerCase().includes(lower) ||
          d.vehicleNumber?.toLowerCase().includes(lower) ||
          d.vehicleType?.toLowerCase().includes(lower) ||
          d.vendor?.businessName?.toLowerCase().includes(lower)
      )
    );
  };

  const onRefresh = () => { setRefreshing(true); fetchData(); };

  const getStatusColor = (status?: string) => {
    if (status === 'AVAILABLE') return '#10B981';
    if (status === 'BUSY') return '#F59E0B';
    return '#94A3B8';
  };

  const totalActive = deliveryBoys.filter(d => d.status === 'AVAILABLE').length;
  const totalBusy = deliveryBoys.filter(d => d.status === 'BUSY').length;

  if (loading) {
    return (
      <View style={[styles.container, { backgroundColor: theme.background, justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color={theme.primary} />
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      {/* Header */}
      <LinearGradient colors={['#1E293B', '#0F172A']} style={styles.headerGrad}>
        <Text style={styles.headerTitle}>🚚 All Vehicles</Text>
        <Text style={styles.headerSub}>Super Admin — Full Fleet View</Text>

        {/* Stats pills */}
        <View style={styles.statsPillRow}>
          {[
            { label: 'Total', value: deliveryBoys.length, color: '#38BDF8' },
            { label: 'Active', value: totalActive, color: '#34D399' },
            { label: 'On Duty', value: totalBusy, color: '#FBBF24' },
            { label: 'Offline', value: deliveryBoys.length - totalActive - totalBusy, color: '#94A3B8' },
          ].map((s, i) => (
            <View key={i} style={[styles.pill, { backgroundColor: s.color + '25', borderColor: s.color + '50' }]}>
              <Text style={[styles.pillValue, { color: s.color }]}>{s.value}</Text>
              <Text style={[styles.pillLabel, { color: s.color }]}>{s.label}</Text>
            </View>
          ))}
        </View>
      </LinearGradient>

      {/* Search bar */}
      <View style={[styles.searchWrap, { backgroundColor: theme.card, borderColor: theme.border }]}>
        <Search size={18} color={theme.icon} />
        <TextInput
          style={[styles.searchInput, { color: theme.text }]}
          placeholder="Search by name, plate, vendor..."
          placeholderTextColor={theme.icon}
          value={searchQuery}
          onChangeText={handleSearch}
        />
      </View>

      {filtered.length === 0 ? (
        <View style={styles.emptyState}>
          <Truck size={60} color={theme.icon} />
          <Text style={[styles.emptyTitle, { color: theme.text }]}>
            {searchQuery ? 'No results found' : 'No Delivery Boys Yet'}
          </Text>
          <Text style={[styles.emptySub, { color: theme.icon }]}>
            {searchQuery ? 'Try a different search term' : 'Delivery boys will appear here once vendors add them.'}
          </Text>
        </View>
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={(item) => item._id}
          contentContainerStyle={styles.list}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={theme.primary} />}
          renderItem={({ item }) => {
            const statusColor = getStatusColor(item.status);
            return (
              <View style={[styles.card, { backgroundColor: theme.card, borderColor: theme.border }]}>
                {/* Header Row */}
                <View style={styles.cardHeader}>
                  <View style={[styles.avatar, { backgroundColor: statusColor + '20' }]}>
                    <User size={22} color={statusColor} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.staffName, { color: theme.text }]}>{item.name}</Text>
                    <Text style={[styles.staffEmail, { color: theme.icon }]}>{item.email || item.phone || '—'}</Text>
                  </View>
                  <View style={[styles.statusTag, { backgroundColor: statusColor + '20' }]}>
                    <View style={[styles.statusDot, { backgroundColor: statusColor }]} />
                    <Text style={[styles.statusTagText, { color: statusColor }]}>
                      {item.status || 'OFFLINE'}
                    </Text>
                  </View>
                </View>

                {/* Vehicle Details */}
                <View style={[styles.vehicleSection, { borderColor: theme.border }]}>
                  <View style={styles.vehicleDetailRow}>
                    <View style={styles.vehicleDetailItem}>
                      <Text style={[styles.detailKey, { color: theme.icon }]}>Vehicle Type</Text>
                      <Text style={[styles.detailVal, { color: theme.text }]}>{item.vehicleType || '—'}</Text>
                    </View>
                    <View style={styles.vehicleDetailItem}>
                      <Text style={[styles.detailKey, { color: theme.icon }]}>Model</Text>
                      <Text style={[styles.detailVal, { color: theme.text }]}>{item.vehicleModel || '—'}</Text>
                    </View>
                  </View>

                  {item.vehicleNumber && (
                    <View style={styles.plateWrap}>
                      <View style={[styles.numberPlate, { backgroundColor: '#FEF9C3', borderColor: '#F59E0B' }]}>
                        <Text style={styles.plateText}>{item.vehicleNumber}</Text>
                      </View>
                    </View>
                  )}
                </View>

                {/* Footer */}
                <View style={styles.cardFooter}>
                  {item.vendor && (
                    <View style={styles.footerItem}>
                      <Store size={14} color={theme.icon} />
                      <Text style={[styles.footerText, { color: theme.icon }]}>
                        {item.vendor.businessName || item.vendor.name || 'Independent'}
                      </Text>
                    </View>
                  )}
                  <View style={styles.footerItem}>
                    <Activity size={14} color={theme.primary} />
                    <Text style={[styles.footerText, { color: theme.primary }]}>
                      {item.totalDeliveries || 0} deliveries
                    </Text>
                  </View>
                  <View style={[styles.docBadge, { backgroundColor: item.documentsStatus === 'Verified' ? '#10B98120' : item.documentsStatus === 'Rejected' ? '#EF444420' : '#F59E0B20' }]}>
                    <Shield size={12} color={item.documentsStatus === 'Verified' ? '#10B981' : item.documentsStatus === 'Rejected' ? '#EF4444' : '#F59E0B'} />
                    <Text style={{ fontSize: 11, fontWeight: '700', color: item.documentsStatus === 'Verified' ? '#10B981' : item.documentsStatus === 'Rejected' ? '#EF4444' : '#F59E0B' }}>
                      {item.documentsStatus || 'Pending'}
                    </Text>
                  </View>
                </View>

                {/* Admin Actions for Verification */}
                {item.documentsStatus !== 'Verified' && (
                  <View style={styles.adminActions}>
                    <TouchableOpacity 
                      style={[styles.verifyBtn, { backgroundColor: '#10B981' }]}
                      onPress={async () => {
                        try {
                          await adminService.updateDeliveryBoy(item._id, { documentsStatus: 'Verified' });
                          fetchData();
                        } catch (err: any) {
                          alert(err.message);
                        }
                      }}
                    >
                      <Text style={styles.btnText}>Verify Documents</Text>
                    </TouchableOpacity>
                    {item.documentsStatus !== 'Rejected' && (
                      <TouchableOpacity 
                        style={[styles.rejectBtn, { borderColor: '#EF4444', borderWidth: 1 }]}
                        onPress={async () => {
                          try {
                            await adminService.updateDeliveryBoy(item._id, { documentsStatus: 'Rejected' });
                            fetchData();
                          } catch (err: any) {
                            alert(err.message);
                          }
                        }}
                      >
                        <Text style={[styles.btnText, { color: '#EF4444' }]}>Reject</Text>
                      </TouchableOpacity>
                    )}
                  </View>
                )}
              </View>
            );
          }}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  headerGrad: {
    paddingTop: 55,
    paddingBottom: 24,
    paddingHorizontal: 24,
    gap: 4,
  },
  headerTitle: { color: 'white', fontSize: 28, fontWeight: '900' },
  headerSub: { color: 'rgba(255,255,255,0.6)', fontSize: 13, fontWeight: '600', marginBottom: 16 },
  statsPillRow: { flexDirection: 'row', gap: 8 },
  pill: {
    flex: 1,
    alignItems: 'center',
    borderRadius: 14,
    paddingVertical: 10,
    borderWidth: 1,
  },
  pillValue: { fontSize: 18, fontWeight: '900' },
  pillLabel: { fontSize: 10, fontWeight: '700' },
  searchWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 18,
    marginHorizontal: 20,
    marginTop: 16,
    marginBottom: 12,
    paddingHorizontal: 16,
    height: 50,
    gap: 10,
  },
  searchInput: { flex: 1, fontSize: 14 },
  list: { paddingHorizontal: 20, gap: 14, paddingBottom: 140 },
  card: {
    borderRadius: 24,
    padding: 18,
    borderWidth: 1,
    gap: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  cardHeader: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  staffName: { fontSize: 16, fontWeight: '800' },
  staffEmail: { fontSize: 12, marginTop: 2 },
  statusTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 10,
  },
  statusDot: { width: 6, height: 6, borderRadius: 3 },
  statusTagText: { fontSize: 10, fontWeight: '800' },
  vehicleSection: {
    borderTopWidth: 1,
    paddingTop: 14,
    gap: 12,
  },
  vehicleDetailRow: { flexDirection: 'row', gap: 20 },
  vehicleDetailItem: { flex: 1, gap: 3 },
  detailKey: { fontSize: 11, fontWeight: '600' },
  detailVal: { fontSize: 14, fontWeight: '700' },
  plateWrap: { alignItems: 'flex-start' },
  numberPlate: {
    borderWidth: 2,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 7,
  },
  plateText: { fontSize: 15, fontWeight: '900', color: '#92400E', letterSpacing: 2 },
  cardFooter: { flexDirection: 'row', alignItems: 'center', gap: 12, flexWrap: 'wrap' },
  footerItem: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  footerText: { fontSize: 12, fontWeight: '600' },
  docBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    marginLeft: 'auto',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 16,
    paddingHorizontal: 40,
  },
  emptyTitle: { fontSize: 22, fontWeight: '800' },
  emptySub: { fontSize: 14, textAlign: 'center', lineHeight: 22 },
  adminActions: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 10,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.05)',
    paddingTop: 15,
  },
  verifyBtn: {
    flex: 2,
    height: 44,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  rejectBtn: {
    flex: 1,
    height: 44,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  btnText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '800',
  },
});
