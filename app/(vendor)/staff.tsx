import React, { useEffect, useState } from 'react';
import { StyleSheet, View, Text, FlatList, TouchableOpacity, ActivityIndicator, Alert, Image, RefreshControl, TextInput } from 'react-native';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Truck, Plus, Search, MapPin, Star, Phone, MoreVertical } from 'lucide-react-native';
import { vendorService } from '@/services/vendorService';
import UserAvatar from '@/components/UserAvatar';

export default function VendorStaff() {
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme ?? 'light'];

  const [staff, setStaff] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  const filteredStaff = staff.filter(s =>
    (s.name || s.user?.name || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  useEffect(() => {
    fetchStaff();
  }, []);

  const fetchStaff = async () => {
    try {
      setLoading(true);
      const data = await vendorService.getStaff();
      setStaff(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddStaff = () => {
    Alert.alert('Add Delivery Partner', 'Creating new invitation link for delivery partner...');
    // Real implementation would open a form
  };

  const handleToggleStatus = async (item: any) => {
    try {
      await vendorService.updateStaff(item._id, { isActive: !item.isActive });
      fetchStaff();
    } catch (err: any) {
      Alert.alert('Error', err.message);
    }
  };

  const handleDeleteStaff = (id: string) => {
    Alert.alert(
      'Delete Staff',
      'Are you sure you want to remove this delivery partner?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete', 
          style: 'destructive', 
          onPress: async () => {
            try {
              await vendorService.deleteStaff(id);
              fetchStaff();
            } catch (err: any) {
              Alert.alert('Error', err.message);
            }
          }
        }
      ]
    );
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'AVAILABLE': return '#10B981';
      case 'BUSY': return '#F59E0B';
      case 'OFFLINE': return '#64748B';
      default: return theme.icon;
    }
  };

  const renderItem = ({ item }: { item: any }) => (
    <View style={[styles.card, { backgroundColor: theme.card, borderColor: theme.border }]}>
      <View style={styles.cardHeader}>
        <UserAvatar 
          uri={item.user?.profilePic || item.profilePic} 
          size={52} 
          name={item.name || item.user?.name} 
        />
        <View style={styles.info}>
          <View style={styles.nameRow}>
             <Text style={[styles.name, { color: theme.text }]}>{item.name || item.user?.name || 'Staff Member'}</Text>
             {!item.isActive && <Text style={{ color: theme.error, fontSize: 10, fontWeight: '700' }}>[INACTIVE]</Text>}
          </View>
          <View style={styles.metaRow}>
             <Star size={12} color="#F59E0B" fill="#F59E0B" />
             <Text style={[styles.rating, { color: theme.icon }]}>{item.insights?.performanceScore?.toFixed(1) || '5.0'} • {item.insights?.totalDeliveries || 0} Deliveries</Text>
          </View>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) + '15' }]}>
           <View style={[styles.statusDot, { backgroundColor: getStatusColor(item.status) }]} />
           <Text style={[styles.statusText, { color: getStatusColor(item.status) }]}>{item.status}</Text>
        </View>
      </View>

      <View style={[styles.divider, { backgroundColor: theme.border }]} />

      <View style={styles.footer}>
         <View style={styles.areaRow}>
            <Truck size={16} color={theme.icon} />
            <Text style={[styles.areaText, { color: theme.icon }]}>Vehicle: {item.vehicleType || 'Bike'}</Text>
         </View>
         <View style={styles.actions}>
            <TouchableOpacity 
              style={[styles.actionBtn, { backgroundColor: theme.primary + '15' }]}
              onPress={() => Alert.alert('Call', `Calling ${item.phone}...`)}
            >
               <Phone size={18} color={theme.primary} />
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.actionBtn, { backgroundColor: theme.border + '15' }]}
              onPress={() => {
                Alert.alert(
                  'Manage Staff',
                  'Select an action',
                  [
                    { text: 'Cancel', style: 'cancel' },
                    { text: item.isActive ? 'Deactivate' : 'Activate', onPress: () => handleToggleStatus(item) },
                    { text: 'Delete', style: 'destructive', onPress: () => handleDeleteStaff(item._id) }
                  ]
                );
              }}
            >
               <MoreVertical size={18} color={theme.text} />
            </TouchableOpacity>
         </View>
      </View>
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={styles.header}>
        <View>
          <Text style={[styles.title, { color: theme.text }]}>Delivery Team</Text>
          <Text style={[styles.subtitle, { color: theme.icon }]}>Manage your delivery personnel</Text>
        </View>
        <TouchableOpacity style={[styles.addBtn, { backgroundColor: theme.primary }]} onPress={handleAddStaff}>
          <Plus size={24} color="white" />
        </TouchableOpacity>
      </View>

      <View style={styles.searchBar}>
         <View style={[styles.searchInput, { backgroundColor: theme.card, borderColor: theme.border }]}>
            <Search size={20} color={theme.icon} />
            <TextInput
              style={{ flex: 1, color: theme.text, marginLeft: 10, fontSize: 13 }}
              placeholder="Search staff by name..."
              placeholderTextColor={theme.icon}
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
         </View>
      </View>

      <FlatList
        data={filteredStaff}
        renderItem={renderItem}
        keyExtractor={(item) => item._id}
        contentContainerStyle={styles.listContent}
        refreshControl={<RefreshControl refreshing={loading} onRefresh={fetchStaff} />}
        ListEmptyComponent={
          !loading ? (
            <View style={styles.emptyState}>
              <Truck size={64} color={theme.icon} />
              <Text style={[styles.emptyText, { color: theme.icon }]}>No staff assigned</Text>
              <Text style={[styles.emptySub, { color: theme.icon }]}>Add delivery boys to start fulfilling orders</Text>
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
    paddingBottom: 24,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
  },
  subtitle: {
    fontSize: 14,
  },
  addBtn: {
    width: 48,
    height: 48,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
  },
  searchBar: {
    paddingHorizontal: 20,
    paddingBottom: 16,
  },
  searchInput: {
    height: 50,
    borderRadius: 15,
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 15,
  },
  listContent: {
    padding: 20,
    paddingBottom: 40,
    gap: 16,
  },
  card: {
    borderRadius: 24,
    borderWidth: 1,
    padding: 18,
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
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 2,
  },
  name: {
    fontSize: 18,
    fontWeight: '700',
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  rating: {
    fontSize: 12,
    fontWeight: '500',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
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
  areaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  areaText: {
    fontSize: 13,
    fontWeight: '600',
  },
  actions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionBtn: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 80,
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
