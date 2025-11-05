import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet, StatusBar } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Icon from "react-native-vector-icons/MaterialCommunityIcons";

const OnboardingScreen = ({navigation}) => {
  return (
    <LinearGradient colors={['#f8d8f6', '#d6e9f9']} style={styles.container}>
      <StatusBar barStyle="dark-content" />

      {/* Top Navigation */}
      <View style={styles.topBar}>
        <TouchableOpacity>
          <Icon name="menu-left" size={24} color="#333" />
        </TouchableOpacity>
      </View>

      {/* Butterfly Image */}
      <Image
        source={require('../Images/add2.png')} // Replace with your own local image path
        style={styles.image}
        resizeMode="contain"
      />

      {/* Pagination Dots */}
      <View style={styles.pagination}>
        <View style={styles.dotActive} />
        <View style={styles.dot} />
      </View>

      {/* Content Card */}
      <View style={styles.contentCard}>
        <Text style={styles.title}>Shop With Ease</Text>
        <Text style={styles.subtitle}>
          Enjoy a Seamless Shopping experience with easy navigation,quick checkout,and order Tracking
        </Text>

        <TouchableOpacity style={styles.nextButton} onPress={()=>navigation.navigate("Add3")}>
          <LinearGradient
            colors={['#fcb0f1', '#d8b4fe']}
            style={styles.nextButtonGradient}
          >
            <Icon name="arrow-right-thick" size={24} color="#fff" />
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </LinearGradient>
  );
};

export default OnboardingScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 20,
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 50,
  },
  skipText: {
    color: '#ff59c0',
    fontWeight: '600',
    fontSize: 16,
  },
  image: {
    width: '100%',
    height: 220,
    alignSelf: 'center',
    marginVertical: 30,
  },
  pagination: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 10,
  },
  dotActive: {
    width: 12,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#ff6ac1',
    marginHorizontal: 5,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#ccc',
    marginHorizontal: 5,
  },
  contentCard: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 20,
    margin: 20,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 8,
    elevation: 5,
    width: '90%',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 20,
  },
  nextButton: {
    alignSelf: 'center',
  },
  nextButtonGradient: {
    padding: 12,
    borderRadius: 30,
    width: 60,
    height: 60,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
