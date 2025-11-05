
import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  Image,
  TouchableOpacity,
  Alert,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import LinearGradient from 'react-native-linear-gradient';
import { launchCamera, launchImageLibrary } from 'react-native-image-picker';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Toast from 'react-native-toast-message';

const EditProfileScreen = () => {
  const navigation = useNavigation();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [imageUri, setImageUri] = useState(null);
  const [loading, setLoading] = useState(false); // 🔹 loading state

  const handleImagePick = () => {
    Alert.alert(
      'Select Image',
      'Choose an option',
      [
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
      ],
      { cancelable: true }
    );
  };

  const handleSave = async () => {
    try {
      setLoading(true);

      const customerId = await AsyncStorage.getItem('id');
      if (!customerId) {
        Toast.show({
          type: 'error',
          text1: 'Error',
          text2: 'Customer ID not found',
        });
        setLoading(false);
        return;
      }

      const formData = new FormData();
      formData.append('_id', customerId);
      formData.append('firstName', name);
      formData.append('email', email);
      formData.append('mobileNumber', phone);

      if (imageUri && !imageUri.includes('http')) {
        const fileName = imageUri.split('/').pop();
        const fileType = fileName.split('.').pop() || 'jpg';
        formData.append('profilePicture', {
          uri: imageUri,
          name: fileName,
          type: `image/${fileType}`,
        });
      }

      const response = await fetch(
        'https://apis.toyshack.in/App/customers/customer-update',
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'multipart/form-data',
          },
          body: formData,
        }
      );

      const result = await response.json();
      console.log('✅ Server Response:', result);

      if (response.ok && result.success) {
        // Save other fields locally
        await AsyncStorage.setItem('Name', name);
        await AsyncStorage.setItem('Email', email);
        await AsyncStorage.setItem('MobileNumber', phone);

        // Update profile picture immediately with cache-busting
        const uploadedFileName = result.customer?.profilePicture;
        if (uploadedFileName) {
          const newUri = `https://apis.toyshack.in/storage/userdp/${uploadedFileName}?t=${Date.now()}`;
          await AsyncStorage.setItem('Image', uploadedFileName);
          setImageUri(newUri); // 🔹 immediately update image
        }

        Toast.show({
          type: 'success',
          text1: 'Profile updated successfully',
        });

        navigation.goBack();
      } else {
        Toast.show({
          type: 'error',
          text1: 'Update failed',
          text2: result.message || 'Unknown error occurred',
        });
      }
    } catch (error) {
      console.error('❌ Update error:', error);
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Something went wrong while updating profile',
      });
    } finally {
      setLoading(false);
    }
  };

  // useFocusEffect remains mostly the same, just add cache-busting when loading stored image
  useFocusEffect(
    useCallback(() => {
      const fetchData = async () => {
        try {
          const img = await AsyncStorage.getItem('Image');
          const mail = await AsyncStorage.getItem('Email');
          const na = await AsyncStorage.getItem('Name');
          const ph = await AsyncStorage.getItem('MobileNumber');

          if (img) {
            setImageUri(`https://apis.toyshack.in/storage/userdp/${img}?t=${Date.now()}`);
          }
          setName(na || '');
          setEmail(mail || '');
          setPhone(ph || '');
        } catch (error) {
          console.error('❌ Error loading profile data:', error);
        }
      };

      fetchData();
    }, [])
  );

  return (
    <LinearGradient colors={['white', 'white']} style={styles.gradient}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
      >
        <ScrollView
          contentContainerStyle={styles.container}
          keyboardShouldPersistTaps="handled"
        >
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity onPress={() => navigation.goBack()}>
              <Icon name="menu-left" size={36} color="#000" />
            </TouchableOpacity>
            <Text style={styles.title}>Edit Profile</Text>
            <Text style={styles.saveText}></Text>
          </View>

          {/* Profile Image */}
          <View style={styles.profileContainer}>
            <TouchableOpacity onPress={handleImagePick}>
              <Image
                source={
                  imageUri ? { uri: imageUri } : require('../Images/account.png')
                }
                style={styles.avatar}
              />
              <View style={styles.editIcon}>
                <Icon name="pencil" size={16} color="#fff" />
              </View>
            </TouchableOpacity>
          </View>

          {/* Input Fields */}
          <View style={styles.inputContainer}>
            <TextInput
              placeholder="Name"
              value={name}
              onChangeText={setName}
              placeholderTextColor="black"
              style={styles.input}
            />
            <TextInput
              placeholder="Email"
              value={email}
              onChangeText={setEmail}
              placeholderTextColor="black"
              style={styles.input}
              keyboardType="email-address"
            />
            <TextInput
              placeholder="Phone No."
              value={phone}
              onChangeText={setPhone}
              style={styles.input}
              placeholderTextColor="black"
              keyboardType="phone-pad"
            />
          </View>

          {/* Save Button */}
          <TouchableOpacity
            style={styles.deleteBtn}
            onPress={handleSave}
            disabled={loading} // 🔹 disable while loading
          >
            <LinearGradient
              colors={['navy', 'navy', 'navy']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.deleteGradient}
            >
              {loading ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <Text style={styles.deleteText}>Save</Text>
              )}
            </LinearGradient>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  gradient: { flex: 1 },
  container: { padding: 20, paddingBottom: 40 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 25,
    marginTop: 20,
  },
  title: { fontSize: 18, fontWeight: 'bold' },
  saveText: { fontSize: 16, color: '#8A2BE2', fontWeight: 'bold' },
  profileContainer: { alignItems: 'center', marginBottom: 30 },
  avatar: { width: 110, height: 120, borderRadius: 55 },
  editIcon: {
    position: 'absolute',
    bottom: 5,
    right: -5,
    backgroundColor: '#F06E9C',
    borderRadius: 20,
    padding: 5,
  },
  inputContainer: { gap: 15 },
  input: {
    backgroundColor: '#fff',
    padding: 12,
    borderRadius: 10,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#ccc',
    color: '#000'
  },
  deleteBtn: {
    marginTop: 40,
    alignSelf: 'center',
    width: '60%',
    borderRadius: 30,
  },
  deleteGradient: {
    paddingVertical: 12,
    borderRadius: 30,
    alignItems: 'center',
  },
  deleteText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
  },
});

export default EditProfileScreen;
