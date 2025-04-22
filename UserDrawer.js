// UserDrawer.js
import React from 'react';
import { createDrawerNavigator } from '@react-navigation/drawer';
import Home_user from './screen_user/Home_user';
import CustomDrawerContent from './components/DrawerContent'; // ถ้ามี

const Drawer = createDrawerNavigator();

export default function UserDrawer() {
  return (
    <Drawer.Navigator
      drawerContent={(props) => <CustomDrawerContent {...props} />}
      screenOptions={{ headerShown: false }}
    >
      <Drawer.Screen name="Home_user" component={Home_user} />
      {/* เพิ่มหน้าจออื่นใน Drawer ได้ เช่น Profile, Settings ฯลฯ */}
    </Drawer.Navigator>
  );
}
