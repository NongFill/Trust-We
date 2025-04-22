import React, { useEffect, useState, useRef } from 'react';
import { StyleSheet, Text, View, FlatList, ActivityIndicator, TouchableOpacity, Button, ScrollView, Linking, Platform } from 'react-native';
import { getFirestore, collection, doc, onSnapshot } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { app } from '../Database/firebaseConfig';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';

export default function Product_details_user() {
  const [orders, setOrders] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const db = getFirestore(app);
  const user = getAuth(app).currentUser;
  const navigation = useNavigation();
  const unsubscribeRef = useRef(null);

  useEffect(() => {
    if (!user) return;

    const unsubscribe = onSnapshot(
      collection(db, 'users', user.uid, 'orders'),
      (querySnapshot) => {
        const orderList = [];
        querySnapshot.forEach((doc) => {
          orderList.push({ id: doc.id, ...doc.data() });
        });
        orderList.sort((a, b) => {
          if (a.status === 'อนุมัติการฝาก' && b.status !== 'อนุมัติการฝาก') return -1;
          if (a.status !== 'อนุมัติการฝาก' && b.status === 'อนุมัติการฝาก') return 1;
          return b.createdAt.seconds - a.createdAt.seconds;
        });
        setOrders(orderList);
        setLoading(false);
      },
      (error) => {
        console.error('Error fetching orders:', error);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [user]);

  const fetchOrderDetails = (orderId) => {
    setLoading(true);
    const orderRef = doc(db, 'users', user.uid, 'orders', orderId);
    const unsubscribe = onSnapshot(
      orderRef,
      (docSnap) => {
        if (docSnap.exists()) {
          setSelectedOrder(docSnap.data());
        }
        setLoading(false);
      },
      (error) => {
        console.error('Error loading order details:', error);
        setLoading(false);
      }
    );
    return unsubscribe;
  };

  const formatDate = (timestamp) => {
    if (!timestamp || !timestamp.toDate) return '-';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleString('th-TH', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatAddress = (address) => {
    if (!address) return '-';
    return `${address.building || ''} ${address.alley || ''} ${address.road || ''}\nแขวง/ตำบล ${address.subDistrict || ''} เขต/อำเภอ ${address.district || ''}\nจังหวัด ${address.province || ''} ${address.postalCode || ''}`;
  };

  const handleNavigate = (latitude, longitude) => {
    const destination = `${latitude},${longitude}`;
    let url = '';

    if (Platform.OS === 'ios') {
      url = `http://maps.apple.com/?daddr=${destination}&dirflg=d`;
    } else {
      url = `https://www.google.com/maps/dir/?api=1&destination=${destination}&travelmode=driving`;
    }

    Linking.openURL(url).catch(err => console.error('Error opening maps', err));
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#4cd964" />
      </View>
    );
  }

  if (!selectedOrder) {
    return (
      <View style={{ flex: 1 }}>
        <TouchableOpacity
          style={styles.backIcon}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color="black" />
        </TouchableOpacity>

        <FlatList
          contentContainerStyle={styles.flatListContainer}
          data={orders}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.orderItem}
              onPress={() => {
                if (unsubscribeRef.current) unsubscribeRef.current();
                unsubscribeRef.current = fetchOrderDetails(item.id);
              }}
            >
              <Text style={styles.text}>ร้าน: {item.storeName}</Text>
              <Text style={styles.subText}>หมายเลขออเดอร์: {item.orderId}</Text>
              <Text style={styles.subText}>ราคารวม: {item.totalPrice} บาท</Text>
              <Text style={styles.subText}>วันที่ฝาก: {formatDate(item.createdAt)}</Text>
              <Text style={styles.subText}>ชั่วโมงฝาก: {item.hours} ชั่วโมง</Text>
              <Text style={[styles.status, { color: item.status === 'อนุมัติการฝาก' ? 'green' : (item.status === 'รอดำเนินการ' ? 'blue' : 'black') }]}>สถานะ: {item.status}</Text>
            </TouchableOpacity>
          )}
          ListEmptyComponent={<Text style={styles.empty}>ไม่มีคำสั่งซื้อ</Text>}
        />
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.header}>รายละเอียดคำสั่งซื้อ</Text>
      <View style={styles.receiptBox}>
        <Text style={styles.label}>สถานะ:</Text>
        <Text style={[styles.value, { color: selectedOrder?.status === 'อนุมัติการฝาก' ? 'green' : (selectedOrder?.status === 'รอไปรับของที่ร้าน' ? 'blue' : 'black') }]}>{selectedOrder?.status || '-'}</Text>
        <Text style={styles.label}>หมายเลขออเดอร์:</Text>
        <Text style={styles.value}>{selectedOrder?.orderId || '-'}</Text>
        <Text style={styles.label}>ชื่อร้าน:</Text>
        <Text style={styles.value}>{selectedOrder?.storeName || '-'}</Text>
        <Text style={styles.label}>ชื่อผู้ฝาก:</Text>
        <Text style={styles.value}>{selectedOrder?.customerName || '-'}</Text>
        <Text style={styles.label}>ประเภทสัมภาระ:</Text>
        <Text style={styles.value}>{selectedOrder?.selectedType || '-'}</Text>
        <Text style={styles.label}>จำนวน:</Text>
        <Text style={styles.value}>{selectedOrder?.quantity}</Text>
        <Text style={styles.label}>ที่อยู่ผู้ฝาก:</Text>
        <Text style={styles.value}>{formatAddress(selectedOrder?.address)}</Text>
        <Text style={styles.label}>ราคาทั้งหมด:</Text>
        <Text style={styles.value}>{selectedOrder?.totalPrice} บาท</Text>
        <Text style={styles.label}>วันที่และเวลา:</Text>
        <Text style={styles.value}>{formatDate(selectedOrder?.createdAt)}</Text>

        <View style={styles.buttonRow}>
          <View style={styles.buttonWrapper}>
            <Button title="กลับ" onPress={() => setSelectedOrder(null)} />
          </View>
          {(selectedOrder?.status === 'อนุมัติการฝาก' || selectedOrder?.status === 'รอไปรับของที่ร้าน') && (
            <View style={styles.buttonWrapper}>
              <Button
                title="นำทาง"
                color="#4cd964"
                onPress={() => {
                  if (selectedOrder?.latitude && selectedOrder?.longitude) {
                    handleNavigate(selectedOrder.latitude, selectedOrder.longitude);
                  } else {
                    alert('ร้านค้านี้ไม่มีข้อมูลตำแหน่งนำทาง');
                  }
                }}
              />
            </View>
          )}
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20, flexGrow: 1 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: { fontSize: 24, fontWeight: 'bold', marginBottom: 20 },
  receiptBox: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 6,
    marginBottom: 20,
  },
  label: { fontSize: 16, fontWeight: 'bold', marginBottom: 5 },
  value: { fontSize: 16, marginBottom: 15, color: '#333' },
  orderItem: { backgroundColor: 'white', padding: 15, borderRadius: 10, marginBottom: 10 },
  text: { fontSize: 18, fontWeight: 'bold' },
  subText: { fontSize: 16, color: '#555' },
  status: { fontSize: 16, marginTop: 10 },
  empty: { textAlign: 'center', fontSize: 16, color: '#777' },
  buttonRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 20 },
  buttonWrapper: { flex: 1, marginHorizontal: 5 },
  backIcon: {
    position: 'absolute',
    top: 40,
    left: 20,
    zIndex: 1,
    backgroundColor: '#fff',
    borderRadius: 50,
    padding: 5,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 6,
  },
  flatListContainer: { paddingTop: 80, paddingHorizontal: 20, paddingBottom: 20 },
});
