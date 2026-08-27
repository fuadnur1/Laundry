import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useEffect, useState } from "react";
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

type Address = {
  id: string;
  user_id: string;
  label?: string | null;
  address_line: string;
  area: string;
  city: string;
  postal_code?: string | null;
  is_default?: boolean;
};

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

  const [userId, setUserId] = useState("");

  const [addresses, setAddresses] =
    useState<Address[]>([]);

  const [
    selectedAddressId,
    setSelectedAddressId,
  ] = useState("");

  const [
    loadingAddresses,
    setLoadingAddresses,
  ] = useState(true);

  const [
    showAddressForm,
    setShowAddressForm,
  ] = useState(false);

  const [
    savingAddress,
    setSavingAddress,
  ] = useState(false);

  const [newAddress, setNewAddress] =
    useState({
      label: "Home",
      address_line: "",
      area: "",
      city: "Dhaka",
      postal_code: "",
      is_default: false,
    });

  const numericQuantity = Number(quantity || 0);
  const total = price * numericQuantity;

  // -----------------------------------------
  // LOAD USER + ADDRESSES
  // -----------------------------------------

  useEffect(() => {
    loadUserAndAddresses();
  }, []);

  const loadUserAndAddresses = async (
    addressToSelect?: string
  ) => {
    try {
      setLoadingAddresses(true);

      const storedUser =
        await AsyncStorage.getItem("user");

      if (!storedUser) {
        router.replace("/login");
        return;
      }

      const user = JSON.parse(storedUser);

      setUserId(user.id);

      const response = await axios.get(
        `http://localhost:5000/api/v1/addresses/${user.id}`
      );

      const rows: Address[] =
        response.data.data || [];

      setAddresses(rows);

      if (addressToSelect) {
        setSelectedAddressId(
          addressToSelect
        );
        return;
      }

      const defaultAddress =
        rows.find(
          (address) =>
            address.is_default
        ) || rows[0];

      if (defaultAddress) {
        setSelectedAddressId(
          defaultAddress.id
        );
      } else {
        setSelectedAddressId("");
      }
    } catch (error: any) {
      console.log(
        "Address load error:",
        error.response?.data ||
          error.message
      );
    } finally {
      setLoadingAddresses(false);
    }
  };

  const selectedAddress =
    addresses.find(
      (address) =>
        address.id ===
        selectedAddressId
    );

  // -----------------------------------------
  // ADDRESS SELECTION
  // -----------------------------------------

  const selectPreviousAddress = () => {
    if (addresses.length <= 1) {
      return;
    }

    const currentIndex =
      addresses.findIndex(
        (address) =>
          address.id ===
          selectedAddressId
      );

    const nextIndex =
      currentIndex <= 0
        ? addresses.length - 1
        : currentIndex - 1;

    setSelectedAddressId(
      addresses[nextIndex].id
    );
  };

  const selectNextAddress = () => {
    if (addresses.length <= 1) {
      return;
    }

    const currentIndex =
      addresses.findIndex(
        (address) =>
          address.id ===
          selectedAddressId
      );

    const nextIndex =
      currentIndex >=
      addresses.length - 1
        ? 0
        : currentIndex + 1;

    setSelectedAddressId(
      addresses[nextIndex].id
    );
  };

  // -----------------------------------------
  // SAVE NEW ADDRESS
  // -----------------------------------------

  const handleSaveAddress = async () => {
    if (!userId) {
      Alert.alert(
        "Login Required",
        "Please login first."
      );
      return;
    }

    if (!newAddress.address_line.trim()) {
      Alert.alert(
        "Address Required",
        "Please enter your full address."
      );
      return;
    }

    if (!newAddress.area.trim()) {
      Alert.alert(
        "Area Required",
        "Please enter your area."
      );
      return;
    }

    if (!newAddress.city.trim()) {
      Alert.alert(
        "City Required",
        "Please enter your city."
      );
      return;
    }

    try {
      setSavingAddress(true);

      const response = await axios.post(
        "http://localhost:5000/api/v1/addresses",
        {
          user_id: userId,

          label:
            newAddress.label.trim(),

          address_line:
            newAddress.address_line.trim(),

          area:
            newAddress.area.trim(),

          city:
            newAddress.city.trim(),

          postal_code:
            newAddress.postal_code.trim(),

          is_default:
            newAddress.is_default,
        }
      );

      const createdAddress =
        response.data.data;

      setNewAddress({
        label: "Home",
        address_line: "",
        area: "",
        city: "Dhaka",
        postal_code: "",
        is_default: false,
      });

      setShowAddressForm(false);

      await loadUserAndAddresses(
        createdAddress?.id
      );

      Alert.alert(
        "Address Saved",
        "Your new address has been saved."
      );
    } catch (error: any) {
      console.log(
        "Save address error:",
        error.response?.data ||
          error.message
      );

      Alert.alert(
        "Could Not Save Address",
        error.response?.data?.message ||
          "Something went wrong."
      );
    } finally {
      setSavingAddress(false);
    }
  };

  // -----------------------------------------
  // PLACE ORDER
  // -----------------------------------------

  const handleOrder = async () => {
    try {
      setLoading(true);

      if (
        !numericQuantity ||
        numericQuantity < 1
      ) {
        Alert.alert(
          "Invalid Quantity",
          "Please enter a quantity of at least 1."
        );
        return;
      }

      if (!userId) {
        Alert.alert(
          "Login Required",
          "Please login before placing an order."
        );

        router.replace("/login");
        return;
      }

      if (!selectedAddressId) {
        Alert.alert(
          "Address Required",
          "Please select or add a pickup address."
        );
        return;
      }

      const orderData = {
        customer_id: userId,
        partner_id: partnerId,

        pickup_address_id:
          selectedAddressId,

        return_address_id:
          selectedAddressId,

        pickup_slot_start: new Date(
          Date.now() +
            60 * 60 * 1000
        ).toISOString(),

        pickup_slot_end: new Date(
          Date.now() +
            2 * 60 * 60 * 1000
        ).toISOString(),

        items: [
          {
            service_id: serviceId,
            service_name: serviceName,
            unit_type: unitType,
            quantity:
              numericQuantity,
            unit_price: price,
          },
        ],

        customer_note: note,
      };

      await axios.post(
        "http://localhost:5000/api/v1/orders",
        orderData
      );

      Alert.alert(
        "Success",
        "Order placed successfully"
      );

      router.replace("/orders");
    } catch (error: any) {
      console.log(
        "Order error:",
        error.response?.data ||
          error.message
      );

      Alert.alert(
        "Order Failed",
        error.response?.data?.message ||
          "Something went wrong"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.screen}>
      <ScrollView
        contentContainerStyle={
          styles.container
        }
        showsVerticalScrollIndicator={
          false
        }
      >
        {/* HEADER */}

        <View style={styles.header}>
          <Pressable
            style={styles.backButton}
            onPress={() =>
              router.back()
            }
          >
            <Text style={styles.backText}>
              ←
            </Text>
          </Pressable>

          <View
            style={styles.headerCenter}
          >
            <Text style={styles.brand}>
              SMART LAUNDRY
            </Text>

            <Text style={styles.tagline}>
              Laundry in One Tap
            </Text>
          </View>

          <View
            style={styles.headerSpacer}
          />
        </View>

        {/* TITLE */}

        <Text style={styles.title}>
          Place Order
        </Text>

        <Text style={styles.subtitle}>
          Review your service and confirm
          your laundry request.
        </Text>

        {/* SERVICE CARD */}

        <View style={styles.serviceCard}>
          <View
            style={styles.serviceIcon}
          >
            <Text
              style={styles.serviceEmoji}
            >
              👕
            </Text>
          </View>

          <View
            style={styles.serviceInfo}
          >
            <Text
              style={styles.serviceName}
            >
              {serviceName}
            </Text>

            <Text
              style={styles.serviceMeta}
            >
              Professional laundry
              service
            </Text>

            <Text
              style={styles.servicePrice}
            >
              {price} BDT / {unitType}
            </Text>
          </View>

          <View
            style={styles.selectedBadge}
          >
            <Text
              style={styles.selectedText}
            >
              SELECTED
            </Text>
          </View>
        </View>

        {/* QUANTITY */}

        <Text
          style={styles.sectionTitle}
        >
          Quantity
        </Text>

        <View
          style={styles.quantityCard}
        >
          <Pressable
            style={
              styles.quantityButton
            }
            onPress={() => {
              const next = Math.max(
                1,
                numericQuantity - 1
              );

              setQuantity(
                String(next)
              );
            }}
          >
            <Text
              style={
                styles.quantityButtonText
              }
            >
              −
            </Text>
          </Pressable>

          <TextInput
            style={
              styles.quantityInput
            }
            value={quantity}
            onChangeText={setQuantity}
            keyboardType="numeric"
          />

          <Pressable
            style={
              styles.quantityButton
            }
            onPress={() =>
              setQuantity(
                String(
                  numericQuantity + 1
                )
              )
            }
          >
            <Text
              style={
                styles.quantityButtonText
              }
            >
              +
            </Text>
          </Pressable>
        </View>

        {/* NOTE */}

        <Text
          style={styles.sectionTitle}
        >
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

        {/* PICKUP ADDRESS */}

        <Text
          style={styles.sectionTitle}
        >
          Pickup Address
        </Text>

        <View style={styles.pickupCard}>
          <View
            style={styles.pickupIcon}
          >
            <Text
              style={styles.pickupEmoji}
            >
              📍
            </Text>
          </View>

          <View
            style={styles.pickupContent}
          >
            {loadingAddresses ? (
              <Text
                style={
                  styles.pickupText
                }
              >
                Loading saved
                addresses...
              </Text>
            ) : selectedAddress ? (
              <>
                <Text
                  style={
                    styles.pickupLabel
                  }
                >
                  {selectedAddress.label ||
                    "Saved Address"}
                  {selectedAddress.is_default
                    ? " • Default"
                    : ""}
                </Text>

                <Text
                  style={
                    styles.pickupText
                  }
                >
                  {[
                    selectedAddress.address_line,
                    selectedAddress.area,
                    selectedAddress.city,
                    selectedAddress.postal_code,
                  ]
                    .filter(Boolean)
                    .join(", ")}
                </Text>
              </>
            ) : (
              <>
                <Text
                  style={
                    styles.pickupLabel
                  }
                >
                  No saved address
                </Text>

                <Text
                  style={
                    styles.pickupText
                  }
                >
                  Add an address before
                  confirming your order.
                </Text>
              </>
            )}
          </View>

          {selectedAddress && (
            <Text style={styles.check}>
              ✓
            </Text>
          )}
        </View>

        {/* ADDRESS SELECTOR */}

        {addresses.length > 1 && (
          <View
            style={
              styles.addressSwitchRow
            }
          >
            <Pressable
              style={
                styles.addressSwitchButton
              }
              onPress={
                selectPreviousAddress
              }
            >
              <Ionicons
                name="chevron-back"
                size={18}
                color="#155EEF"
              />

              <Text
                style={
                  styles.addressSwitchText
                }
              >
                Previous
              </Text>
            </Pressable>

            <Text
              style={
                styles.addressCount
              }
            >
              {addresses.findIndex(
                (address) =>
                  address.id ===
                  selectedAddressId
              ) + 1}
              /{addresses.length}
            </Text>

            <Pressable
              style={
                styles.addressSwitchButton
              }
              onPress={
                selectNextAddress
              }
            >
              <Text
                style={
                  styles.addressSwitchText
                }
              >
                Next
              </Text>

              <Ionicons
                name="chevron-forward"
                size={18}
                color="#155EEF"
              />
            </Pressable>
          </View>
        )}

        <Pressable
          style={styles.addAddressButton}
          onPress={() =>
            setShowAddressForm(
              (current) => !current
            )
          }
        >
          <Ionicons
            name={
              showAddressForm
                ? "close-circle-outline"
                : "add-circle-outline"
            }
            size={20}
            color="#155EEF"
          />

          <Text
            style={
              styles.addAddressButtonText
            }
          >
            {showAddressForm
              ? "Cancel"
              : "Add New Address"}
          </Text>
        </Pressable>

        {/* NEW ADDRESS FORM */}

        {showAddressForm && (
          <View
            style={styles.addressFormCard}
          >
            <Text
              style={styles.addressFormTitle}
            >
              Save New Address
            </Text>

            <Text
              style={styles.fieldLabel}
            >
              Label
            </Text>

            <View
              style={styles.labelOptions}
            >
              {[
                "Home",
                "Office",
                "Other",
              ].map((label) => (
                <Pressable
                  key={label}
                  style={[
                    styles.labelOption,

                    newAddress.label ===
                      label &&
                      styles.labelOptionActive,
                  ]}
                  onPress={() =>
                    setNewAddress(
                      (current) => ({
                        ...current,
                        label,
                      })
                    )
                  }
                >
                  <Text
                    style={[
                      styles.labelOptionText,

                      newAddress.label ===
                        label &&
                        styles.labelOptionTextActive,
                    ]}
                  >
                    {label}
                  </Text>
                </Pressable>
              ))}
            </View>

            <Text
              style={styles.fieldLabel}
            >
              Full Address *
            </Text>

            <TextInput
              style={styles.addressInput}
              placeholder="House 2, Road 1, C Block"
              placeholderTextColor="#9CA3AF"
              value={
                newAddress.address_line
              }
              onChangeText={(value) =>
                setNewAddress(
                  (current) => ({
                    ...current,
                    address_line:
                      value,
                  })
                )
              }
            />

            <Text
              style={styles.fieldLabel}
            >
              Area *
            </Text>

            <TextInput
              style={styles.addressInput}
              placeholder="Bashundhara R/A"
              placeholderTextColor="#9CA3AF"
              value={newAddress.area}
              onChangeText={(value) =>
                setNewAddress(
                  (current) => ({
                    ...current,
                    area: value,
                  })
                )
              }
            />

            <Text
              style={styles.fieldLabel}
            >
              City *
            </Text>

            <TextInput
              style={styles.addressInput}
              placeholder="Dhaka"
              placeholderTextColor="#9CA3AF"
              value={newAddress.city}
              onChangeText={(value) =>
                setNewAddress(
                  (current) => ({
                    ...current,
                    city: value,
                  })
                )
              }
            />

            <Text
              style={styles.fieldLabel}
            >
              Postal Code
            </Text>

            <TextInput
              style={styles.addressInput}
              placeholder="1229"
              placeholderTextColor="#9CA3AF"
              keyboardType="numeric"
              value={
                newAddress.postal_code
              }
              onChangeText={(value) =>
                setNewAddress(
                  (current) => ({
                    ...current,
                    postal_code:
                      value,
                  })
                )
              }
            />

            <Pressable
              style={
                styles.defaultAddressRow
              }
              onPress={() =>
                setNewAddress(
                  (current) => ({
                    ...current,
                    is_default:
                      !current.is_default,
                  })
                )
              }
            >
              <View
                style={[
                  styles.checkbox,

                  newAddress.is_default &&
                    styles.checkboxActive,
                ]}
              >
                {newAddress.is_default && (
                  <Ionicons
                    name="checkmark"
                    size={15}
                    color="#FFFFFF"
                  />
                )}
              </View>

              <Text
                style={
                  styles.defaultAddressText
                }
              >
                Make this my default
                address
              </Text>
            </Pressable>

            <Pressable
              style={[
                styles.saveAddressButton,

                savingAddress &&
                  styles.disabledButton,
              ]}
              disabled={savingAddress}
              onPress={
                handleSaveAddress
              }
            >
              <Text
                style={
                  styles.saveAddressButtonText
                }
              >
                {savingAddress
                  ? "Saving..."
                  : "Save Address"}
              </Text>
            </Pressable>
          </View>
        )}

        {/* ORDER SUMMARY */}

        <Text
          style={styles.sectionTitle}
        >
          Order Summary
        </Text>

        <View
          style={styles.summaryCard}
        >
          <View
            style={styles.summaryRow}
          >
            <Text
              style={styles.summaryLabel}
            >
              Service
            </Text>

            <Text
              style={styles.summaryValue}
            >
              {serviceName}
            </Text>
          </View>

          <View
            style={styles.summaryRow}
          >
            <Text
              style={styles.summaryLabel}
            >
              Quantity
            </Text>

            <Text
              style={styles.summaryValue}
            >
              {numericQuantity}
            </Text>
          </View>

          <View
            style={styles.summaryRow}
          >
            <Text
              style={styles.summaryLabel}
            >
              Unit Price
            </Text>

            <Text
              style={styles.summaryValue}
            >
              {price} BDT
            </Text>
          </View>

          <View style={styles.divider} />

          <View style={styles.totalRow}>
            <Text
              style={styles.totalLabel}
            >
              Total
            </Text>

            <Text style={styles.total}>
              {total} BDT
            </Text>
          </View>
        </View>

        {/* INFO */}

        <View style={styles.infoCard}>
          <Text style={styles.infoIcon}>
            🛡️
          </Text>

          <Text style={styles.infoText}>
            Your order will be confirmed
            securely and added to My Orders
            for tracking.
          </Text>
        </View>

        {/* CONFIRM */}

        <Pressable
          style={[
            styles.confirmButton,

            loading &&
              styles.disabledButton,
          ]}
          onPress={handleOrder}
          disabled={loading}
        >
          <Text
            style={
              styles.confirmButtonText
            }
          >
            {loading
              ? "Placing Order..."
              : "Confirm Order"}
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
    marginBottom: 12,
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

  addressSwitchRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent:
      "space-between",
    marginBottom: 12,
  },

  addressSwitchButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingVertical: 8,
  },

  addressSwitchText: {
    color: "#155EEF",
    fontSize: 12,
    fontWeight: "800",
  },

  addressCount: {
    color: "#6B7280",
    fontSize: 12,
    fontWeight: "700",
  },

  addAddressButton: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#DDE5F0",
    borderRadius: 14,
    paddingVertical: 13,
    paddingHorizontal: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 7,
    marginBottom: 22,
  },

  addAddressButtonText: {
    color: "#155EEF",
    fontSize: 13,
    fontWeight: "900",
  },

  addressFormCard: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E5EAF2",
    borderRadius: 20,
    padding: 17,
    marginBottom: 24,
  },

  addressFormTitle: {
    fontSize: 18,
    fontWeight: "900",
    color: "#17233C",
    marginBottom: 18,
  },

  fieldLabel: {
    fontSize: 12,
    fontWeight: "800",
    color: "#344054",
    marginBottom: 7,
  },

  addressInput: {
    backgroundColor: "#F9FAFB",
    borderWidth: 1,
    borderColor: "#E5EAF2",
    borderRadius: 13,
    paddingHorizontal: 14,
    paddingVertical: 13,
    fontSize: 13,
    color: "#17233C",
    marginBottom: 15,
  },

  labelOptions: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 17,
  },

  labelOption: {
    paddingHorizontal: 15,
    paddingVertical: 9,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#DDE5F0",
    backgroundColor: "#FFFFFF",
  },

  labelOptionActive: {
    backgroundColor: "#155EEF",
    borderColor: "#155EEF",
  },

  labelOptionText: {
    fontSize: 12,
    fontWeight: "800",
    color: "#52617A",
  },

  labelOptionTextActive: {
    color: "#FFFFFF",
  },

  defaultAddressRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 17,
  },

  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: "#C7D0DD",
    backgroundColor: "#FFFFFF",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 9,
  },

  checkboxActive: {
    backgroundColor: "#155EEF",
    borderColor: "#155EEF",
  },

  defaultAddressText: {
    fontSize: 12,
    color: "#52617A",
    fontWeight: "700",
  },

  saveAddressButton: {
    backgroundColor: "#155EEF",
    borderRadius: 13,
    paddingVertical: 14,
    alignItems: "center",
  },

  saveAddressButtonText: {
    color: "#FFFFFF",
    fontSize: 14,
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