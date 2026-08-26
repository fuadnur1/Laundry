import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { router } from "expo-router";
import { useEffect, useMemo, useState } from "react";
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

type AppUser = {
  id: string;
  role_id: number;
  name: string;
  email: string;
  phone?: string | null;
  account_status?: string | null;
};

export default function AdminUsersScreen() {
  const [users, setUsers] = useState<AppUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<
    "ALL" | "CUSTOMER" | "RIDER" | "PARTNER" | "ADMIN"
  >("ALL");

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

      await fetchUsers();
    } catch (error) {
      console.log("Admin users init error:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
      const response = await axios.get(
        `${API_URL}/admin/users`
      );

      setUsers(response.data.users || []);
    } catch (error: any) {
      console.log(
        "Admin users fetch error:",
        error.response?.data || error.message
      );

      Alert.alert(
        "Could not load users",
        error.response?.data?.message ||
          "Unable to fetch users."
      );
    }
  };

  const getRoleName = (roleId: number) => {
    if (roleId === 1) return "CUSTOMER";
    if (roleId === 2) return "RIDER";
    if (roleId === 3) return "PARTNER";
    if (roleId === 4) return "ADMIN";

    return "UNKNOWN";
  };

  const getRoleIcon = (roleId: number) => {
    if (roleId === 1) return "person-outline";
    if (roleId === 2) return "bicycle-outline";
    if (roleId === 3) return "storefront-outline";
    if (roleId === 4) return "shield-outline";

    return "help-circle-outline";
  };

  const filteredUsers = useMemo(() => {
    if (filter === "ALL") return users;

    return users.filter(
      (user) => getRoleName(user.role_id) === filter
    );
  }, [users, filter]);

  const totalCustomers = users.filter(
    (u) => Number(u.role_id) === 1
  ).length;

  const totalRiders = users.filter(
    (u) => Number(u.role_id) === 2
  ).length;

  const totalPartners = users.filter(
    (u) => Number(u.role_id) === 3
  ).length;

  const totalAdmins = users.filter(
    (u) => Number(u.role_id) === 4
  ).length;

  if (loading) {
    return (
      <View style={styles.loadingScreen}>
        <ActivityIndicator
          size="large"
          color="#155EEF"
        />

        <Text style={styles.loadingText}>
          Loading users...
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
              USER MANAGEMENT
            </Text>
          </View>

          <Pressable
            style={styles.headerIcon}
            onPress={fetchUsers}
          >
            <Ionicons
              name="refresh-outline"
              size={23}
              color="#155EEF"
            />
          </Pressable>
        </View>

        <Text style={styles.title}>
          Platform Users
        </Text>

        <Text style={styles.subtitle}>
          View customers, riders, partners and
          administrators.
        </Text>

        <View style={styles.statsGrid}>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>
              {totalCustomers}
            </Text>

            <Text style={styles.statLabel}>
              Customers
            </Text>
          </View>

          <View style={styles.statCard}>
            <Text style={styles.statNumber}>
              {totalRiders}
            </Text>

            <Text style={styles.statLabel}>
              Riders
            </Text>
          </View>

          <View style={styles.statCard}>
            <Text style={styles.statNumber}>
              {totalPartners}
            </Text>

            <Text style={styles.statLabel}>
              Partners
            </Text>
          </View>

          <View style={styles.statCard}>
            <Text style={styles.statNumber}>
              {totalAdmins}
            </Text>

            <Text style={styles.statLabel}>
              Admins
            </Text>
          </View>
        </View>

        <Text style={styles.sectionTitle}>
          Filter Users
        </Text>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.filterScroll}
        >
          {[
            "ALL",
            "CUSTOMER",
            "RIDER",
            "PARTNER",
            "ADMIN",
          ].map((item) => (
            <Pressable
              key={item}
              style={[
                styles.filterButton,
                filter === item &&
                  styles.filterButtonActive,
              ]}
              onPress={() =>
                setFilter(item as any)
              }
            >
              <Text
                style={[
                  styles.filterText,
                  filter === item &&
                    styles.filterTextActive,
                ]}
              >
                {item}
              </Text>
            </Pressable>
          ))}
        </ScrollView>

        <Text style={styles.sectionTitle}>
          Users ({filteredUsers.length})
        </Text>

        {filteredUsers.length === 0 ? (
          <View style={styles.emptyCard}>
            <Ionicons
              name="people-outline"
              size={34}
              color="#8A93A4"
            />

            <Text style={styles.emptyTitle}>
              No users found
            </Text>

            <Text style={styles.emptyText}>
              There are no users in this category.
            </Text>
          </View>
        ) : (
          filteredUsers.map((item) => (
            <View
              key={item.id}
              style={styles.userCard}
            >
              <View style={styles.avatar}>
                <Ionicons
                  name={
                    getRoleIcon(
                      Number(item.role_id)
                    ) as any
                  }
                  size={23}
                  color="#155EEF"
                />
              </View>

              <View style={styles.userContent}>
                <View style={styles.userTop}>
                  <Text style={styles.userName}>
                    {item.name}
                  </Text>

                  <View style={styles.roleBadge}>
                    <Text style={styles.roleBadgeText}>
                      {getRoleName(
                        Number(item.role_id)
                      )}
                    </Text>
                  </View>
                </View>

                <Text style={styles.email}>
                  {item.email}
                </Text>

                {item.phone ? (
                  <Text style={styles.phone}>
                    {item.phone}
                  </Text>
                ) : null}

                <View style={styles.statusRow}>
                  <View
                    style={[
                      styles.statusDot,
                      item.account_status === "ACTIVE"
                        ? styles.activeDot
                        : styles.inactiveDot,
                    ]}
                  />

                  <Text style={styles.statusText}>
                    {item.account_status ||
                      "UNKNOWN"}
                  </Text>
                </View>
              </View>
            </View>
          ))
        )}
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

        <Pressable style={styles.navItem}>
          <Ionicons
            name="people"
            size={22}
            color="#155EEF"
          />

          <Text style={styles.activeNav}>
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
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F7F9FC",
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
    color: "#155EEF",
    fontSize: 20,
    fontWeight: "900",
  },

  roleText: {
    marginTop: 3,
    color: "#8A93A4",
    fontSize: 10,
    fontWeight: "800",
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

  title: {
    fontSize: 28,
    fontWeight: "900",
    color: "#17233C",
  },

  subtitle: {
    marginTop: 5,
    marginBottom: 22,
    fontSize: 12,
    color: "#8A93A4",
  },

  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
    marginBottom: 26,
  },

  statCard: {
    width: "48%",
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E5EAF2",
    borderRadius: 18,
    padding: 16,
  },

  statNumber: {
    fontSize: 24,
    fontWeight: "900",
    color: "#155EEF",
  },

  statLabel: {
    marginTop: 4,
    fontSize: 11,
    color: "#6B7280",
  },

  sectionTitle: {
    marginBottom: 12,
    fontSize: 17,
    fontWeight: "900",
    color: "#17233C",
  },

  filterScroll: {
    marginBottom: 25,
  },

  filterButton: {
    paddingHorizontal: 15,
    paddingVertical: 9,
    borderRadius: 20,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E5EAF2",
    marginRight: 8,
  },

  filterButtonActive: {
    backgroundColor: "#155EEF",
    borderColor: "#155EEF",
  },

  filterText: {
    fontSize: 11,
    fontWeight: "800",
    color: "#6B7280",
  },

  filterTextActive: {
    color: "#FFFFFF",
  },

  userCard: {
    flexDirection: "row",
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E5EAF2",
    borderRadius: 18,
    padding: 16,
    marginBottom: 12,
  },

  avatar: {
    width: 48,
    height: 48,
    borderRadius: 15,
    backgroundColor: "#EAF0FF",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 13,
  },

  userContent: {
    flex: 1,
  },

  userTop: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 10,
  },

  userName: {
    flex: 1,
    fontSize: 14,
    fontWeight: "900",
    color: "#17233C",
  },

  roleBadge: {
    backgroundColor: "#FFF4C7",
    borderRadius: 20,
    paddingHorizontal: 9,
    paddingVertical: 4,
  },

  roleBadgeText: {
    fontSize: 8,
    fontWeight: "900",
    color: "#155EEF",
  },

  email: {
    marginTop: 5,
    fontSize: 11,
    color: "#6B7280",
  },

  phone: {
    marginTop: 2,
    fontSize: 10,
    color: "#8A93A4",
  },

  statusRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 9,
  },

  statusDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    marginRight: 6,
  },

  activeDot: {
    backgroundColor: "#20A464",
  },

  inactiveDot: {
    backgroundColor: "#D14343",
  },

  statusText: {
    fontSize: 9,
    fontWeight: "800",
    color: "#6B7280",
  },

  emptyCard: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E5EAF2",
    borderRadius: 18,
    padding: 28,
    alignItems: "center",
  },

  emptyTitle: {
    marginTop: 10,
    fontSize: 15,
    fontWeight: "900",
    color: "#17233C",
  },

  emptyText: {
    marginTop: 4,
    fontSize: 11,
    color: "#8A93A4",
    textAlign: "center",
  },

  bottomNav: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
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