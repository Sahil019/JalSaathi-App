import React, { useState, useEffect, useCallback } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, FlatList, TextInput, ActivityIndicator, Alert } from 'react-native';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Wallet, Plus, ArrowUpRight, ArrowDownLeft, ReceiptText } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { consumerService } from '@/services/consumerService';

export default function WalletPage() {
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme ?? 'light'];
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [customAmount, setCustomAmount] = useState('');

  const fetchWallet = useCallback(async () => {
    try {
      const walletData = await consumerService.getWalletTransactions();
      setData(walletData);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchWallet();
  }, [fetchWallet]);

  const handleTopUp = async (amount: number) => {
    if (!amount || amount <= 0) return;
    try {
      setActionLoading(true);
      await consumerService.addMoney(amount);
      setCustomAmount('');
      const walletData = await consumerService.getWalletTransactions();
      setData(walletData);
      Alert.alert('Success!', `₹${amount} added successfully to your JalSaathi wallet.`);
    } catch (err: any) {
      Alert.alert('Failed', err.message || 'Failed to add money');
    } finally {
      setActionLoading(false);
    }
  };

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short' });
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      {/* 💜 PURPLE BRANDED WALLET CARD */}
      <LinearGradient 
        colors={['#8B5CF6', '#6366F1']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.card}
      >
        <View style={styles.cardTop}>
          <Text style={styles.cardLabel}>Available Balance</Text>
          <Wallet color="white" size={24} opacity={0.6} />
        </View>
        <Text style={styles.balance}>₹{data?.balance?.toFixed(2) || '0.00'}</Text>
        <View style={styles.cardActions}>
          <TouchableOpacity style={styles.cardButton} onPress={() => Alert.alert('Add Money', 'Use the input below to top up your wallet.')}>
            <Plus size={18} color="#8B5CF6" />
            <Text style={[styles.cardButtonText, { color: '#8B5CF6' }]}>Top Up</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.cardButton, { backgroundColor: 'rgba(255,255,255,0.15)', borderWidth: 0 }]}>
            <ArrowUpRight size={18} color="white" />
            <Text style={[styles.cardButtonText, { color: 'white' }]}>Transfer</Text>
          </TouchableOpacity>
        </View>
      </LinearGradient>

      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: theme.text }]}>Quick Add Money</Text>
        <View style={styles.topUpInputWrap}>
           <View style={[styles.amountInput, { backgroundColor: theme.card, borderColor: theme.border }]}>
              <Text style={[styles.currency, { color: theme.icon }]}>₹</Text>
              <TextInput 
                style={[styles.input, { color: theme.text }]}
                placeholder="Enter custom amount"
                placeholderTextColor={theme.icon}
                keyboardType="numeric"
                value={customAmount}
                onChangeText={setCustomAmount}
              />
           </View>
           <TouchableOpacity 
             style={[styles.addBtn, { backgroundColor: '#8B5CF6' }]}
             onPress={() => handleTopUp(Number(customAmount))}
             disabled={actionLoading || !customAmount}
           >
              {actionLoading ? <ActivityIndicator size="small" color="white" /> : <Plus size={24} color="white" />}
           </TouchableOpacity>
        </View>

        <View style={styles.quickAddRow}>
          {[100, 500, 1000].map((amount) => (
            <TouchableOpacity 
              key={amount} 
              style={[styles.amountChip, { backgroundColor: theme.card, borderColor: theme.border }]}
              onPress={() => handleTopUp(amount)}
              disabled={actionLoading}
            >
              <Text style={[styles.amountChipText, { color: theme.text }]}>+₹{amount}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <View style={[styles.section, { flex: 1 }]}>
        <View style={styles.sectionHeader}>
          <View style={styles.txHeaderLeft}>
            <ReceiptText size={18} color={theme.icon} />
            <Text style={[styles.sectionTitle, { color: theme.text, marginBottom: 0 }]}>Transactions</Text>
          </View>
          <TouchableOpacity onPress={fetchWallet}>
            <Text style={{ color: '#8B5CF6', fontWeight: '800' }}>See All</Text>
          </TouchableOpacity>
        </View>

        <FlatList
          data={data?.transactions || []}
          keyExtractor={(item) => item._id}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => (
            <View style={[styles.txItem, { borderBottomColor: theme.border }]}>
               <View style={[styles.txIcon, { backgroundColor: item.type === 'credit' ? '#10B98110' : '#8B5CF610' }]}>
                 {item.type === 'credit' ? 
                   <ArrowDownLeft size={20} color="#10B981" /> : 
                   <ArrowUpRight size={20} color="#8B5CF6" />
                 }
               </View>
               <View style={styles.txInfo}>
                 <Text style={[styles.txTitle, { color: theme.text }]}>{item.description || (item.type === 'credit' ? 'Wallet Top-up' : 'Water Order')}</Text>
                 <Text style={[styles.txDate, { color: theme.icon }]}>{formatDate(item.createdAt)}</Text>
               </View>
               <Text style={[styles.txAmount, { color: item.type === 'credit' ? '#10B981' : theme.text }]}>
                 {item.type === 'credit' ? '+' : '-'}₹{item.amount}
               </Text>
            </View>
          )}
          ListEmptyComponent={() => (
            <View style={styles.emptyWrap}>
               <Text style={{ color: theme.icon }}>No transactions yet</Text>
            </View>
          )}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    paddingTop: 60,
  },
  card: {
    padding: 25,
    borderRadius: 35,
    marginBottom: 35,
    elevation: 15,
    shadowColor: '#8B5CF6',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
  },
  cardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  cardLabel: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 14,
    fontWeight: '800',
    letterSpacing: 1,
  },
  balance: {
    color: 'white',
    fontSize: 42,
    fontWeight: '900',
    marginBottom: 30,
    letterSpacing: -1,
  },
  cardActions: {
    flexDirection: 'row',
    gap: 12,
  },
  cardButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: 'white',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.05)',
  },
  cardButtonText: {
    fontSize: 14,
    fontWeight: '900',
  },
  section: {
    marginBottom: 35,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  txHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '900',
    letterSpacing: -0.5,
  },
  quickAddRow: {
    flexDirection: 'row',
    gap: 12,
  },
  amountChip: {
    flex: 1,
    paddingVertical: 14,
    alignItems: 'center',
    borderRadius: 16,
    borderWidth: 1.5,
  },
  amountChipText: {
    fontSize: 14,
    fontWeight: '800',
  },
  txItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 18,
    borderBottomWidth: 1,
  },
  txIcon: {
    width: 48,
    height: 48,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  txInfo: {
    flex: 1,
  },
  txTitle: {
    fontSize: 15,
    fontWeight: '800',
  },
  txDate: {
    fontSize: 12,
    fontWeight: '600',
    marginTop: 2,
  },
  txAmount: {
    fontSize: 17,
    fontWeight: '900',
  },
  topUpInputWrap: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20,
  },
  amountInput: {
    flex: 1,
    height: 56,
    borderRadius: 18,
    borderWidth: 2,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  currency: {
    fontSize: 20,
    fontWeight: '800',
    marginRight: 8,
  },
  input: {
    flex: 1,
    fontSize: 17,
    fontWeight: '700',
  },
  addBtn: {
    width: 56,
    height: 56,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 8,
    shadowColor: '#8B5CF6',
    shadowOpacity: 0.3,
  },
  emptyWrap: {
    alignItems: 'center',
    paddingTop: 40,
  }
});
