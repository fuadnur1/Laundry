import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { router } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Pressable,
  RefreshControl,
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

export default function RiderJobsScreen() {
  const [tasks, setTasks] = useState<DeliveryTask[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
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

      await fetchTasks(parsedUser.id);
    } catch (error) {
      console.log("Rider initialization error:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchTasks = async (riderId?: string) => {
    try {
      const id = riderId || user?.id;

      if (!id) {
        return;
      }

      const response = await axios.get(
        `${API_URL}/delivery-tasks/rider/${id}`
      );

      setTasks(response.data.tasks || []);
    } catch (error: any) {
      console.log(
        "Rider tasks error:",
        error.response?.data || error.message
      );

      Alert.alert(
        "Could not load jobs",
        error.response?.data?.message ||
          "Unable to fetch your delivery tasks."
      );
    }
  };

  const onRefresh = useCallback(async () => {
    try {
      setRefreshing(true);
      await fetchTasks();
    } finally {
      setRefreshing(false);
    }
  }, [user]);

  const activeTasks = tasks.filter(
    (task) =>
      task.status !== "DELIVERED" &&
      task.status !== "FAILED"
  );

  const getTaskTitle = (task: DeliveryTask) => {
    if (task.task_type === "CUSTOMER_TO_PARTNER") {
      return "Customer Pickup";
    }

    return "Customer Delivery";
  };

  const getTaskDescription = (task: DeliveryTask) => {
    if (task.task_type === "CUSTOMER_TO_PARTNER") {
      return "Pick up laundry from the customer and take it to the laundry partner.";
    }

    return "Collect cleaned laundry from the partner and deliver it to the customer.";
  };

  const getPickupAddress = (task: DeliveryTask) => {
    const address = task.pickup_address_snapshot;

    if (!address) {
      return "Pickup address unavailable";
    }

    return [
      address.address_line,
      address.area,
      address.city,
    ]
      .filter(Boolean)
      .join(", ");
  };

  const getDropoffAddress = (task: DeliveryTask) => {
    const address = task.dropoff_address_snapshot;

    if (!address) {
      return "Drop-off address unavailable";
    }

    return [
      address.business_name,
      address.address_line,
      address.area,
      address.city,
    ]
      .filter(Boolean)
      .join(", ");
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "ACCEPTED":
        return "Accepted";

      case "ARRIVED":
        return "Arrived";

      case "COLLECTED":
        return "Collected";

      case "DELIVERED":
        return "Delivered";

      case "FAILED":
        return "Failed";

      default:
        return status;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "ACCEPTED":
        return "checkmark-circle-outline";

      case "ARRIVED":
        return "location-outline";

      case "COLLECTED":
        return "bag-check-outline";

      case "DELIVERED":
        return "checkmark-done-circle-outline";

      case "FAILED":
        return "close-circle-outline";

      default:
        return "time-outline";
    }
  };

  const formatDate = (value?: string | null) => {
    if (!value) {
      return "";
    }

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
          Loading rider jobs...
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.screen}>
      <ScrollView
        contentContainerStyle={styles.container}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
          />
        }
      >
        {/* HEADER */}

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
              name="bicycle-outline"
              size={24}
              color="#155EEF"
            />
          </View>
        </View>

        {/* TITLE */}

        <View style={styles.titleRow}>
          <View>
            <Text style={styles.pageTitle}>
              Assigned Jobs
            </Text>

            <Text style={styles.pageSubtitle}>
              Your active pickup and delivery tasks.
            </Text>
          </View>

          <View style={styles.countBadge}>
            <Text style={styles.countNumber}>
              {activeTasks.length}
            </Text>
          </View>
        </View>

        {/* INFO CARD */}

        <View style={styles.infoCard}>
          <View style={styles.infoIcon}>
            <Ionicons
              name="information-circle-outline"
              size={23}
              color="#155EEF"
            />
          </View>

          <Text style={styles.infoText}>
            Complete each delivery step carefully.
            Pull down to refresh your assignments.
          </Text>
        </View>

        {/* EMPTY STATE */}

        {activeTasks.length === 0 ? (
          <View style={styles.emptyCard}>
            <View style={styles.emptyIcon}>
              <Ionicons
                name="cube-outline"
                size={38}
                color="#155EEF"
              />
            </View>

            <Text style={styles.emptyTitle}>
              No active jobs
            </Text>

            <Text style={styles.emptyText}>
              You currently have no pickup or delivery
              assignments.
            </Text>

            <Pressable
              style={styles.refreshButton}
              onPress={() => fetchTasks()}
            >
              <Ionicons
                name="refresh-outline"
                size={18}
                color="#FFFFFF"
              />

              <Text style={styles.refreshButtonText}>
                Refresh Jobs
              </Text>
            </Pressable>
          </View>
        ) : (
          activeTasks.map((task) => (
            <Pressable
              key={task.id}
              style={styles.jobCard}
              onPress={() =>
                router.push({
                  pathname: "/rider/job/[taskId]",
                  params: {
                    taskId: task.id,
                  },
                })
              }
            >
              {/* JOB TOP */}

              <View style={styles.jobTop}>
                <View style={styles.taskTypeIcon}>
                  <Ionicons
                    name={
                      task.task_type ===
                      "CUSTOMER_TO_PARTNER"
                        ? "arrow-forward-outline"
                        : "arrow-back-outline"
                    }
                    size={21}
                    color="#155EEF"
                  />
                </View>

                <View style={styles.jobHeading}>
                  <Text style={styles.jobTitle}>
                    {getTaskTitle(task)}
                  </Text>

                  <Text style={styles.orderNumber}>
                    Order #{task.order_id.slice(0, 8)}
                  </Text>
                </View>

                <View style={styles.statusBadge}>
                  <Ionicons
                    name={
                      getStatusIcon(task.status) as any
                    }
                    size={14}
                    color="#155EEF"
                  />

                  <Text style={styles.statusText}>
                    {getStatusLabel(task.status)}
                  </Text>
                </View>
              </View>

              <Text style={styles.jobDescription}>
                {getTaskDescription(task)}
              </Text>

              {/* ROUTE */}

              <View style={styles.routeCard}>
                <View style={styles.routeRow}>
                  <View
                    style={styles.pickupDot}
                  />

                  <View style={styles.routeContent}>
                    <Text style={styles.routeLabel}>
                      PICKUP
                    </Text>

                    <Text style={styles.routeAddress}>
                      {getPickupAddress(task)}
                    </Text>
                  </View>
                </View>

                <View style={styles.routeLine} />

                <View style={styles.routeRow}>
                  <View
                    style={styles.dropoffDot}
                  />

                  <View style={styles.routeContent}>
                    <Text style={styles.routeLabel}>
                      DROP-OFF
                    </Text>

                    <Text style={styles.routeAddress}>
                      {getDropoffAddress(task)}
                    </Text>
                  </View>
                </View>
              </View>

              {/* ACCEPTED TIME */}

              {task.accepted_at && (
                <View style={styles.timeRow}>
                  <Ionicons
                    name="time-outline"
                    size={16}
                    color="#6B7280"
                  />

                  <Text style={styles.timeText}>
                    Accepted{" "}
                    {formatDate(task.accepted_at)}
                  </Text>
                </View>
              )}

              {/* FOOTER */}

              <View style={styles.jobFooter}>
                <Text style={styles.viewText}>
                  View Job Details
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

      {/* BOTTOM NAV */}

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

        <Pressable style={styles.navItem}>
          <Ionicons
            name="cube"
            size={22}
            color="#155EEF"
          />

          <Text style={styles.activeNav}>
            Jobs
          </Text>
        </Pressable>

        <Pressable
          style={styles.navItem}
          onPress={() =>
            router.replace("/rider/history")
          }
        >
          <Ionicons
            name="time-outline"
            size={22}
            color="#8A93A4"
          />

          <Text style={styles.navText}>
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
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F7F9FC",
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
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 28,
  },

  brand: {
    color: "#155EEF",
    fontSize: 20,
    fontWeight: "900",
  },

  role: {
    color: "#8A93A4",
    fontSize: 10,
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

  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 20,
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
  },

  countBadge: {
    minWidth: 48,
    height: 48,
    borderRadius: 15,
    backgroundColor: "#155EEF",
    justifyContent: "center",
    alignItems: "center",
  },

  countNumber: {
    color: "#FFFFFF",
    fontSize: 19,
    fontWeight: "900",
  },

  infoCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFF4C7",
    borderRadius: 17,
    padding: 15,
    marginBottom: 22,
  },

  infoIcon: {
    width: 39,
    height: 39,
    borderRadius: 12,
    backgroundColor: "#FFFFFF",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 11,
  },

  infoText: {
    flex: 1,
    fontSize: 11,
    color: "#52617A",
    lineHeight: 17,
  },

  emptyCard: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E5EAF2",
    borderRadius: 22,
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
    marginBottom: 16,
  },

  emptyTitle: {
    fontSize: 19,
    fontWeight: "900",
    color: "#17233C",
  },

  emptyText: {
    textAlign: "center",
    color: "#6B7280",
    fontSize: 12,
    lineHeight: 18,
    marginTop: 7,
    maxWidth: 280,
  },

  refreshButton: {
    marginTop: 20,
    backgroundColor: "#155EEF",
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
    borderRadius: 13,
    paddingHorizontal: 18,
    paddingVertical: 12,
  },

  refreshButtonText: {
    color: "#FFFFFF",
    fontWeight: "900",
    fontSize: 12,
  },

  jobCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#E5EAF2",
    padding: 17,
    marginBottom: 15,
  },

  jobTop: {
    flexDirection: "row",
    alignItems: "center",
  },

  taskTypeIcon: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: "#FFF4C7",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 11,
  },

  jobHeading: {
    flex: 1,
  },

  jobTitle: {
    fontSize: 15,
    fontWeight: "900",
    color: "#17233C",
  },

  orderNumber: {
    fontSize: 10,
    color: "#8A93A4",
    marginTop: 3,
  },

  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "#EAF0FF",
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },

  statusText: {
    fontSize: 9,
    fontWeight: "900",
    color: "#155EEF",
  },

  jobDescription: {
    fontSize: 11,
    color: "#6B7280",
    lineHeight: 17,
    marginTop: 14,
    marginBottom: 15,
  },

  routeCard: {
    backgroundColor: "#F9FAFC",
    borderRadius: 15,
    padding: 14,
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
    height: 25,
    backgroundColor: "#DCE3EE",
    marginLeft: 4.5,
    marginVertical: 4,
  },

  routeContent: {
    flex: 1,
  },

  routeLabel: {
    fontSize: 9,
    fontWeight: "900",
    color: "#8A93A4",
  },

  routeAddress: {
    fontSize: 12,
    color: "#17233C",
    fontWeight: "700",
    marginTop: 3,
    lineHeight: 17,
  },

  timeRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: 13,
  },

  timeText: {
    fontSize: 10,
    color: "#6B7280",
  },

  jobFooter: {
    borderTopWidth: 1,
    borderTopColor: "#EEF1F5",
    marginTop: 14,
    paddingTop: 13,
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
    bottom: 0,
    left: 0,
    right: 0,
    height: 82,
    backgroundColor: "#FFFFFF",
    borderTopWidth: 1,
    borderTopColor: "#E5EAF2",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-around",
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