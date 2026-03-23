import React from 'react';
import { Tabs } from 'expo-router';
import { Home, ShoppingBag, Users, BarChart3, LayoutDashboard, UserPlus, Activity, User, Truck, Settings } from 'lucide-react-native';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { BlurView } from 'expo-blur';
import { StyleSheet, Platform, View } from 'react-native';

export default function VendorLayout() {
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme ?? 'light'];

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: '#0EA5E9',
        tabBarInactiveTintColor: theme.tabIconDefault,
        tabBarShowLabel: false,
        headerShown: false,
        tabBarStyle: {
          height: Platform.OS === 'ios' ? 88 : 68,
          backgroundColor: theme.card,
          borderTopWidth: 1,
          borderTopColor: theme.border,
          elevation: 10,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: -4 },
          shadowOpacity: 0.05,
          shadowRadius: 10,
        },
      }}
    >
      <Tabs.Screen
        name="dashboard"
        options={{
          tabBarIcon: ({ color, focused }) => (
            <View style={[styles.iconWrap, focused && styles.activeIconWrap]}>
              <LayoutDashboard size={24} color={color} />
              {focused && <View style={styles.dot} />}
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="orders"
        options={{
          tabBarIcon: ({ color, focused }) => (
            <View style={[styles.iconWrap, focused && styles.activeIconWrap]}>
              <ShoppingBag size={24} color={color} />
              {focused && <View style={styles.dot} />}
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="requests"
        options={{
          tabBarIcon: ({ color, focused }) => (
            <View style={[styles.iconWrap, focused && styles.activeIconWrap]}>
              <UserPlus size={24} color={color} />
              {focused && <View style={styles.dot} />}
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="pulse"
        options={{
          tabBarIcon: ({ color, focused }) => (
            <View style={[styles.iconWrap, focused && styles.activeIconWrap]}>
              <Activity size={24} color={color} />
              {focused && <View style={styles.dot} />}
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          tabBarIcon: ({ color, focused }) => (
            <View style={[styles.iconWrap, focused && styles.activeIconWrap]}>
              <User size={24} color={color} />
              {focused && <View style={styles.dot} />}
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="ledger"
        options={{
          href: null,
        }}
      />
      <Tabs.Screen
        name="staff"
        options={{
          href: null,
        }}
      />
      <Tabs.Screen
        name="vehicles"
        options={{
          tabBarIcon: ({ color, focused }) => (
            <View style={[styles.iconWrap, focused && styles.activeIconWrap]}>
              <Truck size={24} color={color} />
              {focused && <View style={styles.dot} />}
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="profile-settings"
        options={{
          tabBarIcon: ({ color, focused }) => (
            <View style={[styles.iconWrap, focused && styles.activeIconWrap]}>
              <Settings size={22} color={color} />
              {focused && <View style={styles.dot} />}
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="order-details"
        options={{
          href: null,
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  iconWrap: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 38,
    height: 44,
  },
  activeIconWrap: {
    // marginBottom: 5,
  },
  dot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#0EA5E9',
    marginTop: 4,
  },
});
