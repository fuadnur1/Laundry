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

type OrderItem = {
  id: string;
  service_name_snapshot?: string | null;
  quantity?: number | null;
  unit_price_snapshot?: number | null;
  line_total?: number | null;
};

type Order = {
  id: string;
  customer_id?: string | null;
  partner_id?: string | null;
  status?: string | null;
  total_amount?: number | null;
  created_at?: string | null;
  pickup_address_snapshot?: any;
  delivery_address_snapshot?: any;
  order_items?: OrderItem[];
};

type FilterType =
  | "ALL"
  | "PLACED"
  | "PICKED_UP"
  | "CLEANING"
  | "OUT_FOR_DELIVERY"
  | "DELIVERED"
  | "CANCELLED";

export default function AdminOrdersScreen() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<FilterType>("ALL");

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

      await fetchOrders();
    } catch (error) {
      console.log("Admin orders init error:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchOrders = async () => {
    try {
      const response = await axios.get(
        `${API_URL}/admin/orders`
      );

      setOrders(response.data.orders || []);
    } catch (error: any) {
      console.log(
        "Admin orders fetch error:",
        error.response?.data || error.message
      );

      Alert.alert(
        "Could not load orders",
        error.response?.data?.message ||
          "Unable to fetch platform orders."
      );
    }
  };

  const filteredOrders = useMemo(() => {
    if (filter === "ALL") return orders;

    return orders.filter(
      (order) => order.status === filter
    );
  }, [orders, filter]);

  const totalOrders = orders.length;

  const activeOrders = orders.filter(
    (order) =>
      order.status !== "DELIVERED" &&
      order.status !== "CANCELLED"
  ).length;

  const deliveredOrders = orders.filter(
    (order) => order.status === "DELIVERED"
  ).length;

  const cancelledOrders = orders.filter(
    (order) => order.status === "CANCELLED"
  ).length;

  const formatDate = (value?: string | null) => {
    if (!value) return "Not available";

    try {
      return new Date(value).toLocaleString();
    } catch {
      return value;
    }
  };

  const formatMoney = (value?: number | null) => {
    return `৳${Number(value || 0).toFixed(2)}`;
  };

  const getStatusLabel = (status?: string | null) => {
    return (status || "UNKNOWN").replaceAll("_", " ");
  };

  const getAddressText = (snapshot: any) => {
    if (!snapshot) return "Not available";

    if (typeof snapshot === "string") {
      return snapshot;
    }

    return (
      snapshot.address ||
      snapshot.address_line ||
      snapshot.full_address ||
      snapshot.area ||
      snapshot.city ||
      "Address available"
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingScreen}>
        <ActivityIndicator
          size="large"
          color="#155EEF"
        />

        <Text style={styles.loadingText}>
          Loading orders...
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
              ORDER MANAGEMENT
            </Text>
          </View>

          <Pressable
            style={styles.headerIcon}
            onPress={fetchOrders}
          >
            <Ionicons
              name="refresh-outline"
              size={23}
              color="#155EEF"
            />
          </Pressable>
        </View>

        <Text style={styles.title}>
          Platform Orders
        </Text>

        <Text style={styles.subtitle}>
          Monitor all laundry orders across the system.
        </Text>

        <View style={styles.statsGrid}>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>
              {totalOrders}
            </Text>

            <Text style={styles.statLabel}>
              Total
            </Text>
          </View>

          <View style={styles.statCard}>
            <Text style={styles.statNumber}>
              {activeOrders}
            </Text>

            <Text style={styles.statLabel}>
              Active
            </Text>
          </View>

          <View style={styles.statCard}>
            <Text style={styles.statNumber}>
              {deliveredOrders}
            </Text>

            <Text style={styles.statLabel}>
              Delivered
            </Text>
          </View>

          <View style={styles.statCard}>
            <Text style={styles.statNumber}>
              {cancelledOrders}
            </Text>

            <Text style={styles.statLabel}>
              Cancelled
            </Text>
          </View>
        </View>

        <Text style={styles.sectionTitle}>
          Filter Orders
        </Text>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.filterScroll}
        >
          {[
            "ALL",
            "PLACED",
            "PICKED_UP",
            "CLEANING",
            "OUT_FOR_DELIVERY",
            "DELIVERED",
            "CANCELLED",
          ].map((item) => (
            <Pressable
              key={item}
              style={[
                styles.filterButton,
                filter === item &&
                  styles.filterButtonActive,
              ]}
              onPress={() =>
                setFilter(item as FilterType)
              }
            >
              <Text
                style={[
                  styles.filterText,
                  filter === item &&
                    styles.filterTextActive,
                ]}
              >
                {item.replaceAll("_", " ")}
              </Text>
            </Pressable>
          ))}
        </ScrollView>

        <Text style={styles.sectionTitle}>
          Orders ({filteredOrders.length})
        </Text>

        {filteredOrders.length === 0 ? (
          <View style={styles.emptyCard}>
            <Ionicons
              name="receipt-outline"
              size={36}
              color="#8A93A4"
            />

            <Text style={styles.emptyTitle}>
              No orders found
            </Text>

            <Text style={styles.emptyText}>
              There are no orders in this category.
            </Text>
          </View>
        ) : (
          filteredOrders.map((order) => (
            <Pressable
              key={order.id}
              style={styles.orderCard}
              onPress={() =>
                router.push(
                  `/admin/order/${order.id}` as any
                )
              }
            >
              <View style={styles.orderTop}>
                <View style={styles.orderIcon}>
                  <Ionicons
                    name="receipt-outline"
                    size={22}
                    color="#155EEF"
                  />
                </View>

                <View style={styles.orderHeading}>
                  <Text style={styles.orderId}>
                    Order #{order.id.slice(0, 8)}
                  </Text>

                  <Text style={styles.orderDate}>
                    {formatDate(order.created_at)}
                  </Text>
                </View>

                <View style={styles.statusBadge}>
                  <Text style={styles.statusBadgeText}>
                    {getStatusLabel(order.status)}
                  </Text>
                </View>
              </View>

              <View style={styles.divider} />

              <View style={styles.infoRow}>
                <Ionicons
                  name="person-outline"
                  size={17}
                  color="#155EEF"
                />

                <View style={styles.infoContent}>
                  <Text style={styles.infoLabel}>
                    Customer
                  </Text>

                  <Text style={styles.infoValue}>
                    {order.customer_id
                      ? order.customer_id.slice(0, 12)
                      : "Not available"}
                  </Text>
                </View>
              </View>

              <View style={styles.infoRow}>
                <Ionicons
                  name="storefront-outline"
                  size={17}
                  color="#155EEF"
                />

                <View style={styles.infoContent}>
                  <Text style={styles.infoLabel}>
                    Partner
                  </Text>

                  <Text style={styles.infoValue}>
                    {order.partner_id
                      ? order.partner_id.slice(0, 12)
                      : "Not assigned"}
                  </Text>
                </View>
              </View>

              <View style={styles.infoRow}>
                <Ionicons
                  name="location-outline"
                  size={17}
                  color="#155EEF"
                />

                <View style={styles.infoContent}>
                  <Text style={styles.infoLabel}>
                    Pickup
                  </Text>

                  <Text style={styles.infoValue}>
                    {getAddressText(
                      order.pickup_address_snapshot
                    )}
                  </Text>
                </View>
              </View>

              <View style={styles.itemsSection}>
                <Text style={styles.itemsLabel}>
                  Items
                </Text>

                {order.order_items?.length ? (
                  order.order_items.map((item) => (
                    <View
                      key={item.id}
                      style={styles.itemRow}
                    >
                      <Text style={styles.itemName}>
                        {item.service_name_snapshot ||
                          "Laundry Service"}{" "}
                        × {item.quantity || 0}
                      </Text>

                      <Text style={styles.itemPrice}>
                        {formatMoney(item.line_total)}
                      </Text>
                    </View>
                  ))
                ) : (
                  <Text style={styles.noItemsText}>
                    No item details
                  </Text>
                )}
              </View>

              <View style={styles.totalRow}>
                <Text style={styles.totalLabel}>
                  Order Total
                </Text>

                <Text style={styles.totalValue}>
                  {formatMoney(order.total_amount)}
                </Text>
              </View>

              <View style={styles.viewRow}>
                <Text style={styles.viewText}>
                  View order details
                </Text>

                <Ionicons
                  name="chevron-forward"
                  size={19}
                  color="#155EEF"
                />
              </View>
            </Pressable>
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

        <Pressable style={styles.navItem}>
          <Ionicons
            name="receipt"
            size={22}
            color="#155EEF"
          />

          <Text style={styles.activeNav}>
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

  statNumber: {
    fontSize: 25,
    fontWeight: "900",
    color: "#155EEF",
  },

  statLabel: {
    marginTop: 3,
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
    paddingHorizontal: 14,
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
    fontSize: 10,
    fontWeight: "800",
    color: "#6B7280",
  },

  filterTextActive: {
    color: "#FFFFFF",
  },

  orderCard: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E5EAF2",
    borderRadius: 19,
    padding: 16,
    marginBottom: 14,
  },

  orderTop: {
    flexDirection: "row",
    alignItems: "center",
  },

  orderIcon: {
    width: 45,
    height: 45,
    borderRadius: 14,
    backgroundColor: "#EAF0FF",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },

  orderHeading: {
    flex: 1,
  },

  orderId: {
    fontSize: 14,
    fontWeight: "900",
    color: "#17233C",
  },

  orderDate: {
    marginTop: 3,
    fontSize: 9,
    color: "#8A93A4",
  },

  statusBadge: {
    backgroundColor: "#FFF4C7",
    borderRadius: 15,
    paddingHorizontal: 9,
    paddingVertical: 5,
  },

  statusBadgeText: {
    fontSize: 8,
    fontWeight: "900",
    color: "#155EEF",
  },

  divider: {
    height: 1,
    backgroundColor: "#EEF1F5",
    marginVertical: 14,
  },

  infoRow: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 11,
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
    marginTop: 2,
    fontSize: 11,
    color: "#17233C",
    fontWeight: "700",
  },

  itemsSection: {
    marginTop: 5,
    backgroundColor: "#F7F9FC",
    borderRadius: 14,
    padding: 12,
  },

  itemsLabel: {
    marginBottom: 7,
    fontSize: 10,
    fontWeight: "900",
    color: "#17233C",
  },

  itemRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 5,
    gap: 10,
  },

  itemName: {
    flex: 1,
    fontSize: 10,
    color: "#52617A",
  },

  itemPrice: {
    fontSize: 10,
    fontWeight: "800",
    color: "#17233C",
  },

  noItemsText: {
    fontSize: 10,
    color: "#8A93A4",
  },

  totalRow: {
    marginTop: 14,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  totalLabel: {
    fontSize: 12,
    fontWeight: "800",
    color: "#6B7280",
  },

  totalValue: {
    fontSize: 17,
    fontWeight: "900",
    color: "#155EEF",
  },

  viewRow: {
    marginTop: 14,
    paddingTop: 13,
    borderTopWidth: 1,
    borderTopColor: "#EEF1F5",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  viewText: {
    fontSize: 11,
    fontWeight: "800",
    color: "#155EEF",
  },

  emptyCard: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E5EAF2",
    borderRadius: 18,
    padding: 30,
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