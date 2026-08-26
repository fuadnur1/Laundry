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

type Partner = {
  user_id: string;
  business_name?: string | null;
  owner_name?: string | null;
  trade_licence_number?: string | null;
  description?: string | null;
  business_address?: string | null;
  service_radius_km?: number | null;
  opening_time?: string | null;
  closing_time?: string | null;
  verification_status?: string | null;
  average_rating?: number | null;
  total_ratings?: number | null;
  is_open?: boolean | null;
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

export default function AdminPartnersScreen() {
  const [partners, setPartners] = useState<Partner[]>([]);
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

      await fetchPartners();
    } catch (error) {
      console.log("Admin partners init error:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchPartners = async () => {
    try {
      const response = await axios.get(
        `${API_URL}/admin/partners`
      );

      setPartners(response.data.partners || []);
    } catch (error: any) {
      console.log(
        "Admin partners fetch error:",
        error.response?.data || error.message
      );

      Alert.alert(
        "Could not load partners",
        error.response?.data?.message ||
          "Unable to fetch partners."
      );
    }
  };

  const updateVerification = async (
    partnerId: string,
    status: "APPROVED" | "REJECTED"
  ) => {
    try {
      setUpdatingId(partnerId);

      await axios.patch(
        `${API_URL}/admin/partners/${partnerId}/verification`,
        {
          verification_status: status,
        }
      );

      await fetchPartners();
    } catch (error: any) {
      console.log(
        "Partner verification update error:",
        error.response?.data || error.message
      );

      Alert.alert(
        "Update failed",
        error.response?.data?.message ||
          "Could not update partner verification."
      );
    } finally {
      setUpdatingId(null);
    }
  };

  const filteredPartners = useMemo(() => {
    if (filter === "ALL") return partners;

    return partners.filter(
      (partner) =>
        partner.verification_status === filter
    );
  }, [partners, filter]);

  const pendingCount = partners.filter(
    (p) => p.verification_status === "PENDING"
  ).length;

  const approvedCount = partners.filter(
    (p) => p.verification_status === "APPROVED"
  ).length;

  const rejectedCount = partners.filter(
    (p) => p.verification_status === "REJECTED"
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
          Loading partners...
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
              PARTNER MANAGEMENT
            </Text>
          </View>

          <Pressable
            style={styles.headerIcon}
            onPress={fetchPartners}
          >
            <Ionicons
              name="refresh-outline"
              size={23}
              color="#155EEF"
            />
          </Pressable>
        </View>

        <Text style={styles.title}>
          Laundry Partners
        </Text>

        <Text style={styles.subtitle}>
          Review laundry businesses and manage
          verification.
        </Text>

        <View style={styles.statsGrid}>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>
              {partners.length}
            </Text>

            <Text style={styles.statLabel}>
              Total Partners
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
          Filter Partners
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
          Partners ({filteredPartners.length})
        </Text>

        {filteredPartners.length === 0 ? (
          <View style={styles.emptyCard}>
            <Ionicons
              name="storefront-outline"
              size={36}
              color="#8A93A4"
            />

            <Text style={styles.emptyTitle}>
              No partners found
            </Text>

            <Text style={styles.emptyText}>
              There are no partners in this category.
            </Text>
          </View>
        ) : (
          filteredPartners.map((partner) => (
            <View
              key={partner.user_id}
              style={styles.partnerCard}
            >
              <View style={styles.cardHeader}>
                <View style={styles.avatar}>
                  <Ionicons
                    name="storefront-outline"
                    size={24}
                    color="#155EEF"
                  />
                </View>

                <View style={styles.headerContent}>
                  <Text style={styles.partnerName}>
                    {partner.business_name ||
                      "Laundry Partner"}
                  </Text>

                  <Text style={styles.partnerOwner}>
                    {partner.owner_name ||
                      partner.user?.name ||
                      "Owner not provided"}
                  </Text>

                  <Text style={styles.partnerEmail}>
                    {partner.user?.email ||
                      "No email"}
                  </Text>
                </View>

                <View style={styles.statusBadge}>
                  <Text style={styles.statusBadgeText}>
                    {partner.verification_status ||
                      "UNKNOWN"}
                  </Text>
                </View>
              </View>

              <View style={styles.divider} />

              <InfoRow
                icon="call-outline"
                label="Phone"
                value={
                  partner.user?.phone ||
                  "Not provided"
                }
              />

              <InfoRow
                icon="document-text-outline"
                label="Trade Licence"
                value={
                  partner.trade_licence_number ||
                  "Not provided"
                }
              />

              <InfoRow
                icon="location-outline"
                label="Business Address"
                value={
                  partner.business_address ||
                  "Not provided"
                }
              />

              <InfoRow
                icon="navigate-outline"
                label="Service Radius"
                value={
                  partner.service_radius_km != null
                    ? `${partner.service_radius_km} km`
                    : "Not provided"
                }
              />

              <InfoRow
                icon="time-outline"
                label="Operating Hours"
                value={
                  partner.opening_time &&
                  partner.closing_time
                    ? `${partner.opening_time} - ${partner.closing_time}`
                    : "Not provided"
                }
              />

              <View style={styles.metaRow}>
                <View style={styles.metaCard}>
                  <Text style={styles.metaValue}>
                    {partner.is_open
                      ? "OPEN"
                      : "CLOSED"}
                  </Text>

                  <Text style={styles.metaLabel}>
                    Business
                  </Text>
                </View>

                <View style={styles.metaCard}>
                  <Text style={styles.metaValue}>
                    {formatRating(
                      partner.average_rating
                    )}
                  </Text>

                  <Text style={styles.metaLabel}>
                    Rating
                  </Text>
                </View>

                <View style={styles.metaCard}>
                  <Text style={styles.metaValue}>
                    {partner.total_ratings || 0}
                  </Text>

                  <Text style={styles.metaLabel}>
                    Reviews
                  </Text>
                </View>
              </View>

              {partner.description ? (
                <View style={styles.descriptionBox}>
                  <Text style={styles.descriptionLabel}>
                    ABOUT
                  </Text>

                  <Text style={styles.descriptionText}>
                    {partner.description}
                  </Text>
                </View>
              ) : null}

              {partner.verification_status ===
              "PENDING" ? (
                <View style={styles.actionRow}>
                  <Pressable
                    style={styles.rejectButton}
                    disabled={
                      updatingId === partner.user_id
                    }
                    onPress={() =>
                      updateVerification(
                        partner.user_id,
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
                      updatingId === partner.user_id
                    }
                    onPress={() =>
                      updateVerification(
                        partner.user_id,
                        "APPROVED"
                      )
                    }
                  >
                    {updatingId ===
                    partner.user_id ? (
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

  partnerCard: {
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
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },

  headerContent: {
    flex: 1,
  },

  partnerName: {
    fontSize: 14,
    fontWeight: "900",
    color: "#17233C",
  },

  partnerOwner: {
    marginTop: 2,
    fontSize: 10,
    fontWeight: "700",
    color: "#52617A",
  },

  partnerEmail: {
    marginTop: 2,
    fontSize: 9,
    color: "#8A93A4",
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
    lineHeight: 16,
    color: "#17233C",
    fontWeight: "700",
  },

  metaRow: {
    flexDirection: "row",
    gap: 8,
    marginTop: 4,
  },

  metaCard: {
    flex: 1,
    backgroundColor: "#F7F9FC",
    borderRadius: 14,
    padding: 11,
  },

  metaValue: {
    fontSize: 12,
    fontWeight: "900",
    color: "#155EEF",
  },

  metaLabel: {
    marginTop: 3,
    fontSize: 8,
    color: "#6B7280",
  },

  descriptionBox: {
    marginTop: 14,
    backgroundColor: "#FFF4C7",
    borderRadius: 14,
    padding: 12,
  },

  descriptionLabel: {
    fontSize: 8,
    fontWeight: "900",
    color: "#155EEF",
  },

  descriptionText: {
    marginTop: 5,
    fontSize: 10,
    lineHeight: 16,
    color: "#52617A",
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