import React, { useEffect, useState, useCallback } from 'react';
import { StyleSheet, View, Text, FlatList, TouchableOpacity, Image, Alert, TextInput } from 'react-native';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Users, Search, Mail, Phone, MapPin, MoreVertical } from 'lucide-react-native';
import { useRouter, useFocusEffect, Href } from 'expo-router';
import { adminService } from '@/services/adminService';
import UserAvatar from '@/components/UserAvatar';

export default function AdminRevenue() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme ?? 'light'];


  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  const filteredUsers = users.filter(u => 
    u.name?.toLowerCase().includes(searchQuery.toLowerCase()) || 
    u.phone?.includes(searchQuery)
  );

  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true);
      const data = await adminService.getConsumers();
      setUsers(data.consumers || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      fetchUsers();
    }, [fetchUsers])
  );

  const handleToggleStatus = async (user: any) => {
    try {
      await adminService.updateConsumer(user._id, { isActive: !user.isActive });
      fetchUsers();
    } catch (err: any) {
      Alert.alert('Error', err.message);
    }
  };

  const handleDeleteUser = (id: string) => {
    Alert.alert(
      'Confirm Delete',
      'Are you sure you want to remove this user? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete', 
          style: 'destructive',
          onPress: async () => {
            try {
              await adminService.deleteConsumer(id);
              fetchUsers();
            } catch (err: any) {
              Alert.alert('Error', err.message);
            }
          }
        }
      ]
    );
  };

  const handleMorePress = (user: any) => {
    Alert.alert(
      'User Management',
      user.name,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: user.isActive ? 'Block User' : 'Unblock User', 
          onPress: () => handleToggleStatus(user) 
        },
        { 
          text: 'Delete User', 
          style: 'destructive',
          onPress: () => handleDeleteUser(user._id) 
        }
      ]
    );
  };

  const renderUserItem = ({ item }: { item: any }) => (
    <View style={[styles.userCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
      <View style={styles.userHeader}>
        <UserAvatar 
          uri={item.profilePic} 
          size={50} 
          name={item.name} 
        />
        <View style={styles.userInfo}>
           <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
             <Text style={[styles.userName, { color: theme.text }]}>{item.name}</Text>
             {!item.isActive && (
               <View style={{ backgroundColor: '#EF444420', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 }}>
                  <Text style={{ color: '#EF4444', fontSize: 10, fontWeight: '800' }}>BLOCKED</Text>
               </View>
             )}
           </View>
           <Text style={[styles.userRole, { color: theme.icon }]}>Consumer • Member since {new Date(item.createdAt).getFullYear()}</Text>
        </View>
        <TouchableOpacity 
          style={styles.moreBtn}
          onPress={() => handleMorePress(item)}
        >
           <MoreVertical size={20} color={theme.icon} />
        </TouchableOpacity>
      </View>
      
      <View style={[styles.divider, { backgroundColor: theme.border }]} />
      
      <View style={styles.userDetails}>
         <View style={styles.detailItem}>
            <Phone size={16} color={theme.primary} />
            <Text style={[styles.detailText, { color: theme.text }]}>{item.phone}</Text>
         </View>
         <View style={styles.detailItem}>
            <Mail size={16} color={theme.primary} />
            <Text style={[styles.detailText, { color: theme.text }]}>{item.email}</Text>
         </View>
         <View style={styles.detailItem}>
            <MapPin size={16} color={theme.primary} />
            <Text style={[styles.detailText, { color: theme.text }]} numberOfLines={1}>{item.address || item.area || 'No address set'}</Text>
         </View>
      </View>

      <View style={styles.userFooter}>
         <View style={styles.walletBox}>
            <Text style={[styles.walletLabel, { color: theme.icon }]}>Wallet</Text>
            <Text style={[styles.walletVal, { color: theme.primary }]}>₹{item.walletBalance || 0}</Text>
         </View>
         <TouchableOpacity 
            style={[styles.actionBtn, { borderColor: theme.border, backgroundColor: theme.primary + '10' }]}
            onPress={() => {
              // Navigate to orders with a preset search query for this user
              router.push({
                 pathname: '/(admin)/orders',
                 params: { search: item.name }
              });
            }}
          >
            <Text style={[styles.actionText, { color: theme.primary }]}>View Orders</Text>
         </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={styles.header}>
        <View>
          <Text style={[styles.title, { color: theme.text }]}>Consumers</Text>
          <Text style={[styles.subtitle, { color: theme.icon }]}>{users.length} registered users</Text>
        </View>
      </View>

      <View style={styles.searchBar}>
         <View style={[styles.searchInput, { backgroundColor: theme.card, borderColor: theme.border }]}>
            <Search size={20} color={theme.icon} />
            <TextInput
              style={{ flex: 1, color: theme.text, marginLeft: 10, fontSize: 13 }}
              placeholder="Search users by name or phone..."
              placeholderTextColor={theme.icon}
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
            {searchQuery ? (
              <TouchableOpacity onPress={() => setSearchQuery('')}>
                <Text style={{ color: theme.icon, fontSize: 12, fontWeight: '700' }}>Clear</Text>
              </TouchableOpacity>
            ) : null}
         </View>
      </View>

      <FlatList
        data={filteredUsers}
        renderItem={renderUserItem}
        keyExtractor={(item) => item._id}
        contentContainerStyle={styles.listContent}
        onRefresh={fetchUsers}
        refreshing={loading}
        ListEmptyComponent={
          !loading ? (
            <View style={styles.emptyState}>
              <Users size={64} color={theme.icon} />
              <Text style={[styles.emptyText, { color: theme.icon }]}>No users found</Text>
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
    paddingBottom: 10,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
  },
  subtitle: {
    fontSize: 14,
  },
  searchBar: {
    paddingHorizontal: 20,
    paddingVertical: 15,
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
    paddingBottom: 120, // Account for floating tab bar
    gap: 16,
  },
  userCard: {
    borderRadius: 24,
    borderWidth: 1,
    padding: 20,
  },
  userHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
  },
  userInfo: {
    flex: 1,
    marginLeft: 12,
  },
  userName: {
    fontSize: 18,
    fontWeight: '700',
  },
  userRole: {
    fontSize: 12,
  },
  moreBtn: {
    padding: 4,
  },
  divider: {
    height: 1,
    opacity: 0.1,
    marginBottom: 16,
  },
  userDetails: {
    gap: 10,
    marginBottom: 20,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  detailText: {
    fontSize: 14,
    fontWeight: '500',
  },
  userFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  walletBox: {
    // alignItems: 'center',
  },
  walletLabel: {
    fontSize: 11,
    fontWeight: '600',
    marginBottom: 2,
  },
  walletVal: {
    fontSize: 18,
    fontWeight: '800',
  },
  actionBtn: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
  },
  actionText: {
    fontSize: 13,
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
