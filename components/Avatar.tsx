import React, { useState } from 'react';
import { StyleSheet, View, Image, TouchableOpacity, Text, ActivityIndicator, Alert } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { User as UserIcon, Camera } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '@/context/AuthContext';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

interface AvatarProps {
  size?: number;
  showEdit?: boolean;
}

export default function Avatar({ size = 100, showEdit = true }: AvatarProps) {
  const { user, updateProfile } = useAuth();
  const [uploading, setUploading] = useState(false);
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme ?? 'light'];

  const pickImage = async () => {
    // Request permission
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission Denied', 'We need access to your gallery to change your profile picture.');
      return;
    }

    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.5,
        base64: true,
      });

      if (!result.canceled && result.assets[0].base64) {
        setUploading(true);
        // We'll store as base64 for now as we don't have a file server setup
        // Prefix with data:image/jpeg;base64,
        const base64Image = `data:image/jpeg;base64,${result.assets[0].base64}`;
        await updateProfile({ profilePic: base64Image });
      }
    } catch (error) {
      console.error(error);
      Alert.alert('Upload Failed', 'Something went wrong while updating your profile picture.');
    } finally {
      setUploading(false);
    }
  };

  const hasProfilePic = user?.profilePic && user.profilePic.length > 0;

  return (
    <View style={[styles.container, { width: size, height: size }]}>
      <View style={[styles.avatarWrapper, { borderRadius: size / 2, borderColor: theme.primary }]}>
        {hasProfilePic ? (
          <Image 
            source={{ uri: user.profilePic }} 
            style={[styles.avatar, { borderRadius: size / 2 }]} 
          />
        ) : (
          <LinearGradient
            colors={[theme.primary, theme.secondary || '#8B5CF6'] as any}
            style={[styles.defaultAvatar, { borderRadius: size / 2 }]}
          >
            <UserIcon size={size * 0.5} color="white" />
          </LinearGradient>
        )}

        {uploading && (
          <View style={[styles.loader, { borderRadius: size / 2 }]}>
            <ActivityIndicator color="white" />
          </View>
        )}
      </View>

      {showEdit && !uploading && (
        <TouchableOpacity 
          style={[styles.editBadge, { backgroundColor: theme.primary }]} 
          onPress={pickImage}
        >
          <Camera size={size * 0.15} color="white" />
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    alignSelf: 'center',
  },
  avatarWrapper: {
    width: '100%',
    height: '100%',
    borderWidth: 3,
    padding: 3,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  avatar: {
    width: '100%',
    height: '100%',
  },
  defaultAvatar: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loader: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  editBadge: {
    position: 'absolute',
    bottom: 5,
    right: 5,
    width: '30%',
    height: '30%',
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'white',
  },
});
