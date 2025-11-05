// OrderConfirmedCard.js
import React, { useEffect, useCallback, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView, BackHandler } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const PINK = '#ff2d87';
const TEXT = '#222222';
const MUTED = '#6b6b6b';
const BG = '#f3f5f7';

export default function OrderConfirmedCard({ navigation }) {
  const [name, setName] = useState('');

  useFocusEffect(
    useCallback(() => {
      const fetchData = async () => {
        try {
          const na = await AsyncStorage.getItem('Name');
          setName(na || '');
        } catch (error) {
          console.error('❌ Error loading profile data:', error);
        }
      };
      fetchData();

      // ✅ Handle Android back button
      const backHandler = BackHandler.addEventListener(
        'hardwareBackPress',
        () => {
          navigation.navigate('Main'); // 👈 replace 'Home' with your home screen route name
          return true; // prevent default behavior
        }
      );

      return () => backHandler.remove();
    }, [navigation])
  );

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.screen}>
        <View style={styles.card}>
          <View style={styles.checkWrap}>
            <View style={styles.checkCircle}>
              <Icon name="check" size={28} color={PINK} />
            </View>
          </View>

          <Text style={styles.heyText}>Hey {name},</Text>

          <Text style={styles.title}>Your Order is Confirmed!</Text>

          {/* <Text style={styles.subText}>
            We’ll send you a shipping confirmation email{'\n'}
            as soon as your order ships.
          </Text> */}

          <TouchableOpacity
            activeOpacity={0.9}
            onPress={() => navigation.navigate('MyOrdersScreen')}
            style={styles.cta}
          >
            <Text style={styles.ctaText}>CHECK STATUS</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: BG },
  screen: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    backgroundColor: BG,
  },
  card: {
    width: '100%',
    maxWidth: 380,
    backgroundColor: '#fff',
    borderRadius: 14,
    paddingVertical: 28,
    paddingHorizontal: 22,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 6 },
    elevation: 4,
    alignItems: 'center',
  },
  checkWrap: { marginBottom: 14 },
  checkCircle: {
    width: 66,
    height: 66,
    borderRadius: 33,
    borderWidth: 2,
    borderColor: PINK,
    alignItems: 'center',
    justifyContent: 'center',
  },
  heyText: {
    fontSize: 14,
    color: MUTED,
    marginTop: 4,
    marginBottom: 6,
  },
  title: {
    fontSize: 20,
    color: TEXT,
    fontWeight: '800',
    textAlign: 'center',
    marginBottom: 8,
  },
  subText: {
    fontSize: 13,
    color: MUTED,
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: 18,
  },
  cta: {
    backgroundColor: PINK,
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 22,
    minWidth: 170,
    alignItems: 'center',
  },
  ctaText: {
    color: '#fff',
    fontWeight: '700',
    letterSpacing: 0.5,
    fontSize: 14,
  },
});
