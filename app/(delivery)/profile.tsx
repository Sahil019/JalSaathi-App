import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity, ScrollView, Image, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useAuth } from '@/context/AuthContext';
import { 
  User, 
  Settings, 
  History, 
  CreditCard, 
  HelpCircle, 
  LogOut, 
  ChevronRight,
  Shield,
  Bell,
  Navigation
} from 'lucide-react-native';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import Avatar from '@/components/Avatar';

const MENU_ITEMS = [
  { id: '1', title: 'Vehicle Information', icon: Navigation, color: '#3B82F6', route: '/(delivery)/vehicle' },
  { id: '2', title: 'Earnings & Payouts', icon: CreditCard, color: '#10B981', route: '/(delivery)/earnings' },
  { id: '3', title: 'Delivery History', icon: History, color: '#8B5CF6', route: '/(delivery)/history' },
  { id: '4', title: 'Notifications', icon: Bell, color: '#F59E0B', route: '/(delivery)/notifications' },
  { id: '5', title: 'Safety & Insurance', icon: Shield, color: '#EF4444', route: '/(delivery)/safety' },
  { id: '6', title: 'Support', icon: HelpCircle, color: '#0EA5E9', route: '/(delivery)/support' },
];

export default function DeliveryProfile() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme ?? 'light'];
  const { user, signOut } = useAuth();

  const handleLogout = () => {
    Alert.alert('Logout', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Logout', style: 'destructive', onPress: signOut },
    ]);
  };

  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={styles.header}>
        <Text style={[styles.headerTitle, { color: theme.text }]}>Profile</Text>
        <TouchableOpacity style={[styles.settingsBtn, { borderColor: theme.border }]}>
          <Settings size={22} color={theme.icon} />
        </TouchableOpacity>
      </View>

      <View style={styles.profileCard}>
        <LinearGradient
          colors={['#0EA5E9', '#2563EB']}
          style={styles.profileGradient}
        >
          <View style={styles.profileMain}>
            <View style={styles.avatarWrap}>
              <Avatar size={70} showEdit={true} />
              <View style={styles.onlineStatus} />
            </View>
            <View style={styles.profileInfo}>
              <Text style={styles.userName}>{user?.name || 'Partner'}</Text>
              <Text style={styles.userRole}>Delivery Partner • {(user as any)?.phone}</Text>
            </View>
          </View>
          
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
               <Text style={styles.statVal}>4.9</Text>
               <Text style={styles.statLab}>Rating</Text>
            </View>
            <View style={styles.divider} />
            <View style={styles.statItem}>
               <Text style={styles.statVal}>450</Text>
               <Text style={styles.statLab}>Deliveries</Text>
            </View>
            <View style={styles.divider} />
            <View style={styles.statItem}>
               <Text style={styles.statVal}>2y</Text>
               <Text style={styles.statLab}>Exp.</Text>
            </View>
          </View>
        </LinearGradient>
      </View>

      <View style={styles.menuSection}>
        {MENU_ITEMS.map((item) => (
          <TouchableOpacity 
            key={item.id} 
            style={[styles.menuItem, { borderBottomColor: theme.border }]}
            // @ts-ignore
            onPress={() => router.push(item.route)}
          >
            <View style={styles.menuLeft}>
              <View style={[styles.iconWrap, { backgroundColor: item.color + '15' }]}>
                <item.icon size={22} color={item.color} />
              </View>
              <Text style={[styles.menuTitle, { color: theme.text }]}>{item.title}</Text>
            </View>
            <ChevronRight size={20} color={theme.icon} />
          </TouchableOpacity>
        ))}
      </View>

      <TouchableOpacity 
        style={[styles.logoutBtn, { borderColor: theme.error + '50' }]} 
        onPress={handleLogout}
      >
        <LogOut size={20} color={theme.error} />
        <Text style={[styles.logoutText, { color: theme.error }]}>Sign Out</Text>
      </TouchableOpacity>

      <View style={styles.versionWrap}>
        <Text style={[styles.versionText, { color: theme.icon }]}>Version 2.4.0 (Partner Edition)</Text>
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 60,
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '800',
  },
  settingsBtn: {
    width: 44,
    height: 44,
    borderRadius: 14,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileCard: {
    paddingHorizontal: 20,
    marginBottom: 32,
  },
  profileGradient: {
    borderRadius: 32,
    padding: 24,
  },
  profileMain: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  avatarWrap: {
    position: 'relative',
  },
  avatar: {
    width: 70,
    height: 70,
    borderRadius: 24,
    borderWidth: 3,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  onlineStatus: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: '#10B981',
    borderWidth: 3,
    borderColor: '#0EA5E9',
  },
  profileInfo: {
    marginLeft: 16,
    flex: 1,
  },
  userName: {
    color: 'white',
    fontSize: 22,
    fontWeight: '800',
  },
  userRole: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 14,
    marginTop: 2,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 20,
    padding: 16,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statVal: {
    color: 'white',
    fontSize: 18,
    fontWeight: '800',
  },
  statLab: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 12,
    marginTop: 2,
    fontWeight: '600',
  },
  divider: {
    width: 1,
    height: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  menuSection: {
    paddingHorizontal: 20,
    marginBottom: 32,
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
  iconWrap: {
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
  logoutBtn: {
    marginHorizontal: 20,
    height: 60,
    borderRadius: 20,
    borderWidth: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 10,
    marginBottom: 20,
  },
  logoutText: {
    fontSize: 16,
    fontWeight: '700',
  },
  versionWrap: {
    alignItems: 'center',
  },
  versionText: {
    fontSize: 12,
    opacity: 0.5,
  }
});
