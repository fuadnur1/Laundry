import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { router, useLocalSearchParams } from "expo-router";
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
  customer_id?: string | null;
  partner_id?: string | null;
  status?: string | null;
  total_amount?: number | null;
  created_at?: string | null;
  updated_at?: string | null;
  pickup_address_snapshot?: any;
  delivery_address_snapshot?: any;
  order_items?: OrderItem[];
};

export default function AdminOrderDetailsScreen() {
  const { orderId } = useLocalSearchParams<{
    orderId: string;
  }>();

  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    initialize();
  }, [orderId]);

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

      await fetchOrder();
    } catch (error) {
      console.log("Admin order details init error:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchOrder = async () => {
    try {
      const response = await axios.get(
        `${API_URL}/orders/${orderId}`
      );

      setOrder(
        response.data.order ||
          response.data.data ||
          response.data
      );
    } catch (error: any) {
      console.log(
        "Admin order details error:",
        error.response?.data || error.message
      );

      Alert.alert(
        "Could not load order",
        error.response?.data?.message ||
          "Unable to load order details."
      );
    }
  };

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

  const formatStatus = (value?: string | null) => {
    return (value || "UNKNOWN").replaceAll("_", " ");
  };

  const getAddressText = (snapshot: any) => {
    if (!snapshot) return "Not available";

    if (typeof snapshot === "string") {
      return snapshot;
    }

    const parts = [
      snapshot.address,
      snapshot.address_line,
      snapshot.area,
      snapshot.city,
    ].filter(Boolean);

    if (parts.length > 0) {
      return parts.join(", ");
    }

    return (
      snapshot.full_address ||
      snapshot.label ||
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
          Loading order details...
        </Text>
      </View>
    );
  }

  if (!order) {
    return (
      <View style={styles.loadingScreen}>
        <Ionicons
          name="alert-circle-outline"
          size={42}
          color="#8A93A4"
        />

        <Text style={styles.emptyTitle}>
          Order not found
        </Text>

        <Pressable
          style={styles.backButtonSimple}
          onPress={() =>
            router.replace("/admin/orders")
          }
        >
          <Text style={styles.backButtonSimpleText}>
            Back to Orders
          </Text>
        </Pressable>
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
          <Pressable
            style={styles.backIcon}
            onPress={() => router.back()}
          >
            <Ionicons
              name="arrow-back"
              size={22}
              color="#155EEF"
            />
          </Pressable>

          <View style={styles.headerText}>
            <Text style={styles.brand}>
              SMART LAUNDRY
            </Text>

            <Text style={styles.roleText}>
              ORDER DETAILS
            </Text>
          </View>

          <Pressable
            style={styles.refreshIcon}
            onPress={fetchOrder}
          >
            <Ionicons
              name="refresh-outline"
              size={22}
              color="#155EEF"
            />
          </Pressable>
        </View>

        <View style={styles.heroCard}>
          <View style={styles.heroTop}>
            <View style={styles.heroIcon}>
              <Ionicons
                name="receipt-outline"
                size={25}
                color="#155EEF"
              />
            </View>

            <View style={styles.heroContent}>
              <Text style={styles.heroSmall}>
                ORDER
              </Text>

              <Text style={styles.orderId}>
                #{order.id.slice(0, 8)}
              </Text>
            </View>

            <View style={styles.statusBadge}>
              <Text style={styles.statusText}>
                {formatStatus(order.status)}
              </Text>
            </View>
          </View>

          <Text style={styles.heroDate}>
            Created {formatDate(order.created_at)}
          </Text>

          <View style={styles.totalLine}>
            <Text style={styles.totalLabel}>
              Total Amount
            </Text>

            <Text style={styles.totalValue}>
              {formatMoney(order.total_amount)}
            </Text>
          </View>
        </View>

        <Text style={styles.sectionTitle}>
          Order Parties
        </Text>

        <View style={styles.card}>
          <InfoRow
            icon="person-outline"
            label="Customer ID"
            value={
              order.customer_id ||
              "Not available"
            }
          />

          <InfoRow
            icon="storefront-outline"
            label="Partner ID"
            value={
              order.partner_id ||
              "Not assigned"
            }
            last
          />
        </View>

        <Text style={styles.sectionTitle}>
          Addresses
        </Text>

        <View style={styles.card}>
          <InfoRow
            icon="location-outline"
            label="Pickup Address"
            value={getAddressText(
              order.pickup_address_snapshot
            )}
          />

          <InfoRow
            icon="navigate-outline"
            label="Delivery Address"
            value={getAddressText(
              order.delivery_address_snapshot
            )}
            last
          />
        </View>

        <Text style={styles.sectionTitle}>
          Laundry Items
        </Text>

        <View style={styles.card}>
          {order.order_items?.length ? (
            order.order_items.map((item, index) => (
              <View
                key={item.id}
                style={[
                  styles.itemBlock,
                  index ===
                    (order.order_items?.length || 0) - 1 &&
                    styles.itemBlockLast,
                ]}
              >
                <View style={styles.itemTop}>
                  <View style={styles.itemIcon}>
                    <Ionicons
                      name="shirt-outline"
                      size={20}
                      color="#155EEF"
                    />
                  </View>

                  <View style={styles.itemContent}>
                    <Text style={styles.itemName}>
                      {item.service_name_snapshot ||
                        "Laundry Service"}
                    </Text>

                    <Text style={styles.itemMeta}>
                      Quantity: {item.quantity || 0}
                    </Text>

                    <Text style={styles.itemMeta}>
                      Unit price:{" "}
                      {formatMoney(
                        item.unit_price_snapshot
                      )}
                    </Text>
                  </View>

                  <Text style={styles.itemTotal}>
                    {formatMoney(item.line_total)}
                  </Text>
                </View>
              </View>
            ))
          ) : (
            <View style={styles.emptyItems}>
              <Ionicons
                name="shirt-outline"
                size={32}
                color="#8A93A4"
              />

              <Text style={styles.emptyItemsText}>
                No order item details available.
              </Text>
            </View>
          )}
        </View>

        <Text style={styles.sectionTitle}>
          Timeline
        </Text>

        <View style={styles.card}>
          <InfoRow
            icon="calendar-outline"
            label="Created At"
            value={formatDate(order.created_at)}
          />

          <InfoRow
            icon="time-outline"
            label="Last Updated"
            value={formatDate(order.updated_at)}
            last
          />
        </View>

        <View style={styles.adminNotice}>
          <View style={styles.noticeIcon}>
            <Ionicons
              name="shield-checkmark-outline"
              size={21}
              color="#155EEF"
            />
          </View>

          <View style={styles.noticeContent}>
            <Text style={styles.noticeTitle}>
              Admin View
            </Text>

            <Text style={styles.noticeText}>
              This screen provides administrative
              visibility into the order. Operational
              status changes remain handled by the
              partner and rider workflow.
            </Text>
          </View>
        </View>

        <Pressable
          style={styles.ordersButton}
          onPress={() =>
            router.replace("/admin/orders")
          }
        >
          <Ionicons
            name="receipt-outline"
            size={19}
            color="#FFFFFF"
          />

          <Text style={styles.ordersButtonText}>
            Back to All Orders
          </Text>
        </Pressable>
      </ScrollView>
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
    padding: 25,
  },

  loadingText: {
    marginTop: 12,
    fontSize: 13,
    color: "#6B7280",
  },

  emptyTitle: {
    marginTop: 12,
    fontSize: 18,
    fontWeight: "900",
    color: "#17233C",
  },

  backButtonSimple: {
    marginTop: 18,
    backgroundColor: "#155EEF",
    borderRadius: 14,
    paddingHorizontal: 18,
    paddingVertical: 12,
  },

  backButtonSimpleText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "900",
  },

  container: {
    padding: 22,
    paddingTop: 48,
    paddingBottom: 50,
  },

  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 25,
  },

  backIcon: {
    width: 43,
    height: 43,
    borderRadius: 14,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E5EAF2",
    alignItems: "center",
    justifyContent: "center",
  },

  headerText: {
    flex: 1,
    marginLeft: 13,
  },

  brand: {
    fontSize: 19,
    fontWeight: "900",
    color: "#155EEF",
  },

  roleText: {
    marginTop: 2,
    fontSize: 9,
    color: "#8A93A4",
    fontWeight: "800",
    letterSpacing: 1,
  },

  refreshIcon: {
    width: 43,
    height: 43,
    borderRadius: 14,
    backgroundColor: "#FFF4C7",
    alignItems: "center",
    justifyContent: "center",
  },

  heroCard: {
    backgroundColor: "#155EEF",
    borderRadius: 21,
    padding: 20,
    marginBottom: 27,
  },

  heroTop: {
    flexDirection: "row",
    alignItems: "center",
  },

  heroIcon: {
    width: 47,
    height: 47,
    borderRadius: 15,
    backgroundColor: "#FFF4C7",
    alignItems: "center",
    justifyContent: "center",
  },

  heroContent: {
    flex: 1,
    marginLeft: 12,
  },

  heroSmall: {
    fontSize: 9,
    color: "#DDE8FF",
    fontWeight: "800",
  },

  orderId: {
    marginTop: 2,
    fontSize: 20,
    fontWeight: "900",
    color: "#FFFFFF",
  },

  statusBadge: {
    maxWidth: 130,
    backgroundColor: "#FFF4C7",
    borderRadius: 15,
    paddingHorizontal: 9,
    paddingVertical: 6,
  },

  statusText: {
    fontSize: 8,
    fontWeight: "900",
    color: "#155EEF",
    textAlign: "center",
  },

  heroDate: {
    marginTop: 15,
    fontSize: 10,
    color: "#DDE8FF",
  },

  totalLine: {
    marginTop: 15,
    paddingTop: 14,
    borderTopWidth: 1,
    borderTopColor: "#4C7DF0",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  totalLabel: {
    fontSize: 12,
    color: "#DDE8FF",
    fontWeight: "700",
  },

  totalValue: {
    fontSize: 20,
    color: "#FFF4C7",
    fontWeight: "900",
  },

  sectionTitle: {
    marginBottom: 12,
    fontSize: 17,
    fontWeight: "900",
    color: "#17233C",
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
    alignItems: "flex-start",
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
    color: "#8A93A4",
    fontWeight: "800",
  },

  infoValue: {
    marginTop: 4,
    fontSize: 11,
    lineHeight: 16,
    color: "#17233C",
    fontWeight: "700",
  },

  itemBlock: {
    borderBottomWidth: 1,
    borderBottomColor: "#EEF1F5",
    paddingBottom: 14,
    marginBottom: 14,
  },

  itemBlockLast: {
    borderBottomWidth: 0,
    paddingBottom: 0,
    marginBottom: 0,
  },

  itemTop: {
    flexDirection: "row",
    alignItems: "center",
  },

  itemIcon: {
    width: 43,
    height: 43,
    borderRadius: 14,
    backgroundColor: "#FFF4C7",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },

  itemContent: {
    flex: 1,
  },

  itemName: {
    fontSize: 13,
    fontWeight: "900",
    color: "#17233C",
  },

  itemMeta: {
    marginTop: 3,
    fontSize: 10,
    color: "#6B7280",
  },

  itemTotal: {
    marginLeft: 10,
    fontSize: 13,
    fontWeight: "900",
    color: "#155EEF",
  },

  emptyItems: {
    alignItems: "center",
    paddingVertical: 15,
  },

  emptyItemsText: {
    marginTop: 8,
    fontSize: 11,
    color: "#8A93A4",
  },

  adminNotice: {
    flexDirection: "row",
    backgroundColor: "#FFF4C7",
    borderRadius: 18,
    padding: 16,
    marginBottom: 18,
  },

  noticeIcon: {
    width: 43,
    height: 43,
    borderRadius: 14,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },

  noticeContent: {
    flex: 1,
  },

  noticeTitle: {
    fontSize: 13,
    fontWeight: "900",
    color: "#17233C",
  },

  noticeText: {
    marginTop: 4,
    fontSize: 10,
    lineHeight: 16,
    color: "#6B7280",
  },

  ordersButton: {
    flexDirection: "row",
    gap: 8,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#155EEF",
    borderRadius: 15,
    paddingVertical: 14,
  },

  ordersButtonText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "900",
  },
});