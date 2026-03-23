import React, { useState, useEffect, useCallback } from 'react';
import { StyleSheet, View, Text, FlatList, TouchableOpacity, TextInput, ActivityIndicator, RefreshControl } from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Droplet, ChevronRight, Filter, Search as SearchIcon, Calendar, ArrowLeft } from 'lucide-react-native';
import { BlurView } from 'expo-blur';
import { consumerService } from '@/services/consumerService';

export default function OrdersPage() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme ?? 'light'];
  
  const [orders, setOrders] = useState<any[]>([]);
  const [filteredOrders, setFilteredOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  const fetchOrders = useCallback(async () => {
    try {
      setLoading(true);
      const data = await consumerService.getOrders();
      setOrders(data);
      setFilteredOrders(data);
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

  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredOrders(orders);
    } else {
      const q = searchQuery.toLowerCase();
      const filtered = orders.filter(o => 
        (o.vendor?.businessName || o.vendor?.name || '').toLowerCase().includes(q) ||
        (o._id || '').toLowerCase().includes(q)
      );
      setFilteredOrders(filtered);
    }
  }, [searchQuery, orders]);

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
  };

  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'delivered': return { color: '#10B981', label: 'DELIVERED', bg: '#10B98115' };
      case 'out_for_delivery': return { color: '#0EA5E9', label: 'OUT FOR DELIVERY', bg: '#0EA5E915' };
      case 'confirmed': return { color: '#F59E0B', label: 'CONFIRMED', bg: '#F59E0B15' };
      case 'pending': return { color: '#64748B', label: 'PENDING', bg: '#64748B15' };
      default: return { color: '#EF4444', label: status.toUpperCase(), bg: '#EF444415' };
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      {/* Search Header */}
      <BlurView intensity={30} style={styles.headerBlur}>
        <View style={styles.header}>
           <Text style={[styles.title, { color: theme.text }]}>Order History</Text>
           <TouchableOpacity style={[styles.filterButton, { backgroundColor: theme.card }]}>
             <Filter size={18} color={theme.primary} />
           </TouchableOpacity>
        </View>
        <View style={styles.searchContainer}>
          <View style={[styles.searchBar, { backgroundColor: theme.card, borderColor: theme.border }]}>
            <SearchIcon size={18} color={theme.icon} />
            <TextInput
              placeholder="Search by vendor or ID..."
              placeholderTextColor={theme.icon}
              style={[styles.searchInput, { color: theme.text }]}
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
          </View>
        </View>
      </BlurView>

      <FlatList
        data={filteredOrders}
        keyExtractor={(item) => item._id}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={loading} onRefresh={fetchOrders} tintColor={theme.primary} />
        }
        ListEmptyComponent={() => (
          !loading && <View style={styles.empty}>
            <Droplet size={60} color={theme.border} />
            <Text style={{ color: theme.icon, marginTop: 12 }}>No orders found.</Text>
          </View>
        )}
        renderItem={({ item }) => {
          const status = getStatusConfig(item.status);
          return (
            <TouchableOpacity 
              style={[styles.card, { backgroundColor: theme.card, borderColor: theme.border }]}
              onPress={() => router.push({ pathname: '/(consumer)/order-details', params: { id: item._id } })}
              activeOpacity={0.7}
            >
              <View style={styles.cardHeader}>
                <View style={[styles.iconContainer, { backgroundColor: theme.primary + '10' }]}>
                  <Droplet size={24} color={theme.primary} />
                </View>
                <View style={styles.headerText}>
                  <Text style={[styles.vendorName, { color: theme.text }]}>{item.vendor?.businessName || item.vendor?.name || 'Local Vendor'}</Text>
                  <View style={styles.dateRow}>
                    <Calendar size={12} color={theme.icon} />
                    <Text style={[styles.orderDate, { color: theme.icon }]}>{formatDate(item.createdAt)}</Text>
                  </View>
                </View>
                <View style={{ alignItems: 'flex-end' }}>
                   <Text style={[styles.amount, { color: theme.text }]}>₹{item.totalAmount}</Text>
                   <Text style={{ fontSize: 10, color: theme.icon }}>{item.quantity} Jars</Text>
                </View>
              </View>

              <View style={[styles.divider, { backgroundColor: theme.border }]} />
              
              <View style={styles.cardFooter}>
                  <View style={[styles.statusBadge, { backgroundColor: status.bg }]}>
                    <View style={[styles.statusDot, { backgroundColor: status.color }]} />
                    <Text style={[styles.statusText, { color: status.color }]}>{status.label}</Text>
                  </View>
                  <View style={styles.paymentInfo}>
                    <Text style={{ color: theme.icon, fontSize: 11, fontWeight: '600' }}>#{item._id.slice(-6).toUpperCase()}</Text>
                    <ChevronRight size={16} color={theme.icon} />
                  </View>
              </View>
            </TouchableOpacity>
          );
        }}
      />
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
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.05)',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 15,
  },
  title: {
    fontSize: 24,
    fontWeight: '900',
  },
  filterButton: {
    width: 44,
    height: 44,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.05)',
  },
  searchContainer: {
    paddingHorizontal: 20,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 50,
    borderRadius: 15,
    paddingHorizontal: 15,
    borderWidth: 1,
    gap: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    fontWeight: '600',
  },
  list: {
    padding: 20,
    paddingBottom: 140, // Account for floating tab bar
    gap: 16,
  },
  card: {
    borderRadius: 24,
    borderWidth: 1,
    padding: 18,
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconContainer: {
    width: 50,
    height: 50,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  headerText: {
    flex: 1,
  },
  vendorName: {
    fontSize: 16,
    fontWeight: '800',
    marginBottom: 4,
  },
  dateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  orderDate: {
    fontSize: 12,
    fontWeight: '600',
  },
  amount: {
    fontSize: 18,
    fontWeight: '900',
  },
  divider: {
    height: 1,
    marginVertical: 16,
    opacity: 0.1,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 10,
    gap: 6,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '800',
  },
  paymentInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  empty: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 100,
  }
});

