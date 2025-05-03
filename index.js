// import React, { useState, useEffect } from "react";
// import { View, Text, ScrollView, StyleSheet, ActivityIndicator, TouchableOpacity } from "react-native";
// import { Ionicons } from "@expo/vector-icons"; // For hamburger icon
// import { useRouter } from 'expo-router'; // Import useRouter from expo-router
// import { useSidebar } from '../SidebarContext'; // Adjusted import path

// const BASE_URL = "http://localhost:8000";

// const AdminDashboard = () => {
//   const [isLoading, setIsLoading] = useState(false);
//   const [dashboardStats, setDashboardStats] = useState({
//     onlineStations: 0,
//     totalEarnings: 0,
//     totalStations: 0,
//     registeredUsers: 0,
//   });
//   const [isUsersDropdownOpen, setIsUsersDropdownOpen] = useState(false); // State to toggle Users dropdown
//   const router = useRouter(); // Initialize useRouter for navigation
//   const { isSidebarOpen, toggleSidebar } = useSidebar(); // Use the shared sidebar state

//   useEffect(() => {
//     const fetchDashboardData = async () => {
//       setIsLoading(true);
//       try {
//         const [onlineRes, earningsRes, totalStationsRes, usersRes] = await Promise.all([
//           fetch(`${BASE_URL}/admin/online-stations`),
//           fetch(`${BASE_URL}/admin/total-earnings`),
//           fetch(`${BASE_URL}/admin/total-stations`),
//           fetch(`${BASE_URL}/admin/registered-users`),
//         ]);

//         const [onlineData, earningsData, totalStationsData, usersData] = await Promise.all([
//           onlineRes.json(),
//           earningsRes.json(),
//           totalStationsRes.json(),
//           usersRes.json(),
//         ]);

//         if (
//           !onlineData.success ||
//           !earningsData.success ||
//           !totalStationsData.success ||
//           !usersData.success
//         ) {
//           throw new Error("Failed to fetch dashboard data");
//         }

//         setDashboardStats({
//           onlineStations: onlineData.onlineStations,
//           totalEarnings: earningsData.totalEarnings,
//           totalStations: totalStationsData.totalStations,
//           registeredUsers: usersData.registeredUsers,
//         });
//       } catch (error) {
//         console.error("Error fetching dashboard data:", error);
//         alert("Failed to load dashboard data. Please try again.");
//       } finally {
//         setIsLoading(false);
//       }
//     };

//     fetchDashboardData();
//   }, []);

//   const toggleUsersDropdown = () => {
//     setIsUsersDropdownOpen(!isUsersDropdownOpen);
//   };

//   const handleSidebarToggle = () => {
//     toggleSidebar();
//     if (isUsersDropdownOpen) setIsUsersDropdownOpen(false); // Close dropdown when sidebar toggles
//   };

//   const renderDashboard = () => {
//     const totalRevenueFormatted = dashboardStats.totalEarnings.toLocaleString("en-NP", {
//       style: "currency",
//       currency: "NPR",
//     });

//     return (
//       <ScrollView style={styles.pageContainer} contentContainerStyle={{ paddingBottom: 20 }}>
//         <View style={styles.welcomeContainer}>
//           <Text style={styles.welcomeText}>Welcome, Admin!</Text>
//           <Text style={styles.subWelcomeText}>Nepal's EV Network is Growing</Text>
//         </View>

//         <View style={styles.summaryCard}>
//           <Text style={styles.summaryTitle}>Your Impact</Text>
//           <View style={styles.summaryStats}>
//             <View style={styles.summaryItem}>
//               <Text style={styles.summaryValue}>{dashboardStats.onlineStations}</Text>
//               <Text style={styles.summaryLabel}>Stations Online</Text>
//             </View>
//             <View style={styles.summaryItem}>
//               <Text style={styles.summaryValue}>{totalRevenueFormatted}</Text>
//               <Text style={styles.summaryLabel}>Total Earnings</Text>
//             </View>
//           </View>
//         </View>

//         <Text style={styles.sectionTitle}>Quick Stats</Text>
//         <View style={styles.statsContainer}>
//           <View style={styles.statCard}>
//             <Text style={styles.statValue}>{dashboardStats.totalStations}</Text>
//             <Text style={styles.statLabel}>Total Stations</Text>
//           </View>
//           <View style={styles.statCard}>
//             <Text style={styles.statValue}>{dashboardStats.registeredUsers}</Text>
//             <Text style={styles.statLabel}>Registered Users</Text>
//           </View>
//         </View>
//       </ScrollView>
//     );
//   };

//   if (isLoading) {
//     return (
//       <View style={styles.loadingContainer}>
//         <ActivityIndicator size="large" color="#00d4ff" />
//         <Text style={styles.loadingText}>Loading data...</Text>
//       </View>
//     );
//   }

//   return (
//     <View style={styles.container}>
//       <View style={[styles.sidebar, { width: isSidebarOpen ? 250 : 60 }]}>
//         <TouchableOpacity onPress={handleSidebarToggle} style={styles.hamburger}>
//           <Ionicons
//             name={isSidebarOpen ? "close" : "menu"}
//             size={30}
//             color="#ffffff"
//           />
//         </TouchableOpacity>
//         {isSidebarOpen && (
//           <>
//             <Text style={styles.logo}>BijuliSathi Admin</Text>
//             <TouchableOpacity
//               style={styles.menuItem}
//               onPress={() => router.push('/Admin_tab/index')} // Navigate to index.js (Dashboard)
//             >
//               <Text style={styles.menuText}>Dashboard</Text>
//             </TouchableOpacity>
//             <TouchableOpacity
//               style={styles.menuItem}
//               onPress={() => router.push('/Admin_tab/station')} // Navigate to station.js
//             >
//               <Text style={styles.menuText}>Stations</Text>
//             </TouchableOpacity>
//             <TouchableOpacity
//               style={styles.menuItem}
//               onPress={toggleUsersDropdown} // Toggle Users dropdown
//             >
//               <Text style={styles.menuText}>Users</Text>
//             </TouchableOpacity>
//             {isUsersDropdownOpen && (
//               <View style={styles.dropdown}>
//                 <TouchableOpacity
//                   style={styles.dropdownItem}
//                   onPress={() => {
//                     router.push({ pathname: '/Admin_tab/user', params: { page: 'Users' } }); // Navigate to user.js with "Users" page
//                     setIsUsersDropdownOpen(false);
//                   }}
//                 >
//                   <Text style={styles.dropdownText}>Users</Text>
//                 </TouchableOpacity>
//                 <TouchableOpacity
//                   style={styles.dropdownItem}
//                   onPress={() => {
//                     router.push({ pathname: '/Admin_tab/user', params: { page: 'Owners' } }); // Navigate to user.js with "Owners" page
//                     setIsUsersDropdownOpen(false);
//                   }}
//                 >
//                   <Text style={styles.dropdownText}>Owners</Text>
//                 </TouchableOpacity>
//               </View>
//             )}
//             <TouchableOpacity
//               style={styles.menuItem}
//               onPress={() => router.push('/Admin_tab/stationRequest')} // Navigate to stationRequest.js
//             >
//               <Text style={styles.menuText}>Station Requests</Text>
//             </TouchableOpacity>
//           </>
//         )}
//       </View>
//       <View style={styles.main}>
//         <View style={styles.header}>
//           <Text style={styles.headerTitle}>Dashboard</Text>
//         </View>
//         {renderDashboard()}
//       </View>
//     </View>
//   );
// };

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     flexDirection: "row",
//     backgroundColor: "#1a1a1a",
//   },
//   sidebar: {
//     backgroundColor: "#2a2a2a",
//     padding: 20,
//     borderRightWidth: 1,
//     borderRightColor: "#3a3a3a",
//     transition: "width 0.3s",
//   },
//   hamburger: {
//     marginBottom: 20,
//   },
//   logo: {
//     color: "#00d4ff",
//     fontSize: 24,
//     fontWeight: "bold",
//     marginBottom: 40,
//   },
//   menuItem: {
//     paddingVertical: 15,
//   },
//   menuText: {
//     color: "#ffffff",
//     fontSize: 16,
//     fontWeight: "500",
//   },
//   dropdown: {
//     paddingLeft: 20,
//   },
//   dropdownItem: {
//     paddingVertical: 10,
//   },
//   dropdownText: {
//     color: "#b0b0b0",
//     fontSize: 14,
//     fontWeight: "500",
//   },
//   main: {
//     flex: 1,
//     padding: 30,
//   },
//   header: {
//     flexDirection: "row",
//     justifyContent: "space-between",
//     alignItems: "center",
//     marginBottom: 30,
//   },
//   headerTitle: {
//     color: "#ffffff",
//     fontSize: 28,
//     fontWeight: "bold",
//   },
//   pageContainer: {
//     flex: 1,
//   },
//   welcomeContainer: {
//     marginBottom: 40,
//     alignItems: "center",
//   },
//   welcomeText: {
//     color: "#00d4ff",
//     fontSize: 32,
//     fontWeight: "bold",
//   },
//   subWelcomeText: {
//     color: "#b0b0b0",
//     fontSize: 18,
//     marginTop: 5,
//   },
//   summaryCard: {
//     backgroundColor: "#2a2a2a",
//     padding: 25,
//     borderRadius: 15,
//     marginBottom: 40,
//     shadowColor: "#00d4ff",
//     shadowOffset: { width: 0, height: 4 },
//     shadowOpacity: 0.4,
//     shadowRadius: 10,
//     elevation: 5,
//   },
//   summaryTitle: {
//     color: "#ffffff",
//     fontSize: 24,
//     fontWeight: "600",
//     marginBottom: 20,
//     textAlign: "center",
//   },
//   summaryStats: {
//     flexDirection: "row",
//     justifyContent: "space-between",
//   },
//   summaryItem: {
//     alignItems: "center",
//     width: "45%",
//   },
//   summaryValue: {
//     color: "#00d4ff",
//     fontSize: 36,
//     fontWeight: "bold",
//   },
//   summaryLabel: {
//     color: "#b0b0b0",
//     fontSize: 16,
//     marginTop: 5,
//   },
//   statsContainer: {
//     flexDirection: "row",
//     justifyContent: "space-between",
//     marginBottom: 40,
//   },
//   statCard: {
//     backgroundColor: "#2a2a2a",
//     padding: 20,
//     borderRadius: 15,
//     width: "30%",
//     alignItems: "center",
//     shadowColor: "#00d4ff",
//     shadowOffset: { width: 0, height: 4 },
//     shadowOpacity: 0.3,
//     shadowRadius: 8,
//     elevation: 5,
//   },
//   statValue: {
//     color: "#00d4ff",
//     fontSize: 32,
//     fontWeight: "bold",
//   },
//   statLabel: {
//     color: "#b0b0b0",
//     fontSize: 16,
//     marginTop: 5,
//   },
//   sectionTitle: {
//     color: "#ffffff",
//     fontSize: 22,
//     fontWeight: "600",
//     marginBottom: 20,
//   },
//   loadingContainer: {
//     flex: 1,
//     justifyContent: "center",
//     alignItems: "center",
//   },
//   loadingText: {
//     color: "#ffffff",
//     marginTop: 10,
//   },
// });

// export default AdminDashboard;