import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, TextInput, Alert, Linking } from 'react-native';
import { Icon } from 'react-native-elements';

export default function TrueMoneyPaymentScreen({ navigation }) {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    const subscription = Linking.addEventListener('url', handleOpenURL);
    return () => subscription.remove();
  }, []);

  const handleOpenURL = (event) => {
    const url = event.url;
    if (url.includes('payment-callback')) {
      Alert.alert('สำเร็จ', 'ชำระเงินผ่าน TrueMoney เสร็จสิ้น!');
      navigation.navigate('PaymentSuccess');
    }
  };

  const handlePayment = async () => {
    if (!phoneNumber || phoneNumber.length !== 10) {
      Alert.alert('ข้อผิดพลาด', 'กรุณากรอกเบอร์ TrueMoney ให้ถูกต้อง');
      return;
    }
    setIsProcessing(true);

    try {
      const response = await fetch('http://your-server-url/create-charge', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phoneNumber: phoneNumber,
          amount: 10000, // ตัวอย่าง 100 บาท
        }),
      });

      const data = await response.json();
      if (data.authorize_uri) {
        Linking.openURL(data.authorize_uri);
      } else {
        Alert.alert('ไม่สำเร็จ', 'ไม่สามารถสร้างรายการได้');
      }
    } catch (error) {
      Alert.alert('ข้อผิดพลาด', error.message);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
        <Icon name="arrow-back" type="material" size={28} color="#333" />
      </TouchableOpacity>
      <Text style={styles.header}>ชำระเงินผ่าน TrueMoney Wallet</Text>
      <View style={styles.inputContainer}>
        <Text style={styles.label}>กรอกเบอร์โทรศัพท์:</Text>
        <TextInput
          placeholder="เช่น 0912345678"
          keyboardType="phone-pad"
          maxLength={10}
          value={phoneNumber}
          onChangeText={setPhoneNumber}
          style={styles.input}
        />
      </View>
      <TouchableOpacity
        style={[styles.confirmButton, isProcessing && { opacity: 0.5 }]}
        onPress={handlePayment}
        disabled={isProcessing}
      >
        <Text style={styles.confirmText}>{isProcessing ? 'กำลังดำเนินการ...' : 'ดำเนินการชำระเงิน'}</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', paddingHorizontal: 20, paddingTop: 50 },
  backButton: { position: 'absolute', top: 50, left: 20, zIndex: 10 },
  header: { fontSize: 20, fontWeight: 'bold', marginTop: 20, marginBottom: 30, alignSelf: 'center', color: '#333' },
  inputContainer: { marginBottom: 30 },
  label: { fontSize: 16, marginBottom: 10, color: '#333' },
  input: { borderWidth: 1.5, borderColor: '#ccc', borderRadius: 12, paddingHorizontal: 15, paddingVertical: 10, fontSize: 16 },
  confirmButton: { backgroundColor: '#4cd964', borderRadius: 20, paddingVertical: 14, alignItems: 'center' },
  confirmText: { color: '#000', fontSize: 16, fontWeight: 'bold' },
});
