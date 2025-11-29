import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Linking } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import LinearGradient from 'react-native-linear-gradient';

export default function PrivacyPolicy({ navigation }) {
  return (
    <LinearGradient colors={['white', 'white']} style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Icon name="menu-left" size={34} color="#333" />
        </TouchableOpacity>
        <Text style={styles.title}>Privacy Policy</Text>
        <Text style={styles.title}>    </Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>

        <Text style={styles.paragraph}>
          <Text style={styles.bold}>Last Updated: 17th November 2025{"\n"}</Text>
        </Text>

        {/* 1. Introduction */}
        <Text style={styles.sectionTitle}>1. Introduction</Text>
        <Text style={styles.paragraph}>
          This Privacy Policy describes how Novelty Technologies ("we," "us," or "our")
          collects and uses personal data when you use our
          <Text
            style={{ color: 'navy' }}
            onPress={() => Linking.openURL('https://onlayn.toys/')}
          >
            {" "}website
          </Text>
          {" "}and{" "}
          <Text
            style={{ color: 'navy' }}
            onPress={() => Linking.openURL('https://play.google.com/store/apps/details?id=com.onlayn')}
          >
            mobile application{" "}
          </Text>.
          By using our services, you consent to the data practices described in this policy.
        </Text>


        {/* 2. The Information We Collect */}
        <Text style={styles.sectionTitle}>2. The Information We Collect</Text>

        <Text style={styles.subSection}>A. Data You Provide Directly:</Text>

        <View style={styles.listItem}>
          <Icon name="account-outline" size={22} color="#ff6f00" />
          <Text style={styles.listText}>
            Identity & Contact Data: Full name, email address, and phone number.
          </Text>
        </View>

        <View style={styles.listItem}>
          <Icon name="map-marker-outline" size={22} color="#ff6f00" />
          <Text style={styles.listText}>
            Delivery Data: Shipping and saved delivery addresses.
          </Text>
        </View>

        <View style={styles.listItem}>
          <Icon name="message-outline" size={22} color="#ff6f00" />
          <Text style={styles.listText}>
            Communications: Information provided during customer support.
          </Text>
        </View>

        <Text style={styles.subSection}>B. Data We Collect Automatically (Usage Data):</Text>

        <View style={styles.listItem}>
          <Icon name="cellphone" size={22} color="#ff6f00" />
          <Text style={styles.listText}>
            Device Data: IP address, device model, OS, and App version.
          </Text>
        </View>

        <View style={styles.listItem}>
          <Icon name="history" size={22} color="#ff6f00" />
          <Text style={styles.listText}>
            Usage Data: Pages viewed, products searched, and interactions.
          </Text>
        </View>

        {/* 3. How We Use Your Data */}
        <Text style={styles.sectionTitle}>3. How We Use Your Data</Text>
        <Text style={styles.paragraph}>
          We use your personal data for the following:
        </Text>

        <Text style={styles.bullet}>• To create and manage your account</Text>
        <Text style={styles.bullet}>• To process and deliver your orders</Text>
        <Text style={styles.bullet}>• To communicate updates and confirmations</Text>
        <Text style={styles.bullet}>• To send promotional messages</Text>
        <Text style={styles.bullet}>• To analyze App usage and improve services</Text>

        {/* 4. Who We Share Your Data With */}
        <Text style={styles.sectionTitle}>4. Who We Share Your Data With</Text>

        <Text style={styles.paragraph}>
          We do NOT sell your personal data. We share it only with:
        </Text>

        <View style={styles.listItem}>
          <Icon name="bike-fast" size={22} color="#ff6f00" />
          <Text style={styles.listText}>
            Delivery Partners: To complete and verify deliveries.
          </Text>
        </View>

        <View style={styles.listItem}>
          <Icon name="shield-check-outline" size={22} color="#ff6f00" />
          <Text style={styles.listText}>
            Legal Authorities: Only when required for legal or safety reasons.
          </Text>
        </View>

        {/* 5. Your Rights */}
        <Text style={styles.sectionTitle}>5. Your Rights</Text>

        <Text style={styles.bullet}>• Right to Access your stored data</Text>
        <Text style={styles.bullet}>• Right to Correct inaccurate information</Text>
        <Text style={styles.bullet}>• Right to Erase your data via email request</Text>
        <Text style={styles.bullet}>• Right to Withdraw Consent anytime</Text>

        <Text style={styles.paragraph}>
          To request data deletion, email us at:
          <Text style={styles.bold}> contact.onlayn@gmail.com</Text>.
          We will respond within 7 working days.
        </Text>

        {/* 6. Data Security */}
        <Text style={styles.sectionTitle}>6. Data Security</Text>
        <Text style={styles.paragraph}>
          We use modern security measures including encryption and secure servers.
          However, no internet-based system is 100% secure.
        </Text>

        {/* 7. Data Retention */}
        <Text style={styles.sectionTitle}>7. Data Retention</Text>
        <Text style={styles.paragraph}>
          We retain your data only as long as necessary to fulfill service obligations
          or as required by law (e.g., tax purposes).
        </Text>

        {/* 8. Children's Data */}
        <Text style={styles.sectionTitle}>8. Children's Data</Text>
        <Text style={styles.paragraph}>
          Our services are not intended for individuals under 18.
          If a child has provided information, please notify us immediately.
        </Text>

        {/* 9. Grievance Officer */}
        <Text style={styles.sectionTitle}>9. Grievance Officer & Contact Information</Text>
        <Text style={styles.paragraph}>
          Name: M Sudheer{"\n"}
          Email: contact.onlayn@gmail.com
        </Text>

        {/* 10. Changes */}
        <Text style={styles.sectionTitle}>10. Changes to This Policy</Text>
        <Text style={styles.paragraph}>
          We may update this Privacy Policy occasionally. Updates will be posted on the App
          and Website or shared through email notifications.
        </Text>

        <Text style={styles.footer}>
          👉 We value your privacy and are committed to protecting your data.
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
    // paddingHorizontal: 16,
    // paddingVertical: 10,
    marginTop: 35,
    justifyContent:'space-between',
    margin:10
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#333',
    // marginBottom: 10,
    textAlign: 'center',
  },
  paragraph: {
    fontSize: 16,
    color: '#444',
    lineHeight: 22,
    // marginBottom: 20,
    marginTop: 10,
    textAlign: 'justify',
  },
  bold: { fontWeight: '700' },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#222',
    marginTop: 15,
    // marginBottom: ,
  },
  subSection: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
    color: '#333',
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
  bullet: {
    fontSize: 15,
    color: '#333',
    marginLeft: 8,
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
