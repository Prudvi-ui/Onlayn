// import React, { useEffect, useState } from 'react';
// import {
//     View,
//     Text,
//     TouchableOpacity,
//     StyleSheet,
//     SafeAreaView,
//     ScrollView,
//     TextInput,
// } from 'react-native';
// import LinearGradient from 'react-native-linear-gradient';
// import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

// export default function FilterScreen({ navigation }) {
//     const [openDropdown, setOpenDropdown] = useState(null);
//     const [selectedValues, setSelectedValues] = useState({
//         category: null,
//         ageGroup: null,
//         priceRange: null,
//         brand: null,
//         size: null,
//     });

//     const [searchTerms, setSearchTerms] = useState({
//         category: '',
//         ageGroup: '',
//         priceRange: '',
//         brand: '',
//         size: '',
//     });

//     const [categories, setCategories] = useState([]);
//     const [brand, setBrand] = useState([]);
//     const [loading, setLoading] = useState(false);

//     const dropdownItems = {
//         category: categories.map((cat) => cat.categoryName),
//         ageGroup: ['0-2', '3-5', '6-8'],
//         priceRange: ['< ₹500', '₹500-₹1000', '> ₹1000'],
//         brand: brand.map((b) => b.brandName),
//         size: ['S', 'M', 'L'],
//     };

//     const getCategories = async (item) => {
//         setLoading(true);
//         try {
//             const response = await fetch('https://apis.toyshack.in/App/categories/categories');
//             const data = await response.json();
//             if (Array.isArray(data.categories)) {
//                 setCategories(data.categories);
//             }
//         } catch (error) {
//             console.error('❌ Error fetching categories:', error);
//         } finally {
//             setLoading(false);
//         }
//     };

//     const getBrands = async () => {
//         setLoading(true);
//         try {
//             const response = await fetch('https://apis.toyshack.in/App/brands/brands');
//             const data = await response.json();
//             if (Array.isArray(data.brands)) {
//                 setBrand(data.brands);
//             }
//         } catch (error) {
//             console.error('❌ Error fetching brands:', error);
//         } finally {
//             setLoading(false);
//         }
//     };

//     const handleDropdownToggle = (key) => {
//         setOpenDropdown(openDropdown === key ? null : key);
//     };

//     const handleSelect = (key, value) => {
//         setSelectedValues({ ...selectedValues, [key]: value });
//         setSearchTerms({ ...searchTerms, [key]: '' });
//         setOpenDropdown(null);
//     };

//     const clearAll = () => {
//         setSelectedValues({
//             category: null,
//             ageGroup: null,
//             priceRange: null,
//             brand: null,
//             size: null,
//         });
//         setSearchTerms({
//             category: '',
//             ageGroup: '',
//             priceRange: '',
//             brand: '',
//             size: '',
//         });
//     };

//     useEffect(() => {
//         getCategories();
//         getBrands();
//     }, []);

//     return (
//         <SafeAreaView style={styles.container}>
//             <View style={styles.header}>
//                 <TouchableOpacity onPress={() => navigation.goBack()}>
//                     <Icon name="menu-left" size={30} color="#333" />
//                 </TouchableOpacity>
//                 <Text style={styles.title}>Filter Products</Text>
//                 <TouchableOpacity onPress={clearAll}>
//                     <Text style={styles.reset}></Text>
//                 </TouchableOpacity>
//             </View>

//             <ScrollView contentContainerStyle={styles.dropdownContainer}>
//                 {Object.keys(dropdownItems).map((key) => (
//                     <View key={key} style={styles.dropdownWrapper}>
//                         <View style={styles.dropdownButton}>
//                             <TouchableOpacity
//                                 onPress={() => handleDropdownToggle(key)}
//                                 style={styles.dropdownContent}
//                             >
//                                 <Text style={styles.dropdownText}>
//                                     {selectedValues[key] ||
//                                         key.charAt(0).toUpperCase() +
//                                         key.slice(1).replace(/([A-Z])/g, ' $1')}
//                                 </Text>
//                                 <Icon
//                                     name={openDropdown === key ? 'chevron-up' : 'chevron-down'}
//                                     size={24}
//                                     color="#888"
//                                 />
//                             </TouchableOpacity>
//                         </View>

//                         {openDropdown === key && (
//                             <>
//                                 <TextInput
//                                     style={styles.searchInput}
//                                     placeholder={`Search ${key}`}
//                                     value={searchTerms[key]}
//                                     onChangeText={(text) =>
//                                         setSearchTerms({ ...searchTerms, [key]: text })
//                                     }
//                                 />

//                                 {dropdownItems[key]
//                                     .filter((item) =>
//                                         item.toLowerCase().includes(searchTerms[key].toLowerCase())
//                                     )
//                                     .map((item) => (
//                                         <TouchableOpacity
//                                             key={item}
//                                             onPress={() => handleSelect(key, item)}
//                                             style={styles.dropdownOption}
//                                         >
//                                             <Text>{item}</Text>
//                                         </TouchableOpacity>
//                                     ))}
//                             </>
//                         )}
//                     </View>
//                 ))}
//             </ScrollView>

//             <View style={styles.buttonContainer}>
//                 <TouchableOpacity
//                     style={styles.gradientButton}
//                     onPress={() => {
//                         navigation.navigate("Products", { filters: selectedValues }, console.log('📦 Navigating with selectedValues:', selectedValues));
//                     }}
//                 >
//                     <LinearGradient colors={['navy', 'navy']} style={styles.gradient}>
//                         <Text style={styles.buttonText}>Apply</Text>
//                     </LinearGradient>
//                 </TouchableOpacity>

//                 <TouchableOpacity style={styles.gradientButton} onPress={clearAll}>
//                     <LinearGradient colors={['#ff4da6', '#ff4da6']} style={styles.gradient}>
//                         <Text style={styles.buttonText}>Clear All</Text>
//                     </LinearGradient>
//                 </TouchableOpacity>
//             </View>
//         </SafeAreaView>
//     );
// }

// const styles = StyleSheet.create({
//     container: {
//         flex: 1,
//         backgroundColor: 'white',
//     },
//     header: {
//         flexDirection: 'row',
//         alignItems: 'center',
//         justifyContent: 'space-between',
//         paddingHorizontal: 16,
//         paddingVertical: 10,
//         marginTop: 20,
//     },
//     title: {
//         fontSize: 18,
//         fontWeight: 'bold',
//     },
//     reset: {
//         color: '#c57ef2',
//         fontWeight: '600',
//     },
//     dropdownContainer: {
//         padding: 20,
//         paddingBottom: 120,
//     },
//     dropdownWrapper: {
//         marginBottom: 15,
//     },
//     dropdownButton: {
//         backgroundColor: '#fff',
//         padding: 14,
//         borderRadius: 8,
//         borderColor: '#ddd',
//         borderWidth: 1,
//     },
//     dropdownContent: {
//         flexDirection: 'row',
//         justifyContent: 'space-between',
//         alignItems: 'center',
//     },
//     dropdownText: {
//         fontSize: 16,
//         color: '#333',
//     },
//     dropdownOption: {
//         backgroundColor: '#f1f1f1',
//         padding: 12,
//         marginTop: 2,
//         borderRadius: 6,
//     },
//     searchInput: {
//         backgroundColor: '#fff',
//         borderColor: '#ccc',
//         borderWidth: 1,
//         borderRadius: 8,
//         paddingHorizontal: 10,
//         paddingVertical: 8,
//         marginTop: 8,
//         marginBottom: 4,
//     },
//     buttonContainer: {
//         flexDirection: 'row',
//         justifyContent: 'space-around',
//         paddingHorizontal: 20,
//         paddingBottom: 20,
//         position: 'absolute',
//         bottom: 0,
//         width: '100%',
//         backgroundColor: '#e7f0ff',
//     },
//     gradientButton: {
//         flex: 1,
//         marginHorizontal: 5,
//     },
//     gradient: {
//         paddingVertical: 12,
//         borderRadius: 30,
//         alignItems: 'center',
//     },
//     buttonText: {
//         color: '#fff',
//         fontWeight: '700',
//     },
// });


import React, { useEffect, useState } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    SafeAreaView,
    ScrollView,
    TextInput,
    KeyboardAvoidingView,
    Platform
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

export default function FilterScreen({ navigation }) {
    const [openDropdowns, setOpenDropdowns] = useState({
        category: false,
        ageGroup: false,
        priceRange: false,
        brand: false,
        size: false,
    });

    const [selectedValues, setSelectedValues] = useState({
        category: null,
        ageGroup: null,
        priceRange: null,
        brand: null,
        size: null,
    });

    const [searchTerms, setSearchTerms] = useState({
        category: '',
        ageGroup: '',
        priceRange: '',
        brand: '',
        size: '',
    });

    const [categories, setCategories] = useState([]);
    const [brand, setBrand] = useState([]);
    const [loading, setLoading] = useState(false);

    const dropdownItems = {
        category: categories.map((cat) => cat.categoryName),
        ageGroup: ['0-2', '3-5', '6-8'],
        priceRange: ['< ₹500', '₹500-₹1000', '> ₹1000'],
        brand: brand.map((b) => b.brandName),
        size: ['S', 'M', 'L'],
    };

    const getCategories = async () => {
        setLoading(true);
        try {
            const response = await fetch('https://apis.toyshack.in/App/categories/categories');
            const data = await response.json();
            if (Array.isArray(data.categories)) {
                setCategories(data.categories);
            }
        } catch (error) {
            console.error('❌ Error fetching categories:', error);
        } finally {
            setLoading(false);
        }
    };

    const getBrands = async () => {
        setLoading(true);
        try {
            const response = await fetch('https://apis.toyshack.in/App/brands/brands');
            const data = await response.json();
            if (Array.isArray(data.brands)) {
                setBrand(data.brands);
            }
        } catch (error) {
            console.error('❌ Error fetching brands:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleDropdownToggle = (key) => {
        setOpenDropdowns((prev) => ({
            ...prev,
            [key]: !prev[key],
        }));
    };

    const handleSelect = (key, value) => {
        setSelectedValues({ ...selectedValues, [key]: value });
        setSearchTerms({ ...searchTerms, [key]: '' });
        setOpenDropdowns((prev) => ({ ...prev, [key]: false }));
    };

    const clearAll = () => {
        setSelectedValues({
            category: null,
            ageGroup: null,
            priceRange: null,
            brand: null,
            size: null,
        });
        setSearchTerms({
            category: '',
            ageGroup: '',
            priceRange: '',
            brand: '',
            size: '',
        });
    };

    useEffect(() => {
        getCategories();
        getBrands();
    }, []);

    return (
        <SafeAreaView style={styles.container}>
            <KeyboardAvoidingView
                style={{ flex: 1 }}
                behavior={Platform.OS === "ios" ? "padding" : "height"}
            >
                {/* Header */}
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => navigation.goBack()}>
                        <Icon name="menu-left" size={30} color="#333" />
                    </TouchableOpacity>
                    <Text style={styles.title}>Filter Products</Text>
                    <TouchableOpacity onPress={clearAll}>
                        <Text style={styles.reset}></Text>
                    </TouchableOpacity>
                </View>

                {/* Scrollable Content */}
                <ScrollView
                    style={{ flex: 1 }}
                    contentContainerStyle={styles.dropdownContainer}
                    showsVerticalScrollIndicator={false}
                    keyboardShouldPersistTaps="handled"
                >
                    {Object.keys(dropdownItems).map((key) => (
                        <View key={key} style={styles.dropdownWrapper}>
                            {/* Dropdown button */}
                            <View style={styles.dropdownButton}>
                                <TouchableOpacity
                                    onPress={() => handleDropdownToggle(key)}
                                    style={styles.dropdownContent}
                                >
                                    <Text style={styles.dropdownText}>
                                        {selectedValues[key] ||
                                            key.charAt(0).toUpperCase() +
                                            key.slice(1).replace(/([A-Z])/g, " $1")}
                                    </Text>
                                    <Icon
                                        name={openDropdowns[key] ? "chevron-up" : "chevron-down"}
                                        size={24}
                                        color="#888"
                                    />
                                </TouchableOpacity>
                            </View>

                            {/* Dropdown items */}
                            {openDropdowns[key] && (
                                <>
                                    <TextInput
                                        style={styles.searchInput}
                                        placeholder={`Search ${key}`}
                                        value={searchTerms[key]}
                                        onChangeText={(text) =>
                                            setSearchTerms({ ...searchTerms, [key]: text })
                                        }
                                    />

                                    {/* Unselect option */}
                                    <TouchableOpacity
                                        onPress={() => handleSelect(key, null)}
                                        style={[styles.dropdownOption, { backgroundColor: '#ffe6e6' }]}
                                    >
                                        <Text style={{ color: 'red', fontWeight: '600' }}>Unselect</Text>
                                    </TouchableOpacity>

                                    {dropdownItems[key]
                                        .filter((item) =>
                                            item.toLowerCase().includes(searchTerms[key].toLowerCase())
                                        )
                                        .map((item) => (
                                            <TouchableOpacity
                                                key={item}
                                                onPress={() => handleSelect(key, item)}
                                                style={styles.dropdownOption}
                                            >
                                                <Text>{item}</Text>
                                            </TouchableOpacity>
                                        ))}
                                </>
                            )}
                        </View>
                    ))}
                </ScrollView>

                {/* Fixed Buttons */}
                <View style={styles.buttonContainer}>
                    <TouchableOpacity
                        style={styles.gradientButton}
                        onPress={() => {
                            navigation.navigate(
                                "Products",
                                { filters: selectedValues },
                                console.log("📦 Navigating with selectedValues:", selectedValues)
                            );
                        }}
                    >
                        <LinearGradient colors={["navy", "navy"]} style={styles.gradient}>
                            <Text style={styles.buttonText}>Apply</Text>
                        </LinearGradient>
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.gradientButton} onPress={clearAll}>
                        <LinearGradient colors={["#ff4da6", "#ff4da6"]} style={styles.gradient}>
                            <Text style={styles.buttonText}>Clear All</Text>
                        </LinearGradient>
                    </TouchableOpacity>
                </View>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: 'white',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingVertical: 10,
        marginTop: 20,
    },
    title: {
        fontSize: 18,
        fontWeight: 'bold',
    },
    reset: {
        color: '#c57ef2',
        fontWeight: '600',
    },
    dropdownContainer: {
        padding: 20,
        paddingBottom: 120,
    },
    dropdownWrapper: {
        marginBottom: 15,
    },
    dropdownButton: {
        backgroundColor: '#fff',
        padding: 14,
        borderRadius: 8,
        borderColor: '#ddd',
        borderWidth: 1,
    },
    dropdownContent: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    dropdownText: {
        fontSize: 16,
        color: '#333',
    },
    dropdownOption: {
        backgroundColor: '#f1f1f1',
        padding: 12,
        marginTop: 2,
        borderRadius: 6,
    },
    searchInput: {
        backgroundColor: '#fff',
        borderColor: '#ccc',
        borderWidth: 1,
        borderRadius: 8,
        paddingHorizontal: 10,
        paddingVertical: 8,
        marginTop: 8,
        marginBottom: 4,
    },
    buttonContainer: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        paddingHorizontal: 20,
        paddingBottom: 20,
        position: 'absolute',
        bottom: 0,
        width: '100%',
        backgroundColor: 'white',
        marginBottom:100
    },
    gradientButton: {
        flex: 1,
        marginHorizontal: 5,
    },
    gradient: {
        paddingVertical: 12,
        borderRadius: 30,
        alignItems: 'center',
    },
    buttonText: {
        color: '#fff',
        fontWeight: '700',
    },
});
