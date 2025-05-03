import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TextInput,
  ActivityIndicator,
  TouchableOpacity,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter, useLocalSearchParams } from "expo-router";
import { useSidebar } from "../SidebarContext";

const BASE_URL = "http://localhost:8000";

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [owners, setOwners] = useState([]);
  const { page } = useLocalSearchParams();
  const [currentPage, setCurrentPage] = useState(page || "Users");
  const [userSearch, setUserSearch] = useState("");
  const [ownerSearch, setOwnerSearch] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isUsersDropdownOpen, setIsUsersDropdownOpen] = useState(false);
  const router = useRouter();
  const { isSidebarOpen, toggleSidebar } = useSidebar();

  useEffect(() => {
    const fetchUserData = async () => {
      setIsLoading(true);
      try {
        const [usersDataRes, ownersDataRes] = await Promise.all([
          fetch(`${BASE_URL}/admin/users`),
          fetch(`${BASE_URL}/admin/owners`),
        ]);

        const [usersDataResult, ownersDataResult] = await Promise.all([
          usersDataRes.json(),
          ownersDataRes.json(),
        ]);

        if (!usersDataResult.success || !ownersDataResult.success) {
          throw new Error("Failed to fetch user data");
        }

        setUsers(usersDataResult.users);
        setOwners(ownersDataResult.owners);
      } catch (error) {
        console.error("Error fetching user data:", error);
        alert("Failed to load user data. Please try again.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserData();
  }, []);

  const toggleUsersDropdown = () => {
    setIsUsersDropdownOpen(!isUsersDropdownOpen);
  };

  const handleSidebarToggle = () => {
    toggleSidebar();
    if (isUsersDropdownOpen) setIsUsersDropdownOpen(false);
  };

  const renderUsers = () => {
    const filteredUsers = users.filter((user) =>
      user.name.toLowerCase().includes(userSearch.toLowerCase())
    );

    return (
      <ScrollView
        style={styles.pageContainer}
        contentContainerStyle={{ paddingBottom: 20 }}
      >
        <Text style={styles.sectionTitle}>Users</Text>
        <TextInput
          style={styles.searchInput}
          placeholder="Search users by name..."
          placeholderTextColor="#7F8C8D"
          value={userSearch}
          onChangeText={setUserSearch}
        />
        {filteredUsers.length === 0 ? (
          <Text style={styles.noDataText}>
            {userSearch
              ? "No users found matching the search."
              : "No user data available yet."}
          </Text>
        ) : (
          filteredUsers.map((user) => (
            <View key={user._id} style={styles.userCard}>
              <Text style={styles.userName}>{user.name}</Text>
              <Text style={styles.userDetail}>Mobile: {user.mobile}</Text>
              <Text style={styles.userDetail}>
                Date of Birth: {user.dateOfBirth.day}/{user.dateOfBirth.month}/
                {user.dateOfBirth.year}
              </Text>
            </View>
          ))
        )}
      </ScrollView>
    );
  };

  const renderOwners = () => {
    const filteredOwners = owners.filter((owner) =>
      [owner.ownerName, owner.email, owner.stationName, owner.phone].some(
        (field) => field?.toLowerCase().includes(ownerSearch.toLowerCase())
      )
    );

    return (
      <ScrollView
        style={styles.pageContainer}
        contentContainerStyle={{ paddingBottom: 20 }}
      >
        <Text style={styles.sectionTitle}>Owners</Text>
        <TextInput
          style={styles.searchInput}
          placeholder="Search by name, email, station, or phone..."
          placeholderTextColor="#7F8C8D"
          value={ownerSearch}
          onChangeText={setOwnerSearch}
        />
        {filteredOwners.length === 0 ? (
          <Text style={styles.noDataText}>
            {ownerSearch
              ? "No owners found matching the search."
              : "No owner data available yet."}
          </Text>
        ) : (
          filteredOwners.map((owner) => (
            <View key={owner._id} style={styles.ownerCard}>
              <Text style={styles.ownerName}>{owner.ownerName}</Text>
              <Text style={styles.ownerDetail}>Email: {owner.email}</Text>
              <Text style={styles.ownerDetail}>Phone: {owner.phone}</Text>
              <Text style={styles.ownerDetail}>
                Station: {owner.stationName}
              </Text>
              <Text style={styles.ownerDetail}>Type: {owner.stationType}</Text>
              <Text style={styles.ownerDetail}>
                Address: {owner.stationAddress}
              </Text>
              <Text style={styles.ownerDetail}>
                Location: {owner.latitude}, {owner.longitude}
              </Text>
              <Text style={styles.ownerDetail}>
                Price/Min: ₨{owner.pricePerMinute}
              </Text>
              <Text style={styles.ownerDetail}>
                License: {owner.licenseNumber}
              </Text>
              <Text style={styles.ownerDetail}>
                Operating Hours: {owner.operatingHours}
              </Text>
            </View>
          ))
        )}
      </ScrollView>
    );
  };

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
                    setCurrentPage("Users");
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
                    setCurrentPage("Owners");
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
          <Text style={styles.headerTitle}>{currentPage}</Text>
        </View>
        {currentPage === "Users" ? renderUsers() : renderOwners()}
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
  pageContainer: {
    flex: 1,
  },
  sectionTitle: {
    color: "#2C3E50",
    fontSize: 22,
    fontWeight: "600",
    marginBottom: 20,
  },
  userCard: {
    backgroundColor: "#FFFFFF",
    padding: 20,
    borderRadius: 15,
    marginBottom: 15,
    shadowColor: "#2ECC71",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  userName: {
    color: "#2C3E50",
    fontSize: 18,
    fontWeight: "bold",
  },
  userDetail: {
    color: "#7F8C8D",
    fontSize: 14,
    marginTop: 5,
  },
  ownerCard: {
    backgroundColor: "#FFFFFF",
    padding: 20,
    borderRadius: 15,
    marginBottom: 15,
    shadowColor: "#2ECC71",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  ownerName: {
    color: "#2C3E50",
    fontSize: 18,
    fontWeight: "bold",
  },
  ownerDetail: {
    color: "#7F8C8D",
    fontSize: 14,
    marginTop: 5,
  },
  searchInput: {
    backgroundColor: "#F5F6F5",
    color: "#2C3E50",
    padding: 15,
    borderRadius: 10,
    marginBottom: 20,
    fontSize: 16,
    borderWidth: 1,
    borderColor: "#2ECC71",
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

export default UserManagement;
