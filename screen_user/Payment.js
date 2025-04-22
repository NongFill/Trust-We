import React, { useState } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Image, ScrollView, Alert } from 'react-native';
import { Icon } from 'react-native-elements';
import { useStripe } from '@stripe/stripe-react-native';

export default function PaymentScreen({ route, navigation }) {
  const { totalPrice, selectedType, quantity, hours, storeId } = route.params;
  const [selectedMethod, setSelectedMethod] = useState('truemoney');
  const { confirmPayment } = useStripe();

  const methods = [
    { key: 'truemoney', label: 'ทรูมันนี่', type: 'image', icon: require('../assets/Tm.png') },
    { key: 'promptpay', label: 'PromptPay (QR Code)', type: 'image', icon: require('../assets/Tm.png') },
    { key: 'cash', label: 'เงินสด', type: 'icon', iconName: 'cash', iconType: 'material-community' },
    { key: 'credit', label: 'บัตรเครดิต/เดบิต', type: 'image', icon: require('../assets/JCB.png'), isArrow: true },
  ];

  const handleConfirm = async () => {
    try {
      if (selectedMethod === 'truemoney') {
        navigation.navigate('TrueMoneyPaymentScreen', { 
          totalPrice, selectedMethod, selectedType, quantity, hours, storeId 
        });

      } else if (selectedMethod === 'promptpay') {
        navigation.navigate('PromptPayQRCodeScreen', { 
          totalPrice, selectedMethod, selectedType, quantity, hours, storeId 
        });

      } else if (selectedMethod === 'cash') {
        navigation.navigate('Money', { 
          selectedMethod, totalPrice, selectedType, quantity, hours, storeId 
        });

      } else if (selectedMethod === 'credit') {
        const response = await fetch('https://YOUR_CLOUD_FUNCTIONS_URL/createPaymentIntent', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ amount: totalPrice * 100, currency: 'thb' })
        });

        const { clientSecret } = await response.json();
        const { error, paymentIntent } = await confirmPayment(clientSecret, { paymentMethodType: 'Card' });

        if (error) {
          Alert.alert('เกิดข้อผิดพลาด', error.message);
        } else if (paymentIntent) {
          Alert.alert('ชำระเงินสำเร็จ', `สถานะ: ${paymentIntent.status}`);
          navigation.navigate('PaymentSummary', { 
            selectedMethod, totalPrice, selectedType, quantity, hours, storeId 
          });
        }
      }
    } catch (err) {
      console.error(err);
      Alert.alert('Error', 'ไม่สามารถดำเนินการได้');
    }
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
        <Icon name="arrow-back" type="material" size={28} color="#333" />
      </TouchableOpacity>

      <ScrollView contentContainerStyle={{ paddingBottom: 30 }}>
        <Text style={styles.header}>เลือกช่องทางการชำระเงิน</Text>

        {methods.map(method => (
          <TouchableOpacity
            key={method.key}
            style={[styles.paymentOption, selectedMethod === method.key && styles.selected]}
            onPress={() => setSelectedMethod(method.key)}
          >
            <View style={styles.row}>
              {method.type === 'image' ? (
                <Image source={method.icon} style={styles.icon} />
              ) : (
                <Icon
                  name={method.iconName}
                  type={method.iconType}
                  size={30}
                  color="#333"
                  containerStyle={{ marginRight: 12 }}
                />
              )}
              <View>
                <Text style={styles.label}>{method.label}</Text>
                {method.key === 'credit' && (
                  <View style={styles.cardList}>
                    <Image source={require('../assets/Vs.png')} style={styles.cardIcon} />
                    <Image source={require('../assets/Mc.png')} style={styles.cardIcon} />
                    <Image source={require('../assets/JCB.png')} style={styles.cardIcon} />
                    <Image source={require('../assets/Up.png')} style={styles.cardIcon} />
                  </View>
                )}
              </View>
            </View>

            {method.isArrow ? (
              <Text style={styles.arrow}>›</Text>
            ) : (
              <View style={selectedMethod === method.key ? styles.radioSelected : styles.radio} />
            )}
          </TouchableOpacity>
        ))}
      </ScrollView>

      <TouchableOpacity style={styles.confirmButton} onPress={handleConfirm}>
        <Text style={styles.confirmText}>ดำเนินการต่อ</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', paddingHorizontal: 20, paddingTop: 50 },
  backButton: { position: 'absolute', top: 50, left: 20, zIndex: 10 },
  header: { fontSize: 20, fontWeight: 'bold', marginBottom: 20, marginTop: 20, alignSelf: 'center', color: '#333' },
  paymentOption: {
    backgroundColor: '#f0f0f0',
    borderRadius: 12,
    padding: 15,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15
  },
  selected: { borderWidth: 1.5, borderColor: '#4cd964' },
  row: { flexDirection: 'row', alignItems: 'center' },
  icon: { width: 30, height: 30, marginRight: 12, resizeMode: 'contain' },
  label: { fontSize: 16, color: '#333' },
  radio: { width: 20, height: 20, borderRadius: 10, borderWidth: 1.5, borderColor: '#ccc' },
  radioSelected: { width: 20, height: 20, borderRadius: 10, borderWidth: 6, borderColor: '#4cd964' },
  arrow: { fontSize: 24, color: '#999' },
  confirmButton: { backgroundColor: '#4cd964', borderRadius: 20, paddingVertical: 14, alignItems: 'center', marginBottom: 10 },
  confirmText: { color: '#000', fontSize: 16, fontWeight: 'bold' },
  cardList: { flexDirection: 'row', marginTop: 5 },
  cardIcon: { width: 30, height: 20, marginRight: 5, resizeMode: 'contain' }
});
