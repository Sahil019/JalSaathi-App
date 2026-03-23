import React, { useState, useMemo } from 'react';
import { StyleSheet, View, Text, FlatList, TouchableOpacity, RefreshControl, Dimensions, Animated, Platform } from 'react-native';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useNotifications } from '@/context/NotificationContext';
import { 
  Bell, 
  ShoppingBag, 
  Wallet, 
  Truck, 
  UserPlus, 
  Tag, 
  CheckCheck, 
  X, 
  ArrowRight,
  BellOff,
  Zap,
  Info
} from 'lucide-react-native';
import { BlurView } from 'expo-blur';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';

const { width } = Dimensions.get('window');

// Helper for relative time
const getRelativeTime = (dateString: string) => {
  const now = new Date();
  const date = new Date(dateString);
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffInSeconds < 60) return 'Just now';
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
  if (diffInSeconds < 172800) return 'Yesterday';
  return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
};

export default function NotificationsScreen() {
  const router = useRouter();
  const { notifications, loading, refresh, markAsRead, markAllAsRead, deleteNotification, unreadCount } = useNotifications();
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme ?? 'light'];
  const isDark = colorScheme === 'dark';

  const [activeTab, setActiveTab] = useState('All');

  const filteredNotifications = useMemo(() => {
    if (activeTab === 'Offers') {
      return notifications.filter(n => n.type === 'alert' || n.title.toLowerCase().includes('offer'));
    }
    return notifications;
  }, [notifications, activeTab]);

  const getIconConfig = (type: string) => {
    switch (type) {
      case 'order': return { icon: ShoppingBag, color: '#8B5CF6', bg: '#8B5CF615' };
      case 'request': return { icon: UserPlus, color: '#F59E0B', bg: '#F59E0B15' };
      case 'wallet': return { icon: Wallet, color: '#10B981', bg: '#10B98115' };
      case 'order_assigned': return { icon: Truck, color: '#0EA5E9', bg: '#0EA5E915' };
      case 'payment': return { icon: Zap, color: '#EC4899', bg: '#EC489915' };
      case 'system': return { icon: Info, color: '#6366F1', bg: '#6366F115' };
      default: return { icon: Bell, color: '#64748B', bg: '#64748B15' };
    }
  };

  const renderItem = ({ item }: { item: any }) => {
    const config = getIconConfig(item.type);
    const Icon = config.icon;

    return (
      <View style={styles.cardWrapper}>
        <TouchableOpacity 
          activeOpacity={0.7}
          style={[
            styles.card, 
            { 
              backgroundColor: isDark ? '#1E1E1E' : '#FFFFFF',
              borderColor: item.isRead ? 'transparent' : config.color + '40',
              borderWidth: item.isRead ? 0 : 1
            }
          ]}
          onPress={() => {
            markAsRead(item._id);
            if (item.data?.orderId) {
              // Context aware navigation
              router.push({ pathname: '/(vendor)/order-details', params: { id: item.data.orderId } });
            }
          }}
        >
          <View style={[styles.iconContainer, { backgroundColor: config.bg }]}>
            <Icon size={22} color={config.color} />
          </View>
          
          <View style={styles.content}>
            <View style={styles.cardHeader}>
               <Text style={[styles.title, { color: theme.text, fontWeight: item.isRead ? '600' : '800' }]} numberOfLines={1}>
                 {item.title}
               </Text>
               <Text style={[styles.time, { color: theme.icon }]}>{getRelativeTime(item.createdAt)}</Text>
            </View>
            <Text style={[styles.message, { color: theme.text, opacity: item.isRead ? 0.6 : 1 }]} numberOfLines={2}>
              {item.message}
            </Text>
            
            {!item.isRead && (
              <View style={[styles.unreadBadge, { backgroundColor: config.color }]}>
                <Text style={styles.unreadText}>NEW</Text>
              </View>
            )}
            
            {item.data?.orderId && (
              <TouchableOpacity style={styles.cta} onPress={() => router.push({ pathname: '/(vendor)/order-details', params: { id: item.data.orderId } })}>
                <Text style={[styles.ctaText, { color: config.color }]}>VIEW DETAILS</Text>
                <ArrowRight size={12} color={config.color} />
              </TouchableOpacity>
            )}
          </View>

          <TouchableOpacity 
            style={styles.deleteBtn} 
            onPress={() => deleteNotification(item._id)}
          >
            <X size={16} color={theme.icon} />
          </TouchableOpacity>
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: isDark ? '#0F172A' : '#F8FAFC' }]}>
      {/* Background Decor */}
      <View style={[styles.decorCircle, { top: -50, right: -50, backgroundColor: '#6366F110' }]} />
      <View style={[styles.decorCircle, { bottom: -50, left: -50, backgroundColor: '#8B5CF608' }]} />

      {/* Header Section */}
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <View>
            <Text style={[styles.greeting, { color: '#6366F1' }]}>ACTIVITY</Text>
            <Text style={[styles.headerTitle, { color: theme.text }]}>Notifications</Text>
          </View>
          {unreadCount > 0 && (
            <TouchableOpacity onPress={markAllAsRead} style={styles.markAllBtn}>
              <CheckCheck size={18} color="#6366F1" />
              <Text style={styles.markAllTxt}>Clear All</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Swiggy/Zomato Tags */}
        <View style={styles.tabContainer}>
           {['All', 'Offers'].map((tab) => (
             <TouchableOpacity 
               key={tab}
               onPress={() => setActiveTab(tab)}
               style={[
                 styles.tab, 
                 activeTab === tab && { backgroundColor: '#6366F1', borderColor: '#6366F1' }
               ]}
             >
               <Text style={[
                 styles.tabText, 
                 { color: activeTab === tab ? 'white' : theme.icon }
               ]}>{tab}</Text>
               {tab === 'All' && unreadCount > 0 && (
                 <View style={styles.tabBadge}>
                   <Text style={styles.tabBadgeTxt}>{unreadCount}</Text>
                 </View>
               )}
             </TouchableOpacity>
           ))}
        </View>
      </View>

      <FlatList
        data={filteredNotifications}
        renderItem={renderItem}
        keyExtractor={item => item._id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={loading} onRefresh={refresh} tintColor="#6366F1" />}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <View style={styles.emptyIconWrap}>
               <BellOff size={48} color={isDark ? '#334155' : '#CBD5E1'} />
            </View>
            <Text style={[styles.emptyTitle, { color: theme.text }]}>No notifications yet</Text>
            <Text style={[styles.emptySubtitle, { color: theme.icon }]}>
              We'll let you know when something important happens.
            </Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  decorCircle: { position: 'absolute', width: 200, height: 200, borderRadius: 100 },
  header: { paddingTop: 60, paddingHorizontal: 24, marginBottom: 12 },
  headerTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  greeting: { fontSize: 13, fontWeight: '900', letterSpacing: 2 },
  headerTitle: { fontSize: 32, fontWeight: '900', letterSpacing: -0.5 },
  markAllBtn: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    gap: 6, 
    backgroundColor: '#6366F115', 
    paddingHorizontal: 14, 
    paddingVertical: 8, 
    borderRadius: 12 
  },
  markAllTxt: { color: '#6366F1', fontSize: 13, fontWeight: '800' },
  tabContainer: { flexDirection: 'row', gap: 10 },
  tab: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    paddingHorizontal: 20, 
    paddingVertical: 10, 
    borderRadius: 20, 
    borderWidth: 1, 
    borderColor: '#FFFFFF10',
    backgroundColor: '#FFFFFF05'
  },
  tabText: { fontSize: 14, fontWeight: '800' },
  tabBadge: { 
    backgroundColor: '#EF4444', 
    minWidth: 18, 
    height: 18, 
    borderRadius: 9, 
    justifyContent: 'center', 
    alignItems: 'center', 
    marginLeft: 8,
    paddingHorizontal: 4
  },
  tabBadgeTxt: { color: 'white', fontSize: 10, fontWeight: '900' },
  listContent: { paddingHorizontal: 20, paddingBottom: 40 },
  cardWrapper: { marginBottom: 12 },
  card: {
    flexDirection: 'row',
    padding: 18,
    borderRadius: 24,
    ...Platform.select({
      ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 10 },
      android: { elevation: 3 }
    })
  },
  iconContainer: {
    width: 52,
    height: 52,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16
  },
  content: { flex: 1 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 },
  title: { fontSize: 16, flex: 1, marginRight: 8 },
  time: { fontSize: 11, fontWeight: '700' },
  message: { fontSize: 13, lineHeight: 18 },
  unreadBadge: { 
    alignSelf: 'flex-start', 
    marginTop: 10, 
    paddingHorizontal: 8, 
    paddingVertical: 3, 
    borderRadius: 6 
  },
  unreadText: { color: 'white', fontSize: 9, fontWeight: '900' },
  cta: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 12 },
  ctaText: { fontSize: 11, fontWeight: '900' },
  deleteBtn: { padding: 4, position: 'absolute', top: 12, right: 12 },
  emptyContainer: { flex: 1, alignItems: 'center', justifyContent: 'center', marginTop: 100 },
  emptyIconWrap: { 
    width: 80, 
    height: 80, 
    borderRadius: 40, 
    backgroundColor: '#FFFFFF05', 
    justifyContent: 'center', 
    alignItems: 'center',
    marginBottom: 20
  },
  emptyTitle: { fontSize: 20, fontWeight: '900', marginBottom: 8 },
  emptySubtitle: { fontSize: 14, textAlign: 'center', opacity: 0.6, paddingHorizontal: 40, lineHeight: 20 }
});
