import React, { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, ActivityIndicator, View, TouchableOpacity } from 'react-native';
import { Avatar, Card, Text, Icon, Button } from 'react-native-elements';
import { doc, onSnapshot, collection, getDocs } from 'firebase/firestore';
import { db } from '../Database/firebaseConfig';
import { getAuth, signOut } from 'firebase/auth';
import { useNavigation } from '@react-navigation/native';

const HomeScreen = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const auth = getAuth();
  const navigation = useNavigation();

  useEffect(() => {
    const user = auth.currentUser;
    if (!user) return;

    const userRef = doc(db, 'serve', user.uid);
    const unsubscribe = onSnapshot(
      userRef,
      (docSnapshot) => {
        if (docSnapshot.exists()) {
          const docData = docSnapshot.data();
          setData(docData);
          setLoading(false);
        } else {
          setData(null);
          setLoading(false);
        }
      },
      (error) => {
        console.error('Error fetching real-time data:', error);
        setLoading(false);
      }
    );

    const fetchTotalFromHistory = async () => {
      try {
        const historyRef = collection(db, 'serve', user.uid, 'history');
        const querySnapshot = await getDocs(historyRef);
        let total = 0;
        querySnapshot.forEach(doc => {
          const item = doc.data();
          if (item.totalPrice) {
            total += Number(item.totalPrice);
          }
        });
        setData(prev => ({ ...prev, totalAmount: total }));
      } catch (error) {
        console.error('Error calculating total from history:', error);
      }
    };

    fetchTotalFromHistory();

    return () => unsubscribe();
  }, [auth]);

  const formatTime = (timeStr) => {
    if (!timeStr) return '-';
    const [hour, minute] = timeStr.split(":");
    const date = new Date();
    date.setHours(Number(hour), Number(minute));
    return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
  };

  if (loading) return <ActivityIndicator size="large" color="#00b894" style={{ marginTop: 40 }} />;
  if (!data) return <Text style={{ textAlign: 'center', marginTop: 40 }}>No data available</Text>;

  const cardBox1Color = data.storeStatus === 'open' ? '#00D57F' : '#FF4D4D';

  return (
    <View style={{ flex: 1 }}>
      <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
        <View style={styles.headerContainer}>
          <Avatar
            rounded
            size="large"
            source={{ uri: data.imageUrl }}
            containerStyle={styles.avatar}
          />
          <View style={styles.nameContainer}>
            <Text h4 style={styles.headerTitle}>{data.firstName} {data.lastName}</Text>
            <View style={styles.provinceContainer}>
              <Icon name="map-marker" type="font-awesome" color="#666" size={16} containerStyle={{ marginRight: 5 }} />
              <Text style={styles.headerSubtitle}>{data.address?.province}</Text>
            </View>
          </View>
        </View>

        <Card containerStyle={{ ...styles.cardBox1, backgroundColor: cardBox1Color }}>
          <View style={styles.timeSection}>
            <View style={styles.timeRow}>
              <Text style={styles.timeLabel}>
                {data.storeStatus === 'open'
                  ? `เปิดรับฝาก (${formatTime(data.openHour)} - ${formatTime(data.closeHour)})`
                  : 'ปิดร้าน'}
              </Text>
              <Button
                title="ปรับแต่ง"
                buttonStyle={styles.adjustButton}
                titleStyle={styles.adjustButtonText}
                onPress={() => navigation.navigate('Detail_time')}
              />
            </View>
          </View>

          <Card containerStyle={styles.cardBox2}>
            <Card containerStyle={styles.cardBox2_inside}>
              <View style={styles.depositSection}>
                <Text style={styles.depositLabel}>ยอดรับฝาก</Text>
                <Text style={styles.depositAmount}>฿ {Number(data.totalAmount || 0).toLocaleString()}</Text>
              </View>

              <View style={styles.divider} />
              <View style={styles.statsContainer}>
                <View style={styles.statsRow}>
                  <Text style={styles.statsLabel}>คุณภาพในการรับฝากสัปดาห์ก่อน</Text>
                </View>
                <View style={styles.statsTable}>
                  <View style={styles.tableRow}>
                    <Text style={styles.tableCell}>ยอดเยี่ยม</Text>
                    <Text style={styles.tableCell}>รายได้สุทธิต่อสัปดาห์: ฿ {data.weeklyIncome || 0}</Text>
                    <Text style={styles.tableCell}>ยอดรับฝากต่อสัปดาห์: {data.weeklyDeposits || 0}</Text>
                  </View>
                </View>
              </View>
            </Card>

            <View style={styles.divider} />
            <View style={styles.menuContainer}>
              <TouchableOpacity style={styles.menuItem} onPress={() => navigation.navigate('Promote')}>
                <Icon name="tag" type="font-awesome" color="#000" />
                <Text style={styles.menuText}>โปรโมทธุรกิจ</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.menuItem} onPress={() => navigation.navigate('Detail_Money')}>
                <Icon name="money" type="font-awesome" color="#000" />
                <Text style={styles.menuText}>การเงิน</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.menuItem} onPress={() => navigation.navigate('Detail_Deposit')}>
                <Icon name="book" type="font-awesome" color="#000" />
                <Text style={styles.menuText}>ของฝาก</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.menuItem} onPress={() => navigation.navigate('Detail_History')}>
                <Icon name="history" type="font-awesome" color="#000" />
                <Text style={styles.menuText}>ประวัติ</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.menuItem} onPress={() => navigation.navigate('HelpCenter')}>
                <Icon name="question-circle" type="font-awesome" color="#000" />
                <Text style={styles.menuText}>ศูนย์ช่วยเหลือ</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.menuItem}
                onPress={async () => {
                  try {
                    await signOut(auth);
                    navigation.reset({ index: 0, routes: [{ name: 'Login_user' }] });
                  } catch (error) {
                    console.error('Error signing out:', error);
                  }
                }}>
                <Icon name="sign-out" type="font-awesome" color="#000" />
                <Text style={styles.menuText}>ออกจากระบบ</Text>
              </TouchableOpacity>
            </View>
          </Card>
        </Card>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  contentContainer: { padding: 20, paddingTop: 50, paddingBottom: 30 },
  headerContainer: { flexDirection: 'row', alignItems: 'center', marginBottom: 1 },
  avatar: { marginRight: 25 },
  nameContainer: { flex: 1 },
  headerTitle: { fontWeight: 'bold', fontSize: 29, marginBottom: 2 },
  provinceContainer: { flexDirection: 'row', alignItems: 'center' },
  headerSubtitle: { color: '#666', fontSize: 16 },
  cardBox1: { height: '110%', width: '111%', borderRadius: 15, paddingVertical: 15, paddingHorizontal: 15, marginLeft: -20 },
  cardBox2: { height: '110%', width: '111%', borderRadius: 15, paddingVertical: 15, paddingHorizontal: 15, marginLeft: -20, marginTop: -5 },
  cardBox2_inside: { width: '100%', borderRadius: 10, backgroundColor: '#fff', elevation: 2, padding: 15, marginLeft: -1, marginTop: -5 },
  timeSection: { marginBottom: 15 },
  timeRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  timeLabel: { fontSize: 16, color: '#000000' },
  adjustButton: { backgroundColor: '#fff', borderColor: '#fff', borderWidth: 1, paddingHorizontal: 15, paddingVertical: 5 },
  adjustButtonText: { color: '#000', fontSize: 14 },
  depositSection: { marginBottom: 20 },
  depositLabel: { fontSize: 16, color: '#666' },
  depositAmount: { fontSize: 32, fontWeight: 'bold', color: '#000' },
  divider: { height: 1, backgroundColor: '#ddd', marginVertical: 20 },
  statsContainer: { marginBottom: 20 },
  statsRow: { marginBottom: 10 },
  statsLabel: { fontSize: 16, fontWeight: 'bold' },
  statsTable: { borderWidth: 1, borderColor: '#ddd', borderRadius: 5 },
  tableRow: { flexDirection: 'column', padding: 10 },
  tableCell: { fontSize: 14, marginVertical: 5 },
  menuContainer: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', marginTop: 10 },
  menuItem: { width: '30%', alignItems: 'center', marginBottom: 20, backgroundColor: '#fff', paddingVertical: 15, borderRadius: 15, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 5, elevation: 3 },
  menuText: { marginTop: 8, fontSize: 14, textAlign: 'center', color: '#000', fontWeight: '500' },
});

export default HomeScreen;