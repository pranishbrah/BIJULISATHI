import React, { useState } from "react";
import {
  View,
  Text,
  Pressable,
  Alert,
  StyleSheet,
  Modal,
  FlatList,
  TextInput,
  ActivityIndicator,
  TouchableWithoutFeedback,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { Link, useRouter } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";

const SignIn = () => {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [year, setYear] = useState(null);
  const [month, setMonth] = useState(null);
  const [day, setDay] = useState(null);
  const [pin, setPin] = useState("");
  const [confirmPin, setConfirmPin] = useState("");
  const [isPinVisible, setIsPinVisible] = useState(false);
  const [isYearModalVisible, setIsYearModalVisible] = useState(false);
  const [isMonthModalVisible, setIsMonthModalVisible] = useState(false);
  const [isDayModalVisible, setIsDayModalVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const router = useRouter();

  // Generate years (1900 to current year)
  const years = Array.from(
    { length: new Date().getFullYear() - 1899 },
    (_, i) => 1900 + i
  ).reverse();

  // Months
  const months = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  // Days (1-31, but adjust based on month and year)
  const getDaysInMonth = (month, year) => {
    return new Date(year, month, 0).getDate();
  };

  const days = Array.from(
    { length: getDaysInMonth(month, year) },
    (_, i) => i + 1
  );

  const handleSubmit = () => {
    if (
      !firstName ||
      !lastName ||
      !year ||
      !month ||
      !day ||
      !pin ||
      !confirmPin
    ) {
      Alert.alert("Missing Information", "Please fill all fields");
      return;
    }

    if (pin !== confirmPin) {
      Alert.alert("Error", "PINs do not match");
      return;
    }

    if (pin.length !== 4) {
      Alert.alert("Error", "PIN must be 4 digits");
      return;
    }

    setIsLoading(true);
    setTimeout(() => {
      router.push({
        pathname: "./verification",
        params: {
          firstName,
          lastName,
          year,
          month,
          day,
          pin,
        },
      });
      setIsLoading(false);
    }, 1000);
  };

  const renderYearItem = ({ item }) => (
    <Pressable
      style={[styles.gridButton, year === item && styles.selectedGridButton]}
      onPress={() => {
        setYear(item);
        setIsYearModalVisible(false);
      }}
    >
      <Text style={styles.gridButtonText}>{item}</Text>
    </Pressable>
  );

  const renderMonthItem = ({ item, index }) => (
    <Pressable
      style={[
        styles.gridButton,
        month === index + 1 && styles.selectedGridButton,
      ]}
      onPress={() => {
        setMonth(index + 1);
        setIsMonthModalVisible(false);
      }}
    >
      <Text style={styles.gridButtonText}>{item}</Text>
    </Pressable>
  );

  const renderDayItem = ({ item }) => (
    <Pressable
      style={[styles.gridButton, day === item && styles.selectedGridButton]}
      onPress={() => {
        setDay(item);
        setIsDayModalVisible(false);
      }}
    >
      <Text style={styles.gridButtonText}>{item}</Text>
    </Pressable>
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
            <Text style={styles.title}>Create Account</Text>

            {/* First Name */}
            <View style={styles.formGroup}>
              <Text style={styles.label}>FIRST NAME</Text>
              <View style={styles.inputContainer}>
                <MaterialIcons
                  name="person-outline"
                  size={20}
                  color="#6B7280"
                />
                <TextInput
                  style={styles.input}
                  value={firstName}
                  onChangeText={setFirstName}
                />
              </View>
            </View>

            {/* Last Name */}
            <View style={styles.formGroup}>
              <Text style={styles.label}>LAST NAME</Text>
              <View style={styles.inputContainer}>
                <MaterialIcons
                  name="person-outline"
                  size={20}
                  color="#6B7280"
                />
                <TextInput
                  style={styles.input}
                  value={lastName}
                  onChangeText={setLastName}
                />
              </View>
            </View>

            {/* Date of Birth */}
            <View style={styles.formGroup}>
              <Text style={styles.label}>DATE OF BIRTH</Text>
              <View style={styles.dateContainer}>
                {/* Year */}
                <Pressable
                  style={styles.dateInput}
                  onPress={() => setIsYearModalVisible(true)}
                >
                  <Text style={styles.dateText}>{year || "Year"}</Text>
                </Pressable>

                {/* Month */}
                <Pressable
                  style={styles.dateInput}
                  onPress={() => setIsMonthModalVisible(true)}
                >
                  <Text style={styles.dateText}>
                    {month ? months[month - 1] : "Month"}
                  </Text>
                </Pressable>

                {/* Day */}
                <Pressable
                  style={styles.dateInput}
                  onPress={() => setIsDayModalVisible(true)}
                >
                  <Text style={styles.dateText}>{day || "Day"}</Text>
                </Pressable>
              </View>
            </View>

            {/* PIN */}
            <View style={styles.formGroup}>
              <Text style={styles.label}>PIN</Text>
              <View style={styles.inputContainer}>
                <MaterialIcons name="lock-outline" size={20} color="#6B7280" />
                <TextInput
                  style={styles.input}
                  secureTextEntry={!isPinVisible}
                  keyboardType="numeric"
                  maxLength={4}
                  value={pin}
                  onChangeText={(text) => /^\d*$/.test(text) && setPin(text)}
                />
                <Pressable onPress={() => setIsPinVisible(!isPinVisible)}>
                  <MaterialIcons
                    name={isPinVisible ? "visibility-off" : "visibility"}
                    size={24}
                    color="#6B7280"
                  />
                </Pressable>
              </View>
            </View>

            {/* Confirm PIN */}
            <View style={styles.formGroup}>
              <Text style={styles.label}>CONFIRM PIN</Text>
              <View style={styles.inputContainer}>
                <MaterialIcons name="lock-outline" size={20} color="#6B7280" />
                <TextInput
                  style={styles.input}
                  secureTextEntry={!isPinVisible}
                  keyboardType="numeric"
                  maxLength={4}
                  value={confirmPin}
                  onChangeText={(text) =>
                    /^\d*$/.test(text) && setConfirmPin(text)
                  }
                />
              </View>
            </View>

            {/* Continue Button */}
            <Pressable
              style={({ pressed }) => [
                styles.button,
                pressed && styles.buttonPressed,
                (isLoading ||
                  !firstName ||
                  !lastName ||
                  !year ||
                  !month ||
                  !day ||
                  !pin ||
                  !confirmPin) &&
                  styles.buttonDisabled,
              ]}
              onPress={handleSubmit}
              disabled={
                isLoading ||
                !firstName ||
                !lastName ||
                !year ||
                !month ||
                !day ||
                !pin ||
                !confirmPin
              }
            >
              {isLoading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.buttonText}>CONTINUE</Text>
              )}
            </Pressable>

            {/* Login Link */}
            <View style={styles.footer}>
              <Text style={styles.footerText}>Already have an account? </Text>
              <Link href="/User_AuthScreen/login" asChild>
                <Pressable>
                  <Text style={styles.footerLink}>Login</Text>
                </Pressable>
              </Link>
            </View>

            {/* Year Picker Modal */}
            <Modal
              visible={isYearModalVisible}
              transparent={true}
              animationType="slide"
              onRequestClose={() => setIsYearModalVisible(false)}
            >
              <View style={styles.modalOverlay}>
                <View style={styles.modalContent}>
                  <Text style={styles.modalTitle}>Select Year</Text>
                  <FlatList
                    data={years}
                    renderItem={renderYearItem}
                    keyExtractor={(item) => item.toString()}
                    numColumns={3}
                    contentContainerStyle={styles.grid}
                  />
                  <Pressable
                    style={styles.closeButton}
                    onPress={() => setIsYearModalVisible(false)}
                  >
                    <Text style={styles.closeButtonText}>Close</Text>
                  </Pressable>
                </View>
              </View>
            </Modal>

            {/* Month Picker Modal */}
            <Modal
              visible={isMonthModalVisible}
              transparent={true}
              animationType="slide"
              onRequestClose={() => setIsMonthModalVisible(false)}
            >
              <View style={styles.modalOverlay}>
                <View style={styles.modalContent}>
                  <Text style={styles.modalTitle}>Select Month</Text>
                  <FlatList
                    data={months}
                    renderItem={renderMonthItem}
                    keyExtractor={(item, index) => index.toString()}
                    numColumns={3}
                    contentContainerStyle={styles.grid}
                  />
                  <Pressable
                    style={styles.closeButton}
                    onPress={() => setIsMonthModalVisible(false)}
                  >
                    <Text style={styles.closeButtonText}>Close</Text>
                  </Pressable>
                </View>
              </View>
            </Modal>

            {/* Day Picker Modal */}
            <Modal
              visible={isDayModalVisible}
              transparent={true}
              animationType="slide"
              onRequestClose={() => setIsDayModalVisible(false)}
            >
              <View style={styles.modalOverlay}>
                <View style={styles.modalContent}>
                  <Text style={styles.modalTitle}>Select Day</Text>
                  <FlatList
                    data={days}
                    renderItem={renderDayItem}
                    keyExtractor={(item) => item.toString()}
                    numColumns={7}
                    contentContainerStyle={styles.grid}
                  />
                  <Pressable
                    style={styles.closeButton}
                    onPress={() => setIsDayModalVisible(false)}
                  >
                    <Text style={styles.closeButtonText}>Close</Text>
                  </Pressable>
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
    marginBottom: 24,
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
  dateContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  dateInput: {
    width: "30%",
    height: 50,
    backgroundColor: "#F9FAFB",
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    justifyContent: "center",
    alignItems: "center",
  },
  dateText: {
    fontSize: 16,
    color: "#111827",
  },
  button: {
    backgroundColor: "#3E92CC",
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 16,
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
  },
  footer: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 20,
  },
  footerText: {
    color: "#6B7280",
    fontSize: 14,
  },
  footerLink: {
    color: "#3E92CC",
    fontSize: 14,
    fontWeight: "700",
  },
  modalOverlay: {
    flex: 1,
    justifyContent: "center",
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  modalContent: {
    backgroundColor: "#FFFFFF",
    borderRadius: 1,
    padding: 20,
    marginHorizontal: 20,
    maxHeight: "60%",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 16,
    textAlign: "center",
  },
  grid: {
    justifyContent: "center",
  },
  gridButton: {
    width: 80,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F9FAFB",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    margin: 5,
  },
  selectedGridButton: {
    backgroundColor: "#3E92CC",
    borderColor: "#3E92CC",
  },
  gridButtonText: {
    fontSize: 14,
    color: "#6B7280",
  },
  closeButton: {
    backgroundColor: "#3E92CC",
    borderRadius: 8,
    padding: 12,
    marginTop: 16,
    alignSelf: "center",
  },
  closeButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
});

export default SignIn;
