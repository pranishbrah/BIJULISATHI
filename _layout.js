import { Stack } from "expo-router";

export default function Layout() {
  return (
    <Stack>
      <Stack.Screen
        name="Owner_tab/owner_login"
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="Owner_tab/owner_registration"
        options={{ headerShown: false }}
      />

      <Stack.Screen
        name="Owner_tab/owner_tab"
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="Owner_tab/CompletedBookings"
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="Owner_tab/IncompleteBookings"
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="Owner_tab/TotalRevenue"
        options={{ headerShown: false }}
      />
    </Stack>
  );
}
