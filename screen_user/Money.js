import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, ActivityIndicator } from 'react-native';
import { getFirestore, doc, getDoc, setDoc } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { app } from '../Database/firebaseConfig';

const db = getFirestore(app);
const auth = getAuth(app);

export default function MoneyScreen({ route, navigation }) {
  const { totalPrice, selectedType, quantity, hours, selectedMethod, storeId } = route.params;
  const [orderId, setOrderId] = useState('');
  const [storeInfo, setStoreInfo] = useState(null);
  const [loading, setLoading] = useState(true);

  const methodLabels = {
    truemoney: 'ทรูมันนี่วอลเล็ท',
    promptpay: 'PromptPay (QR Code)',
    cash: 'เงินสด',
    credit: 'บัตรเครดิต/เดบิต',
  };

  useEffect(() => {
    const generateOrderId = () => {
      const randomNum = Math.floor(100000 + Math.random() * 900000);
      const date = new Date();
      const datePart = `${date.getFullYear()}${(date.getMonth() + 1).toString().padStart(2, '0')}${date.getDate().toString().padStart(2, '0')}`;
      return `ORD-${datePart}-${randomNum}`;
    };
    setOrderId(generateOrderId());
  }, []);

  useEffect(() => {
    const fetchStoreData = async () => {
      try {
        const docRef = doc(db, 'serve', storeId);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setStoreInfo(docSnap.data());
        } else {
          setStoreInfo(null);
        }
      } catch (error) {
        console.error('Error fetching store info:', error);
        setStoreInfo(null);
      } finally {
        setLoading(false);
      }
    };
    fetchStoreData();
  }, [storeId]);

  useEffect(() => {
    const saveReceiptToFirestore = async () => {
      const currentUser = auth.currentUser;
      if (!orderId || !storeInfo || !currentUser) return;

      try {
        const userDoc = await getDoc(doc(db, 'users', currentUser.uid));
        const userData = userDoc.exists() ? userDoc.data() : null;
        const customerName = userData?.fullName || userData?.displayName || '-';
        const phone = userData?.phone || currentUser.phoneNumber || '-';

        const receiptData = {
          orderId: orderId,
          userId: currentUser.uid,
          customerName: customerName,
          storeId: storeId,
          storeName: storeInfo?.storeName || '-',
          address: storeInfo?.address || '-',
          latitude: storeInfo?.location?.latitude || null,
          longitude: storeInfo?.location?.longitude || null,
          selectedType,
          quantity,
          hours,
          selectedMethod: methodLabels[selectedMethod],
          totalPrice,
          status: 'รอดำเนินการ',
          createdAt: new Date(),
        };

        const storeSideData = {
          orderId: orderId,
          customerName: customerName,
          quantity: quantity,
          totalPrice: totalPrice,
          phone: phone,
          userId: currentUser.uid,
          latitude: storeInfo?.location?.latitude || null,
          longitude: storeInfo?.location?.longitude || null,
          createdAt: new Date(),
        };

        await setDoc(doc(db, 'users', currentUser.uid, 'orders', orderId), receiptData);
        await setDoc(doc(db, 'serve', storeId, 'orders', orderId), storeSideData);

        console.log('ใบเสร็จถูกบันทึกสำเร็จทั้งฝั่งลูกค้าและร้าน!');
      } catch (error) {
        console.error('เกิดข้อผิดพลาดในการบันทึกใบเสร็จ:', error);
      }
    };

    if (!loading && orderId) {
      saveReceiptToFirestore();
    }
  }, [loading, orderId, storeInfo]);

  if (!orderId || loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#4cd964" />
      </View>
    );
  }

  const renderStoreName = () => storeInfo?.storeName || '-';

  const renderAddress = () => {
    if (!storeInfo?.address) return '-';
    const addr = storeInfo.address;
    return `${addr.houseNo} ${addr.alley} ${addr.road}\nแขวง/ตำบล ${addr.subDistrict} เขต/อำเภอ ${addr.district}\nจังหวัด ${addr.province} ${addr.postalCode}`;
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>ใบเสร็จการชำระเงิน</Text>

      <View style={styles.receiptBox}>
        <Text style={styles.label}>หมายเลขออเดอร์:</Text>
        <Text style={styles.value}>{orderId}</Text>

        <Text style={styles.label}>ร้าน:</Text>
        <Text style={styles.value}>{renderStoreName()}</Text>

        <Text style={styles.label}>ที่อยู่ร้าน:</Text>
        <Text style={styles.value}>{renderAddress()}</Text>

        <Text style={styles.label}>ประเภทสัมภาระ:</Text>
        <Text style={styles.value}>{selectedType}</Text>

        <Text style={styles.label}>จำนวน:</Text>
        <Text style={styles.value}>{quantity} ชิ้น</Text>

        <Text style={styles.label}>ระยะเวลา:</Text>
        <Text style={styles.value}>{hours} ชั่วโมง</Text>

        <Text style={styles.label}>ช่องทางการชำระเงิน:</Text>
        <Text style={styles.value}>{methodLabels[selectedMethod]}</Text>

        <Text style={styles.label}>ราคาทั้งหมด:</Text>
        <Text style={styles.total}>{totalPrice} บาท</Text>
      </View>

      <TouchableOpacity
        style={styles.doneButton}
        onPress={() => navigation.navigate('Home_user')}
      >
        <Text style={styles.doneText}>เสร็จสิ้น</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    paddingHorizontal: 20,
    justifyContent: 'center',
  },
  header: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 30,
    alignSelf: 'center',
    color: '#333',
  },
  receiptBox: {
    backgroundColor: '#f9f9f9',
    borderRadius: 12,
    padding: 20,
    marginBottom: 30,
  },
  label: {
    fontSize: 14,
    color: '#666',
  },
  value: {
    fontSize: 16,
    color: '#000',
    marginBottom: 10,
  },
  total: {
    fontSize: 18,
    color: '#000',
    fontWeight: 'bold',
    marginTop: 10,
  },
  doneButton: {
    backgroundColor: '#4cd964',
    borderRadius: 20,
    paddingVertical: 14,
    alignItems: 'center',
  },
  doneText: {
    color: '#000',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
