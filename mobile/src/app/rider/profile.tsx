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

type RiderProfile = {
  user_id: string;
  national_id?: string | null;
  vehicle_type: string;
  vehicle_registration?: string | null;
  licence_number?: string | null;
  availability_status: "OFFLINE" | "AVAILABLE" | "BUSY";
  verification_status: "PENDING" | "APPROVED" | "REJECTED";
  average_rating: number;
  total_ratings: number;
};

export default function RiderProfileScreen() {
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] =
    useState<RiderProfile | null>(null);
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

      if (Number(parsedUser.role_id) !== 2) {
        Alert.alert(
          "Access Denied",
          "This page is only available for riders."
        );

        router.replace("/login");
        return;
      }

      setUser(parsedUser);

      const response = await axios.get(
        `${API_URL}/riders/${parsedUser.id}`
      );

      setProfile(response.data.profile);
    } catch (error: any) {
      console.log(
        "Rider profile error:",
        error.response?.data || error.message
      );

      Alert.alert(
        "Could not load profile",
        error.response?.data?.message ||
          "Unable to load rider information."
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

  const getAvailabilityLabel = () => {
    switch (profile?.availability_status) {
      case "AVAILABLE":
        return "Available for Jobs";
      case "BUSY":
        return "Busy";
      case "OFFLINE":
        return "Offline";
      default:
        return "Unknown";
    }
  };

  const getVerificationLabel = () => {
    switch (profile?.verification_status) {
      case "APPROVED":
        return "Verified Rider";
      case "PENDING":
        return "Verification Pending";
      case "REJECTED":
        return "Verification Rejected";
      default:
        return "Unknown";
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingScreen}>
        <ActivityIndicator
          size="large"
          color="#155EEF"
        />

        <Text style={styles.loadingText}>
          Loading rider profile...
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
        <View style={styles.header}>
          <View>
            <Text style={styles.brand}>
              SMART LAUNDRY
            </Text>

            <Text style={styles.roleText}>
              RIDER PROFILE
            </Text>
          </View>

          <View style={styles.headerIcon}>
            <Ionicons
              name="person-outline"
              size={24}
              color="#155EEF"
            />
          </View>
        </View>

        <View style={styles.profileHero}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {user?.name?.charAt(0)?.toUpperCase() || "R"}
            </Text>
          </View>

          <Text style={styles.name}>
            {user?.name || "Rider"}
          </Text>

          <Text style={styles.email}>
            {user?.email || ""}
          </Text>

          <View style={styles.badgeRow}>
            <View style={styles.badge}>
              <Ionicons
                name="checkmark-circle-outline"
                size={15}
                color="#155EEF"
              />

              <Text style={styles.badgeText}>
                {getVerificationLabel()}
              </Text>
            </View>

            <View style={styles.badgeYellow}>
              <Ionicons
                name="bicycle-outline"
                size={15}
                color="#155EEF"
              />

              <Text style={styles.badgeText}>
                {getAvailabilityLabel()}
              </Text>
            </View>
          </View>
        </View>

        <Text style={styles.sectionTitle}>
          Personal Information
        </Text>

        <View style={styles.card}>
          <InfoRow
            icon="call-outline"
            label="Phone"
            value={user?.phone || "Not provided"}
          />

          <InfoRow
            icon="card-outline"
            label="National ID"
            value={profile?.national_id || "Not provided"}
            last
          />
        </View>

        <Text style={styles.sectionTitle}>
          Vehicle Information
        </Text>

        <View style={styles.card}>
          <InfoRow
            icon="bicycle-outline"
            label="Vehicle Type"
            value={profile?.vehicle_type || "Not provided"}
          />

          <InfoRow
            icon="car-outline"
            label="Vehicle Registration"
            value={
              profile?.vehicle_registration ||
              "Not provided"
            }
          />

          <InfoRow
            icon="document-text-outline"
            label="Licence Number"
            value={
              profile?.licence_number ||
              "Not provided"
            }
            last
          />
        </View>

        <Text style={styles.sectionTitle}>
          Rider Performance
        </Text>

        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <View style={styles.statIcon}>
              <Ionicons
                name="star-outline"
                size={22}
                color="#155EEF"
              />
            </View>

            <Text style={styles.statValue}>
              {Number(profile?.average_rating || 0).toFixed(1)}
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
              Ratings
            </Text>
          </View>
        </View>

        <View style={styles.statusCard}>
          <View style={styles.statusIcon}>
            <Ionicons
              name={
                profile?.availability_status === "AVAILABLE"
                  ? "checkmark-circle-outline"
                  : profile?.availability_status === "BUSY"
                  ? "time-outline"
                  : "power-outline"
              }
              size={22}
              color="#155EEF"
            />
          </View>

          <View style={styles.statusContent}>
            <Text style={styles.statusTitle}>
              Rider Status
            </Text>

            <Text style={styles.statusText}>
              {getAvailabilityLabel()}
            </Text>
          </View>
        </View>

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

      <View style={styles.bottomNav}>
        <Pressable
          style={styles.navItem}
          onPress={() =>
            router.replace("/rider/home")
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
            router.replace("/rider/jobs")
          }
        >
          <Ionicons
            name="cube-outline"
            size={22}
            color="#8A93A4"
          />

          <Text style={styles.navText}>
            Jobs
          </Text>
        </Pressable>

        <Pressable
          style={styles.navItem}
          onPress={() =>
            router.replace("/rider/history")
          }
        >
          <Ionicons
            name="time-outline"
            size={22}
            color="#8A93A4"
          />

          <Text style={styles.navText}>
            History
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
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 25,
  },

  brand: {
    fontSize: 20,
    fontWeight: "900",
    color: "#155EEF",
  },

  roleText: {
    fontSize: 10,
    fontWeight: "800",
    color: "#8A93A4",
    marginTop: 3,
    letterSpacing: 1,
  },

  headerIcon: {
    width: 46,
    height: 46,
    borderRadius: 15,
    backgroundColor: "#FFF4C7",
    justifyContent: "center",
    alignItems: "center",
  },

  profileHero: {
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

  name: {
    color: "#FFFFFF",
    fontSize: 22,
    fontWeight: "900",
    marginTop: 13,
  },

  email: {
    fontSize: 11,
    color: "#DDE8FF",
    marginTop: 4,
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
    fontWeight: "900",
    color: "#155EEF",
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
    paddingBottom: 0,
    marginBottom: 0,
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
    fontSize: 13,
    color: "#17233C",
    fontWeight: "800",
    marginTop: 3,
  },

  statsRow: {
    flexDirection: "row",
    gap: 13,
    marginBottom: 25,
  },

  statCard: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "#E5EAF2",
    padding: 16,
  },

  statIcon: {
    width: 43,
    height: 43,
    borderRadius: 14,
    backgroundColor: "#EAF0FF",
    justifyContent: "center",
    alignItems: "center",
  },

  statIconYellow: {
    width: 43,
    height: 43,
    borderRadius: 14,
    backgroundColor: "#FFF4C7",
    justifyContent: "center",
    alignItems: "center",
  },

  statValue: {
    fontSize: 23,
    fontWeight: "900",
    color: "#17233C",
    marginTop: 12,
  },

  statLabel: {
    fontSize: 10,
    color: "#6B7280",
    marginTop: 3,
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
    justifyContent: "center",
    alignItems: "center",
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
    fontSize: 11,
    color: "#6B7280",
    marginTop: 3,
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