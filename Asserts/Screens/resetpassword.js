// import Toast from 'react-native-toast-message';
// import React, { useState } from 'react';
// import {
//   View,
//   Text,
//   TextInput,
//   StyleSheet,
//   TouchableOpacity,
//   SafeAreaView,
//   ActivityIndicator
// } from 'react-native';
// import LinearGradient from 'react-native-linear-gradient';
// import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
// import { useNavigation } from '@react-navigation/native';

// export default function ResetPasswordScreen() {
//   const navigation = useNavigation();
//   const [email, setEmail] = useState('');
//   const [password, setPassword] = useState('');
//   const [confirmPassword, setConfirmPassword] = useState('');
//   const [loading, setLoading] = useState(false);
//   const [showPassword, setShowPassword] = useState(false);
//   const [showConfirmPassword, setShowConfirmPassword] = useState(false);

//   const resetpassword = async () => {
//     if (password !== confirmPassword) {
//       Toast.show({
//         type: 'error',
//         text1: 'Error',
//         text2: 'Passwords do not match',
//       });
//       return;
//     }

//     setLoading(true);

//     try {
//       const response = await fetch(
//         'https://apis.toyshack.in/App/customers/forgot-password',
//         {
//           method: 'POST',
//           headers: {
//             Accept: 'application/json',
//             'Content-Type': 'application/json',
//           },
//           body: JSON.stringify({
//             email: email,
//             newPassword: password,
//           }),
//         }
//       );

//       const responseText = await response.text();
//       console.log('Response Text:', responseText);

//       const data = JSON.parse(responseText);
//       console.log('Parsed Response Data:', data);

//       if (data.message === 'Password updated successfully') {
//         Toast.show({
//           type: 'success',
//           text1: 'Success',
//           text2: 'Password updated successfully!',
//         });
//         navigation.navigate('LoginSignupScreen');
//       } else {
//         Toast.show({
//           type: 'error',
//           text1: 'Error',
//           text2: data?.message || 'Update failed',
//         });
//       }
//     } catch (error) {
//       Toast.show({
//         type: 'error',
//         text1: 'Invalid Email',
//       });
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <SafeAreaView style={styles.container}>
//       <View style={styles.topBar}>
//         <TouchableOpacity onPress={() => navigation.goBack()}>
//           <Icon name="chevron-left" size={30} color="#333" />
//         </TouchableOpacity>
//       </View>

//       <Text style={styles.title}>Reset Password</Text>
//       <Text style={styles.subtitle}>Enter your new password below.</Text>

//       <TextInput
//         style={styles.emailInput}
//         placeholder="Enter your email"
//         placeholderTextColor="#999"
//         keyboardType="email-address"
//         autoCapitalize="none"
//         value={email}
//         onChangeText={setEmail}
//       />

//       {/* Password Input */}
//       <View style={styles.inputContainer}>
//         <TextInput
//           style={styles.input}
//           placeholder="New Password"
//           placeholderTextColor="#888"
//           secureTextEntry={!showPassword}
//           value={password}
//           onChangeText={setPassword}
//         />
//         <TouchableOpacity
//           style={styles.eyeIcon}
//           onPress={() => setShowPassword(!showPassword)}
//         >
//           <Icon
//             name={showPassword ? 'eye-off' : 'eye'}
//             size={24}
//             color="#666"
//           />
//         </TouchableOpacity>
//       </View>

//       {/* Confirm Password Input */}
//       <View style={styles.inputContainer}>
//         <TextInput
//           style={styles.input}
//           placeholder="Confirm Password"
//           placeholderTextColor="#888"
//           secureTextEntry={!showConfirmPassword}
//           value={confirmPassword}
//           onChangeText={setConfirmPassword}
//         />
//         <TouchableOpacity
//           style={styles.eyeIcon}
//           onPress={() => setShowConfirmPassword(!showConfirmPassword)}
//         >
//           <Icon
//             name={showConfirmPassword ? 'eye-off' : 'eye'}
//             size={24}
//             color="#666"
//           />
//         </TouchableOpacity>
//       </View>

//       <LinearGradient
//         colors={['#fcb0f2', '#a18cd1']}
//         style={styles.button}
//         start={{ x: 0, y: 0 }}
//         end={{ x: 1, y: 1 }}
//       >
//         <TouchableOpacity
//           onPress={resetpassword}
//           disabled={loading} // Disable button while loading
//           style={{ flexDirection: 'row', justifyContent: 'center', alignItems: 'center' }}
//         >
//           {loading ? (
//             <ActivityIndicator size="small" color="#fff" />
//           ) : (
//             <Text style={styles.buttonText}>Reset Password</Text>
//           )}
//         </TouchableOpacity>
//       </LinearGradient>


//       <Toast />
//     </SafeAreaView>
//   );
// }

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: '#e5d4ff',
//     alignItems: 'center',
//     padding: 24,
//   },
//   emailInput: {
//     width: '100%',
//     height: 50,
//     borderRadius: 10,
//     borderWidth: 1.5,
//     borderColor: '#ccc',
//     paddingHorizontal: 16,
//     fontSize: 16,
//     backgroundColor: '#fff',
//     color: '#000',
//     marginBottom: 15,
//   },
//   topBar: {
//     flexDirection: 'row',
//     justifyContent: 'flex-start',
//     width: '100%',
//     marginTop: 20,
//     marginBottom: 40,
//   },
//   title: {
//     color: 'black',
//     fontSize: 24,
//     fontWeight: 'bold',
//     marginBottom: 10,
//   },
//   subtitle: {
//     color: 'black',
//     fontSize: 14,
//     textAlign: 'center',
//     marginBottom: 40,
//     paddingHorizontal: 10,
//   },
//   inputContainer: {
//     width: '100%',
//     position: 'relative',
//     marginBottom: 20,
//   },
//   input: {
//     width: '100%',
//     height: 55,
//     borderWidth: 1,
//     borderColor: '#ccc',
//     borderRadius: 10,
//     paddingHorizontal: 15,
//     fontSize: 16,
//     backgroundColor: '#fff',
//     color: '#000',
//   },
//   eyeIcon: {
//     position: 'absolute',
//     right: 15,
//     top: 15,
//   },
//   button: {
//     paddingVertical: 14,
//     paddingHorizontal: 80,
//     borderRadius: 30,
//   },
//   buttonText: {
//     color: '#fff',
//     fontSize: 18,
//     fontWeight: '700',
//     textAlign: 'center',
//   },
// });


import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  ActivityIndicator,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useNavigation } from '@react-navigation/native';
import Toast, { BaseToast, ErrorToast } from 'react-native-toast-message';

const toastConfig = {
  success: (props) => (
    <BaseToast
      {...props}
      style={{ backgroundColor: 'navy', borderRadius: 20 }}
      contentContainerStyle={{ paddingHorizontal: 15 }}
      text1Style={{ fontSize: 16, fontWeight: 'bold', color: 'white' }}
      text2Style={{ fontSize: 14, color: 'white' }}
    />
  ),
  error: (props) => (
    <ErrorToast
      {...props}
      style={{ backgroundColor: '#dd4f5bff', borderRadius: 20 }}
      text1Style={{ fontSize: 16, fontWeight: 'bold', color: 'white' }}
      text2Style={{ fontSize: 14, color: 'white' }}
    />
  ),
  customToast: ({ text1, text2 }) => (
    <View
      style={{
        width: '90%',
        padding: 12,
        borderRadius: 10,
        backgroundColor: 'navy',
        alignSelf: 'center',
      }}
    >
      <Text style={{ color: 'white', fontWeight: 'bold', fontSize: 16 }}>
        {text1}
      </Text>
      <Text style={{ color: 'white', fontSize: 14 }}>{text2}</Text>
    </View>
  ),
};

export default function ResetPasswordScreen() {
  const navigation = useNavigation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const resetpassword = async () => {
    if (password !== confirmPassword) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Passwords do not match',
      });
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(
        'https://apis.toyshack.in/App/customers/forgot-password',
        {
          method: 'POST',
          headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ email, newPassword: password }),
        }
      );

      const responseText = await response.text();
      const data = JSON.parse(responseText);

      if (data.message === 'Password updated successfully') {
        Toast.show({
          type: 'success',
          text1: 'Success',
          text2: 'Password updated successfully!',
        });
        navigation.navigate('LoginSignupScreen');
      } else {
        Toast.show({
          type: 'error',
          text1: 'Error',
          text2: data?.message || 'Update failed',
        });
      }
    } catch (error) {
      Toast.show({ type: 'error', text1: 'Invalid Email' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.topBar}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Icon name="chevron-left" size={30} color="#333" />
        </TouchableOpacity>
      </View>

      <Text style={styles.title}>Reset Password</Text>
      <Text style={styles.subtitle}>Enter your new password below.</Text>

      <TextInput
        style={styles.emailInput}
        placeholder="Enter your email"
        placeholderTextColor="#999"
        keyboardType="email-address"
        autoCapitalize="none"
        value={email}
        onChangeText={setEmail}
      />

      {/* Password Input */}
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="New Password"
          placeholderTextColor="#888"
          secureTextEntry={!showPassword}
          value={password}
          onChangeText={setPassword}
        />
        <TouchableOpacity
          style={styles.eyeIcon}
          onPress={() => setShowPassword(!showPassword)}
        >
          <Icon name={showPassword ? 'eye-off' : 'eye'} size={24} color="#666" />
        </TouchableOpacity>
      </View>

      {/* Confirm Password Input */}
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="Confirm Password"
          placeholderTextColor="#888"
          secureTextEntry={!showConfirmPassword}
          value={confirmPassword}
          onChangeText={setConfirmPassword}
        />
        <TouchableOpacity
          style={styles.eyeIcon}
          onPress={() => setShowConfirmPassword(!showConfirmPassword)}
        >
          <Icon
            name={showConfirmPassword ? 'eye-off' : 'eye'}
            size={24}
            color="#666"
          />
        </TouchableOpacity>
      </View>

      {/* Reset Password Button */}
      <LinearGradient
        colors={['#fcb0f2', '#a18cd1']}
        style={styles.button}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <TouchableOpacity
          onPress={resetpassword}
          disabled={loading}
          style={{ flexDirection: 'row', justifyContent: 'center', alignItems: 'center' }}
        >
          {loading ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <Text style={styles.buttonText}>Reset Password</Text>
          )}
        </TouchableOpacity>
      </LinearGradient>

      <Toast config={toastConfig} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#e5d4ff',
    alignItems: 'center',
    padding: 24,
  },
  emailInput: {
    width: '100%',
    height: 50,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: '#ccc',
    paddingHorizontal: 16,
    fontSize: 16,
    backgroundColor: '#fff',
    color: '#000',
    marginBottom: 15,
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    width: '100%',
    marginTop: 20,
    marginBottom: 40,
  },
  title: {
    color: 'black',
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  subtitle: {
    color: 'black',
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 40,
    paddingHorizontal: 10,
  },
  inputContainer: {
    width: '100%',
    position: 'relative',
    marginBottom: 20,
  },
  input: {
    width: '100%',
    height: 55,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 10,
    paddingHorizontal: 15,
    fontSize: 16,
    backgroundColor: '#fff',
    color: '#000',
  },
  eyeIcon: {
    position: 'absolute',
    right: 15,
    top: 15,
  },
  button: {
    paddingVertical: 14,
    paddingHorizontal: 80,
    borderRadius: 30,
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
    textAlign: 'center',
  },
});
