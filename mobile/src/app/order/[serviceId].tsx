import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  TextInput,
  Alert,
  ScrollView,
} from "react-native";
import { useLocalSearchParams, router } from "expo-router";
import axios from "axios";

export default function OrderScreen() {
  const params = useLocalSearchParams();

  const serviceId = String(params.serviceId);
  const serviceName = String(params.name || "");
  const unitType = String(params.unitType || "ITEM");
  const partnerId = String(params.partnerId || "");
  const price = Number(params.price || 0);

  const [quantity, setQuantity] = useState("1");
  const [note, setNote] = useState("");
  const [loading, setLoading] = useState(false);

  const numericQuantity = Number(quantity || 0);
  const total = price * numericQuantity;

  const handleOrder = async () => {
    try {
      setLoading(true);

      if (!numericQuantity || numericQuantity < 1) {
        Alert.alert(
          "Invalid Quantity",
          "Please enter a quantity of at least 1."
        );
        return;
      }

      const storedUser = await AsyncStorage.getItem("user");

      if (!storedUser) {
        Alert.alert(
          "Login Required",
          "Please login before placing an order."
        );

        router.replace("/login");
        return;
      }

      const user = JSON.parse(storedUser);

      const addressResponse = await axios.get(
        `http://localhost:5000/api/v1/addresses/${user.id}`
      );

      const addresses = addressResponse.data.data;

      if (!addresses || addresses.length === 0) {
        Alert.alert(
          "Address Required",
          "No address was found for your account."
        );
        return;
      }

      const defaultAddress =
        addresses.find((address: any) => address.is_default) ||
        addresses[0];

      const orderData = {
        customer_id: user.id,
        partner_id: partnerId,

        pickup_address_id: defaultAddress.id,
        return_address_id: defaultAddress.id,

        pickup_slot_start: new Date(
          Date.now() + 60 * 60 * 1000
        ).toISOString(),

        pickup_slot_end: new Date(
          Date.now() + 2 * 60 * 60 * 1000
        ).toISOString(),

        items: [
          {
            service_id: serviceId,
            service_name: serviceName,
            unit_type: unitType,
            quantity: numericQuantity,
            unit_price: price,
          },
        ],

        customer_note: note,
      };

      await axios.post(
        "http://localhost:5000/api/v1/orders",
        orderData
      );

      Alert.alert("Success", "Order placed successfully");

      router.replace("/orders");
    } catch (error: any) {
      console.log(
        "Order error:",
        error.response?.data || error.message
      );

      Alert.alert(
        "Order Failed",
        error.response?.data?.message || "Something went wrong"
      );
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
        {/* HEADER */}

        <View style={styles.header}>
          <Pressable
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Text style={styles.backText}>←</Text>
          </Pressable>

          <View style={styles.headerCenter}>
            <Text style={styles.brand}>SMART LAUNDRY</Text>
            <Text style={styles.tagline}>Laundry in One Tap</Text>
          </View>

          <View style={styles.headerSpacer} />
        </View>

        {/* TITLE */}

        <Text style={styles.title}>Place Order</Text>

        <Text style={styles.subtitle}>
          Review your service and confirm your laundry request.
        </Text>

        {/* SERVICE CARD */}

        <View style={styles.serviceCard}>
          <View style={styles.serviceIcon}>
            <Text style={styles.serviceEmoji}>👕</Text>
          </View>

          <View style={styles.serviceInfo}>
            <Text style={styles.serviceName}>
              {serviceName}
            </Text>

            <Text style={styles.serviceMeta}>
              Professional laundry service
            </Text>

            <Text style={styles.servicePrice}>
              {price} BDT / {unitType}
            </Text>
          </View>

          <View style={styles.selectedBadge}>
            <Text style={styles.selectedText}>
              SELECTED
            </Text>
          </View>
        </View>

        {/* QUANTITY */}

        <Text style={styles.sectionTitle}>
          Quantity
        </Text>

        <View style={styles.quantityCard}>
          <Pressable
            style={styles.quantityButton}
            onPress={() => {
              const next = Math.max(1, numericQuantity - 1);
              setQuantity(String(next));
            }}
          >
            <Text style={styles.quantityButtonText}>−</Text>
          </Pressable>

          <TextInput
            style={styles.quantityInput}
            value={quantity}
            onChangeText={setQuantity}
            keyboardType="numeric"
          />

          <Pressable
            style={styles.quantityButton}
            onPress={() =>
              setQuantity(String(numericQuantity + 1))
            }
          >
            <Text style={styles.quantityButtonText}>+</Text>
          </Pressable>
        </View>

        {/* NOTE */}

        <Text style={styles.sectionTitle}>
          Special Instructions
        </Text>

        <TextInput
          style={styles.noteInput}
          value={note}
          onChangeText={setNote}
          placeholder="Example: Please handle delicate clothes carefully"
          placeholderTextColor="#9CA3AF"
          multiline
        />

        {/* PICKUP INFO */}

        <View style={styles.pickupCard}>
          <View style={styles.pickupIcon}>
            <Text style={styles.pickupEmoji}>📍</Text>
          </View>

          <View style={styles.pickupContent}>
            <Text style={styles.pickupLabel}>
              Pickup Address
            </Text>

            <Text style={styles.pickupText}>
              Your default saved address will be used.
            </Text>
          </View>

          <Text style={styles.check}>✓</Text>
        </View>

        {/* ORDER SUMMARY */}

        <Text style={styles.sectionTitle}>
          Order Summary
        </Text>

        <View style={styles.summaryCard}>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>
              Service
            </Text>

            <Text style={styles.summaryValue}>
              {serviceName}
            </Text>
          </View>

          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>
              Quantity
            </Text>

            <Text style={styles.summaryValue}>
              {numericQuantity}
            </Text>
          </View>

          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>
              Unit Price
            </Text>

            <Text style={styles.summaryValue}>
              {price} BDT
            </Text>
          </View>

          <View style={styles.divider} />

          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Total</Text>

            <Text style={styles.total}>
              {total} BDT
            </Text>
          </View>
        </View>

        {/* INFO */}

        <View style={styles.infoCard}>
          <Text style={styles.infoIcon}>🛡️</Text>

          <Text style={styles.infoText}>
            Your order will be confirmed securely and added
            to My Orders for tracking.
          </Text>
        </View>

        {/* CONFIRM */}

        <Pressable
          style={[
            styles.confirmButton,
            loading && styles.disabledButton,
          ]}
          onPress={handleOrder}
          disabled={loading}
        >
          <Text style={styles.confirmButtonText}>
            {loading ? "Placing Order..." : "Confirm Order"}
          </Text>
        </Pressable>
      </ScrollView>
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

  backText: {
    fontSize: 22,
    color: "#17233C",
    fontWeight: "700",
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
    lineHeight: 19,
    marginTop: 6,
    marginBottom: 24,
  },

  serviceCard: {
    backgroundColor: "#155EEF",
    borderRadius: 22,
    padding: 18,
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 28,
  },

  serviceIcon: {
    width: 58,
    height: 58,
    borderRadius: 17,
    backgroundColor: "#FFF4C7",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 13,
  },

  serviceEmoji: {
    fontSize: 27,
  },

  serviceInfo: {
    flex: 1,
  },

  serviceName: {
    fontSize: 18,
    fontWeight: "900",
    color: "#FFFFFF",
  },

  serviceMeta: {
    fontSize: 11,
    color: "#DDE8FF",
    marginTop: 3,
  },

  servicePrice: {
    fontSize: 14,
    fontWeight: "900",
    color: "#FFF4C7",
    marginTop: 7,
  },

  selectedBadge: {
    backgroundColor: "#FFC928",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 20,
  },

  selectedText: {
    fontSize: 9,
    fontWeight: "900",
    color: "#102A56",
  },

  sectionTitle: {
    fontSize: 17,
    fontWeight: "900",
    color: "#17233C",
    marginBottom: 11,
  },

  quantityCard: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E5EAF2",
    borderRadius: 18,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 10,
    marginBottom: 24,
  },

  quantityButton: {
    width: 46,
    height: 46,
    borderRadius: 14,
    backgroundColor: "#FFF4C7",
    justifyContent: "center",
    alignItems: "center",
  },

  quantityButtonText: {
    fontSize: 24,
    fontWeight: "800",
    color: "#102A56",
  },

  quantityInput: {
    flex: 1,
    textAlign: "center",
    fontSize: 21,
    fontWeight: "900",
    color: "#17233C",
  },

  noteInput: {
    minHeight: 110,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E5EAF2",
    borderRadius: 18,
    padding: 16,
    fontSize: 14,
    color: "#17233C",
    textAlignVertical: "top",
    marginBottom: 24,
  },

  pickupCard: {
    backgroundColor: "#FFF4C7",
    borderRadius: 18,
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 26,
  },

  pickupIcon: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: "#FFFFFF",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },

  pickupEmoji: {
    fontSize: 20,
  },

  pickupContent: {
    flex: 1,
  },

  pickupLabel: {
    fontSize: 13,
    fontWeight: "900",
    color: "#102A56",
  },

  pickupText: {
    fontSize: 11,
    lineHeight: 16,
    color: "#52617A",
    marginTop: 3,
  },

  check: {
    fontSize: 18,
    color: "#155EEF",
    fontWeight: "900",
  },

  summaryCard: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E5EAF2",
    borderRadius: 20,
    padding: 18,
    marginBottom: 18,
  },

  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 12,
  },

  summaryLabel: {
    fontSize: 13,
    color: "#6B7280",
  },

  summaryValue: {
    fontSize: 13,
    color: "#17233C",
    fontWeight: "700",
  },

  divider: {
    height: 1,
    backgroundColor: "#EEF1F5",
    marginVertical: 6,
  },

  totalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 8,
  },

  totalLabel: {
    fontSize: 17,
    fontWeight: "900",
    color: "#17233C",
  },

  total: {
    fontSize: 21,
    fontWeight: "900",
    color: "#155EEF",
  },

  infoCard: {
    backgroundColor: "#EAF0FF",
    borderRadius: 16,
    padding: 14,
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 18,
  },

  infoIcon: {
    fontSize: 18,
    marginRight: 10,
  },

  infoText: {
    flex: 1,
    fontSize: 11,
    lineHeight: 16,
    color: "#52617A",
  },

  confirmButton: {
    backgroundColor: "#155EEF",
    borderRadius: 15,
    paddingVertical: 16,
    alignItems: "center",
  },

  disabledButton: {
    opacity: 0.6,
  },

  confirmButtonText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "900",
  },
});