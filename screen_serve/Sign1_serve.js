import React, { useState } from "react";
import {
  View,
  StyleSheet,
  Text,
  Alert,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import { Input, Button, CheckBox } from "react-native-elements";
import { auth, db } from "../Database/firebaseConfig";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { setDoc, doc } from "firebase/firestore";
import Icon from "react-native-vector-icons/FontAwesome";

export default function Sign1_serve({ navigation }) {
  const [storeName, setStoreName] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [idCard, setIdCard] = useState("");
  const [agreed, setAgreed] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSignUp = async () => {
    if (
      !storeName ||
      !firstName ||
      !lastName ||
      !email ||
      !password ||
      !confirmPassword ||
      !phone ||
      !idCard
    ) {
      Alert.alert("แจ้งเตือน", "กรุณากรอกข้อมูลให้ครบถ้วน");
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert("ข้อผิดพลาด", "รหัสผ่านไม่ตรงกัน");
      return;
    }

    if (!agreed) {
      Alert.alert("แจ้งเตือน", "กรุณายินยอมให้เปิดเผยข้อมูลส่วนบุคคล");
      return;
    }

    setIsLoading(true);

    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );
      const uid = userCredential.user.uid;

      await setDoc(doc(db, "serve", uid), {
        uid,
        storeName,
        firstName,
        lastName,
        email,
        phone,
        idCard,
        createdAt: new Date(),
      });

      navigation.navigate("Sign2_serve", { uid });

    } catch (error) {
      console.error("Sign Up error:", error);
      let errorMessage = error.message || "เกิดข้อผิดพลาดบางอย่าง";

      if (error.code === "auth/email-already-in-use") {
        errorMessage = "อีเมลนี้ถูกใช้ไปแล้ว กรุณาใช้อีเมลอื่น หรือเข้าสู่ระบบ";
      }

      Alert.alert("สมัครสมาชิกไม่สำเร็จ", errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.backButton}
        onPress={() => navigation.goBack()}
      >
        <Icon name="arrow-left" size={24} color="#000" />
      </TouchableOpacity>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.stepIndicator}>
          {[1, 2, 3, 4].map((step) => (
            <View key={step} style={styles.circleContainer}>
              <View style={[styles.circle, step === 1 && styles.activeCircle]}>
                <Text style={step === 1 ? styles.activeText : styles.circleText}>
                  {step}
                </Text>
              </View>
              {step !== 4 && <View style={styles.line} />}
            </View>
          ))}
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>ชื่อร้านรับฝาก</Text>
          <Input
            value={storeName}
            onChangeText={setStoreName}
            containerStyle={styles.input}
            inputContainerStyle={styles.inputContainer}
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>ชื่อ (เจ้าของ)</Text>
          <Input
            value={firstName}
            onChangeText={setFirstName}
            containerStyle={styles.input}
            inputContainerStyle={styles.inputContainer}
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>นามสกุล (เจ้าของ)</Text>
          <Input
            value={lastName}
            onChangeText={setLastName}
            containerStyle={styles.input}
            inputContainerStyle={styles.inputContainer}
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>อีเมล</Text>
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
          <Text style={styles.inputLabel}>รหัสผ่าน</Text>
          <Input
            secureTextEntry
            value={password}
            onChangeText={setPassword}
            containerStyle={styles.input}
            inputContainerStyle={styles.inputContainer}
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>ยืนยันรหัสผ่าน</Text>
          <Input
            secureTextEntry
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            containerStyle={styles.input}
            inputContainerStyle={styles.inputContainer}
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>เบอร์โทรศัพท์</Text>
          <Input
            value={phone}
            onChangeText={setPhone}
            keyboardType="phone-pad"
            containerStyle={styles.input}
            inputContainerStyle={styles.inputContainer}
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>รหัสบัตรประชาชน</Text>
          <Input
            value={idCard}
            onChangeText={setIdCard}
            keyboardType="numeric"
            containerStyle={styles.input}
            inputContainerStyle={styles.inputContainer}
          />
        </View>

        <CheckBox
          title="ยินยอมให้เปิดเผยข้อมูลส่วนบุคคล"
          checked={agreed}
          onPress={() => setAgreed(!agreed)}
          containerStyle={styles.checkboxContainer}
          textStyle={styles.checkboxText}
        />

        <Button
          title={isLoading ? "กำลังดำเนินการ..." : "ถัดไป"}
          loading={isLoading}
          disabled={isLoading}
          buttonStyle={styles.signUpButton}
          onPress={handleSignUp}
        />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 30,
    paddingTop: 60,
  },
  scrollContent: {
    paddingBottom: 30,
  },
  backButton: {
    position: "absolute",
    top: 40,
    left: 20,
    zIndex: 10,
  },
  stepIndicator: {
    flexDirection: "row",
    justifyContent: "center",
    marginBottom: 20,
  },
  circleContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  circle: {
    width: 30,
    height: 30,
    borderRadius: 15,
    borderColor: "#ccc",
    borderWidth: 1,
    backgroundColor: "#fff",
    justifyContent: "center",
    alignItems: "center",
  },
  activeCircle: {
    backgroundColor: "#6FCF97",
    borderColor: "#6FCF97",
  },
  circleText: {
    color: "#000",
  },
  activeText: {
    color: "#fff",
    fontWeight: "bold",
  },
  line: {
    width: 20,
    height: 1,
    backgroundColor: "#ccc",
    marginHorizontal: 5,
  },
  inputGroup: {
    marginBottom: 0, // ปรับให้ห่างกันน้อยลง
  },
  inputLabel: {
    fontSize: 14,
    marginBottom: 3, // ลดช่องว่างระหว่าง label กับ input
    color: "#333",
    fontWeight: "500",
    marginLeft: 17,
  },
  input: {
    marginBottom: 0, // ลดช่องว่างระหว่างช่องกรอก
  },
  inputContainer: {
    borderBottomWidth: 1,
    backgroundColor: "#fff",
    borderRadius: 20,
    paddingHorizontal: 15,
    borderWidth: 1,
    borderColor: "#ccc",
  },
  checkboxContainer: {
    backgroundColor: "transparent",
    borderWidth: 0,
    padding: 0,
    margin: 0,
    marginTop: 5, // ห่างจากช่องกรอกเล็กน้อย
  },
  checkboxText: {
    fontSize: 14,
  },
  signUpButton: {
    backgroundColor: "#000",
    borderRadius: 30,
    paddingVertical: 12,
    marginTop: 15, // ห่างจาก checkbox พอดี
  },
});
