import React from 'react';
import { Tabs } from 'expo-router';
import { LayoutDashboard, Users, Store, ShoppingBag, User } from 'lucide-react-native';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { BlurView } from 'expo-blur';
import { StyleSheet, Platform, View } from 'react-native';

export default function AdminLayout() {
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme ?? 'light'];

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: '#8B5CF6',
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
        name="home"
        options={{
          tabBarIcon: ({ color, focused }) => (
            <View style={[styles.iconWrap, focused && styles.activeIconWrap]}>
              <LayoutDashboard size={22} color={color} />
              {focused && <View style={styles.dot} />}
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="vendors"
        options={{
          tabBarIcon: ({ color, focused }) => (
            <View style={[styles.iconWrap, focused && styles.activeIconWrap]}>
              <Store size={22} color={color} />
              {focused && <View style={styles.dot} />}
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="users"
        options={{
          tabBarIcon: ({ color, focused }) => (
            <View style={[styles.iconWrap, focused && styles.activeIconWrap]}>
              <Users size={22} color={color} />
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
              <ShoppingBag size={22} color={color} />
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
              <User size={22} color={color} />
              {focused && <View style={styles.dot} />}
            </View>
          ),
        }}
      />
      <Tabs.Screen name="revenue" options={{ href: null, tabBarStyle: { display: 'none' } }} />
      <Tabs.Screen name="vehicles" options={{ href: null, tabBarStyle: { display: 'none' } }} />
      <Tabs.Screen name="order-details" options={{ href: null, tabBarStyle: { display: 'none' } }} />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  iconWrap: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
  },
  activeIconWrap: {},
  dot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#8B5CF6',
    marginTop: 4,
  },
});
