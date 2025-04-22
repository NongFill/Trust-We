import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View, FlatList, TouchableOpacity } from 'react-native';
import { getFirestore, collection, getDocs } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { app } from '../../Database/firebaseConfig';
import { useNavigation } from '@react-navigation/native';
import { Icon } from 'react-native-elements';

export default function Detail_History() {
  const [historyOrders, setHistoryOrders] = useState([]);
  const db = getFirestore(app);
  const user = getAuth(app).currentUser;
  const navigation = useNavigation();  // Hook สำหรับการนำทาง

  useEffect(() => {
    const fetchHistory = async () => {
      if (!user) return;
      try {
        const querySnapshot = await getDocs(collection(db, 'serve', user.uid, 'history'));
        const orders = [];
        querySnapshot.forEach((doc) => {
          orders.push({ id: doc.id, ...doc.data() });
        });
        setHistoryOrders(orders);
      } catch (error) {
        console.error('Error fetching history:', error);
      }
    };

    fetchHistory();
  }, [user]);

  const formatDate = (timestamp) => {
    if (!timestamp) return 'ไม่ระบุวันที่';
    const date = timestamp.toDate();
    return `${date.getDate().toString().padStart(2, '0')}/` +
           `${(date.getMonth() + 1).toString().padStart(2, '0')}/` +
           `${date.getFullYear()} เวลา ` +
           `${date.getHours().toString().padStart(2, '0')}:` +
           `${date.getMinutes().toString().padStart(2, '0')}`;
  };

  return (
    <View style={styles.wrapper}>
      <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
        <Icon name="arrow-back" type="material" size={30} color="#333" />
      </TouchableOpacity>
      <Text style={styles.title}>ประวัติการฝาก</Text>
      <FlatList
        contentContainerStyle={styles.container}
        data={historyOrders}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Text style={styles.text}>ชื่อผู้ฝาก: {item.customerName}</Text>
            <Text style={styles.text}>หมายเลขออเดอร์: {item.orderId}</Text>
            <Text style={styles.text}>เบอร์โทร: {item.phone}</Text>
            <Text style={styles.text}>จำนวน: {item.quantity} ชิ้น</Text>
            <Text style={styles.text}>ราคาทั้งหมด: {item.totalPrice} บาท</Text>
            <Text style={styles.text}>วันที่: {formatDate(item.createdAt)}</Text>
            <Text style={styles.status}>สถานะ: {item.status}</Text>
          </View>
        )}
        ListEmptyComponent={<Text style={styles.empty}>ยังไม่มีรายการประวัติคำสั่งซื้อ</Text>}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { flex: 1, backgroundColor: '#fff' },
  backButton: {
    position: 'absolute',
    top: 40,
    left: 20,
    zIndex: 1,
  },
  container: { padding: 20 , flex: 1 , marginTop: 30},
  card: { backgroundColor: '#e0ffe0', padding: 15, borderRadius: 10, marginBottom: 15 },
  text: { fontSize: 16, marginBottom: 5, color: '#333' },
  status: { fontSize: 16, fontWeight: 'bold', color: 'green', marginTop: 5 },
  empty: { textAlign: 'center', marginTop: 20, fontSize: 16 },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
    left: 140,
    top: 40,
  },
});
