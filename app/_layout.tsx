import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { Drawer } from 'expo-router/drawer';
import { CalendarProvider } from '../src/contexts/CalendarContext';
import { CustomDrawerContent } from '../src/components/CustomDrawerContent';


export default function Layout() {

  return (
    <CalendarProvider>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <Drawer
          drawerContent={(props) => <CustomDrawerContent {...props} />}
          screenOptions={{
            drawerStyle: {
              width: 280,
            },
            headerShown: false, // We'll use our custom header
            drawerType: 'front', // Always use overlay type
            drawerPosition: 'left',
            overlayColor: 'rgba(0, 0, 0, 0.5)',
          }}
        >
          <Drawer.Screen
            name="index"
            options={{
              drawerLabel: 'Calendar',
              title: 'Calendar',
            }}
          />
        </Drawer>
      </GestureHandlerRootView>
    </CalendarProvider>
  );
} 