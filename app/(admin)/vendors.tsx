import React, { useEffect, useState, useCallback } from 'react';
import { StyleSheet, View, Text, FlatList, TouchableOpacity, ActivityIndicator, Image, Alert, TextInput } from 'react-native';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Store, ChevronRight, Search, Filter, Plus, Trash2, ShieldCheck, Clock, CheckCircle2, XCircle } from 'lucide-react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { adminService } from '@/services/adminService';
import UserAvatar from '@/components/UserAvatar';

export default function AdminVendors() {
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme ?? 'light'];
  const router = useRouter();

  const [activeTab, setActiveTab] = useState<'active' | 'pending'>('active');
  const [vendors, setVendors] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  const fetchVendors = useCallback(async () => {
    try {
      setLoading(true);
      const data = await adminService.getVendors();
      setVendors(data.vendors || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      fetchVendors();
    }, [fetchVendors])
  );

  const filteredVendors = vendors.filter(v => {
    const matchesTab = activeTab === 'active' ? v.isActive : !v.isActive;
    const matchesSearch = 
      (v.businessName || v.name || '').toLowerCase().includes(searchQuery.toLowerCase()) || 
      (v.area || '').toLowerCase().includes(searchQuery.toLowerCase());
    return matchesTab && matchesSearch;
  });

  const handleApprove = async (id: string) => {
    try {
      await adminService.updateVendor(id, { isActive: true });
      Alert.alert('Success', 'Vendor approved and activated!');
      fetchVendors();
    } catch (err: any) {
      Alert.alert('Error', err.message);
    }
  };

  const handleDeactivate = async (id: string) => {
    try {
      await adminService.updateVendor(id, { isActive: false });
      fetchVendors();
    } catch (err: any) {
      Alert.alert('Error', err.message);
    }
  };

  const handleDelete = (id: string) => {
    Alert.alert(
      'Confirm Delete',
      'Are you sure you want to remove this vendor?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete', 
          style: 'destructive',
          onPress: async () => {
            try {
              await adminService.deleteVendor(id);
              fetchVendors();
            } catch (err: any) {
              Alert.alert('Error', err.message);
            }
          }
        }
      ]
    );
  };

  const renderVendorItem = ({ item }: { item: any }) => (
    <View style={[styles.vendorCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
      <View style={styles.vendorHeader}>
        <UserAvatar 
          uri={item.profilePic} 
          size={56} 
          name={item.businessName || item.name} 
        />
        <View style={styles.vendorInfo}>
          <Text style={[styles.vendorName, { color: theme.text }]}>{item.businessName || item.name}</Text>
          <Text style={[styles.vendorArea, { color: theme.icon }]}>{item.area || item.city || 'Location Pending'}</Text>
          <Text style={[styles.vendorPhone, { color: theme.primary }]}>{item.phone}</Text>
        </View>
        
        {activeTab === 'pending' ? (
          <TouchableOpacity 
            style={[styles.approveBtn, { backgroundColor: '#10B981' }]}
            onPress={() => handleApprove(item._id)}
          >
             <CheckCircle2 size={16} color="white" />
             <Text style={styles.approveBtnText}>APPROVE</Text>
          </TouchableOpacity>
        ) : (
          <View style={[styles.statusBadge, { backgroundColor: '#10B98120' }]}>
            <ShieldCheck size={14} color="#10B981" />
            <Text style={[styles.statusText, { color: '#10B981' }]}>Verified</Text>
          </View>
        )}
      </View>
      
      <View style={[styles.divider, { backgroundColor: theme.border }]} />
      
      <View style={styles.vendorFooter}>
        <View style={styles.footerItem}>
          <Text style={[styles.footerLabel, { color: theme.icon }]}>Revenue</Text>
          <Text style={[styles.footerValue, { color: theme.text }]}>₹{item.revenue || 0}</Text>
        </View>
        <View style={styles.footerItem}>
          <Text style={[styles.footerLabel, { color: theme.icon }]}>Orders</Text>
          <Text style={[styles.footerValue, { color: theme.text }]}>{item.totalOrders || 0}</Text>
        </View>
        <View style={styles.footerActions}>
          <TouchableOpacity 
            style={[styles.miniAction, { backgroundColor: theme.error + '15' }]}
            onPress={() => activeTab === 'active' ? handleDeactivate(item._id) : handleDelete(item._id)}
          >
             {activeTab === 'active' ? <XCircle size={18} color={theme.error} /> : <Trash2 size={18} color={theme.error} />}
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={styles.header}>
        <View>
          <Text style={[styles.title, { color: theme.text }]}>Vendors</Text>
          <Text style={[styles.subtitle, { color: theme.icon }]}>Manage your water network</Text>
        </View>
      </View>

      <View style={styles.tabContainer}>
        <TouchableOpacity 
          style={[styles.tab, activeTab === 'active' && { borderBottomColor: theme.primary }]}
          onPress={() => setActiveTab('active')}
        >
          <Text style={[styles.tabText, { color: activeTab === 'active' ? theme.primary : theme.icon }]}>Active Hubs</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.tab, activeTab === 'pending' && { borderBottomColor: theme.primary }]}
          onPress={() => setActiveTab('pending')}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
            <Text style={[styles.tabText, { color: activeTab === 'pending' ? theme.primary : theme.icon }]}>Pending Approval</Text>
            {vendors.filter(v => !v.isActive).length > 0 && (
              <View style={styles.badge}><Text style={styles.badgeText}>{vendors.filter(v => !v.isActive).length}</Text></View>
            )}
          </View>
        </TouchableOpacity>
      </View>

      <View style={styles.searchBar}>
         <View style={[styles.searchInput, { backgroundColor: theme.card, borderColor: theme.border }]}>
            <Search size={20} color={theme.icon} />
            <TextInput
              style={{ flex: 1, color: theme.text, marginLeft: 10, fontSize: 13 }}
              placeholder="Search by name or city..."
              placeholderTextColor={theme.icon}
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
         </View>
      </View>

      <FlatList
        data={filteredVendors}
        renderItem={renderVendorItem}
        keyExtractor={(item) => item._id}
        contentContainerStyle={styles.listContent}
        onRefresh={fetchVendors}
        refreshing={loading}
        ListEmptyComponent={
          !loading ? (
            <View style={styles.emptyState}>
              {activeTab === 'pending' ? <Clock size={64} color={theme.icon} /> : <Store size={64} color={theme.icon} />}
              <Text style={[styles.emptyText, { color: theme.icon }]}>
                {activeTab === 'pending' ? 'No pending requests' : 'No active vendors found'}
              </Text>
            </View>
          ) : null
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  title: { fontSize: 28, fontWeight: '900' },
  subtitle: { fontSize: 14, fontWeight: '600' },
  tabContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginBottom: 10,
    gap: 20,
  },
  tab: {
    paddingVertical: 10,
    borderBottomWidth: 3,
    borderBottomColor: 'transparent',
  },
  tabText: { fontSize: 15, fontWeight: '800' },
  badge: { backgroundColor: '#EF4444', paddingHorizontal: 6, borderRadius: 10 },
  badgeText: { color: 'white', fontSize: 10, fontWeight: '900' },
  searchBar: { paddingHorizontal: 20, paddingVertical: 15 },
  searchInput: {
    height: 50,
    borderRadius: 15,
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 15,
  },
  listContent: { padding: 20, paddingBottom: 120, gap: 16 },
  vendorCard: { borderRadius: 24, borderWidth: 1, padding: 16 },
  vendorHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
  avatar: { width: 56, height: 56, borderRadius: 18 },
  vendorInfo: { flex: 1, marginLeft: 15 },
  vendorName: { fontSize: 18, fontWeight: '800' },
  vendorArea: { fontSize: 13, fontWeight: '600' },
  vendorPhone: { fontSize: 12, fontWeight: '700', marginTop: 2 },
  statusBadge: { flexDirection: 'row', alignItems: 'center', paddingVertical: 6, paddingHorizontal: 12, borderRadius: 10, gap: 6 },
  statusText: { fontSize: 11, fontWeight: '900' },
  approveBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingVertical: 8, paddingHorizontal: 12, borderRadius: 12 },
  approveBtnText: { color: 'white', fontSize: 10, fontWeight: '900' },
  divider: { height: 1, opacity: 0.1, marginBottom: 16 },
  vendorFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  footerItem: { flex: 1 },
  footerLabel: { fontSize: 11, fontWeight: '700' },
  footerValue: { fontSize: 16, fontWeight: '900' },
  footerActions: { flexDirection: 'row', gap: 10 },
  miniAction: { width: 40, height: 40, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  emptyState: { alignItems: 'center', justifyContent: 'center', paddingTop: 100 },
  emptyText: { marginTop: 16, fontSize: 16, fontWeight: '600' },
});
