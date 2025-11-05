// import React, { useEffect, useRef } from 'react';
// import { StyleSheet, View, Image, Animated } from 'react-native';
// import AsyncStorage from '@react-native-async-storage/async-storage';
// import LinearGradient from 'react-native-linear-gradient';

// const Splash = ({ navigation }) => {
//   const scaleValue = useRef(new Animated.Value(0)).current;

//   useEffect(() => {
//     const checkLoginStatus = async () => {
//       const login = await AsyncStorage.getItem('RELOGIN');
//       const parsedLogin = login ? JSON.parse(login) : null;
//       const hasSeenAddScreen = await AsyncStorage.getItem('hasSeenAddScreen');

//       // Animate splash logo
//       Animated.timing(scaleValue, {
//         toValue: 1,
//         duration: 1000,
//         useNativeDriver: true,
//       }).start();

//       // Wait 2 seconds and navigate accordingly
//       setTimeout(() => {
//         if (parsedLogin) {
//           if (hasSeenAddScreen === 'true') {
//             navigation.replace('Main');
//           } else {
//             navigation.replace('Add1'); // First time after login
//           }
//         } else {
//           navigation.replace('LoginSignupScreen'); // User not logged in yet
//         }
//       }, 2000);
//     };

//     checkLoginStatus();
//   }, []);

//   return (
//     <LinearGradient colors={['#f9f6ff', '#d6e8ff']} style={styles.container}>
//       <Animated.View
//         style={[
//           styles.logoContainer,
//           {
//             transform: [{ scale: scaleValue }],
//           },
//         ]}
//       >
//         <Image
//           source={require('../Images/mainlogosplash.png')}
//           style={styles.logo}
//         />
//       </Animated.View>
//     </LinearGradient>
//   );
// };


// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     justifyContent: 'center',
//     alignItems: 'center',
//   },
//   logoContainer: {
//     width: '90%',
//     height: '100%',
//     justifyContent: 'center',
//     alignItems: 'center',
//   },
//   logo: {
//     width: 350,
//     height: 350,
//     borderRadius: 250,
//   },
// });

// export default Splash;



import React, { useEffect, useRef } from 'react';
import { StyleSheet, View, Image, Animated } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import LinearGradient from 'react-native-linear-gradient';

const Splash = ({ navigation }) => {
  const scaleValue = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const checkLoginStatus = async () => {
      try {
        // Small delay ensures AsyncStorage is ready
        await new Promise(resolve => setTimeout(resolve, 500));

        const login = await AsyncStorage.getItem('RELOGIN');
        const hasSeenAddScreen = await AsyncStorage.getItem('hasSeenAddScreen');

        const parsedLogin = login === 'true' || login === true;

        // Animate splash logo
        Animated.timing(scaleValue, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }).start();

        // Give animation a moment before navigating
        setTimeout(() => {
          if (parsedLogin) {
            if (hasSeenAddScreen === 'true') {
              navigation.replace('Main');
            } else {
              navigation.replace('Add1');
            }
          } else {
            navigation.replace('LoginSignupScreen');
          }
        }, 1800);
      } catch (error) {
        console.log('Error checking login:', error);
        navigation.replace('LoginSignupScreen');
      }
    };

    checkLoginStatus();
  }, [navigation, scaleValue]);

  return (
    <LinearGradient colors={['#f9f6ff', '#d6e8ff']} style={styles.container}>
      <Animated.View
        style={[
          styles.logoContainer,
          { transform: [{ scale: scaleValue }] },
        ]}
      >
        <Image
          source={require('../Images/mainlogosplash.png')}
          style={styles.logo}
        />
      </Animated.View>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  logoContainer: { width: '90%', height: '100%', justifyContent: 'center', alignItems: 'center' },
  logo: { width: 350, height: 350, borderRadius: 250 },
});

export default Splash;
