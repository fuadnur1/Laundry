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

type LaundryService = {
  id: string;
  partner_id?: string | null;
  name?: string | null;
  category?: string | null;
  description?: string | null;
  unit_type?: string | null;
  unit_price?: number | null;
  estimated_hours?: number | null;
  express_available?: boolean | null;
  express_surcharge?: number | null;
  is_active?: boolean | null;
  created_at?: string | null;
  updated_at?: string | null;
};

export default function PartnerServicesScreen() {
  const [user, setUser] = useState<any>(null);
  const [services, setServices] = useState<LaundryService[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

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

      if (Number(parsedUser.role_id) !== 3) {
        Alert.alert(
          "Access Denied",
          "This page is only available for laundry partners."
        );

        router.replace("/login");
        return;
      }

      setUser(parsedUser);

      await fetchServices(parsedUser.id);
    } catch (error) {
      console.log("Partner services init error:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchServices = async (partnerId?: string) => {
    try {
      const id = partnerId || user?.id;

      if (!id) return;

      const response = await axios.get(
        `${API_URL}/services/partner/${id}`
      );

      setServices(response.data.services || []);
    } catch (error: any) {
      console.log(
        "Partner services error:",
        error.response?.data || error.message
      );

      Alert.alert(
        "Could not load services",
        error.response?.data?.message ||
          "Unable to fetch laundry services."
      );
    }
  };

  const handleRefresh = async () => {
    try {
      setRefreshing(true);

      if (user?.id) {
        await fetchServices(user.id);
      }
    } finally {
      setRefreshing(false);
    }
  };

  const activeServices = useMemo(
    () =>
      services.filter(
        (service) => service.is_active !== false
      ),
    [services]
  );

  const inactiveServices = useMemo(
    () =>
      services.filter(
        (service) => service.is_active === false
      ),
    [services]
  );

  const formatMoney = (value?: number | null) => {
    return `৳${Number(value || 0).toFixed(0)}`;
  };

  const getUnitLabel = (value?: string | null) => {
    if (!value) return "per unit";

    switch (value.toUpperCase()) {
      case "ITEM":
        return "per item";

      case "KG":
        return "per kg";

      case "LOAD":
        return "per load";

      default:
        return `per ${value.toLowerCase()}`;
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
          Loading services...
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
        {/* HEADER */}

        <View style={styles.header}>
          <View>
            <Text style={styles.brand}>
              SMART LAUNDRY
            </Text>

            <Text style={styles.roleText}>
              PARTNER PANEL
            </Text>
          </View>

          <Pressable
            style={styles.headerIcon}
            onPress={handleRefresh}
            disabled={refreshing}
          >
            {refreshing ? (
              <ActivityIndicator
                size="small"
                color="#155EEF"
              />
            ) : (
              <Ionicons
                name="refresh-outline"
                size={23}
                color="#155EEF"
              />
            )}
          </Pressable>
        </View>

        {/* PAGE TITLE */}

        <Text style={styles.pageTitle}>
          Laundry Services
        </Text>

        <Text style={styles.pageSubtitle}>
          Review the services offered by your laundry business.
        </Text>

        {/* SUMMARY */}

        <View style={styles.summaryRow}>
          <View style={styles.summaryCard}>
            <View style={styles.summaryIconBlue}>
              <Ionicons
                name="pricetags-outline"
                size={22}
                color="#155EEF"
              />
            </View>

            <Text style={styles.summaryNumber}>
              {services.length}
            </Text>

            <Text style={styles.summaryLabel}>
              Total Services
            </Text>
          </View>

          <View style={styles.summaryCard}>
            <View style={styles.summaryIconYellow}>
              <Ionicons
                name="checkmark-circle-outline"
                size={22}
                color="#155EEF"
              />
            </View>

            <Text style={styles.summaryNumber}>
              {activeServices.length}
            </Text>

            <Text style={styles.summaryLabel}>
              Active
            </Text>
          </View>
        </View>

        {/* ACTIVE SERVICES */}

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>
            Active Services
          </Text>

          <Text style={styles.sectionCount}>
            {activeServices.length}
          </Text>
        </View>

        {activeServices.length === 0 ? (
          <View style={styles.emptyCard}>
            <View style={styles.emptyIcon}>
              <Ionicons
                name="shirt-outline"
                size={36}
                color="#155EEF"
              />
            </View>

            <Text style={styles.emptyTitle}>
              No active services
            </Text>

            <Text style={styles.emptyText}>
              Active laundry services will appear here.
            </Text>
          </View>
        ) : (
          activeServices.map((service) => (
            <ServiceCard
              key={service.id}
              service={service}
              formatMoney={formatMoney}
              getUnitLabel={getUnitLabel}
            />
          ))
        )}

        {/* INACTIVE SERVICES */}

        {inactiveServices.length > 0 && (
          <>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>
                Inactive Services
              </Text>

              <Text style={styles.sectionCount}>
                {inactiveServices.length}
              </Text>
            </View>

            {inactiveServices.map((service) => (
              <ServiceCard
                key={service.id}
                service={service}
                formatMoney={formatMoney}
                getUnitLabel={getUnitLabel}
                inactive
              />
            ))}
          </>
        )}

        {/* INFO */}

        <View style={styles.infoCard}>
          <View style={styles.infoIcon}>
            <Ionicons
              name="information-circle-outline"
              size={22}
              color="#155EEF"
            />
          </View>

          <Text style={styles.infoText}>
            Service editing can be added next so the partner
            can change pricing, express availability and active
            status directly from the app.
          </Text>
        </View>
      </ScrollView>

      {/* BOTTOM NAV */}

      <View style={styles.bottomNav}>
        <Pressable
          style={styles.navItem}
          onPress={() =>
            router.replace("/partner/home")
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
            router.replace("/partner/orders")
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

        <Pressable style={styles.navItem}>
          <Ionicons
            name="pricetags"
            size={22}
            color="#155EEF"
          />

          <Text style={styles.activeNav}>
            Services
          </Text>
        </Pressable>

        <Pressable
          style={styles.navItem}
          onPress={() =>
            router.replace("/partner/profile")
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

function ServiceCard({
  service,
  formatMoney,
  getUnitLabel,
  inactive,
}: {
  service: LaundryService;
  formatMoney: (value?: number | null) => string;
  getUnitLabel: (value?: string | null) => string;
  inactive?: boolean;
}) {
  return (
    <View
      style={[
        styles.serviceCard,
        inactive && styles.inactiveCard,
      ]}
    >
      {/* SERVICE HEADER */}

      <View style={styles.serviceTop}>
        <View
          style={[
            styles.serviceIcon,
            inactive && styles.inactiveIcon,
          ]}
        >
          <Ionicons
            name="shirt-outline"
            size={23}
            color="#155EEF"
          />
        </View>

        <View style={styles.serviceHeading}>
          <Text style={styles.serviceName}>
            {service.name || "Laundry Service"}
          </Text>

          <Text style={styles.serviceCategory}>
            {service.category || "Laundry"}
          </Text>
        </View>

        <View
          style={[
            styles.statusBadge,
            inactive && styles.inactiveBadge,
          ]}
        >
          <Text
            style={[
              styles.statusText,
              inactive && styles.inactiveStatusText,
            ]}
          >
            {inactive ? "INACTIVE" : "ACTIVE"}
          </Text>
        </View>
      </View>

      {/* DESCRIPTION */}

      {service.description ? (
        <Text style={styles.description}>
          {service.description}
        </Text>
      ) : null}

      {/* DETAILS */}

      <View style={styles.detailsGrid}>
        <View style={styles.detailBox}>
          <Ionicons
            name="cash-outline"
            size={18}
            color="#155EEF"
          />

          <Text style={styles.detailLabel}>
            Price
          </Text>

          <Text style={styles.detailValue}>
            {formatMoney(service.unit_price)}
          </Text>

          <Text style={styles.detailSmall}>
            {getUnitLabel(service.unit_type)}
          </Text>
        </View>

        <View style={styles.detailBox}>
          <Ionicons
            name="time-outline"
            size={18}
            color="#155EEF"
          />

          <Text style={styles.detailLabel}>
            Estimated Time
          </Text>

          <Text style={styles.detailValue}>
            {service.estimated_hours ?? 0}h
          </Text>
        </View>
      </View>

      {/* EXPRESS */}

      <View style={styles.expressRow}>
        <View style={styles.expressLeft}>
          <View
            style={[
              styles.expressIcon,
              !service.express_available &&
                styles.expressIconInactive,
            ]}
          >
            <Ionicons
              name="flash-outline"
              size={18}
              color="#155EEF"
            />
          </View>

          <View>
            <Text style={styles.expressTitle}>
              Express Service
            </Text>

            <Text style={styles.expressText}>
              {service.express_available
                ? "Available"
                : "Not available"}
            </Text>
          </View>
        </View>

        {service.express_available ? (
          <Text style={styles.surcharge}>
            +{formatMoney(service.express_surcharge)}
          </Text>
        ) : null}
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

  roleText: {
    marginTop: 3,
    fontSize: 10,
    color: "#8A93A4",
    fontWeight: "800",
    letterSpacing: 1,
  },

  headerIcon: {
    width: 46,
    height: 46,
    borderRadius: 15,
    backgroundColor: "#FFF4C7",
    alignItems: "center",
    justifyContent: "center",
  },

  pageTitle: {
    fontSize: 28,
    fontWeight: "900",
    color: "#17233C",
  },

  pageSubtitle: {
    marginTop: 5,
    marginBottom: 22,
    fontSize: 12,
    lineHeight: 18,
    color: "#6B7280",
  },

  summaryRow: {
    flexDirection: "row",
    gap: 13,
    marginBottom: 27,
  },

  summaryCard: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "#E5EAF2",
    padding: 16,
  },

  summaryIconBlue: {
    width: 43,
    height: 43,
    borderRadius: 14,
    backgroundColor: "#EAF0FF",
    alignItems: "center",
    justifyContent: "center",
  },

  summaryIconYellow: {
    width: 43,
    height: 43,
    borderRadius: 14,
    backgroundColor: "#FFF4C7",
    alignItems: "center",
    justifyContent: "center",
  },

  summaryNumber: {
    marginTop: 12,
    fontSize: 24,
    fontWeight: "900",
    color: "#17233C",
  },

  summaryLabel: {
    marginTop: 3,
    fontSize: 10,
    color: "#6B7280",
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
  },

  sectionCount: {
    fontSize: 12,
    fontWeight: "900",
    color: "#155EEF",
  },

  serviceCard: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E5EAF2",
    borderRadius: 20,
    padding: 17,
    marginBottom: 15,
  },

  inactiveCard: {
    opacity: 0.7,
  },

  serviceTop: {
    flexDirection: "row",
    alignItems: "center",
  },

  serviceIcon: {
    width: 47,
    height: 47,
    borderRadius: 14,
    backgroundColor: "#FFF4C7",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },

  inactiveIcon: {
    backgroundColor: "#EEF1F5",
  },

  serviceHeading: {
    flex: 1,
  },

  serviceName: {
    fontSize: 15,
    fontWeight: "900",
    color: "#17233C",
  },

  serviceCategory: {
    marginTop: 3,
    fontSize: 10,
    color: "#8A93A4",
  },

  statusBadge: {
    backgroundColor: "#EAF0FF",
    borderRadius: 20,
    paddingHorizontal: 9,
    paddingVertical: 6,
  },

  inactiveBadge: {
    backgroundColor: "#EEF1F5",
  },

  statusText: {
    fontSize: 8,
    fontWeight: "900",
    color: "#155EEF",
  },

  inactiveStatusText: {
    color: "#6B7280",
  },

  description: {
    marginTop: 14,
    fontSize: 11,
    lineHeight: 17,
    color: "#6B7280",
  },

  detailsGrid: {
    flexDirection: "row",
    gap: 11,
    marginTop: 15,
  },

  detailBox: {
    flex: 1,
    backgroundColor: "#F9FAFC",
    borderRadius: 14,
    padding: 13,
  },

  detailLabel: {
    marginTop: 8,
    fontSize: 9,
    color: "#8A93A4",
    fontWeight: "800",
  },

  detailValue: {
    marginTop: 3,
    fontSize: 15,
    fontWeight: "900",
    color: "#17233C",
  },

  detailSmall: {
    marginTop: 2,
    fontSize: 9,
    color: "#6B7280",
  },

  expressRow: {
    marginTop: 15,
    borderTopWidth: 1,
    borderTopColor: "#EEF1F5",
    paddingTop: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  expressLeft: {
    flexDirection: "row",
    alignItems: "center",
  },

  expressIcon: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: "#FFF4C7",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
  },

  expressIconInactive: {
    backgroundColor: "#EEF1F5",
  },

  expressTitle: {
    fontSize: 11,
    fontWeight: "900",
    color: "#17233C",
  },

  expressText: {
    marginTop: 2,
    fontSize: 9,
    color: "#6B7280",
  },

  surcharge: {
    fontSize: 12,
    fontWeight: "900",
    color: "#155EEF",
  },

  emptyCard: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E5EAF2",
    borderRadius: 20,
    padding: 28,
    alignItems: "center",
    marginBottom: 25,
  },

  emptyIcon: {
    width: 68,
    height: 68,
    borderRadius: 22,
    backgroundColor: "#FFF4C7",
    alignItems: "center",
    justifyContent: "center",
  },

  emptyTitle: {
    marginTop: 14,
    fontSize: 17,
    fontWeight: "900",
    color: "#17233C",
  },

  emptyText: {
    marginTop: 5,
    fontSize: 11,
    color: "#6B7280",
  },

  infoCard: {
    marginTop: 10,
    backgroundColor: "#FFF4C7",
    borderRadius: 17,
    padding: 15,
    flexDirection: "row",
    alignItems: "center",
  },

  infoIcon: {
    width: 40,
    height: 40,
    borderRadius: 13,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 11,
  },

  infoText: {
    flex: 1,
    fontSize: 10,
    lineHeight: 16,
    color: "#52617A",
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