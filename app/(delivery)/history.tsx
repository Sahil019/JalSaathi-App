import React, { useEffect, useState } from 'react';
import { StyleSheet, View, Text, FlatList, TouchableOpacity, ActivityIndicator, RefreshControl } from 'react-native';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { CheckCircle2, Clock, Calendar, ChevronRight } from 'lucide-react-native';
import { deliveryService } from '@/services/deliveryService';

export default function DeliveryHistory() {
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme ?? 'light'];

  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      setLoading(true);
      const data = await deliveryService.getAssignedOrders();
      // Filter for delivered orders
      setOrders(data.filter((o: any) => o.status === 'delivered'));
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const renderItem = ({ item }: { item: any }) => (
    <View style={[styles.card, { backgroundColor: theme.card, borderColor: theme.border }]}>
      <View style={styles.cardHeader}>
        <View style={styles.headerInfo}>
           <Text style={[styles.orderId, { color: theme.icon }]}>ORDER #{item._id.slice(-6).toUpperCase()}</Text>
           <Text style={[styles.custName, { color: theme.text }]}>{item.consumer?.name || 'Customer'}</Text>
        </View>
        <Text style={[styles.amt, { color: theme.text }]}>₹{item.totalAmount}</Text>
      </View>

      <View style={styles.metaRow}>
         <View style={styles.metaItem}>
            <Calendar size={14} color={theme.icon} />
            <Text style={[styles.metaText, { color: theme.icon }]}>{new Date(item.updatedAt).toLocaleDateString()}</Text>
         </View>
         <View style={styles.metaItem}>
            <Clock size={14} color={theme.icon} />
            <Text style={[styles.metaText, { color: theme.icon }]}>{new Date(item.updatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</Text>
         </View>
      </View>

      <View style={[styles.statusLine, { backgroundColor: '#10B98115' }]}>
         <CheckCircle2 size={16} color="#10B981" />
         <Text style={[styles.statusText, { color: '#10B981' }]}>Successfully Delivered</Text>
      </View>
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: theme.text }]}>Delivery History</Text>
        <Text style={[styles.subtitle, { color: theme.icon }]}>{orders.length} orders completed</Text>
      </View>

      <FlatList
        data={orders}
        renderItem={renderItem}
        keyExtractor={(item) => item._id}
        contentContainerStyle={styles.listContent}
        refreshControl={<RefreshControl refreshing={loading} onRefresh={fetchHistory} />}
        ListEmptyComponent={
          !loading ? (
            <View style={styles.emptyState}>
              <CheckCircle2 size={64} color={theme.icon} />
              <Text style={[styles.emptyText, { color: theme.icon }]}>No history yet</Text>
              <Text style={[styles.emptySub, { color: theme.icon }]}>Completed deliveries will show up here</Text>
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
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
  },
  subtitle: {
    fontSize: 14,
    marginTop: 4,
  },
  listContent: {
    padding: 20,
    gap: 16,
    paddingBottom: 100,
  },
  card: {
    borderRadius: 24,
    borderWidth: 1,
    padding: 18,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  headerInfo: {
    flex: 1,
  },
  orderId: {
    fontSize: 10,
    fontWeight: '700',
    marginBottom: 2,
  },
  custName: {
    fontSize: 18,
    fontWeight: '700',
  },
  amt: {
    fontSize: 18,
    fontWeight: '800',
  },
  metaRow: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 16,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  metaText: {
    fontSize: 12,
    fontWeight: '600',
  },
  statusLine: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: 12,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 13,
    fontWeight: '700',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 100,
    paddingHorizontal: 40,
  },
  emptyText: {
    marginTop: 20,
    fontSize: 20,
    fontWeight: '800',
    textAlign: 'center',
  },
  emptySub: {
    marginTop: 8,
    fontSize: 14,
    textAlign: 'center',
    opacity: 0.7,
  },
});
