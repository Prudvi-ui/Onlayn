import React, { useState, useCallback } from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    Image,
    Dimensions,
    TouchableOpacity,
    SafeAreaView,
    StatusBar,
    ActivityIndicator,
    Pressable,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import LinearGradient from 'react-native-linear-gradient';
import { useFocusEffect } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Toast from 'react-native-toast-message';

const { width } = Dimensions.get("window");
const CARD_MARGIN = 10;
const CARD_WIDTH = (width / 2) - (CARD_MARGIN * 3);

const WishlistScreen = ({ navigation }) => {
    const [product, setProduct] = useState([]);
    const [loading, setLoading] = useState(false);
    const [cartItems, setCartItems] = useState({});
    const [cartCount, setCartCount] = useState(0);
    const [updatingItem, setUpdatingItem] = useState(null);

    // ✅ Load cart from AsyncStorage
    const loadCart = async () => {
        try {
            let storedCart = await AsyncStorage.getItem('cart');
            if (storedCart) {
                let parsed = JSON.parse(storedCart);
                let mapped = {};
                parsed.forEach(item => {
                    mapped[item.productId] = item.quantity;
                });
                setCartItems(mapped);
                const totalCount = parsed.reduce((acc, p) => acc + (Number(p.quantity) || 0), 0);
                setCartCount(totalCount);

                // ✅ Sync wishlist quantities
                setProduct(prevProducts =>
                    prevProducts.map(p => ({
                        ...p,
                        quantity: mapped[p._id] || 0,
                    }))
                );
            }
        } catch (error) {
            console.error("❌ Error loading cart:", error.message || error);
        }
    };

    // ✅ Fetch wishlist
    const getWishlist = async () => {
        setLoading(true);
        try {
            const customerid = await AsyncStorage.getItem('id');
            if (!customerid) {
                console.warn("⚠️ Customer ID is missing");
                return;
            }

            const response = await fetch('https://apis.toyshack.in/App/wishlist/wishlist-data', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ customerid }),
            });

            if (!response.ok) {
                const text = await response.text();
                console.error("❌ Server returned error:", response.status, text);
                return;
            }

            const data = await response.json();
            if (data.success && Array.isArray(data.response)) {
                // ✅ Sync wishlist with cart quantities
                setProduct(
                    data.response.map(item => ({
                        ...item,
                        quantity: cartItems[item._id] || 0,
                    }))
                );
            } else {
                console.warn("⚠️ Invalid response structure", data);
            }
        } catch (error) {
            console.error("❌ Error fetching wishlist:", error.message || error);
        } finally {
            setLoading(false);
        }
    };

    // ✅ Fetch cart items from server
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

                const mappedItems = {};
                items.forEach((p) => {
                    mappedItems[p.productId] = Number(p.quantity) || 0;
                });

                setCartItems(mappedItems);
                setCartCount(Object.keys(mappedItems).length);

                // ✅ Sync wishlist quantities with cart
                setProduct(prevProducts =>
                    prevProducts.map(p => ({
                        ...p,
                        quantity: mappedItems[p._id] || 0,
                    }))
                );
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

    // ✅ Load wishlist and cart on focus
    useFocusEffect(
        useCallback(() => {
            getWishlist();
            loadCart();
            fetchCartItems();
        }, [])
    );

    // ✅ Delete wishlist item
    const handleDelete = async (productName) => {
        try {
            const customerid = await AsyncStorage.getItem('id');
            const response = await fetch('https://apis.toyshack.in/App/wishlist/delete-wishlist', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ customerid, productName }),
            });

            const data = await response.json();
            if (data.success) {
                setProduct(prev => prev.filter(item => item.productName !== productName));
            } else {
                Toast.show({ type: 'error', text1: 'Error', text2: data.message || "Failed to delete" });
            }
        } catch (error) {
            console.error("❌ Error deleting wishlist item:", error.message || error);
        }
    };

    // ✅ Update cart quantity
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

            let storedCart = await AsyncStorage.getItem('cart');
            let cart = storedCart ? JSON.parse(storedCart) : [];

            cart = cart.filter(p => p.productId !== item._id);

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

            await AsyncStorage.setItem('cart', JSON.stringify(cart));
            setCartItems(prev => ({ ...prev, [item._id]: newQty }));

            // ✅ Update wishlist synced quantities
            setProduct(prevProducts =>
                prevProducts.map(p => ({
                    ...p,
                    quantity: p._id === item._id ? newQty : (prevProducts.quantity || 0),
                }))
            );

            const totalCount = cart.reduce((acc, p) => acc + (Number(p.quantity) || 0), 0);
            setCartCount(totalCount);
            await AsyncStorage.setItem('Count', totalCount.toString());

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

            const response = await fetch('https://apis.toyshack.in/App/Cart/create-cart', {
                method: 'POST',
                headers: {
                    Accept: 'application/json',
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(payload),
            });

            const data = await response.json();
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
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="dark-content" backgroundColor="#fdf7ff" />
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()}></TouchableOpacity>
                <Text style={styles.headerTitle}>Wishlist</Text>
                <Text style={styles.headerTitle}></Text>
            </View>

            {loading ? (
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color="navy" />
                </View>
            ) : product.length === 0 ? (
                <View style={styles.emptyCartContainer}>
                    <Image
                        source={require('../Images/emptywishlist.png')}
                        style={styles.emptyCartImage}
                        resizeMode="contain"
                    />
                    <Text style={styles.emptyCartTitle}>Your Wishlist is empty</Text>
                    <Text style={styles.emptyCartSubtitle}>
                        Looks like you haven't added anything yet.
                    </Text>
                    <TouchableOpacity onPress={() => navigation.navigate("Products")}>
                        <LinearGradient
                            colors={['#ff0080', '#ff66b2']}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 0 }}
                            style={styles.shopNowButton}
                        >
                            <Text style={styles.shopNowText}>Shop Now</Text>
                        </LinearGradient>
                    </TouchableOpacity>
                </View>
            ) : (
                <View style={{ marginBottom: 180 }}>
                    <FlatList
                        data={product}
                        keyExtractor={(item, index) => item._id?.toString() || index.toString()}
                        numColumns={2}
                        showsVerticalScrollIndicator={false}
                        renderItem={({ item }) => {
                            const stock = Number(item.stock) || 0;
                            const isOutOfStock = stock <= 0;
                            const basePrice = Math.round(
                                item.mainPrice ?? item.finalPrice ?? item.price ?? 0
                            );

                            const discountPrice =
                                item.discount > 0
                                    ? Math.round(basePrice - (basePrice * item.discount) / 100)
                                    : basePrice;
                            const qty = cartItems[item._id] || item.quantity || 0;

                            return (
                                <TouchableOpacity
                                    onPress={() =>
                                        navigation.navigate("ProductDetailScreen", { product: item })
                                    }
                                >
                                    <LinearGradient colors={['white', 'white']} style={styles.card}>
                                        <Image
                                            source={
                                                item.images && item.images.length > 0
                                                    ? { uri: `https://apis.toyshack.in/storage/productimages/${item.images[0]}` }
                                                    : require('../Images/still.png')
                                            }
                                            style={[styles.cardImage, isOutOfStock && { opacity: 0.5 }]}
                                        />
                                        {isOutOfStock && (
                                            <View style={styles.outOfStockOverlay}>
                                                <Text style={styles.outOfStockText}>OUT OF STOCK</Text>
                                            </View>
                                        )}

                                        <Text style={styles.cardTitle} numberOfLines={2}>
                                            {item.productName}
                                        </Text>

                                        <View style={styles.cardBottom}>
                                            {item.discount > 0 ? (
                                                <View style={{ flexDirection: "row", gap: 8 }}>
                                                    <Text style={{ fontSize: 14, fontWeight: "bold" }}>
                                                        ₹ {Math.round(discountPrice)}
                                                    </Text>
                                                    <Text
                                                        style={{
                                                            fontSize: 13,
                                                            color: "gray",
                                                            textDecorationLine: "line-through",
                                                        }}
                                                    >
                                                        ₹ {basePrice}
                                                    </Text>
                                                </View>
                                            ) : (
                                                <Text style={styles.cardPrice}>₹ {basePrice}</Text>
                                            )}
                                        </View>

                                        {qty > 0 ? (
                                            <View style={styles.qtyContainer}>
                                                <Pressable
                                                    style={styles.qtyBtn}
                                                    onPress={() => updateCartQuantity(item, qty - 1)}
                                                    disabled={updatingItem === item._id}
                                                >
                                                    <Text style={styles.qtyBtnText}>-</Text>
                                                </Pressable>
                                                {updatingItem === item._id ? (
                                                    <ActivityIndicator size="small" color="navy" />
                                                ) : (
                                                    <Text style={styles.qtyValue}>{qty}</Text>
                                                )}
                                                <Pressable
                                                    style={[styles.qtyBtn, qty >= stock && { backgroundColor: '#ccc' }]}
                                                    onPress={() => {
                                                        if (qty < stock) {
                                                            updateCartQuantity(item, qty + 1);
                                                        }
                                                    }}
                                                    disabled={updatingItem === item._id || qty >= stock}
                                                >
                                                    <Text style={styles.qtyBtnText}>+</Text>
                                                </Pressable>
                                            </View>
                                        ) : (
                                            <LinearGradient
                                                colors={isOutOfStock ? ['#ccc', '#bbb'] : ['navy', 'navy']}
                                                style={styles.cartIcon}
                                            >
                                                <Pressable
                                                    onPress={() => !isOutOfStock && updateCartQuantity(item, 1)}
                                                    disabled={isOutOfStock || updatingItem === item._id}
                                                >
                                                    {updatingItem === item._id ? (
                                                        <ActivityIndicator size="small" color="#fff" />
                                                    ) : (
                                                        <Text style={{ fontSize: 15, fontWeight: 'bold', color: 'white' }}>
                                                            Add to cart
                                                        </Text>
                                                    )}
                                                </Pressable>
                                            </LinearGradient>
                                        )}

                                        <TouchableOpacity
                                            onPress={() => handleDelete(item.productName)}
                                            style={styles.deleteIcon}
                                        >
                                            <Icon name="delete-empty" size={22} color="#ff3b3b" />
                                        </TouchableOpacity>
                                    </LinearGradient>
                                </TouchableOpacity>
                            );
                        }}
                    />
                </View>
            )}
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: 'white', paddingHorizontal: 16 },
    header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', margin: 30, marginTop: 38 },
    headerTitle: { fontSize: 20, fontWeight: 'bold' },
    card: {
        borderRadius: 16, margin: CARD_MARGIN, padding: 10, alignItems: "center", right: 6,
        borderWidth: 1, borderColor: "#e97cb3ff", width: CARD_WIDTH, backgroundColor: "#fff",
    },
    cardImage: { width: "100%", height: 140, resizeMode: "contain", marginBottom: 10 },
    cardTitle: { fontWeight: "800", marginBottom: 6, color: "#ff4da6", textAlign: "center", fontSize: 14, height: 40, lineHeight: 20 },
    cardBottom: { width: '100%', alignItems: "center" },
    cardPrice: { fontSize: 14, fontWeight: 'bold' },
    cartIcon: { width: 110, height: 28, borderRadius: 14, alignItems: 'center', justifyContent: 'center', marginTop: 10 },
    outOfStockOverlay: {
        position: 'absolute',
        top: 0, left: 0, right: 0, bottom: 0,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 8
    },
    outOfStockText: {
        color: '#fff',
        fontSize: 14,
        fontWeight: 'bold',
        backgroundColor: 'rgba(255,0,0,0.8)',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 4
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
        width: 110
    },
    qtyBtn: { width: 50, height: 30, justifyContent: 'center', alignItems: 'center', backgroundColor: 'navy', borderRadius: 20 },
    qtyBtnText: { color: 'white', fontSize: 18, fontWeight: 'bold' },
    qtyValue: { fontSize: 16, fontWeight: 'bold', color: 'black', marginHorizontal: 12 },
    emptyCartContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    emptyCartImage: { width: 200, height: 200, marginBottom: 20 },
    emptyCartTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 5 },
    emptyCartSubtitle: { fontSize: 14, color: '#555', marginBottom: 20 },
    shopNowButton: { paddingVertical: 10, paddingHorizontal: 20, borderRadius: 20 },
    shopNowText: { color: '#fff', fontWeight: 'bold' },
    loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    deleteIcon: {
        position: 'absolute',
        top: 6,
        right: 6,
        backgroundColor: '#fff',
        borderRadius: 20,
        padding: 2,
        zIndex: 1,
    },
});

export default WishlistScreen;

