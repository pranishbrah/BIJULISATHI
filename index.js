// import React, { useState, useEffect } from "react";
// import {
//   View,
//   Text,
//   TextInput,
//   TouchableOpacity,
//   StyleSheet,
//   SafeAreaView,
//   ScrollView,
//   Alert,
// } from "react-native";
// import { useLocalSearchParams, useRouter } from "expo-router";
// import { Ionicons } from "@expo/vector-icons";

// // Sample station data (should be imported from your data source)
// const stations = [
//   {
//     id: "1",
//     name: "ElectroHub Downtown",
//     address: "123 Main St, City Center",
//     type: "Fast Charger (50kW)",
//     price: "$0.35/kWh",
//   },
//   {
//     id: "2",
//     name: "GreenPower Station",
//     address: "456 Park Ave, North District",
//     type: "Ultra-Fast (150kW)",
//     price: "$0.45/kWh",
//   },
//   {
//     id: "3",
//     name: "EcoCharge Mall",
//     address: "789 Shopping Blvd, Eastside",
//     type: "Standard (22kW)",
//     price: "$0.25/kWh",
//   },
// ];

// export default function BookStation() {
//   const router = useRouter();
//   const { stationId } = useLocalSearchParams();
//   const [name, setName] = useState("");
//   const [carNumber, setCarNumber] = useState("");
//   const [phone, setPhone] = useState("");
//   const [minutes, setMinutes] = useState("");
//   const [selectedStation, setSelectedStation] = useState(null);

//   // Find the selected station when component mounts or stationId changes
//   useEffect(() => {
//     if (stationId) {
//       const station = stations.find((s) => s.id === stationId);
//       if (station) {
//         setSelectedStation(station);
//       } else {
//         Alert.alert("Error", "Station not found");
//         router.back();
//       }
//     }
//   }, [stationId]);

//   const handleConfirmBooking = () => {
//     // Validate all fields
//     if (!name.trim()) {
//       Alert.alert("Validation Error", "Please enter your name");
//       return;
//     }
//     if (!carNumber.trim()) {
//       Alert.alert("Validation Error", "Please enter your car number");
//       return;
//     }
//     if (!phone.trim()) {
//       Alert.alert("Validation Error", "Please enter your phone number");
//       return;
//     }
//     if (!minutes.trim() || isNaN(minutes)) {
//       Alert.alert("Validation Error", "Please enter valid charging minutes");
//       return;
//     }

//     // Create booking object
//     const booking = {
//       stationId: selectedStation.id,
//       stationName: selectedStation.name,
//       userName: name,
//       carNumber,
//       phoneNumber: phone,
//       chargingMinutes: parseInt(minutes),
//       bookingDate: new Date().toISOString(),
//     };

//     // Here you would typically send this to your backend
//     console.log("Booking confirmed:", booking);

//     // Show success message and navigate back
//     Alert.alert(
//       "Booking Confirmed",
//       `Your booking at ${selectedStation.name} for ${minutes} minutes is confirmed!`,
//       [
//         {
//           text: "OK",
//           onPress: () => router.push("/bookings"),
//         },
//       ]
//     );
//   };

//   if (!selectedStation) {
//     return (
//       <SafeAreaView style={styles.loadingContainer}>
//         <Text>Loading station details...</Text>
//       </SafeAreaView>
//     );
//   }

//   return (
//     <SafeAreaView style={styles.container}>
//       <ScrollView contentContainerStyle={styles.scrollContainer}>
//         <View style={styles.header}>
//           <TouchableOpacity onPress={() => router.back()}>
//             <Ionicons name="arrow-back" size={24} color="#4CAF50" />
//           </TouchableOpacity>
//           <Text style={styles.title}>Book Charging Station</Text>
//         </View>

//         <View style={styles.stationInfo}>
//           <Text style={styles.stationName}>{selectedStation.name}</Text>
//           <Text style={styles.stationAddress}>{selectedStation.address}</Text>
//           <View style={styles.stationDetails}>
//             <Text style={styles.stationType}>{selectedStation.type}</Text>
//             <Text style={styles.stationPrice}>{selectedStation.price}</Text>
//           </View>
//         </View>

//         <View style={styles.formContainer}>
//           {/* Person Name */}
//           <View style={styles.inputContainer}>
//             <Text style={styles.label}>Your Full Name</Text>
//             <TextInput
//               style={styles.input}
//               placeholder="John Doe"
//               value={name}
//               onChangeText={setName}
//               autoCapitalize="words"
//             />
//           </View>

//           {/* Car Number */}
//           <View style={styles.inputContainer}>
//             <Text style={styles.label}>Vehicle Registration Number</Text>
//             <TextInput
//               style={styles.input}
//               placeholder="ABC 1234"
//               value={carNumber}
//               onChangeText={setCarNumber}
//               autoCapitalize="characters"
//             />
//           </View>

//           {/* Phone Number */}
//           <View style={styles.inputContainer}>
//             <Text style={styles.label}>Mobile Number</Text>
//             <TextInput
//               style={styles.input}
//               placeholder="98XXXXXXXX"
//               value={phone}
//               onChangeText={setPhone}
//               keyboardType="phone-pad"
//               maxLength={10}
//             />
//           </View>

//           {/* Minutes to Charge */}
//           <View style={styles.inputContainer}>
//             <Text style={styles.label}>Charging Duration (minutes)</Text>
//             <TextInput
//               style={styles.input}
//               placeholder="30"
//               value={minutes}
//               onChangeText={setMinutes}
//               keyboardType="numeric"
//             />
//           </View>

//           {/* Confirm Button */}
//           <TouchableOpacity
//             style={styles.confirmButton}
//             onPress={handleConfirmBooking}
//           >
//             <Text style={styles.confirmButtonText}>Confirm Booking</Text>
//           </TouchableOpacity>
//         </View>
//       </ScrollView>
//     </SafeAreaView>
//   );
// }

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: "#FFF",
//   },
//   loadingContainer: {
//     flex: 1,
//     justifyContent: "center",
//     alignItems: "center",
//   },
//   scrollContainer: {
//     padding: 20,
//     paddingBottom: 40,
//   },
//   header: {
//     flexDirection: "row",
//     alignItems: "center",
//     marginBottom: 20,
//   },
//   title: {
//     fontSize: 20,
//     fontWeight: "bold",
//     marginLeft: 15,
//     color: "#333",
//   },
//   stationInfo: {
//     backgroundColor: "#F5F5F5",
//     borderRadius: 10,
//     padding: 15,
//     marginBottom: 25,
//   },
//   stationName: {
//     fontSize: 18,
//     fontWeight: "bold",
//     color: "#333",
//     marginBottom: 5,
//   },
//   stationAddress: {
//     fontSize: 14,
//     color: "#666",
//     marginBottom: 10,
//   },
//   stationDetails: {
//     flexDirection: "row",
//     justifyContent: "space-between",
//   },
//   stationType: {
//     fontSize: 14,
//     color: "#2196F3",
//   },
//   stationPrice: {
//     fontSize: 14,
//     fontWeight: "bold",
//     color: "#4CAF50",
//   },
//   formContainer: {
//     marginBottom: 30,
//   },
//   inputContainer: {
//     marginBottom: 20,
//   },
//   label: {
//     fontSize: 16,
//     marginBottom: 8,
//     color: "#555",
//     fontWeight: "500",
//   },
//   input: {
//     borderWidth: 1,
//     borderColor: "#DDD",
//     borderRadius: 8,
//     padding: 15,
//     fontSize: 16,
//     backgroundColor: "#FFF",
//   },
//   confirmButton: {
//     backgroundColor: "#4CAF50",
//     borderRadius: 8,
//     padding: 18,
//     alignItems: "center",
//     marginTop: 20,
//   },
//   confirmButtonText: {
//     color: "#FFF",
//     fontSize: 16,
//     fontWeight: "bold",
//   },
// });
