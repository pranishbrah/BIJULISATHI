import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter, useLocalSearchParams } from "expo-router";
import Ionicons from "@expo/vector-icons/Ionicons";
import axios from "axios";
import { Picker } from "@react-native-picker/picker";
import { BASE_URL } from "../_config";

const TotalRevenue = () => {
  const router = useRouter();
  const params = useLocalSearchParams();
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [range, setRange] = useState("all");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const stationId = params.stationId;

  const fetchTotalRevenue = useCallback(async () => {
    if (!stationId) {
      setError("Station ID is missing");
      setIsLoading(false);
      return;
    }
    try {
      setIsLoading(true);
      setError(null);
      const response = await axios.get(`${BASE_URL}/owner/total-revenue`, {
        params: { stationId, range },
      });
      setTotalRevenue(response.data.totalRevenue || 0);
    } catch (error) {
      console.error("Error fetching total revenue:", error);
      setError("Failed to load total revenue. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }, [stationId, range]);

  useEffect(() => {
    fetchTotalRevenue();
  }, [fetchTotalRevenue]);

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
          <Text style={styles.headerTitle}>Total Revenue</Text>
        </View>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity
            onPress={fetchTotalRevenue}
            style={styles.retryButton}
          >
            <Text style={styles.retryText}>Retry</Text>
          </TouchableOpacity>
        </View>
      </LinearGradient>
    );
  }

  if (isLoading) {
    return (
      <LinearGradient colors={["#1b44e4", "#6788f0"]} style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#ffffff" />
          <Text style={styles.loadingText}>Loading total revenue...</Text>
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
        <Text style={styles.headerTitle}>Total Revenue</Text>
      </View>
      <View style={styles.content}>
        <View style={styles.pickerContainer}>
          <Picker
            selectedValue={range}
            onValueChange={(value) => setRange(value)}
            style={styles.picker}
          >
            <Picker.Item label="All Time" value="all" />
            <Picker.Item label="Daily" value="daily" />
            <Picker.Item label="Weekly" value="weekly" />
            <Picker.Item label="Monthly" value="monthly" />
          </Picker>
        </View>
        <View style={styles.revenueCard}>
          <Ionicons name="wallet" size={48} color="#1b44e4" />
          <Text style={styles.revenueText}>₨{totalRevenue.toFixed(2)}</Text>
          <Text style={styles.rangeText}>
            {range.charAt(0).toUpperCase() + range.slice(1)} Revenue
          </Text>
        </View>
      </View>
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
  content: {
    flex: 1,
    alignItems: "center",
  },
  pickerContainer: {
    backgroundColor: "#e6efff",
    borderRadius: 12,
    marginBottom: 20,
    width: "80%",
    shadowColor: "#1b44e4",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  picker: {
    height: 50,
    color: "#1b44e4",
  },
  revenueCard: {
    backgroundColor: "#e6efff",
    borderRadius: 12,
    padding: 20,
    alignItems: "center",
    width: "80%",
    shadowColor: "#1b44e4",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  revenueText: {
    fontSize: 36,
    fontWeight: "bold",
    color: "#1b44e4",
    marginVertical: 10,
  },
  rangeText: {
    fontSize: 16,
    color: "#1b44e4",
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
});

export default TotalRevenue;
