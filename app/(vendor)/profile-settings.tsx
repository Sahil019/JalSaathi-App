import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, ScrollView, TouchableOpacity, TextInput, ActivityIndicator, Alert, Platform, KeyboardAvoidingView } from 'react-native';
import { useRouter } from 'expo-router';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useAuth } from '@/context/AuthContext';
import { 
  ArrowLeft, 
  Save, 
  Droplet, 
  Truck, 
  MapPin, 
  Info,
  DollarSign,
  TrendingUp,
  Store
} from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { vendorService } from '@/services/vendorService';

export default function VendorProfileSettings() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme ?? 'light'];
  const isDark = colorScheme === 'dark';
  const { user, refreshUser } = useAuth();

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  
  const [formData, setFormData] = useState({
    businessName: user?.businessName || '',
    pricePerCan: String(user?.pricePerCan || 30),
    deliveryBaseFee: String(user?.deliveryBaseFee || 10),
    deliveryPerKmFee: String(user?.deliveryPerKmFee || 5),
    description: user?.description || '',
    serviceRadius: String(user?.serviceRadius || 5),
    area: user?.area || '',
  });

  const handleSave = async () => {
    try {
      setSaving(true);
      const data = {
        businessName: formData.businessName,
        pricePerCan: parseFloat(formData.pricePerCan),
        deliveryBaseFee: parseFloat(formData.deliveryBaseFee),
        deliveryPerKmFee: parseFloat(formData.deliveryPerKmFee),
        description: formData.description,
        serviceRadius: parseFloat(formData.serviceRadius),
        area: formData.area
      };

      if (isNaN(data.pricePerCan) || isNaN(data.deliveryBaseFee) || isNaN(data.deliveryPerKmFee)) {
         Alert.alert('Invalid Values', 'Please enter valid numbers for pricing and fees.');
         return;
      }

      await vendorService.updateSettings(data);
      await refreshUser();
      Alert.alert('Success', 'Profile and pricing updated successfully!');
      router.back();
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Failed to update settings');
    } finally {
      setSaving(false);
    }
  };

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : undefined} 
      style={[styles.container, { backgroundColor: theme.background }]}
    >
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={[styles.backBtn, { borderColor: theme.border, backgroundColor: theme.card }]}>
          <ArrowLeft size={22} color={theme.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: theme.text }]}>Service Settings</Text>
        <TouchableOpacity 
          style={styles.saveHeaderBtn} 
          onPress={handleSave}
          disabled={saving}
        >
          {saving ? <ActivityIndicator size="small" color={theme.primary} /> : <Save size={24} color={theme.primary} />}
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        
        {/* Dynamic Pricing Section */}
        <Text style={styles.sectionLabel}>DYNAMIC PRICING</Text>
        <BlurView intensity={isDark ? 30 : 50} tint={isDark ? "dark" : "light"} style={[styles.card, { borderColor: theme.border }]}>
           <View style={styles.inputGroup}>
              <View style={styles.labelRow}>
                 <Droplet size={18} color={theme.primary} />
                 <Text style={[styles.inputLabel, { color: theme.text }]}>Price Per 20L Can</Text>
              </View>
              <View style={[styles.inputWrapper, { backgroundColor: theme.background, borderColor: theme.border }]}>
                 <Text style={[styles.inputPrefix, { color: theme.icon }]}>₹</Text>
                 <TextInput 
                    style={[styles.textInput, { color: theme.text }]}
                    keyboardType="numeric"
                    value={formData.pricePerCan}
                    onChangeText={(val) => setFormData({...formData, pricePerCan: val})}
                    placeholder="30"
                    placeholderTextColor={theme.icon}
                 />
              </View>
              <Text style={[styles.helperText, { color: theme.icon }]}>Standard price seen by customers when ordering.</Text>
           </View>
        </BlurView>

        {/* Delivery Logistics Section */}
        <Text style={styles.sectionLabel}>DELIVERY LOGISTICS</Text>
        <BlurView intensity={isDark ? 30 : 50} tint={isDark ? "dark" : "light"} style={[styles.card, { borderColor: theme.border }]}>
           <View style={styles.inputGroup}>
              <View style={styles.labelRow}>
                 <Truck size={18} color="#10B981" />
                 <Text style={[styles.inputLabel, { color: theme.text }]}>Base Delivery Fee</Text>
              </View>
              <View style={[styles.inputWrapper, { backgroundColor: theme.background, borderColor: theme.border }]}>
                 <Text style={[styles.inputPrefix, { color: theme.icon }]}>₹</Text>
                 <TextInput 
                    style={[styles.textInput, { color: theme.text }]}
                    keyboardType="numeric"
                    value={formData.deliveryBaseFee}
                    onChangeText={(val) => setFormData({...formData, deliveryBaseFee: val})}
                 />
              </View>
           </View>

           <View style={styles.inputGroup}>
              <View style={styles.labelRow}>
                 <TrendingUp size={18} color="#3B82F6" />
                 <Text style={[styles.inputLabel, { color: theme.text }]}>Per KM Charge</Text>
              </View>
              <View style={[styles.inputWrapper, { backgroundColor: theme.background, borderColor: theme.border }]}>
                 <Text style={[styles.inputPrefix, { color: theme.icon }]}>₹</Text>
                 <TextInput 
                    style={[styles.textInput, { color: theme.text }]}
                    keyboardType="numeric"
                    value={formData.deliveryPerKmFee}
                    onChangeText={(val) => setFormData({...formData, deliveryPerKmFee: val})}
                 />
              </View>
              <Text style={[styles.helperText, { color: theme.icon }]}>Applied to distances beyond your free delivery limit.</Text>
           </View>

           <View style={styles.inputGroup}>
              <View style={styles.labelRow}>
                 <MapPin size={18} color="#EF4444" />
                 <Text style={[styles.inputLabel, { color: theme.text }]}>Service Radius (KM)</Text>
              </View>
              <View style={[styles.inputWrapper, { backgroundColor: theme.background, borderColor: theme.border }]}>
                 <TextInput 
                    style={[styles.textInput, { color: theme.text }]}
                    keyboardType="numeric"
                    value={formData.serviceRadius}
                    onChangeText={(val) => setFormData({...formData, serviceRadius: val})}
                 />
              </View>
           </View>
        </BlurView>

        {/* Brand Info Section */}
        <Text style={styles.sectionLabel}>BRAND & AREA</Text>
        <BlurView intensity={isDark ? 30 : 50} tint={isDark ? "dark" : "light"} style={[styles.card, { borderColor: theme.border }]}>
           <View style={styles.inputGroup}>
              <View style={styles.labelRow}>
                 <Store size={18} color="#8B5CF6" />
                 <Text style={[styles.inputLabel, { color: theme.text }]}>Business Name</Text>
              </View>
              <TextInput 
                 style={[styles.flatInput, { color: theme.text, backgroundColor: theme.background, borderColor: theme.border }]}
                 value={formData.businessName}
                 onChangeText={(val) => setFormData({...formData, businessName: val})}
              />
           </View>

           <View style={styles.inputGroup}>
              <View style={styles.labelRow}>
                 <Info size={18} color={theme.icon} />
                 <Text style={[styles.inputLabel, { color: theme.text }]}>Business Description</Text>
              </View>
              <TextInput 
                 style={[styles.flatInput, { color: theme.text, backgroundColor: theme.background, borderColor: theme.border, minHeight: 80 }]}
                 multiline
                 value={formData.description}
                 onChangeText={(val) => setFormData({...formData, description: val})}
                 placeholder="About your water quality..."
              />
           </View>
        </BlurView>

        <TouchableOpacity 
          style={styles.mainSaveBtn}
          onPress={handleSave}
          disabled={saving}
        >
          <LinearGradient colors={['#6366F1', '#8B5CF6']} style={styles.mainSaveBtnGrad}>
             {saving ? <ActivityIndicator color="white" /> : (
               <>
                 <Save size={20} color="white" />
                 <Text style={styles.mainSaveBtnText}>SAVE SETTINGS</Text>
               </>
             )}
          </LinearGradient>
        </TouchableOpacity>

        <View style={{ height: 100 }} />
      </ScrollView>
    </KeyboardAvoidingView>
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
    paddingBottom: 16,
  },
  headerTitle: { fontSize: 22, fontWeight: '900', letterSpacing: -0.5 },
  backBtn: {
    width: 44,
    height: 44,
    borderRadius: 12,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  saveHeaderBtn: { width: 44, height: 44, justifyContent: 'center', alignItems: 'center' },
  scrollContent: { paddingHorizontal: 20, paddingTop: 10 },
  sectionLabel: { fontSize: 12, fontWeight: '800', color: '#64748B', marginBottom: 15, marginTop: 10, letterSpacing: 1.5 },
  card: {
    borderRadius: 24,
    padding: 20,
    marginBottom: 24,
    borderWidth: 1.5,
    overflow: 'hidden'
  },
  inputGroup: { marginBottom: 20 },
  labelRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 12 },
  inputLabel: { fontSize: 15, fontWeight: '800' },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 56,
    borderRadius: 16,
    borderWidth: 1,
    paddingHorizontal: 16,
  },
  inputPrefix: { fontSize: 18, fontWeight: '700', marginRight: 8 },
  textInput: { flex: 1, fontSize: 18, fontWeight: '800', padding: 0 },
  flatInput: {
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    fontSize: 16,
    fontWeight: '600',
    textAlignVertical: 'top'
  },
  helperText: { fontSize: 11, fontWeight: '600', marginTop: 8, opacity: 0.7, paddingHorizontal: 4 },
  mainSaveBtn: { borderRadius: 20, overflow: 'hidden', marginTop: 10 },
  mainSaveBtnGrad: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 20,
    gap: 12,
  },
  mainSaveBtnText: { color: 'white', fontSize: 18, fontWeight: '900', letterSpacing: 1 },
});
