import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, ScrollView, Alert } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import LinearGradient from 'react-native-linear-gradient';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';

const ProfileScreen = ({ navigation }) => {
  const [image, setImage] = useState(null);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(null);

  const menuItems = [
    { label: 'Edit Profile', screen: 'EditProfileScreen' },
    { label: 'Notification', screen: 'Notifications' },
    { label: 'My Address', screen: 'AddressScreen' },
    { label: 'My Order', screen: 'MyOrdersScreen' },
    { label: 'Contact Us', screen: 'ContactUsScreen' },
    { label: 'About', screen: 'About' },
    { label: 'Privacy Policy', screen: 'Privacypolicy' },
    { label: 'Terms & Condition', screen: 'TermsAndConditionsScreen' },
  ];

  const handleLogout = () => {
    Alert.alert(
      'Confirm Logout',
      'Are you sure you want to logout?',
      [
        { text: 'No', style: 'cancel' },
        {
          text: 'Yes',
          onPress: () => {
            navigation.reset({
              index: 0,
              routes: [{ name: 'LoginSignupScreen' }],
            });
          },
        },
      ],
      { cancelable: false }
    );
  };

  useFocusEffect(
    useCallback(() => {
      const fetchData = async () => {
        try {
          const img = await AsyncStorage.getItem("Image");
          const mail = await AsyncStorage.getItem("Email");
          const na = await AsyncStorage.getItem("Name");
          setImage(img);
          setName(na);
          setEmail(mail);
        } catch (error) {
          console.error("❌ Error loading profile data:", error);
        }
      };
      fetchData();
    }, [])
  );

  return (
    <LinearGradient colors={['white', 'white']} style={styles.gradient}>
      <ScrollView
        contentContainerStyle={styles.container}
        showsVerticalScrollIndicator={false}
      >
        {/* Profile Section */}
        <View style={styles.profileContainer}>
          <Image
            source={
              image
                ? { uri: `https://apis.toyshack.in/storage/userdp/${image}` }
                : require('../Images/account.png')
            }
            style={styles.avatar}
          />
          <Text style={styles.name}>{name}</Text>
          <Text style={styles.email}>{email}</Text>
        </View>

        {/* Menu Section */}
        <View style={styles.menuContainer}>
          {menuItems.map((item, index) => {
            const isActive = selectedIndex === index;
            return (
              <TouchableOpacity
                key={index}
                style={[
                  styles.menuItem,
                  isActive ? styles.activeItem : styles.inactiveItem,
                ]}
                onPress={() => {
                  setSelectedIndex(index);
                  navigation.navigate(item.screen);
                }}
              >
                <Text
                  style={[
                    styles.menuText,
                    isActive ? styles.activeText : styles.inactiveText,
                  ]}
                >
                  {item.label}
                </Text>
                <Icon
                  name="keyboard-arrow-right"
                  size={24}
                  color={isActive ? "white" : "#777"}
                />
              </TouchableOpacity>
            );
          })}

          {/* Logout Button */}
          <TouchableOpacity
            style={[styles.menuItem, styles.logoutItem]}
            onPress={handleLogout}
          >
            <Text style={[styles.menuText, { color: 'red' }]}>Logout</Text>
            <Icon name="logout" size={22} color="red" />
          </TouchableOpacity>
        </View>
      </ScrollView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  gradient: {
    flex: 1,
  },
  container: {
    paddingVertical: 20,
    paddingBottom: 40, // ensure space at bottom for scrolling
  },
  profileContainer: {
    alignItems: 'center',
    marginBottom: 30,
    marginTop: 30,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginBottom: 10,
  },
  name: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#222',
  },
  email: {
    fontSize: 14,
    color: '#777',
  },
  menuContainer: {
    paddingHorizontal: 20,
  },
  menuItem: {
    paddingVertical: 15,
    paddingHorizontal: 15,
    borderRadius: 10,
    marginBottom: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    elevation: 2,
  },
  inactiveItem: {
    backgroundColor: '#fff',
  },
  activeItem: {
    backgroundColor: 'navy',
  },
  menuText: {
    fontSize: 16,
  },
  inactiveText: {
    color: 'black',
  },
  activeText: {
    color: 'white',
    fontWeight: 'bold',
  },
  logoutItem: {
    backgroundColor: '#fff',
    marginBottom: 100,
  },
});

export default ProfileScreen;
