import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  TextInput,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import Icon from "react-native-vector-icons/FontAwesome";
import { Button } from "react-native-elements";
import { db } from '../Database/firebaseConfig';
import { doc, updateDoc } from 'firebase/firestore';

export default function Step3_serve({ navigation, route }) {
  const [imageUri, setImageUri] = useState(null);
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);

  const { uid } = route.params; // ✅ รับ uid ที่ส่งมาจาก Sign1_serve

  const CLOUD_NAME = "dbr1wjrqt";
  const UPLOAD_PRESET = "My_Pic";

  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });

    if (!result.canceled) {
      setImageUri(result.assets[0].uri);
    }
  };

  const uploadToCloudinary = async (uri) => {
    const data = new FormData();
    data.append("file", {
      uri,
      type: "image/jpeg",
      name: "upload.jpg"
    });
    data.append("upload_preset", UPLOAD_PRESET);
    data.append("cloud_name", CLOUD_NAME);

    const response = await fetch(`https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`, {
      method: "POST",
      body: data,
    });

    const result = await response.json();
    return result.secure_url;
  };

  const handleNext = async () => {
    if (!imageUri) {
      alert("กรุณาอัปโหลดภาพสถานที่รับฝาก");
      return;
    }

    if (!description) {
      alert("กรุณากรอกคำอธิบายการรับฝาก");
      return;
    }

    try {
      setLoading(true);

      const imageUrl = await uploadToCloudinary(imageUri);

      const additionalData = {
        description: description,
        imageUrl: imageUrl,
      };

      // ✅ อัปเดต document เดิม
      await updateDoc(doc(db, "serve", uid), additionalData);

      navigation.navigate("Sign4_serve", { uid });

    } catch (error) {
      console.error("Error saving data: ", error);
      alert("เกิดข้อผิดพลาดในการอัปโหลดภาพ");
    } finally {
      setLoading(false);
    }
  };
  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 40 }}>
      <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
        <Icon name="arrow-left" size={24} color="#000" />
      </TouchableOpacity>

      <View style={styles.stepIndicator}>
        {[1, 2, 3, 4].map((step) => (
          <View key={step} style={styles.circleContainer}>
            <View
              style={[
                styles.circle,
                step < 3 && styles.passedCircle,
                step === 3 && styles.activeCircle,
              ]}
            >
              <Text
                style={
                  step === 3
                    ? styles.activeText
                    : step < 3
                    ? styles.passedText
                    : styles.circleText
                }
              >
                {step}
              </Text>
            </View>
            {step !== 4 && <View style={styles.line} />}
          </View>
        ))}
      </View>

      <Text style={styles.label}>อัปโหลดภาพสถานที่รับฝาก</Text>
      <TouchableOpacity style={styles.imageUploadBox} onPress={pickImage}>
        {imageUri ? (
          <Image source={{ uri: imageUri }} style={styles.imagePreview} />
        ) : (
          <Icon name="upload" size={40} color="#999" />
        )}
      </TouchableOpacity>

      <Text style={styles.label}>คำอธิบาย</Text>
      <TextInput
        style={styles.textArea}
        multiline
        numberOfLines={4}
        value={description}
        onChangeText={setDescription}
        placeholder="รายละเอียดเพิ่มเติม"
      />

      {loading ? (
        <ActivityIndicator size="large" color="#000" style={styles.loadingIndicator} />
      ) : (
        <Button
          title="ถัดไป"
          buttonStyle={styles.nextButton}
          onPress={handleNext}
        />
      )}
    </ScrollView>
  );
}



const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 30,
    paddingTop: 60,
  },
  backButton: {
    position: "static",
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
  passedCircle: {
    backgroundColor: "#000",
    borderColor: "#000",
  },
  circleText: {
    color: "#000",
  },
  activeText: {
    color: "#fff",
    fontWeight: "bold",
  },
  passedText: {
    color: "#fff",
  },
  line: {
    width: 20,
    height: 1,
    backgroundColor: "#ccc",
    marginHorizontal: 5,
  },
  label: {
    fontSize: 16,
    marginVertical: 4,
    fontWeight: "500",
    marginLeft: 12,
  },
  imageUploadBox: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 16,
    height: 160,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
    marginBottom: 20,
  },
  imagePreview: {
    width: "100%",
    height: "100%",
    borderRadius: 16,
    resizeMode: "cover",
  },
  textArea: {
    height: 120,
    borderColor: "#ccc",
    borderWidth: 1,
    borderRadius: 16,
    padding: 15,
    backgroundColor: "#fff",
    textAlignVertical: "top",
    marginBottom: 20,
  },
  nextButton: {
    backgroundColor: "#000",
    borderRadius: 30,
    paddingVertical: 12,
    marginTop: 10,
  },
  loadingIndicator: {
    marginTop: 20,
  },
});
