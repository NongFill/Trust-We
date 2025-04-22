import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, ActivityIndicator, TouchableOpacity } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { getFirestore, collection, getDocs } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { app } from '../../Database/firebaseConfig';
import { Icon } from 'react-native-elements';
import { useNavigation } from '@react-navigation/native';
import { LineChart } from 'react-native-chart-kit';
import { Dimensions } from 'react-native';
import moment from 'moment';
import 'moment/locale/th';

moment.locale('th');

export default function Detail_Money() {
  const [totalSales, setTotalSales] = useState(0);
  const [salesData, setSalesData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState('week');
  const db = getFirestore(app);
  const user = getAuth(app).currentUser;
  const navigation = useNavigation();

  useEffect(() => {
    const fetchSalesData = async () => {
      if (!user) return;
      try {
        const historyRef = collection(db, 'serve', user.uid, 'history');
        const querySnapshot = await getDocs(historyRef);
        let total = 0;
        let rawData = [];

        querySnapshot.forEach((doc) => {
          const data = doc.data();
          if (data.totalPrice && data.createdAt) {
            total += parseFloat(data.totalPrice);
            rawData.push({
              totalPrice: parseFloat(data.totalPrice),
              createdAt: data.createdAt.toDate(),
              userId: data.userId,
            });
          }
        });

        setTotalSales(total);
        setSalesData(rawData);
      } catch (error) {
        console.error("Error fetching sales data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchSalesData();
  }, [user]);

  const transformData = (type) => {
    const grouped = {};
    const now = new Date();
    let startDate;

    if (type === 'week') {
      startDate = moment().startOf('day').subtract(6, 'days');
      for (let i = 0; i < 7; i++) {
        const date = startDate.clone().add(i, 'days').format('YYYY-MM-DD');
        grouped[date] = 0;
      }
      salesData.forEach(({ totalPrice, createdAt }) => {
        const formattedDate = moment(createdAt).format('YYYY-MM-DD');
        if (grouped.hasOwnProperty(formattedDate)) {
          grouped[formattedDate] += totalPrice;
        }
      });
      return Object.keys(grouped).map(date => ({ label: moment(date).format('D'), total: grouped[date] }));
    } else if (type === 'month') {
      const currentMonth = now.getMonth();
      const currentYear = now.getFullYear();
      salesData.forEach(({ totalPrice, createdAt }) => {
        if (createdAt.getFullYear() === currentYear && createdAt.getMonth() === currentMonth) {
          const day = createdAt.getDate();
          grouped[day] = (grouped[day] || 0) + totalPrice;
        }
      });
      return Object.keys(grouped)
        .sort((a, b) => parseInt(a) - parseInt(b))
        .map(day => ({ label: `${parseInt(day)}`, total: grouped[day] }));
    } else if (type === 'year') {
      const currentYear = now.getFullYear();
      salesData.forEach(({ totalPrice, createdAt }) => {
        if (createdAt.getFullYear() === currentYear) {
          const monthNumber = createdAt.getMonth() + 1;
          grouped[monthNumber] = (grouped[monthNumber] || 0) + totalPrice;
        }
      });
      return Object.keys(grouped)
        .sort((a, b) => parseInt(a) - parseInt(b))
        .map(month => ({ label: `${month}`, total: grouped[month] }));
    }
    return [];
  };

  const getChartData = () => {
    const transformedData = transformData(selectedPeriod);
    return {
      labels: transformedData.map((data) => data.label),
      datasets: [
        {
          data: transformedData.map((data) => data.total),
        },
      ],
    };
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
        <Icon name="arrow-back" type="material" size={30} color="#333" />
      </TouchableOpacity>

      {loading ? (
        <ActivityIndicator size="large" color="#4cd964" />
      ) : (
        <>
          <Text style={styles.title}>สรุปการเงิน</Text>
          <View style={styles.summary}>
            <Text style={styles.title1}>สรุปยอดขายรวม</Text>
            <Text style={styles.total}>฿ {totalSales.toFixed(2)}</Text>
          </View>
          
          {/* ปุ่มสำหรับเลือกช่วงเวลา */}
          <View style={styles.pickerContainer}>
            <Text style={styles.graphTitle}>เลือกช่วงเวลา</Text>
            <Picker
              selectedValue={selectedPeriod}
              style={styles.picker}
              onValueChange={(itemValue) => setSelectedPeriod(itemValue)}
            >
              <Picker.Item label="รายสัปดาห์" value="week" />
              <Picker.Item label="รายเดือน" value="month" />
              <Picker.Item label="รายปี" value="year" />
            </Picker>
          </View>

          {/* แสดงกราฟ */}
          <Text style={styles.graphTitle}>กราฟยอดขาย</Text>
          <LineChart
            data={getChartData()}
            width={Dimensions.get('window').width - 40}
            height={220}
            yAxisLabel="฿"
            chartConfig={{
              backgroundColor: '#fff',
              backgroundGradientFrom: '#fff',
              backgroundGradientTo: '#fff',
              decimalPlaces: 2,
              color: (opacity = 1) => `rgba(0, 204, 0, ${opacity})`,
              labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
              style: {
                borderRadius: 16,
              },
              propsForDots: {
                r: '6',
                strokeWidth: '2',
                stroke: '#fff',
              },
            }}
            bezier
          />
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 50,
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  backButton: {
    position: 'absolute',
    top: 50,
    left: 20,
    zIndex: 10,
    padding: 5,
  },
  summary: {
    padding: 20,
    borderRadius: 10,
    marginBottom: 4,
    borderWidth: 0.4,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  title1: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
    marginTop: 20,
  },
  total: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#4cd964',
  },
  graphTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 30,
    marginBottom: 10,
  },
  pickerContainer: {
    width: '100%',
    marginBottom: 20,
  },
  picker: {
    height: 50,
    width: '100%',
  },
  weekInfo: {
    marginTop: 20,
  },
  weekItem: {
    marginVertical: 5,
    backgroundColor: '#f9f9f9',
    padding: 10,
    borderRadius: 8,
  },
});