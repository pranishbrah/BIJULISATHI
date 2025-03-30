import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  FlatList,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from "react-native";
import { useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { Ionicons } from "@expo/vector-icons";
import { BASE_URL } from "../config";

export default function MyBooking() {
  const router = useRouter();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [phoneNumber, setPhoneNumber] = useState("");

  // Fetch phone number from AsyncStorage and load bookings
  useEffect(() => {
    const fetchPhoneNumberAndBookings = async () => {
      try {
        const storedPhoneNumber = await AsyncStorage.getItem("mobile");
        console.log(
          "1. Stored phone number from AsyncStorage:",
          storedPhoneNumber
        );
        if (storedPhoneNumber) {
          setPhoneNumber(storedPhoneNumber);
          console.log("2. Phone number set to state:", storedPhoneNumber);
          await fetchBookings(storedPhoneNumber); // Ensure this completes
        } else {
          console.log("No phone number found in AsyncStorage");
          Alert.alert("Error", "User not logged in. Please log in again.");
          router.replace("/User_AuthScreen/login");
        }
      } catch (error) {
        console.error("Error retrieving phone number:", error);
        Alert.alert("Error", "Failed to load user data.");
        setLoading(false); // Ensure loading stops on error
      }
    };

    fetchPhoneNumberAndBookings();
  }, []);

  // Fetch bookings from backend
  const fetchBookings = async (phone) => {
    try {
      setLoading(true);
      console.log("3. Fetching bookings for phone:", phone);
      const url = `${BASE_URL}/bookings?phoneNumber=${encodeURIComponent(
        phone
      )}`;
      console.log("4. Request URL:", url); // Log the exact URL
      const response = await axios.get(url);
      console.log(
        "5. Full backend response:",
        JSON.stringify(response.data, null, 2)
      );
      const fetchedBookings = response.data.bookings || [];
      console.log(
        "6. Extracted bookings:",
        JSON.stringify(fetchedBookings, null, 2)
      );
      setBookings([...fetchedBookings]); // Force new array reference
      console.log(
        "7. Bookings state after set:",
        JSON.stringify(fetchedBookings, null, 2)
      );
    } catch (error) {
      console.error(
        "Error fetching bookings:",
        error.response?.data || error.message
      );
      console.log("Error response status:", error.response?.status);
      Alert.alert("Error", "Failed to load bookings. Please try again.");
      setBookings([]);
    } finally {
      setLoading(false);
      console.log(
        "8. Loading set to false, current bookings state:",
        JSON.stringify(bookings, null, 2)
      );
    }
  };

  // Handle booking cancellation
  const handleCancelBooking = async (bookingId) => {
    Alert.alert(
      "Confirm Cancellation",
      "Are you sure you want to cancel this booking?",
      [
        {
          text: "No",
          style: "cancel",
        },
        {
          text: "Yes",
          onPress: async () => {
            try {
              const response = await axios.post(`${BASE_URL}/cancel-booking`, {
                bookingId,
              });
              console.log(
                "Cancel response:",
                JSON.stringify(response.data, null, 2)
              );
              if (response.data.success) {
                setBookings(
                  bookings.filter((booking) => booking._id !== bookingId)
                );
                Alert.alert("Success", "Booking canceled successfully.");
              }
            } catch (error) {
              console.error(
                "Error canceling booking:",
                error.response?.data || error.message
              );
              Alert.alert(
                "Error",
                error.response?.data?.detail || "Failed to cancel booking."
              );
            }
          },
        },
      ]
    );
  };

  // Render each booking item
  const renderBookingItem = ({ item }) => (
    <View style={styles.bookingCard}>
      <View style={styles.bookingDetails}>
        <Text style={styles.stationName}>{item.stationName}</Text>
        <Text style={styles.detailText}>Car Number: {item.carNumber}</Text>
        <Text style={styles.detailText}>
          Duration: {item.chargingMinutes} minutes
        </Text>
        <Text style={styles.detailText}>Bill: {item.bill} Rs</Text>
        <Text style={styles.detailText}>Token: {item.tokenCode}</Text>
        <Text style={styles.detailText}>
          Date: {new Date(item.bookingDate * 1000).toLocaleString()}
        </Text>
      </View>
      <TouchableOpacity
        style={styles.cancelButton}
        onPress={() => handleCancelBooking(item._id)}
      >
        <Text style={styles.cancelButtonText}>Cancel</Text>
      </TouchableOpacity>
    </View>
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <ActivityIndicator size="large" color="#4CAF50" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#4CAF50" />
        </TouchableOpacity>
        <Text style={styles.title}>My Bookings</Text>
      </View>
      {bookings.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No bookings found.</Text>
        </View>
      ) : (
        <FlatList
          data={bookings}
          renderItem={renderBookingItem}
          keyExtractor={(item) => item._id}
          contentContainerStyle={styles.listContainer}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFF",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#E0E0E0",
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    marginLeft: 15,
    color: "#333",
  },
  listContainer: {
    padding: 20,
  },
  bookingCard: {
    backgroundColor: "#F5F5F5",
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
  },
  bookingDetails: {
    flex: 1,
  },
  stationName: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 5,
  },
  detailText: {
    fontSize: 14,
    color: "#666",
    marginBottom: 3,
  },
  cancelButton: {
    backgroundColor: "#F44336",
    borderRadius: 5,
    paddingVertical: 8,
    paddingHorizontal: 15,
  },
  cancelButtonText: {
    color: "#FFF",
    fontSize: 14,
    fontWeight: "bold",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  emptyText: {
    fontSize: 16,
    color: "#666",
  },
});
