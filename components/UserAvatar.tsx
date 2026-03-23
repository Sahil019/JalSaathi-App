import React from 'react';
import { StyleSheet, View, Image, ViewStyle } from 'react-native';
import { User as UserIcon } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';

interface UserAvatarProps {
  uri?: string;
  size?: number;
  name?: string;
  style?: ViewStyle | any;
}

export default function UserAvatar({ uri, size = 40, name, style }: UserAvatarProps) {
  const hasPic = uri && uri.length > 0;
  
  const getGradientColors = () => {
    // Consistent colors based on string to make it look "animated" and unique
    if (!name) return ['#6366F1', '#8B5CF6'];
    const charCode = name.charCodeAt(0);
    if (charCode % 3 === 0) return ['#EC4899', '#F43F5E']; // Pink/Red
    if (charCode % 3 === 1) return ['#10B981', '#059669']; // Green
    return ['#6366F1', '#8B5CF6']; // Indigo/Violet
  };

  return (
    <View style={[styles.container, { width: size, height: size, borderRadius: size / 2 }, style]}>
      {hasPic ? (
        <Image source={{ uri }} style={[styles.avatar, { borderRadius: size / 2 }]} />
      ) : (
        <LinearGradient
          colors={getGradientColors() as any}
          style={[styles.defaultAvatar, { borderRadius: size / 2 }]}
        >
          <UserIcon size={size * 0.5} color="white" />
        </LinearGradient>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { overflow: 'hidden', justifyContent: 'center', alignItems: 'center' },
  avatar: { width: '100%', height: '100%' },
  defaultAvatar: { width: '100%', height: '100%', justifyContent: 'center', alignItems: 'center' }
});
