import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
  ActivityIndicator,
  Modal,
  StatusBar,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { launchCamera, launchImageLibrary } from 'react-native-image-picker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Toast from 'react-native-toast-message';

export default function LoginSignupScreen({ navigation }) {
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [name, setName] = useState('');
  const [phno, setPhno] = useState('');
  const [pinCode, setPinCode] = useState('');
  const [imageUri, setImageUri] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSelectImage = () => {
    Alert.alert('Select Image', 'Choose an option', [
      {
        text: 'Camera',
        onPress: () => {
          launchCamera({ mediaType: 'photo' }, (response) => {
            if (!response.didCancel && !response.errorCode) {
              const uri = response.assets?.[0]?.uri;
              if (uri) setImageUri(uri);
            }
          });
        },
      },
      {
        text: 'Gallery',
        onPress: () => {
          launchImageLibrary({ mediaType: 'photo' }, (response) => {
            if (!response.didCancel && !response.errorCode) {
              const uri = response.assets?.[0]?.uri;
              if (uri) setImageUri(uri);
            }
          });
        },
      },
      { text: 'Cancel', style: 'cancel' },
    ]);
  };

  const getServerUrl = () => {
    return Platform.OS === 'android' ? 'https://apis.toyshack.in' : 'http://localhost:3001';
  };

  // ✅ Password policy function
  const validatePassword = (pwd) => {
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    return passwordRegex.test(pwd);
  };

  const handleSignup = async () => {
    if (!name || !email || !phno || !password || !confirmPassword) {
      Toast.show({
        type: 'error',
        text1: 'Validation Error',
        text2: 'Please fill all required fields',
      });
      return;
    }

    if (password !== confirmPassword) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Passwords do not match',
      });
      return;
    }

    if (!validatePassword(password)) {
      Toast.show({
        type: 'error',
        text1: 'Weak Password',
        text2: 'Password must be at least 8 characters long and include uppercase, lowercase, number, and special character',
      });
      return;
    }

    setLoading(true);

    try {
      const formData = new FormData();
      formData.append('firstName', name);
      formData.append('email', email);
      formData.append('mobileNumber', phno);
      formData.append('password', password);
      formData.append('pinCode', pinCode);

      // ✅ Only append image if user selected one
      if (imageUri) {
        const filename = imageUri.split('/').pop();
        const match = /\.(\w+)$/.exec(filename ?? '');
        const type = match ? `image/${match[1]}` : `image/jpeg`;

        formData.append('profilePicture', { uri: imageUri, name: filename, type });
      }

      const response = await fetch(`${getServerUrl()}/App/customers/register`, {
        method: 'POST',
        headers: { Accept: 'application/json' },
        body: formData,
      });

      const responseText = await response.text();
      const data = JSON.parse(responseText);

      if (data.message === 'Customer added successfully') {
        Toast.show({
          type: 'success',
          text1: 'Success',
          text2: 'Registration Successful!',
        });
        setIsLogin(true);
      } else {
        Toast.show({
          type: 'error',
          text1: 'Warning',
          text2: data?.message || 'Registration failed',
        });
      }
    } catch (error) {
      console.error('Registration error:', error);
      Toast.show({
        type: 'error',
        text1: 'Warning',
        text2: 'Something went wrong during registration',
      });
    } finally {
      setLoading(false);
    }
  };


  const handleLogin = async () => {
    if (!email || !password) {
      Toast.show({
        type: 'error',
        text1: 'Validation Error',
        text2: 'Please enter both email and password',
      });
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(`${getServerUrl()}/App/customers/login`, {
        method: 'POST',
        headers: { Accept: 'application/json', 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const responseText = await response.text();
      const data = JSON.parse(responseText);

      if (data.message === 'Login successful') {
        await AsyncStorage.setItem('RELOGIN', JSON.stringify(true));
        await AsyncStorage.setItem('id', data.customer._id);
        await AsyncStorage.setItem('Name', data.customer.firstName);
        await AsyncStorage.setItem('Email', data.customer.email);
        await AsyncStorage.setItem('MobileNumber', data.customer.mobileNumber);
        await AsyncStorage.setItem('Image', data.customer.profilePicture || "");
        await AsyncStorage.setItem('postalcode', data.customer.pinCode);

        navigation.navigate('Main');
      } else {
        Toast.show({
          type: 'error',
          text1: 'Error',
          text2: data?.message || 'Login failed',
        });
      }
    } catch (error) {
      console.error('Login Error:', error);
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Something went wrong. Please try again later.',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar backgroundColor="#E8F6FF" barStyle="dark-content" />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
      >
        <ScrollView contentContainerStyle={{ paddingBottom: 20 }}>
          <Image source={require('../Images/onlaynwithoutbglogo.png')} style={styles.logo} resizeMode="contain" />

          <View style={styles.tabContainer}>
            <TouchableOpacity onPress={() => setIsLogin(true)}>
              <Text style={[styles.tabText, isLogin && styles.activeTab]}>Log in</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setIsLogin(false)}>
              <Text style={[styles.tabText, !isLogin && styles.activeTab]}>Sign up</Text>
            </TouchableOpacity>
          </View>

          {!isLogin && (
            <TouchableOpacity onPress={handleSelectImage}>
              <View style={styles.imageContainer}>
                <Image
                  style={styles.image}
                  source={imageUri ? { uri: imageUri } : require('../Images/account.png')}
                />
                <TouchableOpacity style={styles.editIconContainer} onPress={handleSelectImage}>
                  <Icon name="lead-pencil" size={20} color="#fff" />
                </TouchableOpacity>
              </View>
            </TouchableOpacity>
          )}

          {!isLogin && (
            <TextInput
              placeholder="Name"
              placeholderTextColor="black"
              style={styles.input}
              value={name}
              onChangeText={setName}
            />
          )}
          <TextInput
            placeholder="Email"
            placeholderTextColor="black"
            style={styles.input}
            value={email}
            onChangeText={setEmail}
          />
          {!isLogin && (
            <TextInput
              placeholder="Phone Number"
              placeholderTextColor="black"
              style={styles.input}
              keyboardType="phone-pad"
              value={phno}
              onChangeText={setPhno}
            />
          )}
          {!isLogin && (
            <TextInput
              placeholder="Postal Code"
              placeholderTextColor="black"
              style={styles.input}
              value={pinCode}
              onChangeText={setPinCode}
            />
          )}
          <View style={styles.passwordContainer}>
            <TextInput
              placeholder="Password"
              placeholderTextColor="black"
              secureTextEntry={!showPassword}
              style={styles.passwordInput}
              value={password}
              onChangeText={setPassword}
            />
            <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
              <Icon name={showPassword ? 'eye-off-outline' : 'eye-outline'} size={20} color="#888" />
            </TouchableOpacity>
          </View>
          {!validatePassword(password) && password.length > 0 && (
            <Text style={{ color: 'red', marginBottom: 10, fontSize: 12 }}>
              Password must be 8+ chars, include uppercase, lowercase, number & special char
            </Text>
          )}

          {!isLogin && (
            <View style={styles.passwordContainer}>
              <TextInput
                placeholder="Confirm Password"
                placeholderTextColor="black"
                secureTextEntry={!showConfirmPassword}
                style={styles.passwordInput}
                value={confirmPassword}
                onChangeText={setConfirmPassword}
              />
              <TouchableOpacity onPress={() => setShowConfirmPassword(!showConfirmPassword)}>
                <Icon
                  name={showConfirmPassword ? 'eye-off-outline' : 'eye-outline'}
                  size={20}
                  color="#888"
                />
              </TouchableOpacity>
            </View>
          )}

          {isLogin && (
            <TouchableOpacity
              style={styles.forgotPassword}
              onPress={() => navigation.navigate('ResetPasswordScreen')}
            >
              <Text style={styles.forgotText}>Forgot Password?</Text>
            </TouchableOpacity>
          )}

          1. Replace your button part:
          <TouchableOpacity
            onPress={isLogin ? handleLogin : handleSignup}
            disabled={loading} // disable while loading
          >
            <LinearGradient
              colors={['#fcb0f2', '#a18cd1']}
              style={styles.button}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              {loading ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <Text style={styles.buttonText}>{isLogin ? 'Log in' : 'Sign up'}</Text>
              )}
            </LinearGradient>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}


const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 40,
    backgroundColor: '#e5d4ff',
  },
  logo: {
    width: 280,
    height: 280,
    alignSelf: 'center',
    marginBottom: 10,
  },
  tabContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 20,
    gap: 40,
  },
  tabText: {
    fontSize: 18,
    color: '#666',
    fontWeight: '600',
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: '#c86dd7',
    color: '#000',
  },
  input: {
    backgroundColor: '#fff',
    borderRadius: 10,
    paddingHorizontal: 14,
    fontSize: 16,
    height: 50,
    width: '100%',
    marginBottom: 15,
    color: '#000'
  },
  passwordContainer: {
    backgroundColor: '#fff',
    borderRadius: 10,
    paddingHorizontal: 14,
    height: 50,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
    width: '100%',
  },
  passwordInput: {
    flex: 1,
    fontSize: 16,
    color: '#000', // 👈 force password dots / text to black
  },
  forgotPassword: {
    alignItems: 'flex-end',
    marginBottom: 20,
  },
  forgotText: {
    color: '#4b4b4b',
    textDecorationLine: 'underline',
  },
  button: {
    marginTop: 25,
    paddingVertical: 15,
    borderRadius: 30,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
  },
  editIconContainer: {
    position: 'absolute',
    bottom: 5,
    right: 5,
    backgroundColor: '#00000088',
    borderRadius: 20,
    padding: 5,
  },
  imageContainer: {
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 10,
  },
  image: {
    width: 200,
    height: 150,
    resizeMode: 'contain',
    borderRadius: 10,
  },
  loadingOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#fff',
    fontWeight: 'bold',
  },
});
