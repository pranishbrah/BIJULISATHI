import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
  Dimensions,
  Pressable,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import Animated, { FadeInDown, FadeIn } from "react-native-reanimated";
import { useSidebar } from "../SidebarContext";

const BASE_URL = "http://localhost:8000";
const screenWidth = Dimensions.get("window").width;

const BarGraph = ({ data, maxValue, labelKey, valueKey, color }) => {
  if (!data || data.length === 0) {
    return (
      <View style={styles.graphContainer}>
        <Text style={styles.graphErrorText}>No data available</Text>
      </View>
    );
  }

  const barWidth = Math.min((screenWidth - 80) / data.length - 5, 30);
  const maxHeight = 160;

  const yAxisLabels = [0, maxValue / 2, maxValue].map((val) =>
    Math.round(val).toString()
  );

  return (
    <View style={styles.graphContainer}>
      <View style={styles.yAxis}>
        {yAxisLabels.map((label, index) => (
          <Text key={index} style={styles.yAxisLabel}>
            {label}
          </Text>
        ))}
      </View>
      <View style={styles.graphContent}>
        <View style={styles.gridLines}>
          {[0, 1, 2].map((_, index) => (
            <Animated.View
              key={index}
              style={styles.gridLine}
              entering={FadeInDown.duration(300).delay(index * 100)}
            />
          ))}
        </View>
        <View style={styles.barsContainer}>
          {data.map((item, index) => {
            const value = item[valueKey] || 0;
            const label = item[labelKey] || `Item ${index + 1}`;
            const height = maxValue > 0 ? (value / maxValue) * maxHeight : 0;

            return (
              <Pressable
                key={index}
                onPress={() => alert(`Value: ${value}`)}
                style={styles.barWrapper}
              >
                <Animated.View
                  entering={FadeInDown.delay(index * 50)
                    .duration(300)
                    .springify()
                    .mass(1)
                    .damping(10)
                    .stiffness(100)}
                >
                  <LinearGradient
                    colors={[color, "#C8E6C9"]}
                    style={[styles.bar, { height, width: barWidth }]}
                  />
                  <Text style={styles.barValue}>{value}</Text>
                  <Text style={styles.barLabel} numberOfLines={1}>
                    {label}
                  </Text>
                </Animated.View>
              </Pressable>
            );
          })}
        </View>
      </View>
    </View>
  );
};

const AdminDashboard = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [dashboardStats, setDashboardStats] = useState({
    onlineStations: 0,
    totalEarnings: 0,
    totalStations: 0,
    registeredUsers: 0,
    earningsBreakdown: { daily: 0, weekly: 0, monthly: 0 },
    userGrowth: [],
    revenueTrend: [],
  });
  const [timeRange, setTimeRange] = useState("weekly");
  const [isUsersDropdownOpen, setIsUsersDropdownOpen] = useState(false);
  const router = useRouter();
  const { isSidebarOpen, toggleSidebar } = useSidebar();

  useEffect(() => {
    let isMounted = true;

    const fetchDashboardData = async () => {
      setIsLoading(true);
      try {
        const [
          onlineRes,
          earningsRes,
          totalStationsRes,
          usersRes,
          earningsBreakdownRes,
          userGrowthRes,
          revenueTrendRes,
        ] = await Promise.all([
          fetch(`${BASE_URL}/admin/online-stations`),
          fetch(`${BASE_URL}/admin/total-earnings`),
          fetch(`${BASE_URL}/admin/total-stations`),
          fetch(`${BASE_URL}/admin/registered-users`),
          fetch(`${BASE_URL}/admin/earnings-breakdown`),
          fetch(`${BASE_URL}/admin/user-growth`),
          fetch(`${BASE_URL}/admin/revenue-trend`),
        ]);

        const [
          onlineData,
          earningsData,
          totalStationsData,
          usersData,
          earningsBreakdownData,
          userGrowthData,
          revenueTrendData,
        ] = await Promise.all([
          onlineRes.json(),
          earningsRes.json(),
          totalStationsRes.json(),
          usersRes.json(),
          earningsBreakdownRes.json(),
          userGrowthRes.json(),
          revenueTrendRes.json(),
        ]);

        if (isMounted) {
          setDashboardStats({
            onlineStations: onlineData.onlineStations || 0,
            totalEarnings: earningsData.totalEarnings || 0,
            totalStations: totalStationsData.totalStations || 0,
            registeredUsers: usersData.registeredUsers || 0,
            earningsBreakdown: earningsBreakdownData.breakdown || {
              daily: 0,
              weekly: 0,
              monthly: 0,
            },
            userGrowth: userGrowthData.growth || [],
            revenueTrend: revenueTrendData.trend || [],
          });
        }
      } catch (error) {
        if (isMounted) {
          console.error("Error fetching dashboard data:", error);
          alert("Failed to load dashboard data. Please try again.");
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    fetchDashboardData();

    return () => {
      isMounted = false;
    };
  }, []);

  const toggleUsersDropdown = () => {
    setIsUsersDropdownOpen(!isUsersDropdownOpen);
  };

  const handleSidebarToggle = () => {
    toggleSidebar();
    if (isUsersDropdownOpen) setIsUsersDropdownOpen(false);
  };

  const formatCurrency = (amount) => {
    return amount.toLocaleString("en-NP", {
      style: "currency",
      currency: "NPR",
    });
  };

  const renderEarningsBreakdown = () => {
    return (
      <Animated.View
        entering={FadeInDown.duration(400)}
        style={styles.cardContainer}
      >
        <View style={styles.earningsCard}>
          <Text style={styles.sectionTitle}>Earnings Breakdown</Text>
          <View style={styles.timeRangeSelector}>
            {["daily", "weekly", "monthly"].map((range) => (
              <TouchableOpacity
                key={range}
                style={[
                  styles.timeRangeTab,
                  timeRange === range && styles.activeTimeRangeTab,
                ]}
                onPress={() => setTimeRange(range)}
              >
                <Animated.View
                  entering={FadeInDown.duration(300)}
                  style={{
                    transform: timeRange === range ? [{ scale: 1.05 }] : [],
                  }}
                >
                  <Text
                    style={[
                      styles.timeRangeText,
                      timeRange === range && styles.activeTimeRangeText,
                    ]}
                  >
                    {range.charAt(0).toUpperCase() + range.slice(1)}
                  </Text>
                </Animated.View>
              </TouchableOpacity>
            ))}
          </View>
          <View style={styles.breakdownStats}>
            <View style={styles.breakdownItem}>
              <Text style={styles.breakdownValue}>
                {formatCurrency(dashboardStats.earningsBreakdown[timeRange])}
              </Text>
              <Text style={styles.breakdownLabel}>
                {timeRange.charAt(0).toUpperCase() + timeRange.slice(1)} Income
              </Text>
            </View>
            <View style={styles.breakdownItem}>
              <Text style={styles.breakdownValue}>
                {dashboardStats.totalEarnings > 0
                  ? Math.round(
                      (dashboardStats.earningsBreakdown[timeRange] /
                        dashboardStats.totalEarnings) *
                        100
                    )
                  : 0}
                %
              </Text>
              <Text style={styles.breakdownLabel}>of Total Revenue</Text>
            </View>
          </View>
        </View>
      </Animated.View>
    );
  };

  const renderUserGrowthChart = () => {
    if (dashboardStats.userGrowth.length === 0) return null;

    const maxUsers = Math.max(
      ...dashboardStats.userGrowth.map((item) => item.count || 0),
      1
    );

    return (
      <Animated.View
        entering={FadeInDown.duration(400).delay(100)}
        style={styles.cardContainer}
      >
        <View style={styles.graphCard}>
          <Text style={styles.sectionTitle}>User Growth</Text>
          <BarGraph
            data={dashboardStats.userGrowth}
            maxValue={maxUsers}
            labelKey="month"
            valueKey="count"
            color="#81C784"
          />
        </View>
      </Animated.View>
    );
  };

  const renderRevenueTrendChart = () => {
    if (dashboardStats.revenueTrend.length === 0) return null;

    const maxRevenue = Math.max(
      ...dashboardStats.revenueTrend.map((item) => item.amount || 0),
      1
    );

    return (
      <Animated.View
        entering={FadeInDown.duration(400).delay(200)}
        style={styles.cardContainer}
      >
        <View style={styles.graphCard}>
          <Text style={styles.sectionTitle}>Revenue Trend</Text>
          <BarGraph
            data={dashboardStats.revenueTrend}
            maxValue={maxRevenue}
            labelKey="period"
            valueKey="amount"
            color="#81C784"
          />
        </View>
      </Animated.View>
    );
  };

  const renderDashboard = () => {
    return (
      <ScrollView
        style={styles.pageContainer}
        contentContainerStyle={{ paddingBottom: 80 }}
      >
        <Animated.View entering={FadeInDown.duration(400)}>
          <LinearGradient
            colors={["#4CAF50", "#388E3C"]}
            style={styles.welcomeContainer}
          >
            <Text style={styles.welcomeText}>Welcome, Admin!</Text>
            <Text style={styles.subWelcomeText}>
              Nepal's EV Network Analytics
            </Text>
          </LinearGradient>
        </Animated.View>

        <Animated.View
          entering={FadeInDown.duration(400).delay(100)}
          style={styles.cardContainer}
        >
          <LinearGradient colors={["#F5F7F2", "#E8F5E9"]} style={styles.card}>
            <Text style={styles.summaryTitle}>Your Impact</Text>
            <View style={styles.summaryStats}>
              <View style={styles.summaryItem}>
                <Text style={styles.summaryValue}>
                  {dashboardStats.onlineStations}
                </Text>
                <Text style={styles.summaryLabel}>Stations Online</Text>
              </View>
              <View style={styles.summaryItem}>
                <Text style={styles.summaryValue}>
                  {formatCurrency(dashboardStats.totalEarnings)}
                </Text>
                <Text style={styles.summaryLabel}>Total Earnings</Text>
              </View>
            </View>
          </LinearGradient>
        </Animated.View>

        <Animated.View entering={FadeInDown.duration(400).delay(200)}>
          <Text style={styles.sectionTitle}>Quick Stats</Text>
          <View style={styles.statsContainer}>
            {[
              { value: dashboardStats.totalStations, label: "Total Stations" },
              {
                value: dashboardStats.registeredUsers,
                label: "Registered Users",
              },
              {
                value: `${
                  dashboardStats.totalStations > 0
                    ? Math.round(
                        (dashboardStats.onlineStations /
                          dashboardStats.totalStations) *
                          100
                      )
                    : 0
                }%`,
                label: "Availability",
              },
            ].map((stat, index) => (
              <LinearGradient
                key={index}
                colors={["#F5F7F2", "#E8F5E9"]}
                style={styles.statCard}
              >
                <Text style={styles.statValue}>{stat.value}</Text>
                <Text style={styles.statLabel}>{stat.label}</Text>
              </LinearGradient>
            ))}
          </View>
        </Animated.View>

        {renderEarningsBreakdown()}
        {renderUserGrowthChart()}
        {renderRevenueTrendChart()}
      </ScrollView>
    );
  };

  if (isLoading) {
    return (
      <LinearGradient
        colors={["#4CAF50", "#388E3C"]}
        style={styles.loadingContainer}
      >
        <ActivityIndicator size="large" color="#FFFFFF" />
        <Text style={styles.loadingText}>Loading analytics...</Text>
      </LinearGradient>
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
      <View style={styles.main}>{renderDashboard()}</View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: "row",
    backgroundColor: "#E8F5E9",
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
    textAlign: "center",
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
    marginLeft: 110, // Increased indent to align under "Users"
    paddingVertical: 0,
    paddingHorizontal: 0,
    maxWidth: 180, // Reduced to fit within sidebar
    marginBottom: 10,
  },
  dropdownItem: {
    paddingVertical: 10,
    borderRadius: 6,
  },
  dropdownText: {
    color: "#F5F6F5",
    fontSize: 13,
    fontWeight: "400",
  },
  main: {
    flex: 1,
    padding: 14,
    backgroundColor: "#F1F8E9",
  },
  pageContainer: {
    flex: 1,
  },
  welcomeContainer: {
    padding: 16,
    borderRadius: 8,
    marginBottom: 16,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
  },
  welcomeText: {
    color: "#FFFFFF",
    fontSize: 32,
    fontWeight: "700",
  },
  subWelcomeText: {
    color: "rgba(255, 255, 255, 0.9)",
    fontSize: 16,
    marginTop: 8,
  },
  cardContainer: {
    marginBottom: 16,
    borderRadius: 8,
    overflow: "hidden",
  },
  card: {
    padding: 16,
    borderRadius: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
  },
  earningsCard: {
    padding: 16,
    borderRadius: 8,
    backgroundColor: "#F5F7F2",
    borderWidth: 1,
    borderColor: "#C8E6C9",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
  },
  graphCard: {
    padding: 16,
    borderRadius: 8,
    backgroundColor: "#F5F7F2",
    borderWidth: 1,
    borderColor: "#C8E6C9",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
  },
  summaryTitle: {
    color: "#1B5E20",
    fontSize: 24,
    fontWeight: "700",
    marginBottom: 16,
    textAlign: "center",
  },
  summaryStats: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  summaryItem: {
    alignItems: "center",
    width: "45%",
  },
  summaryValue: {
    color: "#388E3C",
    fontSize: 36,
    fontWeight: "700",
  },
  summaryLabel: {
    color: "#4A5A6A",
    fontSize: 14,
    marginTop: 8,
  },
  statsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  statCard: {
    padding: 16,
    borderRadius: 8,
    width: "30%",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
  },
  statValue: {
    color: "#388E3C",
    fontSize: 32,
    fontWeight: "700",
  },
  statLabel: {
    color: "#4A5A6A",
    fontSize: 12,
    marginTop: 8,
  },
  sectionTitle: {
    color: "#1B5E20",
    fontSize: 22,
    fontWeight: "700",
    marginBottom: 16,
    textAlign: "center",
  },
  timeRangeSelector: {
    flexDirection: "row",
    justifyContent: "center",
    marginBottom: 16,
    backgroundColor: "rgba(255, 255, 255, 0.15)",
    borderRadius: 16,
    padding: 4,
  },
  timeRangeTab: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 12,
  },
  activeTimeRangeTab: {
    backgroundColor: "#FFFFFF",
  },
  timeRangeText: {
    color: "#1B5E20",
    fontWeight: "600",
    fontSize: 14,
  },
  activeTimeRangeText: {
    color: "#1B5E20",
  },
  breakdownStats: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  breakdownItem: {
    alignItems: "center",
    width: "48%",
  },
  breakdownValue: {
    color: "#1B5E20",
    fontSize: 30,
    fontWeight: "700",
  },
  breakdownLabel: {
    color: "#4A5A6A",
    fontSize: 14,
    fontWeight: "600",
    marginTop: 8,
    textAlign: "center",
  },
  graphContainer: {
    flexDirection: "row",
    paddingVertical: 8,
    width: "100%",
  },
  yAxis: {
    width: 40,
    justifyContent: "space-between",
    paddingVertical: 8,
    marginRight: 6,
  },
  yAxisLabel: {
    color: "#1B5E20",
    fontSize: 12,
    textAlign: "right",
  },
  graphContent: {
    flex: 1,
    position: "relative",
  },
  gridLines: {
    position: "absolute",
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    justifyContent: "space-between",
  },
  gridLine: {
    height: 1,
    backgroundColor: "rgba(27, 94, 32, 0.15)",
  },
  barsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
    height: 180,
    paddingHorizontal: 2,
  },
  barWrapper: {
    alignItems: "center",
    justifyContent: "flex-end",
    flex: 1,
  },
  bar: {
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
    marginHorizontal: 2,
  },
  barValue: {
    color: "#1B5E20",
    fontSize: 12,
    fontWeight: "600",
    marginTop: 4,
    textAlign: "center",
  },
  barLabel: {
    color: "#1B5E20",
    fontSize: 12,
    fontWeight: "500",
    marginTop: 4,
    textAlign: "center",
    maxWidth: 30,
  },
  graphErrorText: {
    color: "#1B5E20",
    fontSize: 14,
    textAlign: "center",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    color: "#FFFFFF",
    fontSize: 16,
    marginTop: 10,
  },
});

export default AdminDashboard;
