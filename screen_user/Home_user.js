import React, { useRef, useState, useCallback, useEffect } from 'react';
import { View, Text, StyleSheet, Dimensions, TextInput, TouchableOpacity, Image, Linking, ScrollView } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import { Ionicons } from '@expo/vector-icons';
import { collection, onSnapshot } from 'firebase/firestore';
import { db } from '../Database/firebaseConfig';
import { Modalize } from 'react-native-modalize';
import * as Location from 'expo-location';

export default function Home_user({ navigation, route }) {
  const [selectedMarker, setSelectedMarker] = useState(null);
  const [markers, setMarkers] = useState([]);
  const [region, setRegion] = useState(null);
  const [userLocation, setUserLocation] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const modalizeRef = useRef(null);

  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        console.log('Permission to access location was denied');
        return;
      }
      const location = await Location.getCurrentPositionAsync({});
      const current = { latitude: location.coords.latitude, longitude: location.coords.longitude };
      setUserLocation(current);
      setRegion({ ...current, latitudeDelta: 0.01, longitudeDelta: 0.01 });

      const locationWatcher = await Location.watchPositionAsync(
        { accuracy: Location.Accuracy.High, timeInterval: 5000, distanceInterval: 10 },
        (loc) => setUserLocation({ latitude: loc.coords.latitude, longitude: loc.coords.longitude })
      );

      return () => locationWatcher.remove();
    })();
  }, []);

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, 'serve'), (querySnapshot) => {
      const locations = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        const loc = data.location;
        if (loc?.latitude && loc?.longitude) {
          locations.push({
            id: doc.id,
            title: data.storeName || 'ไม่มีชื่อร้าน',
            coordinate: { latitude: loc.latitude, longitude: loc.longitude },
            image: data.imageUrl || 'https://via.placeholder.com/300',
            rating: data.rating || 4.5,
            reviews: data.reviews || 10,
            description: data.description || '',
            address: data.address || {},
            hours: data.hours || '',
            phone: data.phone || '',
            mapUrl: data.mapUrl || '',
            storeStatus: data.storeStatus || 'closed',
          });
        }
      });
      setMarkers(locations);
    }, (error) => console.error('เกิดข้อผิดพลาดในการโหลด marker:', error));

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (route.params?.latitude && route.params?.longitude) {
      setRegion({
        latitude: route.params.latitude,
        longitude: route.params.longitude,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      });
    }
  }, [route.params]);

  const handleMarkerPress = useCallback((marker) => {
    setSelectedMarker(marker);
    modalizeRef.current?.open();
  }, []);

  const renderAddress = (addressObj) => {
    if (!addressObj) return null;
    const parts = [addressObj.houseNo, addressObj.alley, addressObj.road, addressObj.subDistrict, addressObj.district, addressObj.province, addressObj.postalCode].filter(Boolean);
    return parts.length > 0 ? parts.join(' ') : 'ไม่มีข้อมูลที่อยู่';
  };

  const handleZoom = (type) => {
    setRegion((prev) => {
      if (!prev) return prev;
      const factor = type === 'in' ? 0.5 : 2;
      return { ...prev, latitudeDelta: prev.latitudeDelta * factor, longitudeDelta: prev.longitudeDelta * factor };
    });
  };

  const handleLocationSearch = async () => {
    if (!searchQuery.trim()) return;
    try {
      const geocode = await Location.geocodeAsync(searchQuery);
      if (geocode.length > 0) {
        const { latitude, longitude } = geocode[0];
        setRegion({ latitude, longitude, latitudeDelta: 0.01, longitudeDelta: 0.01 });
      } else alert('ไม่พบสถานที่');
    } catch (error) {
      console.log('Error finding location:', error);
    }
  };

  const goToMyLocation = () => {
    if (userLocation) {
      setRegion({ ...userLocation, latitudeDelta: 0.01, longitudeDelta: 0.01 });
    }
  };

  const renderStoreStatus = (status) => status === 'open' ? (
    <Text style={[styles.status, { color: '#0f0' }]}>เปิดอยู่</Text>
  ) : (
    <Text style={[styles.status, { color: 'red' }]}>ปิดอยู่</Text>
  );

  return (
    <View style={styles.container}>
      {region && (
        <MapView style={styles.map} region={region} onRegionChangeComplete={setRegion}>
          {userLocation && (
            <Marker coordinate={userLocation} title="ตำแหน่งของคุณ">
              <Ionicons name="person" size={30} color="#007AFF" />
            </Marker>
          )}
          {markers.map((marker) => (
            <Marker key={marker.id} coordinate={marker.coordinate} onPress={() => handleMarkerPress(marker)} />
          ))}
        </MapView>
      )}

      <View style={styles.searchBar}>
        <TouchableOpacity onPress={() => navigation.openDrawer()}>
          <Ionicons name="menu" size={24} color="black" style={{ marginRight: 10 }} />
        </TouchableOpacity>
        <TextInput
          placeholder="ค้นหาสถานที่"
          style={styles.input}
          value={searchQuery}
          onChangeText={setSearchQuery}
          onSubmitEditing={handleLocationSearch}
        />
        <TouchableOpacity onPress={handleLocationSearch}>
          <Ionicons name="search" size={22} color="black" style={{ marginLeft: 10 }} />
        </TouchableOpacity>
      </View>

      <View style={styles.zoomContainer}>
        <TouchableOpacity style={styles.zoomButton} onPress={() => handleZoom('in')}>
          <Text style={styles.zoomText}>+</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.zoomButton} onPress={() => handleZoom('out')}>
          <Text style={styles.zoomText}>-</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.zoomButton} onPress={goToMyLocation}>
          <Ionicons name="locate" size={20} color="#000" />
        </TouchableOpacity>
      </View>

      <Modalize ref={modalizeRef} adjustToContentHeight handlePosition="inside" modalStyle={styles.sheetContent}>
        {selectedMarker && (
          <ScrollView style={{ padding: 20 }}>
            <Image source={{ uri: selectedMarker.image }} style={styles.sheetImage} />
            <Text style={styles.sheetTitle}>{selectedMarker.title}</Text>
            {selectedMarker.description ? <Text style={styles.sheetDescription}>{selectedMarker.description}</Text> : null}
            <Text style={styles.infoText}>📍 {renderAddress(selectedMarker.address)}</Text>
            {selectedMarker.hours ? <Text style={styles.infoText}>🕒 {selectedMarker.hours}</Text> : null}
            {selectedMarker.phone ? <Text style={styles.infoText}>📞 {selectedMarker.phone}</Text> : null}
            <View style={styles.row}>
              <Text style={styles.star}>⭐</Text>
              <Text style={styles.rating}>{selectedMarker.rating} ({selectedMarker.reviews})</Text>
            </View>
            {renderStoreStatus(selectedMarker.storeStatus)}
            <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('Class', { marker: selectedMarker })}>
              <Text style={styles.buttonText}>ฝากของ</Text>
            </TouchableOpacity>
            {selectedMarker.mapUrl && (
              <TouchableOpacity style={[styles.button, { backgroundColor: '#2979FF', marginTop: 10 }]} onPress={() => Linking.openURL(selectedMarker.mapUrl)}>
                <Text style={styles.buttonText}>เปิดแผนที่</Text>
              </TouchableOpacity>
            )}
          </ScrollView>
        )}
      </Modalize>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  map: { width: Dimensions.get('window').width, height: Dimensions.get('window').height },
  searchBar: {
    position: 'absolute',
    top: 50,
    left: 20,
    right: 20,
    flexDirection: 'row',
    backgroundColor: '#fff',
    padding: 10,
    borderRadius: 10,
    elevation: 3,
    alignItems: 'center',
  },
  input: { flex: 1 },
  zoomContainer: { position: 'absolute', bottom: 80, right: 10, alignItems: 'center' },
  zoomButton: {
    backgroundColor: '#fff',
    borderRadius: 5,
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
    elevation: 2,
  },
  zoomText: { fontSize: 18, fontWeight: 'bold', color: '#000' },
  sheetContent: { backgroundColor: '#000', borderTopLeftRadius: 20, borderTopRightRadius: 20 },
  sheetImage: { width: '100%', height: 180, borderRadius: 12, marginBottom: 12 },
  sheetTitle: { fontSize: 20, fontWeight: 'bold', color: '#fff', marginBottom: 6 },
  sheetDescription: { fontSize: 14, color: '#ccc', marginBottom: 10 },
  infoText: { color: '#ccc', marginBottom: 4 },
  row: { flexDirection: 'row', alignItems: 'center', marginVertical: 4 },
  star: { color: '#FFD700', fontSize: 18 },
  rating: { color: '#fff', marginLeft: 6 },
  status: { marginBottom: 15, fontWeight: 'bold', fontSize: 16 },
  button: { backgroundColor: '#00E676', padding: 12, borderRadius: 6, alignItems: 'center', marginVertical: 5 },
  buttonText: { color: '#fff', fontWeight: 'bold' },
});
