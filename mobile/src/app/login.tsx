import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useState } from "react";
import {
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from "react-native";
import { router } from "expo-router";
import axios from "axios";

export default function LoginScreen() {
  const [email, setEmail] = useState("hasan@test.com");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    try {
      setLoading(true);

      const response = await axios.post(
        "http://localhost:5000/api/v1/auth/login",
        {
          email,
          password,
        }
      );

      const data = response.data;

      console.log("LOGIN RESPONSE:", data);
      console.log("LOGIN USER:", data.user);
      console.log("ROLE ID:", data.user?.role_id);

      if (!data.user) {
        Alert.alert(
          "Login Failed",
          "User information was not returned by the server."
        );
        return;
      }

      await AsyncStorage.setItem(
        "user",
        JSON.stringify(data.user)
      );

      if (data.session?.access_token) {
        await AsyncStorage.setItem(
          "access_token",
          data.session.access_token
        );
      }

      if (data.session?.refresh_token) {
        await AsyncStorage.setItem(
          "refresh_token",
          data.session.refresh_token
        );
      }

      const roleId = Number(data.user.role_id);

      console.log("PARSED ROLE ID:", roleId);

      if (roleId === 1) {
        console.log("Redirecting CUSTOMER → /home");
        router.replace("/home");
        return;
      }

      if (roleId === 2) {
        console.log("Redirecting RIDER → /rider/home");
        router.replace("/rider/home");
        return;
      }

      if (roleId === 3) {
        console.log("Redirecting PARTNER → /partner/home");
        router.replace("/partner/home");
        return;
      }

      if (roleId === 4) {
        console.log("Redirecting ADMIN → /admin/home");
        router.replace("/admin/home");
        return;
      }

      Alert.alert(
        "Login Failed",
        `Unknown account role: ${data.user.role_id}`
      );
    } catch (error: any) {
      console.log(
        "Login error:",
        error.response?.data || error.message
      );

      Alert.alert(
        "Login Failed",
        error.response?.data?.message ||
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
        <View style={styles.logoBox}>
          <Ionicons
            name="shirt-outline"
            size={31}
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
          <Text style={styles.heroEyebrow}>
            WELCOME BACK
          </Text>

          <Text style={styles.heroTitle}>
            Clean clothes,
            {"\n"}
            one tap away.
          </Text>

          <Text style={styles.heroText}>
            Login to access your Smart Laundry account.
          </Text>
        </View>

        <View style={styles.formCard}>
          <Text style={styles.title}>
            Login
          </Text>

          <Text style={styles.subtitle}>
            Enter your account details to continue.
          </Text>

          <Text style={styles.label}>
            Email Address
          </Text>

          <View style={styles.inputWrapper}>
            <Ionicons
              name="mail-outline"
              size={19}
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
            Password
          </Text>

          <View style={styles.inputWrapper}>
            <Ionicons
              name="lock-closed-outline"
              size={19}
              color="#8A93A4"
            />

            <TextInput
              style={styles.input}
              placeholder="Enter your password"
              placeholderTextColor="#9CA3AF"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
            />
          </View>

          <Pressable
            style={[
              styles.loginButton,
              loading && styles.disabledButton,
            ]}
            onPress={handleLogin}
            disabled={loading}
          >
            <Text style={styles.loginButtonText}>
              {loading ? "Logging in..." : "Login"}
            </Text>
          </Pressable>

          <Pressable
            onPress={() => router.push("/register")}
            style={styles.registerButton}
          >
            <Text style={styles.registerText}>
              Don&apos;t have an account?{" "}
              <Text style={styles.registerLink}>
                Create Account
              </Text>
            </Text>
          </Pressable>
        </View>

        <View style={styles.trustRow}>
          <View style={styles.trustItem}>
            <Ionicons
              name="flash-outline"
              size={20}
              color="#155EEF"
            />
            <Text style={styles.trustText}>
              Fast
            </Text>
          </View>

          <View style={styles.trustItem}>
            <Ionicons
              name="shield-checkmark-outline"
              size={20}
              color="#155EEF"
            />
            <Text style={styles.trustText}>
              Secure
            </Text>
          </View>

          <View style={styles.trustItem}>
            <Ionicons
              name="location-outline"
              size={20}
              color="#155EEF"
            />
            <Text style={styles.trustText}>
              Trackable
            </Text>
          </View>
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
    paddingTop: 54,
    paddingBottom: 35,
  },

  logoBox: {
    width: 60,
    height: 60,
    borderRadius: 18,
    backgroundColor: "#FFF4C7",
    justifyContent: "center",
    alignItems: "center",
    alignSelf: "center",
    marginBottom: 13,
  },

  brand: {
    textAlign: "center",
    fontSize: 21,
    fontWeight: "900",
    color: "#155EEF",
    letterSpacing: 0.4,
  },

  tagline: {
    textAlign: "center",
    fontSize: 12,
    color: "#6B7280",
    marginTop: 4,
    marginBottom: 26,
  },

  heroCard: {
    backgroundColor: "#155EEF",
    borderRadius: 24,
    padding: 22,
    marginBottom: 18,
  },

  heroEyebrow: {
    fontSize: 10,
    fontWeight: "900",
    color: "#FFF4C7",
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
    borderRadius: 22,
    borderWidth: 1,
    borderColor: "#E5EAF2",
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
    marginBottom: 23,
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
    gap: 9,
    backgroundColor: "#F9FAFC",
    borderWidth: 1,
    borderColor: "#E5EAF2",
    borderRadius: 14,
    paddingHorizontal: 14,
    marginBottom: 17,
  },

  input: {
    flex: 1,
    paddingVertical: 14,
    fontSize: 14,
    color: "#17233C",
    outlineStyle: "none" as any,
  },

  loginButton: {
    backgroundColor: "#155EEF",
    borderRadius: 14,
    paddingVertical: 15,
    alignItems: "center",
    marginTop: 3,
  },

  disabledButton: {
    opacity: 0.6,
  },

  loginButtonText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "900",
  },

  registerButton: {
    marginTop: 18,
  },

  registerText: {
    textAlign: "center",
    fontSize: 13,
    color: "#6B7280",
  },

  registerLink: {
    color: "#155EEF",
    fontWeight: "900",
  },

  trustRow: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 28,
    marginTop: 22,
  },

  trustItem: {
    alignItems: "center",
    gap: 4,
  },

  trustText: {
    fontSize: 10,
    color: "#8A93A4",
    fontWeight: "700",
  },
});