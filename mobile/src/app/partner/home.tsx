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

type Order = {
  id: string;
  partner_id?: string | null;
  status?: string | null;
};

export default function PartnerHomeScreen() {
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<PartnerProfile | null>(null);

  const [incomingOrders, setIncomingOrders] = useState(0);
  const [activeOrders, setActiveOrders] = useState(0);
  const [completedOrders, setCompletedOrders] = useState(0);

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

      await Promise.all([
        loadPartnerProfile(parsedUser.id),
        loadPartnerOrders(parsedUser.id),
      ]);
    } catch (error) {
      console.log("Partner dashboard error:", error);
    } finally {
      setLoading(false);
    }
  };

  const loadPartnerProfile = async (userId: string) => {
    try {
      const response = await axios.get(
        `${API_URL}/partners/${userId}`
      );

      setProfile(response.data.profile);
    } catch (error: any) {
      console.log(
        "Partner profile error:",
        error.response?.data || error.message
      );
    }
  };

  const loadPartnerOrders = async (partnerId: string) => {
    try {
      const response = await axios.get(
        `${API_URL}/orders/partner/${partnerId}`
      );

      const orders: Order[] =
        response.data.orders || [];

      const incoming = orders.filter(
        (order) =>
          order.status === "PLACED" ||
          order.status === "RIDER_ASSIGNED"
      );

      const active = orders.filter(
        (order) =>
          order.status !== "PLACED" &&
          order.status !== "DELIVERED" &&
          order.status !== "CANCELLED"
      );

      const completed = orders.filter(
        (order) => order.status === "DELIVERED"
      );

      setIncomingOrders(incoming.length);
      setActiveOrders(active.length);
      setCompletedOrders(completed.length);
    } catch (error: any) {
      console.log(
        "Partner order stats error:",
        error.response?.data || error.message
      );

      setIncomingOrders(0);
      setActiveOrders(0);
      setCompletedOrders(0);
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

  if (loading) {
    return (
      <View style={styles.loadingScreen}>
        <ActivityIndicator
          size="large"
          color="#155EEF"
        />

        <Text style={styles.loadingText}>
          Loading partner dashboard...
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
              PARTNER PANEL
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

        <Text style={styles.greeting}>
          Welcome,
        </Text>

        <Text style={styles.heading}>
          {profile?.business_name ||
            user?.name ||
            "Laundry Partner"}
        </Text>

        <Text style={styles.ownerText}>
          Managed by{" "}
          {profile?.owner_name ||
            user?.name ||
            "Partner"}
        </Text>

        <View style={styles.statusCard}>
          <View style={styles.statusContent}>
            <Text style={styles.statusSmall}>
              BUSINESS STATUS
            </Text>

            <Text style={styles.statusTitle}>
              {profile?.is_open
                ? "Open for Orders"
                : "Currently Closed"}
            </Text>

            <Text style={styles.statusDescription}>
              {profile?.verification_status === "APPROVED"
                ? "Your laundry partner account is approved and ready to receive customer orders."
                : "Partner verification is still pending or unavailable."}
            </Text>
          </View>

          <View style={styles.statusIcon}>
            <Ionicons
              name={
                profile?.is_open
                  ? "checkmark-circle"
                  : "time-outline"
              }
              size={34}
              color="#155EEF"
            />
          </View>
        </View>

        <Text style={styles.sectionTitle}>
          Order Overview
        </Text>

        <View style={styles.statsRow}>
          <Pressable
            style={styles.statCard}
            onPress={() =>
              router.push("/partner/orders")
            }
          >
            <View style={styles.statIconYellow}>
              <Ionicons
                name="notifications-outline"
                size={22}
                color="#155EEF"
              />
            </View>

            <Text style={styles.statNumber}>
              {incomingOrders}
            </Text>

            <Text style={styles.statLabel}>
              Incoming
            </Text>
          </Pressable>

          <Pressable
            style={styles.statCard}
            onPress={() =>
              router.push("/partner/orders")
            }
          >
            <View style={styles.statIconBlue}>
              <Ionicons
                name="shirt-outline"
                size={22}
                color="#155EEF"
              />
            </View>

            <Text style={styles.statNumber}>
              {activeOrders}
            </Text>

            <Text style={styles.statLabel}>
              Active
            </Text>
          </Pressable>

          <Pressable
            style={styles.statCard}
            onPress={() =>
              router.push("/partner/orders")
            }
          >
            <View style={styles.statIconGreen}>
              <Ionicons
                name="checkmark-done-outline"
                size={22}
                color="#155EEF"
              />
            </View>

            <Text style={styles.statNumber}>
              {completedOrders}
            </Text>

            <Text style={styles.statLabel}>
              Completed
            </Text>
          </Pressable>
        </View>

        <Text style={styles.sectionTitle}>
          Quick Actions
        </Text>

        <Pressable
          style={styles.actionCard}
          onPress={() =>
            router.push("/partner/orders")
          }
        >
          <View style={styles.actionIcon}>
            <Ionicons
              name="receipt-outline"
              size={23}
              color="#155EEF"
            />
          </View>

          <View style={styles.actionContent}>
            <Text style={styles.actionTitle}>
              Manage Orders
            </Text>

            <Text style={styles.actionText}>
              View incoming orders and update cleaning status.
            </Text>
          </View>

          <Ionicons
            name="chevron-forward"
            size={20}
            color="#155EEF"
          />
        </Pressable>

        <Pressable
          style={styles.actionCard}
          onPress={() =>
            router.push("/partner/services")
          }
        >
          <View style={styles.actionIconYellow}>
            <Ionicons
              name="pricetags-outline"
              size={23}
              color="#155EEF"
            />
          </View>

          <View style={styles.actionContent}>
            <Text style={styles.actionTitle}>
              Manage Services
            </Text>

            <Text style={styles.actionText}>
              Review laundry services, pricing and availability.
            </Text>
          </View>

          <Ionicons
            name="chevron-forward"
            size={20}
            color="#155EEF"
          />
        </Pressable>

        <Text style={styles.sectionTitle}>
          Business Information
        </Text>

        <View style={styles.infoCard}>
          <InfoRow
            icon="location-outline"
            label="Address"
            value={
              profile?.business_address ||
              "Not provided"
            }
          />

          <InfoRow
            icon="time-outline"
            label="Operating Hours"
            value={
              profile?.opening_time &&
              profile?.closing_time
                ? `${profile.opening_time} - ${profile.closing_time}`
                : "Not provided"
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
          />

          <InfoRow
            icon="star-outline"
            label="Rating"
            value={`${Number(
              profile?.average_rating || 0
            ).toFixed(1)} (${profile?.total_ratings || 0} ratings)`}
            last
          />
        </View>

        <View style={styles.profileCard}>
          <View style={styles.profileIcon}>
            <Ionicons
              name="person-outline"
              size={22}
              color="#155EEF"
            />
          </View>

          <View style={styles.profileInfo}>
            <Text style={styles.profileName}>
              {profile?.owner_name ||
                user?.name ||
                "Partner"}
            </Text>

            <Text style={styles.profileEmail}>
              {user?.email || ""}
            </Text>
          </View>

          <Pressable onPress={handleLogout}>
            <Ionicons
              name="log-out-outline"
              size={22}
              color="#D14343"
            />
          </Pressable>
        </View>
      </ScrollView>

      <View style={styles.bottomNav}>
        <Pressable style={styles.navItem}>
          <Ionicons
            name="home"
            size={22}
            color="#155EEF"
          />

          <Text style={styles.activeNav}>
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

        <Pressable
          style={styles.navItem}
          onPress={() =>
            router.replace("/partner/profile")
          }
        >
          <Ionicons
            name="person-outline"
            size={22}
            color="#8A93A4"
          />

          <Text style={styles.navText}>
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
    justifyContent: "center",
    alignItems: "center",
  },

  loadingText: {
    marginTop: 12,
    fontSize: 13,
    color: "#6B7280",
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
    marginBottom: 26,
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
    justifyContent: "center",
    alignItems: "center",
  },

  greeting: {
    fontSize: 14,
    color: "#6B7280",
  },

  heading: {
    fontSize: 29,
    lineHeight: 35,
    fontWeight: "900",
    color: "#17233C",
    marginTop: 4,
  },

  ownerText: {
    fontSize: 12,
    color: "#8A93A4",
    marginTop: 5,
    marginBottom: 22,
  },

  statusCard: {
    backgroundColor: "#155EEF",
    borderRadius: 22,
    padding: 20,
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 27,
  },

  statusContent: {
    flex: 1,
  },

  statusSmall: {
    fontSize: 10,
    color: "#FFF4C7",
    fontWeight: "900",
  },

  statusTitle: {
    fontSize: 20,
    fontWeight: "900",
    color: "#FFFFFF",
    marginTop: 6,
  },

  statusDescription: {
    fontSize: 11,
    lineHeight: 17,
    color: "#DDE8FF",
    marginTop: 6,
    maxWidth: 260,
  },

  statusIcon: {
    width: 54,
    height: 54,
    borderRadius: 18,
    backgroundColor: "#FFF4C7",
    justifyContent: "center",
    alignItems: "center",
    marginLeft: 15,
  },

  sectionTitle: {
    fontSize: 18,
    fontWeight: "900",
    color: "#17233C",
    marginBottom: 13,
  },

  statsRow: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 27,
  },

  statCard: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E5EAF2",
    borderRadius: 18,
    padding: 14,
  },

  statIconYellow: {
    width: 40,
    height: 40,
    borderRadius: 13,
    backgroundColor: "#FFF4C7",
    justifyContent: "center",
    alignItems: "center",
  },

  statIconBlue: {
    width: 40,
    height: 40,
    borderRadius: 13,
    backgroundColor: "#EAF0FF",
    justifyContent: "center",
    alignItems: "center",
  },

  statIconGreen: {
    width: 40,
    height: 40,
    borderRadius: 13,
    backgroundColor: "#EEF8F2",
    justifyContent: "center",
    alignItems: "center",
  },

  statNumber: {
    fontSize: 24,
    fontWeight: "900",
    color: "#17233C",
    marginTop: 11,
  },

  statLabel: {
    fontSize: 10,
    color: "#6B7280",
    marginTop: 2,
  },

  actionCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E5EAF2",
    borderRadius: 18,
    padding: 16,
    marginBottom: 12,
  },

  actionIcon: {
    width: 47,
    height: 47,
    borderRadius: 14,
    backgroundColor: "#EAF0FF",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 13,
  },

  actionIconYellow: {
    width: 47,
    height: 47,
    borderRadius: 14,
    backgroundColor: "#FFF4C7",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 13,
  },

  actionContent: {
    flex: 1,
  },

  actionTitle: {
    fontSize: 14,
    fontWeight: "900",
    color: "#17233C",
  },

  actionText: {
    fontSize: 11,
    color: "#6B7280",
    lineHeight: 16,
    marginTop: 4,
  },

  infoCard: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E5EAF2",
    borderRadius: 19,
    padding: 16,
    marginBottom: 24,
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
    justifyContent: "center",
    alignItems: "center",
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
    fontSize: 12,
    color: "#17233C",
    fontWeight: "800",
    marginTop: 3,
  },

  profileCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFF4C7",
    borderRadius: 18,
    padding: 16,
  },

  profileIcon: {
    width: 43,
    height: 43,
    borderRadius: 14,
    backgroundColor: "#FFFFFF",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },

  profileInfo: {
    flex: 1,
  },

  profileName: {
    fontSize: 14,
    fontWeight: "900",
    color: "#17233C",
  },

  profileEmail: {
    fontSize: 11,
    color: "#6B7280",
    marginTop: 3,
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