import React, { useEffect, useState } from 'react';
import { StyleSheet, View, Text, ScrollView, TouchableOpacity, ActivityIndicator, Dimensions } from 'react-native';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { 
  Activity, 
  Zap, 
  TrendingUp, 
  AlertTriangle, 
  Truck, 
  Clock, 
  Target,
  ChevronRight,
  BrainCircuit
} from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { vendorService } from '@/services/vendorService';

const { width } = Dimensions.get('window');

export default function VendorPulse() {
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme ?? 'light'];

  const [pulse, setPulse] = useState<any>(null);
  const [predictions, setPredictions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPulseData();
    const interval = setInterval(fetchPulseData, 15000); // 15s real-time feel
    return () => clearInterval(interval);
  }, []);

  const fetchPulseData = async () => {
    try {
      const [pData, predData] = await Promise.all([
        vendorService.getPulse(),
        vendorService.getPredictions()
      ]);
      setPulse(pData.pulse);
      setPredictions(predData.predictions || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading && !pulse) {
     return (
       <View style={[styles.container, { backgroundColor: '#0F172A', justifyContent: 'center' }]}>
         <ActivityIndicator size="large" color="#0EA5E9" />
         <Text style={{ color: '#0EA5E9', marginTop: 20, fontWeight: '700' }}>Syncing with Logistics Neural Net...</Text>
       </View>
     );
  }

  const getHealthColor = (health: string) => {
     switch (health) {
        case 'EXCELLENT': return '#10B981';
        case 'HEAVY': return '#F59E0B';
        case 'CRITICAL': return '#EF4444';
        default: return '#0EA5E9';
     }
  };

  return (
    <ScrollView style={[styles.container, { backgroundColor: '#0F172A' }]} contentContainerStyle={{ paddingBottom: 120 }}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>System Pulse</Text>
          <View style={styles.liveRow}>
             <View style={styles.liveDot} />
             <Text style={styles.liveLabel}>LIVE CONTROL CENTER</Text>
          </View>
        </View>
        <TouchableOpacity style={styles.botBtn}>
           <BrainCircuit size={24} color="#0EA5E9" />
        </TouchableOpacity>
      </View>

      {/* Hero Pulse Card */}
      <View style={styles.heroCard}>
         <LinearGradient
           colors={['#1E293B', '#0F172A']}
           style={styles.heroGradient}
         >
            <View style={styles.heroTop}>
               <View>
                  <Text style={styles.heroLabel}>Operational Health</Text>
                  <Text style={[styles.heroVal, { color: getHealthColor(pulse?.health) }]}>{pulse?.health || 'OPTIMAL'}</Text>
               </View>
               <View style={styles.loadIndicator}>
                  <Text style={styles.loadVal}>{pulse?.load}%</Text>
                  <Text style={styles.loadLab}>SYSTEM LOAD</Text>
               </View>
            </View>
            
            <View style={styles.waveContainer}>
               {/* Mock Pulse Wave */}
               {[1,2,3,4,5,6,7,8,9,10].map(i => (
                  <View key={i} style={[styles.waveBar, { height: 10 + Math.random() * 40, backgroundColor: getHealthColor(pulse?.health) + '40' }]} />
               ))}
            </View>

            <View style={styles.heroFooter}>
               <View style={styles.footerItem}>
                  <Clock size={16} color="#94A3B8" />
                  <Text style={styles.footerText}>{pulse?.peakTime}</Text>
               </View>
               <View style={styles.footerItem}>
                  <Target size={16} color="#94A3B8" />
                  <Text style={styles.footerText}>{pulse?.efficiency}</Text>
               </View>
            </View>
         </LinearGradient>
      </View>

      {/* Prediction Engine */}
      <View style={styles.section}>
         <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Precision Predictions</Text>
            <View style={styles.aiBadge}>
               <Text style={styles.aiText}>AI DRIVEN</Text>
            </View>
         </View>

         <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.predScroll}>
            {predictions.map((p, i) => (
               <BlurView key={i} intensity={20} tint="dark" style={styles.predCard}>
                  <View style={styles.probBadge}>
                     <Text style={styles.probText}>{Math.round(p.probability * 100)}% Match</Text>
                  </View>
                  <Text style={styles.predName}>{p.consumerName}</Text>
                  <Text style={styles.predArea}>{p.area} • {p.predictedQuantity} Jars</Text>
                  
                  <View style={styles.predFooter}>
                     <Text style={styles.predTime}>{p.expectedTime}</Text>
                     <TouchableOpacity style={styles.preAction}>
                        <Zap size={14} color="white" />
                     </TouchableOpacity>
                  </View>
                  
                  <Text style={styles.predReason}>{p.reason}</Text>
               </BlurView>
            ))}
         </ScrollView>
      </View>

      {/* Real-time Recommendations */}
      <View style={styles.section}>
         <Text style={styles.sectionTitle}>Optimization Suggestions</Text>
         <View style={styles.recCard}>
            <View style={[styles.recIcon, { backgroundColor: '#F59E0B20' }]}>
               <AlertTriangle size={24} color="#F59E0B" />
            </View>
            <View style={{ flex: 1 }}>
               <Text style={styles.recTitle}>Logistics Recommendation</Text>
               <Text style={styles.recDesc}>{pulse?.recommendation}</Text>
            </View>
            <ChevronRight size={20} color="#94A3B8" />
         </View>
      </View>

      {/* System Metrics */}
      <View style={styles.metricsGrid}>
         <View style={styles.metricItem}>
            <Truck size={20} color="#3B82F6" />
            <Text style={styles.metricVal}>{pulse?.cansInTransit}</Text>
            <Text style={styles.metricLab}>Jars in Transit</Text>
         </View>
         <View style={styles.metricItem}>
            <Activity size={20} color="#8B5CF6" />
            <Text style={styles.metricVal}>4.2ms</Text>
            <Text style={styles.metricLab}>Latency</Text>
         </View>
      </View>
    </ScrollView>
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    fontSize: 32,
    fontWeight: '900',
    color: 'white',
    letterSpacing: -1,
  },
  liveRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 4,
  },
  liveDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#EF4444',
    shadowColor: '#EF4444',
    shadowOpacity: 0.8,
    shadowRadius: 5,
  },
  liveLabel: {
    color: '#94A3B8',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 2,
  },
  botBtn: {
    width: 52,
    height: 52,
    borderRadius: 18,
    backgroundColor: '#1E293B',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(14, 165, 233, 0.3)',
  },
  heroCard: {
    marginHorizontal: 20,
    borderRadius: 32,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
    marginBottom: 32,
  },
  heroGradient: {
    padding: 24,
  },
  heroTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 20,
  },
  heroLabel: {
    color: '#94A3B8',
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4,
  },
  heroVal: {
    fontSize: 28,
    fontWeight: '900',
  },
  loadIndicator: {
    alignItems: 'flex-end',
  },
  loadVal: {
    color: 'white',
    fontSize: 24,
    fontWeight: '900',
  },
  loadLab: {
    color: '#94A3B8',
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 1,
  },
  waveContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: 60,
    marginBottom: 24,
  },
  waveBar: {
    width: 12,
    borderRadius: 6,
  },
  heroFooter: {
    flexDirection: 'row',
    gap: 20,
  },
  footerItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  footerText: {
    color: '#94A3B8',
    fontSize: 13,
    fontWeight: '600',
  },
  section: {
    marginBottom: 32,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: 'white',
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  aiBadge: {
    backgroundColor: '#8B5CF620',
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(139, 92, 246, 0.3)',
  },
  aiText: {
    color: '#C084FC',
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 1,
  },
  predScroll: {
    paddingLeft: 20,
  },
  predCard: {
    width: width * 0.65,
    marginRight: 16,
    padding: 20,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    overflow: 'hidden',
  },
  probBadge: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    alignSelf: 'flex-start',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 8,
    marginBottom: 12,
  },
  probText: {
    color: '#10B981',
    fontSize: 10,
    fontWeight: '800',
  },
  predName: {
    color: 'white',
    fontSize: 20,
    fontWeight: '800',
    marginBottom: 4,
  },
  predArea: {
    color: '#94A3B8',
    fontSize: 14,
    marginBottom: 16,
  },
  predFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  predTime: {
    color: '#38BDF8',
    fontSize: 15,
    fontWeight: '700',
  },
  preAction: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: '#0EA5E9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  predReason: {
    color: '#64748B',
    fontSize: 12,
    fontStyle: 'italic',
  },
  recCard: {
    marginHorizontal: 20,
    backgroundColor: '#1E293B',
    padding: 20,
    borderRadius: 24,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  recIcon: {
    width: 52,
    height: 52,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  recTitle: {
    color: 'white',
    fontSize: 16,
    fontWeight: '800',
    marginBottom: 4,
  },
  recDesc: {
    color: '#94A3B8',
    fontSize: 13,
    lineHeight: 18,
  },
  metricsGrid: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    gap: 16,
  },
  metricItem: {
    flex: 1,
    backgroundColor: '#1E293B',
    padding: 20,
    borderRadius: 24,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  metricVal: {
    color: 'white',
    fontSize: 20,
    fontWeight: '900',
    marginTop: 12,
  },
  metricLab: {
    color: '#94A3B8',
    fontSize: 11,
    fontWeight: '600',
    marginTop: 4,
  }
});
