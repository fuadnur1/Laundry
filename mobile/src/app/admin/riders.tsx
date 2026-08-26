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

type Rider = {
  user_id: string;
  national_id?: string | null;
  vehicle_type?: string | null;
  vehicle_registration?: string | null;
  licence_number?: string | null;
  availability_status?: string | null;
  verification_status?: string | null;
  average_rating?: number | null;
  total_ratings?: number | null;
  created_at?: string | null;
  updated_at?: string | null;

  user?: {
    name?: string | null;
    email?: string | null;
    phone?: string | null;
    account_status?: string | null;
  } | null;
};

type FilterType =
  | "ALL"
  | "PENDING"
  | "APPROVED"
  | "REJECTED";

export default function AdminRidersScreen() {
  const [riders, setRiders] = useState<Rider[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<FilterType>("ALL");
  const [updatingId, setUpdatingId] = useState<string | null>(
    null
  );

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

      if (Number(parsedUser.role_id) !== 4) {
        Alert.alert("Access Denied", "Admin access only.");
        router.replace("/login");
        return;
      }

      await fetchRiders();
    } catch (error) {
      console.log("Admin riders init error:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchRiders = async () => {
    try {
      const response = await axios.get(
        `${API_URL}/admin/riders`
      );

      setRiders(response.data.riders || []);
    } catch (error: any) {
      console.log(
        "Admin riders fetch error:",
        error.response?.data || error.message
      );

      Alert.alert(
        "Could not load riders",
        error.response?.data?.message ||
          "Unable to fetch riders."
      );
    }
  };

  const updateVerification = async (
    riderId: string,
    status: "APPROVED" | "REJECTED"
  ) => {
    try {
      setUpdatingId(riderId);

      await axios.patch(
        `${API_URL}/admin/riders/${riderId}/verification`,
        {
          verification_status: status,
        }
      );

      await fetchRiders();
    } catch (error: any) {
      console.log(
        "Rider verification update error:",
        error.response?.data || error.message
      );

      Alert.alert(
        "Update failed",
        error.response?.data?.message ||
          "Could not update rider verification."
      );
    } finally {
      setUpdatingId(null);
    }
  };

  const filteredRiders = useMemo(() => {
    if (filter === "ALL") return riders;

    return riders.filter(
      (rider) => rider.verification_status === filter
    );
  }, [riders, filter]);

  const pendingCount = riders.filter(
    (r) => r.verification_status === "PENDING"
  ).length;

  const approvedCount = riders.filter(
    (r) => r.verification_status === "APPROVED"
  ).length;

  const rejectedCount = riders.filter(
    (r) => r.verification_status === "REJECTED"
  ).length;

  const formatRating = (value?: number | null) => {
    return Number(value || 0).toFixed(1);
  };

  if (loading) {
    return (
      <View style={styles.loadingScreen}>
        <ActivityIndicator
          size="large"
          color="#155EEF"
        />

        <Text style={styles.loadingText}>
          Loading riders...
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
              RIDER MANAGEMENT
            </Text>
          </View>

          <Pressable
            style={styles.headerIcon}
            onPress={fetchRiders}
          >
            <Ionicons
              name="refresh-outline"
              size={23}
              color="#155EEF"
            />
          </Pressable>
        </View>

        <Text style={styles.title}>
          Delivery Riders
        </Text>

        <Text style={styles.subtitle}>
          Review rider profiles and manage verification.
        </Text>

        <View style={styles.statsGrid}>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>
              {riders.length}
            </Text>

            <Text style={styles.statLabel}>
              Total Riders
            </Text>
          </View>

          <View style={styles.statCard}>
            <Text style={styles.statNumber}>
              {pendingCount}
            </Text>

            <Text style={styles.statLabel}>
              Pending
            </Text>
          </View>

          <View style={styles.statCard}>
            <Text style={styles.statNumber}>
              {approvedCount}
            </Text>

            <Text style={styles.statLabel}>
              Approved
            </Text>
          </View>

          <View style={styles.statCard}>
            <Text style={styles.statNumber}>
              {rejectedCount}
            </Text>

            <Text style={styles.statLabel}>
              Rejected
            </Text>
          </View>
        </View>

        <Text style={styles.sectionTitle}>
          Filter Riders
        </Text>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.filterScroll}
        >
          {[
            "ALL",
            "PENDING",
            "APPROVED",
            "REJECTED",
          ].map((item) => (
            <Pressable
              key={item}
              style={[
                styles.filterButton,
                filter === item &&
                  styles.filterButtonActive,
              ]}
              onPress={() =>
                setFilter(item as FilterType)
              }
            >
              <Text
                style={[
                  styles.filterText,
                  filter === item &&
                    styles.filterTextActive,
                ]}
              >
                {item}
              </Text>
            </Pressable>
          ))}
        </ScrollView>

        <Text style={styles.sectionTitle}>
          Riders ({filteredRiders.length})
        </Text>

        {filteredRiders.length === 0 ? (
          <View style={styles.emptyCard}>
            <Ionicons
              name="bicycle-outline"
              size={36}
              color="#8A93A4"
            />

            <Text style={styles.emptyTitle}>
              No riders found
            </Text>

            <Text style={styles.emptyText}>
              There are no riders in this category.
            </Text>
          </View>
        ) : (
          filteredRiders.map((rider) => (
            <View
              key={rider.user_id}
              style={styles.riderCard}
            >
              <View style={styles.cardHeader}>
                <View style={styles.avatar}>
                  <Ionicons
                    name="bicycle-outline"
                    size={24}
                    color="#155EEF"
                  />
                </View>

                <View style={styles.headerContent}>
                  <Text style={styles.riderName}>
                    {rider.user?.name ||
                      "Laundry Rider"}
                  </Text>

                  <Text style={styles.riderEmail}>
                    {rider.user?.email ||
                      "No email"}
                  </Text>
                </View>

                <View style={styles.statusBadge}>
                  <Text style={styles.statusBadgeText}>
                    {rider.verification_status ||
                      "UNKNOWN"}
                  </Text>
                </View>
              </View>

              <View style={styles.divider} />

              <InfoRow
                icon="call-outline"
                label="Phone"
                value={
                  rider.user?.phone ||
                  "Not provided"
                }
              />

              <InfoRow
                icon="car-sport-outline"
                label="Vehicle"
                value={
                  rider.vehicle_type ||
                  "Not provided"
                }
              />

              <InfoRow
                icon="card-outline"
                label="Vehicle Registration"
                value={
                  rider.vehicle_registration ||
                  "Not provided"
                }
              />

              <InfoRow
                icon="document-text-outline"
                label="Licence"
                value={
                  rider.licence_number ||
                  "Not provided"
                }
              />

              <InfoRow
                icon="finger-print-outline"
                label="National ID"
                value={
                  rider.national_id ||
                  "Not provided"
                }
              />

              <View style={styles.metaRow}>
                <View style={styles.metaCard}>
                  <Text style={styles.metaValue}>
                    {rider.availability_status ||
                      "UNKNOWN"}
                  </Text>

                  <Text style={styles.metaLabel}>
                    Availability
                  </Text>
                </View>

                <View style={styles.metaCard}>
                  <Text style={styles.metaValue}>
                    {formatRating(
                      rider.average_rating
                    )}
                  </Text>

                  <Text style={styles.metaLabel}>
                    Rating
                  </Text>
                </View>
              </View>

              {rider.verification_status === "PENDING" ? (
                <View style={styles.actionRow}>
                  <Pressable
                    style={styles.rejectButton}
                    disabled={
                      updatingId === rider.user_id
                    }
                    onPress={() =>
                      updateVerification(
                        rider.user_id,
                        "REJECTED"
                      )
                    }
                  >
                    <Ionicons
                      name="close-circle-outline"
                      size={18}
                      color="#D14343"
                    />

                    <Text style={styles.rejectText}>
                      Reject
                    </Text>
                  </Pressable>

                  <Pressable
                    style={styles.approveButton}
                    disabled={
                      updatingId === rider.user_id
                    }
                    onPress={() =>
                      updateVerification(
                        rider.user_id,
                        "APPROVED"
                      )
                    }
                  >
                    {updatingId === rider.user_id ? (
                      <ActivityIndicator
                        size="small"
                        color="#FFFFFF"
                      />
                    ) : (
                      <>
                        <Ionicons
                          name="checkmark-circle-outline"
                          size={18}
                          color="#FFFFFF"
                        />

                        <Text style={styles.approveText}>
                          Approve
                        </Text>
                      </>
                    )}
                  </Pressable>
                </View>
              ) : null}
            </View>
          ))
        )}
      </ScrollView>

      <View style={styles.bottomNav}>
        <Pressable
          style={styles.navItem}
          onPress={() =>
            router.replace("/admin/home")
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
            router.replace("/admin/users")
          }
        >
          <Ionicons
            name="people-outline"
            size={22}
            color="#8A93A4"
          />

          <Text style={styles.navText}>
            Users
          </Text>
        </Pressable>

        <Pressable
          style={styles.navItem}
          onPress={() =>
            router.replace("/admin/orders")
          }
        >
          <Ionicons
            name="receipt-outline"
            size={22}
            color="#8A93A4"
          />

          <Text style={styles.navText}>
            Orders
          </Text>
        </Pressable>

        <Pressable
          style={styles.navItem}
          onPress={() =>
            router.replace("/admin/profile")
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

function InfoRow({
  icon,
  label,
  value,
}: {
  icon: any;
  label: string;
  value: string;
}) {
  return (
    <View style={styles.infoRow}>
      <View style={styles.infoIcon}>
        <Ionicons
          name={icon}
          size={18}
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
    marginBottom: 25,
  },

  brand: {
    fontSize: 20,
    fontWeight: "900",
    color: "#155EEF",
  },

  roleText: {
    marginTop: 3,
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 1,
    color: "#8A93A4",
  },

  headerIcon: {
    width: 46,
    height: 46,
    borderRadius: 15,
    backgroundColor: "#FFF4C7",
    justifyContent: "center",
    alignItems: "center",
  },

  title: {
    fontSize: 28,
    fontWeight: "900",
    color: "#17233C",
  },

  subtitle: {
    marginTop: 5,
    marginBottom: 22,
    fontSize: 12,
    color: "#8A93A4",
  },

  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
    marginBottom: 27,
  },

  statCard: {
    width: "48%",
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E5EAF2",
    borderRadius: 18,
    padding: 16,
  },

  statNumber: {
    fontSize: 24,
    fontWeight: "900",
    color: "#155EEF",
  },

  statLabel: {
    marginTop: 4,
    fontSize: 11,
    color: "#6B7280",
  },

  sectionTitle: {
    fontSize: 17,
    fontWeight: "900",
    color: "#17233C",
    marginBottom: 12,
  },

  filterScroll: {
    marginBottom: 25,
  },

  filterButton: {
    paddingHorizontal: 15,
    paddingVertical: 9,
    borderRadius: 20,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E5EAF2",
    marginRight: 8,
  },

  filterButtonActive: {
    backgroundColor: "#155EEF",
    borderColor: "#155EEF",
  },

  filterText: {
    fontSize: 10,
    fontWeight: "800",
    color: "#6B7280",
  },

  filterTextActive: {
    color: "#FFFFFF",
  },

  riderCard: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E5EAF2",
    borderRadius: 19,
    padding: 16,
    marginBottom: 14,
  },

  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
  },

  avatar: {
    width: 48,
    height: 48,
    borderRadius: 15,
    backgroundColor: "#EAF0FF",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },

  headerContent: {
    flex: 1,
  },

  riderName: {
    fontSize: 14,
    fontWeight: "900",
    color: "#17233C",
  },

  riderEmail: {
    marginTop: 3,
    fontSize: 10,
    color: "#6B7280",
  },

  statusBadge: {
    backgroundColor: "#FFF4C7",
    borderRadius: 15,
    paddingHorizontal: 9,
    paddingVertical: 5,
  },

  statusBadgeText: {
    fontSize: 8,
    fontWeight: "900",
    color: "#155EEF",
  },

  divider: {
    height: 1,
    backgroundColor: "#EEF1F5",
    marginVertical: 14,
  },

  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },

  infoIcon: {
    width: 39,
    height: 39,
    borderRadius: 12,
    backgroundColor: "#F7F9FC",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 11,
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
    marginTop: 2,
    fontSize: 11,
    color: "#17233C",
    fontWeight: "700",
  },

  metaRow: {
    flexDirection: "row",
    gap: 10,
    marginTop: 4,
  },

  metaCard: {
    flex: 1,
    backgroundColor: "#F7F9FC",
    borderRadius: 14,
    padding: 12,
  },

  metaValue: {
    fontSize: 13,
    fontWeight: "900",
    color: "#155EEF",
  },

  metaLabel: {
    marginTop: 3,
    fontSize: 9,
    color: "#6B7280",
  },

  actionRow: {
    flexDirection: "row",
    gap: 10,
    marginTop: 16,
  },

  rejectButton: {
    flex: 1,
    flexDirection: "row",
    gap: 6,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FFF7F7",
    borderWidth: 1,
    borderColor: "#F0CACA",
    borderRadius: 14,
    paddingVertical: 12,
  },

  rejectText: {
    fontSize: 11,
    fontWeight: "900",
    color: "#D14343",
  },

  approveButton: {
    flex: 1,
    flexDirection: "row",
    gap: 6,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#155EEF",
    borderRadius: 14,
    paddingVertical: 12,
  },

  approveText: {
    fontSize: 11,
    fontWeight: "900",
    color: "#FFFFFF",
  },

  emptyCard: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E5EAF2",
    borderRadius: 18,
    padding: 30,
    alignItems: "center",
  },

  emptyTitle: {
    marginTop: 10,
    fontSize: 15,
    fontWeight: "900",
    color: "#17233C",
  },

  emptyText: {
    marginTop: 4,
    fontSize: 11,
    color: "#8A93A4",
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
    minWidth: 62,
    alignItems: "center",
    gap: 4,
  },

  navText: {
    fontSize: 11,
    color: "#8A93A4",
  },
});