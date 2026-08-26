import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
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

const API_URL = "http://localhost:5000/api/v1";

type DeliveryTask = {
  id: string;
  order_id: string;
  rider_id: string | null;
  task_type:
    | "CUSTOMER_TO_PARTNER"
    | "PARTNER_TO_CUSTOMER";
  status:
    | "AVAILABLE"
    | "ACCEPTED"
    | "ARRIVED"
    | "COLLECTED"
    | "DELIVERED"
    | "FAILED";
  pickup_address_snapshot: any;
  dropoff_address_snapshot: any;
  accepted_at?: string | null;
  arrived_at?: string | null;
  collected_at?: string | null;
  delivered_at?: string | null;
  created_at: string;
  updated_at: string;
};

export default function RiderHistoryScreen() {
  const [tasks, setTasks] = useState<DeliveryTask[]>([]);
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

      if (Number(parsedUser.role_id) !== 2) {
        Alert.alert(
          "Access Denied",
          "This page is only available for riders."
        );

        router.replace("/login");
        return;
      }

      setUser(parsedUser);

      await fetchHistory(parsedUser.id);
    } catch (error) {
      console.log("History initialization error:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchHistory = async (riderId?: string) => {
    try {
      const id = riderId || user?.id;

      if (!id) return;

      const response = await axios.get(
        `${API_URL}/delivery-tasks/rider/${id}`
      );

      const allTasks = response.data.tasks || [];

      const historyTasks = allTasks.filter(
        (task: DeliveryTask) =>
          task.status === "DELIVERED" ||
          task.status === "FAILED"
      );

      setTasks(historyTasks);
    } catch (error: any) {
      console.log(
        "History fetch error:",
        error.response?.data || error.message
      );

      Alert.alert(
        "Could not load history",
        error.response?.data?.message ||
          "Unable to fetch delivery history."
      );
    }
  };

  const getPickupAddress = (task: DeliveryTask) => {
    const address = task.pickup_address_snapshot;

    if (!address) return "Pickup address unavailable";

    return [
      address.label,
      address.business_name,
      address.address_line,
      address.area,
      address.city,
    ]
      .filter(Boolean)
      .join(", ");
  };

  const getDropoffAddress = (task: DeliveryTask) => {
    const address = task.dropoff_address_snapshot;

    if (!address) return "Drop-off address unavailable";

    return [
      address.label,
      address.business_name,
      address.address_line,
      address.area,
      address.city,
    ]
      .filter(Boolean)
      .join(", ");
  };

  const formatDate = (value?: string | null) => {
    if (!value) return "No completion time";

    return new Date(value).toLocaleString();
  };

  const getTaskTitle = (task: DeliveryTask) => {
    if (task.task_type === "CUSTOMER_TO_PARTNER") {
      return "Customer Pickup";
    }

    return "Customer Delivery";
  };

  if (loading) {
    return (
      <View style={styles.loadingScreen}>
        <ActivityIndicator
          size="large"
          color="#155EEF"
        />

        <Text style={styles.loadingText}>
          Loading delivery history...
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

            <Text style={styles.role}>
              RIDER PANEL
            </Text>
          </View>

          <View style={styles.headerIcon}>
            <Ionicons
              name="time-outline"
              size={24}
              color="#155EEF"
            />
          </View>
        </View>

        <Text style={styles.pageTitle}>
          Delivery History
        </Text>

        <Text style={styles.pageSubtitle}>
          Completed and failed delivery jobs.
        </Text>

        <View style={styles.summaryCard}>
          <View style={styles.summaryIcon}>
            <Ionicons
              name="checkmark-done-outline"
              size={25}
              color="#155EEF"
            />
          </View>

          <View>
            <Text style={styles.summaryNumber}>
              {
                tasks.filter(
                  (task) => task.status === "DELIVERED"
                ).length
              }
            </Text>

            <Text style={styles.summaryLabel}>
              Completed Deliveries
            </Text>
          </View>
        </View>

        {tasks.length === 0 ? (
          <View style={styles.emptyCard}>
            <View style={styles.emptyIcon}>
              <Ionicons
                name="time-outline"
                size={38}
                color="#155EEF"
              />
            </View>

            <Text style={styles.emptyTitle}>
              No delivery history
            </Text>

            <Text style={styles.emptyText}>
              Completed jobs will appear here after you
              finish a delivery.
            </Text>
          </View>
        ) : (
          tasks.map((task) => (
            <Pressable
              key={task.id}
              style={styles.historyCard}
              onPress={() =>
                router.push({
                  pathname: "/rider/job/[taskId]",
                  params: {
                    taskId: task.id,
                  },
                })
              }
            >
              <View style={styles.cardTop}>
                <View
                  style={[
                    styles.statusIcon,
                    task.status === "FAILED" &&
                      styles.failedStatusIcon,
                  ]}
                >
                  <Ionicons
                    name={
                      task.status === "DELIVERED"
                        ? "checkmark-done-outline"
                        : "warning-outline"
                    }
                    size={22}
                    color={
                      task.status === "DELIVERED"
                        ? "#155EEF"
                        : "#D14343"
                    }
                  />
                </View>

                <View style={styles.cardHeading}>
                  <Text style={styles.cardTitle}>
                    {getTaskTitle(task)}
                  </Text>

                  <Text style={styles.orderText}>
                    Order #{task.order_id.slice(0, 8)}
                  </Text>
                </View>

                <View
                  style={[
                    styles.statusBadge,
                    task.status === "FAILED" &&
                      styles.failedBadge,
                  ]}
                >
                  <Text
                    style={[
                      styles.statusBadgeText,
                      task.status === "FAILED" &&
                        styles.failedBadgeText,
                    ]}
                  >
                    {task.status}
                  </Text>
                </View>
              </View>

              <View style={styles.routeBox}>
                <View style={styles.routeRow}>
                  <View style={styles.pickupDot} />

                  <View style={{ flex: 1 }}>
                    <Text style={styles.routeLabel}>
                      PICKUP
                    </Text>

                    <Text style={styles.routeText}>
                      {getPickupAddress(task)}
                    </Text>
                  </View>
                </View>

                <View style={styles.routeLine} />

                <View style={styles.routeRow}>
                  <View style={styles.dropoffDot} />

                  <View style={{ flex: 1 }}>
                    <Text style={styles.routeLabel}>
                      DROP-OFF
                    </Text>

                    <Text style={styles.routeText}>
                      {getDropoffAddress(task)}
                    </Text>
                  </View>
                </View>
              </View>

              <View style={styles.completedRow}>
                <Ionicons
                  name="calendar-outline"
                  size={16}
                  color="#6B7280"
                />

                <Text style={styles.completedText}>
                  {task.status === "DELIVERED"
                    ? `Delivered ${formatDate(
                        task.delivered_at
                      )}`
                    : `Last updated ${formatDate(
                        task.updated_at
                      )}`}
                </Text>
              </View>

              <View style={styles.footerRow}>
                <Text style={styles.viewText}>
                  View Details
                </Text>

                <Ionicons
                  name="chevron-forward"
                  size={20}
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
            router.replace("/rider/home")
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
            router.replace("/rider/jobs")
          }
        >
          <Ionicons
            name="cube-outline"
            size={22}
            color="#8A93A4"
          />
          <Text style={styles.navText}>
            Jobs
          </Text>
        </Pressable>

        <Pressable style={styles.navItem}>
          <Ionicons
            name="time"
            size={22}
            color="#155EEF"
          />
          <Text style={styles.activeNav}>
            History
          </Text>
        </Pressable>

        <Pressable
          style={styles.navItem}
          onPress={() =>
            router.replace("/rider/profile")
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
    marginBottom: 26,
  },

  brand: {
    fontSize: 20,
    fontWeight: "900",
    color: "#155EEF",
  },

  role: {
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

  summaryCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#155EEF",
    borderRadius: 20,
    padding: 18,
    marginBottom: 22,
  },

  summaryIcon: {
    width: 50,
    height: 50,
    borderRadius: 16,
    backgroundColor: "#FFF4C7",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 14,
  },

  summaryNumber: {
    fontSize: 24,
    fontWeight: "900",
    color: "#FFFFFF",
  },

  summaryLabel: {
    fontSize: 11,
    color: "#DDE8FF",
    marginTop: 2,
  },

  emptyCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 22,
    borderWidth: 1,
    borderColor: "#E5EAF2",
    padding: 30,
    alignItems: "center",
  },

  emptyIcon: {
    width: 70,
    height: 70,
    borderRadius: 22,
    backgroundColor: "#FFF4C7",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 15,
  },

  emptyTitle: {
    fontSize: 18,
    fontWeight: "900",
    color: "#17233C",
  },

  emptyText: {
    marginTop: 7,
    fontSize: 12,
    lineHeight: 18,
    color: "#6B7280",
    textAlign: "center",
  },

  historyCard: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E5EAF2",
    borderRadius: 20,
    padding: 17,
    marginBottom: 15,
  },

  cardTop: {
    flexDirection: "row",
    alignItems: "center",
  },

  statusIcon: {
    width: 45,
    height: 45,
    borderRadius: 14,
    backgroundColor: "#EAF0FF",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 11,
  },

  failedStatusIcon: {
    backgroundColor: "#FFF1F1",
  },

  cardHeading: {
    flex: 1,
  },

  cardTitle: {
    fontSize: 15,
    fontWeight: "900",
    color: "#17233C",
  },

  orderText: {
    marginTop: 3,
    fontSize: 10,
    color: "#8A93A4",
  },

  statusBadge: {
    backgroundColor: "#EAF0FF",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 20,
  },

  failedBadge: {
    backgroundColor: "#FFF1F1",
  },

  statusBadgeText: {
    fontSize: 9,
    fontWeight: "900",
    color: "#155EEF",
  },

  failedBadgeText: {
    color: "#D14343",
  },

  routeBox: {
    backgroundColor: "#F9FAFC",
    borderRadius: 15,
    padding: 14,
    marginTop: 15,
  },

  routeRow: {
    flexDirection: "row",
    alignItems: "flex-start",
  },

  pickupDot: {
    width: 11,
    height: 11,
    borderRadius: 6,
    backgroundColor: "#155EEF",
    marginTop: 4,
    marginRight: 11,
  },

  dropoffDot: {
    width: 11,
    height: 11,
    borderRadius: 6,
    backgroundColor: "#FFC928",
    marginTop: 4,
    marginRight: 11,
  },

  routeLine: {
    width: 2,
    height: 24,
    backgroundColor: "#DCE3EE",
    marginLeft: 4.5,
    marginVertical: 4,
  },

  routeLabel: {
    fontSize: 9,
    fontWeight: "900",
    color: "#8A93A4",
  },

  routeText: {
    fontSize: 12,
    color: "#17233C",
    fontWeight: "700",
    lineHeight: 17,
    marginTop: 3,
  },

  completedRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: 13,
  },

  completedText: {
    fontSize: 10,
    color: "#6B7280",
  },

  footerRow: {
    borderTopWidth: 1,
    borderTopColor: "#EEF1F5",
    paddingTop: 13,
    marginTop: 13,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  viewText: {
    fontSize: 11,
    color: "#155EEF",
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