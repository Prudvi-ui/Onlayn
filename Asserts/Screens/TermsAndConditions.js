import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  TouchableOpacity,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

const TermsAndConditionsScreen = ({ navigation }) => {
  return (
    <LinearGradient colors={['white', 'white']} style={styles.container}>
      <SafeAreaView style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.content}>

          {/* Back Button */}
          <View style={styles.header1}>
            <TouchableOpacity onPress={() => navigation.goBack()}>
              <Icon name="menu-left" size={36} color="#333" />
            </TouchableOpacity>
            <Text style={styles.headerText}>Terms & Conditions</Text>
            <Text style={styles.headerText}>      </Text>

          </View>

          {/* Title */}

          {/* Last Updated */}
          <Text style={styles.paragraph}>
            <Text style={{ fontWeight: 'bold' }}>Last Updated: November 2025</Text>
          </Text>

          {/* Introduction */}
          <Text style={styles.paragraph}>
            These Terms & Conditions ("Terms") govern your access to and use of
            NOVELTY TECHNOLOGIES website, mobile app, and related services
            (collectively, the "Platform"). By accessing or using the Platform,
            you agree to be bound by these Terms. If you disagree, please do not
            use the Platform.
          </Text>

          {/* Terms of Usage */}
          <Text style={styles.sectionTitle}>Terms of Usage</Text>
          <Text style={styles.paragraph}>
            These terms apply to all services available on the Platform. If you
            do not agree to these Terms, you may not use the Platform or its
            services.
          </Text>
          <Text style={styles.paragraph}>
            This platform is owned and operated by Novelty Technologies with its
            registered office at:
            {"\n"}D. No. 25-84/42/FF502, Venu Dharani Apartment,{"\n"}
            P.M Palem, Revenue Ward 4, Visakhapatnam,{"\n"}
            Andhra Pradesh - 530048
          </Text>

          {/* Services Offered */}
          <Text style={styles.sectionTitle}>Services Offered</Text>
          <Text style={styles.paragraph}>
            The Platform enables the sale and delivery of toys for all ages.
            Onlayn serves as the digital interface for transactions between you
            (the "User") and our company.
          </Text>

          {/* Eligibility */}
          <Text style={styles.sectionTitle}>Eligibility to Use</Text>
          <Text style={styles.paragraph}>
            Access is restricted to individuals who are at least 18 years old
            and legally competent to enter binding contracts. Minors are strictly
            prohibited from using the Platform.
          </Text>

          {/* User Account Responsibilities */}
          <Text style={styles.sectionTitle}>User Account Responsibilities</Text>

          <Text style={styles.subSection}>1. Registration & Account Management</Text>
          <Text style={styles.paragraph}>
            To place orders, you must register and log in. You are responsible for
            keeping your details—such as name, address, and phone number—accurate
            and up to date.
          </Text>

          <Text style={styles.subSection}>2. Communication & Preferences</Text>
          <Text style={styles.paragraph}>
            By creating an account, you agree to receive communication from us:
          </Text>
          <View style={styles.bulletList}>
            <Text style={styles.bulletItem}>• Order updates & confirmations</Text>
            <Text style={styles.bulletItem}>• Delivery notifications</Text>
            <Text style={styles.bulletItem}>• Customer support communication</Text>
          </View>

          <Text style={styles.subSection}>3. Data Collection & Privacy</Text>
          <Text style={styles.paragraph}>We collect the following:</Text>
          <View style={styles.bulletList}>
            <Text style={styles.bulletItem}>• Personal Information: Name, contact details, age, gender, address.</Text>
            <Text style={styles.bulletItem}>• Usage Data: Pages visited, products viewed, ordering patterns.</Text>
          </View>
          <Text style={styles.paragraph}>
            All personal and financial data is handled in accordance with our Privacy Policy.
          </Text>

          {/* Payments */}
          <Text style={styles.sectionTitle}>Payments</Text>
          <Text style={styles.paragraph}>
            Currently, we only offer Cash on Delivery (COD). We do not collect or
            store any payment-related information.
          </Text>

          {/* Return & Refund */}
          <Text style={styles.sectionTitle}>Return & Refund Policy</Text>
          <Text style={styles.paragraph}>
            We provide Open Box Delivery. Our delivery partner will open the
            package in front of you. If satisfied, you may pay; otherwise, the
            product will be taken back—no questions asked.
            {"\n"}Hence, there is no separate return or refund policy.
          </Text>

          {/* Delivery */}
          <Text style={styles.sectionTitle}>Delivery</Text>
          <Text style={styles.paragraph}>Products are delivered on the same working day unless:</Text>
          <View style={styles.bulletList}>
            <Text style={styles.bulletItem}>• Order is placed after working hours</Text>
            <Text style={styles.bulletItem}>• Address or location is unclear</Text>
            <Text style={styles.bulletItem}>• Customer is unreachable</Text>
            <Text style={styles.bulletItem}>• Weather disruptions or natural calamities</Text>
            <Text style={styles.bulletItem}>• Strikes, riots, or other disruptions</Text>
          </View>

          {/* Intellectual Property */}
          <Text style={styles.sectionTitle}>Intellectual Property</Text>
          <Text style={styles.paragraph}>
            All content on the Platform—text, images, software, technology—is owned
            by Onlayn or its partners.
          </Text>
          <View style={styles.bulletList}>
            <Text style={styles.bulletItem}>• You may not copy or modify any content.</Text>
            <Text style={styles.bulletItem}>• You may not use Onlayn trademarks or logos.</Text>
          </View>

          {/* Indemnification */}
          <Text style={styles.sectionTitle}>Indemnification</Text>
          <Text style={styles.paragraph}>
            You agree to indemnify and hold Onlayn harmless from any claims, losses,
            or legal fees arising due to:
          </Text>
          <View style={styles.bulletList}>
            <Text style={styles.bulletItem}>• Your posted content</Text>
            <Text style={styles.bulletItem}>• Misuse of the Platform</Text>
            <Text style={styles.bulletItem}>• Violation of laws or these Terms</Text>
          </View>

          {/* Termination */}
          <Text style={styles.sectionTitle}>Termination</Text>
          <Text style={styles.paragraph}>
            You may stop using Onlayn anytime. We may terminate access immediately if:
          </Text>
          <View style={styles.bulletList}>
            <Text style={styles.bulletItem}>• You violate these Terms</Text>
            <Text style={styles.bulletItem}>• Law requires it</Text>
            <Text style={styles.bulletItem}>• Your actions pose risk (fraud, abuse, etc.)</Text>
          </View>

          {/* Limitation of Liability */}
          <Text style={styles.sectionTitle}>Limitation of Liability</Text>
          <Text style={styles.paragraph}>
            The Platform is provided "as is." We are not liable for service
            interruptions, unauthorized access, or indirect damages.
            Maximum liability is limited to the amount paid for the specific order.
          </Text>

          {/* Governing Law */}
          <Text style={styles.sectionTitle}>Governing Law & Jurisdiction</Text>
          <Text style={styles.paragraph}>
            These Terms are governed by the laws of India.
            Courts at Visakhapatnam have exclusive jurisdiction.
          </Text>

          <Text style={styles.paragraph}>
            We may update the Platform or Terms at any time. Changes take effect upon posting.
          </Text>

        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { paddingHorizontal: 20, paddingBottom: 40, margin: 10 },
  header1: { flexDirection: 'row', alignItems: 'center', marginTop: 35, justifyContent: 'space-between' },
  headerText: {
    fontSize: 26,
    fontWeight: 'bold',
    // marginBottom: 10,
    // marginLeft: 5,
        margin:10

  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 20,
    marginBottom: 10,
    color: '#333',
  },
  subSection: {
    fontSize: 15,
    fontWeight: '600',
    marginTop: 10,
  },
  paragraph: {
    fontSize: 14,
    color: '#444',
    lineHeight: 22,
    marginBottom: 10,
  },
  bulletList: { marginTop: 10, paddingLeft: 10 },
  bulletItem: {
    fontSize: 14,
    color: '#444',
    lineHeight: 22,
    marginBottom: 5,
  },
});

export default TermsAndConditionsScreen;
