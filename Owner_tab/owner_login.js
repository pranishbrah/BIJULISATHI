import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Image,
  StatusBar,
  Animated,
  Dimensions,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import axios from "axios";
import Ionicons from "@expo/vector-icons/Ionicons";
import { BASE_URL } from "../_config";

// Professional Splash Screen Component
const SplashScreen = ({ onFinish }) => {
  const [fadeAnim] = useState(new Animated.Value(0));
  const [scaleAnim] = useState(new Animated.Value(0.8));
  const [translateY] = useState(new Animated.Value(20));
  const [textOpacity] = useState(new Animated.Value(0));
  const [progressWidth] = useState(new Animated.Value(0));

  useEffect(() => {
    // Logo animation
    Animated.sequence([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.parallel([
        Animated.timing(scaleAnim, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        }),
        Animated.timing(translateY, {
          toValue: 0,
          duration: 500,
          useNativeDriver: true,
        }),
      ]),
    ]).start();

    // Text animation
    setTimeout(() => {
      Animated.timing(textOpacity, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }).start();
    }, 800);

    // Progress bar animation
    setTimeout(() => {
      Animated.timing(progressWidth, {
        toValue: 1,
        duration: 1500,
        useNativeDriver: false,
      }).start();
    }, 1000);

    // Complete splash and call onFinish
    const timer = setTimeout(() => {
      if (onFinish) onFinish();
    }, 3200);

    return () => clearTimeout(timer);
  }, []);

  const { width } = Dimensions.get("window");
  const progressWidthInterpolated = progressWidth.interpolate({
    inputRange: [0, 1],
    outputRange: ["0%", "100%"],
  });

  return (
    <View style={splashStyles.container}>
      <StatusBar hidden />
      <LinearGradient
        colors={["#0a1440", "#1b44e4", "#4a6cf5"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={splashStyles.gradient}
      >
        <View style={splashStyles.content}>
          <Animated.View
            style={[
              splashStyles.logoContainer,
              {
                opacity: fadeAnim,
                transform: [{ scale: scaleAnim }, { translateY: translateY }],
              },
            ]}
          >
            <Image
              source={require("../../assets/images/logo.png")}
              style={splashStyles.logo}
              resizeMode="contain"
            />
          </Animated.View>

          <Animated.Text
            style={[splashStyles.appName, { opacity: textOpacity }]}
          >
            EV Station Finder
          </Animated.Text>

          <Animated.Text
            style={[splashStyles.tagline, { opacity: textOpacity }]}
          >
            Find Your Nearest Station!!
          </Animated.Text>

          <View style={splashStyles.progressBarContainer}>
            <Animated.View
              style={[
                splashStyles.progressBar,
                { width: progressWidthInterpolated },
              ]}
            />
          </View>
        </View>
      </LinearGradient>
    </View>
  );
};

// Splash Screen Styles
const splashStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0a1440",
  },
  gradient: {
    flex: 1,
    width: "100%",
    height: "100%",
  },
  content: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 40,
  },
  logoContainer: {
    width: 150,
    height: 150,
    backgroundColor: "rgba(255, 255, 255, 0.95)",
    borderRadius: 30,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 15,
    elevation: 15,
  },
  logo: {
    width: 120,
    height: 120,
  },
  appName: {
    marginTop: 30,
    fontSize: 32,
    fontWeight: "700",
    color: "#ffffff",
    letterSpacing: 2,
  },
  tagline: {
    marginTop: 10,
    fontSize: 16,
    color: "#c4d0ff",
    letterSpacing: 0.5,
  },
  progressBarContainer: {
    height: 4,
    width: "80%",
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    borderRadius: 10,
    marginTop: 50,
    overflow: "hidden",
  },
  progressBar: {
    height: "100%",
    backgroundColor: "#ffffff",
    borderRadius: 10,
  },
});

// Main Owner Login Component
const OwnerLogin = () => {
  const router = useRouter();
  const [loginData, setLoginData] = useState({
    countryCode: "+977",
    phone: "",
    pin: "",
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [showPin, setShowPin] = useState(false);
  const [showSplash, setShowSplash] = useState(true);

  const countryCodes = [
    { label: "🇳🇵 Nepal (+977)", value: "+977" },
    { label: "🇮🇳 India (+91)", value: "+91" },
    { label: "🇺🇸 USA (+1)", value: "+1" },
    { label: "🇬🇧 UK (+44)", value: "+44" },
    { label: "🇦🇺 Australia (+61)", value: "+61" },
  ];

  const validateInputs = () => {
    const newErrors = {};
    if (!/^\d{10}$/.test(loginData.phone))
      newErrors.phone = "Enter a valid 10-digit number";
    if (!/^\d{4}$/.test(loginData.pin)) newErrors.pin = "Enter a 4-digit PIN";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (field, value) => {
    let formattedValue = value;
    if (field === "phone")
      formattedValue = value.replace(/\D/g, "").slice(0, 10);
    if (field === "pin") formattedValue = value.replace(/\D/g, "").slice(0, 4);
    setLoginData((prev) => ({ ...prev, [field]: formattedValue }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: null }));
  };

  const handleLogin = async () => {
    if (!validateInputs()) return;
    setIsLoading(true);

    const fullPhoneNumber = `${loginData.countryCode}${loginData.phone}`;

    try {
      // Step 1: Login
      const loginResponse = await axios.post(`${BASE_URL}/owner/login`, {
        phone: fullPhoneNumber,
        pin: loginData.pin,
      });

      if (loginResponse.data.success) {
        // Step 2: Fetch station details to get stationId
        const stationResponse = await axios.get(`${BASE_URL}/owner/station`, {
          params: { phone: fullPhoneNumber },
        });

        const stationId = stationResponse.data.station?._id;

        if (!stationId) {
          throw new Error("Station ID not found");
        }

        Alert.alert("Login Successful", "Welcome back, Station Owner!", [
          {
            text: "OK",
            onPress: () => {
              console.log(
                "Navigating to /Owner_tab/owner_tab with phone:",
                fullPhoneNumber,
                "and stationId:",
                stationId
              );
              setLoginData({ countryCode: "+977", phone: "", pin: "" });
              router.push({
                pathname: "/Owner_tab/owner_tab",
                params: { phone: fullPhoneNumber, stationId },
              });
            },
          },
        ]);
      }
    } catch (error) {
      Alert.alert(
        "Login Failed",
        error.response?.data?.detail || "Invalid phone number or PIN."
      );
    } finally {
      setIsLoading(false);
    }
  };

  const getEmojiAndCode = (codeValue) => {
    const country = countryCodes.find((c) => c.value === codeValue);
    return country ? country.label.split(" ")[0] + " " + codeValue : "🇳🇵 +977";
  };

  if (showSplash) {
    return <SplashScreen onFinish={() => setShowSplash(false)} />;
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <StatusBar barStyle="light-content" backgroundColor="#0a1440" />
      <LinearGradient
        colors={["#0a1440", "#1b44e4", "#4a6cf5"]}
        style={styles.gradient}
      >
        <ScrollView contentContainerStyle={styles.scrollContainer}>
          <Text style={styles.title}>Owner Login</Text>
          <Text style={styles.subtitle}>Sign in to manage your station</Text>

          <View style={styles.formContainer}>
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Mobile Number</Text>
              <View style={styles.phoneContainer}>
                <TouchableOpacity
                  style={styles.countryCodeButton}
                  onPress={() => setIsDropdownOpen(!isDropdownOpen)}
                  disabled={isLoading}
                >
                  <Text style={styles.countryCodeText}>
                    {getEmojiAndCode(loginData.countryCode)}
                  </Text>
                </TouchableOpacity>
                {isDropdownOpen && (
                  <View style={styles.dropdown}>
                    {countryCodes.map((code) => (
                      <TouchableOpacity
                        key={code.value}
                        style={styles.dropdownItem}
                        onPress={() => {
                          setLoginData((prev) => ({
                            ...prev,
                            countryCode: code.value,
                          }));
                          setIsDropdownOpen(false);
                        }}
                      >
                        <Text style={styles.dropdownItemText}>
                          {code.label}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                )}
                <TextInput
                  style={[
                    styles.input,
                    styles.phoneInput,
                    errors.phone && styles.errorInput,
                  ]}
                  value={loginData.phone}
                  onChangeText={(text) => handleInputChange("phone", text)}
                  keyboardType="number-pad"
                  placeholder="Enter phone number"
                  placeholderTextColor="#8f8f8f"
                  editable={!isLoading}
                />
              </View>
              {errors.phone && (
                <Text style={styles.errorText}>{errors.phone}</Text>
              )}
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>PIN</Text>
              <View style={styles.pinContainer}>
                <TextInput
                  style={[
                    styles.input,
                    styles.pinInput,
                    errors.pin && styles.errorInput,
                  ]}
                  value={loginData.pin}
                  onChangeText={(text) => handleInputChange("pin", text)}
                  keyboardType="number-pad"
                  placeholder="Enter 4-digit PIN"
                  placeholderTextColor="#8f8f8f"
                  maxLength={4}
                  secureTextEntry={!showPin}
                  editable={!isLoading}
                />
                <TouchableOpacity
                  style={styles.eyeButton}
                  onPress={() => setShowPin(!showPin)}
                  disabled={isLoading}
                >
                  <Ionicons
                    name={showPin ? "eye" : "eye-off"}
                    size={20}
                    color="#1b44e4"
                  />
                </TouchableOpacity>
              </View>
              {errors.pin && <Text style={styles.errorText}>{errors.pin}</Text>}
            </View>

            <TouchableOpacity
              style={[styles.button, isLoading && styles.buttonDisabled]}
              onPress={handleLogin}
              disabled={isLoading}
            >
              <LinearGradient
                colors={["#1b44e4", "#3b66f5"]}
                style={styles.buttonGradient}
              >
                <Text style={styles.buttonText}>
                  {isLoading ? "Logging in..." : "Login"}
                </Text>
              </LinearGradient>
            </TouchableOpacity>

            <View style={styles.registerLinkContainer}>
              <Text style={styles.registerText}>Don't have an account? </Text>
              <TouchableOpacity
                onPress={() => router.push("/Owner_tab/owner_registration")}
              >
                <Text style={styles.registerLink}>Register</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </LinearGradient>
    </KeyboardAvoidingView>
  );
};

// Main Component Styles
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0a1440",
  },
  gradient: {
    flex: 1,
  },
  scrollContainer: {
    flexGrow: 1,
    paddingHorizontal: 20,
    paddingVertical: 40,
    justifyContent: "center",
    alignItems: "center",
  },
  title: {
    fontSize: 32,
    fontWeight: "700",
    color: "#ffffff",
    marginBottom: 8,
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  subtitle: {
    fontSize: 16,
    color: "#c4d0ff",
    textAlign: "center",
    marginBottom: 30,
    fontWeight: "400",
  },
  formContainer: {
    width: "100%",
    maxWidth: 400,
    backgroundColor: "#ffffff",
    borderRadius: 20,
    padding: 25,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 15,
    elevation: 10,
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: "#8f8f8f",
    marginBottom: 8,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  input: {
    height: 50,
    backgroundColor: "#f9f9f9",
    borderRadius: 12,
    paddingHorizontal: 15,
    fontSize: 16,
    color: "#333",
    borderWidth: 1,
    borderColor: "#e0e0e0",
    shadowColor: "#1b44e4",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  phoneContainer: {
    flexDirection: "row",
    alignItems: "center",
    position: "relative",
  },
  pinContainer: {
    flexDirection: "row",
    alignItems: "center",
    position: "relative",
  },
  pinInput: {
    flex: 1,
  },
  eyeButton: {
    position: "absolute",
    right: 15,
    height: 50,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 10,
  },
  countryCodeButton: {
    width: 80,
    height: 50,
    backgroundColor: "#f9f9f9",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#e0e0e0",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 10,
    shadowColor: "#1b44e4",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  countryCodeText: {
    fontSize: 14,
    color: "#333",
    fontWeight: "500",
  },
  dropdown: {
    position: "absolute",
    top: 55,
    left: 0,
    width: 160,
    backgroundColor: "#ffffff",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#e0e0e0",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 4,
    zIndex: 1000,
  },
  dropdownItem: {
    paddingVertical: 12,
    paddingHorizontal: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
  },
  dropdownItemText: {
    fontSize: 14,
    color: "#333",
    fontWeight: "500",
  },
  phoneInput: {
    flex: 1,
  },
  errorInput: {
    borderColor: "#e44c4c",
    borderWidth: 2,
  },
  errorText: {
    color: "#e44c4c",
    fontSize: 12,
    marginTop: 6,
    fontStyle: "italic",
    textAlign: "left",
  },
  button: {
    borderRadius: 12,
    overflow: "hidden",
    marginTop: 25,
    shadowColor: "#1b44e4",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  buttonGradient: {
    paddingVertical: 15,
    alignItems: "center",
  },
  buttonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "600",
    letterSpacing: 1,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  registerLinkContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 15,
  },
  registerText: {
    fontSize: 14,
    color: "#8f8f8f",
  },
  registerLink: {
    fontSize: 14,
    color: "#1b44e4",
    fontWeight: "600",
    textDecorationLine: "underline",
  },
});

export default OwnerLogin;
