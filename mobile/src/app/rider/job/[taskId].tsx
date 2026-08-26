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

export default function RiderJobDetailsScreen() {
  const { taskId } = useLocalSearchParams<{
    taskId: string;
  }>();

  const [task, setTask] = useState<DeliveryTask | null>(
    null
  );

  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    initialize();
  }, [taskId]);

  const initialize = async () => {
    try {
      const storedUser = await AsyncStorage.getItem(
        "user"
      );

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

      await fetchTask();
    } catch (error) {
      console.log(
        "Rider job initialization error:",
        error
      );
    } finally {
      setLoading(false);
    }
  };

  const fetchTask = async () => {
    try {
      const response = await axios.get(
        `${API_URL}/delivery-tasks/${taskId}`
      );

      setTask(response.data.task);
    } catch (error: any) {
      console.log(
        "Job details error:",
        error.response?.data || error.message
      );

      Alert.alert(
        "Could not load job",
        error.response?.data?.message ||
          "Unable to fetch this delivery task."
      );
    }
  };

  const updateStatus = async (
    newStatus:
      | "ARRIVED"
      | "COLLECTED"
      | "DELIVERED"
      | "FAILED"
  ) => {
    if (!task) return;

    try {
      setUpdating(true);

      const response = await axios.patch(
        `${API_URL}/delivery-tasks/${task.id}/status`,
        {
          status: newStatus,
        }
      );

      setTask(response.data.task);

      Alert.alert(
        "Success",
        `Job updated to ${newStatus}.`
      );

      if (newStatus === "DELIVERED") {
        router.replace("/rider/history");
      }
    } catch (error: any) {
      console.log(
        "Status update error:",
        error.response?.data || error.message
      );

      Alert.alert(
        "Update Failed",
        error.response?.data?.message ||
          "Could not update the job status."
      );
    } finally {
      setUpdating(false);
    }
  };

  const getPickupAddress = () => {
    const address =
      task?.pickup_address_snapshot;

    if (!address) {
      return "Pickup address unavailable";
    }

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

  const getDropoffAddress = () => {
    const address =
      task?.dropoff_address_snapshot;

    if (!address) {
      return "Drop-off address unavailable";
    }

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

  const getTaskTitle = () => {
    if (
      task?.task_type ===
      "CUSTOMER_TO_PARTNER"
    ) {
      return "Customer Pickup";
    }

    return "Customer Delivery";
  };

  const getTaskDescription = () => {
    if (
      task?.task_type ===
      "CUSTOMER_TO_PARTNER"
    ) {
      return "Pick up the customer's laundry and deliver it to the laundry partner.";
    }

    return "Collect the cleaned laundry from the partner and deliver it to the customer.";
  };

  const formatDate = (
    value?: string | null
  ) => {
    if (!value) return "Not completed";

    return new Date(value).toLocaleString();
  };

  const getNextAction = () => {
    if (!task) return null;

    switch (task.status) {
      case "ACCEPTED":
        return {
          label: "Mark as Arrived",
          status: "ARRIVED" as const,
          icon: "location-outline" as const,
        };

      case "ARRIVED":
        return {
          label: "Mark as Collected",
          status: "COLLECTED" as const,
          icon: "bag-check-outline" as const,
        };

      case "COLLECTED":
        return {
          label: "Mark as Delivered",
          status: "DELIVERED" as const,
          icon: "checkmark-done-outline" as const,
        };

      default:
        return null;
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingScreen}>
        <ActivityIndicator
          size="large"
          color="#155EEF"
        />

        <Text style={styles.loadingText}>
          Loading job details...
        </Text>
      </View>
    );
  }

  if (!task) {
    return (
      <View style={styles.loadingScreen}>
        <Ionicons
          name="alert-circle-outline"
          size={42}
          color="#D14343"
        />

        <Text style={styles.errorTitle}>
          Job not found
        </Text>

        <Pressable
          style={styles.backButton}
          onPress={() =>
            router.replace("/rider/jobs")
          }
        >
          <Text style={styles.backButtonText}>
            Back to Jobs
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
        {/* HEADER */}

        <View style={styles.header}>
          <Pressable
            style={styles.iconButton}
            onPress={() =>
              router.back()
            }
          >
            <Ionicons
              name="arrow-back"
              size={22}
              color="#17233C"
            />
          </Pressable>

          <View style={styles.headerTitleWrap}>
            <Text style={styles.brand}>
              SMART LAUNDRY
            </Text>

            <Text style={styles.role}>
              RIDER JOB DETAILS
            </Text>
          </View>

          <View style={styles.headerIcon}>
            <Ionicons
              name="bicycle-outline"
              size={23}
              color="#155EEF"
            />
          </View>
        </View>

        {/* HERO */}

        <View style={styles.heroCard}>
          <View style={styles.heroTop}>
            <View style={styles.heroIcon}>
              <Ionicons
                name={
                  task.task_type ===
                  "CUSTOMER_TO_PARTNER"
                    ? "arrow-forward-outline"
                    : "arrow-back-outline"
                }
                size={24}
                color="#155EEF"
              />
            </View>

            <View style={styles.heroContent}>
              <Text style={styles.heroLabel}>
                {task.status}
              </Text>

              <Text style={styles.heroTitle}>
                {getTaskTitle()}
              </Text>
            </View>
          </View>

          <Text style={styles.heroText}>
            {getTaskDescription()}
          </Text>

          <View style={styles.orderChip}>
            <Ionicons
              name="receipt-outline"
              size={15}
              color="#FFFFFF"
            />

            <Text style={styles.orderChipText}>
              Order #{task.order_id.slice(0, 8)}
            </Text>
          </View>
        </View>

        {/* ROUTE */}

        <Text style={styles.sectionTitle}>
          Delivery Route
        </Text>

        <View style={styles.routeCard}>
          <View style={styles.routeRow}>
            <View style={styles.pickupDot} />

            <View style={styles.routeContent}>
              <Text style={styles.routeLabel}>
                PICKUP
              </Text>

              <Text style={styles.routeAddress}>
                {getPickupAddress()}
              </Text>
            </View>
          </View>

          <View style={styles.routeLine} />

          <View style={styles.routeRow}>
            <View style={styles.dropoffDot} />

            <View style={styles.routeContent}>
              <Text style={styles.routeLabel}>
                DROP-OFF
              </Text>

              <Text style={styles.routeAddress}>
                {getDropoffAddress()}
              </Text>
            </View>
          </View>
        </View>

        {/* PROGRESS */}

        <Text style={styles.sectionTitle}>
          Job Progress
        </Text>

        <View style={styles.progressCard}>
          <ProgressItem
            icon="checkmark-circle-outline"
            title="Accepted"
            completed={
              task.accepted_at != null
            }
            time={formatDate(
              task.accepted_at
            )}
          />

          <ProgressItem
            icon="location-outline"
            title="Arrived"
            completed={
              task.arrived_at != null
            }
            time={formatDate(
              task.arrived_at
            )}
          />

          <ProgressItem
            icon="bag-check-outline"
            title="Collected"
            completed={
              task.collected_at != null
            }
            time={formatDate(
              task.collected_at
            )}
          />

          <ProgressItem
            icon="checkmark-done-outline"
            title="Delivered"
            completed={
              task.delivered_at != null
            }
            time={formatDate(
              task.delivered_at
            )}
            last
          />
        </View>

        {/* CURRENT STATUS */}

        <Text style={styles.sectionTitle}>
          Current Status
        </Text>

        <View style={styles.statusCard}>
          <View style={styles.statusIcon}>
            <Ionicons
              name="sync-outline"
              size={23}
              color="#155EEF"
            />
          </View>

          <View style={styles.statusContent}>
            <Text style={styles.statusTitle}>
              {task.status}
            </Text>

            <Text style={styles.statusText}>
              Keep the delivery status updated so
              customers can track their laundry.
            </Text>
          </View>
        </View>

        {/* NEXT ACTION */}

        {nextAction && (
          <>
            <Text style={styles.sectionTitle}>
              Next Action
            </Text>

            <Pressable
              style={[
                styles.primaryButton,
                updating &&
                  styles.disabledButton,
              ]}
              disabled={updating}
              onPress={() =>
                updateStatus(
                  nextAction.status
                )
              }
            >
              <Ionicons
                name={nextAction.icon}
                size={20}
                color="#FFFFFF"
              />

              <Text
                style={
                  styles.primaryButtonText
                }
              >
                {updating
                  ? "Updating..."
                  : nextAction.label}
              </Text>
            </Pressable>

            <Text style={styles.actionHint}>
              Status updates are saved to the
              delivery task immediately.
            </Text>
          </>
        )}

        {/* COMPLETED */}

        {task.status === "DELIVERED" && (
          <View style={styles.completedCard}>
            <Ionicons
              name="checkmark-circle"
              size={36}
              color="#155EEF"
            />

            <View style={{ flex: 1 }}>
              <Text
                style={
                  styles.completedTitle
                }
              >
                Delivery Completed
              </Text>

              <Text
                style={
                  styles.completedText
                }
              >
                This job has been successfully
                delivered.
              </Text>
            </View>
          </View>
        )}

        {/* FAILED OPTION */}

        {task.status !== "DELIVERED" &&
          task.status !== "FAILED" && (
            <Pressable
              style={styles.failedButton}
              disabled={updating}
              onPress={() =>
                Alert.alert(
                  "Mark Job as Failed?",
                  "Use this only if the delivery cannot be completed.",
                  [
                    {
                      text: "Cancel",
                      style: "cancel",
                    },
                    {
                      text: "Mark Failed",
                      style: "destructive",
                      onPress: () =>
                        updateStatus(
                          "FAILED"
                        ),
                    },
                  ]
                )
              }
            >
              <Ionicons
                name="warning-outline"
                size={18}
                color="#D14343"
              />

              <Text
                style={
                  styles.failedButtonText
                }
              >
                Report Delivery Failure
              </Text>
            </Pressable>
          )}

        <Pressable
          style={styles.jobsButton}
          onPress={() =>
            router.replace("/rider/jobs")
          }
        >
          <Ionicons
            name="list-outline"
            size={19}
            color="#155EEF"
          />

          <Text style={styles.jobsButtonText}>
            Back to Assigned Jobs
          </Text>
        </Pressable>
      </ScrollView>
    </View>
  );
}

function ProgressItem({
  icon,
  title,
  completed,
  time,
  last,
}: {
  icon: any;
  title: string;
  completed: boolean;
  time: string;
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
          styles.progressIcon,
          completed &&
            styles.progressIconCompleted,
        ]}
      >
        <Ionicons
          name={icon}
          size={20}
          color={
            completed
              ? "#FFFFFF"
              : "#8A93A4"
          }
        />
      </View>

      <View style={styles.progressContent}>
        <Text
          style={[
            styles.progressTitle,
            completed &&
              styles.progressTitleCompleted,
          ]}
        >
          {title}
        </Text>

        <Text style={styles.progressTime}>
          {time}
        </Text>
      </View>

      {completed && (
        <Ionicons
          name="checkmark"
          size={20}
          color="#155EEF"
        />
      )}
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
    paddingBottom: 55,
  },

  loadingScreen: {
    flex: 1,
    backgroundColor: "#F7F9FC",
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
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
    marginTop: 12,
  },

  backButton: {
    marginTop: 18,
    backgroundColor: "#155EEF",
    borderRadius: 13,
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

  iconButton: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E5EAF2",
    justifyContent: "center",
    alignItems: "center",
  },

  headerTitleWrap: {
    flex: 1,
    marginLeft: 13,
  },

  brand: {
    fontSize: 18,
    fontWeight: "900",
    color: "#155EEF",
  },

  role: {
    fontSize: 9,
    fontWeight: "800",
    color: "#8A93A4",
    marginTop: 3,
    letterSpacing: 1,
  },

  headerIcon: {
    width: 45,
    height: 45,
    borderRadius: 14,
    backgroundColor: "#FFF4C7",
    justifyContent: "center",
    alignItems: "center",
  },

  heroCard: {
    backgroundColor: "#155EEF",
    borderRadius: 23,
    padding: 20,
    marginBottom: 26,
  },

  heroTop: {
    flexDirection: "row",
    alignItems: "center",
  },

  heroIcon: {
    width: 49,
    height: 49,
    borderRadius: 15,
    backgroundColor: "#FFF4C7",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 13,
  },

  heroContent: {
    flex: 1,
  },

  heroLabel: {
    fontSize: 10,
    color: "#FFF4C7",
    fontWeight: "900",
  },

  heroTitle: {
    fontSize: 21,
    color: "#FFFFFF",
    fontWeight: "900",
    marginTop: 4,
  },

  heroText: {
    marginTop: 14,
    fontSize: 12,
    lineHeight: 18,
    color: "#DDE8FF",
  },

  orderChip: {
    marginTop: 16,
    alignSelf: "flex-start",
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor:
      "rgba(255,255,255,0.16)",
    paddingHorizontal: 11,
    paddingVertical: 7,
    borderRadius: 18,
  },

  orderChipText: {
    color: "#FFFFFF",
    fontSize: 10,
    fontWeight: "800",
  },

  sectionTitle: {
    fontSize: 17,
    fontWeight: "900",
    color: "#17233C",
    marginBottom: 12,
    marginTop: 2,
  },

  routeCard: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E5EAF2",
    borderRadius: 19,
    padding: 17,
    marginBottom: 25,
  },

  routeRow: {
    flexDirection: "row",
    alignItems: "flex-start",
  },

  pickupDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: "#155EEF",
    marginTop: 4,
    marginRight: 12,
  },

  dropoffDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: "#FFC928",
    marginTop: 4,
    marginRight: 12,
  },

  routeLine: {
    width: 2,
    height: 31,
    backgroundColor: "#DCE3EE",
    marginLeft: 5,
    marginVertical: 5,
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
    marginTop: 4,
    fontSize: 13,
    lineHeight: 19,
    color: "#17233C",
    fontWeight: "800",
  },

  progressCard: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E5EAF2",
    borderRadius: 19,
    padding: 17,
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

  progressIcon: {
    width: 42,
    height: 42,
    borderRadius: 13,
    backgroundColor: "#EEF1F5",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },

  progressIconCompleted: {
    backgroundColor: "#155EEF",
  },

  progressContent: {
    flex: 1,
  },

  progressTitle: {
    fontSize: 13,
    fontWeight: "800",
    color: "#8A93A4",
  },

  progressTitleCompleted: {
    color: "#17233C",
  },

  progressTime: {
    fontSize: 10,
    color: "#8A93A4",
    marginTop: 3,
  },

  statusCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFF4C7",
    borderRadius: 18,
    padding: 16,
    marginBottom: 25,
  },

  statusIcon: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: "#FFFFFF",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },

  statusContent: {
    flex: 1,
  },

  statusTitle: {
    fontSize: 14,
    fontWeight: "900",
    color: "#17233C",
  },

  statusText: {
    marginTop: 4,
    fontSize: 11,
    lineHeight: 16,
    color: "#6B7280",
  },

  primaryButton: {
    backgroundColor: "#155EEF",
    borderRadius: 15,
    paddingVertical: 16,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 8,
  },

  disabledButton: {
    opacity: 0.6,
  },

  primaryButtonText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "900",
  },

  actionHint: {
    textAlign: "center",
    marginTop: 9,
    marginBottom: 24,
    fontSize: 10,
    color: "#8A93A4",
  },

  completedCard: {
    flexDirection: "row",
    gap: 13,
    alignItems: "center",
    backgroundColor: "#EAF0FF",
    borderRadius: 18,
    padding: 17,
    marginBottom: 20,
  },

  completedTitle: {
    fontSize: 14,
    fontWeight: "900",
    color: "#17233C",
  },

  completedText: {
    fontSize: 11,
    color: "#6B7280",
    marginTop: 3,
  },

  failedButton: {
    borderWidth: 1,
    borderColor: "#F0CACA",
    backgroundColor: "#FFF7F7",
    borderRadius: 14,
    paddingVertical: 14,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 7,
    marginBottom: 13,
  },

  failedButtonText: {
    color: "#D14343",
    fontSize: 12,
    fontWeight: "900",
  },

  jobsButton: {
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

  jobsButtonText: {
    color: "#155EEF",
    fontSize: 12,
    fontWeight: "900",
  },
});