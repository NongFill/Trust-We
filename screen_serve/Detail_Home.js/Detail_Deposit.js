import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View, FlatList, ActivityIndicator, TouchableOpacity, Alert } from 'react-native';
import { getFirestore, collection, doc, updateDoc, setDoc, deleteDoc, onSnapshot } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { app } from '../../Database/firebaseConfig';
import { Icon } from 'react-native-elements';
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
      message = `คุณต้องการจะรับออเดอร์นี้หรือไม่?
      \nชื่อผู้ฝาก: ${order.customerName}
      \nหมายเลขออเดอร์: ${order.orderId}`;
      confirmAction = async () => {
        try {
          const serveOrderRef = doc(db, 'serve', user.uid, 'orders', order.id);
          const userOrderRef = doc(db, 'users', order.userId, 'orders', order.id);

          await updateDoc(serveOrderRef, { status: 'รอรับฝากจากลูกค้า' });
          await updateDoc(userOrderRef, { status: 'อนุมัติการฝาก' });

          Alert.alert("ทำการสำเร็จ", "อัปเดตสถานะการรับฝากเรียบร้อยแล้ว");
        } catch (error) {
          console.error("Error updating order status:", error);
          Alert.alert("เกิดข้อผิดพลาด", "ไม่สามารถอัปเดตสถานะได้");
        }
      };
    } else if (order.status === "รอรับฝากจากลูกค้า") {
      message = `ยืนยันว่าคำสั่งซื้อนี้ได้รับฝากเรียบร้อยแล้ว?`;
      confirmAction = async () => {
        try {
          const serveOrderRef = doc(db, 'serve', user.uid, 'orders', order.id);
          const userOrderRef = doc(db, 'users', order.userId, 'orders', order.id);

          await updateDoc(serveOrderRef, { status: 'รอคืนของกับลูกค้า' });
          await updateDoc(userOrderRef, { status: 'รอไปรับของที่ร้าน' });

          Alert.alert("สำเร็จ", "อัปเดตสถานะเรียบร้อยแล้ว");
        } catch (error) {
          console.error("Error updating order status:", error);
          Alert.alert("เกิดข้อผิดพลาด", "ไม่สามารถอัปเดตสถานะได้");
        }
      };
    } else if (order.status === "รอคืนของกับลูกค้า") {
      message = `ถ้าคุณแน่ใจว่าดำเนินการทุกอย่างเสร็จสิ้น และคำสั่งซื้อจะถูกย้ายไปยังประวัติทันที`;
      confirmAction = async () => {
        try {
          const serveOrderRef = doc(db, 'serve', user.uid, 'orders', order.id);
          const userOrderRef = doc(db, 'users', order.userId, 'orders', order.id);
          const serveHistoryRef = doc(db, 'serve', user.uid, 'history', order.id);
          const userHistoryRef = doc(db, 'users', order.userId, 'history', order.id);

          await setDoc(userHistoryRef, { ...order, status: 'ดำเนินการเสร็จสิ้น' });
          await setDoc(serveHistoryRef, { ...order, status: 'ดำเนินการเสร็จสิ้น' });
          
          await deleteDoc(serveOrderRef);
          await deleteDoc(userOrderRef);

          setOrders((prev) => prev.filter(item => item.id !== order.id));
          Alert.alert("สำเร็จ", "อัปเดตสถานะและย้ายไปยังประวัติแล้ว");
        } catch (error) {
          console.error("Error finalizing order:", error);
          Alert.alert("เกิดข้อผิดพลาด", "ไม่สามารถดำเนินการได้");
        }
      };
    } else {
      Alert.alert("ไม่สามารถดำเนินการได้", `คำสั่งซื้อสถานะ: ${order.status}`);
      return;
    }

    Alert.alert("ยืนยันการทำรายการ", message, [
      { text: "ยกเลิก", style: "cancel" },
      { text: "ตกลง", onPress: confirmAction }
    ]);
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
        <Icon name="arrow-back" type="material" size={30} color="#333" />
      </TouchableOpacity>
      <Text style={styles.title}>รายการของฝาก</Text>
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
  wrapper: { flex: 1, backgroundColor: '#fff' ,paddingTop: 40},
  container: { padding: 20, flexGrow: 1 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },

  backText: { fontSize: 16, marginLeft: 8, color: '#333' },
  card: {
    backgroundColor: '#f1f1f1',
    padding: 15,
    borderRadius: 10,
    marginBottom: 15
  },
  text: { fontSize: 16, marginBottom: 5, color: '#333' },
  status: { fontSize: 16, fontWeight: 'bold', color: '#007aff', marginTop: 5 },
  empty: { textAlign: 'center', marginTop: 30, fontSize: 14 },
  backButton: {
    position: 'absolute',
    top: 40,
    left: 20,
    zIndex: 1,
  },
   title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
    left: 135,
  },
});
