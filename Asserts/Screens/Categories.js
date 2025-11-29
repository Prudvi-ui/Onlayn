// import React, { useEffect, useState } from 'react';
// import {
//   View,
//   Text,
//   FlatList,
//   Image,
//   StyleSheet,
//   Dimensions,
//   TouchableOpacity,
//   TextInput,
//   ActivityIndicator,
// } from 'react-native';
// import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
// import LinearGradient from 'react-native-linear-gradient';

// const { width } = Dimensions.get('window');
// const numColumns = 2;
// const itemSize = width / numColumns - 24;

// const CategoryScreen = ({ navigation }) => {
//   const [searchText, setSearchText] = useState('');
//   const [categories, setCategories] = useState([]);
//   const [filteredCategories, setFilteredCategories] = useState([]);
//   const [loading, setLoading] = useState(false);

//   const getCategories = async () => {
//     setLoading(true);
//     try {
//       const response = await fetch('https://apis.toyshack.in/App/categories/categories');
//       const data = await response.json();
//       console.log('✅ Response Data:', data);

//       if (Array.isArray(data.categories)) {
//         setCategories(data.categories);
//         setFilteredCategories(data.categories);
//       } else {
//         console.warn('❗ "categories" is not an array:', data);
//       }
//     } catch (error) {
//       console.error('❌ Error fetching categories:', error);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleSearch = (text) => {
//     setSearchText(text);
//     const filtered = categories.filter(item =>
//       item.categoryName?.toLowerCase().includes(text.toLowerCase())
//     );
//     setFilteredCategories(filtered);
//   };

//   const renderItem = ({ item }) => (
//     <TouchableOpacity
//       onPress={() => {
//         navigation.navigate('Products', { selectedCategory: item }, console.log('📦 Navigating with category:', item));
//       }}
//     >
//       <View style={styles.itemContainer}>
//         <LinearGradient colors={['#d5f3ff', '#ffe9ff']} style={styles.iconBox}>
//           <Image
//             source={{ uri: `https://apis.toyshack.in/storage/categoryimages/${item.categoryImage}` }}
//             style={styles.icon}
//           />
//         </LinearGradient>
//         <Text style={styles.label}>{item.categoryName}</Text>
//       </View>
//     </TouchableOpacity>
//   );

//   useEffect(() => {
//     getCategories();
//   }, []);

//   return (
//     <LinearGradient colors={['#f9f6ff', '#d6e8ff']} style={styles.container}>
//       {/* Header */}
//       <View style={styles.header}>
//         <TouchableOpacity onPress={() => navigation.goBack()}>
//           <Icon name="menu-left" size={34} />
//         </TouchableOpacity>
//         <Text style={styles.headerTitle}>Category</Text>
//         <TouchableOpacity onPress={() => navigation.navigate('FilterScreen')}>
//           <Icon name="filter-variant" size={34} />
//         </TouchableOpacity>
//       </View>

//       {/* Search Bar */}
//       <View style={styles.searchContainer}>
//         <Icon name="magnify" size={22} color="#888" />
//         <TextInput
//           style={styles.searchInput}
//           placeholder="Search category"
//           value={searchText}
//           onChangeText={handleSearch}
//           placeholderTextColor="#aaa"
//         />
//       </View>

//       {/* Loader */}
//       {loading ? (
//         <ActivityIndicator size="large" color="#999" style={{ marginTop: 40 }} />
//       ) : (
//         <FlatList
//           data={filteredCategories}
//           renderItem={renderItem}
//           keyExtractor={(item) => item._id}
//           numColumns={numColumns}
//           contentContainerStyle={styles.grid}
//           showsVerticalScrollIndicator={false}
//           ListEmptyComponent={
//             <Text style={styles.noResults}>No matching category found.</Text>
//           }
//         />
//       )}
//     </LinearGradient>
//   );
// };
// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     paddingTop: 48,
//   },
//   header: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'center',
//     paddingHorizontal: 16,
//     marginBottom: 12,
//   },
//   headerTitle: {
//     fontSize: 20,
//     fontWeight: 'bold',
//   },
//   searchContainer: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     backgroundColor: '#fff',
//     marginHorizontal: 16,
//     paddingHorizontal: 12,
//     borderRadius: 12,
//     height: 42,
//     elevation: 3,
//     shadowColor: '#aaa',
//     shadowOpacity: 0.2,
//     shadowOffset: { width: 1, height: 1 },
//     shadowRadius: 2,
//     marginBottom: 12,
//   },
//   searchInput: {
//     flex: 1,
//     marginLeft: 8,
//     fontSize: 14,
//     color: '#333',
//   },
//   grid: {
//     paddingHorizontal: 12,
//     paddingBottom: 24,
//   },
//   itemContainer: {
//     width: itemSize,
//     alignItems: 'center',
//     // margin: 6,
//   },
//   iconBox: {
//     backgroundColor: '#fff',
//     padding: 12,
//     borderRadius: 16,
//     elevation: 3,
//     shadowColor: '#aaa',
//     shadowOpacity: 0.3,
//     shadowOffset: { width: 1, height: 2 },
//     shadowRadius: 3,
//   },
//   icon: {
//     width: 135,
//     height: 120,
//     resizeMode: 'cover',
//     borderRadius:15
//   },
//   label: {
//     marginTop: 8,
//     textAlign: 'center',
//     fontSize: 12,
//     fontWeight: '500',
//     color: '#333',
//   },
//   noResults: {
//     textAlign: 'center',
//     marginTop: 40,
//     fontSize: 14,
//     color: '#888',
//   },
// });

// export default CategoryScreen;

import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  Image,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  StatusBar,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import LinearGradient from 'react-native-linear-gradient';

const { width } = Dimensions.get('window');
const numColumns = 2;
const itemSize = width / numColumns - 28;

const CategoryScreen = ({ navigation }) => {
  const [searchText, setSearchText] = useState('');
  const [categories, setCategories] = useState([]);
  const [filteredCategories, setFilteredCategories] = useState([]);
  const [loading, setLoading] = useState(false);

  const getCategories = async () => {
    setLoading(true);
    try {
      const response = await fetch('https://apis.toyshack.in/App/categories/categories');
      const data = await response.json();
      console.log('✅ Response Data:', data);

      if (Array.isArray(data.categories)) {
        setCategories(data.categories);
        setFilteredCategories(data.categories);
      } else {
        console.warn('❗ "categories" is not an array:', data);
      }
    } catch (error) {
      console.error('❌ Error fetching categories:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (text) => {
    setSearchText(text);
    const filtered = categories.filter(item =>
      item.categoryName?.toLowerCase().includes(text.toLowerCase())
    );
    setFilteredCategories(filtered);
  };

  const renderItem = ({ item }) => (
    <TouchableOpacity
      style={styles.card}
      onPress={() =>
        navigation.navigate('Products', { selectedCategory: item })
      }
    >
      <Image
        source={
          item.categoryImage
            ? { uri: `https://apis.toyshack.in/storage/categoryimages/${item.categoryImage}` }
            : require('../Images/still.png')
        }
        style={styles.cardImage}
      />
      <View style={styles.cardContent}>
        <Text style={styles.cardTitle}>{item.categoryName}</Text>
        <Text style={styles.cardSubtitle}>
          {item.description || "Explore toys in this category."}
        </Text>
      </View>
    </TouchableOpacity>
  );

  useEffect(() => {
    getCategories();
  }, []);

  return (
    <LinearGradient colors={['white', 'white']} style={styles.container}>
      <StatusBar backgroundColor="#E8F6FF" barStyle="dark-content" />
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Icon name="menu-left" size={34} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Category</Text>
        <TouchableOpacity onPress={() => navigation.navigate('FilterScreen')}>
          <Icon name="filter-variant" size={30} />
        </TouchableOpacity>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <Icon name="magnify" size={22} color="#888" />
        <TextInput
          style={styles.searchInput}
          placeholder="Search category"
          value={searchText}
          onChangeText={handleSearch}
          placeholderTextColor="#aaa"
        />
      </View>

      {/* Loader */}
      {loading ? (
        <ActivityIndicator size="large" color="#999" style={{ marginTop: 40 }} />
      ) : (
        <FlatList
          data={filteredCategories}
          renderItem={renderItem}
          keyExtractor={(item) => item._id}
          numColumns={numColumns}
          contentContainerStyle={styles.grid}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <Text style={styles.noResults}>No matching category found.</Text>
          }
        />
      )}
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 48,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    marginHorizontal: 16,
    paddingHorizontal: 12,
    borderRadius: 12,
    height: 42,
    elevation: 3,
    shadowColor: '#aaa',
    shadowOpacity: 0.2,
    shadowOffset: { width: 1, height: 1 },
    shadowRadius: 2,
    marginBottom: 12,
    borderWidth: 0.8,
    borderColor: "gray"
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: 14,
    color: '#333',


  },
  grid: {
    paddingHorizontal: 12,
    paddingBottom: 24,
  },
  card: {
    width: itemSize,
    backgroundColor: 'white',
    borderRadius: 20,
    margin: 8,
    overflow: 'hidden',
    elevation: 3,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 5,
  },
  cardImage: {
    width: '100%',
    height: 120,
    resizeMode: 'cover',
  },
  cardContent: {
    padding: 10,
    alignItems: 'center',
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#000',
    textAlign: 'center',
    marginBottom: 4,
  },
  cardSubtitle: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
  },
  noResults: {
    textAlign: 'center',
    marginTop: 40,
    fontSize: 14,
    color: '#888',
  },
});

export default CategoryScreen;
