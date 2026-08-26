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

export default function NotificationsScreen() {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadNotifications();
  }, []);

  const loadNotifications = async () => {
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

      const orders = response.data.data || [];

      const generatedNotifications = orders.map((order: any) => ({
        id: order.id,
        orderId: order.id,
        title: getNotificationTitle(order.status),
        message: getNotificationMessage(
          order.status,
          order.order_number
        ),
        status: order.status,
        createdAt: order.updated_at || order.created_at,
      }));

      setNotifications(generatedNotifications);
    } catch (error) {
      console.log("Notification error:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.screen}>
      <ScrollView
        contentContainerStyle={styles.container}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Pressable
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Ionicons
              name="arrow-back"
              size={21}
              color="#17233C"
            />
          </Pressable>

          <View style={styles.headerCenter}>
            <Text style={styles.brand}>
              SMART LAUNDRY
            </Text>

            <Text style={styles.tagline}>
              Laundry in One Tap
            </Text>
          </View>

          <View style={styles.headerSpacer} />
        </View>

        <Text style={styles.title}>
          Notifications
        </Text>

        <Text style={styles.subtitle}>
          Stay updated on your laundry orders.
        </Text>

        {loading ? (
          <ActivityIndicator
            size="large"
            color="#155EEF"
            style={{ marginTop: 50 }}
          />
        ) : notifications.length === 0 ? (
          <View style={styles.emptyCard}>
            <View style={styles.emptyIcon}>
              <Ionicons
                name="notifications-outline"
                size={34}
                color="#155EEF"
              />
            </View>

            <Text style={styles.emptyTitle}>
              No notifications yet
            </Text>

            <Text style={styles.emptyText}>
              Order updates will appear here.
            </Text>
          </View>
        ) : (
          notifications.map((notification) => (
            <Pressable
              key={notification.id}
              style={styles.card}
              onPress={() =>
                router.push({
                  pathname:
                    "/order-details/[orderId]",
                  params: {
                    orderId: notification.orderId,
                  },
                })
              }
            >
              <View style={styles.iconBox}>
                <Ionicons
                  name={getNotificationIcon(
                    notification.status
                  )}
                  size={23}
                  color="#155EEF"
                />
              </View>

              <View style={styles.content}>
                <Text style={styles.notificationTitle}>
                  {notification.title}
                </Text>

                <Text style={styles.message}>
                  {notification.message}
                </Text>

                <Text style={styles.date}>
                  {new Date(
                    notification.createdAt
                  ).toLocaleString()}
                </Text>
              </View>

              <Ionicons
                name="chevron-forward"
                size={18}
                color="#8A93A4"
              />
            </Pressable>
          ))
        )}
      </ScrollView>
    </View>
  );
}

function getNotificationTitle(status: string) {
  switch (status) {
    case "PLACED":
      return "Order Placed";

    case "RIDER_ASSIGNED":
      return "Rider Assigned";

    case "PICKED_UP":
      return "Laundry Picked Up";

    case "CLEANING":
      return "Cleaning Started";

    case "QUALITY_CHECK":
      return "Quality Check";

    case "OUT_FOR_DELIVERY":
      return "Out for Delivery";

    case "DELIVERED":
      return "Order Delivered";

    default:
      return "Order Update";
  }
}

function getNotificationMessage(
  status: string,
  orderNumber: string
) {
  switch (status) {
    case "PLACED":
      return `${orderNumber} has been placed successfully.`;

    case "RIDER_ASSIGNED":
      return `A rider has been assigned to ${orderNumber}.`;

    case "PICKED_UP":
      return `Your laundry for ${orderNumber} has been collected.`;

    case "CLEANING":
      return `Cleaning has started for ${orderNumber}.`;

    case "QUALITY_CHECK":
      return `${orderNumber} is undergoing quality checking.`;

    case "OUT_FOR_DELIVERY":
      return `${orderNumber} is on the way to you.`;

    case "DELIVERED":
      return `${orderNumber} has been delivered successfully.`;

    default:
      return `${orderNumber} has a new update.`;
  }
}

function getNotificationIcon(status: string): any {
  switch (status) {
    case "PLACED":
      return "checkmark-circle-outline";

    case "RIDER_ASSIGNED":
      return "bicycle-outline";

    case "PICKED_UP":
      return "bag-handle-outline";

    case "CLEANING":
      return "water-outline";

    case "QUALITY_CHECK":
      return "shield-checkmark-outline";

    case "OUT_FOR_DELIVERY":
      return "car-outline";

    case "DELIVERED":
      return "home-outline";

    default:
      return "notifications-outline";
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
    paddingBottom: 40,
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

  headerCenter: {
    flex: 1,
    alignItems: "center",
  },

  headerSpacer: {
    width: 42,
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

  card: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E5EAF2",
    borderRadius: 18,
    padding: 16,
    marginBottom: 12,
    flexDirection: "row",
    alignItems: "center",
  },

  iconBox: {
    width: 48,
    height: 48,
    borderRadius: 15,
    backgroundColor: "#FFF4C7",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 13,
  },

  content: {
    flex: 1,
  },

  notificationTitle: {
    fontSize: 14,
    fontWeight: "900",
    color: "#17233C",
  },

  message: {
    fontSize: 12,
    color: "#6B7280",
    lineHeight: 18,
    marginTop: 4,
  },

  date: {
    fontSize: 10,
    color: "#A0A7B4",
    marginTop: 6,
  },

  emptyCard: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E5EAF2",
    borderRadius: 20,
    padding: 30,
    alignItems: "center",
    marginTop: 20,
  },

  emptyIcon: {
    width: 68,
    height: 68,
    borderRadius: 22,
    backgroundColor: "#FFF4C7",
    justifyContent: "center",
    alignItems: "center",
  },

  emptyTitle: {
    fontSize: 18,
    fontWeight: "900",
    color: "#17233C",
    marginTop: 14,
  },

  emptyText: {
    fontSize: 12,
    color: "#6B7280",
    marginTop: 5,
  },
});