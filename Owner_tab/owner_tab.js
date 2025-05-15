import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Alert,
  Modal,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
  Platform,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import axios from "axios";
import { BASE_URL } from "../_config";
import { useRouter, useLocalSearchParams } from "expo-router";
import Ionicons from "@expo/vector-icons/Ionicons";

const OwnerTab = () => {
  const router = useRouter();
  const params = useLocalSearchParams();
  const [stationData, setStationData] = useState(null);
  const [bookings, setBookings] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [stationStatus, setStationStatus] = useState("Online");
  const [stats, setStats] = useState({
    todayEarnings: 0,
    completedBookings: 0,
    pendingBookings: 0,
  });
  const [phoneNumber, setPhoneNumber] = useState(params.phone || "");
  const [stationId, setStationId] = useState(null);
  const [menuVisible, setMenuVisible] = useState(false);

  const fetchOwnerData = useCallback(async () => {
    if (!phoneNumber) {
      Alert.alert("Error", "No phone number provided. Please log in again.");
      router.replace("/Owner_tab/owner_login");
      return;
    }

    try {
      setIsLoading(true);
      console.log("Fetching data for phone:", phoneNumber);

      const stationResponse = await axios.get(`${BASE_URL}/owner/station`, {
        params: { phone: phoneNumber },
      });
      console.log("Station response:", stationResponse.data);

      const station = stationResponse.data.station;
      if (!station || !station._id) {
        throw new Error("No station found for this owner");
      }

      setStationData(station);
      setStationStatus(station.status || "Online");
      setStationId(station._id);

      const [bookingsResponse, statsResponse] = await Promise.all([
        axios.get(`${BASE_URL}/owner/bookings`, {
          params: { stationId: station._id },
        }),
        axios.get(`${BASE_URL}/owner/stats`, {
          params: { stationId: station._id },
        }),
      ]);

      console.log("Bookings response:", bookingsResponse.data);
      console.log("Stats response:", statsResponse.data);

      setBookings(bookingsResponse.data.bookings || []);
      setStats({
        todayEarnings: statsResponse.data.todayEarnings ?? 0,
        completedBookings: statsResponse.data.completedBookings ?? 0,
        pendingBookings: statsResponse.data.pendingBookings ?? 0,
      });
    } catch (error) {
      console.error("Error fetching owner data:", error);
      let errorMessage = "Failed to load station data. Please try again.";

      if (error.response?.status === 404) {
        errorMessage = "No station found for this account.";
        setBookings([]);
        setStats({
          todayEarnings: 0,
          completedBookings: 0,
          pendingBookings: 0,
        });
      } else if (error.response?.status === 401) {
        errorMessage = "Please log in again.";
        router.replace("/Owner_tab/owner_login");
      } else if (error.response?.status === 422) {
        errorMessage = "Invalid request data. Please check your input.";
      } else if (error.response?.status === 500) {
        errorMessage = "Server error. Please try again later.";
        setStats({
          todayEarnings: 0,
          completedBookings: 0,
          pendingBookings: 0,
        });
      }

      Alert.alert("Error", error.response?.data?.detail || errorMessage);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [phoneNumber, router]);

  useEffect(() => {
    fetchOwnerData();
  }, [fetchOwnerData]);

  const handleRefresh = () => {
    setIsRefreshing(true);
    fetchOwnerData();
  };

  const handleBookingAction = async (bookingId, action) => {
    try {
      let message = "";

      if (action === "cancel") {
        await axios.post(`${BASE_URL}/cancel-booking`, { bookingId });
        message = "Booking canceled successfully.";
      } else if (action === "complete") {
        const paymentMethod = await promptPaymentMethod();
        if (!paymentMethod) return;

        await axios.post(`${BASE_URL}/owner/complete-booking`, {
          bookingId,
          paymentMethod,
        });
        message = `Booking completed with ${paymentMethod} payment.`;
      }

      Alert.alert("Success", message);
      fetchOwnerData();
    } catch (error) {
      console.error(`Error ${action} booking:`, error);
      Alert.alert(
        "Error",
        error.response?.data?.detail ||
          `Failed to ${action} booking. Please try again.`
      );
    }
  };

  const promptPaymentMethod = () => {
    return new Promise((resolve) => {
      Alert.alert(
        "Payment Method",
        "How was this booking paid?",
        [
          { text: "Cash", onPress: () => resolve("cash"), style: "default" },
          {
            text: "Online",
            onPress: () => resolve("online"),
            style: "default",
          },
          { text: "Cancel", style: "cancel", onPress: () => resolve(null) },
        ],
        { cancelable: true }
      );
    });
  };

  const toggleMenu = () => {
    setMenuVisible(!menuVisible);
  };

  const navigateToScreen = (screen) => {
    setMenuVisible(false);
    if (!stationId) {
      Alert.alert("Error", "Station ID not available. Please try again.");
      return;
    }
    router.push({
      pathname: `/Owner_tab/${screen}`,
      params: { stationId, phone: phoneNumber },
    });
  };

  const confirmLogout = () => {
    Alert.alert(
      "Logout",
      "Are you sure you want to logout?",
      [
        { text: "No", style: "cancel" },
        {
          text: "Yes",
          onPress: () => {
            setMenuVisible(false);
            router.replace("/Owner_tab/owner_login");
          },
          style: "default",
        },
      ],
      { cancelable: true }
    );
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
      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={[styles.actionButton, styles.cancelButton]}
          onPress={() => handleBookingAction(item._id, "cancel")}
        >
          <Text style={styles.buttonText}>Cancel</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.actionButton, styles.completeButton]}
          onPress={() => handleBookingAction(item._id, "complete")}
        >
          <Text style={styles.buttonText}>Complete</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderStatsCard = (icon, title, value) => (
    <View style={styles.statCard}>
      <View style={styles.statIconContainer}>
        <Ionicons name={icon} size={24} color="#1b44e4" />
      </View>
      <Text style={styles.statValue}>
        {title === "Today's Earnings"
          ? `₨${(value ?? 0).toFixed(2)}`
          : value ?? 0}
      </Text>
      <Text style={styles.statTitle}>{title}</Text>
    </View>
  );

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#ffffff" />
        <Text style={styles.loadingText}>Loading your dashboard...</Text>
      </View>
    );
  }

  return (
    <LinearGradient colors={["#1b44e4", "#6788f0"]} style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={toggleMenu} style={styles.menuButton}>
          <Ionicons name="menu" size={28} color="#ffffff" />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>
            {stationData?.stationName || "Owner Dashboard"}
          </Text>
          <Text style={styles.headerSubtitle}>
            {stationData?.address || "EV Charging Station"}
          </Text>
        </View>
        <View style={styles.menuButtonPlaceholder} />
      </View>

      <Modal
        animationType="slide"
        transparent={true}
        visible={menuVisible}
        onRequestClose={toggleMenu}
      >
        <View style={styles.menuContainer}>
          <View style={styles.menuContent}>
            <TouchableOpacity
              onPress={toggleMenu}
              style={styles.closeMenuButton}
            >
              <Ionicons name="close" size={28} color="#1b44e4" />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => navigateToScreen("CompletedBookings")}
            >
              <Ionicons name="checkmark-circle" size={24} color="#1b44e4" />
              <Text style={styles.menuItemText}>Completed Bookings</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => navigateToScreen("IncompleteBookings")}
            >
              <Ionicons name="close-circle" size={24} color="#1b44e4" />
              <Text style={styles.menuItemText}>Incomplete Bookings</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => navigateToScreen("TotalRevenue")}
            >
              <Ionicons name="wallet" size={24} color="#1b44e4" />
              <Text style={styles.menuItemText}>Total Revenue</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.menuItem} onPress={confirmLogout}>
              <Ionicons name="log-out" size={24} color="#1b44e4" />
              <Text style={styles.menuItemText}>Logout</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <View style={styles.statsContainer}>
        {renderStatsCard("wallet", "Today's Earnings", stats.todayEarnings)}
        {renderStatsCard(
          "checkmark-circle",
          "Completed",
          stats.completedBookings
        )}
        {renderStatsCard("time", "Pending", stats.pendingBookings)}
      </View>

      <View style={styles.statusContainer}>
        <View style={styles.statusInfo}>
          <Ionicons
            name={stationStatus === "Online" ? "power" : "power-outline"}
            size={20}
            color="#ffffff"
          />
          <Text style={styles.statusText}>Station is {stationStatus}</Text>
        </View>
      </View>

      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Current Bookings</Text>
        <TouchableOpacity onPress={handleRefresh}>
          <Ionicons name="refresh" size={20} color="#ffffff" />
        </TouchableOpacity>
      </View>

      {bookings.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="calendar" size={48} color="#b3c7ff" />
          <Text style={styles.noBookingsText}>
            {stationData
              ? "No active bookings at the moment"
              : "No station data available"}
          </Text>
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
          style={Platform.OS === "web" ? styles.webFlatList : {}}
        />
      )}
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: Platform.OS === "web" ? 20 : 50,
    paddingBottom: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#1b44e4",
  },
  loadingText: {
    color: "#ffffff",
    marginTop: 15,
    fontSize: 16,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingBottom: 15,
  },
  menuButton: {
    padding: 8,
  },
  menuButtonPlaceholder: {
    width: 44, // Matches menuButton width (28 icon + 8 padding * 2)
  },
  headerCenter: {
    flex: 1,
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#ffffff",
  },
  headerSubtitle: {
    fontSize: 14,
    color: "#b3c7ff",
    marginTop: 4,
  },
  menuContainer: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-start",
  },
  menuContent: {
    backgroundColor: "#ffffff",
    width: "70%",
    height: "100%",
    paddingTop: 50,
    paddingHorizontal: 20,
  },
  closeMenuButton: {
    alignSelf: "flex-end",
    padding: 10,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#e6efff",
  },
  menuItemText: {
    fontSize: 16,
    color: "#1b44e4",
    marginLeft: 10,
  },
  statsContainer: {
    flexDirection: Platform.OS === "web" ? "row" : "row",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    marginBottom: 20,
    flexWrap: Platform.OS === "web" ? "wrap" : "nowrap",
  },
  statCard: {
    backgroundColor: "#e6efff",
    borderRadius: 12,
    padding: 15,
    width: Platform.OS === "web" ? "30%" : "30%",
    alignItems: "center",
    marginBottom: Platform.OS === "web" ? 10 : 0,
  },
  statIconContainer: {
    backgroundColor: "rgba(27, 68, 228, 0.1)",
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
  },
  statValue: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#1b44e4",
    marginBottom: 4,
  },
  statTitle: {
    fontSize: 12,
    color: "#1b44e4",
    textAlign: "center",
  },
  statusContainer: {
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    marginHorizontal: 20,
    borderRadius: 10,
    marginBottom: 20,
  },
  statusInfo: {
    flexDirection: "row",
    alignItems: "center",
  },
  statusText: {
    fontSize: 16,
    color: "#ffffff",
    marginLeft: 10,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#ffffff",
  },
  bookingList: {
    paddingHorizontal: 20,
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
    elevation: Platform.OS === "web" ? 0 : 3,
    borderWidth: Platform.OS === "web" ? 1 : 0,
    borderColor: Platform.OS === "web" ? "#6788f0" : "transparent",
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
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 15,
  },
  actionButton: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: "center",
    marginHorizontal: 5,
    ...Platform.select({
      web: {
        cursor: "pointer",
      },
    }),
  },
  cancelButton: {
    backgroundColor: "#e44c4c",
  },
  completeButton: {
    backgroundColor: "#4caf50",
  },
  buttonText: {
    color: "#ffffff",
    fontSize: 14,
    fontWeight: "600",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
  },
  noBookingsText: {
    fontSize: 16,
    color: "#b3c7ff",
    textAlign: "center",
    marginTop: 15,
  },
  webFlatList: {
    maxHeight: "60vh",
    overflowY: Platform.OS === "web" ? "auto" : undefined,
  },
});

export default OwnerTab;
