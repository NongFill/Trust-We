import React, { useState } from 'react';
import { StyleSheet, Text, View, Image, TouchableOpacity, Dimensions, ScrollView } from 'react-native';

export default function Class({ route, navigation }) {
  const { marker } = route.params;
  const [selectedType, setSelectedType] = useState('small');
  const [quantity, setQuantity] = useState(1);
  const [hours, setHours] = useState(1);

  const prices = { large: 80, medium: 50, small: 30 };
  const totalPrice = prices[selectedType] * quantity * hours;

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={{ paddingBottom: 30 }}>
        <Image source={{ uri: marker.image }} style={styles.image} />
        <View style={styles.detailContainer}>
          <Text style={styles.title}>{marker.title}</Text>
          <View style={styles.row}>
            <Text style={styles.star}>⭐</Text>
            <Text style={styles.rating}>{marker.rating} ({marker.reviews})</Text>
          </View>

          <Text style={styles.sectionTitle}>เลือกประเภทสัมภาระ:</Text>
          <View style={styles.bagRow}>
            {['large', 'medium', 'small'].map(type => (
              <TouchableOpacity
                key={type}
                style={[styles.bagType, selectedType === type && styles.bagSelected]}
                onPress={() => setSelectedType(type)}>
                <Text style={styles.bagIcon}>{type === 'large' ? '🧳' : type === 'medium' ? '🎒' : '👜'}</Text>
                <Text style={styles.bagPrice}>{prices[type]}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text style={styles.sectionTitle}>เลือกจำนวนสัมภาระ:</Text>
          <View style={styles.quantityRow}>
            <TouchableOpacity onPress={() => setQuantity(prev => Math.max(prev - 1, 1))} style={styles.counterButton}>
              <Text style={styles.counterText}>-</Text>
            </TouchableOpacity>
            <Text style={styles.quantity}>{quantity}</Text>
            <TouchableOpacity onPress={() => setQuantity(prev => prev + 1)} style={styles.counterButton}>
              <Text style={styles.counterText}>+</Text>
            </TouchableOpacity>
          </View>

          <Text style={styles.sectionTitle}>เลือกระยะเวลาที่ฝาก (ชั่วโมง):</Text>
          <View style={styles.quantityRow}>
            <TouchableOpacity onPress={() => setHours(prev => Math.max(prev - 1, 1))} style={styles.counterButton}>
              <Text style={styles.counterText}>-</Text>
            </TouchableOpacity>
            <Text style={styles.quantity}>{hours} ชม.</Text>
            <TouchableOpacity onPress={() => setHours(prev => prev + 1)} style={styles.counterButton}>
              <Text style={styles.counterText}>+</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.priceRow}>
            <Text style={styles.totalText}>คำนวนราคา</Text>
            <Text style={styles.totalPrice}>{totalPrice} บาท</Text>
          </View>

          <TouchableOpacity
            style={styles.confirmButton}
            onPress={() => navigation.navigate('Payment', { totalPrice, selectedType, quantity, hours , storeId: marker.id , })}
          >
            <Text style={styles.confirmText}>ดำเนินการต่อ</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

const { width } = Dimensions.get('window');
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  image: { width, height: 220 },
  detailContainer: { backgroundColor: '#1e1e1e', borderTopLeftRadius: 30, borderTopRightRadius: 30, marginTop: -30, padding: 20, minHeight: 400 },
  title: { fontSize: 22, fontWeight: 'bold', color: '#fff', marginBottom: 6 },
  row: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
  star: { color: '#00E676', fontSize: 18 },
  rating: { color: '#fff', marginLeft: 6 },
  sectionTitle: { color: '#aaa', marginTop: 20, marginBottom: 8, fontSize: 14 },
  bagRow: { flexDirection: 'row', justifyContent: 'space-between' },
  bagType: { width: '30%', aspectRatio: 1, backgroundColor: '#333', borderRadius: 15, justifyContent: 'center', alignItems: 'center' },
  bagSelected: { backgroundColor: '#00E676' },
  bagIcon: { fontSize: 30, marginBottom: 10 },
  bagPrice: { fontSize: 16, color: '#fff' },
  quantityRow: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginVertical: 10 },
  counterButton: { backgroundColor: '#00E676', borderRadius: 50, width: 40, height: 40, justifyContent: 'center', alignItems: 'center' },
  counterText: { fontSize: 20, color: '#000' },
  quantity: { fontSize: 18, color: '#fff', marginHorizontal: 20 },
  priceRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 20, borderTopWidth: 1, borderTopColor: '#333', paddingTop: 10 },
  totalText: { color: '#fff', fontSize: 16 },
  totalPrice: { color: '#fff', fontSize: 16 },
  confirmButton: { marginTop: 20, backgroundColor: '#00E676', padding: 14, borderRadius: 50, alignItems: 'center' },
  confirmText: { fontSize: 16, fontWeight: 'bold', color: '#000' }
});
