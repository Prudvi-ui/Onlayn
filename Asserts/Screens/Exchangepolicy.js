import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Linking } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import LinearGradient from 'react-native-linear-gradient';

export default function ExchangePolicy({ navigation }) {
  return (
    <LinearGradient colors={['white', 'white']} style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Icon name="menu-left" size={34} color="#333" />
        </TouchableOpacity>
        <Text style={styles.title}>Exchange Policy</Text>
        <Text style={styles.title}>    </Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>

        {/* Last Updated */}
        <Text style={styles.paragraph}>
          <Text style={styles.bold}>Last Updated: 17th November 2025{"\n"}</Text>
        </Text>

        {/* Exchange Policy Intro */}
        <Text style={styles.sectionTitle}>Exchange Policy for Onlayn</Text>
        <Text style={styles.paragraph}>
          At Onlayn, we value your trust and happiness. To ensure a hassle-free shopping experience, 
          we follow a no-return policy. Instead, we offer instant exchanges and open-box delivery so 
          that you always get the perfect product without worry.{"\n\n"}
          <Text style={styles.bold}>No returns once order is accepted by the customer.</Text>
        </Text>

        {/* 1. Instant Exchanges */}
        <Text style={styles.sectionTitle}>1. Instant Exchanges</Text>
        <Text style={styles.paragraph}>
          If you receive a product that is damaged, defective, or not as expected, 
          we will provide an instant exchange. Our delivery partner will hand over the 
          replacement item at your doorstep while collecting the original product. 
          This ensures you never have to wait long for your child’s joy.
        </Text>

        {/* 2. Open-Box Delivery */}
        <Text style={styles.sectionTitle}>2. Open-Box Delivery</Text>
        <Text style={styles.paragraph}>
          For selected items, we offer open-box delivery. This allows you to check your toy 
          in front of the delivery partner before accepting it. If there are any issues, 
          the exchange will be processed immediately.
        </Text>

        {/* 3. Need Help */}
        <Text style={styles.sectionTitle}>3. Need Help?</Text>
        <Text style={styles.paragraph}>
          For any exchange or delivery-related queries, email us at{" "}
          <Text style={{ color: 'navy' }} onPress={() => Linking.openURL('mailto:contact.onlayn@gmail.com')}>
            contact.onlayn@gmail.com
          </Text>{" "}or call{" "}
          <Text style={{ color: 'navy' }} onPress={() => Linking.openURL('tel:+918121301888')}>
            +91 8121301888
          </Text>
          ,{" "}
          <Text style={{ color: 'navy' }} onPress={() => Linking.openURL('tel:+918121304888')}>
            8121304888
          </Text>. 
          Our team will be happy to assist you.
        </Text>

        {/* About Onlayn */}
        <Text style={styles.sectionTitle}>About Onlayn</Text>
        <Text style={styles.paragraph}>
          Trusted by parents and loved by kids, our toys are designed to be safe, 
          affordable, and full of joy – making playtime more meaningful at every stage of childhood.
        </Text>

        {/* Quick Links */}
        <Text style={styles.sectionTitle}>Quick Links</Text>

        <TouchableOpacity onPress={() => navigation.navigate("Main")}>
          <Text style={[styles.bullet, { color: 'navy' }]}>• Home</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => navigation.navigate("Products")}>
          <Text style={[styles.bullet, { color: 'navy' }]}>• Toys</Text>
        </TouchableOpacity>

        <Text style={styles.footer}>
          👉 We are committed to providing the best experience to you and your little ones.
        </Text>

      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContent: { padding: 20, paddingBottom: 40, marginTop: 20 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 30,
    justifyContent: 'space-between',
    margin:10
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
    textAlign: 'center',
  },
  paragraph: {
    fontSize: 16,
    color: '#444',
    lineHeight: 22,
    marginTop: 10,
    textAlign: 'justify',
  },
  bold: { fontWeight: '700' },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#222',
    marginBottom: 10,
    marginTop:15
  },
  bullet: {
    fontSize: 15,
    marginBottom: 5,
  },
  footer: {
    marginTop: 20,
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
    color: '#ff6f00',
  },
});
