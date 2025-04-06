import React, { useState } from "react";
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  TextInput,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
  Keyboard,
  Modal,
  FlatList,
  TouchableOpacity,
  Alert,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { MaterialIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { BASE_URL } from "../config";

const Verification = () => {
  const params = useLocalSearchParams();
  const router = useRouter();

  // Validate params from SignIn.js
  if (
    !params.firstName ||
    !params.lastName ||
    !params.year ||
    !params.month ||
    !params.day ||
    !params.pin
  ) {
    Alert.alert("Error", "Missing sign-up data. Please go back and try again.");
    router.back();
    return null; // Prevent rendering if data is incomplete
  }

  // User data from previous screen
  const userData = {
    firstName: params.firstName,
    lastName: params.lastName,
    dateOfBirth: {
      year: parseInt(params.year),
      month: parseInt(params.month),
      day: parseInt(params.day),
    },
    pin: params.pin,
  };

  const [mobile, setMobile] = useState("");
  const [otp, setOtp] = useState("");
  const [isOtpSent, setIsOtpSent] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [countryCode, setCountryCode] = useState("+977");
  const [showCountryPicker, setShowCountryPicker] = useState(false);

  const countryCodes = [
    { label: "🇳🇵 +977", value: "+977" },
    { label: "🇺🇸 +1", value: "+1" },
    { label: "🇬🇧 +44", value: "+44" },
    { label: "🇮🇳 +91", value: "+91" },
    { label: "🇨🇳 +86", value: "+86" },
  ];

  const handleSendOtp = async () => {
    if (!mobile || mobile.length !== 10) {
      Alert.alert(
        "Invalid Number",
        "Please enter a valid 10-digit mobile number"
      );
      return;
    }

    const fullMobile = `${countryCode}${mobile}`;
    console.log("Sending to /send-otp:", { countryCode, mobile });

    try {
      setIsLoading(true);
      const response = await fetch(`${BASE_URL}/send-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          countryCode,
          mobile,
        }),
      });

      const data = await response.json();
      console.log("Response from /send-otp:", data);

      if (response.ok && data.success) {
        setIsOtpSent(true);
        Alert.alert(
          "OTP Sent",
          "Verification code has been sent to your number"
        );
      } else {
        Alert.alert("Error", data.message || "Failed to send OTP");
      }
    } catch (error) {
      console.error("Error in handleSendOtp:", error);
      Alert.alert("Error", "Failed to connect. Please try again");
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    if (!mobile || mobile.length !== 10) {
      Alert.alert(
        "Invalid Number",
        "Please enter a valid 10-digit mobile number"
      );
      return;
    }
    if (!otp || otp.length !== 6) {
      Alert.alert("Invalid OTP", "Please enter a 6-digit verification code");
      return;
    }

    const payload = {
      mobile: `${countryCode}${mobile}`,
      otp,
      userData,
    };
    console.log("Sending to /verify-otp:", JSON.stringify(payload, null, 2));

    try {
      setIsLoading(true);
      const verifyResponse = await fetch(`${BASE_URL}/verify-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const verifyData = await verifyResponse.json();
      console.log("Response from /verify-otp:", verifyData);

      if (!verifyResponse.ok || !verifyData.success) {
        throw new Error(verifyData.detail || "OTP verification failed");
      }

      Alert.alert("Success", "Account created successfully", [
        { text: "OK", onPress: () => router.replace("./login") },
      ]);
    } catch (error) {
      console.error("Error in handleVerifyOtp:", error);
      Alert.alert("Error", error.message || "Something went wrong");
    } finally {
      setIsLoading(false);
    }
  };

  const renderPickerItem = ({ item }) => (
    <TouchableOpacity
      style={styles.pickerItem}
      onPress={() => {
        setCountryCode(item.value);
        setShowCountryPicker(false);
      }}
    >
      <Text style={styles.pickerItemText}>{item.label}</Text>
    </TouchableOpacity>
  );

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.container}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <LinearGradient
          colors={["#0A2463", "#3E92CC"]}
          style={styles.background}
        >
          <View style={styles.card}>
            <Text style={styles.title}>Verify Your Number</Text>
            <Text style={styles.subtitle}>
              We'll send a verification code to {userData.firstName}{" "}
              {userData.lastName}
            </Text>

            {/* Phone Input */}
            <View style={styles.formGroup}>
              <Text style={styles.label}>MOBILE NUMBER</Text>
              <View style={styles.inputContainer}>
                <MaterialIcons
                  name="phone"
                  size={20}
                  color="#6B7280"
                  style={styles.inputIcon}
                />
                <Pressable
                  style={styles.countryCodeContainer}
                  onPress={() => setShowCountryPicker(true)}
                >
                  <Text style={styles.countryCodeText}>
                    {countryCodes.find((c) => c.value === countryCode)?.label ||
                      "+977"}
                  </Text>
                  <MaterialIcons
                    name="arrow-drop-down"
                    size={24}
                    color="#6B7280"
                  />
                </Pressable>
                <TextInput
                  style={[styles.input, styles.phoneInput]}
                  placeholder="98XXXXXXXX"
                  placeholderTextColor="#9CA3AF"
                  keyboardType="phone-pad"
                  maxLength={10}
                  value={mobile}
                  onChangeText={setMobile}
                  editable={!isOtpSent}
                />
              </View>
            </View>

            {/* OTP Input (shown after OTP is sent) */}
            {isOtpSent && (
              <View style={styles.formGroup}>
                <Text style={styles.label}>VERIFICATION CODE</Text>
                <View style={styles.inputContainer}>
                  <MaterialIcons
                    name="sms"
                    size={20}
                    color="#6B7280"
                    style={styles.inputIcon}
                  />
                  <TextInput
                    style={styles.input}
                    placeholder="6-digit code"
                    placeholderTextColor="#9CA3AF"
                    keyboardType="numeric"
                    maxLength={6}
                    value={otp}
                    onChangeText={setOtp}
                  />
                </View>
              </View>
            )}

            {/* Action Buttons */}
            <Pressable
              style={({ pressed }) => [
                styles.actionButton,
                pressed && styles.buttonPressed,
                isLoading && styles.buttonDisabled,
              ]}
              onPress={isOtpSent ? handleVerifyOtp : handleSendOtp}
              disabled={isLoading}
            >
              <LinearGradient
                colors={["#3E92CC", "#0A2463"]}
                style={styles.gradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
              >
                {isLoading ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.buttonText}>
                    {isOtpSent ? "VERIFY OTP" : "SEND OTP"}
                  </Text>
                )}
              </LinearGradient>
            </Pressable>

            {/* Resend OTP Button */}
            {isOtpSent && (
              <Pressable onPress={handleSendOtp} style={styles.resendButton}>
                <Text style={styles.resendText}>Resend OTP</Text>
              </Pressable>
            )}

            {/* Back Link */}
            <Pressable style={styles.backButton} onPress={() => router.back()}>
              <Text style={styles.backText}>Back to Sign Up</Text>
            </Pressable>

            {/* Country Code Picker Modal */}
            <Modal
              visible={showCountryPicker}
              transparent={true}
              animationType="slide"
              onRequestClose={() => setShowCountryPicker(false)}
            >
              <View style={styles.modalContainer}>
                <View style={styles.modalContent}>
                  <FlatList
                    data={countryCodes}
                    renderItem={renderPickerItem}
                    keyExtractor={(item) => item.value}
                  />
                </View>
              </View>
            </Modal>
          </View>
        </LinearGradient>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  background: {
    flex: 1,
    justifyContent: "center",
    padding: 20,
  },
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 8,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 14,
    color: "#6B7280",
    marginBottom: 32,
    textAlign: "center",
  },
  formGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 12,
    color: "#6B7280",
    marginBottom: 8,
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F9FAFB",
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    paddingHorizontal: 14,
    height: 50,
  },
  input: {
    flex: 1,
    height: 48,
    fontSize: 16,
    paddingHorizontal: 10,
  },
  phoneInput: {
    marginLeft: 8,
  },
  inputIcon: {
    marginRight: 10,
  },
  countryCodeContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderRightWidth: 1,
    borderRightColor: "#E5E7EB",
    paddingRight: 10,
  },
  countryCodeText: {
    fontSize: 16,
    color: "#111827",
    marginRight: 5,
  },
  actionButton: {
    borderRadius: 10,
    overflow: "hidden",
    marginTop: 16,
    marginBottom: 16,
    shadowColor: "#3E92CC",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 3,
  },
  gradient: {
    paddingVertical: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  buttonPressed: {
    opacity: 0.9,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "700",
    letterSpacing: 0.5,
  },
  resendButton: {
    alignSelf: "center",
    marginBottom: 16,
  },
  resendText: {
    color: "#3E92CC",
    fontSize: 14,
    fontWeight: "600",
  },
  backButton: {
    alignSelf: "center",
    padding: 10,
  },
  backText: {
    color: "#3E92CC",
    fontSize: 14,
    fontWeight: "600",
  },
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  modalContent: {
    backgroundColor: "white",
    marginHorizontal: 20,
    borderRadius: 10,
    maxHeight: "50%",
  },
  pickerItem: {
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  pickerItemText: {
    fontSize: 16,
    color: "#111827",
  },
});

export default Verification;
