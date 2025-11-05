import React, { useCallback, useEffect, useState, useContext } from 'react';
import {
    View,
    Text,
    Image,
    FlatList,
    TouchableOpacity,
    TextInput,
    StyleSheet,
    Dimensions,
    ScrollView,
    BackHandler,
    Alert,
    ActivityIndicator,
    Modal,
    Linking,
    Pressable
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Swiper from 'react-native-swiper';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useFocusEffect } from '@react-navigation/native';
import { CartContext } from '../context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Share from 'react-native-share';
import RNFetchBlob from 'react-native-blob-util';
import { Rating } from 'react-native-ratings';
import Toast from 'react-native-toast-message';
// import NetInfo from "@react-native-community/netinfo";


const screenWidth = Dimensions.get('window').width;

const numColumns = 2;
const { width } = Dimensions.get('window');
const itemSize = width / numColumns - 24;
const CARD_MARGIN = 8;
const CARD_WIDTH = (width / 2) - (CARD_MARGIN * 3);

const App = ({ navigation }) => {
    const [loading, setLoading] = useState("")
    const [loading1, setLoading1] = useState("")

    const [banner, setBanner] = useState("")
    const [product, setProduct] = useState([]);
    const [Comingsoon, setComingsoon] = useState([]);
    const { cartCount, setCartCount } = useContext(CartContext);
    const [modalVisible, setModalVisible] = useState(false);
    const [address, setAddress] = useState('');
    const [deliveryData, setDeliveryData] = useState([]);
    const [areaCode, setAreaCode] = useState('');
    const [isPincodeValid, setIsPincodeValid] = useState(true);
    const [alertVisible, setAlertVisible] = useState(false);
    const [alertMessage, setAlertMessage] = useState('');
    const [alertType, setAlertType] = useState('success'); // success or error
    const [notificationCount, setNotificationCount] = useState(0);
    const [ratings, setRatings] = useState({});
    const [categories, setCategories] = useState([]);
    const [filteredCategories, setFilteredCategories] = useState([]);
    const [productImageError, setProductImageError] = useState(false);
    const [firstLoad, setFirstLoad] = useState(true); // track first-time loading
    const [currentIndex, setCurrentIndex] = useState(0);
    const [cartItems, setCartItems] = useState({}); // productId -> quantity
    const [updatingItem, setUpdatingItem] = useState(null); // track which product is updating

    const numColumns = 2;
    const [likedItems, setLikedItems] = useState({});
    const toggleLike = (productId) => {
        setLikedItems((prev) => ({
            ...prev,
            [productId]: !prev[productId],
        }));
    };
    const { width } = Dimensions.get("window");

    const categories1 = [
        { id: "1", title: "Plush Toys", price: "From ₹ 1500", emoji: "🧸", color: ["#f9c7e8", "#f9c7e8"] },
        { id: "2", title: "Cute Dresses", price: "From ₹ 1200", emoji: "👗", color: ["#e0c7ff", "#e0c7ff"] },
        { id: "3", title: "Premium Diapers", price: "From ₹ 2499", emoji: "👶", color: ["#a7f5e5", "#a7f5e5"] },
        { id: "4", title: "Art Supplies", price: "From ₹ 1299", emoji: "🎨", color: ["#ffd88b", "#ffd88b"] },
    ];
    const ageGroups = [
        {
            id: 1,
            title: "0 - 2",
            color: "#cce2ff",
            image: require("../Images/child1.png"), // Replace with your own images
        },
        {
            id: 2,
            title: "3 - 5",
            color: "#fff0a8",
            image: require("../Images/child2.png"),
        },
        {
            id: 3,
            title: "6 - 8",
            color: "#ffd6db",
            image: require("../Images/child3.png"),
        },
        {
            id: 4,
            title: "9 +",
            color: "#ffe0b3",
            image: require("../Images/child4.png"),
        },
    ];
    const testimonials = [
        {
            id: "1",
            rating: 4,
            text: "Great variety of toys. The car set I bought was sturdy and safe. Excellent customer support as well.",
            name: "Rajiv K.",
            avatar: "https://i.pravatar.cc/100?img=12",
        },
        {
            id: "2",
            rating: 5,
            text: "Absolutely love the toy quality! My little one plays with the plush bear every day. Great service too!",
            name: "Aarav’s Mom",
            avatar: "https://i.pravatar.cc/100?img=48",
        },
        {
            id: "3",
            rating: 5,
            text: "Fast delivery and beautifully packed. The art set kept my kids busy for hours. Highly recommended!",
            name: "Reema D.",
            avatar: "https://i.pravatar.cc/100?img=32",
        },
    ];
    const features = [
        {
            id: 1,
            title: "Free Shipping",
            desc: "Enjoy fast and free delivery right to your doorstep",
            icon: "truck-fast",
        },
        {
            id: 2,
            title: "Open Box Delivery",
            desc: "Inspect your item before accepting",
            icon: "package-variant",
        },
        {
            id: 3,
            title: "Easy Exchange",
            desc: "Exchange your item instantly with no hassle",
            icon: "swap-horizontal",
        },
        {
            id: 4,
            title: "Cash on Delivery",
            desc: "Pay after your product arrives",
            icon: "cash",
        },
        {
            id: 5,
            title: "Same Day Delivery",
            desc: "Available in select cities",
            icon: "clock-outline",
        },
    ];


    useFocusEffect(
        useCallback(() => {
            const onBackPress = () => {
                // Alert.alert('Exit App', 'Are you sure you want to exit?', [
                //     { text: 'Cancel', style: 'cancel' },
                //     { text: 'Yes', onPress: () => BackHandler.exitApp() },
                // ]);
                BackHandler.exitApp()
                return true;
            };

            const backHandler = BackHandler.addEventListener('hardwareBackPress', onBackPress);
            return () => backHandler.remove();
        }, [])
    );

    console.log('➡️ Fetching banners...');

    const getbanners = async () => {
        setLoading(true);
        try {
            const response = await fetch('https://apis.toyshack.in/App/banners/banners', {
                method: 'GET',
                headers: {
                    Accept: 'application/json',
                    'Content-Type': 'application/json',
                },
            });

            const responseText = await response.text();
            console.log('Response Text:', responseText);

            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }

            const data = JSON.parse(responseText);
            console.log('Parsed Response Data:', data);
            // const netState = await NetInfo.fetch();

            // if (!netState.isConnected) {
            //     console.warn("⚠️ No Internet Connection");
            //     navigation.navigate("Nointernet");
            //     return;
            // }
            if (Array.isArray(data)) {
                setBanner(data);
                console.log('✅ banners received========>', data);
            } else if (Array.isArray(data.banners)) {
                setBanner(data.banners);
                console.log('✅ Banners fetched from data.banners');
            } else {
                navigation.navigate("Nointernet")
                console.warn('❗ Response does not contain an array:', data);
            }

        } catch (error) {
            // console.error('❌ Error fetching banners:', error.message);
        } finally {
            setLoading(false);
        }
    };


    const getproducts = async () => {
        setLoading(true);
        try {
            const response = await fetch('https://apis.toyshack.in/App/products/all-products');
            const data = await response.json();
            console.log('✅ Response Data:', data);
            // const netState = await NetInfo.fetch();

            // if (!netState.isConnected) {
            //     console.warn("⚠️ No Internet Connection");
            //     navigation.navigate("Nointernet");
            //     return;
            // }
            if (Array.isArray(data)) {
                // Shuffle array
                const shuffled = data.sort(() => 0.5 - Math.random());

                // Pick first 8 random products (change the number as needed)
                const randomProducts = shuffled.slice(6, 10);

                setProduct(randomProducts);
            } else {
                console.warn('❗ "data" is not an array:', data);
            }
        } catch (error) {
            // navigation.navigate("Nointernet")
            console.error('❌ Error fetching products:', error);
        } finally {
            setLoading(false);
        }
    };



    // const getCategories = async () => {
    //     try {
    //         const response = await fetch(`https://apis.toyshack.in/App/categories/categories`);
    //         const data = await response.json();

    //         if (Array.isArray(data.categories)) {
    //             // ✅ shuffle & pick 8
    //             const randomCategories = [...data.categories]
    //                 .sort(() => Math.random() - 0.5)
    //                 .slice(0, 8);

    //             setCategories(randomCategories); // 👈 only store 8
    //         } else {
    //             console.error("⚠️ Categories response is not an array", data);
    //         }
    //     } catch (error) {
    //         console.error("❌ Error fetching categories:", error);
    //     }
    // };
    const getCategories = async () => {
        try {
            // 🔹 Step 1: Check Internet Connection
            // const netState = await NetInfo.fetch();

            // if (!netState.isConnected) {
            //     console.warn("⚠️ No Internet Connection");
            //     navigation.navigate("Nointernet");
            //     return;
            // }

            // 🔹 Step 2: Fetch Categories from API
            const response = await fetch(`https://apis.toyshack.in/App/categories/categories`);
            const data = await response.json();

            if (Array.isArray(data.categories)) {
                // ✅ Shuffle & Pick 8
                const randomCategories = [...data.categories]
                    .sort(() => Math.random() - 0.5)
                    .slice(0, 8);

                setCategories(randomCategories);
            } else {
                console.error("⚠️ Categories response is not an array", data);
            }
        } catch (error) {
            console.error("❌ Error fetching categories:", error);
            navigation.navigate("Nointernet"); // 👈 Navigate when fetch fails (like timeout or network error)
        }
    };

    const getComingsoon = async () => {
        setLoading(true);
        try {
            const response = await fetch('https://apis.toyshack.in/App/Comingsoon/all-Comingsoon');
            const data = await response.json();
            console.log('✅ Response Data:', data);

            if (Array.isArray(data)) {
                // Shuffle array
                // const shuffled = data.sort(() => 0.5 - Math.random());

                // // Pick first 8 random products (change the number as needed)
                // const randomProducts = shuffled.slice(5, 10);

                setComingsoon(data);
            } else {
                console.warn('❗ "data" is not an array:', data);
            }
        } catch (error) {
            console.error('❌ Error fetching products:', error);
        } finally {
            setLoading(false);
        }
    };


    // const addCart = async (item) => {
    //     try {
    //         setLoading1(item._id); // 🔹 show loader only for this item

    //         const userId = await AsyncStorage.getItem("id");
    //         const username = await AsyncStorage.getItem("Name");

    //         if (!userId || !username) {
    //             Toast.show({
    //                 type: "error",
    //                 text1: "Error",
    //                 text2: "User not logged in.",
    //             });
    //             setLoading1(null);
    //             return;
    //         }

    //         const discountedPrice =
    //             item.discount > 0
    //                 ? Math.round(item.price - (item.price * item.discount) / 100)
    //                 : item.price;

    //         // 🔹 Fetch cart from AsyncStorage
    //         const storedCart = await AsyncStorage.getItem("cart");
    //         let cart = storedCart ? JSON.parse(storedCart) : [];

    //         // ❌ Old: increment existing quantity
    //         // ✅ New: remove old entry, push fresh with quantity = 1
    //         cart = cart.filter((p) => p.productId !== item._id);

    //         cart.push({
    //             customerId: userId,
    //             customerName: username,
    //             productId: item._id,
    //             productName: item.productName,
    //             description: item.description,
    //             discountedPrice: discountedPrice,
    //             category: item.category,
    //             quantity: 1, // ✅ always reset to 1
    //             brand: item.brand,
    //             unit: item.unit,
    //             mainPrice: item.price,
    //             size: item.size,
    //             stock: Number(item.stock),
    //             discount: item.discount,
    //             material: item.material,
    //             color: item.color,
    //             age: item.age,
    //             gst: item.gst || "0",
    //             cess: item.cess || "0",
    //             images: item.images?.[0] || "https://via.placeholder.com/150",
    //         });

    //         // 💾 Save updated cart
    //         await AsyncStorage.setItem("cart", JSON.stringify(cart));

    //         // 🧮 Update count
    //         const totalCount = cart.reduce((acc, p) => acc + p.quantity, 0);
    //         setCartCount(totalCount);
    //         await AsyncStorage.setItem("Count", totalCount.toString());

    //         // 🚀 Sync with backend (always fresh quantity = 1)
    //         await fetch("https://apis.toyshack.in/App/Cart/create-cart", {
    //             method: "POST",
    //             headers: {
    //                 Accept: "application/json",
    //                 "Content-Type": "application/json",
    //             },
    //             body: JSON.stringify({
    //                 customerId: userId,
    //                 customerName: username,
    //                 productId: item._id,
    //                 productName: item.productName,
    //                 description: item.description,
    //                 discountedPrice: discountedPrice,
    //                 category: item.category,
    //                 quantity: 1, // ✅ reset to 1
    //                 brand: item.brand,
    //                 unit: item.unit,
    //                 mainPrice: item.price,
    //                 size: item.size,
    //                 stock: Number(item.stock),
    //                 discount: item.discount,
    //                 material: item.material,
    //                 color: item.color,
    //                 age: item.age,
    //                 gst: item.gst || "0",
    //                 cess: item.cess || "0",
    //                 images: item.images?.[0] || "https://via.placeholder.com/150",
    //             }),
    //         });

    //         Toast.show({
    //             type: "success",
    //             text1: "Success",
    //             text2: "Cart item created successfully.",
    //         });
    //     } catch (error) {
    //         console.error("❌ Error adding to cart:", error);
    //         Toast.show({
    //             type: "error",
    //             text1: "Error",
    //             text2: "Something went wrong.",
    //         });
    //     } finally {
    //         setLoading1(null); // 🔹 reset loader
    //     }
    // };

    useEffect(() => {
        const loadCart = async () => {
            const storedCart = await AsyncStorage.getItem('cart');
            if (storedCart) {
                try {
                    const parsed = JSON.parse(storedCart);
                    const mapped = {};
                    parsed.forEach(p => {
                        mapped[p.productId] = Number(p.quantity) || 0;
                    });
                    setCartItems(mapped);
                } catch (e) {
                    console.warn('Malformed stored cart', e);
                }
            }
        };

        loadCart();    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // update quantity for related product or cart item
    const updateCartQuantity = async (item, newQty) => {
        try {
            setUpdatingItem(item._id);

            const userId = await AsyncStorage.getItem('id');
            const username = await AsyncStorage.getItem('Name');

            if (!userId || !username) {
                Toast.show({ type: 'error', text1: 'Error', text2: 'User not logged in.' });
                setUpdatingItem(null);
                return;
            }

            // 🛒 Local cart update
            let storedCart = await AsyncStorage.getItem('cart');
            let cart = storedCart ? JSON.parse(storedCart) : [];

            // Remove old entry for same product
            cart = cart.filter(p => p.productId !== item._id);

            // ✅ Only add if qty > 0
            if (newQty > 0) {
                const mainPrice =
                    parseFloat(item.mainPrice) ||
                    parseFloat(item.finalPrice) ||
                    parseFloat(item.price) ||
                    0;

                const discountedPrice =
                    item.discount > 0
                        ? Math.round(mainPrice - (mainPrice * item.discount) / 100)
                        : mainPrice;

                const productImages =
                    Array.isArray(item.images) && item.images.length > 0
                        ? item.images
                        : item.images
                            ? [item.images]
                            : [];

                cart.push({
                    productId: item._id,
                    productName: item.productName || item.name || 'Unnamed Product',
                    description: item.description || '',
                    discountedPrice,
                    mainPrice,
                    category: item.category || 'General',
                    brand: item.brand || '',
                    unit: item.unit || '',
                    size: item.size || '',
                    discount: item.discount || 0,
                    material: item.material || '',
                    color: item.color || '',
                    age: item.age || '',
                    stock: Number(item.stock) || 0,
                    quantity: Number(newQty),
                    images: productImages,
                    customerId: userId,
                    customerName: username,
                    igst: item.igst || '0',
                    cgst: item.cgst || '0',
                    sgst: item.sgst || '0',
                    cess: item.cess || '0',
                    videoUrl: item.videoUrl || '',
                });
            }

            // 🧩 Save to AsyncStorage
            await AsyncStorage.setItem('cart', JSON.stringify(cart));
            setCartItems(prev => ({ ...prev, [item._id]: newQty }));

            const totalCount = cart.reduce((acc, p) => acc + (Number(p.quantity) || 0), 0);
            if (setCartCount) setCartCount(totalCount);
            await AsyncStorage.setItem('Count', totalCount.toString());

            // 🧾 Prepare payload for backend
            const mainPrice =
                parseFloat(item.mainPrice) ||
                parseFloat(item.finalPrice) ||
                parseFloat(item.price) ||
                0;

            const discountedPrice =
                item.discount > 0
                    ? Math.round(mainPrice - (mainPrice * item.discount) / 100)
                    : mainPrice;

            const payload = {
                productId: item._id,
                productName: item.productName || item.name || 'Unnamed Product',
                description: item.description || '',
                discountedPrice,
                mainPrice,
                category: item.category || 'General',
                brand: item.brand || '',
                unit: item.unit || '',
                size: item.size || '',
                discount: item.discount || 0,
                material: item.material || '',
                color: item.color || '',
                age: item.age || '',
                stock: Number(item.stock) || 0,
                quantity: Number(newQty),
                images: Array.isArray(item.images)
                    ? item.images
                    : item.images
                        ? [item.images]
                        : [],
                customerId: userId,
                customerName: username,
                igst: item.igst || '0',
                cgst: item.cgst || '0',
                sgst: item.sgst || '0',
                cess: item.cess || '0',
                videoUrl: item.videoUrl || '',
            };

            console.log('🧾 Sending Cart Payload:', payload);

            // 🌐 API Call
            const response = await fetch('https://apis.toyshack.in/App/Cart/create-cart', {
                method: 'POST',
                headers: {
                    Accept: 'application/json',
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(payload),
            });

            const data = await response.json();
            console.log('🛒 Cart API Response:', data);

            if (response.ok && data.message) {
                Toast.show({ type: 'success', text1: 'Cart', text2: data.message });
            } else if (data.error) {
                Toast.show({ type: 'error', text1: 'Cart', text2: data.error });
            }
        } catch (err) {
            console.error('❌ Error updating cart:', err);
            Toast.show({ type: 'error', text1: 'Error', text2: 'Something went wrong.' });
        } finally {
            setUpdatingItem(null);
        }
    };

    const createwishlist = async (item) => {
        try {
            const userId = await AsyncStorage.getItem('id');
            const username = await AsyncStorage.getItem('Name');
            if (!userId || !username) {
                Toast.show({ type: 'error', text1: 'Error', text2: 'User not logged in.' });
                return;
            }
            const { _id = '', productName = '', description = '', price = 0, category = '', brand = '', unit = '', size = '', stock = '', discount = 0, material = '', color = '', age = '', igst = '', cgst = '', sgst = '', cess = '', images = [], } = item || {};
            const wishlistData = { customerid: userId, customerName: username, productId: _id, productName, description, price: item.finalPrice || item.price, category, quantity: 1, brand, unit, size, stock, discount, material, color, age, igst, cgst, sgst, cess, images: Array.isArray(images) ? images[0] : null, };
            const response = await fetch('https://apis.toyshack.in/App/wishlist/create-wishlist',
                {
                    method: 'POST', headers: { Accept: 'application/json', 'Content-Type': 'application/json', },
                    body: JSON.stringify(wishlistData),
                });
            const contentType = response.headers.get('content-type');
            if (contentType && contentType.includes('application/json')) {
                const data = await response.json();
                Toast.show({ type: 'success', text1: 'Success', text2: data.message || 'Product added to wishlist.' });
            }
            else {
                const errorText = await response.text(); console.warn('❌ Server did not return JSON:', errorText);
                Toast.show({ type: 'error', text1: 'Error', text2: 'Invalid server response.' });
            }
        } catch (error) {
            console.error('❌ Exception adding to wishlist:', error);
            Toast.show({ type: 'error', text1: 'Error', text2: 'Something went wrong. Please try again.' });
        }
    };


    const getDeliveryCharges = async () => {
        try {
            const response = await fetch(
                'https://apis.toyshack.in/App/deliverypincode/all-delivery-pincodes'
            );
            const data = await response.json();
            if (Array.isArray(data)) {
                setDeliveryData(data);
            } else {
                console.warn('❗ "deliverycharges" is not an array:', data);
            }
        } catch (error) {
            console.error('❌ Error fetching deliverycharges:', error);
        }
    };

    const fetchNotifications = async () => {
        const customerid = await AsyncStorage.getItem('id');

        try {
            const response = await fetch(`https://apis.toyshack.in/App/notifications/all-notifications`);
            const data = await response.json();
            console.log("data", data);

            // Get previously stored notification count
            const storedCount = await AsyncStorage.getItem('lastNotificationCount');
            const prevCount = storedCount ? parseInt(storedCount, 10) : 0;
            console.log("newNotifications========>", data)

            // Filter notifications for the specific donorId
            const filterData = data.notifications.filter(item => item.customerId === customerid);
            console.log("filterData========>", filterData)

            // Calculate new notification count for that donor
            const newNotifications = filterData.length - prevCount;

            // Set notification count if any new notifications exist
            if (newNotifications > 0) {
                setNotificationCount(newNotifications);
                console.log("newNotifications========>", newNotifications)
            } else {
                setNotificationCount(0);
            }

            // Store latest count for next comparison
            await AsyncStorage.setItem('lastNotificationCount', filterData.length.toString());
        } catch (error) {
            // navigation.navigate("Nointernet");
            console.log("=>=>", error);
        }
    };

    const handleRating = (productId, value) => {
        setRatings((prev) => ({ ...prev, [productId]: value }));
    };

    const renderItem1 = ({ item }) => (
        <TouchableOpacity
            onPress={() => {
                console.log('📦 Navigating with category:', item);
                navigation.navigate('Products', { selectedCategory: item });
            }}
            style={styles.card6}
        >
            <Image
                source={
                    item.categoryImage
                        ? { uri: `https://apis.toyshack.in/storage/categoryimages/${item.categoryImage}` }
                        : require('../Images/ActionFigures.png')
                }
                style={styles.cardImage6}
            />
            <View style={styles.cardContent6}>
                <Text style={styles.cardTitle6}>{item.categoryName}</Text>
                <Text style={styles.cardSubtitle6}>
                    {item.description || "Explore toys in this category."}
                </Text>
            </View>
        </TouchableOpacity>
    );



    useEffect(() => {
        getDeliveryCharges();
    }, []);

    // Handle user entering pincode
    const handleAreaCodeChange = async (code) => {
        setAreaCode(code);
        try {
            await AsyncStorage.setItem('postalcode', code);
        } catch (e) {
            console.error('❌ Failed to save pincode:', e);
        }
    };

    // Validate if pincode is available
    const validateAreaCode = () => {
        if (!areaCode.trim()) {
            setAlertMessage('Enter a valid pincode');
            setAlertType('error');
            setAlertVisible(true);
            return;
        }
        const isAvailable = deliveryData.some(
            (item) => item.pincode.toString() === areaCode
        );
        if (isAvailable) {
            setAlertMessage('🎁 Delivery available — start adding to your cart 😊');
            setAlertType('success');
        } else {
            setAlertMessage('💔 This location isn’t covered yet, but we’d love to serve you soon 🥺');
            setAlertType('error');
        }
        setAlertVisible(true);
        setModalVisible(false);
    };


    const loadData = async () => {
        try {
            await Promise.all([
                getbanners(),
                getproducts(),
                getComingsoon(),
                getCategories(),
                getDeliveryCharges(),
                fetchNotifications()
            ]);
        } catch (error) {
            // console.log("Error loading data:", error);

        } finally {
            if (firstLoad) {
                setLoading(false);  // hide loader only for first load
                setFirstLoad(false); // mark that first load has completed
            }
        }
    };

    useFocusEffect(
        useCallback(() => {
            loadData(); // run silently if not first load
            return () => {
                console.log("🔙 Screen unfocused");
            };
        }, [])
    );

    if (loading) {
        return (
            <LinearGradient colors={['#f9f6ff', '#d6e8ff']} style={styles.loadingContainer} >
                <Image
                    source={require('../Images/loadinglogo.png')}
                    style={styles.logo}
                />
                <View style={{ transform: [{ scale: 2 }] }}>
                    <ActivityIndicator size="small" color={"navy"} style={{ top: 20 }} />
                </View>
                {/* <Text style={styles.loadingText}>Loading...</Text> */}
            </LinearGradient>
        );
    }
    const renderStars = (count) => {
        return [...Array(5)].map((_, i) => (
            <Icon
                key={i}
                name="star"
                size={18}
                color={i < count ? "#fbc02d" : "#ddd"}
                style={{ marginRight: 2 }}
            />
        ));
    };

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
        <View style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity  style={{marginLeft:15}} onPress={() => navigation.navigate("Products")}>
                    <Icon name="magnify" size={34} color={"navy"} />
                </TouchableOpacity>
                <View style={{ alignItems: 'center' }}>
                    <Image
                        source={require('../Images/loadinglogo.png')}
                        style={styles.logo1}
                    />
                </View>
                <TouchableOpacity onPress={() => navigation.navigate("Notifications")}>
                    <Icon name="bell-circle" size={34} color={"navy"} style={{ top: 1 }} />
                    {notificationCount > 0 && (
                        <View style={styles.cartBadge}>
                            <Text style={styles.cartBadgeText}>{notificationCount}</Text>
                        </View>
                    )}
                </TouchableOpacity>
            </View>
            <View style={{ alignItems: 'center', }}>
                <TouchableOpacity style={{marginRight:15}} onPress={() => setModalVisible(true)}>
                    <Text style={styles.linkText}> 📍 Verify Delivery Location</Text>
                </TouchableOpacity>
            </View>
            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 140 }}>
                <LinearGradient colors={["#edccf1ff", "#e6ffff"]} style={styles.container1}>
                    {/* LEFT SECTION */}

                    <View style={styles.leftSection1}>
                        <Text style={styles.stars1}>⭐⭐⭐⭐⭐ Trusted by 10k+ families</Text>

                        <Text style={styles.heading1}>
                            Everything Your <Text style={styles.highlight1}>Little One</Text> Needs
                        </Text>

                        <Text style={styles.subText1}>
                            Discover premium quality toys, comfortable diapers, and adorable
                            dresses that bring joy to every moment of childhood.
                        </Text>

                        <View style={{ flexDirection: "row", gap: 10, alignItems: 'center', marginLeft: -11 }}>
                            <TouchableOpacity style={styles.deliveryBadge1}>
                                <Text style={styles.deliveryText1}>⚡ SAME DAY DELIVERY</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.deliveryBadge2}>
                                <Icon name="package-variant" size={20} color={"#1542b2ff"} />
                                <Text style={styles.deliveryText2}> OPEN BOX DELIVERY</Text>
                            </TouchableOpacity>
                        </View>

                        <View style={styles.buttonsRow1} >
                            <TouchableOpacity onPress={() => navigation.navigate('Products')}>
                                <LinearGradient colors={['#ff4da6', '#744eccff']}   // pink → purple
                                    start={{ x: 0, y: 0 }}            // left
                                    end={{ x: 1, y: 0 }} style={styles.shopNowButton1}  >
                                    <Text style={styles.shopNowText1}>Shop Now →</Text>
                                </LinearGradient>
                            </TouchableOpacity>

                            <TouchableOpacity style={styles.viewCategoriesButton1} onPress={() => navigation.navigate('CategoryScreen')}>
                                <Text style={styles.viewCategoriesText1}>View Categories</Text>
                            </TouchableOpacity>
                        </View>
                    </View>

                    {/* RIGHT SECTION (GRID 2x2) */}
                    {/* <View style={styles.rightSection1}>
                        <View style={styles.row1}>
                            <Card item={categories1[0]} />
                            <Card item={categories1[1]} />
                        </View>
                        <View style={styles.row1}>
                            <Card item={categories1[2]} />
                            <Card item={categories1[3]} />
                        </View>
                    </View> */}

                </LinearGradient>
                {/* Banner */}
                <View style={styles.bannerWrapper}>
                    <Swiper
                        autoplay
                        autoplayTimeout={3}
                        showsPagination={true}
                        dotColor="#ccc"
                        activeDotColor="#f08de0"
                        height={160}
                    >
                        {Array.isArray(banner) && banner.length > 0 ? (
                            banner.map((img, index) => (
                                <TouchableOpacity
                                    key={index}
                                    style={styles.slide}
                                    onPress={() => {
                                        if (img.products && img.products.length > 0) {
                                            const productIds = img.products.map(p => p.productId); // collect all productIds
                                            console.log('📦 Navigating with banner stored ProductIds:', productIds);
                                            navigation.navigate("Products", { productIds }); // send array
                                        } else {
                                            console.log("⚠️ No products linked to this banner");
                                        }
                                    }}
                                >
                                    <Image
                                        source={{
                                            uri: img.bannerImage
                                                ? `https://apis.toyshack.in/storage/bannerimages/${img.bannerImage}`
                                                : "https://via.placeholder.com/45",
                                        }}
                                        style={styles.bannerImage}
                                        resizeMode="cover"
                                    />
                                </TouchableOpacity>
                            ))
                        ) : (
                            <Text
                                style={{
                                    marginTop: 80,
                                    alignItems: "center",
                                    justifyContent: "center",
                                    alignSelf: "center",
                                }}
                            >
                                No banners found
                            </Text>
                        )}
                    </Swiper>
                </View>

                {Array.isArray(Comingsoon) && Comingsoon.length > 0 && (
                    <>
                        <View style={styles.sectionHeader}>
                            <Text style={styles.sectionTitle}>Coming soon</Text>
                            {/* <TouchableOpacity onPress={() => navigation.navigate('Products')}>
        <Text style={styles.viewAll}>View all</Text>
      </TouchableOpacity> */}
                        </View>

                        <FlatList
                            horizontal
                            showsHorizontalScrollIndicator={false}
                            data={Comingsoon}
                            keyExtractor={item => item._id}
                            contentContainerStyle={{ paddingHorizontal: 16 }}
                            renderItem={({ item }) => (
                                <TouchableOpacity activeOpacity={0.5}>
                                    <LinearGradient colors={['white', 'white']} style={styles.card}>
                                        <Image
                                            source={
                                                !productImageError && item.images
                                                    ? { uri: `https://apis.toyshack.in/storage/productimages/${item.images}` }
                                                    : require('../Images/ActionFigures.png')
                                            }
                                            style={styles.itemImage}
                                            onError={() => setProductImageError(true)}
                                        />
                                        <Text style={styles.itemTitle}>{item.productName}</Text>
                                    </LinearGradient>
                                </TouchableOpacity>
                            )}
                        />
                    </>
                )}

                {/* Categories Section */}
                <View style={styles.sectionHeader}>
                    <Text style={styles.sectionTitle}>Categories</Text>
                    <TouchableOpacity onPress={() => navigation.navigate('CategoryScreen')}>
                        <Text style={styles.viewAll}>View all</Text>
                    </TouchableOpacity>
                </View>
                {loading ? (
                    <ActivityIndicator size="large" color="#999" style={{ marginTop: 40 }} />
                ) : (
                    <FlatList
                        data={categories}
                        renderItem={renderItem1}
                        keyExtractor={(item) => item._id}
                        numColumns={numColumns}
                        contentContainerStyle={styles.grid}
                        showsVerticalScrollIndicator={false}
                        ListEmptyComponent={
                            <Text style={{
                                marginTop: 80,
                                alignItems: "center",
                                justifyContent: "center",
                                alignSelf: "center",
                                marginBottom: 20
                            }}>No matching category found.</Text>
                        }

                    />
                )}

                {/* Popular Items */}
                <View style={styles.sectionHeader}>
                    <Text style={styles.sectionTitle}>Popular Items</Text>
                    <TouchableOpacity onPress={() => navigation.navigate('Products')}>
                        <Text style={styles.viewAll}>View all</Text>
                    </TouchableOpacity>
                </View>
                {/* Pincode Modal */}
                <Modal
                    transparent={true}
                    visible={modalVisible}
                    animationType="slide"
                    onRequestClose={() => setModalVisible(false)}
                >
                    <View style={styles.modalOverlay}>
                        <View style={styles.modalBox}>
                            <Text style={styles.modalTitle}>Enter Pincode</Text>

                            <TextInput
                                style={styles.input}
                                placeholder="Enter pincode"
                                keyboardType="numeric"
                                value={areaCode}
                                onChangeText={handleAreaCodeChange}
                                maxLength={6}
                            />

                            <View style={styles.buttonRow}>
                                <LinearGradient colors={['#ff4da6', '#ff4da6', '#ff4da6']} style={[styles.button, styles.cancelButton]}>
                                    <TouchableOpacity
                                        onPress={() => setModalVisible(false)}
                                    >
                                        <Text style={styles.buttonText}>Cancel</Text>
                                    </TouchableOpacity>
                                </LinearGradient>
                                <LinearGradient colors={['navy', 'navy', 'navy']} style={[styles.button, styles.okButton]}>
                                    <TouchableOpacity
                                        onPress={validateAreaCode}
                                    >
                                        <Text style={styles.buttonText}>Check</Text>
                                    </TouchableOpacity>
                                </LinearGradient>
                            </View>
                        </View>
                    </View>
                </Modal>

                {/* Styled Alert Modal */}
                <Modal
                    transparent
                    visible={alertVisible}
                    animationType="fade"
                    onRequestClose={() => setAlertVisible(false)}
                >
                    <View style={styles.alertOverlay}>
                        <View
                            style={[
                                styles.alertBox,
                                alertType === 'success' ? styles.alertSuccess : styles.alertError,
                            ]}
                        >
                            <Text style={styles.alertText}>{alertMessage}</Text>
                            <TouchableOpacity
                                style={styles.alertButton}
                                onPress={() => setAlertVisible(false)}
                            >
                                <Text style={styles.alertButtonText}>OK</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </Modal>

                <FlatList
                    data={product}
                    numColumns={2}
                    keyExtractor={item => item._id.toString()}
                    contentContainerStyle={[
                        styles.productsContainer1,
                        { flexGrow: 1, justifyContent: product.length === 0 ? 'center' : 'flex-start' }
                    ]}
                    renderItem={({ item }) => {
                        const isOutOfStock = item.stock <= 0;
                        return (
                            <TouchableOpacity
                                onPress={() => {
                                    const qty = cartItems[item._id] || 0; // current quantity in cart
                                    const unitPrice = item.mainPrice ?? item.finalPrice ?? item.price ?? 0;
                                    const discountedPrice =
                                        item.discount > 0
                                            ? Math.round(unitPrice - (unitPrice * item.discount) / 100)
                                            : unitPrice;

                                    const amount = qty * discountedPrice; // total amount

                                    navigation.navigate("ProductDetailScreen", {
                                        product: item,
                                        quantity: qty,
                                        amount: amount,
                                    });

                                    console.log("➡️ Navigating with:", {
                                        product: item.productName,
                                        quantity: qty,
                                        amount: amount,
                                    });
                                }}
                            >
                                <LinearGradient colors={['white', 'white']} style={styles.card1}>
                                    <TouchableOpacity
                                        style={styles.favoriteIcon1}
                                        onPress={() => {
                                            createwishlist(item);
                                            toggleLike(item._id);
                                        }}
                                    >
                                        <Icon
                                            name={likedItems[item._id] ? 'heart' : 'heart-outline'}
                                            size={26}
                                            color={likedItems[item._id] ? '#e91e63' : '#ea1d68ff'}
                                        />
                                    </TouchableOpacity>

                                    <Image
                                        source={
                                            item.images && item.images.length > 0
                                                ? { uri: `https://apis.toyshack.in/storage/productimages/${item.images[0]}` }
                                                : require('../Images/still.png')
                                        }
                                        style={[styles.cardImage1, isOutOfStock && { opacity: 0.5 }]}
                                    />
                                    {item.stock > 0 && (
                                        <View style={styles.stockBadgeRight}>
                                            <Icon
                                                name="package-variant"
                                                size={16}
                                                color={item.stock <= 3 ? "red" : "navy"}
                                            />
                                            <Text
                                                style={[
                                                    styles.stockText,
                                                    { color: item.stock <= 3 ? "red" : "navy" }
                                                ]}
                                            >
                                                {item.stock > 3 ? "In Stock" : `${item.stock} left`}
                                            </Text>
                                        </View>
                                    )}
                                    {isOutOfStock && (
                                        <View style={styles.outOfStockOverlay}>
                                            <Text style={styles.outOfStockText}>OUT OF STOCK</Text>
                                        </View>
                                    )}

                                    <Text style={styles.cardTitle1} numberOfLines={2} ellipsizeMode="tail">
                                        {item.productName}
                                    </Text>
                                    <View style={{ flexDirection: 'row', alignItems: "center", }}>
                                        <View style={styles.cardBottom}>
                                            {item.discount > 0 ? (
                                                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, alignSelf: 'center' }}>
                                                    {/* Discounted Price */}
                                                    <Text style={{
                                                        fontSize: 14,
                                                        fontWeight: 'bold',
                                                        color: 'black'
                                                    }}>
                                                        ₹ {Math.round((item.finalPrice || item.price) - ((item.finalPrice || item.price) * item.discount / 100))}
                                                    </Text>
                                                    {/* Original Price */}
                                                    <Text style={{
                                                        fontSize: 13,
                                                        color: 'gray',
                                                        textDecorationLine: 'line-through'
                                                    }}>
                                                        ₹ {item.finalPrice || item.price}
                                                    </Text>

                                                </View>
                                            ) : (
                                                <Text style={styles.cardPrice1}>₹ {item.finalPrice || item.price}</Text>
                                            )}
                                        </View>


                                    </View>
                                    {/* <LinearGradient
                                        colors={isOutOfStock ? ['#ccc', '#bbb'] : ['navy', 'navy']}
                                        style={styles.cartIcon}
                                    >
                                        <TouchableOpacity
                                            onPress={() => !isOutOfStock && addCart(item, console.log("item=====>Pressed", item))}
                                            disabled={isOutOfStock}
                                        >
                                            {loading1 === item._id ? (
                                                <ActivityIndicator size="small" color="#fff" />
                                            ) : (
                                                <Text style={{ fontSize: 15, fontWeight: 'bold', color: 'white' }}>Add to cart</Text>
                                            )}
                                        </TouchableOpacity>
                                    </LinearGradient> */}
                                    {cartItems[item._id] > 0 ? (
                                        <View style={styles.qtyContainer}>
                                            <Pressable
                                                style={styles.qtyBtn}
                                                onPress={() => updateCartQuantity(item, cartItems[item._id] - 1)}
                                                disabled={updatingItem === item._id}
                                            >
                                                <Text style={styles.qtyBtnText}>-</Text>
                                            </Pressable>

                                            {updatingItem === item._id ? (
                                                <ActivityIndicator size="small" color="navy" style={{ marginHorizontal: 8 }} />
                                            ) : (
                                                <Text style={styles.qtyValue}>{cartItems[item._id]}</Text>
                                            )}

                                            <Pressable
                                                style={[
                                                    styles.qtyBtn,
                                                    cartItems[item._id] >= item.stock && { backgroundColor: '#ccc' } // gray when disabled
                                                ]}
                                                onPress={() => {
                                                    if (cartItems[item._id] < item.stock) {
                                                        updateCartQuantity(item, cartItems[item._id] + 1);
                                                    }
                                                }}
                                                disabled={updatingItem === item._id || cartItems[item._id] >= item.stock}
                                            >
                                                <Text style={styles.qtyBtnText}>+</Text>
                                            </Pressable>
                                        </View>
                                    ) : (
                                        <LinearGradient
                                            colors={isOutOfStock ? ['#ccc', '#bbb'] : ['navy', 'navy']}
                                            style={styles.cartIcon}
                                        >
                                            <TouchableOpacity
                                                onPress={() => !isOutOfStock && updateCartQuantity(item, 1)}
                                                disabled={isOutOfStock || updatingItem === item._id}
                                            >
                                                {updatingItem === item._id ? (
                                                    <ActivityIndicator size="small" color="#fff" />
                                                ) : (
                                                    <Text style={{ fontSize: 15, fontWeight: 'bold', color: 'white' }}>Add to cart</Text>
                                                )}
                                            </TouchableOpacity>
                                        </LinearGradient>
                                    )}
                                </LinearGradient>
                            </TouchableOpacity>
                        );
                    }}
                />
                <View style={{ alignItems: "center" }}>

                    <Text style={styles.heading3}>Shop by Age</Text>
                    <Text style={styles.subHeading3}>
                        Find the perfect toys for every stage of your child's growth.
                    </Text>
                </View>

                {/* Age Group Circles */}
                <View style={styles.row3}>
                    {ageGroups.map((group) => (
                        <TouchableOpacity
                            key={group.id}
                            style={styles.card3}
                            onPress={() => {
                                console.log("👶 Selected Age:", group.title);
                                navigation.navigate("Products", { selectedAge: group.title }); // 👈 send age param
                            }}
                        >
                            <View style={[styles.circle3, { backgroundColor: group.color }]}>
                                <Image source={group.image} style={styles.image3} />
                            </View>
                            <Text style={styles.ageText3}>{group.title} Year's</Text>
                        </TouchableOpacity>
                    ))}
                </View>
                <View style={{ alignItems: "center", marginTop: 20 }}>
                    <Text style={styles.heading4}>What Parents Are Saying</Text>
                    <Text style={styles.subHeading4}>
                        Real Stories from families who love ToyShack.
                    </Text>
                </View>
                <View style={styles.container4}>
                    {/* Prev Button */}
                    <TouchableOpacity style={styles.navBtn4} onPress={handlePrev}>
                        <Icon name="chevron-left" size={24} color="#000" />
                    </TouchableOpacity>

                    {/* Testimonial Card */}
                    <View style={styles.card4}>
                        <View style={styles.stars4}>{renderStars(testimonials[currentIndex].rating)}</View>
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
                            <Text style={styles.name4}>{testimonials[currentIndex].name}</Text>
                        </View>
                    </View>

                    {/* Next Button */}
                    <TouchableOpacity style={styles.navBtn4} onPress={handleNext}>
                        <Icon name="chevron-right" size={24} color="#000" />
                    </TouchableOpacity>
                </View>

                <View style={styles.container5}>
                    <Text style={styles.heading5}>Why Shop With Us?</Text>
                    <View style={styles.row5}>
                        {features.map((item) => (
                            <View key={item.id} style={styles.card5}>
                                <View style={styles.iconCircle5}>
                                    <Icon name={item.icon} size={28} color="#ff5cb8" />
                                </View>
                                <Text style={styles.title5}>{item.title}</Text>
                                <Text style={styles.desc5}>{item.desc}</Text>
                            </View>
                        ))}
                    </View>
                </View>
                <View style={styles.container6}>
                    <Text style={styles.heading6}>Contact</Text>

                    {/* Email */}
                    <View style={styles.row6}>
                        <Icon name="email-outline" size={20} color="#ff5cb8" />
                        <Text
                            style={styles.text6}
                            onPress={() => Linking.openURL("mailto:hello.toyshack@gmail.com")}
                        >
                            hello.toyshack@gmail.com
                        </Text>
                    </View>

                    {/* Phone Numbers */}
                    <View style={styles.row6}>
                        <Icon name="phone" size={20} color="#ff5cb8" />
                        <Text
                            style={styles.text6}
                            onPress={() => Linking.openURL("tel:+918121301888")}
                        >
                            +91 8121301888
                        </Text>
                    </View>

                    <View style={styles.row6}>
                        <Icon name="phone" size={20} color="#ff5cb8" />
                        <Text
                            style={styles.text6}
                            onPress={() => Linking.openURL("tel:+918121304888")}
                        >
                            +91 8121304888
                        </Text>
                    </View>
                    <View style={styles.row6}>
                        <Icon name="map-marker" size={20} color="#ff5cb8" />
                        <Text
                            style={styles.text6}
                            onPress={() =>
                                Linking.openURL(
                                    "https://www.google.com/maps/search/?api=1&query=D. No. 25-84/42/FF502, venu dharani apartment, P.M PALEM, Revenue Ward 4, Visakhapatnam, Andhra Pradesh - 530048"
                                )
                            }
                        >
                            D. No. 25-84/42/FF502, venu dharani apartment, P.M PALEM, Revenue Ward 4,
                            Visakhapatnam, Andhra Pradesh - 530048
                        </Text>
                    </View>


                    {/* Social Media */}
                    <View style={styles.socialRow6}>
                        <TouchableOpacity onPress={() => Linking.openURL("https://facebook.com")}>
                            <Icon name="facebook" size={26} color="#0046c0" style={styles.icon} />
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => Linking.openURL("https://instagram.com")}>
                            <Icon name="instagram" size={26} color="#ff5cb8" style={styles.icon} />
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => Linking.openURL("https://x.com")}>
                            <Icon name="twitter" size={26} color="#000" style={styles.icon} />
                        </TouchableOpacity>
                    </View>
                </View>



            </ScrollView>
        </View >
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "white"
    },
    header: {
        marginTop: 30,
        marginHorizontal: 16,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 10,
        // backgroundColor:'#ff4da6'

    },
    searchInput: {
        flex: 1,
        marginHorizontal: 12,
        backgroundColor: '#f0f0f0',
        borderRadius: 10,
        paddingHorizontal: 12,
        height: 36,
    },
    bannerWrapper: {
        height: 200,
        marginHorizontal: 16,
        borderRadius: 16,
        overflow: 'hidden',
        marginTop: 20,
    },
    slide: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    bannerImage: {
        width: '100%',
        height: '100%',
        borderRadius: 25,
    },
    bannerButton: {
        position: 'absolute',
        bottom: 10,
        alignItems: "flex-end",
        backgroundColor: '#f08de0',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 20,
        justifyContent: 'flex-end'
    },
    bannerButtonText: {
        color: '#000000',
        fontWeight: 'bold',
        fontSize: 19,
    },
    cardBottom: {
        // flexDirection: 'row',
        // alignItems: 'flex-start',
        // justifyContent: 'space-between',
        width: '35%',
    },
    sectionHeader: {
        marginHorizontal: 16,
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 10,
        marginTop: 20,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: "navy"
    },
    viewAll: {
        color: 'navy',
    },
    card: {
        backgroundColor: 'white',
        borderRadius: 16,
        padding: 12,
        marginRight: 16,
        width: 180,
        alignItems: 'center',
        shadowColor: '#ccc',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 6,
        elevation: 3,
    },
    productsContainer1: {
        paddingHorizontal: CARD_MARGIN,
        paddingBottom: 40,
    },
    card1: {
        borderRadius: 16,
        margin: CARD_MARGIN,
        padding: 10,
        alignItems: "center",
        borderWidth: 1,
        borderColor: "#e97cb3ff",
        width: CARD_WIDTH,
        backgroundColor: "#fff",
    },
    cardImage1: {
        width: "100%",
        height: 140,        // keep fixed height
        resizeMode: "contain",
        marginBottom: 10,
    },
    cardTitle1: {
        fontWeight: "800",
        marginBottom: 6,
        color: "#ff4da6",
        textAlign: "center",
        fontSize: 14,
        height: 40,        // ✅ fixes card height for 2 lines
        lineHeight: 20,    // keeps spacing consistent
    },
    favoriteIcon1: {
        alignSelf: 'flex-start',
        backgroundColor: '#fff',
        padding: 6,
        borderRadius: 10,
        position: 'absolute',
        top: 16,
        left: 16,
        zIndex: 1,
    },

    cardBottom1: {
        // flexDirection: 'row',
        // alignItems: 'flex-start',
        // justifyContent: 'space-between',
        width: '35%',
    },
    cardPrice1: {
        fontSize: 14,
        fontWeight: 'bold',
    },
    cartButton1: {
        backgroundColor: '#2e3b91ff',
        padding: 8,
        borderRadius: 20,
    },
    stockBadgeRight: {
        position: "absolute",
        top: 10,
        right: 10,   // 🔥 move to right side
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "hsla(0, 0%, 100%, 0.7)",
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: 10,
    },
    stockText: {
        fontSize: 15,
        fontWeight: "bold",
        marginLeft: 4,
    },
    outOfStockOverlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 8,
    },
    outOfStockText: {
        color: '#fff',
        fontSize: 14,
        fontWeight: 'bold',
        backgroundColor: 'rgba(255,0,0,0.8)',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 4,
    },
    cartIcon: {
        width: 110,
        height: 28,
        marginTop: 10,
        borderRadius: 14,
        alignItems: 'center',
        justifyContent: 'center',
    },
    cardBottomRow1: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        width: '100%',
    },
    cardBottomRowWide1: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        width: 280,
    },
    linkText: {
        fontSize: 16,
        color: 'navy',
        fontWeight: 'bold',
        // textDecorationLine: 'underline',
        fontStyle: 'italic',
        bottom: 10

    },
    modalOverlay: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0,0,0,0.5)',
    },
    modalBox: {
        width: '80%',
        backgroundColor: '#fff',
        padding: 20,
        borderRadius: 10,
        elevation: 5,
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 15,
    },
    input: {
        borderWidth: 1,
        borderColor: '#ccc',
        padding: 10,
        borderRadius: 5,
        marginBottom: 15,
    },
    buttonRow: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
    },
    button: {
        paddingVertical: 8,
        paddingHorizontal: 15,
        borderRadius: 5,
        marginLeft: 10,
    },
    cancelButton: {
        backgroundColor: '#ccc',
    },
    okButton: {
        backgroundColor: '#28a745',
    },
    buttonText: {
        color: '#fff',
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    loadingText: {
        marginTop: 10,
        fontSize: 16,
    },
    logo: {
        width: 190,
        height: 50,
        // borderRadius: 250,
    },
    logo1: {
        width: 175,
        height: 50,
        // borderRadius: 250,
    },
    alertOverlay: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0,0,0,0.5)',
    },
    alertBox: {
        width: '75%',
        padding: 20,
        borderRadius: 10,
        alignItems: 'center',
    },
    alertSuccess: {
        backgroundColor: '#d4edda',
    },
    alertError: {
        backgroundColor: '#f8d7da',
    },
    alertText: {
        fontSize: 16,
        textAlign: 'center',
        marginBottom: 15,
        color: '#000',
    },
    alertButton: {
        backgroundColor: '#007BFF',
        paddingHorizontal: 20,
        paddingVertical: 8,
        borderRadius: 5,
    },
    alertButtonText: {
        color: '#fff',
        fontWeight: 'bold',
    },
    ratingBox: {
        backgroundColor: "#fff",
        borderRadius: 10,
        padding: 15,
        marginBottom: 20,
        elevation: 3,
        marginRight: 15,
        marginTop: 10,
    },
    title: {
        fontSize: 18,
        fontWeight: "600",
        marginTop: 30,
        textAlign: "center",
    },
    productContainer: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 15,
    },
    productImage: {
        width: 60,
        height: 60,
        marginRight: 15,
        borderRadius: 8,
    },
    productTitle: {
        fontSize: 16,
        fontWeight: "500",
    },
    productPrice: {
        fontSize: 14,
        color: "#555",
    },
    ratingContainer: {
        flexDirection: "row",
        justifyContent: "center",
        marginBottom: 10,
    },
    star: {
        marginHorizontal: 4,
    },
    ratingText: {
        textAlign: "center",
        color: "#444",
    },
    // grid: {
    //     paddingHorizontal: 12,
    //     paddingBottom: 24,
    // },
    itemContainer: {
        alignItems: 'center',
        justifyContent: 'center',
    },
    card6: {
        width: "45%",
        backgroundColor: "white",
        borderRadius: 20,
        margin: 10,
        overflow: "hidden",
        elevation: 3,
        shadowColor: "#000",
        shadowOpacity: 0.1,
        shadowOffset: { width: 0, height: 2 },
        shadowRadius: 5,
    },
    cardImage6: {
        width: "100%",
        height: 120,
        resizeMode: "cover",
    },
    cardContent6: {
        padding: 12,
        alignItems: "center",
    },
    cardTitle6: {
        fontSize: 16,
        fontWeight: "700",
        color: "#000",
        textAlign: "center",
        marginBottom: 5,
    },
    cardSubtitle6: {
        fontSize: 13,
        color: "#666",
        textAlign: "center",
    },
    cartBadge: {
        position: 'absolute',
        top: -4,
        right: -10,
        backgroundColor: 'red',
        borderRadius: 10,
        minWidth: 18,
        height: 18,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 4,
    },
    cartBadgeText: {
        color: 'white',
        fontSize: 12,
        fontWeight: 'bold',
    },
    // sub card styles
    // 
    // *************************************************************
    container1: {
        flex: 1,
        flexDirection: "row",
        padding: 20,
        margin: 10,
        borderRadius: 20
    },
    leftSection1: {
        flex: 1,
        paddingRight: 10,
    },
    rightSection1: {
        flex: 1,
        paddingLeft: 10,
        justifyContent: "center",
    },
    stars1: {
        fontSize: 14,
        marginBottom: 10,
        color: "#555",
    },
    heading1: {
        fontSize: 28,
        fontWeight: "bold",
        color: "#000",
        marginBottom: 10,
    },
    highlight1: {
        color: "#ff4da6",
    },
    subText1: {
        fontSize: 14,
        color: "#555",
        marginBottom: 20,
    },
    deliveryBadge1: {
        backgroundColor: "#b2ffd6",
        paddingVertical: 6,
        paddingHorizontal: 15,
        borderRadius: 20,
        marginBottom: 20,
        alignSelf: "flex-start",
        flexDirection: "row",   // ✅ keep it consistent with badge2
        alignItems: "center",
    },
    deliveryText1: {
        color: "#0a7f4f",
        fontWeight: "bold",
        fontSize: 13,
    },

    deliveryBadge2: {
        backgroundColor: "#b7e9f6",
        paddingVertical: 6,
        paddingHorizontal: 15,
        borderRadius: 20,
        marginBottom: 20,
        alignSelf: "flex-start",
        flexDirection: "row",
        alignItems: "center",
    },
    deliveryText2: {
        color: "#1542b2ff",
        fontWeight: "bold",
        fontSize: 13,
        marginLeft: 6, // ✅ adds spacing after icon
    },

    buttonsRow1: {
        flexDirection: "row",
        alignItems: "center",
        marginTop: 30,
    },
    shopNowButton1: {
        paddingVertical: 12,
        paddingHorizontal: 25,
        borderRadius: 30,
        marginRight: 10,
        top: 10
    },
    shopNowText1: {
        color: "#fff",
        fontSize: 15,
        fontWeight: "bold",
    },
    viewCategoriesButton1: {
        borderWidth: 1,
        borderColor: "#ff4da6",
        paddingVertical: 12,
        paddingHorizontal: 25,
        borderRadius: 30,
        top: 10,
        flexDirection: "row"
    },
    viewCategoriesText1: {
        color: "#ff4da6",
        fontSize: 15,
        fontWeight: "bold",
    },

    // Cards
    row1: {
        flexDirection: "row",
        justifyContent: "space-between",
        marginBottom: 15,
        borderRadius: 20
    },
    card2: {
        backgroundColor: "#fff",
        borderRadius: 15,
        width: (width / 3.6) - 35, // ✅ fixed width for 2 cards per row
        height: 155,             // ✅ fixed height
        shadowColor: "#000",
        shadowOpacity: 0.1,
        shadowRadius: 5,
        elevation: 4,
        borderCurve: 10,
        resizeMode: "cover"


    },
    cardGradient2: {
        height: 190,
        borderTopLeftRadius: 55,
        borderTopRightRadius: 15,
        borderRadius: 15,
        justifyContent: "center",
        alignItems: "center",
    },
    emoji2: {
        fontSize: 30,
        alignItems: 'center',
        marginLeft: 25,
        borderRadius: 50,
        height: 50
    },
    cardTitle2: {
        fontWeight: "bold",
        fontSize: 16,
        marginTop: 10,
        marginLeft: 10,
    },
    cardPrice2: {
        fontSize: 13,
        marginLeft: 10,
        color: "#555",
    },
    //agessssssssssssssssssssssssssssss
    container3: {
        alignItems: "center",
        padding: 20,
    },
    heading3: {
        fontSize: 20,
        fontWeight: "bold",
        color: "navy",
        marginBottom: 5,
        marginTop: 10,
        alignItems: 'center'
    },
    subHeading3: {
        fontSize: 14,
        color: "#100707ff",
        textAlign: "center",
        marginBottom: 20,
        margin: 5
    },
    heading4: {
        fontSize: 20,
        fontWeight: "bold",
        color: "navy",
        marginBottom: 5,
        marginTop: 10,
        alignItems: 'center'
    },
    subHeading4: {
        fontSize: 14,
        color: "#100707ff",
        textAlign: "center",
        marginBottom: 20,
    },
    row3: {
        flexDirection: "row",
        flexWrap: "wrap",
        justifyContent: "center",
        // borderRadius:25
    },
    card3: {
        alignItems: "center",
        margin: 10,
        // borderRadius:25

    },
    circle3: {
        width: 130,
        height: 130,
        borderRadius: 65,
        justifyContent: "center",
        alignItems: "center",
        marginBottom: 10,
        // borderRadius:25

    },
    image3: {
        width: 80,
        height: 80,
        resizeMode: "contain",
    },
    ageText3: {
        fontSize: 16,
        fontWeight: "600",
        color: "#000",
    },
    container4: {
        backgroundColor: "#ff4da6",
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        padding: 20,
    },
    container41: {
        backgroundColor: "#ff5cb8",
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        padding: 20,
    },
    card4: {
        backgroundColor: "#fff",
        borderRadius: 15,
        padding: 20,
        width: "75%",
        elevation: 3,
        shadowColor: "#000",
        shadowOpacity: 0.1,
        shadowRadius: 4,
        shadowOffset: { width: 0, height: 2 },
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
    //why shop
    container5: {
        paddingVertical: 30,
        paddingHorizontal: 10,
        alignItems: "center",
        backgroundColor: "#fff",
    },
    heading5: {
        fontSize: 22,
        fontWeight: "bold",
        color: "navy",
        marginBottom: 20,
    },
    row5: {
        flexDirection: "row",
        flexWrap: "wrap",
        justifyContent: "center",
    },
    card5: {
        backgroundColor: "#fff",
        borderRadius: 12,
        padding: 15,
        width: "45%",
        margin: 8,
        alignItems: "center",
        elevation: 3,
        shadowColor: "#000",
        shadowOpacity: 0.08,
        shadowRadius: 4,
        shadowOffset: { width: 0, height: 2 },
    },
    iconCircle5: {
        width: 50,
        height: 50,
        borderRadius: 25,
        backgroundColor: "#f8f8f8",
        alignItems: "center",
        justifyContent: "center",
        marginBottom: 10,
    },
    title5: {
        fontSize: 15,
        fontWeight: "700",
        textAlign: "center",
        marginBottom: 5,
        color: "#000",
    },
    desc5: {
        fontSize: 13,
        color: "#555",
        textAlign: "center",
    },
    container6: {
        backgroundColor: "#fde7f3", // light pink background
        padding: 20,
        borderRadius: 20,
        margin: 10

    },
    heading6: {
        fontSize: 20,
        fontWeight: "bold",
        color: "#0046c0",
        marginBottom: 15,
        alignItems: 'center',
    },
    row6: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 10,
        margin: 5
    },
    text6: {
        fontSize: 16,
        marginLeft: 8,
        color: "#000",
    },
    socialRow6: {
        flexDirection: "row",
        marginTop: 50,
        alignItems: 'center',
        gap: 50,
        alignSelf: 'center'
    },
    icon6: {
        marginRight: 15,
        // alignItems:"center"
    },
    qtyContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'white',
        borderRadius: 20,
        borderWidth: 1,
        borderColor: 'navy',
        marginTop: 10,
        height: 30,
        width: 110,
    },
    qtyBtn: {
        width: 50,
        height: 30,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'navy',
        borderRadius: 20,
    },
    qtyBtnText: {
        color: 'white',
        fontSize: 18,
        fontWeight: 'bold',
    },
    qtyValue: {
        fontSize: 16,
        fontWeight: 'bold',
        color: 'black',
        marginHorizontal: 12,
    },
});

export default App;






{/* Rating Box */ }

{/* <View>
                    <Text style={styles.title}>Rate Your Experience</Text>
                    <FlatList
                        data={products}
                        renderItem={renderItem}
                        keyExtractor={(item) => item.id}
                        contentContainerStyle={{ paddingHorizontal: 15 }}
                        horizontal={true}
                    />
                </View> */}




{/* Features Section */ }
{/* <View style={styles.sectionHeader}>
                    <Text style={styles.sectionTitle}>Coming soon</Text> */}
{/* <TouchableOpacity onPress={() => navigation.navigate('Products')}>
                        <Text style={styles.viewAll}>View all</Text>
                    </TouchableOpacity> */}
{/* </View>

                <FlatList
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    data={Comingsoon}
                    keyExtractor={item => item._id}
                    contentContainerStyle={{ paddingHorizontal: 16 }}
                    renderItem={({ item }) => (
                        <TouchableOpacity activeOpacity={0.5}> */}
{/* onPress={() => navigation.navigate("ProductDetailScreen", { product: item })} */ }
{/* <LinearGradient colors={['#d5f3ff', '#ffe9ff']} style={styles.card}>
                                <Image
                                    source={
                                        !productImageError && item.images
                                            ? { uri: `https://apis.toyshack.in/storage/productimages/${item.images}` }
                                            : require('../Images/teddy.png') // 👈 your local placeholder
                                    }
                                    style={styles.itemImage}
                                    onError={() => setProductImageError(true)}
                                />
                                <Text style={styles.itemTitle}>{item.productName}</Text> */}
{/* <View style={styles.cardBottomRow}> */ }
{/* <View> */ }
{/* <Text style={styles.itemPrice}>₹{item.price}</Text> */ }
{/* </View> */ }
{/* <TouchableOpacity style={styles.cartButton}>
                                        <Icon name="cart-outline" size={20} color="#fff" />
                                    </TouchableOpacity> */}
{/* </View> */ }
{/* </LinearGradient>
                        </TouchableOpacity>
                    )}
                    ListEmptyComponent={
                        <View style={{ alignItems: 'center', justifyContent: 'center', width: '100%', alignSelf: 'center', marginLeft: 60 }}>
                            <Image
                                source={require('../Images/commingsoon3.png')} // 👈 replace with your actual image path
                                style={{ width: 200, height: 200, resizeMode: 'contain' }}
                            />
                            <Text style={{ marginTop: 10, fontSize: 16, color: '#666' }}>Coming Soon...</Text>
                        </View>
                    }
                /> */}

{/* <View style={styles.sectionHeader}>
                    <Text style={styles.sectionTitle}>Categories</Text>
                    <TouchableOpacity onPress={() => navigation.navigate('CategoryScreen')}>
                        <Text style={styles.viewAll}>View all</Text>
                    </TouchableOpacity>
                </View>
                {loading ? (
                    <ActivityIndicator size="large" color="#999" style={{ marginTop: 40 }} />
                ) : (
                    <FlatList
                        data={categories}
                        renderItem={renderItem1}
                        keyExtractor={(item) => item._id}
                        numColumns={numColumns}
                        contentContainerStyle={styles.grid}
                        showsVerticalScrollIndicator={false}
                        ListEmptyComponent={
                            <Text style={styles.noResults}>No matching category found.</Text>
                        }
                    />
                )} */}