import React, { useState } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, Image, Dimensions, ScrollView } from 'react-native';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { 
  CheckCircle2, 
  Star, 
  ShoppingBag, 
  ArrowRight, 
  Send,
  MessageSquare,
  Droplet,
  ShieldCheck,
  Zap
} from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { BlurView } from 'expo-blur';

const JalsaathiLogo = require('@/assets/images/jalsaathi_main.png');
const { width, height } = Dimensions.get('window');

export default function OrderDelivered() {
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme ?? 'light'];
  const router = useRouter();
  const { id } = useLocalSearchParams();

  const [rating, setRating] = useState(5);
  const [submitted, setSubmitted] = useState(false);

  if (submitted) {
    return (
      <View style={[styles.container, { backgroundColor: theme.background, justifyContent: 'center' }]}>
        <LinearGradient colors={['#6366F110', 'transparent']} style={StyleSheet.absoluteFill} />
        <View style={styles.successHeader}>
          <View style={[styles.iconCircle, { backgroundColor: '#10B98115' }]}>
            <CheckCircle2 size={64} color="#10B981" />
          </View>
          <Text style={[styles.title, { color: theme.text }]}>Feedback Sent!</Text>
          <Text style={[styles.subtitle, { color: theme.icon }]}>
            Thank you for helping us improve. Have a great day!
          </Text>
        </View>
        <TouchableOpacity 
          style={styles.primaryBtn}
          onPress={() => router.replace('/(consumer)/home')}
        >
          <LinearGradient colors={['#6366F1', '#8B5CF6']} style={styles.btnGrad}>
            <Text style={styles.btnText}>Back to Home</Text>
            <ArrowRight size={20} color="white" />
          </LinearGradient>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.background }]} showsVerticalScrollIndicator={false}>
      {/* ─── PREMIUM BRANDING HERO ─── */}
      <View style={styles.heroSection}>
        <Image source={JalsaathiLogo} style={styles.heroImage} resizeMode="cover" />
        <LinearGradient 
          colors={['rgba(0,0,0,0.1)', 'rgba(0,0,0,0.6)']} 
          style={StyleSheet.absoluteFill} 
        />
        <View style={styles.badgeRow}>
           <BlurView intensity={40} tint="dark" style={styles.premiumBadge}>
              <ShieldCheck size={14} color="#10B981" />
              <Text style={styles.badgeText}>DELIVERY CONFIRMED</Text>
           </BlurView>
        </View>

        {/* Floating Success Pill */}
        <View style={styles.successPill}>
           <BlurView intensity={90} tint="light" style={styles.pillGlass}>
              <CheckCircle2 size={24} color="#10B981" />
              <Text style={styles.pillText}>Stay Hydrated!</Text>
           </BlurView>
        </View>
      </View>

      <View style={styles.content}>
        <Text style={[styles.title, { color: theme.text, marginTop: 40 }]}>Order Delivered!</Text>
        <Text style={[styles.subtitle, { color: theme.icon }]}>
          Your 20L fresh water jars have been successfully delivered to your doorstep.
        </Text>

        {/* ─── INTERACTIVE REVIEW SECTION ─── */}
        <View style={[styles.ratingCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
          <View style={styles.cardHeader}>
             <MessageSquare size={20} color={theme.primary} />
             <Text style={[styles.cardTitle, { color: theme.text }]}>Rate your Experience</Text>
          </View>
          
          <View style={styles.starsContainer}>
            {[1, 2, 3, 4, 5].map((s) => (
              <TouchableOpacity 
                key={s} 
                onPress={() => setRating(s)}
                activeOpacity={0.7}
                style={styles.starBtn}
              >
                <Star 
                  size={42} 
                  color={s <= rating ? '#F59E0B' : theme.border} 
                  fill={s <= rating ? '#F59E0B' : 'transparent'} 
                />
              </TouchableOpacity>
            ))}
          </View>
          
          <Text style={[styles.ratingLabel, { color: rating >= 4 ? '#10B981' : theme.primary }]}>
            {rating === 5 ? 'Exceptional Service!' : rating >= 4 ? 'Great Service' : 'Good Experience'}
          </Text>

          <TouchableOpacity 
            style={styles.submitBtn}
            onPress={() => setSubmitted(true)}
          >
            <LinearGradient colors={['#6366F1', '#8B5CF6']} style={styles.submitGrad}>
              <Text style={styles.submitText}>SUBMIT REVIEW</Text>
              <Send size={18} color="white" />
            </LinearGradient>
          </TouchableOpacity>
        </View>

        {/* ─── QUICK ACTIONS ─── */}
        <View style={styles.actionGrid}>
          {id ? (
            <TouchableOpacity 
              style={[styles.actionBtn, { backgroundColor: theme.background, borderColor: theme.border }]}
              onPress={() => router.push({ pathname: '/(consumer)/order-details', params: { id } })}
            >
              <ShoppingBag size={20} color={theme.primary} />
              <Text style={[styles.actionTxt, { color: theme.text }]}>View Order</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity style={[styles.actionBtn, { backgroundColor: theme.background, borderColor: theme.border, flex: 0, paddingHorizontal: 20 }]}>
              <Droplet size={20} color={theme.primary} />
              <Text style={[styles.actionTxt, { color: theme.text }]}>JalSaathi</Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity 
            style={[styles.actionBtn, { backgroundColor: theme.background, borderColor: theme.border, flex: 1.5 }]}
            onPress={() => router.replace('/(consumer)/home')}
          >
            <Zap size={20} color={theme.primary} />
            <Text style={[styles.actionTxt, { color: theme.text }]}>Order Again</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.footer}>
           <Droplet size={20} color={theme.icon} style={{ opacity: 0.3 }} />
           <Text style={[styles.thankyou, { color: theme.icon }]}>Powered by JalSaathi ISI Certified Water</Text>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  heroSection: {
    height: height * 0.32,
    width: '100%',
    overflow: 'hidden',
  },
  heroImage: {
    width: '100%',
    height: '100%',
  },
  badgeRow: {
    position: 'absolute',
    top: 60,
    left: 20,
    right: 20,
    flexDirection: 'row',
  },
  premiumBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  badgeText: {
    color: 'white',
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 1,
  },
  successPill: {
    position: 'absolute',
    bottom: 25,
    alignSelf: 'center',
    borderRadius: 40, 
    overflow: 'hidden',
    elevation: 10,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 15,
  },
  pillGlass: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 25,
    paddingVertical: 14,
    borderRadius: 40,
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.85)',
    backgroundColor: 'rgba(255,255,255,0.5)',
    overflow: 'hidden',
  },
  pillText: {
    fontSize: 15,
    fontWeight: '800',
    color: '#0F172A',
  },
  content: {
    flex: 1,
    paddingHorizontal: 25,
    paddingBottom: 40,
  },
  successHeader: {
    alignItems: 'center',
    paddingHorizontal: 30,
  },
  iconCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 30,
    elevation: 8,
    shadowColor: '#10B981',
    shadowOpacity: 0.2,
    shadowRadius: 15,
  },
  title: {
    fontSize: 30,
    fontWeight: '900',
    marginBottom: 12,
    textAlign: 'center',
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 15,
    textAlign: 'center',
    lineHeight: 22,
    fontWeight: '500',
  },
  ratingCard: {
    marginTop: 30,
    padding: 24,
    borderRadius: 30,
    borderWidth: 1.5,
    elevation: 4,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 10,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 20,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '800',
  },
  starsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 12,
    marginBottom: 15,
  },
  starBtn: {
    padding: 5,
  },
  ratingLabel: {
    textAlign: 'center',
    fontSize: 16,
    fontWeight: '900',
    marginBottom: 25,
  },
  submitBtn: {
    borderRadius: 20,
    overflow: 'hidden',
    height: 56,
  },
  submitGrad: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  submitText: {
    color: 'white',
    fontSize: 15,
    fontWeight: '900',
    letterSpacing: 1,
  },
  actionGrid: {
    flexDirection: 'row',
    gap: 15,
    marginTop: 25,
  },
  actionBtn: {
    flex: 1,
    height: 60,
    borderRadius: 18,
    borderWidth: 1.5,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  actionTxt: {
    fontSize: 14,
    fontWeight: '700',
  },
  primaryBtn: {
    marginHorizontal: 40,
    borderRadius: 24,
    overflow: 'hidden',
    marginTop: 40,
  },
  btnGrad: {
    height: 64,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  btnText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '900',
  },
  footer: {
    marginTop: 40,
    alignItems: 'center',
    gap: 10,
  },
  thankyou: {
    fontSize: 12,
    fontWeight: '700',
    opacity: 0.4,
  }
});
