import { Ionicons } from "@expo/vector-icons";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ScrollView,
  Linking,
  Alert,
} from "react-native";
import { router } from "expo-router";

// CHANGE ONLY THESE TWO LINES
const SUPPORT_PHONE = "+8801234567890";
const SUPPORT_EMAIL = "support.laundry@gmail.com";

export default function SupportScreen() {
  const handleCall = async () => {
    try {
      const phoneUrl = `tel:${SUPPORT_PHONE}`;

      const supported = await Linking.canOpenURL(phoneUrl);

      if (supported) {
        await Linking.openURL(phoneUrl);
      } else {
        Alert.alert(
          "Unable to Call",
          `Please call us at ${SUPPORT_PHONE}`
        );
      }
    } catch (error) {
      Alert.alert(
        "Unable to Call",
        `Please call us at ${SUPPORT_PHONE}`
      );
    }
  };

  const handleEmail = async () => {
    try {
      const emailUrl =
        `mailto:${SUPPORT_EMAIL}` +
        `?subject=${encodeURIComponent(
          "Smart Laundry Support"
        )}`;

      const supported = await Linking.canOpenURL(emailUrl);

      if (supported) {
        await Linking.openURL(emailUrl);
      } else {
        Alert.alert(
          "Unable to Open Email",
          `Please email us at ${SUPPORT_EMAIL}`
        );
      }
    } catch (error) {
      Alert.alert(
        "Unable to Open Email",
        `Please email us at ${SUPPORT_EMAIL}`
      );
    }
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

          <View style={styles.headerIcon}>
            <Ionicons
              name="chatbubble-ellipses-outline"
              size={23}
              color="#155EEF"
            />
          </View>
        </View>

        {/* TITLE */}

        <Text style={styles.title}>
          How can we help?
        </Text>

        <Text style={styles.subtitle}>
          Get support for your orders, pickup, delivery or account.
        </Text>

        {/* HERO */}

        <View style={styles.heroCard}>
          <View style={styles.heroTextArea}>
            <Text style={styles.heroSmall}>
              CUSTOMER SUPPORT
            </Text>

            <Text style={styles.heroTitle}>
              We&apos;re here to help.
            </Text>

            <Text style={styles.heroText}>
              Have a problem with your laundry order?
              Contact our support team.
            </Text>
          </View>

          <View style={styles.heroIconBox}>
            <Ionicons
              name="headset-outline"
              size={38}
              color="#155EEF"
            />
          </View>
        </View>

        {/* CONTACT */}

        <Text style={styles.sectionTitle}>
          Contact Us
        </Text>

        <Pressable
          style={styles.contactCard}
          onPress={handleCall}
        >
          <View style={styles.iconBox}>
            <Ionicons
              name="call-outline"
              size={22}
              color="#155EEF"
            />
          </View>

          <View style={styles.contactInfo}>
            <Text style={styles.contactTitle}>
              Call Support
            </Text>

            <Text style={styles.contactText}>
              {SUPPORT_PHONE}
            </Text>
          </View>

          <Ionicons
            name="chevron-forward"
            size={21}
            color="#155EEF"
          />
        </Pressable>

        <Pressable
          style={styles.contactCard}
          onPress={handleEmail}
        >
          <View style={styles.yellowIconBox}>
            <Ionicons
              name="mail-outline"
              size={22}
              color="#155EEF"
            />
          </View>

          <View style={styles.contactInfo}>
            <Text style={styles.contactTitle}>
              Email Support
            </Text>

            <Text style={styles.contactText}>
              {SUPPORT_EMAIL}
            </Text>
          </View>

          <Ionicons
            name="chevron-forward"
            size={21}
            color="#155EEF"
          />
        </Pressable>

        {/* FAQ */}

        <Text style={styles.sectionTitle}>
          Frequently Asked Questions
        </Text>

        <View style={styles.faqCard}>
          <View style={styles.faqHeader}>
            <Ionicons
              name="location-outline"
              size={19}
              color="#155EEF"
            />

            <Text style={styles.faqTitle}>
              How do I track my laundry?
            </Text>
          </View>

          <Text style={styles.faqText}>
            Open My Orders, select an order and view its
            current progress.
          </Text>
        </View>

        <View style={styles.faqCard}>
          <View style={styles.faqHeader}>
            <Ionicons
              name="time-outline"
              size={19}
              color="#155EEF"
            />

            <Text style={styles.faqTitle}>
              How long does laundry take?
            </Text>
          </View>

          <Text style={styles.faqText}>
            Estimated completion time is shown when you
            select a laundry service.
          </Text>
        </View>

        <View style={styles.faqCard}>
          <View style={styles.faqHeader}>
            <Ionicons
              name="home-outline"
              size={19}
              color="#155EEF"
            />

            <Text style={styles.faqTitle}>
              Where will my clothes be picked up?
            </Text>
          </View>

          <Text style={styles.faqText}>
            Your default saved address is used for pickup
            and delivery.
          </Text>
        </View>

        {/* TRUST CARD */}

        <View style={styles.infoCard}>
          <View style={styles.infoIconBox}>
            <Ionicons
              name="shield-checkmark-outline"
              size={25}
              color="#155EEF"
            />
          </View>

          <View style={styles.infoContent}>
            <Text style={styles.infoTitle}>
              Safe & Reliable Service
            </Text>

            <Text style={styles.infoText}>
              Smart Laundry keeps your order information
              organized from booking through delivery.
            </Text>
          </View>
        </View>
      </ScrollView>

      {/* BOTTOM NAV */}

      <View style={styles.bottomNav}>
        <Pressable
          style={styles.navItem}
          onPress={() => router.replace("/home")}
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

        <Pressable style={styles.navItem}>
          <Ionicons
            name="chatbubble-ellipses"
            size={22}
            color="#155EEF"
          />
          <Text style={styles.activeNav}>
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
  },

  tagline: {
    fontSize: 12,
    color: "#6B7280",
    marginTop: 3,
  },

  headerIcon: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: "#FFF4C7",
    justifyContent: "center",
    alignItems: "center",
  },

  title: {
    fontSize: 30,
    fontWeight: "900",
    color: "#17233C",
  },

  subtitle: {
    fontSize: 13,
    lineHeight: 19,
    color: "#6B7280",
    marginTop: 6,
    marginBottom: 24,
  },

  heroCard: {
    backgroundColor: "#155EEF",
    borderRadius: 22,
    padding: 20,
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 28,
  },

  heroTextArea: {
    flex: 1,
  },

  heroSmall: {
    color: "#FFF4C7",
    fontSize: 10,
    fontWeight: "900",
    marginBottom: 7,
  },

  heroTitle: {
    color: "#FFFFFF",
    fontSize: 22,
    fontWeight: "900",
  },

  heroText: {
    color: "#DDE8FF",
    fontSize: 12,
    lineHeight: 18,
    marginTop: 7,
  },

  heroIconBox: {
    width: 62,
    height: 62,
    borderRadius: 20,
    backgroundColor: "#FFF4C7",
    justifyContent: "center",
    alignItems: "center",
    marginLeft: 14,
  },

  sectionTitle: {
    fontSize: 17,
    fontWeight: "900",
    color: "#17233C",
    marginBottom: 12,
  },

  contactCard: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E5EAF2",
    borderRadius: 18,
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },

  iconBox: {
    width: 46,
    height: 46,
    borderRadius: 14,
    backgroundColor: "#EAF0FF",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 13,
  },

  yellowIconBox: {
    width: 46,
    height: 46,
    borderRadius: 14,
    backgroundColor: "#FFF4C7",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 13,
  },

  contactInfo: {
    flex: 1,
  },

  contactTitle: {
    fontSize: 14,
    fontWeight: "900",
    color: "#17233C",
  },

  contactText: {
    fontSize: 11,
    lineHeight: 16,
    color: "#6B7280",
    marginTop: 4,
  },

  faqCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 17,
    borderWidth: 1,
    borderColor: "#E5EAF2",
    padding: 16,
    marginBottom: 11,
  },

  faqHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },

  faqTitle: {
    flex: 1,
    fontSize: 14,
    fontWeight: "900",
    color: "#17233C",
  },

  faqText: {
    fontSize: 12,
    color: "#6B7280",
    lineHeight: 18,
    marginTop: 8,
  },

  infoCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFF4C7",
    borderRadius: 18,
    padding: 16,
    marginTop: 15,
  },

  infoIconBox: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: "#FFFFFF",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },

  infoContent: {
    flex: 1,
  },

  infoTitle: {
    fontSize: 14,
    fontWeight: "900",
    color: "#102A56",
  },

  infoText: {
    fontSize: 11,
    lineHeight: 17,
    color: "#52617A",
    marginTop: 4,
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