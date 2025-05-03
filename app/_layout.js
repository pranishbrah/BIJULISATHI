import { Stack } from 'expo-router';
import { SidebarProvider } from './SidebarContext';

export default function Layout() {
  return (
    <SidebarProvider>
      <Stack>
        <Stack.Screen name="Admin_tab/dashboard" options={{ headerShown: false }} />
        <Stack.Screen name="Admin_tab/station" options={{ headerShown: false }} />
        <Stack.Screen name="Admin_tab/user" options={{ headerShown: false }} />
        <Stack.Screen name="Admin_tab/stationRequest" options={{ headerShown: false }} />
      </Stack>
    </SidebarProvider>
  );
}