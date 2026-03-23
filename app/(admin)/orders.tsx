import React, { useEffect, useState, useCallback } from 'react';
import { StyleSheet, View, Text, FlatList, TouchableOpacity, RefreshControl, TextInput, Modal, Pressable } from 'react-native';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { ShoppingBag, Filter, Search, MapPin, Package, ChevronDown, Check } from 'lucide-react-native';
import { useRouter, useFocusEffect, useLocalSearchParams } from 'expo-router';
import { adminService } from '@/services/adminService';
import UserAvatar from '@/components/UserAvatar';

export default function AdminOrders() {
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme ?? 'light'];
  const router = useRouter();

  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { search } = useLocalSearchParams();
  const [searchQuery, setSearchQuery] = useState((search as string) || '');
  const [statusFilter, setStatusFilter] = useState('all');
  const [isFilterModalVisible, setIsFilterModalVisible] = useState(false);

  const filterStatuses = [
    { label: 'All Orders', value: 'all' },
    { label: 'Pending', value: 'pending' },
    { label: 'Confirmed', value: 'confirmed' },
    { label: 'On Way', value: 'out_for_delivery' },
    { label: 'Delivered', value: 'delivered' },
    { label: 'Cancelled', value: 'cancelled' },
  ];

  const filteredOrders = orders.filter((o: any) => {
    const matchesSearch = 
      o._id?.toLowerCase().includes(searchQuery.toLowerCase()) || 
      o.consumer?.name?.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || o.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const fetchOrders = useCallback(async () => {
    try {
      setLoading(true);
      const data = await adminService.getAllOrders();
      setOrders(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      fetchOrders();
    }, [fetchOrders])
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'delivered': return '#10B981';
      case 'out_for_delivery': return '#0EA5E9';
      case 'confirmed': return '#8B5CF6';
      case 'pending': return '#F59E0B';
      case 'cancelled': return '#EF4444';
      default: return theme.icon;
    }
  };

  const renderOrderItem = ({ item }: { item: any }) => (
    <TouchableOpacity 
      style={[styles.orderCard, { backgroundColor: theme.card, borderColor: theme.border }]}
      onPress={() => router.push({ pathname: '/(admin)/order-details', params: { id: item._id } })}
    >
      <View style={styles.orderHeader}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
          <UserAvatar 
            uri={item.consumer?.profilePic} 
            size={44} 
            name={item.consumer?.name} 
            style={{ borderRadius: 16 }}
          />
          <View>
            <Text style={[styles.orderCode, { color: theme.icon }]}>#{item._id.slice(-6).toUpperCase()}</Text>
            <Text style={[styles.customerName, { color: theme.text }]}>{item.consumer?.name || 'Unknown'}</Text>
          </View>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) + '15' }]}>
          <Text style={[styles.statusText, { color: getStatusColor(item.status) }]}>
            {item.status.replace('_', ' ').toUpperCase()}
          </Text>
        </View>
      </View>
      
      <View style={[styles.divider, { backgroundColor: theme.border }]} />
      
      <View style={styles.orderInfoGrid}>
         <View style={styles.infoBox}>
            <Package size={14} color={theme.icon} />
            <Text style={[styles.infoVal, { color: theme.text }]}>{item.quantity} Jars</Text>
         </View>
         <View style={styles.infoBox}>
            <Text style={[styles.infoVal, { color: theme.text, fontWeight: '800' }]}>₹{item.totalAmount}</Text>
         </View>
      </View>

      <View style={styles.vendorRow}>
         <Text style={[styles.vendorLabel, { color: theme.icon }]}>Vendor:</Text>
         <Text style={[styles.vendorName, { color: theme.text }]}>{item.vendor?.businessName || item.vendor?.name || 'Unassigned'}</Text>
      </View>

      <View style={styles.addressBox}>
         <MapPin size={14} color={theme.icon} />
         <Text style={[styles.addressText, { color: theme.icon }]} numberOfLines={1}>{item.address || item.area || 'N/A'}</Text>
      </View>
    </TouchableOpacity>
  );

  const currentFilterLabel = filterStatuses.find(f => f.value === statusFilter)?.label || 'Filter';

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: theme.text }]}>All Orders</Text>
      </View>

      <View style={styles.searchRow}>
         <View style={[styles.searchInput, { backgroundColor: theme.card, borderColor: theme.border }]}>
            <Search size={20} color={theme.icon} />
            <TextInput
              style={{ flex: 1, color: theme.text, marginLeft: 10, fontSize: 13 }}
              placeholder="Search by ID or name..."
              placeholderTextColor={theme.icon}
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
         </View>
         <TouchableOpacity 
            style={[styles.filterDropdown, { backgroundColor: theme.card, borderColor: theme.border }]}
            onPress={() => setIsFilterModalVisible(true)}
         >
            <Text style={[styles.filterDropdownText, { color: theme.text }]}>{currentFilterLabel}</Text>
            <ChevronDown size={18} color={theme.icon} />
         </TouchableOpacity>
      </View>

      <FlatList
        data={filteredOrders}
        renderItem={renderOrderItem}
        keyExtractor={(item) => item._id}
        contentContainerStyle={styles.listContent}
        refreshControl={<RefreshControl refreshing={loading} onRefresh={fetchOrders} />}
        ListEmptyComponent={
          !loading ? (
            <View style={styles.emptyState}>
              <ShoppingBag size={64} color={theme.icon} />
              <Text style={[styles.emptyText, { color: theme.icon }]}>No orders found</Text>
            </View>
          ) : null
        }
      />

      {/* Filter Modal (Dropdown emulator) */}
      <Modal
        visible={isFilterModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setIsFilterModalVisible(false)}
      >
        <Pressable 
          style={styles.modalOverlay} 
          onPress={() => setIsFilterModalVisible(false)}
        >
          <View style={[styles.dropdownMenu, { backgroundColor: theme.card, borderColor: theme.border }]}>
            <Text style={[styles.dropdownHeader, { color: theme.icon }]}>Filter by Status</Text>
            {filterStatuses.map((s) => (
              <TouchableOpacity
                key={s.value}
                style={[
                  styles.dropdownItem,
                  statusFilter === s.value && { backgroundColor: theme.primary + '10' }
                ]}
                onPress={() => {
                  setStatusFilter(s.value);
                  setIsFilterModalVisible(false);
                }}
              >
                <Text style={[
                  styles.dropdownItemText,
                  { color: theme.text },
                  statusFilter === s.value && { color: theme.primary, fontWeight: '700' }
                ]}>
                  {s.label}
                </Text>
                {statusFilter === s.value && <Check size={18} color={theme.primary} />}
              </TouchableOpacity>
            ))}
          </View>
        </Pressable>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 5,
  },
  title: { fontSize: 28, fontWeight: '900' },
  searchRow: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 15,
    gap: 10,
  },
  searchInput: {
    flex: 1,
    height: 50,
    borderRadius: 15,
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 15,
  },
  filterDropdown: {
    paddingHorizontal: 15,
    height: 50,
    borderRadius: 15,
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    minWidth: 130,
  },
  filterDropdownText: { fontSize: 13, fontWeight: '700' },
  listContent: {
    padding: 20,
    paddingBottom: 120,
    gap: 16,
  },
  orderCard: { borderRadius: 24, borderWidth: 1, padding: 18 },
  orderHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 },
  orderCode: { fontSize: 12, fontWeight: '700', marginBottom: 2 },
  customerName: { fontSize: 17, fontWeight: '800' },
  statusBadge: { paddingVertical: 6, paddingHorizontal: 12, borderRadius: 10 },
  statusText: { fontSize: 10, fontWeight: '900' },
  divider: { height: 1, opacity: 0.1, marginBottom: 16 },
  orderInfoGrid: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  infoBox: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  infoVal: { fontSize: 15, fontWeight: '600' },
  vendorRow: { flexDirection: 'row', gap: 6, marginBottom: 8 },
  vendorLabel: { fontSize: 13, fontWeight: '500' },
  vendorName: { fontSize: 13, fontWeight: '700' },
  addressBox: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  addressText: { fontSize: 12, flex: 1 },
  emptyState: { alignItems: 'center', justifyContent: 'center', paddingTop: 100 },
  emptyText: { marginTop: 16, fontSize: 16, fontWeight: '600' },
  
  // Dropdown Styles
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.3)', justifyContent: 'center', alignItems: 'center' },
  dropdownMenu: { width: '80%', borderRadius: 24, padding: 10, borderWidth: 1, elevation: 20 },
  dropdownHeader: { fontSize: 12, fontWeight: '800', marginHorizontal: 15, marginVertical: 15, textTransform: 'uppercase' },
  dropdownItem: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 15, borderRadius: 14 },
  dropdownItemText: { fontSize: 15, fontWeight: '500' },
});
