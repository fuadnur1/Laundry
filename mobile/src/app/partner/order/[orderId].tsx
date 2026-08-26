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

export default function PartnerOrderDetailsScreen() {
  const { orderId } = useLocalSearchParams<{
    orderId: string;
  }>();

  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

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

      if (Number(parsedUser.role_id) !== 3) {
        Alert.alert(
          "Access Denied",
          "This page is only available for laundry partners."
        );

        router.replace("/login");
        return;
      }

      await fetchOrder();
    } catch (error) {
      console.log("Partner order details init error:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchOrder = async () => {
    try {
      const response = await axios.get(
        `${API_URL}/orders/${orderId}`
      );

      setOrder(response.data.order);
    } catch (error: any) {
      console.log(
        "Partner order details error:",
        error.response?.data || error.message
      );

      Alert.alert(
        "Could not load order",
        error.response?.data?.message ||
          "Unable to fetch this order."
      );
    }
  };

  const updateStatus = async (status: string) => {
    if (!order) return;

    try {
      setUpdating(true);

      const response = await axios.patch(
        `${API_URL}/orders/${order.id}/status`,
        {
          status,
        }
      );

      setOrder(response.data.order);

      Alert.alert(
        "Success",
        `Order updated to ${status}.`
      );
    } catch (error: any) {
      console.log(
        "Partner status update error:",
        error.response?.data || error.message
      );

      Alert.alert(
        "Update Failed",
        error.response?.data?.message ||
          "Could not update order status."
      );
    } finally {
      setUpdating(false);
    }
  };

  const getNextAction = () => {
    switch (order?.status) {
      case "PICKED_UP":
        return {
          label: "Start Cleaning",
          status: "CLEANING",
          icon: "water-outline",
        };

      case "CLEANING":
        return {
          label: "Send to Quality Check",
          status: "QUALITY_CHECK",
          icon: "checkmark-circle-outline",
        };

      case "QUALITY_CHECK":
        return {
          label: "Ready for Delivery",
          status: "OUT_FOR_DELIVERY",
          icon: "car-outline",
        };

      default:
        return null;
    }
  };

  const formatMoney = (value?: number | null) => {
    return `৳${Number(value || 0).toFixed(0)}`;
  };

  const formatDate = (value?: string | null) => {
    if (!value) return "";

    return new Date(value).toLocaleString();
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
          color="#D14343"
        />

        <Text style={styles.errorTitle}>
          Order not found
        </Text>

        <Pressable
          style={styles.backButton}
          onPress={() =>
            router.replace("/partner/orders")
          }
        >
          <Text style={styles.backButtonText}>
            Back to Orders
          </Text>
        </Pressable>
      </View>
    );
  }

  const nextAction = getNextAction();

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
              color="#17233C"
            />
          </Pressable>

          <View style={styles.headerText}>
            <Text style={styles.brand}>
              SMART LAUNDRY
            </Text>

            <Text style={styles.roleText}>
              PARTNER ORDER
            </Text>
          </View>

          <View style={styles.headerIcon}>
            <Ionicons
              name="storefront-outline"
              size={23}
              color="#155EEF"
            />
          </View>
        </View>

        <View style={styles.heroCard}>
          <Text style={styles.heroLabel}>
            CURRENT STATUS
          </Text>

          <Text style={styles.heroTitle}>
            {order.status || "Unknown"}
          </Text>

          <Text style={styles.heroOrder}>
            {order.order_number ||
              `Order #${order.id.slice(0, 8)}`}
          </Text>

          <Text style={styles.heroDate}>
            {formatDate(order.created_at)}
          </Text>
        </View>

        <Text style={styles.sectionTitle}>
          Order Items
        </Text>

        <View style={styles.card}>
          {(order.order_items || []).map((item) => (
            <View
              key={item.id}
              style={styles.itemRow}
            >
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
                  Qty {item.quantity || 0} ×{" "}
                  {formatMoney(
                    item.unit_price_snapshot
                  )}
                </Text>
              </View>

              <Text style={styles.itemTotal}>
                {formatMoney(item.line_total)}
              </Text>
            </View>
          ))}
        </View>

        {order.customer_note ? (
          <>
            <Text style={styles.sectionTitle}>
              Customer Note
            </Text>

            <View style={styles.noteCard}>
              <Ionicons
                name="chatbox-ellipses-outline"
                size={21}
                color="#155EEF"
              />

              <Text style={styles.noteText}>
                {order.customer_note}
              </Text>
            </View>
          </>
        ) : null}

        <Text style={styles.sectionTitle}>
          Payment Summary
        </Text>

        <View style={styles.card}>
          <SummaryRow
            label="Subtotal"
            value={formatMoney(order.subtotal)}
          />

          <SummaryRow
            label="Delivery Fee"
            value={formatMoney(order.delivery_fee)}
          />

          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>
              Total
            </Text>

            <Text style={styles.totalValue}>
              {formatMoney(
                order.total_amount ??
                  order.subtotal
              )}
            </Text>
          </View>
        </View>

        <Text style={styles.sectionTitle}>
          Laundry Progress
        </Text>

        <View style={styles.progressCard}>
          <ProgressItem
            label="Picked Up"
            completed={[
              "PICKED_UP",
              "CLEANING",
              "QUALITY_CHECK",
              "OUT_FOR_DELIVERY",
              "DELIVERED",
            ].includes(order.status || "")}
          />

          <ProgressItem
            label="Cleaning"
            completed={[
              "CLEANING",
              "QUALITY_CHECK",
              "OUT_FOR_DELIVERY",
              "DELIVERED",
            ].includes(order.status || "")}
          />

          <ProgressItem
            label="Quality Check"
            completed={[
              "QUALITY_CHECK",
              "OUT_FOR_DELIVERY",
              "DELIVERED",
            ].includes(order.status || "")}
          />

          <ProgressItem
            label="Ready for Delivery"
            completed={[
              "OUT_FOR_DELIVERY",
              "DELIVERED",
            ].includes(order.status || "")}
            last
          />
        </View>

        {nextAction ? (
          <>
            <Text style={styles.sectionTitle}>
              Next Action
            </Text>

            <Pressable
              style={[
                styles.primaryButton,
                updating && styles.disabledButton,
              ]}
              disabled={updating}
              onPress={() =>
                updateStatus(nextAction.status)
              }
            >
              <Ionicons
                name={nextAction.icon as any}
                size={20}
                color="#FFFFFF"
              />

              <Text style={styles.primaryButtonText}>
                {updating
                  ? "Updating..."
                  : nextAction.label}
              </Text>
            </Pressable>
          </>
        ) : (
          <View style={styles.infoCard}>
            <Ionicons
              name="information-circle-outline"
              size={22}
              color="#155EEF"
            />

            <Text style={styles.infoText}>
              No laundry processing action is required
              for the current order status.
            </Text>
          </View>
        )}

        <Pressable
          style={styles.ordersButton}
          onPress={() =>
            router.replace("/partner/orders")
          }
        >
          <Ionicons
            name="receipt-outline"
            size={19}
            color="#155EEF"
          />

          <Text style={styles.ordersButtonText}>
            Back to Orders
          </Text>
        </Pressable>
      </ScrollView>
    </View>
  );
}

function SummaryRow({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <View style={styles.summaryRow}>
      <Text style={styles.summaryLabel}>
        {label}
      </Text>

      <Text style={styles.summaryValue}>
        {value}
      </Text>
    </View>
  );
}

function ProgressItem({
  label,
  completed,
  last,
}: {
  label: string;
  completed: boolean;
  last?: boolean;
}) {
  return (
    <View
      style={[
        styles.progressItem,
        last && styles.progressItemLast,
      ]}
    >
      <View
        style={[
          styles.progressDot,
          completed && styles.progressDotCompleted,
        ]}
      >
        {completed && (
          <Ionicons
            name="checkmark"
            size={15}
            color="#FFFFFF"
          />
        )}
      </View>

      <Text
        style={[
          styles.progressLabel,
          completed &&
            styles.progressLabelCompleted,
        ]}
      >
        {label}
      </Text>
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
    paddingTop: 45,
    paddingBottom: 60,
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
    color: "#6B7280",
    fontSize: 13,
  },

  errorTitle: {
    fontSize: 19,
    fontWeight: "900",
    color: "#17233C",
    marginTop: 10,
  },

  backButton: {
    marginTop: 18,
    backgroundColor: "#155EEF",
    borderRadius: 14,
    paddingHorizontal: 18,
    paddingVertical: 12,
  },

  backButtonText: {
    color: "#FFFFFF",
    fontWeight: "900",
  },

  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 25,
  },

  backIcon: {
    width: 44,
    height: 44,
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
    fontSize: 18,
    color: "#155EEF",
    fontWeight: "900",
  },

  roleText: {
    fontSize: 9,
    color: "#8A93A4",
    fontWeight: "800",
    marginTop: 3,
    letterSpacing: 1,
  },

  headerIcon: {
    width: 45,
    height: 45,
    borderRadius: 14,
    backgroundColor: "#FFF4C7",
    alignItems: "center",
    justifyContent: "center",
  },

  heroCard: {
    backgroundColor: "#155EEF",
    borderRadius: 22,
    padding: 20,
    marginBottom: 26,
  },

  heroLabel: {
    fontSize: 10,
    fontWeight: "900",
    color: "#FFF4C7",
  },

  heroTitle: {
    marginTop: 5,
    fontSize: 23,
    fontWeight: "900",
    color: "#FFFFFF",
  },

  heroOrder: {
    marginTop: 10,
    fontSize: 12,
    color: "#FFFFFF",
    fontWeight: "800",
  },

  heroDate: {
    fontSize: 10,
    color: "#DDE8FF",
    marginTop: 4,
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

  itemRow: {
    flexDirection: "row",
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: "#EEF1F5",
    paddingVertical: 10,
  },

  itemIcon: {
    width: 42,
    height: 42,
    borderRadius: 13,
    backgroundColor: "#FFF4C7",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 11,
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
    fontSize: 10,
    color: "#6B7280",
    marginTop: 3,
  },

  itemTotal: {
    fontSize: 13,
    fontWeight: "900",
    color: "#17233C",
  },

  noteCard: {
    flexDirection: "row",
    gap: 10,
    backgroundColor: "#FFF4C7",
    borderRadius: 17,
    padding: 15,
    marginBottom: 25,
  },

  noteText: {
    flex: 1,
    fontSize: 11,
    lineHeight: 17,
    color: "#52617A",
  },

  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 8,
  },

  summaryLabel: {
    fontSize: 11,
    color: "#6B7280",
  },

  summaryValue: {
    fontSize: 11,
    color: "#17233C",
    fontWeight: "800",
  },

  totalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    borderTopWidth: 1,
    borderTopColor: "#E5EAF2",
    paddingTop: 13,
    marginTop: 7,
  },

  totalLabel: {
    fontSize: 14,
    fontWeight: "900",
    color: "#17233C",
  },

  totalValue: {
    fontSize: 17,
    fontWeight: "900",
    color: "#155EEF",
  },

  progressCard: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E5EAF2",
    borderRadius: 19,
    padding: 16,
    marginBottom: 25,
  },

  progressItem: {
    flexDirection: "row",
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: "#EEF1F5",
    paddingBottom: 14,
    marginBottom: 14,
  },

  progressItemLast: {
    borderBottomWidth: 0,
    paddingBottom: 0,
    marginBottom: 0,
  },

  progressDot: {
    width: 31,
    height: 31,
    borderRadius: 10,
    backgroundColor: "#EEF1F5",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 11,
  },

  progressDotCompleted: {
    backgroundColor: "#155EEF",
  },

  progressLabel: {
    fontSize: 12,
    fontWeight: "800",
    color: "#8A93A4",
  },

  progressLabelCompleted: {
    color: "#17233C",
  },

  primaryButton: {
    backgroundColor: "#155EEF",
    borderRadius: 15,
    paddingVertical: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    marginBottom: 20,
  },

  primaryButtonText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "900",
  },

  disabledButton: {
    opacity: 0.6,
  },

  infoCard: {
    flexDirection: "row",
    gap: 9,
    backgroundColor: "#FFF4C7",
    borderRadius: 16,
    padding: 14,
    marginBottom: 20,
  },

  infoText: {
    flex: 1,
    fontSize: 11,
    lineHeight: 17,
    color: "#52617A",
  },

  ordersButton: {
    borderWidth: 1,
    borderColor: "#D8E1F0",
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    paddingVertical: 14,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 7,
  },

  ordersButtonText: {
    color: "#155EEF",
    fontSize: 12,
    fontWeight: "900",
  },
});