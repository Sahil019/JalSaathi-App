import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useAuth } from '@/context/AuthContext';
import Avatar from '@/components/Avatar';
import { 
  User, 
  MapPin, 
  Settings, 
  Bell, 
  CreditCard, 
  HelpCircle, 
  LogOut,
  ChevronRight,
  ShieldCheck,
  History
} from 'lucide-react-native';

const MENU_ITEMS = [
  { id: '1', title: 'Personal Details', icon: User, color: '#3B82F6' },
  { id: 'orders', title: 'My Orders', icon: History, color: '#10B981' },
  { id: '2', title: 'Manage Addresses', icon: MapPin, color: '#6366F1' },
  { id: '3', title: 'Payment Methods', icon: CreditCard, color: '#8B5CF6' },
  { id: '4', title: 'Notifications', icon: Bell, color: '#F59E0B' },
  { id: '5', title: 'Privacy & Security', icon: ShieldCheck, color: '#EF4444' },
  { id: '6', title: 'Settings', icon: Settings, color: '#64748B' },
  { id: '7', title: 'Help & Support', icon: HelpCircle, color: '#0EA5E9' },
];

export default function ProfilePage() {
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme ?? 'light'];
  const router = useRouter();
  const { user, signOut } = useAuth();

  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={styles.header}>
        <Avatar size={100} showEdit={true} />
        
        <Text style={[styles.userName, { color: theme.text }]}>{user?.name || 'User'}</Text>
        <Text style={[styles.userEmail, { color: theme.icon }]}>{user?.email || ''}</Text>
        
        <View style={styles.badgeRow}>
          <View style={[styles.badge, { backgroundColor: theme.primary + '10' }]}>
             <Text style={[styles.badgeText, { color: theme.primary }]}>Member</Text>
          </View>
          <View style={[styles.badge, { backgroundColor: theme.success + '10' }]}>
             <Text style={[styles.badgeText, { color: theme.success }]}>Verified</Text>
          </View>
        </View>
      </View>

      <View style={styles.menuContainer}>
        {MENU_ITEMS.map((item) => (
          <TouchableOpacity 
            key={item.id} 
            style={[styles.menuItem, { borderBottomColor: theme.border }]}
            onPress={() => {
              if (item.id === 'orders') {
                router.push('/(consumer)/order-history');
              }
            }}
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
        <Text style={[styles.version, { color: theme.icon }]}>Version 1.1.0</Text>
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
    paddingVertical: 40,
  },
  userName: {
    fontSize: 24,
    fontWeight: '800',
    marginBottom: 4,
    marginTop: 16,
  },
  userEmail: {
    fontSize: 15,
    marginBottom: 20,
  },
  badgeRow: {
    flexDirection: 'row',
    gap: 8,
  },
  badge: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '700',
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
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  menuTitle: {
    fontSize: 16,
    fontWeight: '600',
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
  }
});
