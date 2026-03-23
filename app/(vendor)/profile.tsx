import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity, Image, ScrollView, Switch } from 'react-native';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useAuth } from '@/context/AuthContext';
import { 
  Store, 
  MapPin, 
  Settings, 
  Bell, 
  CreditCard, 
  HelpCircle, 
  LogOut,
  ChevronRight,
  ShieldCheck,
  Truck,
  Package,
  Clock
} from 'lucide-react-native';
import Avatar from '@/components/Avatar';

const MENU_ITEMS = [
  { id: '1', title: 'Business Profile', icon: Store, color: '#3B82F6' },
  { id: '2', title: 'Operational Hours', icon: Clock, color: '#10B981' },
  { id: '3', title: 'Pricing & Catalog', icon: Package, color: '#8B5CF6' },
  { id: '4', title: 'Delivery Fleet', icon: Truck, color: '#F59E0B' },
  { id: '5', title: 'Payout Settings', icon: CreditCard, color: '#EF4444' },
  { id: '6', title: 'Compliance & Docs', icon: ShieldCheck, color: '#64748B' },
  { id: '7', title: 'Support Center', icon: HelpCircle, color: '#0EA5E9' },
];

export default function VendorProfile() {
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme ?? 'light'];
  const { user, signOut } = useAuth();
  
  const [isAcceptingOrders, setIsAcceptingOrders] = React.useState(true);

  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={styles.header}>
        <Avatar size={100} showEdit={true} />
        <Text style={[styles.userName, { color: theme.text }]}>{(user as any)?.businessName || user?.name || 'Business Name'}</Text>
        <Text style={[styles.userEmail, { color: theme.icon }]}>Partner since 2023 • ID: VD-88{user?.id?.slice(-2)}</Text>
        
        <View style={[styles.statusCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
           <View>
              <Text style={[styles.statusTitle, { color: theme.text }]}>Accepting Orders</Text>
              <Text style={[styles.statusSub, { color: theme.icon }]}>Currently visible to consumers</Text>
           </View>
           <Switch 
             value={isAcceptingOrders} 
             onValueChange={setIsAcceptingOrders}
             trackColor={{ false: '#767577', true: theme.primary + '80' }}
             thumbColor={isAcceptingOrders ? theme.primary : '#f4f3f4'}
           />
        </View>
      </View>

      <View style={styles.menuContainer}>
        {MENU_ITEMS.map((item) => (
          <TouchableOpacity key={item.id} style={[styles.menuItem, { borderBottomColor: theme.border }]}>
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
        <Text style={[styles.version, { color: theme.icon }]}>JalSaathi Partner App v1.2.0</Text>
      </View>
      
      <View style={{ height: 100 }} />
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
  avatarContainer: {
    width: 100,
    height: 100,
    borderRadius: 30,
    borderWidth: 3,
    padding: 3,
    marginBottom: 16,
  },
  avatar: {
    width: '100%',
    height: '100%',
    borderRadius: 24,
  },
  userName: {
    fontSize: 24,
    fontWeight: '800',
    marginBottom: 4,
    textAlign: 'center',
  },
  userEmail: {
    fontSize: 14,
    marginBottom: 24,
  },
  statusCard: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderRadius: 24,
    borderWidth: 1,
  },
  statusTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 2,
  },
  statusSub: {
    fontSize: 12,
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
