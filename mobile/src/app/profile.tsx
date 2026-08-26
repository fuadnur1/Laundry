import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ScrollView,
} from "react-native";
import { router } from "expo-router";
import axios from "axios";

export default function ProfileScreen() {
  const [user, setUser] = useState<any>(null);
  const [address, setAddress] = useState<any>(null);

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      const storedUser = await AsyncStorage.getItem("user");

      if (!storedUser) {
        router.replace("/login");
        return;
      }

      const parsedUser = JSON.parse(storedUser);
      setUser(parsedUser);

      const response = await axios.get(
        `http://localhost:5000/api/v1/addresses/${parsedUser.id}`
      );

      const addresses = response.data.data || [];

      const defaultAddress =
        addresses.find((item: any) => item.is_default) ||
        addresses[0] ||
        null;

      setAddress(defaultAddress);
    } catch (error) {
      console.log("Profile error:", error);
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

  const username =
    user?.email?.split("@")[0] || "Customer";

  return (
    <View style={styles.screen}>
      <ScrollView
        contentContainerStyle={styles.container}
        showsVerticalScrollIndicator={false}
      >
        {/* HEADER */}

        <View style={styles.header}>
          <View>
            <Text style={styles.brand}>SMART LAUNDRY</Text>
            <Text style={styles.tagline}>
              Laundry in One Tap
            </Text>
          </View>

          <View style={styles.settingsIcon}>
            <Ionicons
              name="settings-outline"
              size={22}
              color="#155EEF"
            />
          </View>
        </View>

        {/* PROFILE */}

        <View style={styles.profileHeader}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {username.charAt(0).toUpperCase()}
            </Text>
          </View>

          <Text style={styles.name}>
            {username}
          </Text>

          <Text style={styles.email}>
            {user?.email}
          </Text>

          <View style={styles.customerBadge}>
            <Ionicons
              name="person-circle-outline"
              size={14}
              color="#8A6400"
            />

            <Text style={styles.customerBadgeText}>
              CUSTOMER
            </Text>
          </View>
        </View>

        {/* ACCOUNT */}

        <Text style={styles.sectionTitle}>
          Account Information
        </Text>

        <View style={styles.card}>
          <View style={styles.infoRow}>
            <View style={styles.iconBox}>
              <Ionicons
                name="mail-outline"
                size={21}
                color="#155EEF"
              />
            </View>

            <View style={styles.infoContent}>
              <Text style={styles.label}>
                Email
              </Text>

              <Text style={styles.value}>
                {user?.email || "Not available"}
              </Text>
            </View>
          </View>
        </View>

        {/* ADDRESS */}

        <Text style={styles.sectionTitle}>
          Saved Address
        </Text>

        <View style={styles.card}>
          <View style={styles.infoRow}>
            <View style={styles.iconBoxYellow}>
              <Ionicons
                name="location-outline"
                size={22}
                color="#155EEF"
              />
            </View>

            <View style={styles.infoContent}>
              <Text style={styles.label}>
                {address?.label || "Address"}
              </Text>

              <Text style={styles.value}>
                {address
                  ? `${address.address_line}, ${address.area}, ${address.city}`
                  : "No saved address found"}
              </Text>

              {address?.is_default && (
                <View style={styles.defaultRow}>
                  <Ionicons
                    name="checkmark-circle"
                    size={14}
                    color="#155EEF"
                  />

                  <Text style={styles.defaultText}>
                    Default Address
                  </Text>
                </View>
              )}
            </View>
          </View>
        </View>

        {/* SMART LAUNDRY INFO */}

        <View style={styles.brandCard}>
          <View style={styles.brandCardText}>
            <Text style={styles.brandCardTitle}>
              Your Laundry,
              {"\n"}
              Our Responsibility.
            </Text>

            <Text style={styles.brandCardSubtitle}>
              Fast, reliable and transparent laundry care.
            </Text>
          </View>

          <View style={styles.brandCardIcon}>
            <Ionicons
              name="shirt-outline"
              size={36}
              color="#155EEF"
            />
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
            color="#102A56"
          />

          <Text style={styles.logoutText}>
            Logout
          </Text>
        </Pressable>

        <Text style={styles.version}>
          Smart Laundry System
        </Text>
      </ScrollView>

      {/* BOTTOM NAV */}

      <View style={styles.bottomNav}>
        <Pressable
          style={styles.navItem}
          onPress={() => router.replace("/home")}
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
          onPress={() => router.replace("/orders")}
        >
          <Ionicons
            name="cube-outline"
            size={22}
            color="#8A93A4"
          />
          <Text style={styles.navText}>
            Orders
          </Text>
        </Pressable>

        <Pressable
          style={styles.navItem}
          onPress={() => router.replace("/support")}
        >
          <Ionicons
            name="chatbubble-ellipses-outline"
            size={22}
            color="#8A93A4"
          />
          <Text style={styles.navText}>
            Support
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

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#F7F9FC",
  },

  container: {
    padding: 22,
    paddingTop: 48,
    paddingBottom: 120,
  },

  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 30,
  },

  brand: {
    fontSize: 20,
    fontWeight: "900",
    color: "#155EEF",
  },

  tagline: {
    fontSize: 12,
    color: "#6B7280",
    marginTop: 3,
  },

  settingsIcon: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E5EAF2",
    justifyContent: "center",
    alignItems: "center",
  },

  profileHeader: {
    alignItems: "center",
    marginBottom: 32,
  },

  avatar: {
    width: 86,
    height: 86,
    borderRadius: 43,
    backgroundColor: "#155EEF",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 14,
  },

  avatarText: {
    color: "#FFFFFF",
    fontSize: 34,
    fontWeight: "900",
  },

  name: {
    fontSize: 22,
    fontWeight: "900",
    color: "#17233C",
    textTransform: "capitalize",
  },

  email: {
    marginTop: 4,
    fontSize: 13,
    color: "#6B7280",
  },

  customerBadge: {
    marginTop: 11,
    backgroundColor: "#FFF4C7",
    paddingHorizontal: 13,
    paddingVertical: 6,
    borderRadius: 20,
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },

  customerBadgeText: {
    color: "#8A6400",
    fontSize: 10,
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
    borderRadius: 18,
    padding: 17,
    marginBottom: 24,
  },

  infoRow: {
    flexDirection: "row",
    alignItems: "center",
  },

  iconBox: {
    width: 45,
    height: 45,
    borderRadius: 14,
    backgroundColor: "#EAF0FF",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 13,
  },

  iconBoxYellow: {
    width: 45,
    height: 45,
    borderRadius: 14,
    backgroundColor: "#FFF4C7",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 13,
  },

  infoContent: {
    flex: 1,
  },

  label: {
    fontSize: 11,
    color: "#8A93A4",
    marginBottom: 4,
  },

  value: {
    fontSize: 14,
    fontWeight: "700",
    color: "#17233C",
    lineHeight: 20,
  },

  defaultRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    marginTop: 5,
  },

  defaultText: {
    fontSize: 11,
    color: "#155EEF",
    fontWeight: "800",
  },

  brandCard: {
    backgroundColor: "#155EEF",
    borderRadius: 22,
    padding: 20,
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 22,
  },

  brandCardText: {
    flex: 1,
  },

  brandCardTitle: {
    fontSize: 19,
    lineHeight: 24,
    fontWeight: "900",
    color: "#FFFFFF",
  },

  brandCardSubtitle: {
    fontSize: 12,
    lineHeight: 18,
    color: "#DDE8FF",
    marginTop: 7,
  },

  brandCardIcon: {
    width: 62,
    height: 62,
    borderRadius: 20,
    backgroundColor: "#FFF4C7",
    justifyContent: "center",
    alignItems: "center",
    marginLeft: 12,
  },

  logoutButton: {
    backgroundColor: "#FFF4C7",
    borderRadius: 14,
    paddingVertical: 15,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#F1D86A",
    flexDirection: "row",
    gap: 8,
  },

  logoutText: {
    color: "#102A56",
    fontSize: 15,
    fontWeight: "900",
  },

  version: {
    textAlign: "center",
    color: "#A0A7B4",
    fontSize: 11,
    marginTop: 18,
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