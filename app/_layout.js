import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Colors } from '../src/utils/theme';

export default function RootLayout() {
  return (
    <>
      <StatusBar style="light" backgroundColor={Colors.bg0} />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: Colors.bg0 },
          animation: 'slide_from_right',
        }}
      >
        <Stack.Screen name="index"     options={{ animation: 'none' }} />
        <Stack.Screen name="vehicle"   />
        <Stack.Screen name="capture"   />
        <Stack.Screen name="results"   />
        <Stack.Screen name="signature" />
        <Stack.Screen name="dashboard" />
      </Stack>
    </>
  );
}
