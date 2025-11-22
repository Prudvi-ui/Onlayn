import React, { useState, useEffect, useContext, useCallback, useRef } from 'react';
import {
    View,
    Text,
    TextInput,
    FlatList,
    Image,
    StyleSheet,
    TouchableOpacity,
    StatusBar,
    ActivityIndicator, Dimensions,
    Pressable
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import LinearGradient from 'react-native-linear-gradient';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { CartContext } from '../context';
import { useRoute, useFocusEffect } from '@react-navigation/native';
import Share from 'react-native-share';
import Toast from 'react-native-toast-message';

const STORAGE_KEY = '@search_history';
const { width } = Dimensions.get("window"); // screen width
const CARD_MARGIN = 8;
const CARD_WIDTH = (width / 2) - (CARD_MARGIN * 3); // 2 cards per row

const SearchScreen = ({ navigation }) => {
    const route = useRoute();
    const [searchText, setSearchText] = useState('');
    const [searchHistory, setSearchHistory] = useState([]);
    const [product, setProduct] = useState([]);
    const [allProducts, setAllProducts] = useState([]);
    const [loading, setLoading] = useState(false);
    const productId = route.params?.productId ?? null;
    const productIds = route.params?.productIds ?? []; //     const { cartCount, setCartCount } = useContext(CartContext);
    const filters = route.params?.filters;
    const selectedCategory = route.params?.selectedCategory;
    const [cartCount, setCartCount] = useState("0")
    const age = route.params?.selectedAge
    const [cartItems, setCartItems] = useState({}); // productId -> quantity
    const [likedItems, setLikedItems] = useState({});
    const toggleLike = (productId) => {
        setLikedItems((prev) => ({
            ...prev,
            [productId]: !prev[productId],
        }));
    };
    const flatListRef = useRef(null);
    const [showScrollTop, setShowScrollTop] = useState(false);
    const [updatingItem, setUpdatingItem] = useState(null); // track which product is updating

    const getProduct = async () => {
        setLoading(true);
        try {
            const response = await fetch('https://apis.toyshack.in/App/products/all-products');
            const data = await response.json();

            if (Array.isArray(data)) {
                setAllProducts(data);
                applyFilters(data);
            } else {
                console.warn('❗ "products" is not an array:', data);
            }
        } catch (error) {
            navigation.navigate("Nointernet")
            console.error('❌ Error fetching products:', error);
        } finally {
            setLoading(false);
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



    const applyFilters = (data) => {
        if (!Array.isArray(data)) {
            console.warn("❗Product data is not an array");
            return;
        }

        let filtered = [...data];

        // 🔍 Case 1: Single productId
        if (typeof productId === 'string' && productId.trim() !== '') {
            filtered = data.filter(item => item._id === productId);
            setProduct(filtered);
            return;
        }

        // 🔍 Case 2: Multiple productIds (from banner)
        if (Array.isArray(productIds) && productIds.length > 0) {
            filtered = data.filter(item => productIds.includes(item._id));
            setProduct(filtered);
            return;
        }

        // ✅ Filter by selected category
        if (selectedCategory?.categoryName) {
            filtered = filtered.filter(item =>
                item.category?.toLowerCase().trim() === selectedCategory.categoryName.toLowerCase().trim()
            );
        }

        // ✅ Filter by filters.category
        if (filters?.category) {
            filtered = filtered.filter(item =>
                item.category?.toLowerCase().trim() === filters.category.toLowerCase().trim()
            );
        }

        // ✅ Filter by selectedAge (param from navigation)
        if (age) {
            const [minAge, maxAge] = age
                .replace(/[^\d\-]/g, '')   // keep only digits and dash
                .split('-')
                .map(Number);

            filtered = filtered.filter(item => {
                if (!item.age) return false; // skip if no age info
                const itemAge = parseInt(item.age);
                return itemAge >= minAge && itemAge <= maxAge;
            });
        }

        // ✅ Filter by filters.ageGroup (range like 3-6, 7-10, etc.)
        if (filters?.ageGroup) {
            const [minAge, maxAge] = filters.ageGroup
                .replace(/[^\d\-]/g, '')
                .split('-')
                .map(Number);

            filtered = filtered.filter(item => {
                if (!item.age) return true;
                const itemAge = parseInt(item.age);
                return itemAge >= minAge && itemAge <= maxAge;
            });
        }

        // ✅ Price filter
        if (filters?.priceRange) {
            if (filters.priceRange === '< ₹500') {
                filtered = filtered.filter(item => item.finalPrice < 500);
            } else if (filters.priceRange === '₹500-₹1000') {
                filtered = filtered.filter(item => item.finalPrice >= 500 && item.finalPrice <= 1000);
            } else if (filters.priceRange === '> ₹1000') {
                filtered = filtered.filter(item => item.finalPrice > 1000);
            }
        }

        // ✅ Brand filter
        if (filters?.brand) {
            filtered = filtered.filter(item =>
                item.brand?.toLowerCase().trim() === filters.brand.toLowerCase().trim()
            );
        }

        // ✅ Size filter
        if (filters?.size) {
            filtered = filtered.filter(item => {
                if (!item.size) return true;
                return item.size?.toLowerCase().trim() === filters.size.toLowerCase().trim();
            });
        }

        setProduct(filtered);
    };


    useFocusEffect(
        useCallback(() => {
            const loadHistory = async () => {
                const history = await AsyncStorage.getItem(STORAGE_KEY);
                if (history) setSearchHistory(JSON.parse(history));
            };
            loadHistory();
            getProduct();
            fetchCartItems()
        }, [])
    );



 const fetchCartItems = async () => {
  try {
    const customerId = await AsyncStorage.getItem('id');

    if (!customerId) {
      console.warn("⚠️ No customerId found in AsyncStorage");
      setCartItems({});
      setCartCount(0);
      return;
    }

    const response = await fetch('https://apis.toyshack.in/App/Cart/Cart-data', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ customerId }),
    });

    if (response.ok && response.headers.get('content-type')?.includes('application/json')) {
      const data = await response.json();

      const items = Array.isArray(data.response)
        ? data.response.filter(
            item =>
              item.customerId?.toString() === customerId.toString() ||
              item.customerId?._id?.toString() === customerId.toString()
          )
        : [];

      // ✅ Convert array into object: { productId: quantity }
      const mappedItems = {};
      items.forEach((p) => {
        mappedItems[p.productId] = Number(p.quantity) || 0;
      });

      setCartItems(mappedItems);
      setCartCount(Object.keys(mappedItems).length);
    } else {
      console.error("❌ Invalid response or non-JSON content");
      setCartItems({});
      setCartCount(0);
    }
  } catch (error) {
    console.error('❌ Error fetching cart items:', error);
    setCartItems({});
    setCartCount(0);
  }
};


    useEffect(() => {
        if (allProducts.length > 0) {
            applyFilters(allProducts);
        }
        fetchCartItems()
    }, [filters, selectedCategory]);

    const saveHistory = async (newHistory) => {
        setSearchHistory(newHistory);
        await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(newHistory));
    };

    const handleSearch = () => {
        if (!searchText.trim()) return;
        const newHistory = [searchText, ...searchHistory.filter(item => item !== searchText)];
        saveHistory(newHistory);
        // setSearchText('');
    };

    const handleHistoryPress = (item) => {
        setSearchText(item);

    };

    const handleRemoveItem = async (item) => {
        const filtered = searchHistory.filter(h => h !== item);
        saveHistory(filtered);
    };

    const handleClearAll = async () => {
        await AsyncStorage.removeItem(STORAGE_KEY);
        setSearchHistory([]);
    };

    const filteredProducts = product.filter(p =>
        p.productName?.toLowerCase().includes(searchText.toLowerCase()) ||
        (Array.isArray(p.metaKeyword)
            ? p.metaKeyword.some(keyword =>
                keyword.toLowerCase().includes(searchText.toLowerCase())
            )
            : p.metaKeyword?.toLowerCase().includes(searchText.toLowerCase())) ||
        p.category?.toLowerCase().includes(searchText.toLowerCase()) // ✅ added category search
    );


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





    return (
        <View style={styles.container}>
            {/* <LinearGradient colors={['#E8F6FF', '#F7E8FF']} style={styles.container}> */}
            <StatusBar backgroundColor="#E8F6FF" barStyle="dark-content" />

            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()}>
                    <Icon name="menu-left" size={36} color="#333" />
                </TouchableOpacity>
                <Text style={styles.title}>Products</Text>
                <TouchableOpacity onPress={() => navigation.navigate("CartScreen")}>
                    <Icon name="cart" size={30} color="navy" />
                    {cartCount > 0 && (
                        <View style={{
                            position: 'absolute',
                            top: -10,
                            right: -6,
                            backgroundColor: 'red',
                            borderRadius: 10,
                            minWidth: 14,
                            height: 14,
                            paddingHorizontal: 4,
                            paddingVertical: 1,
                            justifyContent: 'center',
                            alignItems: 'center',
                        }}>
                            <Text style={{ color: 'white', fontSize: 10 }}></Text>
                        </View>
                    )}
                </TouchableOpacity>
            </View>

            <View style={styles.searchContainer}>
                <Icon name="magnify" size={22} color="#666" />
                <TextInput
                    placeholder="Search"
                    style={styles.searchInput}
                    value={searchText}
                    onChangeText={setSearchText}
                    onSubmitEditing={handleSearch}
                    placeholderTextColor="#999"
                />
                <TouchableOpacity onPress={() => navigation.navigate('FilterScreen')}>
                    <Icon name="filter-variant" size={26} color="navy" />
                </TouchableOpacity>
            </View>

            {searchHistory.length > 0 && (
                <>
                    <View style={styles.historyHeader}>
                        <Text style={styles.historyTitle}>Search History</Text>
                        <TouchableOpacity onPress={handleClearAll}>
                            <Text style={styles.clearText}>Clear all</Text>
                        </TouchableOpacity>
                    </View>

                    {searchHistory.map((item, index) => (
                        <View key={index} style={styles.historyItem}>
                            <Icon name="clock-time-four-outline" size={16} color="#555" />
                            <TouchableOpacity style={{ flex: 1 }} onPress={() => handleHistoryPress(item)}>
                                <Text style={styles.historyText}>{item}</Text>
                            </TouchableOpacity>
                            <TouchableOpacity onPress={() => handleRemoveItem(item)}>
                                <Icon name="close" size={16} color="#555" />
                            </TouchableOpacity>
                        </View>
                    ))}
                </>
            )}
            <FlatList
                ref={flatListRef}
                data={filteredProducts}
                numColumns={2}
                keyExtractor={item => item._id.toString()}
                onScroll={(event) => {
                    const yOffset = event.nativeEvent.contentOffset.y;
                    setShowScrollTop(yOffset > 300); // show when scrolled down 300px
                }}
                scrollEventThrottle={16}
                contentContainerStyle={[
                    styles.productsContainer,
                    { flexGrow: 1, justifyContent: filteredProducts.length === 0 ? 'center' : 'flex-start' }
                ]}
                renderItem={({ item }) => {
                    const isOutOfStock = item.stock <= 0;
                    return (
                        <TouchableOpacity
                            onPress={() => {
                                const qty = cartItems[item._id] || 0; // current quantity in cart
                                const unitPrice = item.mainPrice ?? item.price ?? 0;
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
                            <LinearGradient colors={['white', 'white']} style={styles.card}>
                                <TouchableOpacity
                                    style={styles.favoriteIcon}
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
                                    style={[styles.cardImage, isOutOfStock && { opacity: 0.5 }]}
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

                                <Text style={styles.cardTitle} numberOfLines={2} ellipsizeMode="tail">
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
                                                <Text
                                                    style={{
                                                        fontSize: 13,
                                                        color: 'gray',
                                                        textDecorationLine: 'line-through',
                                                    }}
                                                >
                                                    ₹ {Math.round(item.finalPrice || item.price)}
                                                </Text>

                                            </View>
                                        ) : (
                                            <Text style={styles.cardPrice}>₹ {item.finalPrice || item.price}</Text>
                                        )}
                                    </View>


                                </View>

                                {cartItems[item._id] > 0 ? (
                                    <View style={styles.qtyContainer}>
                                        <Pressable
                                            style={styles.qtyBtn}
                                            onPress={() => updateCartQuantity(item, cartItems[item._id] - 1)}
                                            disabled={updatingItem === item._id}
                                            activeOpacity={0.3}

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

                ListEmptyComponent={
                    loading ? (
                        <View style={styles.emptyContainer}>
                            <ActivityIndicator size="large" color="#DB9FFF" />
                            <Text style={{ marginTop: 10, color: '#555' }}>Loading Products...</Text>
                        </View>
                    ) : (
                        <View style={styles.emptyContainer}>
                            <Image
                                source={require('../Images/noproduct.png')}
                                style={styles.emptyImage}
                            />
                        </View>
                    )
                }

            />
            {showScrollTop && (
                <TouchableOpacity
                    onPress={() => flatListRef.current?.scrollToOffset({ offset: 0, animated: true })}
                    style={styles.scrollTopButton}
                >
                    <Icon name="arrow-up" size={26} color="white" />
                </TouchableOpacity>
            )}
            {/* </LinearGradient> */}
        </View>
    );
};


const styles = StyleSheet.create({
    container: {
        flex: 1,
        paddingTop: 40,
        backgroundColor: 'white'
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 10,
        marginTop: 20,
        justifyContent: 'space-between'
    },
    title: {
        fontSize: 18,
        fontWeight: 'bold',
    },
    scrollTopButton: {
        position: 'absolute',
        bottom: 80, // adjust if covered by bottom tab
        right: 20,
        backgroundColor: '#ff4da6',
        borderRadius: 30,
        width: 50,
        height: 50,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
        elevation: 5,
        zIndex: 999,
    },
    searchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        margin: 16,
        paddingHorizontal: 12,
        borderRadius: 12,
        backgroundColor: '#fff',
        elevation: 3,
        borderWidth: 0.8,
        borderColor: "gray",
        color: 'black',
    },
    searchInput: {
        marginLeft: 10,
        fontSize: 16,
        flex: 1,
        color: "black"
    },
    historyHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        marginBottom: 10,
    },
    historyTitle: {
        fontWeight: 'bold',
        color: '#E379F0',
    },
    clearText: {
        color: '#B14CFC',
        fontSize: 13,
    },
    historyItem: {
        flexDirection: 'row',
        alignItems: 'center',
        marginHorizontal: 16,
        marginBottom: 20,
        gap: 8,
        color: 'black',
    },
    historyText: {
        flex: 1,
        color: 'black',
    },
    productsContainer: {
        paddingHorizontal: CARD_MARGIN,
        paddingBottom: 40,
        margin: 5
    },
    card: {
        borderRadius: 16,
        margin: CARD_MARGIN,
        padding: 10,
        alignItems: "center",
        borderWidth: 1,
        borderColor: "#e97cb3ff",
        width: CARD_WIDTH,
        backgroundColor: "#fff",
        margin: 10, right: 10
    },
    cardImage: {
        width: "100%",
        height: 140,        // keep fixed height
        resizeMode: "contain",
        marginBottom: 10,
    },
    cardTitle: {
        fontWeight: "800",
        marginBottom: 6,
        color: "#ff4da6",
        textAlign: "center",
        fontSize: 14,
        height: 40,        // ✅ fixes card height for 2 lines
        lineHeight: 20,
    },
    cardBottom: {
        // flexDirection: 'row',
        // alignItems: 'flex-start',
        // justifyContent: 'space-between',
        width: '35%',
    },
    favoriteIcon: { alignSelf: 'flex-start', backgroundColor: '#fff', padding: 6, borderRadius: 10, position: 'absolute', top: 3, left: 16, zIndex: 1, },
    cardPrice: {
        fontSize: 14,
        fontWeight: 'bold',
    },
    cartIcon: {
        width: 110,
        height: 28,
        borderRadius: 14,
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 10
    },
    emptyContainer: {
        flex: 0.5,
        alignItems: 'center',
        justifyContent: 'center',
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
    emptyImage: {
        width: 300,
        height: 300,
        resizeMode: 'contain',
        marginBottom: 90,
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
        width: 300,
        height: 300,
        borderRadius: 250,
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

export default SearchScreen;


// import React, { useState, useEffect, useContext, useCallback, useRef } from 'react';
// import {
//     View,
//     Text,
//     TextInput,
//     FlatList,
//     Image,
//     StyleSheet,
//     TouchableOpacity,
//     StatusBar,
//     ActivityIndicator, Dimensions,
//     Pressable
// } from 'react-native';
// import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
// import LinearGradient from 'react-native-linear-gradient';
// import AsyncStorage from '@react-native-async-storage/async-storage';
// import { useCart } from '../context'; // ✅ import the context
// import { useRoute, useFocusEffect } from '@react-navigation/native';
// import Share from 'react-native-share';
// import Toast from 'react-native-toast-message';

// const STORAGE_KEY = '@search_history';
// const { width } = Dimensions.get("window"); // screen width
// const CARD_MARGIN = 8;
// const CARD_WIDTH = (width / 2) - (CARD_MARGIN * 3); // 2 cards per row

// const SearchScreen = ({ navigation }) => {
//     const route = useRoute();
//     const [searchText, setSearchText] = useState('');
//     const [searchHistory, setSearchHistory] = useState([]);
//     const [product, setProduct] = useState([]);
//     const [allProducts, setAllProducts] = useState([]);
//     const [loading, setLoading] = useState(false);
//     const productId = route.params?.productId ?? null;
//     const productIds = route.params?.productIds ?? []; //     const { cartCount, setCartCount } = useContext(CartContext);
//     const filters = route.params?.filters;
//     const selectedCategory = route.params?.selectedCategory;
//     const age = route.params?.selectedAge
//     const [likedItems, setLikedItems] = useState({});
//     const toggleLike = (productId) => {
//         setLikedItems((prev) => ({
//             ...prev,
//             [productId]: !prev[productId],
//         }));
//     };
//     const flatListRef = useRef(null);
//     const [showScrollTop, setShowScrollTop] = useState(false);
//     const [updatingItem, setUpdatingItem] = useState(null); // track which product is updating
//     const { addToCart, fetchCart, cartItems, cartCount, updateQuantity } = useCart();

//     console.log("cartCount=====>", cartCount)
//     const getProduct = async () => {
//         setLoading(true);
//         try {
//             const response = await fetch('https://apis.toyshack.in/App/products/all-products');
//             const data = await response.json();

//             if (Array.isArray(data)) {
//                 setAllProducts(data);
//                 applyFilters(data);
//             } else {
//                 console.warn('❗ "products" is not an array:', data);
//             }
//         } catch (error) {
//             navigation.navigate("Nointernet")
//             console.error('❌ Error fetching products:', error);
//         } finally {
//             setLoading(false);
//         }
//     };



//     const createwishlist = async (item) => {
//         try {
//             const userId = await AsyncStorage.getItem('id');
//             const username = await AsyncStorage.getItem('Name');
//             if (!userId || !username) {
//                 Toast.show({ type: 'error', text1: 'Error', text2: 'User not logged in.' });
//                 return;
//             }
//             const { _id = '', productName = '', description = '', price = 0, category = '', brand = '', unit = '', size = '', stock = '', discount = 0, material = '', color = '', age = '', igst = '', cgst = '', sgst = '', cess = '', images = [], } = item || {};
//             const wishlistData = { customerid: userId, customerName: username, productId: _id, productName, description, price: item.finalPrice || item.price, category, quantity: 1, brand, unit, size, stock, discount, material, color, age, igst, cgst, sgst, cess, images: Array.isArray(images) ? images[0] : null, };
//             const response = await fetch('https://apis.toyshack.in/App/wishlist/create-wishlist',
//                 {
//                     method: 'POST', headers: { Accept: 'application/json', 'Content-Type': 'application/json', },
//                     body: JSON.stringify(wishlistData),
//                 });
//             const contentType = response.headers.get('content-type');
//             if (contentType && contentType.includes('application/json')) {
//                 const data = await response.json();
//                 Toast.show({ type: 'success', text1: 'Success', text2: data.message || 'Product added to wishlist.' });
//             }
//             else {
//                 const errorText = await response.text(); console.warn('❌ Server did not return JSON:', errorText);
//                 Toast.show({ type: 'error', text1: 'Error', text2: 'Invalid server response.' });
//             }
//         } catch (error) {
//             console.error('❌ Exception adding to wishlist:', error);
//             Toast.show({ type: 'error', text1: 'Error', text2: 'Something went wrong. Please try again.' });
//         }
//     };



//     const applyFilters = (data) => {
//         if (!Array.isArray(data)) {
//             console.warn("❗Product data is not an array");
//             return;
//         }

//         let filtered = [...data];

//         // 🔍 Case 1: Single productId
//         if (typeof productId === 'string' && productId.trim() !== '') {
//             filtered = data.filter(item => item._id === productId);
//             setProduct(filtered);
//             return;
//         }

//         // 🔍 Case 2: Multiple productIds (from banner)
//         if (Array.isArray(productIds) && productIds.length > 0) {
//             filtered = data.filter(item => productIds.includes(item._id));
//             setProduct(filtered);
//             return;
//         }

//         // ✅ Filter by selected category
//         if (selectedCategory?.categoryName) {
//             filtered = filtered.filter(item =>
//                 item.category?.toLowerCase().trim() === selectedCategory.categoryName.toLowerCase().trim()
//             );
//         }

//         // ✅ Filter by filters.category
//         if (filters?.category) {
//             filtered = filtered.filter(item =>
//                 item.category?.toLowerCase().trim() === filters.category.toLowerCase().trim()
//             );
//         }

//         // ✅ Filter by selectedAge (param from navigation)
//         if (age) {
//             const [minAge, maxAge] = age
//                 .replace(/[^\d\-]/g, '')   // keep only digits and dash
//                 .split('-')
//                 .map(Number);

//             filtered = filtered.filter(item => {
//                 if (!item.age) return false; // skip if no age info
//                 const itemAge = parseInt(item.age);
//                 return itemAge >= minAge && itemAge <= maxAge;
//             });
//         }

//         // ✅ Filter by filters.ageGroup (range like 3-6, 7-10, etc.)
//         if (filters?.ageGroup) {
//             const [minAge, maxAge] = filters.ageGroup
//                 .replace(/[^\d\-]/g, '')
//                 .split('-')
//                 .map(Number);

//             filtered = filtered.filter(item => {
//                 if (!item.age) return true;
//                 const itemAge = parseInt(item.age);
//                 return itemAge >= minAge && itemAge <= maxAge;
//             });
//         }

//         // ✅ Price filter
//         if (filters?.priceRange) {
//             if (filters.priceRange === '< ₹500') {
//                 filtered = filtered.filter(item => item.finalPrice < 500);
//             } else if (filters.priceRange === '₹500-₹1000') {
//                 filtered = filtered.filter(item => item.finalPrice >= 500 && item.finalPrice <= 1000);
//             } else if (filters.priceRange === '> ₹1000') {
//                 filtered = filtered.filter(item => item.finalPrice > 1000);
//             }
//         }

//         // ✅ Brand filter
//         if (filters?.brand) {
//             filtered = filtered.filter(item =>
//                 item.brand?.toLowerCase().trim() === filters.brand.toLowerCase().trim()
//             );
//         }

//         // ✅ Size filter
//         if (filters?.size) {
//             filtered = filtered.filter(item => {
//                 if (!item.size) return true;
//                 return item.size?.toLowerCase().trim() === filters.size.toLowerCase().trim();
//             });
//         }

//         setProduct(filtered);
//     };


//     useFocusEffect(
//         useCallback(() => {
//             const loadHistory = async () => {
//                 const history = await AsyncStorage.getItem(STORAGE_KEY);
//                 if (history) setSearchHistory(JSON.parse(history));
//             };
//             loadHistory();
//             getProduct();
//         }, [])
//     );

//     useEffect(() => {
//         if (allProducts.length > 0) {
//             applyFilters(allProducts);
//         }
//         fetchCart(); // ✅ from CartContext
//     }, [filters, selectedCategory]);


//     const saveHistory = async (newHistory) => {
//         setSearchHistory(newHistory);
//         await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(newHistory));
//     };

//     const handleSearch = () => {
//         if (!searchText.trim()) return;
//         const newHistory = [searchText, ...searchHistory.filter(item => item !== searchText)];
//         saveHistory(newHistory);
//         // setSearchText('');
//     };

//     const handleHistoryPress = (item) => {
//         setSearchText(item);

//     };

//     const handleRemoveItem = async (item) => {
//         const filtered = searchHistory.filter(h => h !== item);
//         saveHistory(filtered);
//     };

//     const handleClearAll = async () => {
//         await AsyncStorage.removeItem(STORAGE_KEY);
//         setSearchHistory([]);
//     };

//     const filteredProducts = product.filter(p =>
//         p.productName?.toLowerCase().includes(searchText.toLowerCase()) ||
//         (Array.isArray(p.metaKeyword)
//             ? p.metaKeyword.some(keyword =>
//                 keyword.toLowerCase().includes(searchText.toLowerCase())
//             )
//             : p.metaKeyword?.toLowerCase().includes(searchText.toLowerCase())) ||
//         p.category?.toLowerCase().includes(searchText.toLowerCase()) // ✅ added category search
//     );


  

//     // update quantity for related product or cart item


//     const handleAddToCart = async (item) => {
//         try {
//             await addToCart(item, 1); // ✅ use context addToCart
//         } catch (error) {
//             console.error("Add to cart failed:", error);
//             Toast.show({ type: 'error', text1: 'Error adding to cart.' });
//         }
//     };



//     return (
//         <View style={styles.container}>
//             {/* <LinearGradient colors={['#E8F6FF', '#F7E8FF']} style={styles.container}> */}
//             <StatusBar backgroundColor="#E8F6FF" barStyle="dark-content" />

//             <View style={styles.header}>
//                 <TouchableOpacity onPress={() => navigation.goBack()}>
//                     <Icon name="menu-left" size={30} color="#333" />
//                 </TouchableOpacity>
//                 <Text style={styles.title}>Products</Text>
//                 <TouchableOpacity onPress={() => navigation.navigate("CartScreen")}>
//                     <Icon name="cart" size={30} color="navy" />
//                     {cartCount > 0 && (
//                         <View style={{
//                             position: 'absolute',
//                             top: -10,
//                             right: -6,
//                             backgroundColor: 'red',
//                             borderRadius: 10,
//                             minWidth: 14,
//                             height: 14,
//                             paddingHorizontal: 4,
//                             paddingVertical: 1,
//                             justifyContent: 'center',
//                             alignItems: 'center',
//                         }}>
//                             <Text style={{ color: 'white', fontSize: 10 }}></Text>
//                         </View>
//                     )}
//                 </TouchableOpacity>
//             </View>

//             <View style={styles.searchContainer}>
//                 <Icon name="magnify" size={22} color="#666" />
//                 <TextInput
//                     placeholder="Search"
//                     style={styles.searchInput}
//                     value={searchText}
//                     onChangeText={setSearchText}
//                     onSubmitEditing={handleSearch}
//                     placeholderTextColor="#999"
//                 />
//                 <TouchableOpacity onPress={() => navigation.navigate('FilterScreen')}>
//                     <Icon name="filter-variant" size={26} color="navy" />
//                 </TouchableOpacity>
//             </View>

//             {searchHistory.length > 0 && (
//                 <>
//                     <View style={styles.historyHeader}>
//                         <Text style={styles.historyTitle}>Search History</Text>
//                         <TouchableOpacity onPress={handleClearAll}>
//                             <Text style={styles.clearText}>Clear all</Text>
//                         </TouchableOpacity>
//                     </View>

//                     {searchHistory.map((item, index) => (
//                         <View key={index} style={styles.historyItem}>
//                             <Icon name="clock-time-four-outline" size={16} color="#555" />
//                             <TouchableOpacity style={{ flex: 1 }} onPress={() => handleHistoryPress(item)}>
//                                 <Text style={styles.historyText}>{item}</Text>
//                             </TouchableOpacity>
//                             <TouchableOpacity onPress={() => handleRemoveItem(item)}>
//                                 <Icon name="close" size={16} color="#555" />
//                             </TouchableOpacity>
//                         </View>
//                     ))}
//                 </>
//             )}
//             <FlatList
//                 ref={flatListRef}
//                 data={filteredProducts}
//                 numColumns={2}
//                 keyExtractor={item => item._id.toString()}
//                 onScroll={(event) => {
//                     const yOffset = event.nativeEvent.contentOffset.y;
//                     setShowScrollTop(yOffset > 300); // show when scrolled down 300px
//                 }}
//                 scrollEventThrottle={16}
//                 contentContainerStyle={[
//                     styles.productsContainer,
//                     { flexGrow: 1, justifyContent: filteredProducts.length === 0 ? 'center' : 'flex-start' }
//                 ]}
//                 renderItem={({ item }) => {
//                     const isOutOfStock = item.stock <= 0;

//                     return (
//                         <TouchableOpacity
//                             onPress={() => {
//                                 const qty = cartItems[item._id] || 0; // current quantity in cart
//                                 const unitPrice = item.mainPrice ?? item.price ?? 0;
//                                 const discountedPrice =
//                                     item.discount > 0
//                                         ? Math.round(unitPrice - (unitPrice * item.discount) / 100)
//                                         : unitPrice;

//                                 const amount = qty * discountedPrice; // total amount

//                                 navigation.navigate("ProductDetailScreen", {
//                                     product: item,
//                                     quantity: qty,
//                                     amount: amount,
//                                 });

//                                 console.log("➡️ Navigating with:", {
//                                     product: item.productName,
//                                     quantity: qty,
//                                     amount: amount,
//                                 });
//                             }}
//                         >
//                             <LinearGradient colors={['white', 'white']} style={styles.card}>
//                                 <TouchableOpacity
//                                     style={styles.favoriteIcon}
//                                     onPress={() => {
//                                         createwishlist(item);
//                                         toggleLike(item._id);
//                                     }}
//                                 >
//                                     <Icon
//                                         name={likedItems[item._id] ? 'heart' : 'heart-outline'}
//                                         size={26}
//                                         color={likedItems[item._id] ? '#e91e63' : '#ea1d68ff'}
//                                     />
//                                 </TouchableOpacity>

//                                 <Image
//                                     source={
//                                         item.images && item.images.length > 0
//                                             ? { uri: `https://apis.toyshack.in/storage/productimages/${item.images[0]}` }
//                                             : require('../Images/still.png')
//                                     }
//                                     style={[styles.cardImage, isOutOfStock && { opacity: 0.5 }]}
//                                 />
//                                 {item.stock > 0 && (
//                                     <View style={styles.stockBadgeRight}>
//                                         <Icon
//                                             name="package-variant"
//                                             size={16}
//                                             color={item.stock <= 3 ? "red" : "navy"}
//                                         />
//                                         <Text
//                                             style={[
//                                                 styles.stockText,
//                                                 { color: item.stock <= 3 ? "red" : "navy" }
//                                             ]}
//                                         >
//                                             {item.stock > 3 ? "In Stock" : `${item.stock} left`}
//                                         </Text>
//                                     </View>
//                                 )}
//                                 {isOutOfStock && (
//                                     <View style={styles.outOfStockOverlay}>
//                                         <Text style={styles.outOfStockText}>OUT OF STOCK</Text>
//                                     </View>
//                                 )}

//                                 <Text style={styles.cardTitle} numberOfLines={2} ellipsizeMode="tail">
//                                     {item.productName}
//                                 </Text>
//                                 <View style={{ flexDirection: 'row', alignItems: "center", }}>
//                                     <View style={styles.cardBottom}>
//                                         {item.discount > 0 ? (
//                                             <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, alignSelf: 'center' }}>
//                                                 {/* Discounted Price */}
//                                                 <Text style={{
//                                                     fontSize: 14,
//                                                     fontWeight: 'bold',
//                                                     color: 'black'
//                                                 }}>
//                                                     ₹ {Math.round((item.finalPrice || item.price) - ((item.finalPrice || item.price) * item.discount / 100))}
//                                                 </Text>


//                                                 {/* Original Price */}
//                                                 <Text
//                                                     style={{
//                                                         fontSize: 13,
//                                                         color: 'gray',
//                                                         textDecorationLine: 'line-through',
//                                                     }}
//                                                 >
//                                                     ₹ {Math.round(item.finalPrice || item.price)}
//                                                 </Text>

//                                             </View>
//                                         ) : (
//                                             <Text style={styles.cardPrice}>₹ {item.finalPrice || item.price}</Text>
//                                         )}
//                                     </View>


//                                 </View>

//                                 {cartItems[item._id] > 0 ? (
//                                     <View style={styles.qtyContainer}>
//                                         <Pressable
//                                             style={styles.qtyBtn}
//                                             onPress={() => updateQuantity(item, cartItems[item._id] - 1)}
//                                             disabled={updatingItem === item._id}
//                                         >
//                                             <Text style={styles.qtyBtnText}>-</Text>
//                                         </Pressable>

//                                         {updatingItem === item._id ? (
//                                             <ActivityIndicator size="small" color="navy" style={{ marginHorizontal: 8 }} />
//                                         ) : (
//                                             <Text style={styles.qtyValue}>{cartItems[item._id]}</Text>
//                                         )}

//                                         <Pressable
//                                             style={[
//                                                 styles.qtyBtn,
//                                                 cartItems[item._id] >= item.stock && { backgroundColor: '#ccc' }
//                                             ]}
//                                             onPress={() => updateQuantity(item, cartItems[item._id] + 1)}
//                                             disabled={updatingItem === item._id || cartItems[item._id] >= item.stock}
//                                         >
//                                             <Text style={styles.qtyBtnText}>+</Text>
//                                         </Pressable>
//                                     </View>
//                                 ) : (
//                                     <LinearGradient
//                                         colors={isOutOfStock ? ['#ccc', '#bbb'] : ['navy', 'navy']}
//                                         style={styles.cartIcon}
//                                     >
//                                         <TouchableOpacity
//                                             onPress={() => handleAddToCart(item)}
//                                             disabled={isOutOfStock || updatingItem === item._id}
//                                         >
//                                             {updatingItem === item._id ? (
//                                                 <ActivityIndicator size="small" color="#fff" />
//                                             ) : (
//                                                 <Text style={{ fontSize: 15, fontWeight: 'bold', color: 'white' }}>
//                                                     Add to cart
//                                                 </Text>
//                                             )}
//                                         </TouchableOpacity>
//                                     </LinearGradient>
//                                 )}

//                             </LinearGradient>

//                         </TouchableOpacity>

//                     );
//                 }}

//                 ListEmptyComponent={
//                     loading ? (
//                         <View style={styles.emptyContainer}>
//                             <ActivityIndicator size="large" color="#DB9FFF" />
//                             <Text style={{ marginTop: 10, color: '#555' }}>Loading Products...</Text>
//                         </View>
//                     ) : (
//                         <View style={styles.emptyContainer}>
//                             <Image
//                                 source={require('../Images/noproduct1.png')}
//                                 style={styles.emptyImage}
//                             />
//                         </View>
//                     )
//                 }

//             />
//             {showScrollTop && (
//                 <TouchableOpacity
//                     onPress={() => flatListRef.current?.scrollToOffset({ offset: 0, animated: true })}
//                     style={styles.scrollTopButton}
//                 >
//                     <Icon name="arrow-up" size={26} color="white" />
//                 </TouchableOpacity>
//             )}
//             {/* </LinearGradient> */}
//         </View>
//     );
// };
