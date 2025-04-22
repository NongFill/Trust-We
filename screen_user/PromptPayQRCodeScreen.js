import React, { useState, useEffect } from 'react';
import { View, Text, Image, StyleSheet, ActivityIndicator, Alert } from 'react-native';

export default function PromptPayQRCodeScreen({ route }) {
  const { totalPrice } = route.params;   // รับราคาจากหน้า Class

  const [qrImage, setQrImage] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchQRCode = async () => {
      try {
        const response = await fetch(`https://qr-vercel-murex.vercel.app/api/generate-qr?amount=${totalPrice}`);  
        const data = await response.json();
        setQrImage(data.qrImage);
      } catch (error) {
        Alert.alert('ข้อผิดพลาด', 'ไม่สามารถโหลด QR Code ได้');
      } finally {
        setLoading(false);
      }
    };

    fetchQRCode();
  }, [totalPrice]);

  return (
    <View style={styles.container}>
      <Text style={styles.header}>สแกน QR PromptPay เพื่อชำระเงิน</Text>

      {loading ? (
        <ActivityIndicator size="large" color="#4cd964" />
      ) : qrImage ? (
        <Image source={{ uri: qrImage }} style={styles.qrImage} />
      ) : (
        <Text>ไม่พบ QR Code</Text>
      )}

      <Text style={styles.instruction}>หลังจากโอนเสร็จ ระบบจะตรวจสอบให้อัตโนมัติ</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex:1, justifyContent:'center', alignItems:'center', backgroundColor:'#fff', padding:20 },
  header: { fontSize:20, marginBottom:20, fontWeight:'bold' },
  qrImage: { width: 250, height: 250, marginBottom:20 },
  instruction: { fontSize:16, color:'#333', textAlign:'center' },
});
