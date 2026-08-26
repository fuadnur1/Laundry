import { Ionicons } from "@expo/vector-icons";
import { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ScrollView,
  ActivityIndicator,
  Alert,
} from "react-native";
import { router } from "expo-router";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function HomeScreen() {
  const [services, setServices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [userEmail, setUserEmail] = useState("");

  useEffect(() => {
    loadUser();
    fetchServices();
  }, []);

  const loadUser = async () => {
    const storedUser = await AsyncStorage.getItem("user");

    if (storedUser) {
      const user = JSON.parse(storedUser);
      setUserEmail(user.email || "");
    }
  };

  const fetchServices = async () => {
    try {
      const response = await axios.get(
        "http://localhost:5000/api/v1/services"
      );

      setServices(response.data.data || []);
    } catch (error) {
      console.log("Service fetch error:", error);
    } finally {
      setLoading(false);
    }
  };

  const openServiceOrder = (service: any) => {
    router.push({
      pathname: "/order/[serviceId]",
      params: {
        serviceId: service.id,
        name: service.name,
        price: service.price,
        unitType: service.unitType,
        partnerId: service.provider?.id,
      },
    });
  };

  const handleBookLaundry = () => {
    if (loading) {
      Alert.alert(
        "Please Wait",
        "Laundry services are still loading."
      );
      return;
    }

    if (services.length === 0) {
      Alert.alert(
        "No Services Available",
        "There are currently no laundry services available."
      );
      return;
    }

    openServiceOrder(services[0]);
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
            <Text style={styles.brand}>SMART LAUNDRY</Text>
            <Text style={styles.tagline}>
              Laundry in One Tap
            </Text>
          </View>
          
          <Pressable
            style={styles.notification}
            onPress={() => router.push("/notifications")}
          >
            <Ionicons
              name="notifications-outline"
              size={21}
              color="#17233C"
            />
          </Pressable>
        </View>

        {/* GREETING */}

        <Text style={styles.greeting}>
          Hi
          {userEmail
            ? `, ${userEmail.split("@")[0]}`
            : ""}{" "}
          👋
        </Text>

        <Text style={styles.heading}>
          Let&apos;s get your laundry done.
        </Text>

        {/* HERO CARD */}

        <View style={styles.hero}>
          <View style={styles.heroContent}>
            <Text style={styles.heroSmall}>
              SMART LAUNDRY
            </Text>

            <Text style={styles.heroTitle}>
              Clean Clothes,
              {"\n"}
              Happy Life.
            </Text>

            <Text style={styles.heroDescription}>
              Reliable pickup, quality cleaning and fast
              delivery.
            </Text>

            <Pressable
              style={styles.heroButton}
              onPress={handleBookLaundry}
            >
              <Text style={styles.heroButtonText}>
                Book Laundry
              </Text>
            </Pressable>
          </View>

          <View style={styles.heroIcon}>
            <Text style={styles.heroIconText}>
              🧺
            </Text>
          </View>
        </View>

        {/* QUICK ACTIONS */}

        <Text style={styles.sectionTitle}>
          Quick Actions
        </Text>

        <View style={styles.actionsRow}>
          <Pressable
            style={styles.actionCard}
            onPress={handleBookLaundry}
          >
            <View style={styles.actionIcon}>
              <Ionicons
                name="calendar-outline"
                size={23}
                color="#155EEF"
              />
            </View>

            <Text style={styles.actionTitle}>
              Book
            </Text>

            <Text style={styles.actionSubtitle}>
              Schedule pickup
            </Text>
          </Pressable>

          <Pressable
            style={styles.actionCard}
            onPress={() => router.push("/orders")}
          >
            <View style={styles.actionIcon}>
              <Ionicons
                name="location-outline"
                size={23}
                color="#155EEF"
              />
            </View>

            <Text style={styles.actionTitle}>
              Track
            </Text>

            <Text style={styles.actionSubtitle}>
              Track your order
            </Text>
          </Pressable>
        </View>

        {/* SERVICES */}

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>
            Our Services
          </Text>

          <Text style={styles.seeAll}>
            See All
          </Text>
        </View>

        {loading ? (
          <ActivityIndicator
            size="large"
            color="#155EEF"
            style={{ marginTop: 30 }}
          />
        ) : services.length === 0 ? (
          <View style={styles.noServiceCard}>
            <Ionicons
              name="shirt-outline"
              size={32}
              color="#155EEF"
            />

            <Text style={styles.noServiceTitle}>
              No services available
            </Text>

            <Text style={styles.noServiceText}>
              Please check again later.
            </Text>
          </View>
        ) : (
          services.map((service) => (
            <View
              key={service.id}
              style={styles.serviceCard}
            >
              <View style={styles.serviceIcon}>
                <Ionicons
                  name="shirt-outline"
                  size={27}
                  color="#155EEF"
                />
              </View>

              <View style={styles.serviceInfo}>
                <Text style={styles.serviceName}>
                  {service.name}
                </Text>

                <Text style={styles.provider}>
                  {service.provider?.businessName ||
                    "Laundry Provider"}
                </Text>

                <Text style={styles.price}>
                  {service.price} BDT /{" "}
                  {service.unitType}
                </Text>

                <Text style={styles.delivery}>
                  Approx. {service.estimatedHours} hours
                </Text>
              </View>

              <Pressable
                style={styles.orderButton}
                onPress={() =>
                  openServiceOrder(service)
                }
              >
                <Text style={styles.orderButtonText}>
                  Order
                </Text>
              </Pressable>
            </View>
          ))
        )}

        {/* INFO CARD */}

        <View style={styles.infoCard}>
          <View style={styles.infoContent}>
            <Text style={styles.infoTitle}>
              Fast. Reliable. Transparent.
            </Text>

            <Text style={styles.infoText}>
              From pickup to delivery, track every step
              of your laundry journey.
            </Text>
          </View>

          <Ionicons
            name="sparkles-outline"
            size={30}
            color="#155EEF"
          />
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
          onPress={() => router.replace("/orders")}
        >
          <Ionicons
            name="cube-outline"
            size={22}
            color="#8A93A4"
          />

          <Text style={styles.navText}>
            Orders
          </Text>
        </Pressable>

        <Pressable
          style={styles.navItem}
          onPress={() => router.replace("/support")}
        >
          <Ionicons
            name="chatbubble-ellipses-outline"
            size={22}
            color="#8A93A4"
          />

          <Text style={styles.navText}>
            Support
          </Text>
        </Pressable>

        <Pressable
          style={styles.navItem}
          onPress={() => router.replace("/profile")}
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
    letterSpacing: 0.3,
  },

  tagline: {
    fontSize: 12,
    color: "#6B7280",
    marginTop: 3,
  },

  notification: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: "#FFFFFF",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E5EAF2",
  },

  greeting: {
    fontSize: 16,
    color: "#6B7280",
    marginBottom: 5,
  },

  heading: {
    fontSize: 29,
    lineHeight: 36,
    fontWeight: "900",
    color: "#17233C",
    marginBottom: 22,
  },

  hero: {
    minHeight: 210,
    borderRadius: 24,
    backgroundColor: "#155EEF",
    padding: 22,
    flexDirection: "row",
    overflow: "hidden",
    marginBottom: 30,
  },

  heroContent: {
    flex: 1,
    zIndex: 2,
  },

  heroSmall: {
    fontSize: 11,
    color: "#FFF4C7",
    fontWeight: "800",
    marginBottom: 8,
  },

  heroTitle: {
    fontSize: 27,
    lineHeight: 32,
    color: "#FFFFFF",
    fontWeight: "900",
  },

  heroDescription: {
    fontSize: 13,
    color: "#DDE8FF",
    lineHeight: 19,
    marginTop: 9,
    maxWidth: 220,
  },

  heroButton: {
    alignSelf: "flex-start",
    backgroundColor: "#FFC928",
    paddingHorizontal: 18,
    paddingVertical: 11,
    borderRadius: 12,
    marginTop: 18,
  },

  heroButtonText: {
    color: "#102A56",
    fontSize: 14,
    fontWeight: "800",
  },

  heroIcon: {
    justifyContent: "center",
    alignItems: "center",
    width: 95,
  },

  heroIconText: {
    fontSize: 66,
  },

  sectionTitle: {
    fontSize: 20,
    fontWeight: "900",
    color: "#17233C",
    marginBottom: 15,
  },

  actionsRow: {
    flexDirection: "row",
    gap: 14,
    marginBottom: 28,
  },

  actionCard: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    padding: 17,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "#E5EAF2",
  },

  actionIcon: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: "#FFF4C7",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 13,
  },

  actionTitle: {
    fontSize: 16,
    fontWeight: "800",
    color: "#17233C",
  },

  actionSubtitle: {
    fontSize: 12,
    color: "#6B7280",
    marginTop: 3,
  },

  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  seeAll: {
    color: "#155EEF",
    fontSize: 13,
    fontWeight: "700",
    marginBottom: 15,
  },

  serviceCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    padding: 16,
    borderRadius: 20,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: "#E5EAF2",
  },

  serviceIcon: {
    width: 58,
    height: 58,
    borderRadius: 17,
    backgroundColor: "#FFF4C7",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 14,
  },

  serviceInfo: {
    flex: 1,
  },

  serviceName: {
    fontSize: 17,
    fontWeight: "900",
    color: "#17233C",
  },

  provider: {
    fontSize: 12,
    color: "#6B7280",
    marginTop: 3,
  },

  price: {
    fontSize: 14,
    fontWeight: "800",
    color: "#155EEF",
    marginTop: 7,
  },

  delivery: {
    fontSize: 11,
    color: "#8A93A4",
    marginTop: 2,
  },

  orderButton: {
    backgroundColor: "#155EEF",
    paddingHorizontal: 15,
    paddingVertical: 11,
    borderRadius: 12,
  },

  orderButtonText: {
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "800",
  },

  noServiceCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#E5EAF2",
    padding: 24,
    alignItems: "center",
    marginBottom: 18,
  },

  noServiceTitle: {
    fontSize: 16,
    fontWeight: "900",
    color: "#17233C",
    marginTop: 10,
  },

  noServiceText: {
    fontSize: 12,
    color: "#6B7280",
    marginTop: 4,
  },

  infoCard: {
    backgroundColor: "#FFF4C7",
    borderRadius: 20,
    padding: 19,
    marginTop: 14,
    flexDirection: "row",
    alignItems: "center",
  },

  infoContent: {
    flex: 1,
    marginRight: 10,
  },

  infoTitle: {
    fontSize: 16,
    fontWeight: "900",
    color: "#102A56",
  },

  infoText: {
    marginTop: 5,
    fontSize: 12,
    lineHeight: 18,
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