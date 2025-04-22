import React, { useState } from "react";
import { View, StyleSheet, Text, Alert, TouchableOpacity } from "react-native";
import { Input, Button } from "react-native-elements";
import { auth, db } from "../Database/firebaseConfig";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { setDoc, doc } from "firebase/firestore";
import Icon from "react-native-vector-icons/FontAwesome";

export default function Sign_user({ navigation }) {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSignUp = async () => {
    if (!email || !password || !confirmPassword || !fullName || !phone) {
      Alert.alert("แจ้งเตือน", "กรุณากรอกข้อมูลทั้งหมด");
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert("ข้อผิดพลาด", "รหัสผ่านไม่ตรงกัน");
      return;
    }

    setIsLoading(true);

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const uid = userCredential.user.uid;

      await setDoc(doc(db, "users", uid), {
        uid,
        fullName,
        email,
        phone,
        createdAt: new Date(),
      });

      Alert.alert("สำเร็จ", "สมัครสมาชิกเรียบร้อยแล้ว!");
      navigation.navigate("Login_user");
    } catch (error) {
      console.error("Sign Up error:", error);
      let errorMessage = "";

      if (error.code === "auth/email-already-in-use") {
        errorMessage = "อีเมลนี้ถูกใช้ไปแล้ว กรุณาใช้อีเมลอื่น หรือเข้าสู่ระบบ";
      } else {
        errorMessage = error.message || "เกิดข้อผิดพลาดบางอย่าง";
      }

      Alert.alert("สมัครสมาชิกไม่สำเร็จ", errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
        <Icon name="arrow-left" size={24} color="#000" />
      </TouchableOpacity>

      <Text style={styles.title}>สมัครสมาชิกสำหรับผู้ฝาก</Text>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>ชื่อ-นามสกุล</Text>
        <Input
          value={fullName}
          onChangeText={setFullName}
          containerStyle={styles.input}
          inputContainerStyle={styles.inputContainer}
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>อีเมล</Text>
        <Input
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
          containerStyle={styles.input}
          inputContainerStyle={styles.inputContainer}
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>รหัสผ่าน</Text>
        <Input
          secureTextEntry
          value={password}
          onChangeText={setPassword}
          containerStyle={styles.input}
          inputContainerStyle={styles.inputContainer}
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>ยืนยันรหัสผ่าน</Text>
        <Input
          secureTextEntry
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          containerStyle={styles.input}
          inputContainerStyle={styles.inputContainer}
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>เบอร์โทรศัพท์</Text>
        <Input
          value={phone}
          onChangeText={setPhone}
          keyboardType="phone-pad"
          containerStyle={styles.input}
          inputContainerStyle={styles.inputContainer}
        />
      </View>

      <Button
        title={isLoading ? "กำลังสมัคร..." : "สมัครสมาชิก"}
        loading={isLoading}
        disabled={isLoading}
        buttonStyle={styles.signUpButton}
        onPress={handleSignUp}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 38,
    backgroundColor: "#FFFFFF",
    justifyContent: "center",
  },
  backButton: {
    position: "absolute",
    top: 40,
    left: 20,
    zIndex: 10,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 30,
    marginTop: 60,
  },
  inputGroup: {
    marginBottom: 1,
  },
  label: {
    fontSize: 14,
    fontWeight: "500",
    marginBottom: 5,
    color: "#333",
    marginLeft: 17,
  },
  input: {
    marginBottom: 0,
  },
  inputContainer: {
    borderBottomWidth: 1,
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    paddingHorizontal: 15,
    paddingVertical: 1,
    borderWidth: 1,
    borderColor: "#ccc",
  },
  signUpButton: {
    backgroundColor: "#000",
    borderRadius: 30,
    paddingVertical: 12,
    marginTop: 10,
  },
});
