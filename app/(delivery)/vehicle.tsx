import React, { useState, useCallback } from 'react';
import { StyleSheet, View, Text, ScrollView, TouchableOpacity, ActivityIndicator, RefreshControl, Alert } from 'react-native';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import {
  Truck,
  Shield,
  Calendar,
  Settings,
  ChevronRight,
  Camera,
  CheckCircle,
  AlertTriangle,
  Clock,
  Hash,
} from 'lucide-react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { deliveryService } from '@/services/deliveryService';

export default function DeliveryVehicle() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme ?? 'light'];
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchProfile = useCallback(async () => {
    try {
      const data = await deliveryService.getProfile();
      setProfile(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useFocusEffect(useCallback(() => { fetchProfile(); }, [fetchProfile]));

  const onRefresh = () => { setRefreshing(true); fetchProfile(); };

  // Derive vehicle info from profile or use placeholders
  const vehicleType = profile?.vehicleType || 'Not Assigned';
  const vehicleNumber = profile?.vehicleNumber || 'Not Registered';
  const vehicleModel = profile?.vehicleModel || 'Unknown Model';
  const documentsStatus = profile?.documentsStatus || 'Pending';
  const isVerified = documentsStatus === 'Verified';

  const docs = [
    { title: 'Registration Certificate (RC)', status: profile?.rcStatus || documentsStatus },
    { title: 'Driving License', status: profile?.licenseStatus || documentsStatus },
    { title: 'Insurance Policy', status: profile?.insuranceStatus || 'Check Manually', warning: true },
    { title: 'Pollution Check (PUC)', status: profile?.pucStatus || documentsStatus },
  ];

  if (loading) {
    return (
      <View style={[styles.container, { backgroundColor: theme.background, justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color={theme.primary} />
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={[styles.backBtn, { borderColor: theme.border }]}>
          {/* @ts-ignore */}
          <ChevronRight size={24} color={theme.text} style={{ transform: [{ rotate: '180deg' }] }} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: theme.text }]}>Vehicle Details</Text>
        <TouchableOpacity
          style={[styles.editBtn, { borderColor: theme.border }]}
          onPress={() => Alert.alert('Update Vehicle', 'Contact your vendor admin to update vehicle information.')}
        >
          <Settings size={20} color={theme.icon} />
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={theme.primary} />}
      >
        {/* Vehicle Card */}
        <LinearGradient
          colors={isVerified ? ['#0EA5E9', '#2563EB'] : ['#475569', '#334155']}
          style={styles.vehicleCard}
        >
          <View style={styles.vehicleIconWrap}>
            <Truck size={44} color="white" />
          </View>
          <Text style={styles.vehicleModelText}>{vehicleModel}</Text>

          <View style={styles.plateContainer}>
            <Text style={styles.plateText}>{vehicleNumber}</Text>
          </View>

          <View style={styles.vehicleTypeBadge}>
            <Text style={styles.vehicleTypeText}>🏍️ {vehicleType}</Text>
          </View>

          <View style={styles.verifyRow}>
            {isVerified ? (
              <>
                <CheckCircle size={16} color="#34D399" />
                <Text style={styles.verifyText}>All Documents Verified</Text>
              </>
            ) : (
              <>
                <AlertTriangle size={16} color="#FBBF24" />
                <Text style={[styles.verifyText, { color: '#FBBF24' }]}>Documents Pending Review</Text>
              </>
            )}
          </View>
        </LinearGradient>

        {/* Quick Stats */}
        <View style={styles.quickStatsRow}>
          {[
            { label: 'Total Runs', value: profile?.insights?.totalDeliveries || 0, color: '#0EA5E9' },
            { label: 'Rating', value: `${(profile?.insights?.performanceScore || 5.0).toFixed(1)}⭐`, color: '#F59E0B' },
            { label: 'Status', value: profile?.status || 'OFFLINE', color: profile?.status === 'AVAILABLE' ? '#10B981' : '#94A3B8' },
          ].map((s, i) => (
            <View key={i} style={[styles.quickStatCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
              <Text style={[styles.quickStatVal, { color: s.color }]}>{s.value}</Text>
              <Text style={[styles.quickStatLab, { color: theme.icon }]}>{s.label}</Text>
            </View>
          ))}
        </View>

        {/* Documents Section */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>Compliance & Documents</Text>
          <View style={styles.docList}>
            {docs.map((doc, idx) => {
              const isDocVerified = doc.status === 'Verified';
              const statusColor = isDocVerified ? '#10B981' : doc.warning ? '#F59E0B' : '#EF4444';
              return (
                <TouchableOpacity
                  key={idx}
                  style={[styles.docItem, { backgroundColor: theme.card, borderColor: theme.border }]}
                >
                  <View style={styles.docLeft}>
                    <View style={[styles.docIcon, { backgroundColor: statusColor + '15' }]}>
                      <Calendar size={20} color={statusColor} />
                    </View>
                    <View>
                      <Text style={[styles.docTitle, { color: theme.text }]}>{doc.title}</Text>
                      <Text style={[styles.docStatus, { color: statusColor }]}>{doc.status}</Text>
                    </View>
                  </View>
                  <View style={[styles.docStatusIcon, { backgroundColor: statusColor + '15' }]}>
                    {isDocVerified ? (
                      <CheckCircle size={16} color={statusColor} />
                    ) : (
                      <Clock size={16} color={statusColor} />
                    )}
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Vehicle ID Info */}
        {profile?._id && (
          <View style={[styles.infoCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
            <View style={styles.infoRow}>
              <Hash size={14} color={theme.icon} />
              <Text style={[styles.infoLabel, { color: theme.icon }]}>Partner ID</Text>
              <Text style={[styles.infoValue, { color: theme.text }]}>{profile._id.slice(-8).toUpperCase()}</Text>
            </View>
          </View>
        )}

        {/* Update Button */}
        <TouchableOpacity
          style={styles.updateBtn}
          onPress={() => {
            Alert.prompt(
              'Update Vehicle Number',
              'Enter your vehicle registration number:',
              [
                { text: 'Cancel', style: 'cancel' },
                { 
                  text: 'Save', 
                  onPress: async (val?: string) => {
                    if (!val) return;
                    try {
                      setLoading(true);
                      await deliveryService.updateVehicleInfo({ vehicleNumber: val });
                      Alert.alert('Submitted', 'Vehicle info updated. Admin will review the changes.');
                      fetchProfile();
                    } catch (err: any) {
                      Alert.alert('Error', err.message);
                    } finally {
                      setLoading(false);
                    }
                  }
                }
              ],
              'plain-text',
              vehicleNumber === 'Not Registered' ? '' : vehicleNumber
            );
          }}
        >
          <LinearGradient colors={['#0EA5E9', '#2563EB']} style={styles.btnGradient}>
            <Truck size={20} color="white" />
            <Text style={styles.updateText}>Update Vehicle Number</Text>
          </LinearGradient>
        </TouchableOpacity>

        <View style={{ height: 60 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 55,
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '800',
  },
  backBtn: {
    width: 44,
    height: 44,
    borderRadius: 14,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  editBtn: {
    width: 44,
    height: 44,
    borderRadius: 14,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 8,
  },
  vehicleCard: {
    borderRadius: 32,
    padding: 28,
    alignItems: 'center',
    marginBottom: 20,
  },
  vehicleIconWrap: {
    width: 90,
    height: 90,
    borderRadius: 28,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  vehicleModelText: {
    color: 'white',
    fontSize: 22,
    fontWeight: '900',
    marginBottom: 12,
    textAlign: 'center',
  },
  plateContainer: {
    backgroundColor: '#FEF9C3',
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#F59E0B',
    marginBottom: 14,
  },
  plateText: {
    fontSize: 18,
    fontWeight: '900',
    color: '#92400E',
    letterSpacing: 2,
  },
  vehicleTypeBadge: {
    backgroundColor: 'rgba(255,255,255,0.15)',
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 12,
    marginBottom: 14,
  },
  vehicleTypeText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '700',
  },
  verifyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: 'rgba(0,0,0,0.15)',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 12,
  },
  verifyText: {
    color: '#34D399',
    fontSize: 13,
    fontWeight: '700',
  },
  quickStatsRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
  },
  quickStatCard: {
    flex: 1,
    padding: 14,
    borderRadius: 20,
    borderWidth: 1,
    alignItems: 'center',
    gap: 4,
  },
  quickStatVal: {
    fontSize: 16,
    fontWeight: '900',
  },
  quickStatLab: {
    fontSize: 11,
    fontWeight: '600',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '800',
    marginBottom: 14,
  },
  docList: {
    gap: 12,
  },
  docItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderRadius: 20,
    borderWidth: 1,
  },
  docLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    flex: 1,
  },
  docIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  docTitle: {
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 3,
  },
  docStatus: {
    fontSize: 12,
    fontWeight: '600',
  },
  docStatusIcon: {
    width: 32,
    height: 32,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  infoCard: {
    borderRadius: 16,
    padding: 14,
    marginBottom: 20,
    borderWidth: 1,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  infoLabel: {
    fontSize: 13,
    fontWeight: '600',
    flex: 1,
  },
  infoValue: {
    fontSize: 13,
    fontWeight: '800',
    fontFamily: 'monospace',
  },
  updateBtn: {
    borderRadius: 20,
    overflow: 'hidden',
  },
  btnGradient: {
    height: 60,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
  },
  updateText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '800',
  },
});
