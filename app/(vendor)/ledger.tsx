import React, { useEffect, useState } from 'react';
import { StyleSheet, View, Text, FlatList, TouchableOpacity, ActivityIndicator, Alert, RefreshControl } from 'react-native';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { BookText, Search, Filter, ArrowUpRight, CheckCircle2, User, Phone, Calendar } from 'lucide-react-native';
import { vendorService } from '@/services/vendorService';
import { LinearGradient } from 'expo-linear-gradient';

export default function VendorLedger() {
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme ?? 'light'];

  const [udhars, setUdhars] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [settlingId, setSettlingId] = useState<string | null>(null);

  useEffect(() => {
    fetchUdhar();
  }, []);

  const fetchUdhar = async () => {
    try {
      setLoading(true);
      const data = await vendorService.getUdharList();
      setUdhars(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSettle = async (id: string, amount: number) => {
    Alert.alert(
      'Settle Credit',
      `Confirm settlement of ₹${amount}? This will mark it as paid.`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Confirm', 
          onPress: async () => {
            try {
              setSettlingId(id);
              await vendorService.settleUdhar(id);
              Alert.alert('Success', 'Credit settled successfully');
              fetchUdhar();
            } catch (err: any) {
              Alert.alert('Error', err.message);
            } finally {
              setSettlingId(null);
            }
          }
        }
      ]
    );
  };

  const totalUdhar = udhars.reduce((acc, curr) => acc + (curr.amount || 0), 0);

  const renderItem = ({ item }: { item: any }) => (
    <View style={[styles.card, { backgroundColor: theme.card, borderColor: theme.border }]}>
      <View style={styles.cardTop}>
         <View style={styles.custBox}>
            <View style={[styles.avatar, { backgroundColor: theme.primary + '15' }]}>
               <User size={20} color={theme.primary} />
            </View>
            <View>
               <Text style={[styles.name, { color: theme.text }]}>{item.name || 'Unknown'}</Text>
               <Text style={[styles.area, { color: theme.icon }]}>{item.phone || 'No phone'}</Text>
            </View>
         </View>
         <View style={styles.amtBox}>
            <Text style={[styles.amtPrefix, { color: theme.error }]}>Owes</Text>
            <Text style={[styles.amtVal, { color: theme.error }]}>₹{item.amount}</Text>
         </View>
      </View>

      <View style={[styles.divider, { backgroundColor: theme.border }]} />

      <View style={styles.cardBottom}>
         <View style={styles.dateRow}>
            <Calendar size={14} color={theme.icon} />
            <Text style={[styles.dateText, { color: theme.icon }]}>Since {new Date(item.createdAt).toLocaleDateString()}</Text>
         </View>
         <TouchableOpacity 
            style={[styles.settleBtn, { backgroundColor: theme.primary }]}
            onPress={() => handleSettle(item._id, item.amount)}
            disabled={!!settlingId}
         >
            {settlingId === item._id ? <ActivityIndicator size="small" color="white" /> : (
               <>
                  <CheckCircle2 size={16} color="white" />
                  <Text style={styles.settleText}>Settle</Text>
               </>
            )}
         </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={styles.header}>
        <View>
          <Text style={[styles.title, { color: theme.text }]}>Credit Ledger</Text>
           <Text style={[styles.subtitle, { color: theme.icon }]}>Manage your &apos;Udhar&apos; accounts</Text>
        </View>
      </View>

      {/* Summary Card */}
      <LinearGradient
        colors={['#EF4444', '#B91C1C']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.summaryCard}
      >
         <View>
            <Text style={styles.sumLabel}>Total Collection Pending</Text>
            <Text style={styles.sumVal}>₹{totalUdhar.toLocaleString()}</Text>
         </View>
         <View style={styles.sumIcon}>
            <ArrowUpRight size={32} color="white" />
         </View>
      </LinearGradient>

      <View style={styles.searchBar}>
         <View style={[styles.searchInput, { backgroundColor: theme.card, borderColor: theme.border }]}>
            <Search size={20} color={theme.icon} />
            <Text style={{ color: theme.icon, marginLeft: 10 }}>Search customers...</Text>
         </View>
      </View>

      <FlatList
        data={udhars}
        renderItem={renderItem}
        keyExtractor={(item) => item._id}
        contentContainerStyle={styles.listContent}
        refreshControl={<RefreshControl refreshing={loading} onRefresh={fetchUdhar} />}
        ListEmptyComponent={
          !loading ? (
            <View style={styles.emptyState}>
              <BookText size={64} color={theme.icon} />
              <Text style={[styles.emptyText, { color: theme.icon }]}>No active credits</Text>
              <Text style={[styles.emptySub, { color: theme.icon }]}>Customers with unpaid orders will appear here</Text>
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
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
  },
  subtitle: {
    fontSize: 14,
    marginTop: 4,
  },
  summaryCard: {
    marginHorizontal: 20,
    padding: 24,
    borderRadius: 24,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
    elevation: 8,
    shadowColor: '#EF4444',
    shadowOpacity: 0.3,
    shadowRadius: 10,
  },
  sumLabel: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4,
  },
  sumVal: {
    color: 'white',
    fontSize: 32,
    fontWeight: '900',
  },
  sumIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
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
  cardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  custBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  name: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 2,
  },
  area: {
    fontSize: 12,
  },
  amtBox: {
    alignItems: 'flex-end',
  },
  amtPrefix: {
    fontSize: 10,
    fontWeight: '700',
    marginBottom: 2,
    textTransform: 'uppercase',
  },
  amtVal: {
    fontSize: 20,
    fontWeight: '900',
  },
  divider: {
    height: 1,
    opacity: 0.1,
    marginVertical: 16,
  },
  cardBottom: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  dateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  dateText: {
    fontSize: 12,
    fontWeight: '600',
  },
  settleBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 12,
    gap: 8,
  },
  settleText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '800',
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
