import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  Alert,
  Modal,
  FlatList,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import axios from "axios";
import { BASE_URL } from "../config";

const countryCodes = [
  { code: "+977", country: "Nepal", emoji: "🇳🇵" },
  { code: "+1", country: "USA", emoji: "🇺🇸" },
  { code: "+44", country: "UK", emoji: "🇬🇧" },
  { code: "+91", country: "India", emoji: "🇮🇳" },
];

const durationOptions = Array.from({ length: 51 }, (_, i) => ({
  value: 10 + i,
  label: `${10 + i} minutes`,
}));

export default function BookStation() {
  const router = useRouter();
  const { stationId } = useLocalSearchParams();
  const [name, setName] = useState("");
  const [carNumber, setCarNumber] = useState("");
  const [phone, setPhone] = useState("");
  const [selectedStation, setSelectedStation] = useState(null);
  const [selectedCountryCode, setSelectedCountryCode] = useState(
    countryCodes[0]
  );
  const [selectedDuration, setSelectedDuration] = useState(durationOptions[0]);
  const [showCountryPicker, setShowCountryPicker] = useState(false);
  const [showDurationPicker, setShowDurationPicker] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStationDetails = async () => {
      if (!stationId) {
        Alert.alert("Error", "No station ID provided");
        router.back();
        return;
      }

      try {
        const response = await axios.get(`${BASE_URL}/admin/stations`);
        const data = await response.data;
        if (!data.success)
          throw new Error(data.detail || "Failed to fetch stations");

        const station = data.stations.find((s) => s._id === stationId);
        if (station) {
          setSelectedStation({
            id: station._id,
            name: station.stationName, // Corrected to stationName
            address: station.stationAddress, // Corrected to stationAddress
            type: station.stationType,
            price: station.pricePerMinute, // Corrected to pricePerMinute
          });
        } else {
          throw new Error("Station not found");
        }
      } catch (error) {
        console.error("Error fetching station:", error);
        Alert.alert(
          "Error",
          "Failed to load station details. Please try again."
        );
        router.back();
      } finally {
        setLoading(false);
      }
    };

    fetchStationDetails();
  }, [stationId]);

  const handleConfirmBooking = async () => {
    if (!name.trim()) {
      Alert.alert("Validation Error", "Please enter your name");
      return;
    }
    if (!carNumber.trim()) {
      Alert.alert("Validation Error", "Please enter your car number");
      return;
    }
    if (!phone.trim()) {
      Alert.alert("Validation Error", "Please enter your phone number");
      return;
    }
    if (!/^\d+$/.test(phone)) {
      Alert.alert("Validation Error", "Phone number must contain only digits");
      return;
    }

    const booking = {
      stationId: selectedStation.id,
      stationName: selectedStation.name,
      userName: name,
      carNumber,
      phoneNumber: `${selectedCountryCode.code}${phone}`,
      chargingMinutes: selectedDuration.value,
    };

    try {
      const response = await axios.post(`${BASE_URL}/confirm-booking`, booking);
      const { tokenCode, bill } = response.data.booking;

      Alert.alert(
        "Booking Confirmed",
        `Your booking at ${selectedStation.name} for ${selectedDuration.value} minutes is confirmed!\nToken: ${tokenCode}\nBill: ${bill} Rs.`,
        [
          {
            text: "OK",
            onPress: () => router.push("/User_tab/myBooking"),
          },
        ]
      );
    } catch (error) {
      console.error("Booking error:", error.response?.data || error.message);
      Alert.alert(
        "Error",
        error.response?.data?.detail ||
          "Failed to confirm booking. Please try again."
      );
    }
  };

  const renderCountryItem = ({ item }) => (
    <TouchableOpacity
      style={styles.countryItem}
      onPress={() => {
        setSelectedCountryCode(item);
        setShowCountryPicker(false);
      }}
    >
      <Text
        style={styles.countryText}
      >{`${item.emoji} ${item.code} (${item.country})`}</Text>
    </TouchableOpacity>
  );

  const renderDurationItem = ({ item }) => (
    <TouchableOpacity
      style={styles.durationItem}
      onPress={() => {
        setSelectedDuration(item);
        setShowDurationPicker(false);
      }}
    >
      <Text style={styles.durationText}>{item.label}</Text>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <Text>Loading station details...</Text>
      </SafeAreaView>
    );
  }

  if (!selectedStation) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <Text>Station not found</Text>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.backLink}>Go Back</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color="#4CAF50" />
          </TouchableOpacity>
          <Text style={styles.title}>Book Charging Station</Text>
        </View>

        <View style={styles.stationInfo}>
          <Text style={styles.stationName}>{selectedStation.name}</Text>
          <Text style={styles.stationAddress}>{selectedStation.address}</Text>
          <View style={styles.stationDetails}>
            <Text style={styles.stationType}>{selectedStation.type}</Text>
            <Text style={styles.stationPrice}>{selectedStation.price}</Text>
          </View>
        </View>

        <View style={styles.formContainer}>
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Your Full Name</Text>
            <TextInput
              style={styles.input}
              placeholder="John Doe"
              value={name}
              onChangeText={setName}
              autoCapitalize="words"
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Vehicle Registration Number</Text>
            <TextInput
              style={styles.input}
              placeholder="ABC 1234"
              value={carNumber}
              onChangeText={setCarNumber}
              autoCapitalize="characters"
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Mobile Number</Text>
            <View style={styles.phoneContainer}>
              <TouchableOpacity
                style={styles.countryCodeButton}
                onPress={() => setShowCountryPicker(true)}
              >
                <Text
                  style={styles.countryCodeText}
                >{`${selectedCountryCode.emoji} ${selectedCountryCode.code}`}</Text>
                <Ionicons name="chevron-down" size={20} color="#666" />
              </TouchableOpacity>
              <TextInput
                style={styles.phoneInput}
                placeholder="98XXXXXXXX"
                value={phone}
                onChangeText={setPhone}
                keyboardType="phone-pad"
                maxLength={10}
              />
            </View>
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Charging Duration</Text>
            <TouchableOpacity
              style={styles.durationButton}
              onPress={() => setShowDurationPicker(true)}
            >
              <Text style={styles.durationText}>{selectedDuration.label}</Text>
              <Ionicons name="chevron-down" size={20} color="#666" />
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            style={styles.confirmButton}
            onPress={handleConfirmBooking}
          >
            <Text style={styles.confirmButtonText}>Confirm Booking</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

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
              renderItem={renderCountryItem}
              keyExtractor={(item) => item.code}
              style={styles.countryList}
            />
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setShowCountryPicker(false)}
            >
              <Text style={styles.closeButtonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <Modal
        visible={showDurationPicker}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowDurationPicker(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <FlatList
              data={durationOptions}
              renderItem={renderDurationItem}
              keyExtractor={(item) => item.value.toString()}
              style={styles.durationList}
            />
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setShowDurationPicker(false)}
            >
              <Text style={styles.closeButtonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFF",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  scrollContainer: {
    padding: 20,
    paddingBottom: 40,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    marginLeft: 15,
    color: "#333",
  },
  stationInfo: {
    backgroundColor: "#F5F5F5",
    borderRadius: 10,
    padding: 15,
    marginBottom: 25,
  },
  stationName: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 5,
  },
  stationAddress: {
    fontSize: 14,
    color: "#666",
    marginBottom: 10,
  },
  stationDetails: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  stationType: {
    fontSize: 14,
    color: "#2196F3",
  },
  stationPrice: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#4CAF50",
  },
  formContainer: {
    marginBottom: 30,
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    marginBottom: 8,
    color: "#555",
    fontWeight: "500",
  },
  input: {
    borderWidth: 1,
    borderColor: "#DDD",
    borderRadius: 8,
    padding: 15,
    fontSize: 16,
    backgroundColor: "#FFF",
  },
  phoneContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  countryCodeButton: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#DDD",
    borderRadius: 8,
    padding: 15,
    backgroundColor: "#FFF",
    marginRight: 10,
  },
  countryCodeText: {
    fontSize: 16,
    color: "#333",
    marginRight: 5,
  },
  phoneInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#DDD",
    borderRadius: 8,
    padding: 15,
    fontSize: 16,
    backgroundColor: "#FFF",
  },
  durationButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderWidth: 1,
    borderColor: "#DDD",
    borderRadius: 8,
    padding: 15,
    backgroundColor: "#FFF",
  },
  durationText: {
    fontSize: 16,
    color: "#333",
  },
  confirmButton: {
    backgroundColor: "#4CAF50",
    borderRadius: 8,
    padding: 18,
    alignItems: "center",
    marginTop: 20,
  },
  confirmButtonText: {
    color: "#FFF",
    fontSize: 16,
    fontWeight: "bold",
  },
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  modalContent: {
    backgroundColor: "#FFF",
    width: "90%",
    borderRadius: 10,
    padding: 20,
    maxHeight: "80%",
  },
  countryList: {
    maxHeight: "80%",
  },
  durationList: {
    maxHeight: "80%",
  },
  countryItem: {
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#EEE",
  },
  durationItem: {
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#EEE",
  },
  countryText: {
    fontSize: 16,
    color: "#333",
  },
  closeButton: {
    marginTop: 20,
    padding: 10,
    alignItems: "center",
    backgroundColor: "#4CAF50",
    borderRadius: 8,
  },
  closeButtonText: {
    color: "#FFF",
    fontSize: 16,
    fontWeight: "bold",
  },
  backLink: {
    color: "#4CAF50",
    fontSize: 16,
    marginTop: 10,
  },
});
