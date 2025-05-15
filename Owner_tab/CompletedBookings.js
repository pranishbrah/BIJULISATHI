import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter, useLocalSearchParams } from "expo-router";
import Ionicons from "@expo/vector-icons/Ionicons";
import axios from "axios";
import { BASE_URL } from "../_config";

const CompletedBookings = () => {
  const router = useRouter();
  const params = useLocalSearchParams();
  const [bookings, setBookings] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const stationId = params.stationId;

  const fetchCompletedBookings = useCallback(async () => {
    if (!stationId) {
      setError("Station ID is missing");
      setIsLoading(false);
      return;
    }
    try {
      setIsLoading(true);
      setError(null);
      const response = await axios.get(`${BASE_URL}/owner/completed-bookings`, {
        params: { stationId },
      });
      setBookings(response.data.bookings || []);
    } catch (error) {
      console.error("Error fetching completed bookings:", error);
      setError("Failed to load completed bookings. Please try again.");
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [stationId]);

  useEffect(() => {
    fetchCompletedBookings();
  }, [fetchCompletedBookings]);

  const handleRefresh = () => {
    setIsRefreshing(true);
    fetchCompletedBookings();
  };

  const renderBookingItem = ({ item }) => (
    <View style={styles.bookingCard}>
      <View style={styles.bookingHeader}>
        <Text style={styles.bookingToken}>#{item.tokenCode}</Text>
        <Text style={styles.bookingStatus}>{item.status}</Text>
      </View>
      <View style={styles.bookingRow}>
        <Ionicons name="person" size={16} color="#1b44e4" />
        <Text style={styles.bookingText}>{item.userName || "Unknown"}</Text>
      </View>
      <View style={styles.bookingRow}>
        <Ionicons name="car" size={16} color="#1b44e4" />
        <Text style={styles.bookingText}>{item.carNumber || "N/A"}</Text>
      </View>
      <View style={styles.bookingRow}>
        <Ionicons name="call" size={16} color="#1b44e4" />
        <Text style={styles.bookingText}>{item.phoneNumber || "N/A"}</Text>
      </View>
      <View style={styles.bookingRow}>
        <Ionicons name="time" size={16} color="#1b44e4" />
        <Text style={styles.bookingText}>{item.chargingMinutes || 0} mins</Text>
      </View>
      <View style={styles.bookingRow}>
        <Ionicons name="cash" size={16} color="#1b44e4" />
        <Text style={styles.bookingText}>₨{(item.bill ?? 0).toFixed(2)}</Text>
      </View>
      <View style={styles.bookingRow}>
        <Ionicons name="card" size={16} color="#1b44e4" />
        <Text style={styles.bookingText}>{item.paymentMethod || "N/A"}</Text>
      </View>
    </View>
  );

  const goBack = () => {
    router.back();
  };

  if (error) {
    return (
      <LinearGradient colors={["#1b44e4", "#6788f0"]} style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={goBack} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="#ffffff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Completed Bookings</Text>
        </View>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity onPress={handleRefresh} style={styles.retryButton}>
            <Text style={styles.retryText}>Retry</Text>
          </TouchableOpacity>
        </View>
      </LinearGradient>
    );
  }

  if (isLoading && !isRefreshing) {
    return (
      <LinearGradient colors={["#1b44e4", "#6788f0"]} style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#ffffff" />
          <Text style={styles.loadingText}>Loading completed bookings...</Text>
        </View>
      </LinearGradient>
    );
  }

  return (
    <LinearGradient colors={["#1b44e4", "#6788f0"]} style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={goBack} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#ffffff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Completed Bookings</Text>
      </View>
      {bookings.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="calendar" size={48} color="#b3c7ff" />
          <Text style={styles.emptyText}>No completed bookings found</Text>
        </View>
      ) : (
        <FlatList
          data={bookings}
          renderItem={renderBookingItem}
          keyExtractor={(item) => item._id}
          contentContainerStyle={styles.bookingList}
          refreshControl={
            <RefreshControl
              refreshing={isRefreshing}
              onRefresh={handleRefresh}
              tintColor="#ffffff"
            />
          }
        />
      )}
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 50,
    paddingHorizontal: 20,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#ffffff",
    marginLeft: 10,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    color: "#ffffff",
    fontSize: 16,
    marginTop: 10,
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  errorText: {
    color: "#ffffff",
    fontSize: 16,
    marginBottom: 20,
    textAlign: "center",
  },
  retryButton: {
    backgroundColor: "#ffffff",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  retryText: {
    color: "#1b44e4",
    fontSize: 16,
    fontWeight: "bold",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  emptyText: {
    fontSize: 16,
    color: "#b3c7ff",
    marginTop: 10,
  },
  bookingList: {
    paddingBottom: 20,
  },
  bookingCard: {
    backgroundColor: "#e6efff",
    borderRadius: 12,
    padding: 15,
    marginBottom: 15,
    shadowColor: "#1b44e4",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  bookingHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(27, 68, 228, 0.1)",
    paddingBottom: 8,
  },
  bookingToken: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#1b44e4",
  },
  bookingStatus: {
    fontSize: 14,
    color: "#1b44e4",
    textTransform: "capitalize",
  },
  bookingRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 5,
  },
  bookingText: {
    fontSize: 15,
    color: "#1b44e4",
    marginLeft: 8,
  },
});

export default CompletedBookings;
