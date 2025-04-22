import React, { useEffect } from "react";
import { View, Image,  StyleSheet, Dimensions } from "react-native";

export default function Loading({ navigation }) {
  useEffect(() => {
    setTimeout(() => {
      navigation.replace("Login_user");
    }, 3000); // รอ 3 วินาที
  }, [navigation]);

  return (
    <View style={styles.container}>
      {/* วงกลมสีเขียว */}
      <View style={[styles.circleTopLeft]} />
      <View style={[styles.circleUnderRight]} />
      
      {/* วงกลมสีเทา */}
      <View style={[styles.circleTopRight]} />
      <View style={[styles.circleUnderLeft]} />

      {/* โลโก้ */}
      <Image source={require("../assets/Logo.png")} style={styles.logo} />
    </View>
  );
}

// คำนวณขนาดหน้าจอ
const { width, height } = Dimensions.get("window");

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000", // พื้นหลังสีดำ
    justifyContent: "center",
    alignItems: "center",
  },
  circleTopLeft: {
    position: "absolute",
    width: width * 0.5, // ปรับขนาดเป็น 50% ของหน้าจอ
    height: width * 0.5,
    borderRadius: width * 0.25, // ทำให้เป็นวงกลม
    backgroundColor: "#5FD788", // สีเขียว
    //จัดตำแหน่ง 
    top: width * -0.04,
    left: width * -0.20,
  },
  circleUnderRight: {
    position: "absolute",
    width: width * 0.3, // ปรับขนาดเป็น 30% ของหน้าจอ
    height: width * 0.3,
    borderRadius: width * 0.15, // ทำให้เป็นวงกลม
    backgroundColor: "#5FD788", // สีเขียว
    // จัดตำแหน่ง
    bottom: width * -0.03,
    right: width * -0.06,
  },
  circleTopRight: {
    position: "absolute",
    width: width * 0.3, // ปรับขนาดเป็น 30% ของหน้าจอ
    height: width * 0.3,
    borderRadius: width * 0.15, // ทำให้เป็นวงกลม
    backgroundColor: "#D9D9D9", // สีเทา
    //จัดตำแหน่ง
    top: width * 0.2,
    right: width * -0.15,
  },
  circleUnderLeft: {
    position: "absolute",
    width: width * 0.36, // ปรับขนาดเป็น 36% ของหน้าจอ
    height: width * 0.36,
    borderRadius: width * 0.18, // ทำให้เป็นวงกลม
    backgroundColor: "#D9D9D9", // สีเทา
    //จัดตำแหน่ง
    bottom: width * 0.15,
    left: width * -0.1,
  },
  
  logo: {
    width: 250,
    height: 250,
    resizeMode: "contain",
  },
  
});

