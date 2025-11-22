import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Linking
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import LinearGradient from 'react-native-linear-gradient';

export default function About({ navigation }) {

  // ⭐ Testimonials Data
   const testimonials = [
        {
            id: "1",
            rating: 4,
            text: "Great variety of toys. The car set I bought was sturdy and safe. Excellent customer support as well.",
            name: "Rajiv K.",
            avatar: "https://images.unsplash.com/photo-1599566150163-29194dcaad36?auto=format&fit=crop&w=200&q=80",
        },
        {
            id: "2",
            rating: 5,
            text: "Absolutely love the toy quality! My little one plays with the plush bear every day. Great service too!",
            name: "Aarav’s Mom",
            avatar: "https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?auto=format&fit=crop&w=200&q=80",
        },
        {
            id: "3",
            rating: 5,
            text: "Fast delivery and beautifully packed. The art set kept my kids busy for hours. Highly recommended!",
            name: "Reema D.",
            avatar: "https://images.pexels.com/photos/415829/pexels-photo-415829.jpeg?auto=compress&cs=tinysrgb&h=200",
        },
         {
            id: "4",
            rating: 5,
            text: "Loved the building blocks! My nephew is obsessed. Super easy checkout and fast shipping.",
            name: "Kiran P.",
            avatar: "https://images.unsplash.com/photo-1552058544-f2b08422138a?auto=format&fit=crop&w=200&q=80",
        },
         {
            id: "5",
            rating: 5,
            text: "Fast delivery and beautifully packed. The art set kept my kids busy for hours. Highly recommended!",
            name: "Manish",
            avatar: "https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&h=200",
        },
    ];
  // ⭐ State for active testimonial
  const [currentIndex, setCurrentIndex] = useState(0);

  // ⭐ Render star icons
  const renderStars = (count) => {
    return [...Array(5)].map((_, i) => (
      <Icon
        key={i}
        name={i < count ? "star" : "star-outline"}
        size={20}
        color="#FFD700"
        style={{ marginRight: 2 }}
      />
    ));
  };

  // ⭐ Prev/Next handlers
  const handlePrev = () => {
    setCurrentIndex((prev) =>
      prev === 0 ? testimonials.length - 1 : prev - 1
    );
  };

  const handleNext = () => {
    setCurrentIndex((prev) =>
      prev === testimonials.length - 1 ? 0 : prev + 1
    );
  };

  return (
    <LinearGradient colors={['white', 'white']} style={styles.container}>

      {/* Back Button */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Icon name="menu-left" size={34} color="#333" />
        </TouchableOpacity>
        <Text style={{ fontSize: 26, fontWeight: 'bold' }}>About</Text>
        <Text style={{ fontSize: 18, fontWeight: 'bold' }}>       </Text>

      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>

        {/* Title */}
        <Text style={styles.title}>
          Welcome to
          <Text style={styles.highlight}> Onl</Text>
          <Text style={styles.highlight1}>ayn</Text>
        </Text>

        {/* About Text */}
        <Text style={styles.paragraph}>
          Onlayn is where fun meets learning! We are a passionate team of parents
          and educators dedicated to curating the safest, most delightful toys
          that inspire creativity, critical thinking, and joyful memories.
        </Text>

        <Text style={styles.paragraph}>
          From plush companions for infants to exciting educational kits for
          curious minds, every product is handpicked with care and purpose.
          We believe toys should nurture imagination and bring smiles to every
          child's face.
        </Text>

        <Text style={styles.paragraph}>
          At Onlayn, we value safety, sustainability, and spark. Our goal is to
          make childhood magical and memorable — one toy at a time.
        </Text>
        <View style={{ alignItems: "center", borderRadius: 25 }}>
          <Image
            source={require("../Images/abouteimage.png")}
            style={{ width: 280, height: 280, resizeMode: "contain", borderRadius: 25 }}
          />
        </View>
        {/* Testimonials Section */}
        <View style={{ alignItems: "center", marginTop: 20 }}>
          <Text style={styles.heading4}>What Parents Are Saying</Text>
          <Text style={styles.subHeading4}>
            Real stories from families who love Onlayn.
          </Text>
        </View>

        <View style={styles.container4}>

          {/* Prev Button */}
          <TouchableOpacity style={styles.navBtn4} onPress={handlePrev}>
            <Icon name="chevron-left" size={24} color="#000" />
          </TouchableOpacity>

          {/* Testimonial Card */}
          <View style={styles.card4}>
            <View style={styles.stars4}>
              {renderStars(testimonials[currentIndex].rating)}
            </View>

            <Icon
              name="format-quote-close"
              size={20}
              color="#f28ab2"
              style={styles.quoteIcon4}
            />

            <Text style={styles.reviewText4}>
              {testimonials[currentIndex].text}
            </Text>

            <View style={styles.reviewer4}>
              <Image
                source={{ uri: testimonials[currentIndex].avatar }}
                style={styles.avatar4}
              />
              <Text style={styles.name4}>
                {testimonials[currentIndex].name}
              </Text>
            </View>
          </View>

          {/* Next Button */}
          <TouchableOpacity style={styles.navBtn4} onPress={handleNext}>
            <Icon name="chevron-right" size={24} color="#000" />
          </TouchableOpacity>
        </View>

        {/* Contact Section */}
        {/* Contact Section */}
        <Text style={styles.sectionTitle}>Contact Us</Text>

        {/* Email */}
        <TouchableOpacity
          style={styles.row}
          onPress={() => Linking.openURL('mailto:contact.onlayn@gmail.com')}
        >
          <Icon name="email-outline" size={22} color="#ff4da6" style={{ marginRight: 10 }} />
          <Text style={styles.contact}>contact.onlayn@gmail.com</Text>
        </TouchableOpacity>

        {/* Phone 1 */}
        <TouchableOpacity
          style={styles.row}
          onPress={() => Linking.openURL('tel:8121304888')}
        >
          <Icon name="phone" size={22} color="green" style={{ marginRight: 10 }} />
          <Text style={styles.contact}>8121304888</Text>
        </TouchableOpacity>

        {/* Phone 2 */}
        <TouchableOpacity
          style={styles.row}
          onPress={() => Linking.openURL('tel:8121301888')}
        >
          <Icon name="phone" size={22} color="green" style={{ marginRight: 10 }} />
          <Text style={styles.contact}>8121301888</Text>
        </TouchableOpacity>

        {/* Website */}
        <TouchableOpacity
          style={styles.row}
          onPress={() => Linking.openURL('https://onlayn.toys/')}
        >
          <Icon name="web" size={22} color="#0000ff" style={{ marginRight: 10 }} />
          <Text style={[styles.contact, { color: 'blue', textDecorationLine: 'underline' }]}>
            https://onlayn.toys/
          </Text>
        </TouchableOpacity>

        <Text style={styles.footer}>Trusted by many families ❤️</Text>

      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    marginTop: 30,
    justifyContent:'space-between'
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
    marginTop: 20,
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
    // textAlign: 'center',
    marginTop: -10,
  },
  paragraph: {
    fontSize: 16,
    color: '#444',
    lineHeight: 24,
    marginBottom: 20,
    textAlign: 'justify',
  },
  highlight: {
    color: '#ff4fd8',
    fontWeight: '700',
  },
  highlight1: {
    color: 'navy',
    fontWeight: '700',
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#222',
    marginTop: 25,
    marginBottom: 10,
  },
  contact: {
    fontSize: 16,
    color: '#333',
    marginBottom: 6,
  },
  footer: {
    marginTop: 30,
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
    color: '#ff6f00',
  },

  // ⭐ Testimonial Styles
  heading4: {
    fontSize: 20,
    fontWeight: "bold",
    color: "navy",
    marginBottom: 5,
  },
  subHeading4: {
    fontSize: 14,
    color: "#333",
    textAlign: "center",
    marginBottom: 20,
  },
  container4: {
    backgroundColor: "#ff4da6",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 20,
    borderRadius: 10,
    marginBottom: 20,
  },
  card4: {
    backgroundColor: "#fff",
    borderRadius: 15,
    padding: 20,
    width: "75%",
    elevation: 4,
  },
  stars4: {
    flexDirection: "row",
    marginBottom: 8,
  },
  quoteIcon4: {
    alignSelf: "flex-end",
    marginBottom: 8,
  },
  reviewText4: {
    fontSize: 14,
    color: "#333",
    textAlign: "center",
    marginBottom: 15,
  },
  reviewer4: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  avatar4: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 10,
  },
  name4: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#000",
  },
  navBtn4: {
    backgroundColor: "#fff",
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    elevation: 2,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },

});

