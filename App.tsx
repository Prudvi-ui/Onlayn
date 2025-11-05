import React, { useEffect, useState, useContext, useCallback } from 'react';
import {
  View,
  Text,
  Keyboard,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Image,
  TextInput,
} from 'react-native';
import { NavigationContainer, createNavigationContainerRef } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { enableScreens } from 'react-native-screens';
import LinearGradient from 'react-native-linear-gradient';
import {CartProvider} from './Asserts/context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRoute, useFocusEffect } from '@react-navigation/native';

import Splash from './Asserts/Screens/Splash';
import Add1 from './Asserts/Screens/Add1';
import Add2 from './Asserts/Screens/Add2';
import Add3 from './Asserts/Screens/Add3';
import LoginSignupScreen from './Asserts/Screens/Loginsingup';
import OTPScreen from './Asserts/Screens/otp';
import ResetPasswordScreen from './Asserts/Screens/resetpassword';
import Home from './Asserts/Screens/Home';
import SearchScreen from './Asserts/Screens/Products';
import CategoryScreen from './Asserts/Screens/Categories';
import FilterScreen from './Asserts/Screens/filter';
import Products from './Asserts/Screens/Products';
import CartScreen from './Asserts/Screens/Cart';
import ProductDetailScreen from './Asserts/Screens/Singleproduct';
import Notifications from './Asserts/Screens/Notifications';
import WishlistScreen from './Asserts/Screens/Wishlist';
import ProfileScreen from './Asserts/Screens/Profile';
import EditProfileScreen from './Asserts/Screens/Editprofile';
import PaymentScreen from './Asserts/Screens/Payment';
// import TrackOrderScreen from './Asserts/Screens/Trackingorder';
import MyOrdersScreen from './Asserts/Screens/Orders';
import ContactUsScreen from './Asserts/Screens/Contactus';
import TermsAndConditionsScreen from './Asserts/Screens/TermsAndConditions';
import About from './Asserts/Screens/About';
import MyAddressScreen from './Asserts/Screens/Myaddress';
import AddressScreen from './Asserts/Screens/Address'
import PrivacyPolicy from './Asserts/Screens/Privacypolicy';
import OrderConfirmedCard from './Asserts/Screens/ok';
import Invoice from './Asserts/Screens/Invoice';
import Toast, { BaseToast, ErrorToast } from 'react-native-toast-message';
import { useSafeAreaInsets } from 'react-native-safe-area-context'; // 👈 add this
import Nointernet from "./Asserts/Screens/Nointernet"
enableScreens(); // Optional but improves performance

const navigationRef = createNavigationContainerRef();
const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

const GradientIcon = ({ name }) => (
  <LinearGradient
    colors={['#ff5cb8', '#ff5cb8', '#ff5cb8']}
    style={styles.gradientIcon}
  >
    <Icon name={name} size={33} color="#fff" />
  </LinearGradient>
);

const TabStackNav = () => {
  const [isKeyboardVisible, setKeyboardVisible] = useState(false);
  // const { cartCount, setCartCount } = useContext(CartContext);
  const insets = useSafeAreaInsets(); // 👈 safe area for all mobiles
  const [cartCount, setCartCount] = useState("0")

  useEffect(() => {
    const show = Keyboard.addListener('keyboardDidShow', () => setKeyboardVisible(true));
    const hide = Keyboard.addListener('keyboardDidHide', () => setKeyboardVisible(false));
    return () => {
      show.remove();
      hide.remove();
    };
  }, []);
  const fetchCartItems = async () => {
    try {
      const customerId = await AsyncStorage.getItem('id');

      if (!customerId) {
        console.warn("⚠️ No customerId found in AsyncStorage");
        setCartCount(0);
        return;
      }

      const response = await fetch('https://apis.toyshack.in/App/Cart/Cart-data', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ customerId }),
      });

      if (response.ok && response.headers.get('content-type')?.includes('application/json')) {
        const data = await response.json();

        const items = Array.isArray(data.response)
          ? data.response.filter(item =>
            item.customerId?.toString() === customerId.toString() ||
            item.customerId?._id?.toString() === customerId.toString()
          )
          : [];

        setCartCount(items.length); // ✅ count unique products
      } else {
        console.error("❌ Invalid response or non-JSON content");
        setCartCount(0);
      }
    } catch (error) {
      console.error('❌ Error fetching cart items:', error);
      setCartCount(0);
    }
  };

useFocusEffect( useCallback(() => { fetchCartItems();
   const interval = setInterval(() => { fetchCartItems();  }, 1000);
    return () => clearInterval(interval); }, []) );
  return (
    <Tab.Navigator
      initialRouteName="Home"
      screenOptions={{
        tabBarShowLabel: false,
        tabBarStyle: isKeyboardVisible
          ? { display: 'none' }
          : {
            height: 70, // keep constant height
            backgroundColor: 'white',
            borderRadius: 25,
            position: 'absolute',
            left: 20,
            right: 20,
            bottom: insets.bottom + 5, // ✅ just float a little above safe area
            elevation: 5,
            borderWidth: 1,
            borderColor: '#eee',
            paddingBottom: 5, // ✅ remove double safe padding
            alignSelf: 'center',
            justifyContent: 'center',
            width: "80%",
            alignItems: "center",
            marginLeft: 38
          },
        tabBarItemStyle: {
          justifyContent: 'center',
          alignItems: 'center',
          top: 15,
        },
      }}
    >
      <Tab.Screen
        name="Home"
        component={Home}
        options={{
          headerShown: false,
          tabBarIcon: ({ focused }) => (
            <View style={styles.iconWrapper}>
              {focused ? <GradientIcon name="home" /> : <Icon name="home" size={33} color="navy" />}
            </View>
          ),
        }}
      />

      <Tab.Screen
        name="CartScreen"
        component={CartScreen}
        options={{
          headerShown: false,
          tabBarIcon: ({ focused }) => (
            <View style={styles.iconWrapper}>
              {focused ? <GradientIcon name="cart" /> : <Icon name="cart" size={33} color="navy" />}
              {cartCount > 0 && (
                <View style={styles.cartBadge}>
                  <Text style={styles.cartBadgeText}></Text>
                </View>
              )}
            </View>
          ),
        }}
      />

      <Tab.Screen
        name="WishlistScreen"
        component={WishlistScreen}
        options={{
          headerShown: false,
          tabBarIcon: ({ focused }) => (
            <View style={styles.iconWrapper}>
              {focused ? <GradientIcon name="heart" /> : <Icon name="heart" size={33} color="navy" />}
            </View>
          ),
        }}
      />

      <Tab.Screen
        name="ProfileScreen"
        component={ProfileScreen}
        options={{
          headerShown: false,
          tabBarIcon: ({ focused }) => (
            <View style={styles.iconWrapper}>
              {focused ? <GradientIcon name="account" /> : <Icon name="account" size={33} color="navy" />}
            </View>
          ),
        }}
      />
    </Tab.Navigator>
  );
};


// ------------------------ Main App ------------------------
const toastConfig = {
  success: (props) => (
    <BaseToast
      {...props}
      style={{ backgroundColor: 'navy', borderRadius: 20 }} // light green bg
      contentContainerStyle={{ paddingHorizontal: 15 }}
      text1Style={{ fontSize: 16, fontWeight: 'bold', color: 'white' }}
      text2Style={{ fontSize: 14, color: 'white' }}
      text2NumberOfLines={3}
    />
  ),

  error: (props) => (
    <ErrorToast
      {...props}
      style={{ backgroundColor: '#dd4f5bff', borderRadius: 20, height: 80 }} // light red bg
      text1Style={{ fontSize: 16, fontWeight: 'bold', color: 'white' }}
      text2Style={{ fontSize: 14, color: 'white' }}
      text2NumberOfLines={3}
    />
  ),

  customToast: ({ text1, text2 }) => (
    <View
      style={{
        width: '90%',
        padding: 12,
        borderRadius: 10,
        backgroundColor: 'navy', // 🔵 blue background
        alignSelf: 'center',
      }}
    >
      <Text style={{ color: 'white', fontWeight: 'bold', fontSize: 16 }}>{text1}</Text>
      <Text style={{ color: 'white', fontSize: 14 }}>{text2}</Text>
    </View>
  ),
};

export default function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <CartProvider>
        <NavigationContainer ref={navigationRef}>
          <Stack.Navigator
            initialRouteName="Splash"
            screenOptions={{
              headerStyle: {
                backgroundColor: '#0D0D0D',
              },
              headerTintColor: '#fff',
              headerTitleStyle: {
                fontWeight: 'bold',
              },
            }}
          >
            <Stack.Screen name="Splash" component={Splash} options={{ headerShown: false }} />
            <Stack.Screen name="Add1" component={Add1} options={{ headerShown: false }} />
            <Stack.Screen name="Add2" component={Add2} options={{ headerShown: false }} />
            <Stack.Screen name="Add3" component={Add3} options={{ headerShown: false }} />
            <Stack.Screen name="About" component={About} options={{ headerShown: false }} />
            <Stack.Screen name="LoginSignupScreen" component={LoginSignupScreen} options={{ headerShown: false }} />
            {/* <Stack.Screen name="OTPScreen" component={OTPScreen} options={{ headerShown: false }} /> */}
            <Stack.Screen name="ResetPasswordScreen" component={ResetPasswordScreen} options={{ headerShown: false }} />
            <Stack.Screen name="Home" component={Home} options={{ headerShown: false }} />
            <Stack.Screen name="Products" component={Products} options={{ headerShown: false }} />
            <Stack.Screen name="CategoryScreen" component={CategoryScreen} options={{ headerShown: false }} />
            <Stack.Screen name="FilterScreen" component={FilterScreen} options={{ headerShown: false }} />
            <Stack.Screen name="CartScreen" component={CartScreen} options={{ headerShown: false }} />
            <Stack.Screen name="ProductDetailScreen" component={ProductDetailScreen} options={{ headerShown: false }} />
            <Stack.Screen name="PaymentScreen" component={PaymentScreen} options={{ headerShown: false }} />
            <Stack.Screen name="MyOrdersScreen" component={MyOrdersScreen} options={{ headerShown: false }} />
            <Stack.Screen name="Nointernet" component={Nointernet} options={{ headerShown: false }} />


            <Stack.Screen name="Notifications" component={Notifications} options={{ headerShown: false }} />
            <Stack.Screen name="WishlistScreen" component={WishlistScreen} options={{ headerShown: false }} />
            <Stack.Screen name="EditProfileScreen" component={EditProfileScreen} options={{ headerShown: false }} />
            {/* <Stack.Screen name="TrackOrderScreen" component={TrackOrderScreen} options={{ headerShown: false }} /> */}
            <Stack.Screen name="ContactUsScreen" component={ContactUsScreen} options={{ headerShown: false }} />
            <Stack.Screen name="TermsAndConditionsScreen" component={TermsAndConditionsScreen} options={{ headerShown: false }} />
            <Stack.Screen name="MyAddressScreen" component={MyAddressScreen} options={{ headerShown: false }} />
            <Stack.Screen name="Privacypolicy" component={PrivacyPolicy} options={{ headerShown: false }} />
            <Stack.Screen name="Ok" component={OrderConfirmedCard} options={{ headerShown: false }} />
            <Stack.Screen name="Invoice" component={Invoice} options={{ headerShown: false }} />
            <Stack.Screen name="AddressScreen" component={AddressScreen} options={{ headerShown: false }} />


            <Stack.Screen name="Main" component={TabStackNav} options={{ headerShown: false }} />
          </Stack.Navigator>
        </NavigationContainer>
        <Toast config={toastConfig} position="top" />
      </CartProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  gradientIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconWrapper: {
    justifyContent: 'center',
    alignItems: 'center',
    height: 60,
  },
  cartBadge: {
    position: 'absolute',
    top: 0,
    right: -10,
    backgroundColor: 'red',
    borderRadius: 10,
    minWidth: 15,
    height: 15,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
  },
  cartBadgeText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  tabBar: {
    height: 70,
    backgroundColor: 'white',
    borderRadius: 25,
    position: 'absolute',
    left: 10,
    right: 10,
    bottom: 15,
    elevation: 5,
    borderWidth: 1,
    borderColor: '#eee',
    paddingBottom: 10,
    margin: 10,
    width: '75%',
    alignContent: 'center',
    alignSelf: 'center',
    justifyContent: 'center',
    marginLeft: 50,
  },
  tabItem: {
    justifyContent: 'center',
    alignItems: 'center',
    top: 15,
  },

});