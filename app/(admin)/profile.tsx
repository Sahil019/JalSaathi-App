import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity, Image, ScrollView } from 'react-native';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useAuth } from '@/context/AuthContext';
import { 
  Shield, 
  Settings, 
  Bell, 
  HelpCircle, 
  LogOut,
  ChevronRight,
  ShieldCheck,
  FileText,
  BarChart2,
  Lock,
  BarChart3, // Added BarChart3
  Truck,      // Added Truck
  Users,      // Added Users
  Store,      // Added Store
  ShoppingBag // Added ShoppingBag
} from 'lucide-react-native';
import Avatar from '@/components/Avatar';

const MENU_ITEMS = [
  { id: '1', title: 'Revenue Analytics', icon: BarChart2, color: '#10B981', route: '/(admin)/revenue' },
  { id: '2', title: 'Fleet Management', icon: Shield, color: '#0EA5E9', route: '/(admin)/vehicles' },
  { id: '3', title: 'System Settings', icon: Settings, color: '#64748B' },
  { id: '4', title: 'Global Notifications', icon: Bell, color: '#F59E0B' },
  { id: '5', title: 'Audit Logs', icon: FileText, color: '#8B5CF6' },
  { id: '6', title: 'Support Center', icon: HelpCircle, color: '#3B82F6' },
];

// Assuming 'stats' would be passed as a prop or fetched within the component
// For now, using placeholder values for 'stats' related items to maintain syntax
const stats = {
  totalRevenue: 1234567,
  activeDrivers: 12,
  activeUsers: 150,
  totalVendors: 25,
  totalOrders: 500
};

const NEW_MENU_ITEMS = [
  { label: 'Total Revenue', value: `₹${stats?.totalRevenue?.toLocaleString() || '0'}`, icon: BarChart3, color: '#10B981', route: '/(admin)/revenue' },
  { label: 'Fleet Status', value: stats?.activeDrivers || '12 Active', icon: Truck, route: '/(admin)/vehicles', color: '#0EA5E9' },
  { label: 'Total Users', value: stats?.activeUsers || '0', icon: Users, color: '#3B82F6', route: '/(admin)/users' },
  { label: 'Vendors', value: stats?.totalVendors || '0', icon: Store, color: '#8B5CF6', route: '/(admin)/vendors' },
  { label: 'Total Orders', value: stats?.totalOrders || '0', icon: ShoppingBag, color: '#F59E0B', route: '/(admin)/orders' },
  { id: '5', title: 'Audit Logs', icon: FileText, color: '#8B5CF6' }, // Re-added existing item with 'title'
  { id: '6', title: 'Support Center', icon: HelpCircle, color: '#3B82F6' },
];


export default function AdminProfile() {
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme ?? 'light'];
  const { user, signOut } = useAuth();

  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={styles.header}>
        <Avatar size={110} showEdit={true} />
        <View style={[styles.statusDot, { backgroundColor: '#10B981', borderColor: theme.background }]} />
        <Text style={[styles.userName, { color: theme.text }]}>{user?.name || 'Super Admin'}</Text>
        <Text style={[styles.userEmail, { color: theme.icon }]}>Platform Administrator • Root Access</Text>
        
        <View style={styles.badgeRow}>
           <View style={[styles.badge, { backgroundColor: theme.primary + '15' }]}>
              <ShieldCheck size={14} color={theme.primary} />
              <Text style={[styles.badgeText, { color: theme.primary }]}>System God Mode</Text>
           </View>
        </View>
      </View>

      <View style={styles.menuContainer}>
        {MENU_ITEMS.map((item) => (
          <TouchableOpacity 
            key={item.id} 
            style={[styles.menuItem, { borderBottomColor: theme.border }]}
            // @ts-ignore
            onPress={() => item.route && router.push(item.route)}
          >
            <View style={styles.menuLeft}>
              <View style={[styles.menuIcon, { backgroundColor: item.color + '10' }]}>
                <item.icon size={20} color={item.color} />
              </View>
              <Text style={[styles.menuTitle, { color: theme.text }]}>{item.title}</Text>
            </View>
            <ChevronRight size={18} color={theme.icon} />
          </TouchableOpacity>
        ))}
        
        <TouchableOpacity 
          style={[styles.logoutButton, { borderTopColor: theme.border }]} 
          onPress={signOut}
        >
          <View style={styles.menuLeft}>
            <View style={[styles.menuIcon, { backgroundColor: theme.error + '10' }]}>
              <LogOut size={20} color={theme.error} />
            </View>
            <Text style={[styles.menuTitle, { color: theme.error }]}>Sign Out</Text>
          </View>
        </TouchableOpacity>
      </View>
      
      <View style={styles.footer}>
        <Text style={[styles.version, { color: theme.icon }]}>JalSaathi Admin Core v2.4.0-stable</Text>
      </View>
      
      <View style={{ height: 120 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    alignItems: 'center',
    paddingVertical: 60,
    paddingHorizontal: 20,
  },
  avatarWrap: {
    width: 110,
    height: 110,
    borderRadius: 55,
    padding: 2,
    borderWidth: 2,
    borderColor: '#0EA5E9',
    marginBottom: 20,
    position: 'relative',
  },
  avatar: {
    width: '100%',
    height: '100%',
    borderRadius: 55,
  },
  statusDot: {
    position: 'absolute',
    bottom: 5,
    right: 5,
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 4,
  },
  userName: {
    fontSize: 26,
    fontWeight: '900',
    marginBottom: 4,
    textAlign: 'center',
  },
  userEmail: {
    fontSize: 14,
    marginBottom: 20,
  },
  badgeRow: {
    flexDirection: 'row',
    gap: 8,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 14,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '800',
  },
  menuContainer: {
    paddingHorizontal: 20,
  },
  menuItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 18,
    borderBottomWidth: 1,
  },
  menuLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  menuIcon: {
    width: 44,
    height: 44,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  menuTitle: {
    fontSize: 16,
    fontWeight: '700',
  },
  logoutButton: {
    marginTop: 20,
    paddingVertical: 18,
    borderTopWidth: 1,
  },
  footer: {
    alignItems: 'center',
    marginTop: 40,
  },
  version: {
    fontSize: 12,
    fontWeight: '600',
    opacity: 0.5,
  }
});
