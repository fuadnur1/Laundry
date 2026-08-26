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

type DashboardData = {
  totalCustomers: number;
  totalRiders: number;
  totalPartners: number;
  totalOrders: number;
  pendingRiders: number;
  pendingPartners: number;
};

export default function AdminHomeScreen() {
  const [user, setUser] = useState<any>(null);

  const [dashboard, setDashboard] =
    useState<DashboardData>({
      totalCustomers: 0,
      totalRiders: 0,
      totalPartners: 0,
      totalOrders: 0,
      pendingRiders: 0,
      pendingPartners: 0,
    });

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

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

      if (Number(parsedUser.role_id) !== 4) {
        Alert.alert(
          "Access Denied",
          "This page is only available for administrators."
        );

        router.replace("/login");
        return;
      }

      setUser(parsedUser);

      await loadDashboard();
    } catch (error) {
      console.log("Admin initialization error:", error);
    } finally {
      setLoading(false);
    }
  };

  const loadDashboard = async () => {
    try {
      const response = await axios.get(
        `${API_URL}/admin/dashboard`
      );

      const data = response.data.dashboard || response.data;

      setDashboard({
        totalCustomers:
          Number(data.totalCustomers) || 0,

        totalRiders:
          Number(data.totalRiders) || 0,

        totalPartners:
          Number(data.totalPartners) || 0,

        totalOrders:
          Number(data.totalOrders) || 0,

        pendingRiders:
          Number(data.pendingRiders) || 0,

        pendingPartners:
          Number(data.pendingPartners) || 0,
      });
    } catch (error: any) {
      console.log(
        "Admin dashboard error:",
        error.response?.data || error.message
      );

      setDashboard({
        totalCustomers: 0,
        totalRiders: 0,
        totalPartners: 0,
        totalOrders: 0,
        pendingRiders: 0,
        pendingPartners: 0,
      });
    }
  };

  const handleRefresh = async () => {
    try {
      setRefreshing(true);
      await loadDashboard();
    } finally {
      setRefreshing(false);
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
          Loading admin dashboard...
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
              ADMIN PANEL
            </Text>
          </View>

          <Pressable
            style={styles.headerIcon}
            onPress={handleRefresh}
            disabled={refreshing}
          >
            {refreshing ? (
              <ActivityIndicator
                size="small"
                color="#155EEF"
              />
            ) : (
              <Ionicons
                name="refresh-outline"
                size={23}
                color="#155EEF"
              />
            )}
          </Pressable>
        </View>

        {/* GREETING */}

        <Text style={styles.greeting}>
          Welcome,
        </Text>

        <Text style={styles.heading}>
          {user?.name || "Administrator"}
        </Text>

        <Text style={styles.subtitle}>
          Monitor and manage the Smart Laundry platform.
        </Text>

        {/* HERO */}

        <View style={styles.heroCard}>
          <View style={styles.heroContent}>
            <Text style={styles.heroSmall}>
              SYSTEM CONTROL
            </Text>

            <Text style={styles.heroTitle}>
              Everything in one place.
            </Text>

            <Text style={styles.heroText}>
              Manage customers, riders, laundry partners
              and orders from the administration panel.
            </Text>
          </View>

          <View style={styles.heroIcon}>
            <Ionicons
              name="shield-checkmark-outline"
              size={34}
              color="#155EEF"
            />
          </View>
        </View>

        {/* PLATFORM OVERVIEW */}

        <Text style={styles.sectionTitle}>
          Platform Overview
        </Text>

        <View style={styles.statsGrid}>
          <Pressable
            style={styles.statCard}
            onPress={() =>
              router.push("/admin/users")
            }
          >
            <View style={styles.statIconBlue}>
              <Ionicons
                name="people-outline"
                size={22}
                color="#155EEF"
              />
            </View>

            <Text style={styles.statNumber}>
              {dashboard.totalCustomers}
            </Text>

            <Text style={styles.statLabel}>
              Customers
            </Text>
          </Pressable>

          <Pressable
            style={styles.statCard}
            onPress={() =>
              router.push("/admin/riders")
            }
          >
            <View style={styles.statIconYellow}>
              <Ionicons
                name="bicycle-outline"
                size={22}
                color="#155EEF"
              />
            </View>

            <Text style={styles.statNumber}>
              {dashboard.totalRiders}
            </Text>

            <Text style={styles.statLabel}>
              Riders
            </Text>
          </Pressable>

          <Pressable
            style={styles.statCard}
            onPress={() =>
              router.push("/admin/partners")
            }
          >
            <View style={styles.statIconGreen}>
              <Ionicons
                name="storefront-outline"
                size={22}
                color="#155EEF"
              />
            </View>

            <Text style={styles.statNumber}>
              {dashboard.totalPartners}
            </Text>

            <Text style={styles.statLabel}>
              Partners
            </Text>
          </Pressable>

          <Pressable
            style={styles.statCard}
            onPress={() =>
              router.push("/admin/orders")
            }
          >
            <View style={styles.statIconPurple}>
              <Ionicons
                name="receipt-outline"
                size={22}
                color="#155EEF"
              />
            </View>

            <Text style={styles.statNumber}>
              {dashboard.totalOrders}
            </Text>

            <Text style={styles.statLabel}>
              Orders
            </Text>
          </Pressable>
        </View>

        {/* APPROVALS */}

        <Text style={styles.sectionTitle}>
          Pending Approvals
        </Text>

        <View style={styles.approvalRow}>
          <Pressable
            style={styles.approvalCard}
            onPress={() =>
              router.push("/admin/riders")
            }
          >
            <View style={styles.approvalIcon}>
              <Ionicons
                name="bicycle-outline"
                size={23}
                color="#155EEF"
              />
            </View>

            <View style={styles.approvalContent}>
              <Text style={styles.approvalNumber}>
                {dashboard.pendingRiders}
              </Text>

              <Text style={styles.approvalTitle}>
                Rider Approvals
              </Text>

              <Text style={styles.approvalText}>
                Review pending rider verification.
              </Text>
            </View>

            <Ionicons
              name="chevron-forward"
              size={20}
              color="#155EEF"
            />
          </Pressable>

          <Pressable
            style={styles.approvalCard}
            onPress={() =>
              router.push("/admin/partners")
            }
          >
            <View style={styles.approvalIconYellow}>
              <Ionicons
                name="storefront-outline"
                size={23}
                color="#155EEF"
              />
            </View>

            <View style={styles.approvalContent}>
              <Text style={styles.approvalNumber}>
                {dashboard.pendingPartners}
              </Text>

              <Text style={styles.approvalTitle}>
                Partner Approvals
              </Text>

              <Text style={styles.approvalText}>
                Review pending laundry businesses.
              </Text>
            </View>

            <Ionicons
              name="chevron-forward"
              size={20}
              color="#155EEF"
            />
          </Pressable>
        </View>

        {/* QUICK MANAGEMENT */}

        <Text style={styles.sectionTitle}>
          Quick Management
        </Text>

        <Pressable
          style={styles.actionCard}
          onPress={() =>
            router.push("/admin/users")
          }
        >
          <View style={styles.actionIcon}>
            <Ionicons
              name="people-outline"
              size={23}
              color="#155EEF"
            />
          </View>

          <View style={styles.actionContent}>
            <Text style={styles.actionTitle}>
              Manage Users
            </Text>

            <Text style={styles.actionText}>
              Review customer accounts and account status.
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
            router.push("/admin/orders")
          }
        >
          <View style={styles.actionIconYellow}>
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
              Monitor orders across the entire platform.
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
            router.push("/admin/riders")
          }
        >
          <View style={styles.actionIcon}>
            <Ionicons
              name="bicycle-outline"
              size={23}
              color="#155EEF"
            />
          </View>

          <View style={styles.actionContent}>
            <Text style={styles.actionTitle}>
              Manage Riders
            </Text>

            <Text style={styles.actionText}>
              Verify riders and review delivery accounts.
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
            router.push("/admin/partners")
          }
        >
          <View style={styles.actionIconYellow}>
            <Ionicons
              name="storefront-outline"
              size={23}
              color="#155EEF"
            />
          </View>

          <View style={styles.actionContent}>
            <Text style={styles.actionTitle}>
              Manage Partners
            </Text>

            <Text style={styles.actionText}>
              Review and manage laundry businesses.
            </Text>
          </View>

          <Ionicons
            name="chevron-forward"
            size={20}
            color="#155EEF"
          />
        </Pressable>

        {/* ADMIN ACCOUNT */}

        <View style={styles.adminCard}>
          <View style={styles.adminIcon}>
            <Ionicons
              name="shield-outline"
              size={22}
              color="#155EEF"
            />
          </View>

          <View style={styles.adminContent}>
            <Text style={styles.adminName}>
              {user?.name || "Administrator"}
            </Text>

            <Text style={styles.adminEmail}>
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

      {/* BOTTOM NAV */}

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
            router.replace("/admin/users")
          }
        >
          <Ionicons
            name="people-outline"
            size={22}
            color="#8A93A4"
          />

          <Text style={styles.navText}>
            Users
          </Text>
        </Pressable>

        <Pressable
          style={styles.navItem}
          onPress={() =>
            router.replace("/admin/orders")
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
            router.replace("/admin/profile")
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
    marginTop: 3,
    fontSize: 10,
    color: "#8A93A4",
    fontWeight: "800",
    letterSpacing: 1,
  },

  headerIcon: {
    width: 46,
    height: 46,
    borderRadius: 15,
    backgroundColor: "#FFF4C7",
    alignItems: "center",
    justifyContent: "center",
  },

  greeting: {
    fontSize: 14,
    color: "#6B7280",
  },

  heading: {
    marginTop: 4,
    fontSize: 29,
    lineHeight: 35,
    fontWeight: "900",
    color: "#17233C",
  },

  subtitle: {
    marginTop: 5,
    marginBottom: 22,
    fontSize: 12,
    color: "#8A93A4",
  },

  heroCard: {
    backgroundColor: "#155EEF",
    borderRadius: 22,
    padding: 20,
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 27,
  },

  heroContent: {
    flex: 1,
  },

  heroSmall: {
    fontSize: 10,
    fontWeight: "900",
    color: "#FFF4C7",
  },

  heroTitle: {
    marginTop: 6,
    fontSize: 21,
    fontWeight: "900",
    color: "#FFFFFF",
  },

  heroText: {
    marginTop: 7,
    maxWidth: 260,
    fontSize: 11,
    lineHeight: 17,
    color: "#DDE8FF",
  },

  heroIcon: {
    width: 56,
    height: 56,
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

  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
    marginBottom: 27,
  },

  statCard: {
    width: "48%",
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

  statIconGreen: {
    width: 43,
    height: 43,
    borderRadius: 14,
    backgroundColor: "#EEF8F2",
    alignItems: "center",
    justifyContent: "center",
  },

  statIconPurple: {
    width: 43,
    height: 43,
    borderRadius: 14,
    backgroundColor: "#F2EEFF",
    alignItems: "center",
    justifyContent: "center",
  },

  statNumber: {
    marginTop: 12,
    fontSize: 25,
    fontWeight: "900",
    color: "#17233C",
  },

  statLabel: {
    marginTop: 3,
    fontSize: 10,
    color: "#6B7280",
  },

  approvalRow: {
    gap: 12,
    marginBottom: 27,
  },

  approvalCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E5EAF2",
    borderRadius: 18,
    padding: 16,
  },

  approvalIcon: {
    width: 47,
    height: 47,
    borderRadius: 14,
    backgroundColor: "#EAF0FF",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },

  approvalIconYellow: {
    width: 47,
    height: 47,
    borderRadius: 14,
    backgroundColor: "#FFF4C7",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },

  approvalContent: {
    flex: 1,
  },

  approvalNumber: {
    fontSize: 20,
    fontWeight: "900",
    color: "#155EEF",
  },

  approvalTitle: {
    marginTop: 2,
    fontSize: 13,
    fontWeight: "900",
    color: "#17233C",
  },

  approvalText: {
    marginTop: 3,
    fontSize: 10,
    color: "#6B7280",
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
    alignItems: "center",
    justifyContent: "center",
    marginRight: 13,
  },

  actionIconYellow: {
    width: 47,
    height: 47,
    borderRadius: 14,
    backgroundColor: "#FFF4C7",
    alignItems: "center",
    justifyContent: "center",
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
    marginTop: 4,
    fontSize: 11,
    lineHeight: 16,
    color: "#6B7280",
  },

  adminCard: {
    marginTop: 14,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFF4C7",
    borderRadius: 18,
    padding: 16,
  },

  adminIcon: {
    width: 43,
    height: 43,
    borderRadius: 14,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },

  adminContent: {
    flex: 1,
  },

  adminName: {
    fontSize: 14,
    fontWeight: "900",
    color: "#17233C",
  },

  adminEmail: {
    marginTop: 3,
    fontSize: 11,
    color: "#6B7280",
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