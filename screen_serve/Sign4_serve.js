import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Button } from 'react-native-elements';
import { useNavigation } from '@react-navigation/native';

export default function Sign4_serve() {
  const navigation = useNavigation();

  const handleLogin = () => {
    navigation.navigate('Login_user');
  };

  return (
    <View style={styles.container}>
      {/* Progress Indicator */}
      <View style={styles.stepContainer}>
        {[1, 2, 3, 4].map((step, index) => (
          <View key={index} style={styles.step}>
            <View style={[
              styles.circle,
              step === 4 ? styles.activeStep : styles.inactiveStep
            ]}>
              <Text style={styles.stepText}>{step}</Text>
            </View>
            {step !== 4 && <View style={styles.line} />}
          </View>
        ))}
      </View>

      <Text style={styles.title}>สำเร็จ!</Text>
      <View style={styles.circleProgress}>
        <Text style={styles.percentText}>100%</Text>
      </View>

      <Button
        title="เข้าสู่ระบบ"
        buttonStyle={styles.loginButton}
        titleStyle={{ fontSize: 16 }}
        onPress={handleLogin}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fffcfb',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  stepContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    position: 'absolute',
    top: 60,
  },
  step: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  circle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  activeStep: {
    backgroundColor: '#65d187',
  },
  inactiveStep: {
    backgroundColor: 'black',
  },
  stepText: {
    color: 'white',
    fontWeight: 'bold',
  },
  line: {
    width: 30,
    height: 2,
    backgroundColor: 'black',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    marginVertical: 20,
  },
  circleProgress: {
    borderWidth: 8,
    borderColor: '#65d187',
    borderRadius: 100,
    width: 200,
    height: 200,
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 40,
  },
  percentText: {
    fontSize: 40,
    color: '#65d187',
    fontWeight: 'bold',
  },
  loginButton: {
    backgroundColor: 'black',
    paddingHorizontal: 60,
    paddingVertical: 15,
    borderRadius: 30,
  },
});
