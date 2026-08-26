import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Pressable,
} from "react-native";
import { router } from "expo-router";
import axios from "axios";

export default function OrdersScreen() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = async () => {
    try {
      const storedUser = await AsyncStorage.getItem("user");

      if (!storedUser) {
        router.replace("/login");
        return;
      }

      const user = JSON.parse(storedUser);

      const response = await axios.get(
        `http://localhost:5000/api/v1/orders/customer/${user.id}`
      );

      setOrders(response.data.data || []);
    } catch (error) {
      console.log("Orders error:", error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusStyle = (status: string) => {
    switch (status) {
      case "PLACED":
        return {
          backgroundColor: "#FFF4C7",
          color: "#8A6400",
        };

      case "RIDER_ASSIGNED":
        return {
          backgroundColor: "#EAF0FF",
          color: "#155EEF",
        };

      case "PICKED_UP":
        return {
          backgroundColor: "#DDE8FF",
          color: "#155EEF",
        };

      case "CLEANING":
        return {
          backgroundColor: "#E8E4FF",
          color: "#5B3FC4",
        };

      case "QUALITY_CHECK":
        return {
          backgroundColor: "#EAF0FF",
          color: "#155EEF",
        };

      case "OUT_FOR_DELIVERY":
        return {
          backgroundColor: "#DFF7E8",
          color: "#137A3B",
        };

      case "DELIVERED":
        return {
          backgroundColor: "#DFF7E8",
          color: "#137A3B",
        };

      default:
        return {
          backgroundColor: "#EEF1F5",
          color: "#52617A",
        };
    }
  };

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
            <Text style={styles.tagline}>Laundry in One Tap</Text>
          </View>

          <View style={styles.headerIcon}>
            <Ionicons
              name="cube-outline"
              size={23}
              color="#155EEF"
            />
          </View>
        </View>

        {/* TITLE */}

        <Text style={styles.title}>My Orders</Text>

        <Text style={styles.subtitle}>
          Track your laundry from pickup to delivery.
        </Text>

        {/* ORDERS */}

        {loading ? (
          <ActivityIndicator
            size="large"
            color="#155EEF"
            style={{ marginTop: 50 }}
          />
        ) : orders.length === 0 ? (
          <View style={styles.emptyCard}>
            <View style={styles.emptyIconBox}>
              <Ionicons
                name="basket-outline"
                size={36}
                color="#155EEF"
              />
            </View>

            <Text style={styles.emptyTitle}>
              No orders yet
            </Text>

            <Text style={styles.emptyText}>
              Your laundry orders will appear here.
            </Text>

            <Pressable
              style={styles.emptyButton}
              onPress={() => router.replace("/home")}
            >
              <Text style={styles.emptyButtonText}>
                Book Laundry
              </Text>
            </Pressable>
          </View>
        ) : (
          orders.map((order) => {
            const statusStyle = getStatusStyle(order.status);
            const firstItem = order.order_items?.[0];

            return (
              <Pressable
                key={order.id}
                style={styles.card}
                onPress={() =>
                  router.push({
                    pathname: "/order-details/[orderId]",
                    params: {
                      orderId: order.id,
                    },
                  })
                }
              >
                <View style={styles.cardTop}>
                  <View>
                    <Text style={styles.orderLabel}>
                      ORDER
                    </Text>

                    <Text style={styles.orderNumber}>
                      {order.order_number}
                    </Text>
                  </View>

                  <View
                    style={[
                      styles.statusBadge,
                      {
                        backgroundColor:
                          statusStyle.backgroundColor,
                      },
                    ]}
                  >
                    <View
                      style={[
                        styles.statusDot,
                        {
                          backgroundColor:
                            statusStyle.color,
                        },
                      ]}
                    />

                    <Text
                      style={[
                        styles.statusText,
                        {
                          color: statusStyle.color,
                        },
                      ]}
                    >
                      {order.status.replaceAll("_", " ")}
                    </Text>
                  </View>
                </View>

                <View style={styles.divider} />

                <View style={styles.serviceRow}>
                  <View style={styles.serviceIcon}>
                    <Ionicons
                      name="shirt-outline"
                      size={24}
                      color="#155EEF"
                    />
                  </View>

                  <View style={styles.serviceInfo}>
                    <Text style={styles.serviceName}>
                      {firstItem?.service_name_snapshot ||
                        "Laundry Service"}
                    </Text>

                    <Text style={styles.quantity}>
                      Quantity: {firstItem?.quantity || "-"}
                    </Text>
                  </View>

                  <Text style={styles.total}>
                    {order.total_amount} {order.currency}
                  </Text>
                </View>

                <View style={styles.cardBottom}>
                  <View style={styles.dateRow}>
                    <Ionicons
                      name="calendar-outline"
                      size={14}
                      color="#8A93A4"
                    />

                    <Text style={styles.date}>
                      {new Date(
                        order.created_at
                      ).toLocaleDateString()}
                    </Text>
                  </View>

                  <View style={styles.detailsRow}>
                    <Text style={styles.details}>
                      View Details
                    </Text>

                    <Ionicons
                      name="chevron-forward"
                      size={15}
                      color="#155EEF"
                    />
                  </View>
                </View>
              </Pressable>
            );
          })
        )}
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
          <Text style={styles.navText}>Home</Text>
        </Pressable>

        <Pressable style={styles.navItem}>
          <Ionicons
            name="cube"
            size={22}
            color="#155EEF"
          />
          <Text style={styles.activeNav}>Orders</Text>
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
          <Text style={styles.navText}>Support</Text>
        </Pressable>

        <Pressable
          style={styles.navItem}
          onPress={() => router.replace("/profile")}
        >
          <Ionicons
            name="person-outline"
            size={22}
            color="#8A93A4"
          />
          <Text style={styles.navText}>Profile</Text>
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
    paddingBottom: 115,
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

  headerIcon: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: "#FFF4C7",
    justifyContent: "center",
    alignItems: "center",
  },

  title: {
    fontSize: 30,
    fontWeight: "900",
    color: "#17233C",
  },

  subtitle: {
    fontSize: 14,
    color: "#6B7280",
    marginTop: 6,
    marginBottom: 24,
  },

  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 18,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: "#E5EAF2",
  },

  cardTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 10,
  },

  orderLabel: {
    fontSize: 10,
    color: "#8A93A4",
    fontWeight: "800",
  },

  orderNumber: {
    fontSize: 16,
    fontWeight: "900",
    color: "#17233C",
    marginTop: 3,
  },

  statusBadge: {
    paddingHorizontal: 11,
    paddingVertical: 7,
    borderRadius: 20,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },

  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },

  statusText: {
    fontSize: 10,
    fontWeight: "900",
  },

  divider: {
    height: 1,
    backgroundColor: "#EEF1F5",
    marginVertical: 16,
  },

  serviceRow: {
    flexDirection: "row",
    alignItems: "center",
  },

  serviceIcon: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: "#FFF4C7",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },

  serviceInfo: {
    flex: 1,
  },

  serviceName: {
    fontSize: 15,
    fontWeight: "800",
    color: "#17233C",
  },

  quantity: {
    fontSize: 12,
    color: "#6B7280",
    marginTop: 4,
  },

  total: {
    fontSize: 15,
    fontWeight: "900",
    color: "#155EEF",
  },

  cardBottom: {
    marginTop: 17,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  dateRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },

  date: {
    fontSize: 11,
    color: "#8A93A4",
  },

  detailsRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 2,
  },

  details: {
    fontSize: 12,
    fontWeight: "800",
    color: "#155EEF",
  },

  emptyCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 22,
    padding: 30,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E5EAF2",
    marginTop: 20,
  },

  emptyIconBox: {
    width: 70,
    height: 70,
    borderRadius: 22,
    backgroundColor: "#FFF4C7",
    justifyContent: "center",
    alignItems: "center",
  },

  emptyTitle: {
    fontSize: 20,
    fontWeight: "900",
    color: "#17233C",
    marginTop: 14,
  },

  emptyText: {
    fontSize: 13,
    color: "#6B7280",
    marginTop: 6,
    marginBottom: 20,
  },

  emptyButton: {
    backgroundColor: "#155EEF",
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
  },

  emptyButtonText: {
    color: "#FFFFFF",
    fontWeight: "800",
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