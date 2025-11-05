import React, { useState, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert, // ✅ Added this
  ActivityIndicator
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useFocusEffect } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Toast from 'react-native-toast-message';

const ContactUsScreen = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [mobileNumber, setMobileNumber] = useState('');
  const [name, setName] = useState('');

  const [loading, setLoading] = useState(false);


  const createsupport = async () => {
    if (!email || !message || !mobileNumber) {
      Toast.show({
        type: 'error',
        text1: 'Validation Error',
        text2: 'Please fill out all fields',
      });
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(`https://apis.toyshack.in/App/contactus/create-Support`, {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ Name: name, email, mobileNumber, message }), // ✅ Fixed body
      });

      const responseText = await response.text();
      const data = JSON.parse(responseText);

      if (data.message === 'contactus Created successfully') {
        Toast.show({
          type: 'success',
          text1: 'Success',
          text2: 'Your message has been sent.',
        });

        navigation.goBack();
      } else {
        Toast.show({
          type: 'error',
          text1: 'Error',
          text2: data?.message || 'Submission failed',
        });
      }
    } catch (error) {
      console.error('Submission Error:', error);
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Something went wrong. Please try again later.',
      });
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      const fetchData = async () => {
        try {
          const mail = await AsyncStorage.getItem("Email");
          console.log("img==>", mail)
          const na = await AsyncStorage.getItem("Name");
          const mm = await AsyncStorage.getItem("MobileNumber");

          console.log("img==>", na)
          setName(na);
          setEmail(mail);
          setMobileNumber(mm)
        } catch (error) {
          console.error("❌ Error loading profile data:", error);
        }
      };

      fetchData();
    }, [])
  );


  return (
    <LinearGradient colors={['white', 'white']} style={styles.container}>
      <SafeAreaView style={{ flex: 1 }}>
        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
          <ScrollView contentContainerStyle={styles.content}>
            {/* Header */}
            <View style={styles.header}>
              <TouchableOpacity onPress={() => navigation.goBack()}>
                <Icon name="menu-left" size={35} />
              </TouchableOpacity>
              <Text style={styles.headerText}>Contact Us</Text>
            </View>

            <TextInput
              placeholder="Name"
              placeholderTextColor="black"
              style={styles.input}
              value={name}
              onChangeText={setName}
              keyboardType="email-address"
            />
            {/* Email Input */}
            <TextInput
              placeholder="Email"
              placeholderTextColor="black"
              style={styles.input}
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
            />

            {/* Phone Number Input */}
            <TextInput
              placeholder="Phone Number"
              placeholderTextColor="black"
              style={styles.input}
              value={mobileNumber}
              onChangeText={setMobileNumber}
              keyboardType="number-pad"
            />

            {/* Message Box */}
            <TextInput
              placeholder="How can we help you?"
              placeholderTextColor="black"
              style={[styles.input, styles.textArea]}
              value={message}
              onChangeText={setMessage}
              multiline={true}
              numberOfLines={4}
            />

            {/* Submit Button */}
            <LinearGradient
              colors={['navy', 'navy']}
              style={styles.submitButton}
            >
              <TouchableOpacity
                onPress={createsupport}
                disabled={loading} // prevent multiple taps
                style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center'}}
              >
                {loading ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <Text style={styles.submitText}>Submit</Text>
                )}
              </TouchableOpacity>
            </LinearGradient>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </LinearGradient>
  );
};
const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: 20,
    justifyContent: 'flex-start',
    flexGrow: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 30,
    marginTop:10
  },
  headerText: {
    fontSize: 18,
    marginLeft: 10,
    fontWeight: 'bold',
  },
  input: {
    backgroundColor: '#fff',
    borderRadius: 10,
    paddingHorizontal: 15,
    paddingVertical: 12,
    fontSize: 14,
    color: '#000',
    marginBottom: 20,
    borderWidth: 0.5,
    borderColor: 'gray'
  },
  textArea: {
    height: 120,
    textAlignVertical: 'top',
  },
  submitButton: {
    marginTop: 'auto',
    borderRadius: 30,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  submitText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
  },
});

export default ContactUsScreen;
