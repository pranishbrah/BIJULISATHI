import React, { useState } from "react";
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
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import * as ImagePicker from "expo-image-picker";
import { useRouter } from "expo-router";
import { BASE_URL } from "../_config"; // Exposing local network for mobile use

const OwnerRegistration = () => {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [owner, setOwner] = useState({
    name: "",
    email: "",
    countryCode: "+977",
    phone: "",
    pin: "",
    confirmPin: "",
    stationName: "",
    stationType: "",
    stationAddress: "",
    latitude: "",
    longitude: "",
    pricePerMinute: "",
    licenseNumber: "",
    operatingHours: "",
    businessLicenseImage: null,
    citizenshipFrontImage: null,
    citizenshipBackImage: null,
    stationImage: null,
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [isCountryDropdownOpen, setIsCountryDropdownOpen] = useState(false);
  const [isStationTypeDropdownOpen, setIsStationTypeDropdownOpen] =
    useState(false);

  const countryCodes = [
    { label: "🇳🇵 Nepal (+977)", value: "+977" },
    { label: "🇮🇳 India (+91)", value: "+91" },
    { label: "🇺🇸 USA (+1)", value: "+1" },
    { label: "🇬🇧 UK (+44)", value: "+44" },
    { label: "🇦🇺 Australia (+61)", value: "+61" },
  ];

  const stationTypes = [
    { label: "Fast Charger (50kW)", value: "Fast Charger (50kW)" },
    { label: "Ultra-Fast (150kW)", value: "Ultra-Fast (150kW)" },
    { label: "Standard (22kW)", value: "Standard (22kW)" },
  ];

  const validateStep1 = () => {
    const newErrors = {};
    if (!owner.name.trim()) newErrors.name = "Name is required";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(owner.email))
      newErrors.email = "Invalid email format";
    if (!/^\d{10}$/.test(owner.phone))
      newErrors.phone = "Enter a valid 10-digit number";
    if (!/^\d{4}$/.test(owner.pin)) newErrors.pin = "Enter a 4-digit PIN";
    if (owner.pin !== owner.confirmPin)
      newErrors.confirmPin = "PINs do not match";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateStep2 = () => {
    const newErrors = {};
    if (!owner.stationName.trim())
      newErrors.stationName = "Station name is required";
    if (!owner.stationType.trim())
      newErrors.stationType = "Station type is required";
    if (!owner.stationAddress.trim())
      newErrors.stationAddress = "Station address is required";
    if (!owner.latitude.trim()) newErrors.latitude = "Latitude is required";
    else if (isNaN(parseFloat(owner.latitude)))
      newErrors.latitude = "Latitude must be a number";
    if (!owner.longitude.trim()) newErrors.longitude = "Longitude is required";
    else if (isNaN(parseFloat(owner.longitude)))
      newErrors.longitude = "Longitude must be a number";
    if (!owner.pricePerMinute.trim())
      newErrors.pricePerMinute = "Price per minute is required";
    else if (isNaN(parseFloat(owner.pricePerMinute)))
      newErrors.pricePerMinute = "Price must be a number (e.g., 0.35)";
    if (!/^\d{9}$/.test(owner.licenseNumber))
      newErrors.licenseNumber = "Enter a valid 9-digit license number";
    if (!owner.operatingHours.trim())
      newErrors.operatingHours = "Operating hours are required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateStep3 = () => {
    const newErrors = {};
    if (!owner.businessLicenseImage)
      newErrors.businessLicenseImage = "Business license image is required";
    if (!owner.citizenshipFrontImage)
      newErrors.citizenshipFrontImage = "Citizenship front image is required";
    if (!owner.citizenshipBackImage)
      newErrors.citizenshipBackImage = "Citizenship back image is required";
    if (!owner.stationImage)
      newErrors.stationImage = "Station image is required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (field, value) => {
    let formattedValue = value;
    if (field === "phone")
      formattedValue = value.replace(/\D/g, "").slice(0, 10);
    if (field === "licenseNumber")
      formattedValue = value.replace(/\D/g, "").slice(0, 9);
    if (field === "latitude" || field === "longitude")
      formattedValue = value.replace(/[^0-9.-]/g, "");
    if (field === "pricePerMinute")
      formattedValue = value.replace(/[^0-9.]/g, "");
    if (field === "pin" || field === "confirmPin")
      formattedValue = value.replace(/\D/g, "").slice(0, 4);
    setOwner((prev) => ({ ...prev, [field]: formattedValue }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: null }));
  };

  const pickImage = async (field) => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert(
        "Permission Denied",
        "Sorry, we need camera roll permissions to upload images."
      );
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled) {
      setOwner((prev) => ({ ...prev, [field]: result.assets[0].uri }));
      if (errors[field]) setErrors((prev) => ({ ...prev, [field]: null }));
    }
  };

  const nextStep = () => {
    if (step === 1 && validateStep1()) {
      setStep(2);
    } else if (step === 2 && validateStep2()) {
      setStep(3);
    }
  };

  const prevStep = () => {
    if (step === 2) setStep(1);
    else if (step === 3) setStep(2);
  };

  const registerOwner = async () => {
    if (!validateStep3()) return;
    setIsLoading(true);

    try {
      const formData = new FormData();
      formData.append("name", owner.name);
      formData.append("email", owner.email);
      formData.append("phone", `${owner.countryCode}${owner.phone}`);
      formData.append("pin", owner.pin);
      formData.append("stationName", owner.stationName);
      formData.append("stationType", owner.stationType);
      formData.append("stationAddress", owner.stationAddress);
      formData.append("latitude", parseFloat(owner.latitude)); // Convert to float
      formData.append("longitude", parseFloat(owner.longitude)); // Convert to float
      formData.append("pricePerMinute", parseFloat(owner.pricePerMinute)); // Convert to float
      formData.append("licenseNumber", owner.licenseNumber);
      formData.append("operatingHours", owner.operatingHours);

      // Ensure all images are present
      if (
        !owner.businessLicenseImage ||
        !owner.citizenshipFrontImage ||
        !owner.citizenshipBackImage ||
        !owner.stationImage
      ) {
        throw new Error("All images must be uploaded");
      }

      formData.append("businessLicenseImage", {
        uri: owner.businessLicenseImage,
        type: "image/jpeg",
        name: "business_license.jpg",
      });
      formData.append("citizenshipFrontImage", {
        uri: owner.citizenshipFrontImage,
        type: "image/jpeg",
        name: "citizenship_front.jpg",
      });
      formData.append("citizenshipBackImage", {
        uri: owner.citizenshipBackImage,
        type: "image/jpeg",
        name: "citizenship_back.jpg",
      });
      formData.append("stationImage", {
        uri: owner.stationImage,
        type: "image/jpeg",
        name: "station_image.jpg",
      });

      console.log("Sending request to:", `${BASE_URL}/register-station`);
      const response = await fetch(`${BASE_URL}/register-station`, {
        method: "POST",
        body: formData,
      });

      const result = await response.json();
      console.log("Response Status:", response.status);
      console.log("Response Body:", result);

      if (response.ok) {
        Alert.alert(
          "Registration Successful",
          "Your station is under verification.",
          [
            {
              text: "OK",
              onPress: () => {
                setOwner({
                  name: "",
                  email: "",
                  countryCode: "+977",
                  phone: "",
                  pin: "",
                  confirmPin: "",
                  stationName: "",
                  stationType: "",
                  stationAddress: "",
                  latitude: "",
                  longitude: "",
                  pricePerMinute: "",
                  licenseNumber: "",
                  operatingHours: "",
                  businessLicenseImage: null,
                  citizenshipFrontImage: null,
                  citizenshipBackImage: null,
                  stationImage: null,
                });
                setStep(1);
                router.push("/Owner_tab/owner_login");
              },
            },
          ]
        );
      } else {
        // Handle specific error cases
        if (response.status === 422 && result.detail) {
          const errorMessages = result.detail
            .map((err) => `${err.loc.join(".")}: ${err.msg}`)
            .join(", ");
          throw new Error(`Validation failed: ${errorMessages}`);
        }
        throw new Error(
          `Server error ${response.status}: ${
            result.detail || JSON.stringify(result) || "Unknown error"
          }`
        );
      }
    } catch (error) {
      console.error("Detailed Registration Error:", {
        message: error.message,
        stack: error.stack,
        rawError: error,
      });
      Alert.alert(
        "Registration Error",
        error.message ||
          "Failed to register. Please check your input and try again."
      );
    } finally {
      setIsLoading(false);
    }
  };

  const step1Fields = [
    { name: "name", label: "Full Name", keyboardType: "default" },
    { name: "email", label: "Email Address", keyboardType: "email-address" },
  ];

  const step2Fields = [
    { name: "stationName", label: "Station Name", keyboardType: "default" },
    {
      name: "stationAddress",
      label: "Station Address",
      keyboardType: "default",
    },
    { name: "latitude", label: "Latitude", keyboardType: "numeric" },
    { name: "longitude", label: "Longitude", keyboardType: "numeric" },
    {
      name: "pricePerMinute",
      label: "Price Per Minute ($)",
      keyboardType: "numeric",
    },
    {
      name: "licenseNumber",
      label: "Business License Number",
      keyboardType: "number-pad",
    },
    {
      name: "operatingHours",
      label: "Operating Hours",
      keyboardType: "default",
    },
  ];

  const getEmojiAndCode = (codeValue) => {
    const country = countryCodes.find((c) => c.value === codeValue);
    return country ? country.label.split(" ")[0] + " " + codeValue : "🇳🇵 +977";
  };

  const getStationTypeLabel = (typeValue) => {
    const type = stationTypes.find((t) => t.value === typeValue);
    return type ? type.label : "Select Station Type";
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <LinearGradient colors={["#1b44e4", "#6788f0"]} style={styles.gradient}>
        <ScrollView contentContainerStyle={styles.scrollContainer}>
          <Text style={styles.title}>Welcome, Station Owner!</Text>
          <Text style={styles.subtitle}>Step {step} of 3</Text>

          <View style={styles.formContainer}>
            {step === 1 ? (
              <>
                {step1Fields.map((field) => (
                  <View key={field.name} style={styles.inputContainer}>
                    <Text style={styles.label}>{field.label}</Text>
                    <TextInput
                      style={[
                        styles.input,
                        errors[field.name] && styles.errorInput,
                      ]}
                      value={owner[field.name]}
                      onChangeText={(text) =>
                        handleInputChange(field.name, text)
                      }
                      keyboardType={field.keyboardType || "default"}
                      placeholder={field.label}
                      placeholderTextColor="#8f8f8f"
                      editable={!isLoading}
                    />
                    {errors[field.name] && (
                      <Text style={styles.errorText}>{errors[field.name]}</Text>
                    )}
                  </View>
                ))}
                <View style={styles.inputContainer}>
                  <Text style={styles.label}>Phone Number</Text>
                  <View style={styles.phoneContainer}>
                    <TouchableOpacity
                      style={styles.countryCodeButton}
                      onPress={() =>
                        setIsCountryDropdownOpen(!isCountryDropdownOpen)
                      }
                      disabled={isLoading}
                    >
                      <Text style={styles.countryCodeText}>
                        {getEmojiAndCode(owner.countryCode)}
                      </Text>
                    </TouchableOpacity>
                    {isCountryDropdownOpen && (
                      <View style={styles.countryDropdown}>
                        {countryCodes.map((code) => (
                          <TouchableOpacity
                            key={code.value}
                            style={styles.dropdownItem}
                            onPress={() => {
                              setOwner((prev) => ({
                                ...prev,
                                countryCode: code.value,
                              }));
                              setIsCountryDropdownOpen(false);
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
                        styles.phoneInput,
                        errors.phone && styles.errorInput,
                      ]}
                      value={owner.phone}
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
                  <TextInput
                    style={[styles.input, errors.pin && styles.errorInput]}
                    value={owner.pin}
                    onChangeText={(text) => handleInputChange("pin", text)}
                    keyboardType="number-pad"
                    placeholder="Enter 4-digit PIN"
                    placeholderTextColor="#8f8f8f"
                    maxLength={4}
                    editable={!isLoading}
                  />
                  {errors.pin && (
                    <Text style={styles.errorText}>{errors.pin}</Text>
                  )}
                </View>
                <View style={styles.inputContainer}>
                  <Text style={styles.label}>Confirm PIN</Text>
                  <TextInput
                    style={[
                      styles.input,
                      errors.confirmPin && styles.errorInput,
                    ]}
                    value={owner.confirmPin}
                    onChangeText={(text) =>
                      handleInputChange("confirmPin", text)
                    }
                    keyboardType="number-pad"
                    placeholder="Confirm 4-digit PIN"
                    placeholderTextColor="#8f8f8f"
                    maxLength={4}
                    editable={!isLoading}
                  />
                  {errors.confirmPin && (
                    <Text style={styles.errorText}>{errors.confirmPin}</Text>
                  )}
                </View>
                <TouchableOpacity style={styles.smallButton} onPress={nextStep}>
                  <LinearGradient
                    colors={["#1b44e4", "#3b66f5"]}
                    style={styles.smallButtonGradient}
                  >
                    <Text style={styles.buttonText}>Next</Text>
                  </LinearGradient>
                </TouchableOpacity>
                <View style={styles.loginLinkContainer}>
                  <Text style={styles.loginText}>
                    Already have an account?{" "}
                  </Text>
                  <TouchableOpacity
                    onPress={() => router.push("/Owner_tab/owner_login")}
                  >
                    <Text style={styles.loginLink}>Login</Text>
                  </TouchableOpacity>
                </View>
              </>
            ) : step === 2 ? (
              <>
                {step2Fields.map((field) => (
                  <View key={field.name} style={styles.inputContainer}>
                    <Text style={styles.label}>{field.label}</Text>
                    <TextInput
                      style={[
                        styles.input,
                        errors[field.name] && styles.errorInput,
                      ]}
                      value={owner[field.name]}
                      onChangeText={(text) =>
                        handleInputChange(field.name, text)
                      }
                      keyboardType={field.keyboardType || "default"}
                      placeholder={field.label}
                      placeholderTextColor="#8f8f8f"
                      editable={!isLoading}
                      maxLength={field.name === "licenseNumber" ? 9 : undefined}
                    />
                    {errors[field.name] && (
                      <Text style={styles.errorText}>{errors[field.name]}</Text>
                    )}
                  </View>
                ))}
                <View style={styles.inputContainer}>
                  <Text style={styles.label}>Station Type</Text>
                  <TouchableOpacity
                    style={[
                      styles.input,
                      errors.stationType && styles.errorInput,
                    ]}
                    onPress={() =>
                      setIsStationTypeDropdownOpen(!isStationTypeDropdownOpen)
                    }
                    disabled={isLoading}
                  >
                    <Text style={styles.dropdownText}>
                      {getStationTypeLabel(owner.stationType)}
                    </Text>
                  </TouchableOpacity>
                  {isStationTypeDropdownOpen && (
                    <View style={styles.stationTypeDropdown}>
                      {stationTypes.map((type) => (
                        <TouchableOpacity
                          key={type.value}
                          style={styles.dropdownItem}
                          onPress={() => {
                            setOwner((prev) => ({
                              ...prev,
                              stationType: type.value,
                            }));
                            setIsStationTypeDropdownOpen(false);
                          }}
                        >
                          <Text style={styles.dropdownItemText}>
                            {type.label}
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  )}
                  {errors.stationType && (
                    <Text style={styles.errorText}>{errors.stationType}</Text>
                  )}
                </View>
                <View style={styles.buttonContainer}>
                  <TouchableOpacity
                    style={styles.backButton}
                    onPress={prevStep}
                  >
                    <LinearGradient
                      colors={["#6788f0", "#b3c7ff"]}
                      style={styles.buttonGradient}
                    >
                      <Text style={styles.buttonText}>Back</Text>
                    </LinearGradient>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.smallButton}
                    onPress={nextStep}
                  >
                    <LinearGradient
                      colors={["#1b44e4", "#3b66f5"]}
                      style={styles.smallButtonGradient}
                    >
                      <Text style={styles.buttonText}>Next</Text>
                    </LinearGradient>
                  </TouchableOpacity>
                </View>
                <View style={styles.loginLinkContainer}>
                  <Text style={styles.loginText}>
                    Already have an account?{" "}
                  </Text>
                  <TouchableOpacity
                    onPress={() => router.push("/Owner_tab/owner_login")}
                  >
                    <Text style={styles.loginLink}>Login</Text>
                  </TouchableOpacity>
                </View>
              </>
            ) : (
              <>
                <View style={styles.inputContainer}>
                  <Text style={styles.label}>Business License Image</Text>
                  <TouchableOpacity
                    style={styles.uploadButton}
                    onPress={() => pickImage("businessLicenseImage")}
                    disabled={isLoading}
                  >
                    <Text style={styles.uploadButtonText}>
                      {owner.businessLicenseImage
                        ? "Change Image"
                        : "Upload Image"}
                    </Text>
                  </TouchableOpacity>
                  {owner.businessLicenseImage && (
                    <Image
                      source={{ uri: owner.businessLicenseImage }}
                      style={styles.uploadedImage}
                    />
                  )}
                  {errors.businessLicenseImage && (
                    <Text style={styles.errorText}>
                      {errors.businessLicenseImage}
                    </Text>
                  )}
                </View>
                <View style={styles.inputContainer}>
                  <Text style={styles.label}>Citizenship Front Image</Text>
                  <TouchableOpacity
                    style={styles.uploadButton}
                    onPress={() => pickImage("citizenshipFrontImage")}
                    disabled={isLoading}
                  >
                    <Text style={styles.uploadButtonText}>
                      {owner.citizenshipFrontImage
                        ? "Change Image"
                        : "Upload Image"}
                    </Text>
                  </TouchableOpacity>
                  {owner.citizenshipFrontImage && (
                    <Image
                      source={{ uri: owner.citizenshipFrontImage }}
                      style={styles.uploadedImage}
                    />
                  )}
                  {errors.citizenshipFrontImage && (
                    <Text style={styles.errorText}>
                      {errors.citizenshipFrontImage}
                    </Text>
                  )}
                </View>
                <View style={styles.inputContainer}>
                  <Text style={styles.label}>Citizenship Back Image</Text>
                  <TouchableOpacity
                    style={styles.uploadButton}
                    onPress={() => pickImage("citizenshipBackImage")}
                    disabled={isLoading}
                  >
                    <Text style={styles.uploadButtonText}>
                      {owner.citizenshipBackImage
                        ? "Change Image"
                        : "Upload Image"}
                    </Text>
                  </TouchableOpacity>
                  {owner.citizenshipBackImage && (
                    <Image
                      source={{ uri: owner.citizenshipBackImage }}
                      style={styles.uploadedImage}
                    />
                  )}
                  {errors.citizenshipBackImage && (
                    <Text style={styles.errorText}>
                      {errors.citizenshipBackImage}
                    </Text>
                  )}
                </View>
                <View style={styles.inputContainer}>
                  <Text style={styles.label}>Station Image</Text>
                  <TouchableOpacity
                    style={styles.uploadButton}
                    onPress={() => pickImage("stationImage")}
                    disabled={isLoading}
                  >
                    <Text style={styles.uploadButtonText}>
                      {owner.stationImage ? "Change Image" : "Upload Image"}
                    </Text>
                  </TouchableOpacity>
                  {owner.stationImage && (
                    <Image
                      source={{ uri: owner.stationImage }}
                      style={styles.uploadedImage}
                    />
                  )}
                  {errors.stationImage && (
                    <Text style={styles.errorText}>{errors.stationImage}</Text>
                  )}
                </View>
                <View style={styles.buttonContainer}>
                  <TouchableOpacity
                    style={styles.backButton}
                    onPress={prevStep}
                  >
                    <LinearGradient
                      colors={["#6788f0", "#b3c7ff"]}
                      style={styles.buttonGradient}
                    >
                      <Text style={styles.buttonText}>Back</Text>
                    </LinearGradient>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.button, isLoading && styles.buttonDisabled]}
                    onPress={registerOwner}
                    disabled={isLoading}
                  >
                    <LinearGradient
                      colors={["#1b44e4", "#3b66f5"]}
                      style={styles.buttonGradient}
                    >
                      <Text style={styles.buttonText}>
                        {isLoading ? "Registering..." : "Register"}
                      </Text>
                    </LinearGradient>
                  </TouchableOpacity>
                </View>
                <View style={styles.loginLinkContainer}>
                  <Text style={styles.loginText}>
                    Already have an account?{" "}
                  </Text>
                  <TouchableOpacity
                    onPress={() => router.push("/Owner_tab/owner_login")}
                  >
                    <Text style={styles.loginLink}>Login</Text>
                  </TouchableOpacity>
                </View>
              </>
            )}
          </View>
        </ScrollView>
      </LinearGradient>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#1b44e4",
  },
  gradient: {
    flex: 1,
  },
  scrollContainer: {
    padding: 20,
    paddingBottom: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
    color: "#ffffff",
    textAlign: "center",
    marginTop: 30,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: "#b3c7ff",
    textAlign: "center",
    marginBottom: 20,
  },
  formContainer: {
    backgroundColor: "#e6efff",
    borderRadius: 20,
    padding: 15,
    shadowColor: "#1b44e4",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 5,
  },
  inputContainer: {
    marginBottom: 15,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: "#8f8f8f",
    marginBottom: 6,
  },
  input: {
    height: 50,
    backgroundColor: "#fff",
    borderRadius: 15,
    paddingHorizontal: 15,
    fontSize: 16,
    color: "#8f8f8f",
    borderWidth: 1,
    borderColor: "#6788f0",
    shadowColor: "#1b44e4",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 2,
    justifyContent: "center",
  },
  errorInput: {
    borderColor: "#e44c4c",
    borderWidth: 2,
  },
  errorText: {
    color: "#e44c4c",
    fontSize: 12,
    marginTop: 5,
    fontStyle: "italic",
  },
  phoneContainer: {
    flexDirection: "row",
    alignItems: "center",
    position: "relative",
  },
  countryCodeButton: {
    width: 70,
    height: 50,
    backgroundColor: "#fff",
    borderRadius: 15,
    borderWidth: 1,
    borderColor: "#6788f0",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 10,
    shadowColor: "#1b44e4",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 2,
  },
  countryCodeText: {
    fontSize: 16,
    color: "#000000",
  },
  countryDropdown: {
    position: "absolute",
    top: 55,
    left: 0,
    width: 150,
    backgroundColor: "#e6efff",
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#6788f0",
    shadowColor: "#1b44e4",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 3,
    zIndex: 10,
  },
  stationTypeDropdown: {
    position: "absolute",
    top: 55,
    left: 0,
    width: 200,
    backgroundColor: "#e6efff",
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#6788f0",
    shadowColor: "#1b44e4",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 3,
    zIndex: 10,
  },
  dropdownItem: {
    paddingVertical: 10,
    paddingHorizontal: 15,
  },
  dropdownItemText: {
    fontSize: 16,
    color: "#1b44e4",
  },
  dropdownText: {
    fontSize: 16,
    color: "#8f8f8f",
  },
  phoneInput: {
    flex: 1,
    height: 50,
    backgroundColor: "#fff",
    borderRadius: 15,
    paddingHorizontal: 15,
    fontSize: 16,
    color: "#8f8f8f",
    borderWidth: 1,
    borderColor: "#6788f0",
    shadowColor: "#1b44e4",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 2,
  },
  uploadButton: {
    height: 50,
    backgroundColor: "#fff",
    borderRadius: 15,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#6788f0",
    shadowColor: "#1b44e4",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 2,
  },
  uploadButtonText: {
    color: "#1b44e4",
    fontSize: 16,
    fontWeight: "600",
  },
  uploadedImage: {
    width: "100%",
    height: 150,
    borderRadius: 15,
    marginTop: 10,
  },
  button: {
    borderRadius: 15,
    overflow: "hidden",
    flex: 1,
    marginTop: 15,
  },
  smallButton: {
    borderRadius: 15,
    overflow: "hidden",
    width: 100,
    marginTop: 15,
    alignSelf: "center",
  },
  backButton: {
    borderRadius: 15,
    overflow: "hidden",
    flex: 1,
    marginTop: 15,
    marginRight: 15,
  },
  buttonGradient: {
    paddingVertical: 15,
    alignItems: "center",
  },
  smallButtonGradient: {
    paddingVertical: 10,
    alignItems: "center",
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
    letterSpacing: 0.5,
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  loginLinkContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 10,
  },
  loginText: {
    fontSize: 14,
    color: "#000000",
  },
  loginLink: {
    fontSize: 14,
    color: "#1b44e4",
    fontWeight: "600",
    textDecorationLine: "underline",
  },
});

export default OwnerRegistration;
