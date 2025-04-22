import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import { StripeProvider } from "@stripe/stripe-react-native";

// หน้าจอทั้งหมดของคุณ
import Loading from "./screen_user/Loading";
import Login_user from "./screen_user/Login_user";
import Sign_user from "./screen_user/Sign_user";
import Class from "./screen_user/Class";
import Product_details_user from "./screen_user/Product_details_user";
import History from "./screen_user/History";


import Home_serve from "./screen_serve/Home_serve";
import Sign1_serve from "./screen_serve/Sign1_serve";
import Sign2_serve from "./screen_serve/Sign2_serve";
import Sign3_serve from "./screen_serve/Sign3_serve";
import Sign4_serve from "./screen_serve/Sign4_serve";
import Detail_time from "./screen_serve/Detail_time";


import Payment from "./screen_user/Payment";
import Money from "./screen_user/Money";
import TrueMoneyPaymentScreen from "./screen_user/TrueMoneyPaymentScreen";
import PromptPayQRCodeScreen from "./screen_user/PromptPayQRCodeScreen";


import EditProfile from "./components/EditProfile";
import UserDrawer from "./UserDrawer";
import Detail_History from "./screen_serve/Detail_Home.js/Detail_History";
import Detail_Deposit from "./screen_serve/Detail_Home.js/Detail_Deposit";
import Detail_Money from "./screen_serve/Detail_Home.js/Detail_Money";

const Stack = createStackNavigator();

export default function App() {
  return (
    <StripeProvider
      publishableKey="pk_test_51RDzjuIR8yjtpTsUW3IOxVy4gVvzkC99di8Waxwj0OKkFpVluhWC42aPB1hjpbZble82xuvQYdqiObyAxR0sxn5800yD5G8sWE"  // <- ใส่ key จริงของคุณตรงนี้
      merchantIdentifier="merchant.com.yourapp"      // สำหรับ Apple Pay ถ้ามี
    >
      <NavigationContainer>
        <Stack.Navigator screenOptions={{ headerShown: false }}>
          <Stack.Screen name="Loading" component={Loading} />
          <Stack.Screen name="Login_user" component={Login_user} />
          <Stack.Screen name="Sign_user" component={Sign_user} />
          <Stack.Screen name="EditProfile" component={EditProfile} />
          <Stack.Screen name="Home_user" component={UserDrawer} />
          <Stack.Screen name="Home_serve" component={Home_serve} />
          <Stack.Screen name="Sign1_serve" component={Sign1_serve} />
          <Stack.Screen name="Sign2_serve" component={Sign2_serve} />
          <Stack.Screen name="Sign3_serve" component={Sign3_serve} />
          <Stack.Screen name="Sign4_serve" component={Sign4_serve} />
          <Stack.Screen name="Class" component={Class} />
          <Stack.Screen name="Payment" component={Payment} />
          <Stack.Screen name="TrueMoneyPaymentScreen" component={TrueMoneyPaymentScreen} />
          <Stack.Screen name="PromptPayQRCodeScreen" component={PromptPayQRCodeScreen} />
          <Stack.Screen name="Product_details_user" component={Product_details_user} />
          <Stack.Screen name="Detail_time" component={Detail_time} />
          <Stack.Screen name="Money" component={Money} />  
          <Stack.Screen name="Detail_History" component={Detail_History} />
          <Stack.Screen name="Detail_Deposit" component={Detail_Deposit} />
          <Stack.Screen name="Detail_Money" component={Detail_Money} />
          <Stack.Screen name="History" component={History} />
        </Stack.Navigator>
      </NavigationContainer>
    </StripeProvider>
  );
}
