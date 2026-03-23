import { Colors } from "@/constants/theme";
import { useAuth } from "@/context/AuthContext";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { BlurView } from "expo-blur";
import { LinearGradient } from "expo-linear-gradient";
import { useFocusEffect, useRouter } from "expo-router";
import {
  Bell,
  Calendar,
  Droplet,
  MapPin,
  Search,
  Star,
  Zap
} from "lucide-react-native";
import React, { useCallback, useState } from "react";
import {
  Dimensions,
  FlatList,
  ImageBackground,
  Platform,
  RefreshControl,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import Animated, {
  Extrapolate,
  interpolate,
  useAnimatedScrollHandler,
  useAnimatedStyle,
  useDerivedValue,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";

const { width: screenWidth } = Dimensions.get("window");

interface Pin {
  id: string;
  image: any;
  title: string;
  subtitle?: string;
  rating: number;
  reviews: number;
  price: string;
  badge?: string;
  height: number;
  isPromo?: boolean;
}

export default function DealsDashboard() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme ?? "light"];
  const { user } = useAuth();

  const [stats, setStats] = useState({
    walletBalance: 1250,
    deliveredThisMonth: 8,
  });
  const [pins, setPins] = useState<Pin[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);

  const scrollY = useSharedValue(0);
  const promoImage = require("@/assets/images/pinterest-promo.png");

  const generatePins = () => {
    const heights = [
      260, 320, 280, 360, 240, 340, 300, 280, 380, 260, 320, 400,
    ];
    const names = [
      "PureFlow Pro",
      "AquaPure Elite",
      "CrystalSpring",
      "BlueWave Water",
      "FreshDrop",
      "HydroVibe",
      "PurePulse",
      "AquaGlow",
      "CrystalClear",
      "WaterZen",
      "FlowMaster",
      "HydraPeak",
    ];

    return [
      {
        id: "promo",
        image: promoImage,
        title: "🔥 FLASH SALE - Pure RO Water",
        subtitle: "Limited time from Premium Vendor",
        rating: 4.9,
        reviews: 1278,
        price: "₹22/Ltr",
        badge: "50% OFF",
        height: 350,
        isPromo: true,
      },
      ...Array(11)
        .fill(0)
        .map((_, i) => ({
          id: `pin${i}`,
          image: {
            uri: `https://picsum.photos/400/${heights[i]}?random=${i}&blur`,
          },
          title: names[i] || `Vendor ${i + 1}`,
          subtitle: `High quality • Nearby • ${1 + i * 0.5}km`,
          rating: 4.3 + Math.random() * 0.5,
          reviews: 45 + Math.floor(Math.random() * 200),
          price: "₹25/Ltr",
          badge: i % 3 === 0 ? "TOP RATED" : undefined,
          height: heights[i],
        })),
    ];
  };

  const fetchData = useCallback(async () => {
    setLoading(true);
    setTimeout(() => {
      setStats({ walletBalance: 1250, deliveredThisMonth: 12 });
      setPins(generatePins());
      setLoading(false);
    }, 1000);
  }, []);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchData().finally(() => setRefreshing(false));
  }, [fetchData]);

  useFocusEffect(
    useCallback(() => {
      fetchData();
    }, [fetchData]),
  );

  const scrollHandler = useAnimatedScrollHandler((event) => {
    scrollY.value = event.contentOffset.y;
  });

  const headerStyle = useAnimatedStyle(() => ({
    height: interpolate(scrollY.value, [0, 100], [140, 80], Extrapolate.CLAMP),
    opacity: interpolate(scrollY.value, [0, 50], [1, 0.9], Extrapolate.CLAMP),
  }));

  const heroPinStyle = useDerivedValue(() => ({
    transform: [
      {
        scale: interpolate(
          scrollY.value,
          [0, 200],
          [1, 0.95],
          Extrapolate.CLAMP,
        ),
      },
    ],
  }));

  const renderPin = ({ item, index }: { item: Pin; index: number }) => {
    const scaleAnim = useSharedValue(1);

    const animatedStyle = useAnimatedStyle(() => ({
      transform: [{ scale: scaleAnim.value }],
    }));

    const onPressIn = () => {
      scaleAnim.value = withSpring(0.96);
    };

    const onPressOut = () => {
      scaleAnim.value = withSpring(1);
    };

    return (
      <Animated.View style={[styles.pinCardWrapper, animatedStyle]}>
        <TouchableOpacity
          style={styles.pinTouchable}
          onPressIn={onPressIn}
          onPressOut={onPressOut}
          activeOpacity={0.9}
          onPress={() => router.push("/(consumer)/vendor-details")}
        >
          <ImageBackground
            source={item.image}
            style={[styles.pinImage, { height: item.height }]}
            imageStyle={{ borderTopLeftRadius: 28, borderTopRightRadius: 28 }}
            resizeMode="cover"
          >
            <LinearGradient
              colors={["transparent", "rgba(0,0,0,0.85)"]}
              style={styles.pinOverlay}
            />
            {item.badge && (
              <View
                style={[
                  styles.badge,
                  {
                    backgroundColor: item.isPromo
                      ? "#EF4444"
                      : theme.primary + "CC",
                  },
                ]}
              >
                <Text style={styles.badgeText}>{item.badge}</Text>
              </View>
            )}
          </ImageBackground>
          <BlurView
            intensity={25}
            tint={colorScheme === "dark" ? "dark" : "light"}
            style={styles.pinContent}
          >
            <Text
              style={[styles.pinTitle, { color: theme.text }]}
              numberOfLines={1}
            >
              {item.title}
            </Text>
            {item.subtitle && (
              <Text
                style={[styles.pinSubtitle, { color: theme.icon }]}
                numberOfLines={1}
              >
                {item.subtitle}
              </Text>
            )}
            <View style={styles.pinRatingRow}>
              <View style={styles.ratingContainer}>
                <Star size={14} color="#F59E0B" fill="#F59E0B" />
                <Text style={[styles.ratingText, { color: theme.icon }]}>
                  {item.rating.toFixed(1)}
                </Text>
                <Text style={[styles.reviewsText, { color: theme.icon }]}>
                  ({item.reviews}+)
                </Text>
              </View>
              <Text style={[styles.pinPrice, { color: theme.primary }]}>
                {item.price}
              </Text>
            </View>
          </BlurView>
        </TouchableOpacity>
      </Animated.View>
    );
  };

  if (loading) {
    return (
      <View
        style={[
          styles.container,
          {
            backgroundColor: theme.background,
            justifyContent: "center",
            alignItems: "center",
          },
        ]}
      >
        <Droplet size={64} color={theme.primary} />
        <Text style={{ color: theme.text, marginTop: 16, fontWeight: "600" }}>
          Loading JalSaathi Deals...
        </Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <Animated.View style={[styles.topHeader, headerStyle]}>
        <View style={styles.headerLeft}>
          <Text style={[styles.welcome, { color: theme.icon }]}>Namaste,</Text>
          <Text style={[styles.userName, { color: theme.text }]}>
            {user?.name || "Guest"}
          </Text>
        </View>
        <View style={styles.headerRight}>
          <TouchableOpacity
            style={[styles.iconCircle, { backgroundColor: theme.card }]}
          >
            <Search size={22} color={theme.text} />
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.iconCircle, { backgroundColor: theme.card }]}
          >
            <Bell size={22} color={theme.text} />
          </TouchableOpacity>
        </View>
      </Animated.View>

      <Animated.ScrollView
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[theme.primary]}
          />
        }
        onScroll={scrollHandler}
        scrollEventThrottle={16}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Animated.View style={[styles.heroPin, heroPinStyle]}>
          <ImageBackground
            source={promoImage}
            style={styles.heroImage}
            resizeMode="cover"
          >
            <LinearGradient
              colors={["rgba(0,0,0,0.3)", "rgba(0,0,0,0.8)"]}
              style={styles.heroOverlay}
            >
              <Text style={styles.heroTitle}>JalSaathi Premium Deals ✨</Text>
              <View style={styles.heroStats}>
                <Text style={styles.heroBalance}>
                  ₹{stats.walletBalance.toFixed(2)}
                </Text>
                <Text style={styles.heroOrders}>
                  {stats.deliveredThisMonth} Orders • Nearby
                </Text>
              </View>
              <TouchableOpacity
                style={styles.heroCTA}
                onPress={() => router.push("/(consumer)/wallet")}
              >
                <Text style={styles.heroCTAText}>Shop Now</Text>
              </TouchableOpacity>
            </LinearGradient>
          </ImageBackground>
        </Animated.View>

        <View style={styles.actionRow}>
          {[
            { label: "Sub", icon: Calendar, color: "#F59E0B" },
            { label: "Top-up", icon: Zap, color: "#8B5CF6" },
            { label: "Favorites", icon: Star, color: "#10B981" },
            { label: "Map", icon: MapPin, color: "#EF4444" },
          ].map((item, idx) => (
            <TouchableOpacity key={idx} style={styles.actionItem}>
              <View
                style={[
                  styles.actionIcon,
                  { backgroundColor: item.color + "20" },
                ]}
              >
                <item.icon size={24} color={item.color} />
              </View>
              <Text style={[styles.actionLabel, { color: theme.icon }]}>
                {item.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>
            Discover Vendors
          </Text>
          <FlatList
            data={pins}
            renderItem={renderPin}
            keyExtractor={(item) => item.id}
            numColumns={2}
            columnWrapperStyle={styles.columnWrapper}
            contentContainerStyle={styles.gridContent}
            showsVerticalScrollIndicator={false}
            removeClippedSubviews
            initialNumToRender={8}
          />
        </View>
        <View style={{ height: 100 }} />
      </Animated.ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  topHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: Platform.select({ ios: 60, default: 50 }),
    zIndex: 10,
  },
  headerLeft: { flex: 1 },
  welcome: { fontSize: 14, fontWeight: "600" },
  userName: { fontSize: 24, fontWeight: "900", marginTop: 2 },
  headerRight: { flexDirection: "row", gap: 12 },
  iconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.2)",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  scrollContent: { paddingBottom: 100 },
  heroPin: {
    marginHorizontal: 20,
    marginBottom: 24,
    borderRadius: 32,
    overflow: "hidden",
    shadowColor: "#0EA5E9",
    shadowOffset: { width: 0, height: 20 },
    shadowOpacity: 0.3,
    shadowRadius: 30,
    elevation: 15,
  },
  heroImage: { width: screenWidth - 40, height: 280 },
  heroOverlay: {
    flex: 1,
    justifyContent: "flex-end",
    padding: 32,
    paddingBottom: 60,
  },
  heroTitle: {
    color: "white",
    fontSize: 28,
    fontWeight: "900",
    marginBottom: 12,
  },
  heroStats: { marginBottom: 24 },
  heroBalance: { color: "white", fontSize: 36, fontWeight: "900" },
  heroOrders: { color: "rgba(255,255,255,0.9)", fontSize: 16, marginTop: 4 },
  heroCTA: {
    backgroundColor: "white",
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 25,
    alignSelf: "flex-start",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
  },
  heroCTAText: { color: "#0EA5E9", fontWeight: "900", fontSize: 18 },
  actionRow: {
    flexDirection: "row",
    justifyContent: "space-evenly",
    marginBottom: 32,
    gap: 12,
  },
  actionItem: { alignItems: "center", gap: 8 },
  actionIcon: {
    width: 64,
    height: 64,
    borderRadius: 24,
    justifyContent: "center",
    alignItems: "center",
  },
  actionLabel: { fontSize: 12, fontWeight: "700" },
  section: { marginBottom: 32 },
  sectionTitle: {
    fontSize: 24,
    fontWeight: "900",
    marginHorizontal: 20,
    marginBottom: 20,
  },
  columnWrapper: { justifyContent: "space-between", paddingHorizontal: 20 },
  gridContent: { gap: 16 },
  pinTouchable: { flex: 1 },
  pinCardWrapper: { flex: 1, marginBottom: 16 },
  pinImage: {
    width: "100%",
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    overflow: "hidden",
  },
  pinOverlay: { flex: 1, justifyContent: "flex-end", padding: 16 },
  badge: {
    position: "absolute",
    top: 12,
    left: 12,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    zIndex: 10,
  },
  badgeText: { color: "white", fontWeight: "800", fontSize: 11 },
  pinContent: {
    padding: 16,
    minHeight: 80,
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
    borderTopWidth: 1,
    borderTopColor: "rgba(255,255,255,0.1)",
  },
  pinTitle: { fontSize: 16, fontWeight: "800", marginBottom: 4 },
  pinSubtitle: { fontSize: 13, marginBottom: 12 },
  pinRatingRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  ratingContainer: { flexDirection: "row", alignItems: "center", gap: 4 },
  ratingText: { fontSize: 14, fontWeight: "700", marginLeft: 2 },
  reviewsText: { fontSize: 12 },
  pinPrice: { fontSize: 18, fontWeight: "900" },
});
