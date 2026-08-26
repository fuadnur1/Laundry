import { Ionicons } from "@expo/vector-icons";
import { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Pressable,
} from "react-native";
import { useLocalSearchParams, router } from "expo-router";
import axios from "axios";

const steps = [
  "PLACED",
  "RIDER_ASSIGNED",
  "PICKED_UP",
  "CLEANING",
  "QUALITY_CHECK",
  "OUT_FOR_DELIVERY",
  "DELIVERED",
];

export default function OrderDetailsScreen() {
  const { orderId } = useLocalSearchParams();
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadOrder();
  }, [orderId]);

  const loadOrder = async () => {
    try {
      const response = await axios.get(
        `http://localhost:5000/api/v1/orders/${orderId}`
      );

      setOrder(response.data.data);
    } catch (error) {
      console.log("Order details error:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingScreen}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (!order) {
    return (
      <View style={styles.loadingScreen}>
        <Text>Order not found.</Text>
      </View>
    );
  }

  const currentStep = Math.max(0, steps.indexOf(order.status));
  const firstItem = order.order_items?.[0];

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={styles.container}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.header}>
        <Pressable style={styles.backButton} onPress={() => router.back()}>
          <Text style={styles.backText}>←</Text>
        </Pressable>

        <View style={styles.headerCenter}>
          <Text style={styles.brand}>SMART LAUNDRY</Text>
          <Text style={styles.tagline}>Laundry in One Tap</Text>
        </View>

        <View style={{ width: 42 }} />
      </View>

      <Text style={styles.title}>Order Tracking</Text>

      <Text style={styles.subtitle}>
        Follow your laundry journey from pickup to delivery.
      </Text>

      <View style={styles.statusCard}>
        <Text style={styles.orderLabel}>ORDER NUMBER</Text>
        <Text style={styles.orderNumber}>{order.order_number}</Text>

        <View style={styles.statusBadge}>
          <Text style={styles.statusText}>
            {order.status.replaceAll("_", " ")}
          </Text>
        </View>
      </View>

      <Text style={styles.sectionTitle}>Progress</Text>

      <View style={styles.timelineCard}>
        {steps.map((step, index) => {
          const completed = index <= currentStep;

          return (
            <View key={step} style={styles.timelineRow}>
              <View style={styles.timelineLeft}>
                <View
                  style={[
                    styles.dot,
                    completed && styles.dotActive,
                  ]}
                >
                  <Text style={styles.dotText}>
                    {completed ? "✓" : ""}
                  </Text>
                </View>

                {index !== steps.length - 1 && (
                  <View
                    style={[
                      styles.line,
                      index < currentStep && styles.lineActive,
                    ]}
                  />
                )}
              </View>

              <View style={styles.timelineContent}>
                <Text
                  style={[
                    styles.stepTitle,
                    completed && styles.stepTitleActive,
                  ]}
                >
                  {step.replaceAll("_", " ")}
                </Text>

                <Text style={styles.stepText}>
                  {getStepDescription(step)}
                </Text>
              </View>
            </View>
          );
        })}
      </View>

      <Text style={styles.sectionTitle}>Service Details</Text>

      <View style={styles.card}>
        <View style={styles.serviceRow}>
          <View style={styles.iconBox}>
            <Text style={styles.emoji}>👕</Text>
          </View>

          <View style={styles.serviceInfo}>
            <Text style={styles.serviceName}>
              {firstItem?.service_name_snapshot || "Laundry Service"}
            </Text>

            <Text style={styles.meta}>
              Quantity: {firstItem?.quantity || "-"}
            </Text>
          </View>

          <Text style={styles.price}>
            {order.total_amount} {order.currency}
          </Text>
        </View>
      </View>

      <Text style={styles.sectionTitle}>Order Information</Text>

      <View style={styles.card}>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Pickup Time</Text>
          <Text style={styles.infoValue}>
            {new Date(order.pickup_slot_start).toLocaleString()}
          </Text>
        </View>

        <View style={styles.divider} />

        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Order Date</Text>
          <Text style={styles.infoValue}>
            {new Date(order.created_at).toLocaleString()}
          </Text>
        </View>

        <View style={styles.divider} />

        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Payment</Text>
          <Text style={styles.infoValue}>
            {order.total_amount} {order.currency}
          </Text>
        </View>
      </View>

      {order.customer_note ? (
        <>
          <Text style={styles.sectionTitle}>Special Instructions</Text>

          <View style={styles.noteCard}>
            <Text style={styles.noteText}>{order.customer_note}</Text>
          </View>
        </>
      ) : null}

      <View style={styles.helpCard}>
        <Text style={styles.helpIcon}>💬</Text>

        <View style={{ flex: 1 }}>
          <Text style={styles.helpTitle}>Need help?</Text>
          <Text style={styles.helpText}>
            Contact Smart Laundry support about this order.
          </Text>
        </View>
      </View>
    </ScrollView>
  );
}

function getStepDescription(step: string) {
  switch (step) {
    case "PLACED":
      return "Your order has been received.";

    case "RIDER_ASSIGNED":
      return "A rider has been assigned for pickup.";

    case "PICKED_UP":
      return "Your laundry has been collected.";

    case "CLEANING":
      return "Your clothes are being cleaned.";

    case "QUALITY_CHECK":
      return "Your laundry is undergoing a quality check.";

    case "OUT_FOR_DELIVERY":
      return "Your clean clothes are on the way.";

    case "DELIVERED":
      return "Your laundry has been delivered.";

    default:
      return "";
  }
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#F7F9FC",
  },

  container: {
    padding: 22,
    paddingTop: 48,
    paddingBottom: 45,
  },

  loadingScreen: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F7F9FC",
  },

  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 28,
  },

  backButton: {
    width: 42,
    height: 42,
    borderRadius: 13,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E5EAF2",
    justifyContent: "center",
    alignItems: "center",
  },

  backText: {
    fontSize: 22,
    fontWeight: "700",
    color: "#17233C",
  },

  headerCenter: {
    flex: 1,
    alignItems: "center",
  },

  brand: {
    fontSize: 17,
    fontWeight: "900",
    color: "#155EEF",
  },

  tagline: {
    fontSize: 10,
    color: "#6B7280",
    marginTop: 2,
  },

  title: {
    fontSize: 30,
    fontWeight: "900",
    color: "#17233C",
  },

  subtitle: {
    fontSize: 13,
    color: "#6B7280",
    marginTop: 6,
    marginBottom: 24,
  },

  statusCard: {
    backgroundColor: "#155EEF",
    borderRadius: 22,
    padding: 20,
    marginBottom: 27,
  },

  orderLabel: {
    color: "#DDE8FF",
    fontSize: 10,
    fontWeight: "800",
  },

  orderNumber: {
    color: "#FFFFFF",
    fontSize: 19,
    fontWeight: "900",
    marginTop: 5,
  },

  statusBadge: {
    alignSelf: "flex-start",
    backgroundColor: "#FFC928",
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 7,
    marginTop: 15,
  },

  statusText: {
    color: "#102A56",
    fontSize: 10,
    fontWeight: "900",
  },

  sectionTitle: {
    fontSize: 17,
    fontWeight: "900",
    color: "#17233C",
    marginBottom: 12,
  },

  timelineCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#E5EAF2",
    padding: 18,
    marginBottom: 27,
  },

  timelineRow: {
    flexDirection: "row",
  },

  timelineLeft: {
    width: 34,
    alignItems: "center",
  },

  dot: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: "#EEF1F5",
    justifyContent: "center",
    alignItems: "center",
  },

  dotActive: {
    backgroundColor: "#155EEF",
  },

  dotText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "900",
  },

  line: {
    width: 2,
    height: 43,
    backgroundColor: "#E5EAF2",
  },

  lineActive: {
    backgroundColor: "#155EEF",
  },

  timelineContent: {
    flex: 1,
    paddingLeft: 10,
    paddingBottom: 20,
  },

  stepTitle: {
    fontSize: 13,
    fontWeight: "800",
    color: "#A0A7B4",
  },

  stepTitleActive: {
    color: "#17233C",
  },

  stepText: {
    fontSize: 11,
    color: "#8A93A4",
    marginTop: 4,
    lineHeight: 16,
  },

  card: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E5EAF2",
    borderRadius: 18,
    padding: 17,
    marginBottom: 25,
  },

  serviceRow: {
    flexDirection: "row",
    alignItems: "center",
  },

  iconBox: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: "#FFF4C7",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },

  emoji: {
    fontSize: 22,
  },

  serviceInfo: {
    flex: 1,
  },

  serviceName: {
    fontSize: 15,
    fontWeight: "900",
    color: "#17233C",
  },

  meta: {
    fontSize: 12,
    color: "#6B7280",
    marginTop: 4,
  },

  price: {
    fontSize: 15,
    fontWeight: "900",
    color: "#155EEF",
  },

  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 15,
  },

  infoLabel: {
    fontSize: 12,
    color: "#6B7280",
  },

  infoValue: {
    flex: 1,
    textAlign: "right",
    fontSize: 12,
    fontWeight: "700",
    color: "#17233C",
  },

  divider: {
    height: 1,
    backgroundColor: "#EEF1F5",
    marginVertical: 14,
  },

  noteCard: {
    backgroundColor: "#FFF4C7",
    borderRadius: 17,
    padding: 16,
    marginBottom: 25,
  },

  noteText: {
    fontSize: 13,
    lineHeight: 19,
    color: "#52617A",
  },

  helpCard: {
    backgroundColor: "#EAF0FF",
    borderRadius: 18,
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
  },

  helpIcon: {
    fontSize: 23,
    marginRight: 12,
  },

  helpTitle: {
    fontSize: 14,
    fontWeight: "900",
    color: "#17233C",
  },

  helpText: {
    fontSize: 11,
    color: "#52617A",
    marginTop: 3,
  },
});