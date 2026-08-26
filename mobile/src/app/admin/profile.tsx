import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
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

export default function AdminProfileScreen() {
  const [user, setUser] = useState<any>(null);
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

      if (Number(parsedUser.role_id) !== 4) {
        Alert.alert("Access Denied", "Admin access only.");
        router.replace("/login");
        return;
      }

      setUser(parsedUser);
    } catch (error) {
      console.log("Admin profile init error:", error);
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

  if (loading) {
    return (
      <View style={styles.loadingScreen}>
        <ActivityIndicator
          size="large"
          color="#155EEF"
        />

        <Text style={styles.loadingText}>
          Loading admin profile...
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
              ADMIN PROFILE
            </Text>
          </View>

          <View style={styles.headerIcon}>
            <Ionicons
              name="shield-checkmark-outline"
              size={24}
              color="#155EEF"
            />
          </View>
        </View>

        <View style={styles.heroCard}>
          <View style={styles.avatar}>
            <Ionicons
              name="person-outline"
              size={34}
              color="#155EEF"
            />
          </View>

          <Text style={styles.name}>
            {user?.name || "Administrator"}
          </Text>

          <Text style={styles.email}>
            {user?.email || ""}
          </Text>

          <View style={styles.roleBadge}>
            <Ionicons
              name="shield-checkmark-outline"
              size={15}
              color="#155EEF"
            />

            <Text style={styles.roleBadgeText}>
              SYSTEM ADMINISTRATOR
            </Text>
          </View>
        </View>

        <Text style={styles.sectionTitle}>
          Account Information
        </Text>

        <View style={styles.card}>
          <InfoRow
            icon="person-outline"
            label="Full Name"
            value={user?.name || "Not provided"}
          />

          <InfoRow
            icon="mail-outline"
            label="Email"
            value={user?.email || "Not provided"}
          />

          <InfoRow
            icon="call-outline"
            label="Phone"
            value={user?.phone || "Not provided"}
          />

          <InfoRow
            icon="key-outline"
            label="Role ID"
            value={String(user?.role_id || 4)}
            last
          />
        </View>

        <Text style={styles.sectionTitle}>
          Administrative Access
        </Text>

        <View style={styles.permissionCard}>
          <PermissionRow
            icon="people-outline"
            title="User Management"
            text="View customers, riders, partners and administrators."
          />

          <PermissionRow
            icon="receipt-outline"
            title="Order Monitoring"
            text="Review all laundry orders across the platform."
          />

          <PermissionRow
            icon="bicycle-outline"
            title="Rider Verification"
            text="Review and approve delivery rider profiles."
          />

          <PermissionRow
            icon="storefront-outline"
            title="Partner Verification"
            text="Review and approve laundry business profiles."
            last
          />
        </View>

        <View style={styles.securityCard}>
          <View style={styles.securityIcon}>
            <Ionicons
              name="lock-closed-outline"
              size={22}
              color="#155EEF"
            />
          </View>

          <View style={styles.securityContent}>
            <Text style={styles.securityTitle}>
              Administrator Account
            </Text>

            <Text style={styles.securityText}>
              This account has elevated access to Smart
              Laundry administrative features.
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
            router.replace("/admin/home")
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
          size={19}
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

function PermissionRow({
  icon,
  title,
  text,
  last,
}: {
  icon: any;
  title: string;
  text: string;
  last?: boolean;
}) {
  return (
    <View
      style={[
        styles.permissionRow,
        last && styles.permissionRowLast,
      ]}
    >
      <View style={styles.permissionIcon}>
        <Ionicons
          name={icon}
          size={20}
          color="#155EEF"
        />
      </View>

      <View style={styles.permissionContent}>
        <Text style={styles.permissionTitle}>
          {title}
        </Text>

        <Text style={styles.permissionText}>
          {text}
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
    marginTop: 3,
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 1,
    color: "#8A93A4",
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
    width: 78,
    height: 78,
    borderRadius: 24,
    backgroundColor: "#FFF4C7",
    alignItems: "center",
    justifyContent: "center",
  },

  name: {
    marginTop: 14,
    fontSize: 22,
    fontWeight: "900",
    color: "#FFFFFF",
  },

  email: {
    marginTop: 4,
    fontSize: 11,
    color: "#DDE8FF",
  },

  roleBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: 15,
    backgroundColor: "#FFF4C7",
    borderRadius: 20,
    paddingHorizontal: 11,
    paddingVertical: 7,
  },

  roleBadgeText: {
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
    width: 41,
    height: 41,
    borderRadius: 13,
    backgroundColor: "#EAF0FF",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },

  infoContent: {
    flex: 1,
  },

  infoLabel: {
    fontSize: 9,
    fontWeight: "800",
    color: "#8A93A4",
  },

  infoValue: {
    marginTop: 3,
    fontSize: 12,
    fontWeight: "800",
    color: "#17233C",
  },

  permissionCard: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E5EAF2",
    borderRadius: 19,
    padding: 16,
    marginBottom: 25,
  },

  permissionRow: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#EEF1F5",
    paddingBottom: 14,
    marginBottom: 14,
  },

  permissionRowLast: {
    borderBottomWidth: 0,
    paddingBottom: 0,
    marginBottom: 0,
  },

  permissionIcon: {
    width: 42,
    height: 42,
    borderRadius: 13,
    backgroundColor: "#FFF4C7",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },

  permissionContent: {
    flex: 1,
  },

  permissionTitle: {
    fontSize: 12,
    fontWeight: "900",
    color: "#17233C",
  },

  permissionText: {
    marginTop: 4,
    fontSize: 10,
    lineHeight: 15,
    color: "#6B7280",
  },

  securityCard: {
    flexDirection: "row",
    backgroundColor: "#FFF4C7",
    borderRadius: 18,
    padding: 16,
    marginBottom: 20,
  },

  securityIcon: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },

  securityContent: {
    flex: 1,
  },

  securityTitle: {
    fontSize: 13,
    fontWeight: "900",
    color: "#17233C",
  },

  securityText: {
    marginTop: 4,
    fontSize: 10,
    lineHeight: 15,
    color: "#6B7280",
  },

  logoutButton: {
    flexDirection: "row",
    gap: 8,
    alignItems: "center",
    justifyContent: "center",
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
    minWidth: 62,
    alignItems: "center",
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