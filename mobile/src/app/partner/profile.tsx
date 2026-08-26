import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { router } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

const API_URL = "http://localhost:5000/api/v1";

type PartnerProfile = {
  user_id: string;
  business_name: string;
  owner_name: string;
  trade_licence_number?: string | null;
  description?: string | null;
  business_address?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  service_radius_km?: number | null;
  opening_time?: string | null;
  closing_time?: string | null;
  verification_status?: string | null;
  average_rating?: number | null;
  total_ratings?: number | null;
  is_open?: boolean | null;
};

export default function PartnerProfileScreen() {
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] =
    useState<PartnerProfile | null>(null);

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    initialize();
  }, []);

  const initialize = async () => {
    try {
      const storedUser = await AsyncStorage.getItem("user");

      if (!storedUser) {
        router.replace("/login");
        return;
      }

      const parsedUser = JSON.parse(storedUser);

      if (Number(parsedUser.role_id) !== 3) {
        Alert.alert(
          "Access Denied",
          "This page is only available for laundry partners."
        );

        router.replace("/login");
        return;
      }

      setUser(parsedUser);

      const response = await axios.get(
        `${API_URL}/partners/${parsedUser.id}`
      );

      setProfile(response.data.profile);
    } catch (error: any) {
      console.log(
        "Partner profile error:",
        error.response?.data || error.message
      );

      Alert.alert(
        "Could not load profile",
        error.response?.data?.message ||
          "Unable to load partner information."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await AsyncStorage.multiRemove([
      "user",
      "access_token",
      "refresh_token",
    ]);

    router.replace("/login");
  };

  const formatRating = () => {
    return Number(
      profile?.average_rating || 0
    ).toFixed(1);
  };

  if (loading) {
    return (
      <View style={styles.loadingScreen}>
        <ActivityIndicator
          size="large"
          color="#155EEF"
        />

        <Text style={styles.loadingText}>
          Loading partner profile...
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.screen}>
      <ScrollView
        contentContainerStyle={styles.container}
        showsVerticalScrollIndicator={false}
      >
        {/* HEADER */}

        <View style={styles.header}>
          <View>
            <Text style={styles.brand}>
              SMART LAUNDRY
            </Text>

            <Text style={styles.roleText}>
              PARTNER PROFILE
            </Text>
          </View>

          <View style={styles.headerIcon}>
            <Ionicons
              name="storefront-outline"
              size={24}
              color="#155EEF"
            />
          </View>
        </View>

        {/* HERO */}

        <View style={styles.heroCard}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {profile?.business_name
                ?.charAt(0)
                ?.toUpperCase() || "P"}
            </Text>
          </View>

          <Text style={styles.businessName}>
            {profile?.business_name ||
              "Laundry Partner"}
          </Text>

          <Text style={styles.ownerName}>
            {profile?.owner_name ||
              user?.name ||
              ""}
          </Text>

          <View style={styles.badgeRow}>
            <View style={styles.badge}>
              <Ionicons
                name="checkmark-circle-outline"
                size={15}
                color="#155EEF"
              />

              <Text style={styles.badgeText}>
                {profile?.verification_status ||
                  "UNKNOWN"}
              </Text>
            </View>

            <View style={styles.badgeYellow}>
              <Ionicons
                name={
                  profile?.is_open
                    ? "storefront-outline"
                    : "time-outline"
                }
                size={15}
                color="#155EEF"
              />

              <Text style={styles.badgeText}>
                {profile?.is_open
                  ? "OPEN"
                  : "CLOSED"}
              </Text>
            </View>
          </View>
        </View>

        {/* CONTACT */}

        <Text style={styles.sectionTitle}>
          Account Information
        </Text>

        <View style={styles.card}>
          <InfoRow
            icon="mail-outline"
            label="Email"
            value={user?.email || "Not provided"}
          />

          <InfoRow
            icon="call-outline"
            label="Phone"
            value={user?.phone || "Not provided"}
            last
          />
        </View>

        {/* BUSINESS INFO */}

        <Text style={styles.sectionTitle}>
          Business Information
        </Text>

        <View style={styles.card}>
          <InfoRow
            icon="business-outline"
            label="Business Name"
            value={
              profile?.business_name ||
              "Not provided"
            }
          />

          <InfoRow
            icon="person-outline"
            label="Owner"
            value={
              profile?.owner_name ||
              "Not provided"
            }
          />

          <InfoRow
            icon="document-text-outline"
            label="Trade Licence"
            value={
              profile?.trade_licence_number ||
              "Not provided"
            }
          />

          <InfoRow
            icon="location-outline"
            label="Business Address"
            value={
              profile?.business_address ||
              "Not provided"
            }
            last
          />
        </View>

        {/* OPERATIONS */}

        <Text style={styles.sectionTitle}>
          Operations
        </Text>

        <View style={styles.card}>
          <InfoRow
            icon="time-outline"
            label="Opening Time"
            value={
              profile?.opening_time ||
              "Not provided"
            }
          />

          <InfoRow
            icon="time-outline"
            label="Closing Time"
            value={
              profile?.closing_time ||
              "Not provided"
            }
          />

          <InfoRow
            icon="navigate-outline"
            label="Service Radius"
            value={
              profile?.service_radius_km != null
                ? `${profile.service_radius_km} km`
                : "Not provided"
            }
            last
          />
        </View>

        {/* DESCRIPTION */}

        {profile?.description ? (
          <>
            <Text style={styles.sectionTitle}>
              About Business
            </Text>

            <View style={styles.descriptionCard}>
              <Ionicons
                name="information-circle-outline"
                size={22}
                color="#155EEF"
              />

              <Text style={styles.descriptionText}>
                {profile.description}
              </Text>
            </View>
          </>
        ) : null}

        {/* RATING */}

        <Text style={styles.sectionTitle}>
          Business Performance
        </Text>

        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <View style={styles.statIconBlue}>
              <Ionicons
                name="star-outline"
                size={22}
                color="#155EEF"
              />
            </View>

            <Text style={styles.statValue}>
              {formatRating()}
            </Text>

            <Text style={styles.statLabel}>
              Rating
            </Text>
          </View>

          <View style={styles.statCard}>
            <View style={styles.statIconYellow}>
              <Ionicons
                name="people-outline"
                size={22}
                color="#155EEF"
              />
            </View>

            <Text style={styles.statValue}>
              {profile?.total_ratings || 0}
            </Text>

            <Text style={styles.statLabel}>
              Total Ratings
            </Text>
          </View>
        </View>

        {/* STATUS */}

        <View style={styles.statusCard}>
          <View style={styles.statusIcon}>
            <Ionicons
              name={
                profile?.is_open
                  ? "checkmark-circle-outline"
                  : "close-circle-outline"
              }
              size={22}
              color="#155EEF"
            />
          </View>

          <View style={styles.statusContent}>
            <Text style={styles.statusTitle}>
              Business Status
            </Text>

            <Text style={styles.statusText}>
              {profile?.is_open
                ? "Open for customer orders"
                : "Currently closed"}
            </Text>
          </View>
        </View>

        {/* LOGOUT */}

        <Pressable
          style={styles.logoutButton}
          onPress={handleLogout}
        >
          <Ionicons
            name="log-out-outline"
            size={20}
            color="#D14343"
          />

          <Text style={styles.logoutText}>
            Logout
          </Text>
        </Pressable>
      </ScrollView>

      {/* BOTTOM NAV */}

      <View style={styles.bottomNav}>
        <Pressable
          style={styles.navItem}
          onPress={() =>
            router.replace("/partner/home")
          }
        >
          <Ionicons
            name="home-outline"
            size={22}
            color="#8A93A4"
          />

          <Text style={styles.navText}>
            Home
          </Text>
        </Pressable>

        <Pressable
          style={styles.navItem}
          onPress={() =>
            router.replace("/partner/orders")
          }
        >
          <Ionicons
            name="receipt-outline"
            size={22}
            color="#8A93A4"
          />

          <Text style={styles.navText}>
            Orders
          </Text>
        </Pressable>

        <Pressable
          style={styles.navItem}
          onPress={() =>
            router.replace("/partner/services")
          }
        >
          <Ionicons
            name="pricetags-outline"
            size={22}
            color="#8A93A4"
          />

          <Text style={styles.navText}>
            Services
          </Text>
        </Pressable>

        <Pressable style={styles.navItem}>
          <Ionicons
            name="person"
            size={22}
            color="#155EEF"
          />

          <Text style={styles.activeNav}>
            Profile
          </Text>
        </Pressable>
      </View>
    </View>
  );
}

function InfoRow({
  icon,
  label,
  value,
  last,
}: {
  icon: any;
  label: string;
  value: string;
  last?: boolean;
}) {
  return (
    <View
      style={[
        styles.infoRow,
        last && styles.infoRowLast,
      ]}
    >
      <View style={styles.infoIcon}>
        <Ionicons
          name={icon}
          size={20}
          color="#155EEF"
        />
      </View>

      <View style={styles.infoContent}>
        <Text style={styles.infoLabel}>
          {label}
        </Text>

        <Text style={styles.infoValue}>
          {value}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#F7F9FC",
  },

  loadingScreen: {
    flex: 1,
    backgroundColor: "#F7F9FC",
    alignItems: "center",
    justifyContent: "center",
  },

  loadingText: {
    marginTop: 12,
    color: "#6B7280",
    fontSize: 13,
  },

  container: {
    padding: 22,
    paddingTop: 48,
    paddingBottom: 115,
  },

  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 25,
  },

  brand: {
    fontSize: 20,
    fontWeight: "900",
    color: "#155EEF",
  },

  roleText: {
    fontSize: 10,
    color: "#8A93A4",
    fontWeight: "800",
    letterSpacing: 1,
    marginTop: 3,
  },

  headerIcon: {
    width: 46,
    height: 46,
    borderRadius: 15,
    backgroundColor: "#FFF4C7",
    alignItems: "center",
    justifyContent: "center",
  },

  heroCard: {
    backgroundColor: "#155EEF",
    borderRadius: 23,
    padding: 24,
    alignItems: "center",
    marginBottom: 27,
  },

  avatar: {
    width: 76,
    height: 76,
    borderRadius: 24,
    backgroundColor: "#FFF4C7",
    alignItems: "center",
    justifyContent: "center",
  },

  avatarText: {
    fontSize: 31,
    fontWeight: "900",
    color: "#155EEF",
  },

  businessName: {
    marginTop: 13,
    fontSize: 22,
    color: "#FFFFFF",
    fontWeight: "900",
  },

  ownerName: {
    marginTop: 4,
    fontSize: 11,
    color: "#DDE8FF",
  },

  badgeRow: {
    flexDirection: "row",
    gap: 8,
    marginTop: 15,
    flexWrap: "wrap",
    justifyContent: "center",
  },

  badge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },

  badgeYellow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    backgroundColor: "#FFF4C7",
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },

  badgeText: {
    fontSize: 9,
    color: "#155EEF",
    fontWeight: "900",
  },

  sectionTitle: {
    fontSize: 17,
    fontWeight: "900",
    color: "#17233C",
    marginBottom: 12,
  },

  card: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E5EAF2",
    borderRadius: 19,
    padding: 16,
    marginBottom: 25,
  },

  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: "#EEF1F5",
    paddingBottom: 14,
    marginBottom: 14,
  },

  infoRowLast: {
    borderBottomWidth: 0,
    marginBottom: 0,
    paddingBottom: 0,
  },

  infoIcon: {
    width: 42,
    height: 42,
    borderRadius: 13,
    backgroundColor: "#FFF4C7",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },

  infoContent: {
    flex: 1,
  },

  infoLabel: {
    fontSize: 10,
    color: "#8A93A4",
    fontWeight: "800",
  },

  infoValue: {
    marginTop: 3,
    fontSize: 13,
    color: "#17233C",
    fontWeight: "800",
  },

  descriptionCard: {
    flexDirection: "row",
    gap: 10,
    backgroundColor: "#FFF4C7",
    borderRadius: 17,
    padding: 15,
    marginBottom: 25,
  },

  descriptionText: {
    flex: 1,
    fontSize: 11,
    lineHeight: 17,
    color: "#52617A",
  },

  statsRow: {
    flexDirection: "row",
    gap: 13,
    marginBottom: 25,
  },

  statCard: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E5EAF2",
    borderRadius: 18,
    padding: 16,
  },

  statIconBlue: {
    width: 43,
    height: 43,
    borderRadius: 14,
    backgroundColor: "#EAF0FF",
    alignItems: "center",
    justifyContent: "center",
  },

  statIconYellow: {
    width: 43,
    height: 43,
    borderRadius: 14,
    backgroundColor: "#FFF4C7",
    alignItems: "center",
    justifyContent: "center",
  },

  statValue: {
    marginTop: 12,
    fontSize: 23,
    fontWeight: "900",
    color: "#17233C",
  },

  statLabel: {
    marginTop: 3,
    fontSize: 10,
    color: "#6B7280",
  },

  statusCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFF4C7",
    borderRadius: 18,
    padding: 16,
    marginBottom: 20,
  },

  statusIcon: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },

  statusContent: {
    flex: 1,
  },

  statusTitle: {
    fontSize: 13,
    fontWeight: "900",
    color: "#17233C",
  },

  statusText: {
    marginTop: 3,
    fontSize: 11,
    color: "#6B7280",
  },

  logoutButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: "#FFF7F7",
    borderWidth: 1,
    borderColor: "#F0CACA",
    borderRadius: 14,
    paddingVertical: 14,
  },

  logoutText: {
    color: "#D14343",
    fontSize: 13,
    fontWeight: "900",
  },

  bottomNav: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    height: 82,
    backgroundColor: "#FFFFFF",
    borderTopWidth: 1,
    borderTopColor: "#E5EAF2",
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
  },

  navItem: {
    alignItems: "center",
    justifyContent: "center",
    minWidth: 62,
    gap: 4,
  },

  navText: {
    fontSize: 11,
    color: "#8A93A4",
  },

  activeNav: {
    fontSize: 11,
    fontWeight: "800",
    color: "#155EEF",
  },
});