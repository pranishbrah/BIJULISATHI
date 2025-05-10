import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Modal,
  Image,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import Animated, { FadeIn } from "react-native-reanimated";
import { useSidebar } from "../SidebarContext";

const BASE_URL = "http://localhost:8000";

const StationRequestManagement = () => {
  const [stations, setStations] = useState([]);
  const [stationRequests, setStationRequests] = useState([]);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [dashboardStats, setDashboardStats] = useState({
    onlineStations: 0,
    totalStations: 0,
  });
  const [isUsersDropdownOpen, setIsUsersDropdownOpen] = useState(false);
  const router = useRouter();
  const { isSidebarOpen, toggleSidebar } = useSidebar();

  useEffect(() => {
    const fetchRequests = async () => {
      setIsLoading(true);
      try {
        const [requestsRes, stationsRes] = await Promise.all([
          fetch(`${BASE_URL}/admin/station-requests`),
          fetch(`${BASE_URL}/admin/stations`),
        ]);

        const [requestsData, stationsData] = await Promise.all([
          requestsRes.json(),
          stationsRes.json(),
        ]);

        if (!requestsData.success || !stationsData.success) {
          throw new Error("Failed to fetch requests or stations");
        }

        setStationRequests(requestsData.stationRequests);
        setStations(stationsData.stations);
      } catch (error) {
        console.error("Error fetching requests:", error);
        alert("Failed to load station requests. Please try again.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchRequests();
  }, []);

  const approveStationRequest = async (id) => {
    setIsLoading(true);
    try {
      const response = await fetch(
        `${BASE_URL}/admin/accept-station-request/${id}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
        }
      );
      const data = await response.json();
      if (!data.success) {
        throw new Error(data.detail || "Failed to approve request");
      }

      const newStation = data.station;
      setStations([
        ...stations,
        {
          id: data.station._id,
          name: data.station.stationName,
          status: data.station.status,
          usage: "0%",
          revenue: "0",
          lat: data.station.latitude,
          lng: data.station.longitude,
          pricePerMin: data.station.pricePerMinute,
          address: data.station.stationAddress,
        },
      ]);
      setStationRequests(stationRequests.filter((req) => req._id !== id));
      setSelectedRequest(null);

      const [onlineRes, totalStationsRes] = await Promise.all([
        fetch(`${BASE_URL}/admin/online-stations`),
        fetch(`${BASE_URL}/admin/total-stations`),
      ]);
      const [onlineData, totalStationsData] = await Promise.all([
        onlineRes.json(),
        totalStationsRes.json(),
      ]);

      setDashboardStats((prev) => ({
        ...prev,
        onlineStations: onlineData.onlineStations,
        totalStations: totalStationsData.totalStations,
      }));
    } catch (error) {
      console.error("Error approving station request:", error);
      alert("Failed to approve station request. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const rejectStationRequest = async (id) => {
    setIsLoading(true);
    try {
      const response = await fetch(
        `${BASE_URL}/admin/reject-station-request/${id}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
        }
      );
      const data = await response.json();
      if (!data.success) {
        throw new Error(data.detail || "Failed to reject request");
      }

      setStationRequests(stationRequests.filter((req) => req._id !== id));
      setSelectedRequest(null);
    } catch (error) {
      console.error("Error rejecting station request:", error);
      alert("Failed to reject station request. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const toggleUsersDropdown = () => {
    setIsUsersDropdownOpen(!isUsersDropdownOpen);
  };

  const handleSidebarToggle = () => {
    toggleSidebar();
    if (isUsersDropdownOpen) setIsUsersDropdownOpen(false);
  };

  const renderStationRequests = () => (
    <ScrollView
      style={styles.pageContainer}
      contentContainerStyle={{ paddingBottom: 20 }}
    >
      <Text style={styles.sectionTitle}>
        Station Requests ({stationRequests.length})
      </Text>

      {stationRequests.length === 0 ? (
        <Text style={styles.noDataText}>No station requests available.</Text>
      ) : (
        <View style={styles.requestsContainer}>
          {stationRequests.map((request) => (
            <TouchableOpacity
              key={request._id}
              style={[
                styles.requestCard,
                request.status === "approved" && styles.approvedCard,
                request.status === "rejected" && styles.rejectedCard,
              ]}
              onPress={() => setSelectedRequest(request)}
            >
              <View style={styles.requestHeader}>
                <Text style={styles.requestName}>{request.stationName}</Text>
                <Text
                  style={[
                    styles.requestStatus,
                    request.status === "pending" && styles.pendingStatus,
                    request.status === "approved" && styles.approvedStatus,
                    request.status === "rejected" && styles.rejectedStatus,
                  ]}
                >
                  {request.status.toUpperCase()}
                </Text>
              </View>

              <View style={styles.requestDetails}>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Owner:</Text>
                  <Text style={styles.detailValue}>{request.ownerName}</Text>
                </View>

                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Request Date:</Text>
                  <Text style={styles.detailValue}>
                    {
                      new Date(request.createdAt * 1000)
                        .toISOString()
                        .split("T")[0]
                    }
                  </Text>
                </View>

                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Location:</Text>
                  <Text style={styles.detailValue}>
                    {request.latitude}, {request.longitude}
                  </Text>
                </View>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      )}
    </ScrollView>
  );

  const renderRequestModal = () => (
    <Modal visible={!!selectedRequest} transparent animationType="fade">
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          {selectedRequest && (
            <ScrollView contentContainerStyle={styles.modalInner}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>
                  {selectedRequest.stationName}
                </Text>
                <Text
                  style={[
                    styles.modalStatus,
                    selectedRequest.status === "pending" &&
                      styles.pendingStatus,
                    selectedRequest.status === "approved" &&
                      styles.approvedStatus,
                    selectedRequest.status === "rejected" &&
                      styles.rejectedStatus,
                  ]}
                >
                  {selectedRequest.status.toUpperCase()}
                </Text>
              </View>

              <View style={styles.detailsSection}>
                <Text style={styles.modalSubtitle}>Station Details</Text>
                <View style={styles.detailsContainer}>
                  <DetailRow label="Owner" value={selectedRequest.ownerName} />
                  <DetailRow label="Email" value={selectedRequest.email} />
                  <DetailRow label="Phone" value={selectedRequest.phone} />
                  <DetailRow
                    label="Address"
                    value={selectedRequest.stationAddress}
                  />
                  <DetailRow
                    label="Location"
                    value={`${selectedRequest.latitude}, ${selectedRequest.longitude}`}
                  />
                  <DetailRow
                    label="Station Type"
                    value={selectedRequest.stationType}
                  />
                  <DetailRow
                    label="Price/Min"
                    value={`₨${selectedRequest.pricePerMinute}`}
                  />
                  <DetailRow
                    label="License Number"
                    value={selectedRequest.licenseNumber}
                  />
                  <DetailRow
                    label="Operating Hours"
                    value={selectedRequest.operatingHours}
                  />
                  <DetailRow
                    label="Request Date"
                    value={
                      new Date(selectedRequest.createdAt * 1000)
                        .toISOString()
                        .split("T")[0]
                    }
                  />
                </View>
              </View>

              <View style={styles.documentsSection}>
                <Text style={styles.modalSubtitle}>Documents</Text>
                <View style={styles.documentGrid}>
                  <DocumentPreview
                    label="Business License"
                    uri={selectedRequest.businessLicenseImagePath}
                  />
                  <DocumentPreview
                    label="Citizenship Front"
                    uri={selectedRequest.citizenshipFrontImagePath}
                  />
                  <DocumentPreview
                    label="Citizenship Back"
                    uri={selectedRequest.citizenshipBackImagePath}
                  />
                  <DocumentPreview
                    label="Station Image"
                    uri={selectedRequest.stationImagePath}
                  />
                </View>
              </View>

              {selectedRequest.status === "pending" && (
                <View style={styles.actionsSection}>
                  <TouchableOpacity
                    style={styles.acceptButton}
                    onPress={() => approveStationRequest(selectedRequest._id)}
                  >
                    <Text style={styles.buttonText}>Accept</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.rejectButton}
                    onPress={() => rejectStationRequest(selectedRequest._id)}
                  >
                    <Text style={styles.buttonText}>Reject</Text>
                  </TouchableOpacity>
                </View>
              )}

              <TouchableOpacity
                style={styles.closeButton}
                onPress={() => setSelectedRequest(null)}
              >
                <Text style={styles.closeButtonText}>Close</Text>
              </TouchableOpacity>
            </ScrollView>
          )}
        </View>
      </View>
    </Modal>
  );

  const DetailRow = ({ label, value }) => (
    <View style={styles.detailRow}>
      <Text style={styles.detailLabel}>{label}:</Text>
      <Text style={styles.detailValue}>{value || "N/A"}</Text>
    </View>
  );

  const DocumentPreview = ({ label, uri }) => (
    <View style={styles.documentPreview}>
      <Text style={styles.documentLabel}>{label}</Text>
      {uri ? (
        <Image
          source={{ uri }}
          style={styles.uploadedImage}
          resizeMode="contain"
          onError={(e) =>
            console.log(`${label} Image Error:`, e.nativeEvent.error)
          }
        />
      ) : (
        <View style={styles.noImageContainer}>
          <Text style={styles.noDataText}>No image available</Text>
        </View>
      )}
    </View>
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
            {[
              { label: "Dashboard", path: "/Admin_tab/dashboard" },
              { label: "Stations", path: "/Admin_tab/station" },
              { label: "Users", action: toggleUsersDropdown },
              { label: "Station Requests", path: "/Admin_tab/stationRequest" },
            ].map((item, index) => (
              <View key={index}>
                <TouchableOpacity
                  style={styles.menuItem}
                  onPress={
                    item.action ? item.action : () => router.push(item.path)
                  }
                >
                  <Text style={styles.menuText}>{item.label}</Text>
                </TouchableOpacity>
                {item.label === "Users" && isUsersDropdownOpen && (
                  <Animated.View
                    entering={FadeIn.duration(200)}
                    style={styles.dropdown}
                  >
                    {[
                      { label: "Users", page: "Users" },
                      { label: "Owners", page: "Owners" },
                    ].map((subItem, subIndex) => (
                      <TouchableOpacity
                        key={subIndex}
                        style={styles.dropdownItem}
                        onPress={() => {
                          router.push({
                            pathname: "/Admin_tab/user",
                            params: { page: subItem.page },
                          });
                          setIsUsersDropdownOpen(false);
                        }}
                      >
                        <Text style={styles.dropdownText}>{subItem.label}</Text>
                      </TouchableOpacity>
                    ))}
                  </Animated.View>
                )}
              </View>
            ))}
          </>
        )}
      </View>
      <View style={styles.main}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Station Requests</Text>
        </View>
        {renderStationRequests()}
        {renderRequestModal()}
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
    overflow: "visible",
    flexShrink: 1,
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
    marginLeft: 110, // Increased indent to align under "Users" as requested
    backgroundColor: "",
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 12,
    maxWidth: 130, // Adjusted to fit within sidebar (250 - 110 - padding)
    marginBottom: 10,
  },
  dropdownItem: {
    paddingVertical: 12,
    borderRadius: 6,
  },
  dropdownText: {
    color: "#F5F6F5",
    fontSize: 14,
    fontWeight: "400",
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
  pageContainer: {
    flex: 1,
  },
  sectionTitle: {
    color: "#2C3E50",
    fontSize: 22,
    fontWeight: "600",
    marginBottom: 20,
  },
  requestsContainer: {
    marginTop: 10,
  },
  requestCard: {
    backgroundColor: "#FFFFFF",
    padding: 15,
    borderRadius: 15,
    marginBottom: 15,
    shadowColor: "#2ECC71",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  approvedCard: {
    borderLeftWidth: 5,
    borderLeftColor: "#2ECC71",
  },
  rejectedCard: {
    borderLeftWidth: 5,
    borderLeftColor: "#E74C3C",
  },
  requestHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  requestName: {
    color: "#2C3E50",
    fontSize: 18,
    fontWeight: "bold",
    flex: 1,
  },
  requestStatus: {
    fontSize: 12,
    fontWeight: "bold",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
  },
  pendingStatus: {
    backgroundColor: "#3498DB",
    color: "#F5F6F5",
  },
  approvedStatus: {
    backgroundColor: "#2ECC71",
    color: "#F5F6F5",
  },
  rejectedStatus: {
    backgroundColor: "#E74C3C",
    color: "#F5F6F5",
  },
  requestDetails: {
    marginTop: 5,
  },
  detailRow: {
    flexDirection: "row",
    marginBottom: 15,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#F5F6F5",
  },
  detailLabel: {
    color: "#7F8C8D",
    fontSize: 16,
    width: 150,
    fontWeight: "600",
  },
  detailValue: {
    color: "#2C3E50",
    fontSize: 16,
    flex: 1,
  },
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.85)",
  },
  modalContent: {
    width: "90%",
    maxWidth: 900,
    backgroundColor: "#FFFFFF",
    borderRadius: 15,
    padding: 20,
    maxHeight: "85%",
    shadowColor: "#2ECC71",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  modalInner: {
    paddingBottom: 20,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#F5F6F5",
  },
  modalTitle: {
    color: "#2ECC71",
    fontSize: 24,
    fontWeight: "bold",
    flex: 1,
  },
  modalStatus: {
    fontSize: 14,
    fontWeight: "bold",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 10,
  },
  detailsSection: {
    marginBottom: 30,
  },
  detailsContainer: {
    backgroundColor: "#F5F6F5",
    padding: 20,
    borderRadius: 10,
    shadowColor: "#2ECC71",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 3,
  },
  modalSubtitle: {
    color: "#2C3E50",
    fontSize: 20,
    fontWeight: "600",
    marginBottom: 15,
  },
  documentGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  documentPreview: {
    width: "48%",
    marginBottom: 20,
    backgroundColor: "#F5F6F5",
    borderRadius: 10,
    padding: 15,
    alignItems: "center",
    shadowColor: "#2ECC71",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 3,
  },
  documentLabel: {
    color: "#2C3E50",
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 10,
    textAlign: "center",
  },
  uploadedImage: {
    width: "100%",
    height: 200,
    borderRadius: 8,
  },
  noImageContainer: {
    width: "100%",
    height: 200,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F5F6F5",
    borderRadius: 8,
  },
  actionsSection: {
    flexDirection: "row",
    justifyContent: "center",
    marginBottom: 20,
  },
  acceptButton: {
    backgroundColor: "#2ECC71",
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 20,
    marginHorizontal: 10,
  },
  rejectButton: {
    backgroundColor: "#E74C3C",
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 20,
    marginHorizontal: 10,
  },
  buttonText: {
    color: "#F5F6F5",
    fontSize: 16,
    fontWeight: "600",
    textAlign: "center",
  },
  closeButton: {
    backgroundColor: "#3498DB",
    paddingVertical: 12,
    paddingHorizontal: 40,
    borderRadius: 20,
    alignSelf: "center",
  },
  closeButtonText: {
    color: "#F5F6F5",
    fontSize: 16,
    fontWeight: "600",
  },
  noDataText: {
    color: "#7F8C8D",
    fontSize: 16,
    textAlign: "center",
    marginBottom: 10,
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

export default StationRequestManagement;
