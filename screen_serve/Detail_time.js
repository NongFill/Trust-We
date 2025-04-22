import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, Platform, StyleSheet, Switch } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { getAuth } from 'firebase/auth';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '../Database/firebaseConfig';
import { useNavigation } from '@react-navigation/native';
import { Icon } from 'react-native-elements';

export default function Detail_time() {
  const [openTime, setOpenTime] = useState(new Date());
  const [closeTime, setCloseTime] = useState(new Date());
  const [showPicker, setShowPicker] = useState(false);
  const [pickerType, setPickerType] = useState('open');
  const [toggleTime, setToggleTime] = useState(null);
  const [storeStatus, setStoreStatus] = useState('close');
  const auth = getAuth();
  const navigation = useNavigation();

  useEffect(() => {
    const fetchUserData = async () => {
      const user = auth.currentUser;
      if (!user) return;

      const userRef = doc(db, 'serve', user.uid);
      const userDoc = await getDoc(userRef);

      if (userDoc.exists()) {
        const data = userDoc.data();
        if (data.openHour) setOpenTime(new Date(`1970-01-01T${data.openHour}:00`));
        if (data.closeHour) setCloseTime(new Date(`1970-01-01T${data.closeHour}:00`));
        if (data.toggleTime) setToggleTime(data.toggleTime);
        if (data.storeStatus) setStoreStatus(data.storeStatus);
      }
    };
    fetchUserData();
  }, []);

  const handleTimeChange = async (event, selectedDate) => {
    setShowPicker(false);
    if (event.type === 'dismissed' || !selectedDate) return;

    const timeString = selectedDate.toTimeString().slice(0, 5);
    const userRef = doc(db, 'serve', auth.currentUser.uid);
    const currentTime = new Date().toISOString();

    try {
      if (pickerType === 'open') {
        setOpenTime(selectedDate);
        await updateDoc(userRef, { openHour: timeString });
      } else {
        setCloseTime(selectedDate);
        await updateDoc(userRef, { closeHour: timeString });
      }
      await updateDoc(userRef, { toggleTime: currentTime });
      setToggleTime(currentTime);
      console.log(`ตั้งค่า ${pickerType === 'open' ? 'เวลาเปิด' : 'เวลาปิด'}: ${timeString}`);
    } catch (error) {
      console.error('Error updating time:', error);
    }
  };

  const handleToggleStoreStatus = async () => {
    const userRef = doc(db, 'serve', auth.currentUser.uid);
    const newStatus = storeStatus === 'open' ? 'close' : 'open';
    const currentTime = new Date().toISOString();

    try {
      if (newStatus === 'open') {
        const now = new Date();
        const openTimeStr = now.toTimeString().slice(0, 5);

        await updateDoc(userRef, {
          storeStatus: newStatus,
          openHour: openTimeStr,
          toggleTime: currentTime
        });

        setOpenTime(now);
        console.log(`เปิดร้าน | ตั้งเวลาเปิด: ${openTimeStr}`);
      } else {
        await updateDoc(userRef, {
          storeStatus: newStatus,
          toggleTime: currentTime
        });
        console.log(`ปิดร้าน`);
      }
      setStoreStatus(newStatus);
      setToggleTime(currentTime);
    } catch (error) {
      console.error('Error updating shop status:', error);
    }
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
        <Icon name="arrow-back" type="material" color="#000" size={30} />
      </TouchableOpacity>

      <View style={styles.content}>
        <Text style={styles.shopStatusTitle}>สถานะร้าน</Text>

        <View style={styles.statusRow}>

          <View style={styles.iconAndTextRow}>
            {storeStatus === 'open' ? (
              <Icon name="check-circle" type="font-awesome" color="#00b894" size={80} />
            ) : (
              <Icon name="times-circle" type="font-awesome" color="#FF4D4D" size={80} />
            )}
            <Text style={styles.shopStatusText1}>{storeStatus === 'open' ? 'เปิด' : 'ปิด'}</Text>
          </View>
            <View style={styles.separator} />
          <View style={styles.switchRow}>
            <Text
              style={[
                styles.shopStatusText2,
                { color: storeStatus === 'open' ? '#00b894' : '#FF4D4D' }
              ]}
            >
              {storeStatus === 'open' ? 'เปิดร้าน' : 'ปิดร้าน'}
            </Text>
            <Switch
              value={storeStatus === 'open'}
              onValueChange={handleToggleStoreStatus}
              trackColor={{ false: '#ccc', true: '#4cd137' }}
              thumbColor={
                Platform.OS === 'android'
                  ? storeStatus === 'open'
                    ? '#00b894'
                    : '#888'
                  : undefined
              }
            />
          </View>
        </View>

           <View style={styles.separator} />

        <Text style={[styles.title, { marginTop: 30 }]}>ตั้งค่าเวลาเปิด-ปิดรับฝาก</Text>


        <View style={styles.timeBox}>
          <Text style={styles.subTitle}>ตั้งเวลาทำการ</Text>
          <View style={styles.timeButtonContainer}>
            <TouchableOpacity
              style={styles.timeButton}
              onPress={() => {
                setPickerType('open');
                setShowPicker(true);
              }}
            >
              <Text style={styles.timeText}>{openTime.toTimeString().slice(0, 5)}</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.timeButton}
              onPress={() => {
                setPickerType('close');
                setShowPicker(true);
              }}
            >
              <Text style={styles.timeText}>{closeTime.toTimeString().slice(0, 5)}</Text>
            </TouchableOpacity>
          </View>
        </View>

        {toggleTime && (
          <Text style={styles.updatedText}>
            อัปเดตล่าสุด: {new Date(toggleTime).toLocaleString('th-TH')}
          </Text>
        )}

        {showPicker && (
          <DateTimePicker
            value={pickerType === 'open' ? openTime : closeTime}
            mode="time"
            is24Hour={true}
            display={Platform.OS === 'ios' ? 'spinner' : 'default'}
            onChange={handleTimeChange}
          />
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#fff' },
  backButton: { position: 'absolute', top: 40, left: 20, zIndex: 1 },
  content: { marginTop: 50 },
  shopStatusTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
    top: -30,
    textAlign: 'center'
  },
  statusRow: {
    marginBottom: 20
  },
  iconAndTextRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    marginLeft : 30
  },
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 70,
    marginTop: 20,
  }, 
  shopStatusText1: {
    fontSize: 50,
    fontWeight: 'bold',
    marginLeft: 10,
    textAlign: 'center',
    left:20
  },
  shopStatusText2: {
    fontSize: 20,
    fontWeight: 'bold',
    marginLeft: 90,
    right: 100,
    marginTop: 9,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#000',
    textAlign: 'center'

  },
  subTitle: { fontSize: 16, fontWeight: '500', color: '#000', marginBottom: 10 , textAlign: 'center'},
  timeBox: {
    padding: 15,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#ddd',
    backgroundColor: '#fafafa'
  },
  timeButtonContainer: { flexDirection: 'row', justifyContent: 'space-between' },
  timeButton: {
    flex: 1,
    backgroundColor: '#e6e6e6',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginHorizontal: 5
  },
  timeText: { fontSize: 16, fontWeight: 'bold', color: '#333' },
  updatedText: { marginTop: 10, fontSize: 14, color: '#666', textAlign: 'center' },
  separator: {
    width: "auto",
    height: '2',
    backgroundColor: '#ccc',
    marginHorizontal: 1
  }
});
