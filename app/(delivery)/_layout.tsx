import React from 'react';
import { Tabs } from 'expo-router';
import { Home, ClipboardList, Truck, User, DollarSign } from 'lucide-react-native';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { BlurView } from 'expo-blur';
import { StyleSheet, Platform, View } from 'react-native';

export default function DeliveryLayout() {
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme ?? 'light'];

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: '#0EA5E9',
        tabBarInactiveTintColor: theme.tabIconDefault,
        tabBarShowLabel: false,
        headerShown: false,
        tabBarStyle: styles.tabBar,
        tabBarBackground: () => (
          <BlurView 
            intensity={Platform.OS === 'ios' ? 30 : 100} 
            tint={colorScheme === 'dark' ? 'dark' : 'light'} 
            style={StyleSheet.absoluteFill} 
          />
        ),
      }}
    >
      <Tabs.Screen
        name="home"
        options={{
          tabBarIcon: ({ color, focused }) => (
            <View style={[styles.iconWrap, focused && styles.activeIconWrap]}>
              <Home size={24} color={color} />
              {focused && <View style={styles.dot} />}
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="history"
        options={{
          tabBarIcon: ({ color, focused }) => (
            <View style={[styles.iconWrap, focused && styles.activeIconWrap]}>
              <ClipboardList size={24} color={color} />
              {focused && <View style={styles.dot} />}
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="vehicle"
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
        name="earnings"
        options={{
          tabBarIcon: ({ color, focused }) => (
            <View style={[styles.iconWrap, focused && styles.activeIconWrap]}>
              <DollarSign size={24} color={color} />
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
      <Tabs.Screen name="order-details" options={{ href: null }} />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    position: 'absolute',
    bottom: 20,
    marginHorizontal: 10,
    height: 62,
    borderRadius: 31,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    backgroundColor: 'transparent',
    elevation: 0,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    overflow: 'hidden',
  },
  iconWrap: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 36,
    height: 44,
  },
  activeIconWrap: {},
  dot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#0EA5E9',
    marginTop: 3,
  },
});
