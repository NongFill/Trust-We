import React, { useState } from "react";
import { View, StyleSheet, Image, TouchableOpacity, Text, Alert, ScrollView } from "react-native";
import { Input, Button } from "react-native-elements";
import Icon from "react-native-vector-icons/FontAwesome";
import { auth, db } from "../Database/firebaseConfig";
import { signInWithEmailAndPassword } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";

export default function LoginUser({ navigation }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (isForServe) => {
    if (!email || !password) {
      Alert.alert("แจ้งเตือน", "กรุณากรอกอีเมลและรหัสผ่าน");
      return;
    }

    setIsLoading(true);

    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const uid = userCredential.user.uid;

      const docRef = isForServe
        ? doc(db, "serve", uid)
        : doc(db, "users", uid);

      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        if (isForServe) {
          navigation.navigate("Home_serve");
        } else {
          navigation.navigate("Home_user");
        }
      } else {
        Alert.alert("ไม่พบข้อมูล", "ไม่พบบัญชีผู้ใช้นี้ในระบบ");
        await auth.signOut();
      }
    } catch (error) {
      console.error("Login error:", error);
      Alert.alert("เข้าสู่ระบบไม่สำเร็จ", error.message || "เกิดข้อผิดพลาดบางอย่าง");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.scrollContainer}>
      <View style={styles.container}>
        <View style={styles.card}>
          <Image source={require("../assets/Logo_Login.png")} style={styles.image} />
          <Text style={styles.title}>เข้าสู่ระบบ</Text>
          <Text style={styles.subtitle}>เข้าสู่ระบบสำหรับผู้ฝาก</Text>

          <Text style={styles.label}>อีเมล</Text>
          <Input
            leftIcon={<Icon name="envelope" size={16} color="black" />}
            value={email}
            onChangeText={setEmail}
            containerStyle={styles.input}
            inputContainerStyle={styles.inputContainer}
            inputStyle={styles.fixedInput}
            placeholder=""
          />

          <Text style={styles.label}>รหัสผ่าน</Text>
          <Input
            secureTextEntry
            leftIcon={<Icon name="lock" size={20} color="black" />}
            value={password}
            onChangeText={setPassword}
            containerStyle={styles.input}
            inputContainerStyle={styles.inputContainer}
            inputStyle={styles.fixedInput}
            placeholder=""
          />

          <Button
            title={isLoading ? "กำลังเข้าสู่ระบบ..." : "เข้าสู่ระบบ"}
            loading={isLoading}
            disabled={isLoading}
            buttonStyle={styles.loginButton}
            onPress={() => handleLogin(false)}
          />

          <View style={styles.socialContainer}>
            <Icon name="google" size={30} color="#DB4437" style={styles.socialIcon} />
            <Icon name="facebook" size={30} color="#4267B2" />
          </View>

          <TouchableOpacity onPress={() => navigation.navigate("Sign_user")}>
            <Text style={styles.signupText}>สมัครสมาชิกสำหรับผู้ฝาก</Text>
          </TouchableOpacity>

          <View style={styles.divider} />

          <Button
            title="เข้าสู่ระบบสำหรับ ผู้รับฝาก"
            buttonStyle={styles.serviceButton}
            titleStyle={styles.serviceButtonText}
            onPress={() => handleLogin(true)}
          />

          <TouchableOpacity onPress={() => navigation.navigate("Sign1_serve")}>
            <Text style={styles.signupText}>สมัครสมาชิกสำหรับผู้รับฝาก</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollContainer: {
    flexGrow: 1,
    justifyContent: "center",
    paddingHorizontal: 38,
    backgroundColor: "#FEF8F8",
  },
  container: {
    flex: 1,
    justifyContent: "center",
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
  },
  image: {
    width: 200,
    height: 200,
    alignSelf: "center",
    resizeMode: "contain",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    textAlign: "center",
    marginTop: 10,
  },
  subtitle: {
    textAlign: "center",
    marginBottom: 6,
  },
  label: {
    fontSize: 14,
    fontWeight: "500",
    color: "#333",
    marginBottom: 5,
    marginLeft: 17,
  },
  input: {
    marginBottom: 1,
  },
  inputContainer: {
    borderBottomWidth: 1,
    borderRadius: 30,
    paddingHorizontal: 15,
    borderWidth: 1,
    borderColor: "#ccc",
  },
  fixedInput: {
    height: 40,
    paddingVertical: 0,
  },
  loginButton: {
    backgroundColor: "#000",
    borderRadius: 30,
    paddingVertical: 12,
  },
  socialContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginVertical: 20,
  },
  socialIcon: {
    marginRight: 20,
  },
  signupText: {
    textAlign: "center",
    color: "#777",
    marginVertical: 5,
  },
  divider: {
    height: 1,
    backgroundColor: "#000",
    marginVertical: 15,
  },
  serviceButton: {
    backgroundColor: "#5FD788",
    borderRadius: 30,
    paddingVertical: 12,
  },
  serviceButtonText: {
    color: "#fff",
    fontWeight: "bold",
  },
});
