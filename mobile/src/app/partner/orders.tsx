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
  service_id?: string | null;
  service_name_snapshot?: string | null;
  quantity?: number | null;
  unit_price_snapshot?: number | null;
  line_total?: number | null;
};

type Order = {
  id: string;
  order_number?: string | null;
  customer_id?: string | null;
  partner_id?: string | null;
  status?: string | null;
  subtotal?: number | null;
  delivery_fee?: number | null;
  total_amount?: number | null;
  currency?: string | null;
  customer_note?: string | null;
  created_at?: string | null;
  updated_at?: string | null;
  order_items?: OrderItem[];
};

export default function PartnerOrdersScreen() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);

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

      await fetchOrders(parsedUser.id);
    } catch (error) {
      console.log("Partner orders init error:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchOrders = async (partnerId?: string) => {
    try {
      const id = partnerId || user?.id;

      if (!id) return;

      const response = await axios.get(
        `${API_URL}/orders/partner/${id}`
      );

      setOrders(response.data.orders || []);
    } catch (error: any) {
      console.log(
        "Partner orders error:",
        error.response?.data || error.message
      );

      Alert.alert(
        "Could not load orders",
        error.response?.data?.message ||
          "Unable to fetch partner orders."
      );
    }
  };

  const incomingOrders = useMemo(
    () =>
      orders.filter(
        (order) =>
          order.status === "PLACED" ||
          order.status === "RIDER_ASSIGNED"
      ),
    [orders]
  );

  const activeOrders = useMemo(
    () =>
      orders.filter(
        (order) =>
          order.status !== "PLACED" &&
          order.status !== "RIDER_ASSIGNED" &&
          order.status !== "DELIVERED" &&
          order.status !== "CANCELLED"
      ),
    [orders]
  );

  const completedOrders = useMemo(
    () =>
      orders.filter(
        (order) => order.status === "DELIVERED"
      ),
    [orders]
  );

  const formatMoney = (value?: number | null) => {
    return `৳${Number(value || 0).toFixed(0)}`;
  };

  const formatDate = (value?: string | null) => {
    if (!value) return "";

    return new Date(value).toLocaleString();
  };

  const getStatusLabel = (status?: string | null) => {
    switch (status) {
      case "PLACED":
        return "Placed";
      case "RIDER_ASSIGNED":
        return "Rider Assigned";
      case "PICKED_UP":
        return "Picked Up";
      case "CLEANING":
        return "Cleaning";
      case "QUALITY_CHECK":
        return "Quality Check";
      case "OUT_FOR_DELIVERY":
        return "Out for Delivery";
      case "DELIVERED":
        return "Delivered";
      case "CANCELLED":
        return "Cancelled";
      default:
        return status || "Unknown";
    }
  };

  const renderOrderCard = (order: Order) => {
    const items = order.order_items || [];

    return (
      <Pressable
        key={order.id}
        style={styles.orderCard}
        onPress={() =>
          router.push({
            pathname: "/partner/order/[orderId]",
            params: {
              orderId: order.id,
            },
          })
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
            <Text style={styles.orderNumber}>
              {order.order_number ||
                `Order #${order.id.slice(0, 8)}`}
            </Text>

            <Text style={styles.orderDate}>
              {formatDate(order.created_at)}
            </Text>
          </View>

          <View style={styles.statusBadge}>
            <Text style={styles.statusText}>
              {getStatusLabel(order.status)}
            </Text>
          </View>
        </View>

        <View style={styles.itemsBox}>
          {items.length === 0 ? (
            <Text style={styles.noItemsText}>
              No item details available
            </Text>
          ) : (
            items.map((item) => (
              <View
                key={item.id}
                style={styles.itemRow}
              >
                <View style={styles.itemLeft}>
                  <Ionicons
                    name="shirt-outline"
                    size={16}
                    color="#155EEF"
                  />

                  <Text style={styles.itemName}>
                    {item.service_name_snapshot ||
                      "Laundry Service"}
                  </Text>
                </View>

                <Text style={styles.itemQty}>
                  × {item.quantity || 0}
                </Text>
              </View>
            ))
          )}
        </View>

        {order.customer_note ? (
          <View style={styles.noteRow}>
            <Ionicons
              name="chatbox-ellipses-outline"
              size={16}
              color="#6B7280"
            />

            <Text style={styles.noteText}>
              {order.customer_note}
            </Text>
          </View>
        ) : null}

        <View style={styles.footerRow}>
          <View>
            <Text style={styles.totalLabel}>
              Order Total
            </Text>

            <Text style={styles.totalValue}>
              {formatMoney(
                order.total_amount ??
                  order.subtotal
              )}
            </Text>
          </View>

          <View style={styles.viewButton}>
            <Text style={styles.viewButtonText}>
              View Order
            </Text>

            <Ionicons
              name="chevron-forward"
              size={18}
              color="#155EEF"
            />
          </View>
        </View>
      </Pressable>
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
          Loading partner orders...
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

          <Pressable
            style={styles.headerIcon}
            onPress={() =>
              user?.id && fetchOrders(user.id)
            }
          >
            <Ionicons
              name="refresh-outline"
              size={23}
              color="#155EEF"
            />
          </Pressable>
        </View>

        <Text style={styles.pageTitle}>
          Manage Orders
        </Text>

        <Text style={styles.pageSubtitle}>
          View and process customer laundry orders.
        </Text>

        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>
              {incomingOrders.length}
            </Text>
            <Text style={styles.statLabel}>
              Incoming
            </Text>
          </View>

          <View style={styles.statCard}>
            <Text style={styles.statNumber}>
              {activeOrders.length}
            </Text>
            <Text style={styles.statLabel}>
              Active
            </Text>
          </View>

          <View style={styles.statCard}>
            <Text style={styles.statNumber}>
              {completedOrders.length}
            </Text>
            <Text style={styles.statLabel}>
              Completed
            </Text>
          </View>
        </View>

        <Text style={styles.sectionTitle}>
          Incoming Orders
        </Text>

        {incomingOrders.length === 0 ? (
          <View style={styles.emptyCard}>
            <Ionicons
              name="notifications-off-outline"
              size={34}
              color="#155EEF"
            />

            <Text style={styles.emptyTitle}>
              No incoming orders
            </Text>

            <Text style={styles.emptyText}>
              New customer orders will appear here.
            </Text>
          </View>
        ) : (
          incomingOrders.map(renderOrderCard)
        )}

        <Text style={styles.sectionTitle}>
          Active Orders
        </Text>

        {activeOrders.length === 0 ? (
          <View style={styles.emptyCardSmall}>
            <Text style={styles.emptySmallText}>
              No active laundry orders.
            </Text>
          </View>
        ) : (
          activeOrders.map(renderOrderCard)
        )}

        <Text style={styles.sectionTitle}>
          Completed Orders
        </Text>

        {completedOrders.length === 0 ? (
          <View style={styles.emptyCardSmall}>
            <Text style={styles.emptySmallText}>
              No completed orders yet.
            </Text>
          </View>
        ) : (
          completedOrders.map(renderOrderCard)
        )}
      </ScrollView>

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

  pageTitle: {
    fontSize: 28,
    fontWeight: "900",
    color: "#17233C",
  },

  pageSubtitle: {
    fontSize: 12,
    color: "#6B7280",
    marginTop: 5,
    marginBottom: 22,
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
    borderRadius: 17,
    padding: 15,
  },

  statNumber: {
    fontSize: 24,
    fontWeight: "900",
    color: "#17233C",
  },

  statLabel: {
    fontSize: 10,
    color: "#6B7280",
    marginTop: 3,
  },

  sectionTitle: {
    fontSize: 18,
    fontWeight: "900",
    color: "#17233C",
    marginBottom: 13,
  },

  emptyCard: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E5EAF2",
    borderRadius: 20,
    padding: 25,
    alignItems: "center",
    marginBottom: 26,
  },

  emptyTitle: {
    fontSize: 16,
    fontWeight: "900",
    color: "#17233C",
    marginTop: 10,
  },

  emptyText: {
    fontSize: 11,
    color: "#6B7280",
    marginTop: 4,
  },

  emptyCardSmall: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E5EAF2",
    borderRadius: 16,
    padding: 17,
    marginBottom: 26,
  },

  emptySmallText: {
    fontSize: 11,
    color: "#6B7280",
  },

  orderCard: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E5EAF2",
    borderRadius: 20,
    padding: 17,
    marginBottom: 15,
  },

  orderTop: {
    flexDirection: "row",
    alignItems: "center",
  },

  orderIcon: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: "#FFF4C7",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 11,
  },

  orderHeading: {
    flex: 1,
  },

  orderNumber: {
    fontSize: 14,
    fontWeight: "900",
    color: "#17233C",
  },

  orderDate: {
    fontSize: 10,
    color: "#8A93A4",
    marginTop: 3,
  },

  statusBadge: {
    backgroundColor: "#EAF0FF",
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },

  statusText: {
    fontSize: 9,
    color: "#155EEF",
    fontWeight: "900",
  },

  itemsBox: {
    backgroundColor: "#F9FAFC",
    borderRadius: 14,
    padding: 13,
    marginTop: 15,
  },

  itemRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 5,
  },

  itemLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
    flex: 1,
  },

  itemName: {
    fontSize: 11,
    color: "#17233C",
    fontWeight: "700",
  },

  itemQty: {
    fontSize: 11,
    color: "#6B7280",
    fontWeight: "800",
  },

  noItemsText: {
    fontSize: 11,
    color: "#8A93A4",
  },

  noteRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 7,
    marginTop: 13,
  },

  noteText: {
    flex: 1,
    fontSize: 10,
    lineHeight: 16,
    color: "#6B7280",
  },

  footerRow: {
    borderTopWidth: 1,
    borderTopColor: "#EEF1F5",
    marginTop: 14,
    paddingTop: 13,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  totalLabel: {
    fontSize: 9,
    color: "#8A93A4",
    fontWeight: "800",
  },

  totalValue: {
    fontSize: 16,
    fontWeight: "900",
    color: "#17233C",
    marginTop: 2,
  },

  viewButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },

  viewButtonText: {
    fontSize: 11,
    fontWeight: "900",
    color: "#155EEF",
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
    color: "#155EEF",
    fontWeight: "800",
  },
});
