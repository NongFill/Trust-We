import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, ActivityIndicator } from 'react-native';
import { getAuth } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../Database/firebaseConfig';
import { useIsFocused } from '@react-navigation/native';

export default function CustomDrawerContent({ navigation }) {
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const auth = getAuth();
  const isFocused = useIsFocused();

  useEffect(() => {
    const fetchUserData = async () => {
      const currentUser = auth.currentUser;

      if (currentUser) {
        try {
          const docRef = doc(db, 'users', currentUser.uid);
          const docSnap = await getDoc(docRef);
          if (docSnap.exists()) {
            setUserData(docSnap.data());
          } else {
            console.log('User data not found');
          }
        } catch (error) {
          console.error('Error fetching user data:', error);
        }
      }
      setLoading(false);
    };

    if (isFocused) {
      fetchUserData();
    }
  }, [isFocused]);

  // 🎯 Map ชื่อเมนู -> หน้า
  const menuRoutes = {
    'หน้าหลัก': 'Home_user',
    'ของฝาก': 'Product_details_user',
    'ตั้งค่า': 'Settings',
    'คู่มือการใช้งาน': 'Guide',
    'การช่วยเหลือ': 'Support',
    'ประวัติการฝาก': 'History',
    'ออกจากระบบ': 'Logout',  // ออกจากระบบจัดพิเศษใน handleMenuPress
  };

  const handleMenuPress = (item) => {
    const route = menuRoutes[item];

    if (route === 'Logout') {
      auth.signOut().then(() => {
        navigation.replace('Login_user');
      });
    } else if (route) {
      navigation.navigate(route);
    } else {
      console.log('ไม่พบหน้าสำหรับเมนูนี้:', item);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4CAF50" />
      </View>
    );
  }

  return (
  <View style={styles.container}>
    {/* Profile Card */}
    <View style={styles.card}>
      <View style={styles.profileRow}>
        {userData?.profileImage ? (
          <Image source={{ uri: userData.profileImage }} style={styles.avatar} />
        ) : (
          <View style={styles.avatar} />
        )}

        <View style={styles.profileTextContainer}>
          <Text style={styles.name}>{userData?.fullName || 'ชื่อผู้ใช้'}</Text>
          <TouchableOpacity onPress={() => navigation.navigate('EditProfile')}>
            <Text style={styles.edit}>ปรับแต่งโปรไฟล์</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>

    {/* Drawer Menu */}
    {Object.keys(menuRoutes).map((item, index) => (
      <TouchableOpacity key={index} onPress={() => handleMenuPress(item)}>
        <Text style={styles.menuItem}>{item}</Text>
      </TouchableOpacity>
    ))}
  </View>
);

}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#fff",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  card: {
    top: 30,
    backgroundColor: "#fff",
    borderRadius: 15,
    padding: 15,
    borderWidth: 1,
    borderColor: "#e0e0e0",
    marginBottom: 30,
  },
  profileRow: { 
    flexDirection: "row",
    alignItems: "center",
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#ccc",
    marginRight: 15,
  },
  profileTextContainer: {
    justifyContent: "center",
  },
  name: {
    fontSize: 18,
    fontWeight: "500",
  },
  edit: {
    color: "#9e9e9e",
    fontSize: 14,
    marginTop: 4,
    textDecorationLine: "underline",
  },
  menuItem: {
    paddingVertical: 14,
    fontSize: 16,
    borderBottomColor: "#eee",
    borderBottomWidth: 1,
  },
});

