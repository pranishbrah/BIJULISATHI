import React, { useState, useEffect, useRef } from "react";
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  FlatList,
  SafeAreaView,
  Dimensions,
  Modal,
} from "react-native";
import MapView, { Marker } from "react-native-maps";
import * as Location from "expo-location";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { BASE_URL } from "../config";
import AsyncStorage from "@react-native-async-storage/async-storage";

const { width, height } = Dimensions.get("window");

export default function HomeScreen() {
  const router = useRouter();
  const mapRef = useRef(null);
  const [location, setLocation] = useState(null);
  const [locationName, setLocationName] = useState("Locating...");
  const [customLocationInput, setCustomLocationInput] = useState("");
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStation, setSelectedStation] = useState(null);
  const [nearestStations, setNearestStations] = useState([]);
  const [verifiedStations, setVerifiedStations] = useState([]);
  const [showNearestStationsModal, setShowNearestStationsModal] =
    useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showSearchDropdown, setShowSearchDropdown] = useState(false);
  const [isCurrentLocation, setIsCurrentLocation] = useState(true);
  const [watchId, setWatchId] = useState(null);
  const [locationTracking, setLocationTracking] = useState(true);

  // Function to handle new location updates
  const handleNewLocation = async (coords) => {
    try {
      setLocation(coords);
      setIsCurrentLocation(true);
      setLoading(true);

      // Reverse geocode to get address
      const address = await Location.reverseGeocodeAsync(coords);
      if (address[0]) {
        const street = address[0].street || address[0].name;
        const city = address[0].city || address[0].region;
        setLocationName(`${street ? street + ", " : ""}${city || ""}`);
      }

      updateMapRegion(coords);
    } catch (error) {
      console.error("Error handling new location:", error);
    } finally {
      setLoading(false);
    }
  };

  // Function to return to current location
  const handleReturnToCurrentLocation = async () => {
    setLocationTracking(true);
    setIsCurrentLocation(true);
    setCustomLocationInput("");

    try {
      // First try last known position for faster response
      const lastPosition = await Location.getLastKnownPositionAsync();
      if (lastPosition) {
        handleNewLocation(lastPosition.coords);
      }

      // Then get fresh position
      const currentLocation = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
        timeout: 5000,
      });

      handleNewLocation(currentLocation.coords);

      // Restart location watcher if not already running
      if (!watchId && locationTracking) {
        const newWatcher = await Location.watchPositionAsync(
          {
            accuracy: Location.Accuracy.Balanced,
            distanceInterval: 100,
            timeInterval: 5000,
          },
          (newLocation) => {
            if (locationTracking) {
              handleNewLocation(newLocation.coords);
            }
          }
        );
        setWatchId(newWatcher);
      }
    } catch (error) {
      console.error("Error returning to current location:", error);
      alert("Couldn't get current location. Please try again.");
    }
  };

  // Fetch verified stations from backend
  useEffect(() => {
    const fetchVerifiedStations = async () => {
      try {
        const response = await fetch(`${BASE_URL}/admin/verified-stations`);
        const data = await response.json();
        if (!data.success)
          throw new Error(data.detail || "Failed to fetch stations");

        const mappedStations = data.stations
          .map((station) => ({
            id: station._id,
            name: station.stationName,
            address: station.stationAddress,
            latitude: parseFloat(station.latitude),
            longitude: parseFloat(station.longitude),
            type: station.stationType,
            available: station.status === "Online",
            price: station.pricePerMinute,
            amenities: station.amenities || [],
          }))
          .filter(
            (station) =>
              !isNaN(station.latitude) &&
              !isNaN(station.longitude) &&
              station.latitude !== null &&
              station.longitude !== null
          );

        setVerifiedStations(mappedStations);
      } catch (error) {
        console.error("Error fetching stations:", error);
        alert("Failed to load stations. Please try again.");
      }
    };

    fetchVerifiedStations();
  }, []);

  // Location tracking effect
  useEffect(() => {
    let isMounted = true;
    let locationWatcher = null;

    const getLocation = async () => {
      try {
        let { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== "granted") {
          if (isMounted) {
            alert("Permission to access location was denied");
            setLoading(false);
          }
          return;
        }

        // First try last known position
        const lastPosition = await Location.getLastKnownPositionAsync();
        if (lastPosition && isMounted) {
          handleNewLocation(lastPosition.coords);
        }

        // Then get fresh position
        const initialLocation = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.Balanced,
          timeout: 5000,
        });

        if (isMounted) {
          handleNewLocation(initialLocation.coords);
        }

        if (locationTracking) {
          locationWatcher = await Location.watchPositionAsync(
            {
              accuracy: Location.Accuracy.Balanced,
              distanceInterval: 100,
              timeInterval: 5000,
            },
            (newLocation) => {
              if (isMounted && locationTracking) {
                handleNewLocation(newLocation.coords);
              }
            }
          );

          if (isMounted) {
            setWatchId(locationWatcher);
          }
        }
      } catch (error) {
        console.error("Location error:", error);
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    if (locationTracking) {
      getLocation();
    }

    return () => {
      isMounted = false;
      if (locationWatcher) {
        locationWatcher.remove();
      }
    };
  }, [locationTracking]);

  // Update map region
  const updateMapRegion = (coords) => {
    if (!coords) return;

    mapRef.current?.animateToRegion(
      {
        latitude: coords.latitude,
        longitude: coords.longitude,
        latitudeDelta: 0.0922,
        longitudeDelta: 0.0922 * (width / height),
      },
      1000
    );
  };

  // Handle custom location search
  const handleCustomLocation = async () => {
    if (!customLocationInput.trim()) {
      handleReturnToCurrentLocation();
      return;
    }

    setLocationTracking(false);
    if (watchId) {
      watchId.remove();
      setWatchId(null);
    }

    try {
      const results = await Location.geocodeAsync(customLocationInput);
      if (results.length > 0) {
        const newCoords = {
          latitude: results[0].latitude,
          longitude: results[0].longitude,
        };
        setLocation(newCoords);
        setLocationName(customLocationInput);
        updateMapRegion(newCoords);
        setIsCurrentLocation(false);
      } else {
        alert("Location not found. Please try a different address.");
      }
    } catch (error) {
      console.error("Geocoding error:", error);
      alert("Error finding location. Please check your input and try again.");
    }
  };

  // Calculate distance between coordinates
  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371; // Earth radius in km
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  // Find nearest stations
  const findNearestStations = () => {
    if (!location || verifiedStations.length === 0) {
      alert("No location or stations available yet.");
      return;
    }

    const stationsWithDistance = verifiedStations.map((station) => ({
      ...station,
      distance: calculateDistance(
        location.latitude,
        location.longitude,
        station.latitude,
        station.longitude
      ),
    }));

    const sorted = [...stationsWithDistance].sort(
      (a, b) => a.distance - b.distance
    );
    setNearestStations(sorted);
    setShowNearestStationsModal(true);

    if (sorted.length > 0) {
      mapRef.current?.fitToCoordinates(
        sorted.map((s) => ({
          latitude: s.latitude,
          longitude: s.longitude,
        })),
        {
          edgePadding: { top: 100, right: 100, bottom: 250, left: 100 },
          animated: true,
        }
      );
    }
  };

  const filteredStations = searchQuery
    ? verifiedStations.filter(
        (s) =>
          (s.name || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
          (s.address || "").toLowerCase().includes(searchQuery.toLowerCase())
      )
    : verifiedStations;

  // Render search dropdown item
  const renderSearchItem = ({ item }) => (
    <TouchableOpacity
      style={styles.searchDropdownItem}
      onPress={() => {
        setSelectedStation(item);
        setSearchQuery(item.name);
        setShowSearchDropdown(false);
        updateMapRegion({
          latitude: item.latitude,
          longitude: item.longitude,
        });
      }}
    >
      <Text style={styles.searchDropdownText}>{item.name}</Text>
      <Text style={styles.searchDropdownAddress}>{item.address}</Text>
    </TouchableOpacity>
  );

  // Render nearest station item
  const renderNearestStationItem = ({ item }) => (
    <TouchableOpacity
      style={styles.nearestItemVertical}
      onPress={() => {
        setSelectedStation(item);
        setShowNearestStationsModal(false);
      }}
    >
      <View style={styles.nearestItemHeader}>
        <MaterialIcons
          name="ev-station"
          size={24}
          color={item.available ? "#4CAF50" : "#F44336"}
        />
        <Text style={styles.nearestNameVertical}>{item.name}</Text>
      </View>
      <View style={styles.nearestItemDetails}>
        <Text style={styles.nearestDistanceVertical}>
          {item.distance.toFixed(1)} km
        </Text>
        <Text style={styles.nearestTypeVertical}>{item.type}</Text>
        <Text style={styles.nearestPriceVertical}>{item.price}</Text>
      </View>
    </TouchableOpacity>
  );

  // Render menu options
  const renderMenuOptions = () => (
    <Modal
      transparent={true}
      visible={isMenuOpen}
      onRequestClose={() => setIsMenuOpen(false)}
    >
      <TouchableOpacity
        style={styles.menuOverlay}
        activeOpacity={1}
        onPress={() => setIsMenuOpen(false)}
      >
        <View style={styles.menuContainer}>
          <View style={styles.menuItemsContainer}>
            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => {
                router.push("/User_tab/myBooking");
                setIsMenuOpen(false);
              }}
            >
              <Ionicons name="book" size={24} color="#4CAF50" />
              <Text style={styles.menuItemText}>My Bookings</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.logoutContainer}>
            <TouchableOpacity
              style={styles.logoutButton}
              onPress={async () => {
                try {
                  await AsyncStorage.removeItem("userToken");
                  await AsyncStorage.removeItem("userData");
                  router.replace("../User_AuthScreen/login");
                  setIsMenuOpen(false);
                } catch (error) {
                  console.error("Logout error:", error);
                  alert("Error during logout. Please try again.");
                }
              }}
            >
              <Ionicons name="log-out" size={24} color="#F44336" />
              <Text style={[styles.menuItemText, { color: "#F44336" }]}>
                Logout
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </TouchableOpacity>
    </Modal>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4CAF50" />
        <Text style={styles.loadingText}>
          Finding charging stations near you...
        </Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Loading Overlay */}
      {loading && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color="#4CAF50" />
          <Text style={styles.loadingText}>Getting your location...</Text>
        </View>
      )}

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.menuButton}
          onPress={() => setIsMenuOpen(true)}
        >
          <Ionicons name="menu" size={28} color="#333" />
        </TouchableOpacity>

        <View style={styles.locationContainer}>
          <Ionicons name="location-sharp" size={18} color="#4CAF50" />
          <TextInput
            style={styles.locationInput}
            value={isCurrentLocation ? locationName : customLocationInput}
            onChangeText={(text) => {
              setCustomLocationInput(text);
              setIsCurrentLocation(false);
            }}
            onSubmitEditing={handleCustomLocation}
            placeholder="Enter location..."
            placeholderTextColor="#999"
            clearButtonMode="while-editing"
          />
          {(customLocationInput || !isCurrentLocation) && (
            <TouchableOpacity onPress={handleCustomLocation}>
              <Ionicons name="search" size={18} color="#4CAF50" />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <Ionicons
          name="search"
          size={20}
          color="#999"
          style={styles.searchIcon}
        />
        <TextInput
          style={styles.searchInput}
          placeholder="Search for stations..."
          placeholderTextColor="#999"
          value={searchQuery}
          onChangeText={(text) => {
            setSearchQuery(text);
            setShowSearchDropdown(text.length > 0);
          }}
          onFocus={() => setShowSearchDropdown(searchQuery.length > 0)}
        />
        {searchQuery && (
          <TouchableOpacity
            onPress={() => {
              setSearchQuery("");
              setShowSearchDropdown(false);
            }}
          >
            <Ionicons name="close-circle" size={20} color="#999" />
          </TouchableOpacity>
        )}
      </View>

      {/* Search Dropdown */}
      {showSearchDropdown && filteredStations.length > 0 && (
        <View style={styles.searchDropdown}>
          <FlatList
            data={filteredStations}
            renderItem={renderSearchItem}
            keyExtractor={(item) => item.id}
            style={styles.searchDropdownList}
          />
        </View>
      )}

      {/* Map View */}
      <MapView
        ref={mapRef}
        style={styles.map}
        initialRegion={{
          latitude: location?.latitude || 27.7045,
          longitude: location?.longitude || 85.3147,
          latitudeDelta: 0.0922,
          longitudeDelta: 0.0922 * (width / height),
        }}
        showsUserLocation={true}
        showsMyLocationButton={false}
        onPress={() => {
          setSelectedStation(null);
          setShowSearchDropdown(false);
        }}
      >
        {filteredStations.map((station) => (
          <Marker
            key={station.id}
            coordinate={{
              latitude: station.latitude,
              longitude: station.longitude,
            }}
            onPress={() => setSelectedStation(station)}
          >
            <View style={styles.marker}>
              <MaterialIcons
                name="ev-station"
                size={28}
                color={station.available ? "#4CAF50" : "#F44336"}
              />
              <View
                style={[
                  styles.markerPulse,
                  {
                    backgroundColor: station.available
                      ? "rgba(76, 175, 80, 0.3)"
                      : "rgba(244, 67, 54, 0.3)",
                  },
                ]}
              />
            </View>
          </Marker>
        ))}
      </MapView>

      {/* My Location Button */}
      <TouchableOpacity
        style={styles.myLocationButton}
        onPress={handleReturnToCurrentLocation}
      >
        <Ionicons name="locate" size={24} color="#4CAF50" />
      </TouchableOpacity>

      {/* Selected Station Card */}
      {selectedStation && (
        <View style={styles.stationCard}>
          <View style={styles.stationHeader}>
            <MaterialIcons
              name="ev-station"
              size={24}
              color={selectedStation.available ? "#4CAF50" : "#F44336"}
            />
            <Text style={styles.stationName}>{selectedStation.name}</Text>
            <TouchableOpacity onPress={() => setSelectedStation(null)}>
              <Ionicons name="close" size={24} color="#666" />
            </TouchableOpacity>
          </View>

          <Text style={styles.stationAddress}>{selectedStation.address}</Text>
          <Text style={styles.stationType}>{selectedStation.type}</Text>

          <View style={styles.stationDetails}>
            <Text style={styles.stationPrice}>{selectedStation.price}</Text>
            <Text
              style={[
                styles.stationStatus,
                { color: selectedStation.available ? "#4CAF50" : "#F44336" },
              ]}
            >
              {selectedStation.available ? "Available" : "Occupied"}
            </Text>
          </View>

          <TouchableOpacity
            style={[
              styles.bookButton,
              {
                backgroundColor: selectedStation.available ? "#4CAF50" : "#CCC",
              },
            ]}
            disabled={!selectedStation.available}
            onPress={() =>
              router.push({
                pathname: "/User_tab/booknow",
                params: { stationId: selectedStation.id },
              })
            }
          >
            <Text style={styles.bookButtonText}>
              {selectedStation.available ? "Book Now" : "Not Available"}
            </Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Nearest Stations Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={showNearestStationsModal}
        onRequestClose={() => setShowNearestStationsModal(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.nearestTitleVertical}>Nearest Stations</Text>
            <TouchableOpacity
              style={styles.closeModalButton}
              onPress={() => setShowNearestStationsModal(false)}
            >
              <Ionicons name="close" size={24} color="#666" />
            </TouchableOpacity>
            <FlatList
              data={nearestStations}
              renderItem={renderNearestStationItem}
              keyExtractor={(item) => item.id}
              contentContainerStyle={styles.nearestListVertical}
            />
          </View>
        </View>
      </Modal>

      {/* Menu Options */}
      {renderMenuOptions()}

      {/* Find Nearest Button */}
      {!selectedStation && (
        <TouchableOpacity
          style={styles.findButton}
          onPress={findNearestStations}
        >
          <Ionicons name="navigate" size={24} color="#FFF" />
          <Text style={styles.findButtonText}>Find Nearest Stations</Text>
        </TouchableOpacity>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFF",
  },
  loadingOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.7)",
    zIndex: 100,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#FFF",
    padding: 20,
  },
  loadingText: {
    marginTop: 20,
    fontSize: 16,
    color: "#666",
    textAlign: "center",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    padding: 15,
    backgroundColor: "#FFF",
  },
  locationContainer: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F5F5F5",
    borderRadius: 20,
    paddingVertical: 8,
    paddingHorizontal: 15,
  },
  locationInput: {
    marginLeft: 8,
    fontSize: 14,
    color: "#333",
    flex: 1,
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F5F5F5",
    borderRadius: 25,
    paddingHorizontal: 15,
    marginHorizontal: 15,
    marginBottom: 10,
    height: 45,
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: "#333",
    height: "100%",
  },
  searchDropdown: {
    position: "absolute",
    top: 110,
    left: 15,
    right: 15,
    backgroundColor: "#FFF",
    borderRadius: 10,
    maxHeight: 200,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 5,
    zIndex: 1000,
  },
  searchDropdownList: {
    width: "100%",
  },
  searchDropdownItem: {
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
  },
  searchDropdownText: {
    fontSize: 16,
    color: "#333",
    fontWeight: "bold",
  },
  searchDropdownAddress: {
    fontSize: 12,
    color: "#666",
  },
  map: {
    width: "100%",
    height: "100%",
  },
  marker: {
    alignItems: "center",
    justifyContent: "center",
  },
  markerPulse: {
    position: "absolute",
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  myLocationButton: {
    position: "absolute",
    bottom: 80,
    right: 20,
    backgroundColor: "#FFF",
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 5,
    zIndex: 5,
  },
  stationCard: {
    position: "absolute",
    bottom: 20,
    left: 20,
    right: 20,
    backgroundColor: "#FFF",
    borderRadius: 15,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 5,
    zIndex: 10,
  },
  stationHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  stationName: {
    flex: 1,
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    marginLeft: 10,
  },
  stationAddress: {
    fontSize: 14,
    color: "#666",
    marginBottom: 5,
  },
  stationType: {
    fontSize: 14,
    color: "#2196F3",
    marginBottom: 10,
  },
  stationDetails: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 15,
  },
  stationPrice: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
  },
  stationStatus: {
    fontSize: 16,
    fontWeight: "bold",
  },
  bookButton: {
    borderRadius: 10,
    padding: 15,
    alignItems: "center",
  },
  bookButtonText: {
    color: "#FFF",
    fontSize: 16,
    fontWeight: "bold",
  },
  findButton: {
    position: "absolute",
    bottom: 20,
    right: 20,
    backgroundColor: "#4CAF50",
    borderRadius: 25,
    paddingVertical: 12,
    paddingHorizontal: 20,
    flexDirection: "row",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 5,
    zIndex: 5,
  },
  findButtonText: {
    color: "#FFF",
    fontSize: 16,
    marginLeft: 10,
  },
  menuOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-start",
    alignItems: "flex-start",
  },
  menuContainer: {
    backgroundColor: "white",
    width: "70%",
    height: "100%",
    paddingTop: 50,
    paddingHorizontal: 20,
    shadowColor: "#000",
    shadowOffset: { width: 2, height: 0 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 5,
    flexDirection: "column",
    justifyContent: "space-between",
  },
  menuItemsContainer: {
    flex: 1,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#E0E0E0",
  },
  menuItemText: {
    marginLeft: 15,
    fontSize: 16,
    color: "#333",
  },
  logoutContainer: {
    paddingBottom: 40,
  },
  logoutButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 15,
    borderTopWidth: 1,
    borderTopColor: "#E0E0E0",
  },
  menuButton: {
    marginRight: 15,
  },
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  modalContent: {
    width: "90%",
    backgroundColor: "white",
    borderRadius: 15,
    padding: 20,
    maxHeight: "70%",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  nearestTitleVertical: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 15,
    textAlign: "center",
  },
  nearestListVertical: {
    paddingBottom: 20,
  },
  nearestItemVertical: {
    backgroundColor: "#F5F5F5",
    borderRadius: 10,
    padding: 15,
    marginBottom: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  nearestItemHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  nearestNameVertical: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
    marginLeft: 10,
  },
  nearestItemDetails: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  nearestDistanceVertical: {
    fontSize: 14,
    color: "#4CAF50",
  },
  nearestTypeVertical: {
    fontSize: 14,
    color: "#2196F3",
  },
  nearestPriceVertical: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#333",
  },
  closeModalButton: {
    position: "absolute",
    top: 10,
    right: 10,
    zIndex: 1,
  },
});
