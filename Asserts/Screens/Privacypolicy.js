import React from 'react';
import { View, Text, StyleSheet, ScrollView,TouchableOpacity} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import LinearGradient from 'react-native-linear-gradient';

export default function PrivacyPolicy({ navigation }) {
  return (
    <LinearGradient colors={['white', 'white']} style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Icon name="menu-left" size={34} color="#333" />
        </TouchableOpacity>
      </View>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={styles.title}>Privacy Policy</Text>
        <Text style={styles.paragraph}>
          At <Text style={{ flexDirection: 'row', alignItems: 'center', alignSelf: 'center', lineHeight: 22,}}>
            <Text style={styles.highlight}>Toy</Text>
            <Text style={styles.highlight1}>Shack</Text></Text>, your privacy is very important to us.
          This Privacy Policy explains how we collect, use, and protect your personal information
          when you use our app and services.
        </Text>

        <Text style={styles.sectionTitle}>📌 Information We Collect</Text>
        <View style={styles.listItem}>
          <Icon name="account-outline" size={22} color="#ff6f00" />
          <Text style={styles.listText}>Basic details such as name, email, and phone number</Text>
        </View>
        <View style={styles.listItem}>
          <Icon name="map-marker-outline" size={22} color="#ff6f00" />
          <Text style={styles.listText}>Delivery address and location details</Text>
        </View>
        <View style={styles.listItem}>
          <Icon name="cart-outline" size={22} color="#ff6f00" />
          <Text style={styles.listText}>Order history and shopping preferences</Text>
        </View>
        <View style={styles.listItem}>
          <Icon name="lock-outline" size={22} color="#ff6f00" />
          <Text style={styles.listText}>Payment information (securely processed)</Text>
        </View>

        <Text style={styles.sectionTitle}>🔐 How We Use Your Data</Text>
        <Text style={styles.paragraph}>
          We use your data to:
          • Process orders and deliver products
          • Provide customer support
          • Improve our services and user experience
          • Share offers, promotions, and updates (with your consent)
        </Text>

        <Text style={styles.sectionTitle}>🛡️ Data Protection</Text>
        <Text style={styles.paragraph}>
          We implement industry-standard security measures to keep your information safe.
          We never sell or share your personal data with unauthorized third parties.
        </Text>

        <Text style={styles.sectionTitle}>⚖️ Your Rights</Text>
        <Text style={styles.paragraph}>
          You have the right to:
          • Access and update your personal information
          • Request deletion of your data
          • Opt out of promotional communications
        </Text>

        <Text style={styles.sectionTitle}>📞 Contact Us</Text>
        <Text style={styles.contact}>Email: hello.toyshack@gmail.com</Text>
        <Text style={styles.contact}>Phone: 8121304888 (or) 8121301888</Text>
        <Text style={styles.contact}>Website: https://toyshack.in/</Text>

        <Text style={styles.footer}>
          👉 We value your trust and are committed to protecting your privacy.
        </Text>
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
    marginTop: 20
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    marginTop: 20,
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
    textAlign: 'center',
    marginTop:-20
  },
  paragraph: {
    fontSize: 16,
    color: '#444',
    lineHeight: 22,
    marginBottom: 20,
    textAlign: 'justify',
  },
  highlight: {
    color: 'navy',
    fontWeight: '500',
    top: 3
  },
  highlight1: {
    color: '#ff4fd8',
    fontWeight: '500',
    top: 3
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
