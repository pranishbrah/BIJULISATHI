import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  TextInput,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useSidebar } from "../SidebarContext";

const BASE_URL = "http://localhost:8000";

const StationManagement = () => {
  const [stations, setStations] = useState([]);
  const [selectedStation, setSelectedStation] = useState(null);
  const [newStation, setNewStation] = useState({
    name: "",
    lat: "",
    lng: "",
    pricePerMin: "",
    address: "",
    ownerId: null,
  });
  const [showAddForm, setShowAddForm] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isUsersDropdownOpen, setIsUsersDropdownOpen] = useState(false);
  const router = useRouter();
  const { isSidebarOpen, toggleSidebar } = useSidebar();

  useEffect(() => {
    const fetchStations = async () => {
      setIsLoading(true);
      try {
        const stationsRes = await fetch(`${BASE_URL}/admin/stations`);
        const stationsData = await stationsRes.json();
        if (!stationsData.success) {
          throw new Error("Failed to fetch stations");
        }
        setStations(stationsData.stations);
      } catch (error) {
        console.error("Error fetching stations:", error);
        alert("Failed to load stations. Please try again.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchStations();
  }, []);

  const addStation = () => {
    const { name, lat, lng, pricePerMin, address } = newStation;
    if (
      name.trim() &&
      lat.trim() &&
      lng.trim() &&
      pricePerMin.trim() &&
      address.trim() &&
      !isNaN(parseFloat(lng))
    ) {
      const station = {
        id: stations.length + 1,
        name,
        status: "Online",
        usage: "0%",
        revenue: "0",
        lat,
        lng,
        pricePerMin,
        address,
        ownerId: newStation.ownerId,
      };
      setStations([...stations, station]);
      setNewStation({
        name: "",
        lat: "",
        lng: "",
        pricePerMin: "",
        address: "",
        ownerId: null,
      });
      setShowAddForm(false);
    } else {
      alert("Please fill all fields with valid data");
    }
  };

  const deleteStation = (id) => {
    setStations(stations.filter((station) => station.id !== id));
    setSelectedStation(null);
  };

  const toggleUsersDropdown = () => {
    setIsUsersDropdownOpen(!isUsersDropdownOpen);
  };

  const handleSidebarToggle = () => {
    toggleSidebar();
    if (isUsersDropdownOpen) setIsUsersDropdownOpen(false);
  };

  const renderStations = () => (
    <ScrollView
      style={styles.stationList}
      contentContainerStyle={{ paddingBottom: 20 }}
    >
      <Text style={styles.sectionTitle}>Charging Stations</Text>
      <TouchableOpacity
        style={styles.addButton}
        onPress={() => setShowAddForm(!showAddForm)}
      >
        <Text style={styles.addButtonText}>
          {showAddForm ? "Cancel" : "Add New Station"}
        </Text>
      </TouchableOpacity>

      {showAddForm && (
        <View style={styles.addStationForm}>
          <TextInput
            style={styles.input}
            placeholder="Station Name"
            value={newStation.name}
            onChangeText={(text) =>
              setNewStation({ ...newStation, name: text })
            }
          />
          <TextInput
            style={styles.input}
            placeholder="Latitude"
            value={newStation.lat}
            onChangeText={(text) => setNewStation({ ...newStation, lat: text })}
            keyboardType="numeric"
          />
          <TextInput
            style={styles.input}
            placeholder="Longitude"
            value={newStation.lng}
            onChangeText={(text) => setNewStation({ ...newStation, lng: text })}
            keyboardType="numeric"
          />
          <TextInput
            style={styles.input}
            placeholder="Price per Minute (e.g., ₨30)"
            value={newStation.pricePerMin}
            onChangeText={(text) =>
              setNewStation({ ...newStation, pricePerMin: text })
            }
          />
          <TextInput
            style={styles.input}
            placeholder="Address"
            value={newStation.address}
            onChangeText={(text) =>
              setNewStation({ ...newStation, address: text })
            }
          />
          <TouchableOpacity style={styles.submitButton} onPress={addStation}>
            <Text style={styles.submitButtonText}>Submit</Text>
          </TouchableOpacity>
        </View>
      )}

      {stations.map((station) => (
        <View key={station._id} style={styles.stationCard}>
          <TouchableOpacity onPress={() => setSelectedStation(station)}>
            <Text style={styles.stationName}>
              {station.stationName || "Unnamed Station"}
            </Text>
            <Text style={styles.stationDetail}>Status: {station.status}</Text>
            <Text style={styles.stationDetail}>Address: {station.address}</Text>
            <Text style={styles.stationDetail}>
              Price: {station.pricePerMinute}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.deleteButton}
            onPress={() => deleteStation(station._id)}
          >
            <Text style={styles.deleteButtonText}>Delete</Text>
          </TouchableOpacity>
        </View>
      ))}
    </ScrollView>
  );

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2ECC71" />
        <Text style={styles.loadingText}>Loading data...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={[styles.sidebar, { width: isSidebarOpen ? 250 : 60 }]}>
        <TouchableOpacity
          onPress={handleSidebarToggle}
          style={styles.hamburger}
        >
          <Ionicons
            name={isSidebarOpen ? "close" : "menu"}
            size={30}
            color="#FFFFFF"
          />
        </TouchableOpacity>
        {isSidebarOpen && (
          <>
            <Text style={styles.logo}>BijuliSathi Admin</Text>
            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => router.push("/Admin_tab/dashboard")}
            >
              <Text style={styles.menuText}>Dashboard</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => router.push("/Admin_tab/station")}
            >
              <Text style={styles.menuText}>Stations</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.menuItem}
              onPress={toggleUsersDropdown}
            >
              <Text style={styles.menuText}>Users</Text>
            </TouchableOpacity>
            {isUsersDropdownOpen && (
              <View style={styles.dropdown}>
                <TouchableOpacity
                  style={styles.dropdownItem}
                  onPress={() => {
                    router.push({
                      pathname: "/Admin_tab/user",
                      params: { page: "Users" },
                    });
                    setIsUsersDropdownOpen(false);
                  }}
                >
                  <Text style={styles.dropdownText}>Users</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.dropdownItem}
                  onPress={() => {
                    router.push({
                      pathname: "/Admin_tab/user",
                      params: { page: "Owners" },
                    });
                    setIsUsersDropdownOpen(false);
                  }}
                >
                  <Text style={styles.dropdownText}>Owners</Text>
                </TouchableOpacity>
              </View>
            )}
            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => router.push("/Admin_tab/stationRequest")}
            >
              <Text style={styles.menuText}>Station Requests</Text>
            </TouchableOpacity>
          </>
        )}
      </View>
      <View style={styles.main}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Stations</Text>
        </View>
        {renderStations()}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: "row",
    backgroundColor: "#F5F6F5",
  },
  sidebar: {
    backgroundColor: "#2C3E50",
    padding: 20,
    borderRightWidth: 1,
    borderRightColor: "#2ECC71",
  },
  hamburger: {
    marginBottom: 20,
  },
  logo: {
    color: "#2ECC71",
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 40,
  },
  menuItem: {
    paddingVertical: 15,
    backgroundColor: "",
    borderRadius: 10,
    marginBottom: 10,
  },
  menuText: {
    color: "#F5F6F5",
    fontSize: 16,
    fontWeight: "500",
    textAlign: "center",
  },
  dropdown: {
    paddingLeft: 20,
  },
  dropdownItem: {
    paddingVertical: 10,
  },
  dropdownText: {
    color: "#F5F6F5",
    fontSize: 14,
    fontWeight: "500",
  },
  main: {
    flex: 1,
    padding: 30,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 30,
  },
  headerTitle: {
    color: "#2C3E50",
    fontSize: 28,
    fontWeight: "bold",
  },
  stationList: {
    flex: 1,
  },
  stationCard: {
    backgroundColor: "#FFFFFF",
    padding: 20,
    borderRadius: 15,
    marginBottom: 15,
    shadowColor: "#2ECC71",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  stationName: {
    color: "#2C3E50",
    fontSize: 18,
    fontWeight: "bold",
  },
  stationDetail: {
    color: "#7F8C8D",
    fontSize: 14,
    marginTop: 5,
  },
  sectionTitle: {
    color: "#2C3E50",
    fontSize: 22,
    fontWeight: "600",
    marginBottom: 20,
  },
  addStationForm: {
    backgroundColor: "#FFFFFF",
    padding: 20,
    borderRadius: 15,
    marginBottom: 20,
    shadowColor: "#2ECC71",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  input: {
    backgroundColor: "#F5F6F5",
    color: "#2C3E50",
    padding: 15,
    borderRadius: 10,
    marginBottom: 15,
    fontSize: 16,
    borderWidth: 1,
    borderColor: "#2ECC71",
  },
  addButton: {
    backgroundColor: "#2ECC71",
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 20,
    marginBottom: 20,
  },
  addButtonText: {
    color: "#F5F6F5",
    fontSize: 16,
    fontWeight: "600",
    textAlign: "center",
  },
  submitButton: {
    backgroundColor: "#2ECC71",
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 20,
    alignSelf: "center",
  },
  submitButtonText: {
    color: "#F5F6F5",
    fontSize: 16,
    fontWeight: "600",
  },
  deleteButton: {
    backgroundColor: "#E74C3C",
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 10,
  },
  deleteButtonText: {
    color: "#F5F6F5",
    fontSize: 14,
    fontWeight: "600",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    color: "#2C3E50",
    marginTop: 10,
  },
});

export default StationManagement;
