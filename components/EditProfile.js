import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, Image, Alert } from 'react-native';
import { getAuth } from 'firebase/auth';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '../Database/firebaseConfig';
import * as ImagePicker from 'expo-image-picker';

export default function EditProfile({ navigation }) {
  const [profileData, setProfileData] = useState({
    fullName: '',
    email: '',
    username: '',
    age: '',
    gender: '',
    phone: '',
    profileImage: '',
  });

  const auth = getAuth();
  const uid = auth.currentUser?.uid;

  useEffect(() => {
    const fetchData = async () => {
      if (uid) {
        const docRef = doc(db, 'users', uid);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setProfileData(docSnap.data());
        }
      }
    };

    fetchData();
  }, []);

  const handleUpdate = async () => {
    if (!uid) return;

    try {
      await updateDoc(doc(db, 'users', uid), profileData);
      Alert.alert('สำเร็จ', 'อัปเดตโปรไฟล์เรียบร้อยแล้ว');
      navigation.goBack();
    } catch (error) {
      Alert.alert('ผิดพลาด', 'ไม่สามารถอัปเดตข้อมูลได้');
      console.error(error);
    }
  };

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ImagePicker.MediaTypeOptions.Images, allowsEditing: true, quality: 1 });

    if (!result.canceled) {
      setProfileData({ ...profileData, profileImage: result.assets[0].uri });
    }
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={pickImage}>
        {profileData.profileImage ? (
          <Image source={{ uri: profileData.profileImage }} style={styles.avatar} />
        ) : (
          <View style={styles.avatar} />
        )}
      </TouchableOpacity>

      <TextInput
        placeholder="ชื่อ"
        style={styles.input}
        value={profileData.fullName}
        onChangeText={(text) => setProfileData({ ...profileData, fullName: text })}
      />
      <TextInput
        placeholder="Email"
        style={styles.input}
        value={profileData.email}
        editable={false}
      />
      <TextInput
        placeholder="Username"
        style={styles.input}
        value={profileData.username}
        onChangeText={(text) => setProfileData({ ...profileData, username: text })}
      />
      <TextInput
        placeholder="อายุ"
        style={styles.input}
        keyboardType="numeric"
        value={profileData.age}
        onChangeText={(text) => setProfileData({ ...profileData, age: text })}
      />
      <TextInput
        placeholder="เพศ"
        style={styles.input}
        value={profileData.gender}
        onChangeText={(text) => setProfileData({ ...profileData, gender: text })}
      />
      <TextInput
        placeholder="เบอร์โทรศัพท์"
        style={styles.input}
        keyboardType="phone-pad"
        value={profileData.phone}
        onChangeText={(text) => setProfileData({ ...profileData, phone: text })}
      />

      <TouchableOpacity style={styles.button} onPress={handleUpdate}>
        <Text style={styles.buttonText}>ยืนยัน</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#fff' },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#ccc',
    alignSelf: 'center',
    marginBottom: 20,
  },
  input: {
    backgroundColor: '#f2f2f7',
    borderRadius: 10,
    padding: 10,
    marginBottom: 15,
  },
  button: {
    backgroundColor: '#4CD964',
    padding: 15,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 10,
  },
  buttonText: { color: '#fff', fontWeight: 'bold' },
});
