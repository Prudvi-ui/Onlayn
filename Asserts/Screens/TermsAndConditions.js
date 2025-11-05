import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  TouchableOpacity
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

const TermsAndConditionsScreen = ({ navigation }) => {
  return (
    <LinearGradient colors={['white', 'white']} style={styles.container}>
      <SafeAreaView style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.content}>
          {/* Header */}
          <View style={styles.header1}>
            <TouchableOpacity onPress={() => navigation.goBack()}>
              <Icon name="menu-left" size={34} color="#333" />
            </TouchableOpacity>
          </View>
          <View style={styles.header}>
            <Text style={styles.headerText}>Terms & Conditions</Text>
          </View>

          {/* Section: Information We Collect From You */}
          <Text style={styles.sectionTitle}>Information We Collect From You</Text>
          <Text style={styles.paragraph}>
            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Ut ullamcorper tortor vel semper maximus. Nam volutpat, magna vitae pharetra dictum, dolor magna tempor velit, nec varius libero lectus id odio. Nulla facilisi.
          </Text>
          <View style={styles.bulletList}>
            <Text style={styles.bulletItem}>
              • Lorem ipsum dolor sit amet, consectetur adipiscing elit.
            </Text>
            <Text style={styles.bulletItem}>
              • Quisque vestibulum, mi id commodo pulvinar, nisi libero bibendum quam, ut faucibus tortor est id dui.
            </Text>
            <Text style={styles.bulletItem}>
              • Cras porttitor placerat ipsum, vel tincidunt odio volutpat non.
            </Text>
          </View>

          {/* Section: Services & Offers */}
          <Text style={styles.sectionTitle}>Services & Offers</Text>
          <Text style={styles.paragraph}>
            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Ut ullamcorper tortor vel semper maximus. Nam volutpat, magna vitae pharetra dictum, dolor magna tempor velit, nec varius libero lectus id odio. Nulla facilisi.
          </Text>
          <View style={styles.bulletList}>
            <Text style={styles.bulletItem}>
              • Lorem ipsum dolor sit amet, consectetur adipiscing elit.
            </Text>
            <Text style={styles.bulletItem}>
              • Quisque vestibulum, mi id commodo pulvinar, nisi libero bibendum quam, ut faucibus tortor est id dui.
            </Text>
            <Text style={styles.bulletItem}>
              • Cras porttitor placerat ipsum, vel tincidunt odio volutpat non.
            </Text>
          </View>

          {/* Section: Service Free */}
          <Text style={styles.sectionTitle}>Service Free</Text>
          <Text style={styles.paragraph}>
            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Ut ullamcorper tortor vel semper maximus. Nam volutpat, magna vitae pharetra dictum, dolor magna tempor velit, nec varius libero lectus id odio. Nulla facilisi.
          </Text>
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 20,
    paddingBottom: 40,
    margin: 10
  },
  // header: {
  //   marginTop: 30,
  //   alignItems: 'center',
  // },
  header1: {
    flexDirection: 'row',
    alignItems: 'center',
    // paddingHorizontal: 16,
    // paddingVertical: 10,
    marginTop: 20,
  },
 
  headerText: {
    fontSize: 26, marginLeft: 10,
    fontWeight: 'bold',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 20,
    marginBottom: 10,
    color: '#333',
  },
  paragraph: {
    fontSize: 14,
    color: '#444',
    lineHeight: 22,
  },
  bulletList: {
    marginTop: 10,
    paddingLeft: 10,
  },
  bulletItem: {
    fontSize: 14,
    color: '#444',
    lineHeight: 22,
    marginBottom: 5,
  },
});

export default TermsAndConditionsScreen;
