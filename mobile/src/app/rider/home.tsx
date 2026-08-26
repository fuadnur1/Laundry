import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Alert,
  ActivityIndicator,
} from "react-native";
import { router } from "expo-router";

const API_URL = "http://localhost:5000/api/v1";

type DeliveryTask = {
  id: string;
  status:
    | "AVAILABLE"
    | "ACCEPTED"
    | "ARRIVED"
    | "COLLECTED"
    | "DELIVERED"
    | "FAILED";
};

export default function RiderHomeScreen() {
  const [user, setUser] = useState<any>(null);

  const [assignedJobs, setAssignedJobs] = useState(0);
  const [completedJobs, setCompletedJobs] = useState(0);

  const [statsLoading, setStatsLoading] = useState(true);

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
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

      await loadRiderStats(parsedUser.id);
    } catch (error) {
      console.log("Rider dashboard error:", error);
    } finally {
      setStatsLoading(false);
    }
  };

  const loadRiderStats = async (riderId: string) => {
    try {
      const response = await axios.get(
        `${API_URL}/delivery-tasks/rider/${riderId}`
      );

      const tasks: DeliveryTask[] =
        response.data.tasks || [];

      const activeTasks = tasks.filter(
        (task) =>
          task.status !== "DELIVERED" &&
          task.status !== "FAILED"
      );

      const deliveredTasks = tasks.filter(
        (task) => task.status === "DELIVERED"
      );

      setAssignedJobs(activeTasks.length);
      setCompletedJobs(deliveredTasks.length);
    } catch (error: any) {
      console.log(
        "Rider stats error:",
        error.response?.data || error.message
      );

      setAssignedJobs(0);
      setCompletedJobs(0);
    }
  };

  const handleLogout = async () => {
    await AsyncStorage.multiRemove([
      "user",
      "access_token",
      "refresh_token",
    ]);

    router.replace("/login");
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
            <Text style={styles.brand}>
              SMART LAUNDRY
            </Text>

            <Text style={styles.roleText}>
              RIDER PANEL
            </Text>
          </View>

          <View style={styles.avatar}>
            <Ionicons
              name="bicycle-outline"
              size={24}
              color="#155EEF"
            />
          </View>
        </View>

        {/* GREETING */}

        <Text style={styles.greeting}>
          Hi, {user?.name || "Rider"}
        </Text>

        <Text style={styles.heading}>
          Ready for today&apos;s deliveries?
        </Text>

        {/* STATUS CARD */}

        <View style={styles.statusCard}>
          <View style={styles.statusContent}>
            <Text style={styles.statusSmall}>
              CURRENT STATUS
            </Text>

            <Text style={styles.statusTitle}>
              Available for Jobs
            </Text>

            <Text style={styles.statusDescription}>
              Pickup and delivery tasks can be assigned
              to your rider account.
            </Text>
          </View>

          <View style={styles.onlineIcon}>
            <Ionicons
              name="checkmark-circle"
              size={34}
              color="#155EEF"
            />
          </View>
        </View>

        {/* STATS */}

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>
            Today&apos;s Overview
          </Text>

          <Pressable
            onPress={() =>
              user?.id && loadRiderStats(user.id)
            }
          >
            <Ionicons
              name="refresh-outline"
              size={20}
              color="#155EEF"
            />
          </Pressable>
        </View>

        <View style={styles.statsRow}>
          <Pressable
            style={styles.statCard}
            onPress={() =>
              router.push("/rider/jobs")
            }
          >
            <View style={styles.statIconYellow}>
              <Ionicons
                name="cube-outline"
                size={22}
                color="#155EEF"
              />
            </View>

            {statsLoading ? (
              <ActivityIndicator
                style={styles.statLoader}
                size="small"
                color="#155EEF"
              />
            ) : (
              <Text style={styles.statNumber}>
                {assignedJobs}
              </Text>
            )}

            <Text style={styles.statLabel}>
              Assigned Jobs
            </Text>
          </Pressable>

          <Pressable
            style={styles.statCard}
            onPress={() =>
              router.push("/rider/history")
            }
          >
            <View style={styles.statIconBlue}>
              <Ionicons
                name="checkmark-done-outline"
                size={22}
                color="#155EEF"
              />
            </View>

            {statsLoading ? (
              <ActivityIndicator
                style={styles.statLoader}
                size="small"
                color="#155EEF"
              />
            ) : (
              <Text style={styles.statNumber}>
                {completedJobs}
              </Text>
            )}

            <Text style={styles.statLabel}>
              Completed
            </Text>
          </Pressable>
        </View>

        {/* QUICK ACTIONS */}

        <Text style={styles.sectionTitle}>
          Quick Actions
        </Text>

        <Pressable
          style={styles.actionCard}
          onPress={() =>
            router.push("/rider/jobs")
          }
        >
          <View style={styles.actionIcon}>
            <Ionicons
              name="list-outline"
              size={23}
              color="#155EEF"
            />
          </View>

          <View style={styles.actionContent}>
            <Text style={styles.actionTitle}>
              Assigned Jobs
            </Text>

            <Text style={styles.actionText}>
              View pickup and delivery tasks assigned to
              you.
            </Text>
          </View>

          <Ionicons
            name="chevron-forward"
            size={20}
            color="#155EEF"
          />
        </Pressable>

        <Pressable
          style={styles.actionCard}
          onPress={() =>
            router.push("/rider/history")
          }
        >
          <View style={styles.actionIconYellow}>
            <Ionicons
              name="time-outline"
              size={23}
              color="#155EEF"
            />
          </View>

          <View style={styles.actionContent}>
            <Text style={styles.actionTitle}>
              Delivery History
            </Text>

            <Text style={styles.actionText}>
              Review your previously completed jobs.
            </Text>
          </View>

          <Ionicons
            name="chevron-forward"
            size={20}
            color="#155EEF"
          />
        </Pressable>

        {/* DELIVERY FLOW */}

        <Text style={styles.sectionTitle}>
          Rider Workflow
        </Text>

        <View style={styles.workflowCard}>
          <WorkflowItem
            icon="notifications-outline"
            title="1. Receive Task"
            text="Get a pickup or delivery assignment."
          />

          <WorkflowItem
            icon="navigate-outline"
            title="2. Go to Location"
            text="View the customer or laundry partner address."
          />

          <WorkflowItem
            icon="bag-handle-outline"
            title="3. Update Status"
            text="Mark the job as arrived, collected and delivered."
          />

          <WorkflowItem
            icon="checkmark-circle-outline"
            title="4. Complete Job"
            text="Finish the task and move it to delivery history."
            last
          />
        </View>

        {/* PROFILE */}

        <View style={styles.profileCard}>
          <View style={styles.profileIcon}>
            <Ionicons
              name="person-outline"
              size={22}
              color="#155EEF"
            />
          </View>

          <View style={styles.profileInfo}>
            <Text style={styles.profileName}>
              {user?.name || "Rider"}
            </Text>

            <Text style={styles.profileEmail}>
              {user?.email || ""}
            </Text>
          </View>

          <Pressable onPress={handleLogout}>
            <Ionicons
              name="log-out-outline"
              size={22}
              color="#D14343"
            />
          </Pressable>
        </View>
      </ScrollView>

      {/* BOTTOM NAV */}

      <View style={styles.bottomNav}>
        <Pressable style={styles.navItem}>
          <Ionicons
            name="home"
            size={22}
            color="#155EEF"
          />

          <Text style={styles.activeNav}>
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

function WorkflowItem({
  icon,
  title,
  text,
  last,
}: {
  icon: any;
  title: string;
  text: string;
  last?: boolean;
}) {
  return (
    <View
      style={[
        styles.workflowItem,
        last && styles.workflowItemLast,
      ]}
    >
      <View style={styles.workflowIcon}>
        <Ionicons
          name={icon}
          size={20}
          color="#155EEF"
        />
      </View>

      <View style={styles.workflowContent}>
        <Text style={styles.workflowTitle}>
          {title}
        </Text>

        <Text style={styles.workflowText}>
          {text}
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

  container: {
    padding: 22,
    paddingTop: 48,
    paddingBottom: 115,
  },

  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 28,
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
    marginTop: 3,
    letterSpacing: 1,
  },

  avatar: {
    width: 46,
    height: 46,
    borderRadius: 15,
    backgroundColor: "#FFF4C7",
    justifyContent: "center",
    alignItems: "center",
  },

  greeting: {
    fontSize: 16,
    color: "#6B7280",
  },

  heading: {
    fontSize: 29,
    lineHeight: 36,
    fontWeight: "900",
    color: "#17233C",
    marginTop: 5,
    marginBottom: 23,
  },

  statusCard: {
    backgroundColor: "#155EEF",
    borderRadius: 22,
    padding: 20,
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 28,
  },

  statusContent: {
    flex: 1,
  },

  statusSmall: {
    fontSize: 10,
    color: "#FFF4C7",
    fontWeight: "900",
  },

  statusTitle: {
    fontSize: 21,
    fontWeight: "900",
    color: "#FFFFFF",
    marginTop: 6,
  },

  statusDescription: {
    fontSize: 12,
    lineHeight: 18,
    color: "#DDE8FF",
    marginTop: 6,
    maxWidth: 230,
  },

  onlineIcon: {
    marginLeft: 16,
    width: 54,
    height: 54,
    borderRadius: 18,
    backgroundColor: "#FFF4C7",
    justifyContent: "center",
    alignItems: "center",
  },

  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 13,
  },

  sectionTitle: {
    fontSize: 18,
    fontWeight: "900",
    color: "#17233C",
    marginBottom: 13,
  },

  statsRow: {
    flexDirection: "row",
    gap: 13,
    marginBottom: 27,
  },

  statCard: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "#E5EAF2",
    padding: 16,
  },

  statIconYellow: {
    width: 43,
    height: 43,
    borderRadius: 14,
    backgroundColor: "#FFF4C7",
    justifyContent: "center",
    alignItems: "center",
  },

  statIconBlue: {
    width: 43,
    height: 43,
    borderRadius: 14,
    backgroundColor: "#EAF0FF",
    justifyContent: "center",
    alignItems: "center",
  },

  statNumber: {
    fontSize: 25,
    fontWeight: "900",
    color: "#17233C",
    marginTop: 13,
  },

  statLoader: {
    marginTop: 18,
    alignSelf: "flex-start",
  },

  statLabel: {
    fontSize: 11,
    color: "#6B7280",
    marginTop: 3,
  },

  actionCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "#E5EAF2",
    padding: 16,
    marginBottom: 12,
  },

  actionIcon: {
    width: 47,
    height: 47,
    borderRadius: 14,
    backgroundColor: "#EAF0FF",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 13,
  },

  actionIconYellow: {
    width: 47,
    height: 47,
    borderRadius: 14,
    backgroundColor: "#FFF4C7",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 13,
  },

  actionContent: {
    flex: 1,
  },

  actionTitle: {
    fontSize: 14,
    fontWeight: "900",
    color: "#17233C",
  },

  actionText: {
    fontSize: 11,
    color: "#6B7280",
    lineHeight: 16,
    marginTop: 4,
  },

  workflowCard: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E5EAF2",
    borderRadius: 20,
    padding: 17,
    marginBottom: 24,
  },

  workflowItem: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#EEF1F5",
    paddingBottom: 15,
    marginBottom: 15,
  },

  workflowItemLast: {
    borderBottomWidth: 0,
    paddingBottom: 0,
    marginBottom: 0,
  },

  workflowIcon: {
    width: 42,
    height: 42,
    borderRadius: 13,
    backgroundColor: "#FFF4C7",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },

  workflowContent: {
    flex: 1,
  },

  workflowTitle: {
    fontSize: 13,
    fontWeight: "900",
    color: "#17233C",
  },

  workflowText: {
    fontSize: 11,
    color: "#6B7280",
    lineHeight: 16,
    marginTop: 3,
  },

  profileCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFF4C7",
    borderRadius: 18,
    padding: 16,
  },

  profileIcon: {
    width: 43,
    height: 43,
    borderRadius: 14,
    backgroundColor: "#FFFFFF",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },

  profileInfo: {
    flex: 1,
  },

  profileName: {
    fontSize: 14,
    fontWeight: "900",
    color: "#17233C",
  },

  profileEmail: {
    fontSize: 11,
    color: "#6B7280",
    marginTop: 3,
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