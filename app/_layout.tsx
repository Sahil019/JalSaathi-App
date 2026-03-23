import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import 'react-native-reanimated';

import { useColorScheme } from '@/hooks/use-color-scheme';
import { AuthProvider, useAuth } from '@/context/AuthContext';
import { NotificationProvider } from '@/context/NotificationContext';

function RootLayoutNav() {
  const colorScheme = useColorScheme();
  const { user, isLoading } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (isLoading) return;

    const firstSegment = segments[0] as string | undefined;
    const isLoginPage = !firstSegment || firstSegment === 'index' || firstSegment === 'signup';

    if (!user) {
      if (!isLoginPage) {
        router.replace('/');
      }
    } else {
      // User is logged in
      const role = user.role;
      let targetFolder = '';
      let targetScreen = 'home';
      
      if (role === 'consumer') { targetFolder = '(consumer)'; targetScreen = 'home'; }
      else if (role === 'vendor') { targetFolder = '(vendor)'; targetScreen = 'dashboard'; }
      else if (role === 'admin') { targetFolder = '(vendor)'; targetScreen = 'dashboard'; } // vendor admin
      else if (role === 'delivery_boy') { targetFolder = '(delivery)'; targetScreen = 'home'; }
      else if (role === 'superadmin') { targetFolder = '(admin)'; targetScreen = 'home'; }

      if (isLoginPage && targetFolder) {
        // @ts-ignore - Dynamic routing paths
        router.replace(`/${targetFolder}/${targetScreen}`);
      }
    }
  }, [user, isLoading, segments, router]);

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <Stack>
        <Stack.Screen name="index" options={{ headerShown: false }} />
        <Stack.Screen name="signup" options={{ headerShown: false }} />
        <Stack.Screen name="(consumer)" options={{ headerShown: false }} />
        <Stack.Screen name="(vendor)" options={{ headerShown: false }} />
        <Stack.Screen name="(delivery)" options={{ headerShown: false }} />
        <Stack.Screen name="(admin)" options={{ headerShown: false }} />
        <Stack.Screen name="modal" options={{ presentation: 'modal' }} />
        <Stack.Screen name="notifications" options={{ presentation: 'modal', title: 'Notifications' }} />
      </Stack>
      <StatusBar style="auto" />
    </ThemeProvider>
  );
}

export default function RootLayout() {
  return (
    <AuthProvider>
      <NotificationProvider>
        <RootLayoutNav />
      </NotificationProvider>
    </AuthProvider>
  );
}
