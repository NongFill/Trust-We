import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View, FlatList, ActivityIndicator, TouchableOpacity, Alert } from 'react-native';
import { getFirestore, collection, doc, updateDoc, setDoc, deleteDoc, onSnapshot } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { app } from '../../Database/firebaseConfig';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native';

export default function Detail_Deposit() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const db = getFirestore(app);
  const user = getAuth(app).currentUser;
  const navigation = useNavigation();

  const formatDate = (timestamp) => {
    if (!timestamp) return 'ไม่ระบุวันที่';
    const date = timestamp.toDate();
    return `${date.getDate().toString().padStart(2, '0')}/` +
           `${(date.getMonth() + 1).toString().padStart(2, '0')}/` +
           `${date.getFullYear()} เวลา ` +
           `${date.getHours().toString().padStart(2, '0')}:` +
           `${date.getMinutes().toString().padStart(2, '0')}`;
  };

  const handleAcceptOrder = (order) => {
    let message = '';
    let confirmAction = null;

    if (!order.status || order.status === "รอดำเนินการ") {
      message = `คุณต้องการจะรับออเดอร์นี้หรือไม่?\n\nชื่อผู้ฝาก: ${order.customerName}\nหมายเลขออเดอร์: ${order.orderId}`;
      confirmAction = async () => {
        try {
          const serveOrderRef = doc(db, 'serve', user.uid, 'orders', order.id);
          const userOrderRef = doc(db, 'users', order.userId, 'orders', order.id);

          await updateDoc(serveOrderRef, { status: 'รอรับฝากจากลูกค้า' });
          await updateDoc(userOrderRef, { status: 'อนุมัติการฝาก' });

          Alert.alert("สำเร็จ", "อัปเดตสถานะเรียบร้อยแล้ว");
        } catch (error) {
          console.error("Error updating order status:", error);
          Alert.alert("เกิดข้อผิดพลาด", "ไม่สามารถอัปเดตสถานะได้");
        }
      };
    } else if (order.status === "รอรับฝากจากลูกค้า") {
      message = `ต้องการย้ายคำสั่งซื้อนี้ไปยังประวัติและเปลี่ยนสถานะเป็น 'ดำเนินการเสร็จสิ้น' หรือไม่?`;
      confirmAction = async () => {
        try {
          const serveOrderRef = doc(db, 'serve', user.uid, 'orders', order.id);
          const historyRef = doc(db, 'serve', user.uid, 'history', order.id);
          const orderData = { ...order, status: 'ดำเนินการเสร็จสิ้น' };
          delete orderData.id;

          await updateDoc(serveOrderRef, { status: 'ดำเนินการเสร็จสิ้น' });
          await setDoc(historyRef, orderData);
          await deleteDoc(serveOrderRef);

          Alert.alert("สำเร็จ", "ย้ายคำสั่งซื้อไปยังประวัติแล้ว");
          setOrders(prev => prev.filter(item => item.id !== order.id));
        } catch (error) {
          console.error("Error moving order to history:", error);
          Alert.alert("เกิดข้อผิดพลาด", "ไม่สามารถย้ายข้อมูลได้");
        }
      };
    } else {
      Alert.alert("ไม่สามารถดำเนินการได้", `คำสั่งซื้อสถานะ: ${order.status}`);
      return;
    }

    Alert.alert(
      "ยืนยันการทำรายการ",
      message,
      [
        { text: "ยกเลิก", style: "cancel" },
        { text: "ตกลง", onPress: confirmAction }
      ]
    );
  };

  useEffect(() => {
    if (!user) return;

    const ordersRef = collection(db, 'serve', user.uid, 'orders');
    const unsubscribe = onSnapshot(ordersRef, (snapshot) => {
      const orderList = [];
      snapshot.forEach((doc) => {
        orderList.push({ id: doc.id, ...doc.data() });
      });
      orderList.sort((a, b) => {
        if (!a.createdAt || !b.createdAt) return 0;
        return a.createdAt.toDate() - b.createdAt.toDate();
      });
      setOrders(orderList);
      setLoading(false);
    }, (error) => {
      console.error('Error fetching real-time orders:', error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user]);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#4cd964" />
      </View>
    );
  }

  return (
    <View style={styles.wrapper}>
      <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
        <Ionicons name="arrow-back" size={24} color="#333" />
        <Text style={styles.backText}>ย้อนกลับ</Text>
      </TouchableOpacity>

      <FlatList
        contentContainerStyle={styles.container}
        data={orders}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity onPress={() => handleAcceptOrder(item)}>
            <View style={styles.card}>
              <Text style={styles.text}>ชื่อผู้ฝาก: {item.customerName}</Text>
              <Text style={styles.text}>หมายเลขออเดอร์: {item.orderId}</Text>
              <Text style={styles.text}>เบอร์โทร: {item.phone}</Text>
              <Text style={styles.text}>จำนวน: {item.quantity} ชิ้น</Text>
              <Text style={styles.text}>ราคาทั้งหมด: {item.totalPrice} บาท</Text>
              <Text style={styles.text}>วันที่: {formatDate(item.createdAt)}</Text>
              <Text style={styles.status}>สถานะ: {item.status ? item.status : 'รอดำเนินการ'}</Text>
            </View>
          </TouchableOpacity>
        )}
        ListEmptyComponent={<Text style={styles.empty}>ไม่มีประวัติคำสั่งซื้อ</Text>}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { flex: 1, backgroundColor: '#fff' },
  container: { padding: 20, flexGrow: 1 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    backgroundColor: '#f5f5f5',
    borderBottomWidth: 1,
    borderBottomColor: '#ddd'
  },
  backText: { fontSize: 16, marginLeft: 8, color: '#333' },
  card: {
    backgroundColor: '#f1f1f1',
    padding: 15,
    borderRadius: 10,
    marginBottom: 15
  },
  text: { fontSize: 16, marginBottom: 5, color: '#333' },
  status: { fontSize: 16, fontWeight: 'bold', color: '#007aff', marginTop: 5 },
  empty: { textAlign: 'center', marginTop: 20, fontSize: 16 }
});
