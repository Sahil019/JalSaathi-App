import React, { useEffect, useState } from 'react';
import { StyleSheet, View, Text, FlatList, TouchableOpacity, ActivityIndicator, Alert, Image, RefreshControl } from 'react-native';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { UserPlus, Check, X, MapPin, Clock, Phone } from 'lucide-react-native';
import { vendorService } from '@/services/vendorService';
import UserAvatar from '@/components/UserAvatar';

export default function VendorRequests() {
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme ?? 'light'];

  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      setLoading(true);
      const data = await vendorService.getRequests();
      setRequests(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async (id: string, action: 'approve' | 'reject') => {
    try {
      setProcessingId(id);
      await vendorService.handleRequestAction(id, action);
      Alert.alert('Success', `Request ${action}d successfully`);
      fetchRequests();
    } catch (err: any) {
      Alert.alert('Error', err.message || `Failed to ${action} request`);
    } finally {
      setProcessingId(null);
    }
  };

  const renderItem = ({ item }: { item: any }) => (
    <View style={[styles.requestCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
      <View style={styles.cardHeader}>
        <UserAvatar 
          uri={item.consumer?.profilePic} 
          size={52} 
          name={item.consumer?.name} 
        />
        <View style={styles.info}>
          <Text style={[styles.name, { color: theme.text }]}>{item.consumer?.name || 'New Customer'}</Text>
          <View style={styles.metaRow}>
             <MapPin size={12} color={theme.icon} />
             <Text style={[styles.metaText, { color: theme.icon }]}>{item.distanceKm?.toFixed(1)} km away • {item.consumer?.area || 'Nearby'}</Text>
          </View>
        </View>
        <TouchableOpacity style={[styles.phoneBtn, { backgroundColor: theme.primary + '15' }]}>
           <Phone size={18} color={theme.primary} />
        </TouchableOpacity>
      </View>

      <View style={[styles.divider, { backgroundColor: theme.border }]} />

      <View style={styles.footer}>
         <View style={styles.timeRow}>
            <Clock size={14} color={theme.icon} />
            <Text style={[styles.timeText, { color: theme.icon }]}>Requested {new Date(item.requestedAt).toLocaleDateString()}</Text>
         </View>
         <View style={styles.actions}>
            <TouchableOpacity 
              style={[styles.actionBtn, styles.rejectBtn]} 
              onPress={() => handleAction(item._id, 'reject')}
              disabled={!!processingId}
            >
              <X size={20} color={theme.error} />
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.actionBtn, styles.approveBtn, { backgroundColor: theme.primary }]} 
              onPress={() => handleAction(item._id, 'approve')}
              disabled={!!processingId}
            >
              {processingId === item._id ? <ActivityIndicator size="small" color="white" /> : <Check size={20} color="white" />}
            </TouchableOpacity>
         </View>
      </View>
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: theme.text }]}>New Requests</Text>
        <Text style={[styles.subtitle, { color: theme.icon }]}>{requests.length} customers waiting to connect</Text>
      </View>

      <FlatList
        data={requests}
        renderItem={renderItem}
        keyExtractor={(item) => item._id}
        contentContainerStyle={styles.listContent}
        refreshControl={<RefreshControl refreshing={loading} onRefresh={fetchRequests} />}
        ListEmptyComponent={
          !loading ? (
            <View style={styles.emptyState}>
              <UserPlus size={64} color={theme.icon} />
              <Text style={[styles.emptyText, { color: theme.icon }]}>No pending requests</Text>
              <Text style={[styles.emptySub, { color: theme.icon }]}>New customer connection requests will appear here</Text>
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
    paddingBottom: 120, // Increased for floating navbar
    gap: 16,
  },
  requestCard: {
    borderRadius: 24,
    borderWidth: 1,
    padding: 20,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  avatar: {
    width: 52,
    height: 52,
    borderRadius: 18,
  },
  info: {
    flex: 1,
  },
  name: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 4,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  metaText: {
    fontSize: 12,
    fontWeight: '500',
  },
  phoneBtn: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  divider: {
    height: 1,
    opacity: 0.1,
    marginVertical: 16,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  timeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  timeText: {
    fontSize: 12,
    fontWeight: '600',
  },
  actions: {
    flexDirection: 'row',
    gap: 12,
  },
  actionBtn: {
    width: 48,
    height: 48,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  rejectBtn: {
    backgroundColor: '#EF444415',
    borderWidth: 1,
    borderColor: '#EF444430',
  },
  approveBtn: {
    elevation: 4,
    shadowColor: '#3B82F6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
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
    lineHeight: 20,
    opacity: 0.7,
  },
});
