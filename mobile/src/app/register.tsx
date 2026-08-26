import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import {
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  Alert,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { router } from "expo-router";
import axios from "axios";

export default function RegisterScreen() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleRegister = async () => {
    try {
      if (!name || !email || !phone || !password) {
        Alert.alert(
          "Missing Information",
          "Please fill in all fields."
        );
        return;
      }

      setLoading(true);

      await axios.post(
        "http://localhost:5000/api/v1/auth/register",
        {
          name,
          email,
          phone,
          password,
        }
      );

      Alert.alert(
        "Registration Successful",
        "Your account has been created. Please login."
      );

      router.replace("/login");
    } catch (error: any) {
      console.log(
        "Registration error:",
        error.response?.data || error.message
      );

      Alert.alert(
        "Registration Failed",
        error.response?.data?.message ||
          error.response?.data?.error ||
          "Something went wrong"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.screen}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView
        contentContainerStyle={styles.container}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <Pressable
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Ionicons
            name="arrow-back"
            size={21}
            color="#17233C"
          />
        </Pressable>

        <View style={styles.logoBox}>
          <Ionicons
            name="shirt-outline"
            size={32}
            color="#155EEF"
          />
        </View>

        <Text style={styles.brand}>
          SMART LAUNDRY
        </Text>

        <Text style={styles.tagline}>
          Laundry in One Tap
        </Text>

        <View style={styles.heroCard}>
          <Text style={styles.heroSmall}>
            JOIN SMART LAUNDRY
          </Text>

          <Text style={styles.heroTitle}>
            Create your
            {"\n"}
            account.
          </Text>

          <Text style={styles.heroText}>
            Book laundry, track orders and manage your
            deliveries from one place.
          </Text>
        </View>

        <View style={styles.formCard}>
          <Text style={styles.title}>
            Register
          </Text>

          <Text style={styles.subtitle}>
            Enter your details to create an account.
          </Text>

          <Text style={styles.label}>
            Full Name
          </Text>

          <View style={styles.inputWrapper}>
            <Ionicons
              name="person-outline"
              size={18}
              color="#8A93A4"
            />

            <TextInput
              style={styles.input}
              placeholder="Enter your name"
              placeholderTextColor="#9CA3AF"
              value={name}
              onChangeText={setName}
            />
          </View>

          <Text style={styles.label}>
            Email Address
          </Text>

          <View style={styles.inputWrapper}>
            <Ionicons
              name="mail-outline"
              size={18}
              color="#8A93A4"
            />

            <TextInput
              style={styles.input}
              placeholder="Enter your email"
              placeholderTextColor="#9CA3AF"
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              keyboardType="email-address"
            />
          </View>

          <Text style={styles.label}>
            Phone Number
          </Text>

          <View style={styles.inputWrapper}>
            <Ionicons
              name="call-outline"
              size={18}
              color="#8A93A4"
            />

            <TextInput
              style={styles.input}
              placeholder="01XXXXXXXXX"
              placeholderTextColor="#9CA3AF"
              value={phone}
              onChangeText={setPhone}
              keyboardType="phone-pad"
            />
          </View>

          <Text style={styles.label}>
            Password
          </Text>

          <View style={styles.inputWrapper}>
            <Ionicons
              name="lock-closed-outline"
              size={18}
              color="#8A93A4"
            />

            <TextInput
              style={styles.input}
              placeholder="Create a password"
              placeholderTextColor="#9CA3AF"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
            />
          </View>

          <Pressable
            style={[
              styles.registerButton,
              loading && styles.disabledButton,
            ]}
            onPress={handleRegister}
            disabled={loading}
          >
            <Text style={styles.registerButtonText}>
              {loading
                ? "Creating Account..."
                : "Create Account"}
            </Text>
          </Pressable>

          <Pressable
            style={styles.loginLink}
            onPress={() => router.replace("/login")}
          >
            <Text style={styles.loginText}>
              Already have an account?{" "}
              <Text style={styles.loginTextBold}>
                Login
              </Text>
            </Text>
          </Pressable>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#F7F9FC",
  },

  container: {
    flexGrow: 1,
    padding: 22,
    paddingTop: 48,
    paddingBottom: 40,
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
    marginBottom: 22,
  },

  logoBox: {
    width: 60,
    height: 60,
    borderRadius: 18,
    backgroundColor: "#FFF4C7",
    justifyContent: "center",
    alignItems: "center",
    alignSelf: "center",
    marginBottom: 12,
  },

  brand: {
    textAlign: "center",
    fontSize: 21,
    fontWeight: "900",
    color: "#155EEF",
  },

  tagline: {
    textAlign: "center",
    fontSize: 12,
    color: "#6B7280",
    marginTop: 4,
    marginBottom: 25,
  },

  heroCard: {
    backgroundColor: "#155EEF",
    borderRadius: 24,
    padding: 22,
    marginBottom: 18,
  },

  heroSmall: {
    fontSize: 10,
    color: "#FFF4C7",
    fontWeight: "900",
    marginBottom: 8,
  },

  heroTitle: {
    fontSize: 27,
    lineHeight: 32,
    fontWeight: "900",
    color: "#FFFFFF",
  },

  heroText: {
    marginTop: 9,
    fontSize: 13,
    lineHeight: 19,
    color: "#DDE8FF",
  },

  formCard: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E5EAF2",
    borderRadius: 22,
    padding: 20,
  },

  title: {
    fontSize: 25,
    fontWeight: "900",
    color: "#17233C",
  },

  subtitle: {
    fontSize: 13,
    color: "#6B7280",
    marginTop: 5,
    marginBottom: 22,
  },

  label: {
    fontSize: 12,
    fontWeight: "800",
    color: "#52617A",
    marginBottom: 8,
  },

  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F9FAFC",
    borderWidth: 1,
    borderColor: "#E5EAF2",
    borderRadius: 14,
    paddingHorizontal: 14,
    marginBottom: 16,
    gap: 9,
  },

  input: {
    flex: 1,
    paddingVertical: 14,
    fontSize: 14,
    color: "#17233C",
  },

  registerButton: {
    backgroundColor: "#155EEF",
    borderRadius: 14,
    paddingVertical: 15,
    alignItems: "center",
    marginTop: 3,
  },

  disabledButton: {
    opacity: 0.6,
  },

  registerButtonText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "900",
  },

  loginLink: {
    marginTop: 18,
  },

  loginText: {
    textAlign: "center",
    fontSize: 13,
    color: "#6B7280",
  },

  loginTextBold: {
    color: "#155EEF",
    fontWeight: "900",
  },
});