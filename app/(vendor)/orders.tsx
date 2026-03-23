import React, { useEffect, useState } from 'react';
import { StyleSheet, View, Text, FlatList, TouchableOpacity, ActivityIndicator, RefreshControl } from 'react-native';
import { Colors } from '@/constants/theme';
import UserAvatar from '@/components/UserAvatar';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { ShoppingBag, ChevronRight, Filter, Search } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { vendorService } from '@/services/vendorService';

export default function VendorOrders() {
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme ?? 'light'];
  const router = useRouter();

  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const data = await vendorService.getOrders();
      setOrders(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const renderOrderItem = ({ item }: { item: any }) => (
    <TouchableOpacity 
      style={[styles.orderCard, { backgroundColor: theme.card, borderColor: theme.border }]}
      onPress={() => router.push({ pathname: '/(vendor)/order-details', params: { id: item._id } })}
    >
      <View style={styles.orderHeader}>
        <UserAvatar 
          uri={item.consumer?.profilePic} 
          size={48} 
          name={item.consumer?.name} 
          style={{ borderRadius: 16 }}
        />
        <View style={styles.orderInfo}>
          <Text style={[styles.customerName, { color: theme.text }]}>{item.consumer?.name || 'Unknown'}</Text>
          <Text style={[styles.orderTime, { color: theme.icon }]}>
            {new Date(item.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
          </Text>
        </View>
        <View style={[styles.statusBadge, { 
          backgroundColor: 
            item.status === 'pending' ? '#F59E0B20' : 
            item.status === 'delivered' ? '#10B98120' : 
            item.status === 'cancelled' ? '#EF444420' : '#3B82F620'
        }]}>
          <Text style={[styles.statusText, { 
            color: 
              item.status === 'pending' ? '#F59E0B' : 
              item.status === 'delivered' ? '#10B981' : 
              item.status === 'cancelled' ? '#EF4444' : '#3B82F6'
          }]}>{item.status.replace('_', ' ').toUpperCase()}</Text>
        </View>
      </View>
      
      <View style={[styles.divider, { backgroundColor: theme.border }]} />
      
      <View style={styles.orderFooter}>
        <View>
          <Text style={[styles.footerLabel, { color: theme.icon }]}>Total Amount</Text>
          <Text style={[styles.footerValue, { color: theme.text }]}>₹{item.totalAmount}</Text>
        </View>
        <View style={{ alignItems: 'flex-end' }}>
          <Text style={[styles.footerLabel, { color: theme.icon }]}>Quantity</Text>
          <Text style={[styles.footerValue, { color: theme.text }]}>{item.quantity} Jars</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: theme.text }]}>Orders</Text>
        <View style={styles.headerActions}>
          <TouchableOpacity style={[styles.iconBtn, { backgroundColor: theme.card }]}>
            <Search size={20} color={theme.text} />
          </TouchableOpacity>
          <TouchableOpacity style={[styles.iconBtn, { backgroundColor: theme.card }]}>
            <Filter size={20} color={theme.text} />
          </TouchableOpacity>
        </View>
      </View>

      <FlatList
        data={orders}
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
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
  },
  headerActions: {
    flexDirection: 'row',
    gap: 12,
  },
  iconBtn: {
    width: 44,
    height: 44,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.05)',
  },
  listContent: {
    padding: 20,
    paddingBottom: 120, // Increased for floating navbar
    gap: 16,
  },
  orderCard: {
    borderRadius: 24,
    borderWidth: 1,
    padding: 16,
  },
  orderHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: 20,
    fontWeight: '800',
  },
  orderInfo: {
    flex: 1,
    marginLeft: 12,
  },
  customerName: {
    fontSize: 16,
    fontWeight: '700',
  },
  orderTime: {
    fontSize: 12,
  },
  statusBadge: {
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 8,
  },
  statusText: {
    fontSize: 10,
    fontWeight: '800',
  },
  divider: {
    height: 1,
    opacity: 0.1,
    marginBottom: 12,
  },
  orderFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  footerLabel: {
    fontSize: 11,
    marginBottom: 2,
  },
  footerValue: {
    fontSize: 16,
    fontWeight: '700',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 100,
  },
  emptyText: {
    marginTop: 16,
    fontSize: 16,
    fontWeight: '600',
  },
});
