import React, { useState, useEffect } from "react";
import {
  View,
  StyleSheet,
  Text,
  TouchableOpacity,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView
} from "react-native";
import { Input, Button } from "react-native-elements";
import Icon from "react-native-vector-icons/FontAwesome";
import { db } from "../Database/firebaseConfig";
import { doc, updateDoc } from "firebase/firestore";
import MapView, { Marker } from "react-native-maps";
import * as Location from "expo-location";

export default function Step2_serve({ navigation, route }) {
  const { uid } = route.params;

  const [address, setAddress] = useState({
    houseNo: "",
    building: "",
    road: "",
    alley: "",
    province: "",
    district: "",
    subDistrict: "",
    postalCode: ""
  });

  const [region, setRegion] = useState({
    latitude: 15.8700,
    longitude: 100.9925,
    latitudeDelta: 8.5,
    longitudeDelta: 8.5
  });

  const [marker, setMarker] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");

  const getCurrentLocation = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        Alert.alert("Permission Denied", "We need location permissions to proceed.");
        return;
      }
      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High
      });
      const { latitude, longitude } = location.coords;
      const initialRegion = {
        latitude,
        longitude,
        latitudeDelta: 0.005,
        longitudeDelta: 0.005
      };
      setRegion(initialRegion);
      setMarker({ latitude, longitude });
      getAddressFromCoords(latitude, longitude);
    } catch (error) {
      console.error("Error getting location:", error);
      Alert.alert("Error", "Unable to get current location.");
    }
  };

  const getAddressFromCoords = async (lat, lon) => {
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json`,
        {
          headers: {
            "User-Agent": "ReactNativeAppStudentProject/1.0 (nattwutzazachunsamer@gmail.com)"
          }
        }
      );
      const data = await res.json();
      const addr = data.address;
      setAddress(prev => ({
        ...prev,
        road: addr.road || "",
        alley: addr.neighbourhood || "",
        province: addr.state || "",
        district: addr.county || "",
        subDistrict: addr.suburb || "",
        postalCode: addr.postcode || ""
      }));
    } catch (err) {
      console.error("Error fetching address:", err);
    }
  };

  const handleMapPress = e => {
    const { latitude, longitude } = e.nativeEvent.coordinate;
    setMarker({ latitude, longitude });
    getAddressFromCoords(latitude, longitude);
  };

  const handleSearch = async () => {
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?q=${searchQuery}&format=json`,
        {
          headers: {
            "User-Agent": "ReactNativeAppStudentProject/1.0 (nattwutzazachunsamer@gmail.com)"
          }
        }
      );
      const data = await res.json();
      if (data && data.length > 0) {
        const { lat, lon } = data[0];
        const latitude = parseFloat(lat);
        const longitude = parseFloat(lon);
        setMarker({ latitude, longitude });
        setRegion({
          latitude,
          longitude,
          latitudeDelta: 0.005,
          longitudeDelta: 0.005
        });
        getAddressFromCoords(latitude, longitude);
      } else {
        Alert.alert("ไม่พบที่อยู่", "ไม่สามารถค้นหาที่อยู่นี้ได้");
      }
    } catch (err) {
      console.error("Error searching address:", err);
      Alert.alert("ผิดพลาด", "ไม่สามารถค้นหาที่อยู่ได้");
    }
  };

  const handleChange = (field, value) => {
    setAddress({ ...address, [field]: value });
  };

  const handleNext = async () => {
    if (!address.houseNo || !address.province || !address.district || !address.subDistrict || !address.postalCode) {
      Alert.alert("แจ้งเตือน", "กรุณากรอกข้อมูลให้ครบถ้วน");
      return;
    }
    if (!marker) {
      Alert.alert("แจ้งเตือน", "กรุณาเลือกตำแหน่งบนแผนที่");
      return;
    }
    try {
      await updateDoc(doc(db, "serve", uid), {
        address,
        location: {
          latitude: marker.latitude,
          longitude: marker.longitude
        }
      });
      navigation.navigate("Sign3_serve", { uid });
    } catch (error) {
      console.error("Error saving address:", error);
      Alert.alert("ผิดพลาด", "ไม่สามารถบันทึกที่อยู่ได้");
    }
  };

  useEffect(() => {
    getCurrentLocation();
  }, []);

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === "ios" ? "padding" : undefined}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Icon name="arrow-left" size={24} color="#000" />
        </TouchableOpacity>

        <View style={styles.stepIndicator}>
          {[1, 2, 3, 4].map(step => (
            <View key={step} style={styles.circleContainer}>
              <View style={[
                styles.circle,
                step === 2 && styles.activeCircle,
                step < 2 && styles.passedCircle
              ]}>
                <Text style={step === 2 ? styles.activeText : step < 2 ? styles.passedText : styles.circleText}>
                  {step}
                </Text>
              </View>
              {step !== 4 && <View style={styles.line} />}
            </View>
          ))}
        </View>

        {region && (
          <View>
            <MapView style={styles.map} region={region} onPress={handleMapPress}>
              {marker && <Marker coordinate={marker} />}
            </MapView>

            <View style={styles.zoomControls}>
              <TouchableOpacity
                style={styles.zoomButton}
                onPress={() => {
                  if (marker) {
                    setRegion(prev => ({
                      latitude: marker.latitude,
                      longitude: marker.longitude,
                      latitudeDelta: Math.max(prev.latitudeDelta / 2, 0.001),
                      longitudeDelta: Math.max(prev.longitudeDelta / 2, 0.001)
                    }));
                  }
                }}
              >
                <Text style={styles.zoomText}>+</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.zoomButton}
                onPress={() => {
                  if (marker) {
                    setRegion(prev => ({
                      latitude: marker.latitude,
                      longitude: marker.longitude,
                      latitudeDelta: Math.min(prev.latitudeDelta * 2, 20),
                      longitudeDelta: Math.min(prev.longitudeDelta * 2, 20)
                    }));
                  }
                }}
              >
                <Text style={styles.zoomText}>-</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        <View style={styles.searchContainer}>
          <Input
            placeholder="ค้นหาที่อยู่"
            value={searchQuery}
            onChangeText={setSearchQuery}
            containerStyle={styles.searchInputContainer}
            inputContainerStyle={styles.searchInputInner}
          />
          <TouchableOpacity style={styles.searchButtonNew} onPress={handleSearch}>
            <Text style={styles.searchButtonText}>ค้นหา</Text>
          </TouchableOpacity>
        </View>

        {[{label: "บ้านเลขที่", key: "houseNo"},
          {label: "ชื่ออาคาร/หมู่บ้าน (ถ้ามี)", key: "building"},
          {label: "ถนน (ถ้ามี)", key: "road"},
          {label: "ซอย (ถ้ามี)", key: "alley"},
          {label: "จังหวัด", key: "province"},
          {label: "เขต/อำเภอ", key: "district"},
          {label: "แขวง/ตำบล", key: "subDistrict"},
          {label: "รหัสไปรษณีย์", key: "postalCode", keyboardType: "numeric"}]
          .map(item => (
            <View key={item.key} style={{ marginBottom: -8 }}>
              <Text style={{ marginBottom: 3, marginLeft: 18, fontSize: 14, fontWeight: "500" }}>
                {item.label}
              </Text>
              <Input
                value={address[item.key]}
                keyboardType={item.keyboardType || "default"}
                onChangeText={value => handleChange(item.key, value)}
                containerStyle={styles.input}
                inputContainerStyle={styles.inputContainer}
              />
            </View>
          ))}

        <Button title="ถัดไป" buttonStyle={styles.nextButton} onPress={handleNext} />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 20,
    paddingTop: 40
  },
  backButton: {
    position: "static",
    left: 20,
    zIndex: 10
  },
  stepIndicator: {
    flexDirection: "row",
    justifyContent: "center",
    marginBottom: 30
  },
  circleContainer: {
    flexDirection: "row",
    alignItems: "center"
  },
  circle: {
    width: 30,
    height: 30,
    borderRadius: 15,
    borderColor: "#ccc",
    borderWidth: 1,
    backgroundColor: "#fff",
    justifyContent: "center",
    alignItems: "center"
  },
  activeCircle: {
    backgroundColor: "#6FCF97",
    borderColor: "#6FCF97"
  },
  passedCircle: {
    backgroundColor: "#000",
    borderColor: "#000"
  },
  circleText: {
    color: "#000"
  },
  activeText: {
    color: "#fff",
    fontWeight: "bold"
  },
  passedText: {
    color: "#fff"
  },
  line: {
    width: 20,
    height: 1,
    backgroundColor: "#ccc",
    marginHorizontal: 5
  },
  map: {
    height: 250,
    borderRadius: 25,
    marginBottom: 20
  },
  zoomControls: {
    position: "absolute",
    bottom: 35,
    right: 15,
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center"
  },
  zoomButton: {
    width: 20,
    height: 20,
    backgroundColor: "#000",
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
    marginVertical: 2
  },
  zoomText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "bold"
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "flex-start"
  },
  searchInputContainer: {
    flex: 1,
    marginRight: 10
  },
  searchInputInner: {
    borderBottomWidth: 1,
    backgroundColor: "#fff",
    borderRadius: 30,
    paddingHorizontal: 15,
    borderWidth: 1,
    borderColor: "#ccc"
  },
  searchButtonNew: {
    backgroundColor: "#000",
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 30,
    marginTop: 4,
    marginLeft: -10
  },
  searchButtonText: {
    color: "#fff",
    fontWeight: "bold"
  },
  input: {
    marginTop: 0,
    marginBottom: 0
  },
  inputContainer: {
    borderBottomWidth: 1,
    backgroundColor: "#fff",
    borderRadius: 30,
    paddingHorizontal: 15,
    borderWidth: 1,
    borderColor: "#ccc",
    marginTop: 1
  },
  nextButton: {
    backgroundColor: "#000",
    borderRadius: 30,
    paddingVertical: 12,
    marginTop: 10,
    marginBottom: 20
  }
});
