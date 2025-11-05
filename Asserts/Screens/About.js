import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import LinearGradient from 'react-native-linear-gradient';

export default function About({ navigation }) {
  return (
    <LinearGradient colors={['white', 'white']} style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Icon name="menu-left" size={34} color="#333" />
        </TouchableOpacity>
      </View>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={styles.title}>About Us</Text>
        <Text style={styles.paragraph}>
          Welcome to
          <Text style={{ flexDirection: 'row', alignItems: 'center', alignSelf: 'center', lineHeight: 22,gap:2 }}>
            <Text style={styles.highlight}> Toy</Text>
            <Text style={styles.highlight1}>Shack </Text>
          </Text>
              We bring happiness,
          creativity, and fun straight to your doorstep with our wide collection of toys
          for kids of all ages.
        </Text>

        <Text style={styles.sectionTitle}>🎁 What We Offer</Text>
        <View style={styles.listItem}>
          <Icon name="teddy-bear" size={22} color="#ff6f00" />
          <Text style={styles.listText}>Wide Range of Toys – dolls, puzzles, cars, and more</Text>
        </View>
        <View style={styles.listItem}>
          <Icon name="baby-face-outline" size={22} color="#ff6f00" />
          <Text style={styles.listText}>For All Age Groups – safe & engaging toys for every child</Text>
        </View>
        <View style={styles.listItem}>
          <Icon name="star-circle-outline" size={22} color="#ff6f00" />
          <Text style={styles.listText}>Trusted Brands – only top-quality products</Text>
        </View>
        <View style={styles.listItem}>
          <Icon name="truck-fast-outline" size={22} color="#ff6f00" />
          <Text style={styles.listText}>Fast Delivery – quick & reliable doorstep delivery</Text>
        </View>

        <Text style={styles.sectionTitle}>💡 Our Mission</Text>
        <Text style={styles.paragraph}>
          To spread joy and creativity by making premium-quality toys accessible and affordable
          to every family.
        </Text>

        <Text style={styles.sectionTitle}>🔒 Why Choose Us?</Text>
        <View style={styles.listItem}>
          <Icon name="shield-check-outline" size={22} color="#ff6f00" />
          <Text style={styles.listText}>100% safe and child-friendly products</Text>
        </View>
        <View style={styles.listItem}>
          <Icon name="credit-card-check-outline" size={22} color="#ff6f00" />
          <Text style={styles.listText}>Secure payments & exclusive discounts</Text>
        </View>
        <View style={styles.listItem}>
          <Icon name="account-voice" size={22} color="#ff6f00" />
          <Text style={styles.listText}>Dedicated customer support</Text>
        </View>

        <Text style={styles.sectionTitle}>📞 Contact Us</Text>
        <Text style={styles.contact}>Email: hello.toyshack@gmail.com</Text>
        <Text style={styles.contact}>Phone: 8121304888 (or) 8121301888</Text>
        <Text style={styles.contact}>Website: https://toyshack.in/</Text>

        <Text style={styles.footer}>👉 Play. Learn. Grow. ❤️</Text>
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    marginTop: 20,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
    marginTop: 20
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
    textAlign: 'center',
    marginTop: -20

  },
  paragraph: {
    fontSize: 16,
    color: '#444',
    lineHeight: 22,
    marginBottom: 20,
    textAlign: 'justify',
    alignItems: 'center',
  },
  highlight: {
    color: 'navy',
    fontWeight: '500',
    alignItems: 'center',
    // top: 4

  },
  highlight1: {
    color: '#ff4fd8',
    fontWeight: '500',
    // top: 4,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#222',
    marginTop: 15,
    marginBottom: 10,
  },
  listItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  listText: {
    fontSize: 15,
    marginLeft: 8,
    color: '#333',
    flex: 1,
    flexWrap: 'wrap',
  },
  contact: {
    fontSize: 15,
    color: '#333',
    marginBottom: 4,
  },
  footer: {
    marginTop: 20,
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
    color: '#ff6f00',
  },
});
