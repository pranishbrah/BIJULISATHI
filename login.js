import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  Pressable,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
  Keyboard,
  Modal,
  FlatList,
  TouchableOpacity,
} from "react-native";
import { Link, useRouter } from "expo-router";
import { MaterialIcons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { LinearGradient } from "expo-linear-gradient";
import { BASE_URL } from "../config";

const LoginPage = () => {
  const [countryCode, setCountryCode] = useState("+977");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [pin, setPin] = useState("");
  const [isPinVisible, setIsPinVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showCountryPicker, setShowCountryPicker] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState("");
  const [newPin, setNewPin] = useState("");

  const router = useRouter();

  const countryCodes = [
    { label: "🇳🇵 +977", value: "+977" },
    { label: "🇺🇸 +1", value: "+1" },
    { label: "🇬🇧 +44", value: "+44" },
    { label: "🇮🇳 +91", value: "+91" },
    { label: "🇨🇳 +86", value: "+86" },
  ];

  const handleLogin = async () => {
    if (!phoneNumber || !pin) {
      Alert.alert("Missing Information", "Please fill all fields to continue");
      return;
    }

    if (phoneNumber.length !== 10) {
      Alert.alert("Invalid Phone", "Please enter a 10-digit phone number");
      return;
    }

    if (pin.length !== 4) {
      Alert.alert("Invalid PIN", "Your PIN must be exactly 4 digits");
      return;
    }

    const fullPhoneNumber = `${countryCode}${phoneNumber}`;

    try {
      setIsLoading(true);

      const response = await fetch(`${BASE_URL}/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          mobile: fullPhoneNumber,
          pin: pin,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        Alert.alert(
          "Login Failed",
          data.message || "Invalid phone number or PIN"
        );
        return;
      }

      if (data.success) {
        try {
          await AsyncStorage.setItem("mobile", fullPhoneNumber);
          await AsyncStorage.setItem("userData", JSON.stringify(data.user));
        } catch (error) {
          console.error("Error storing data in AsyncStorage:", error);
          Alert.alert("Error", "Failed to save login data. Please try again.");
          return;
        }

        router.replace("/User_tab/booking");
      } else {
        Alert.alert("Login Failed", data.message || "Invalid credentials");
      }
    } catch (error) {
      Alert.alert(
        "Login Error",
        "Unable to connect to server. Please check your internet connection and try again."
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPin = async () => {
    if (!phoneNumber) {
      Alert.alert("Missing Information", "Please enter your phone number.");
      return;
    }

    const fullPhoneNumber = `${countryCode}${phoneNumber}`;
    setIsLoading(true);

    try {
      const response = await fetch(`${BASE_URL}/forgot-pin`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ countryCode, mobile: phoneNumber }),
      });

      const result = await response.json();
      if (response.ok) {
        Alert.alert("Success", "OTP sent to your phone number.");
        setOtpSent(true);
      } else {
        Alert.alert("Error", result.detail || "Failed to send OTP.");
      }
    } catch (error) {
      console.error("Error requesting OTP:", error);
      Alert.alert("Error", "Failed to connect to the server.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    if (!otp || !newPin) {
      Alert.alert("Missing Information", "Please enter OTP and new PIN.");
      return;
    }

    if (newPin.length !== 4) {
      Alert.alert("Invalid PIN", "New PIN must be exactly 4 digits");
      return;
    }

    const fullPhoneNumber = `${countryCode}${phoneNumber}`;
    setIsLoading(true);

    try {
      const response = await fetch(`${BASE_URL}/verify-otp-pin-reset`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mobile: fullPhoneNumber,
          otp: otp,
          new_pin: newPin,
        }),
      });

      const result = await response.json();
      if (response.ok) {
        Alert.alert("Success", "PIN reset successfully.");
        setModalVisible(false);
        setOtpSent(false);
        setOtp("");
        setNewPin("");
        setPin(newPin);
      } else {
        Alert.alert("Error", result.detail || "Invalid OTP.");
      }
    } catch (error) {
      console.error("Error verifying OTP:", error);
      Alert.alert("Error", "Failed to connect to the server.");
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
            <Text style={styles.title}>Welcome Back</Text>
            <Text style={styles.subtitle}>
              Login to your EV charging account
            </Text>

            {/* Phone Number Input */}
            <View style={styles.formGroup}>
              <Text style={styles.label}>PHONE NUMBER</Text>
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
                  value={phoneNumber}
                  onChangeText={setPhoneNumber}
                />
              </View>
            </View>

            {/* PIN Input */}
            <View style={styles.formGroup}>
              <Text style={styles.label}>SECURE PIN</Text>
              <View style={styles.inputContainer}>
                <MaterialIcons
                  name="lock-outline"
                  size={20}
                  color="#6B7280"
                  style={styles.inputIcon}
                />
                <TextInput
                  style={styles.input}
                  placeholder="••••"
                  placeholderTextColor="#9CA3AF"
                  secureTextEntry={!isPinVisible}
                  keyboardType="numeric"
                  maxLength={4}
                  value={pin}
                  onChangeText={(text) => /^\d*$/.test(text) && setPin(text)}
                />
                <Pressable
                  onPress={() => setIsPinVisible(!isPinVisible)}
                  style={styles.eyeIcon}
                >
                  <MaterialIcons
                    name={isPinVisible ? "visibility-off" : "visibility"}
                    size={24}
                    color="#6B7280"
                  />
                </Pressable>
              </View>
            </View>

            {/* Forgot PIN Link */}
            <Pressable
              onPress={() => setModalVisible(true)}
              style={styles.forgotPinContainer}
            >
              <Text style={styles.forgotPinText}>Forgot PIN?</Text>
            </Pressable>

            {/* Login Button */}
            <Pressable
              style={({ pressed }) => [
                styles.loginButton,
                pressed && styles.buttonPressed,
                (isLoading || !phoneNumber || !pin) && styles.buttonDisabled,
              ]}
              onPress={handleLogin}
              disabled={isLoading || !phoneNumber || !pin}
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
                  <Text style={styles.buttonText}>LOGIN</Text>
                )}
              </LinearGradient>
            </Pressable>

            {/* Registration Link */}
            <View style={styles.footer}>
              <Text style={styles.footerText}>Don't have an account?</Text>
              <Link href="/User_AuthScreen/signin" asChild>
                <Pressable style={styles.registerButton}>
                  <Text style={styles.registerLink}>Register Now</Text>
                </Pressable>
              </Link>
            </View>

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

            {/* Forgot PIN Modal */}
            <Modal
              visible={modalVisible}
              transparent={true}
              animationType="slide"
              onRequestClose={() => setModalVisible(false)}
            >
              <View style={styles.modalContainer}>
                <View style={styles.modalContent}>
                  <Pressable
                    style={styles.closeIconContainer}
                    onPress={() => setModalVisible(false)}
                  >
                    <MaterialIcons name="close" size={24} color="#111827" />
                  </Pressable>
                  <Text style={styles.modalTitle}>
                    {otpSent ? "Verify OTP" : "Forgot PIN"}
                  </Text>

                  {!otpSent ? (
                    <>
                      <Text style={styles.modalLabel}>
                        Enter your phone number to receive an OTP
                      </Text>
                      <View style={styles.inputContainer}>
                        <Pressable
                          style={styles.countryCodeContainer}
                          onPress={() => setShowCountryPicker(true)}
                        >
                          <Text style={styles.countryCodeText}>
                            {countryCodes.find((c) => c.value === countryCode)
                              ?.label || "+977"}
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
                          value={phoneNumber}
                          onChangeText={setPhoneNumber}
                        />
                      </View>
                      <Pressable
                        style={({ pressed }) => [
                          styles.loginButton,
                          pressed && styles.buttonPressed,
                          isLoading && styles.buttonDisabled,
                        ]}
                        onPress={handleForgotPin}
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
                            <Text style={styles.buttonText}>Send OTP</Text>
                          )}
                        </LinearGradient>
                      </Pressable>
                    </>
                  ) : (
                    <>
                      <Text style={styles.modalLabel}>
                        Enter the OTP sent to your phone
                      </Text>
                      <View style={styles.inputContainer}>
                        <MaterialIcons
                          name="sms"
                          size={20}
                          color="#6B7280"
                          style={styles.inputIcon}
                        />
                        <TextInput
                          style={styles.input}
                          placeholder="Enter OTP"
                          placeholderTextColor="#9CA3AF"
                          keyboardType="numeric"
                          value={otp}
                          onChangeText={setOtp}
                        />
                      </View>
                      <Text style={styles.modalLabel}>Enter new PIN</Text>
                      <View style={styles.inputContainer}>
                        <MaterialIcons
                          name="lock-outline"
                          size={20}
                          color="#6B7280"
                          style={styles.inputIcon}
                        />
                        <TextInput
                          style={styles.input}
                          placeholder="••••"
                          placeholderTextColor="#9CA3AF"
                          secureTextEntry={true}
                          keyboardType="numeric"
                          maxLength={4}
                          value={newPin}
                          onChangeText={(text) =>
                            /^\d*$/.test(text) && setNewPin(text)
                          }
                        />
                      </View>
                      <Pressable
                        style={({ pressed }) => [
                          styles.loginButton,
                          pressed && styles.buttonPressed,
                          isLoading && styles.buttonDisabled,
                        ]}
                        onPress={handleVerifyOtp}
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
                              Verify & Reset PIN
                            </Text>
                          )}
                        </LinearGradient>
                      </Pressable>
                    </>
                  )}
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
  eyeIcon: {
    padding: 10,
  },
  loginButton: {
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
  footer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 16,
  },
  footerText: {
    color: "#6B7280",
    fontSize: 14,
    marginRight: 5,
  },
  registerButton: {
    paddingVertical: 5,
    paddingHorizontal: 5,
  },
  registerLink: {
    color: "#3E92CC",
    fontSize: 14,
    fontWeight: "700",
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
    padding: 24,
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
  forgotPinContainer: {
    alignItems: "flex-end",
    marginBottom: 16,
  },
  forgotPinText: {
    color: "#3E92CC",
    fontSize: 14,
    fontWeight: "600",
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 16,
    textAlign: "center",
  },
  modalLabel: {
    fontSize: 12,
    color: "#6B7280",
    marginBottom: 8,
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  closeIconContainer: {
    position: "absolute",
    top: 10,
    right: 10,
    padding: 5,
  },
});

export default LoginPage;
