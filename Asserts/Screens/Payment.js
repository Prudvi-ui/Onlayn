import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    SafeAreaView,
    ScrollView,
    Image,
    ActivityIndicator
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useRoute } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Toast from "react-native-toast-message";

const PaymentScreen = ({ navigation }) => {
    const [isModalVisible, setModalVisible] = useState(false);
    const [selectedAddress, setSelectedAddress] = useState(null);
    const [cartItems, setCartItems] = useState([]);
    const [subTotal, setSubtotal] = useState(0); // without coupon discount
    const [discount, setDiscount] = useState(0); // coupon discount
    const [deliveryCharge, setDeliveryCharge] = useState(60);
    const [totalAmount, setTotalAmount] = useState(0);
    const [couponApplied, setCouponApplied] = useState(null);
    const [loading, setLoading] = useState(false);

    const route = useRoute();

    const paymentMethods = [
        { id: 'cod', label: 'Cash on Delivery', icon: require('../Images/money.png') }
    ];

    // Load address from params or AsyncStorage
    useEffect(() => {
        const loadAddress = async () => {
            try {
                if (route.params?.selectedAddress) {
                    setSelectedAddress(route.params.selectedAddress);
                    await AsyncStorage.setItem('defaultAddress', JSON.stringify(route.params.selectedAddress));
                } else {
                    const storedAddress = await AsyncStorage.getItem('defaultAddress');
                    if (storedAddress) setSelectedAddress(JSON.parse(storedAddress));
                }
            } catch (error) {
                console.log('❌ Error loading address:', error.message);
            }
        };
        loadAddress();
    }, [route.params]);

    // Load cart data including coupon
    useEffect(() => {
        const loadCartData = async () => {
            try {
                const savedCart = await AsyncStorage.getItem('checkoutData');
                if (savedCart) {
                    const parsed = JSON.parse(savedCart);

                    if (Array.isArray(parsed.items)) {
                        setCartItems(parsed.items);

                        // subtotal WITHOUT coupon
                        // const sub = parsed.items.reduce((sum, item) => sum + (item.discountedPrice * item.quantity), 0);
                        setSubtotal(parsed.subtotal || 0);

                        // coupon discount
                        setDiscount(parsed.discount || 0);

                        // delivery & total
                        setDeliveryCharge(parsed.deliveryCharge || 0);
                        setTotalAmount(parsed.totalPayment || 0);

                        // applied coupon code
                        setCouponApplied(parsed.appliedCoupon?.code || null);
                    }
                }
            } catch (err) {
                console.log('❌ Error loading cart data:', err.message);
            }
        };
        loadCartData();
    }, []);

    const generateOrderId = () => 'ORD' + Math.floor(Math.random() * 1000000000);

    const handleOrder = async () => {
        try {
            setLoading(true);

            if (!selectedAddress || !selectedAddress.line1 || !selectedAddress.city || !selectedAddress.pincode) {
                Toast.show({ type: 'error', text1: '⚠️ Address Missing', text2: 'Please select a valid delivery address.' });
                setLoading(false);
                return;
            }

            if (!cartItems || cartItems.length === 0) {
                Toast.show({ type: 'error', text1: '⚠️ Cart is Empty', text2: 'No items in cart to place order.' });
                setLoading(false);
                return;
            }

            const customerId = await AsyncStorage.getItem('id');
            const customerName = await AsyncStorage.getItem('Name');
            const mobileNumber = await AsyncStorage.getItem('MobileNumber');

            const orderPayload = {
                orderId: generateOrderId(),
                customerId,
                customerName,
                mobileNumber,
                address: `${selectedAddress.line1}${selectedAddress.line2 ? ', ' + selectedAddress.line2 : ''}, ${selectedAddress.city}, ${selectedAddress.state} - ${selectedAddress.pincode}, ${selectedAddress.country}`,
                products: cartItems.map(item => ({
                    productId: item.productId || item._id,
                    quantity: Number(item.quantity),
                    discountedPrice: Number(item.discountedPrice),
                    customerId: item.customerId,
                    customerName: item.customerName,
                    productName: item.productName,
                    description: item.description,
                    margin: item.margin,
                    mainPrice: item.mainPrice,
                    category: item.category,
                    brand: item.brand,
                    unit: item.unit,
                    size: item.size,
                    stock: item.stock,
                    material: item.material,
                    color: item.color,
                    finalPrice: Number(item.discountedPrice) * Number(item.quantity), age: item.age,
                    discount: item.discount,
                    igst: item.igst || '0',
                    sgst: item.sgst || '0',
                    cgst: item.cgst || '0',
                    cess: item.cess || '0',
                    images: item.images || " ",
                })),
                subTotal, // WITHOUT coupon
                couponApplied, // coupon code
                discountedAmount: discount, // coupon discount
                deliveryCharge,
                totalAmount, // final total
            };

            const response = await fetch('https://apis.toyshack.in/App/orders/create-order', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(orderPayload)
            });

            const result = await response.json();

            if (response.ok) {
                setModalVisible(true);
                await AsyncStorage.removeItem('checkoutData');

                await fetch('https://apis.toyshack.in/App/Cart/delete-allCart', {
                    method: 'DELETE',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ customerId })
                });

                Toast.show({ type: 'success', text1: '✅ Order Placed', text2: result.message || 'Your order has been placed successfully!' });
                navigation.navigate("Ok");
            } else {
                Toast.show({ type: 'error', text1: "We're Taking a Short Break", text2: result.message || 'Something went wrong.' });
            }

        } catch (error) {
            Toast.show({ type: 'error', text1: "We're Taking a Short Break", text2: error.message });
        } finally {
            setLoading(false);
        }
    };

    return (
        <LinearGradient colors={['white', 'white']} style={styles.container}>
            <SafeAreaView style={{ flex: 1 }}>
                <ScrollView contentContainerStyle={styles.scrollContent}>
                    <View style={styles.header}>
                        <TouchableOpacity onPress={() => navigation.navigate("Main")}>
                            <Icon name="menu-left" size={34} color="#000" />
                        </TouchableOpacity>
                        <Text style={styles.headerTitle}>Payment Method</Text>
                        <Text style={styles.addCard}></Text>
                    </View>

                    {paymentMethods.map((method) => (
                        <View key={method.id} style={styles.methodCard}>
                            <View style={styles.methodLeft}>
                                <Image source={method.icon} style={styles.methodIcon} />
                                <Text style={styles.methodLabel}>{method.label}</Text>
                            </View>
                        </View>
                    ))}

                    {selectedAddress ? (
                        <>
                            <View style={styles.addressBox}>
                                <View style={styles.addressHeader}>
                                    <Text style={styles.addressLabel}>Delivery Address</Text>
                                    <Icon name="chevron-right" size={22} color="#000" />
                                </View>
                                <Text style={styles.addressLabel}>{selectedAddress.label}</Text>
                                <View style={styles.addressContent}>
                                    <Icon name="map-marker-account" size={30} color="#e84393" />
                                    <Text style={styles.addressText}>
                                        {selectedAddress.line1}
                                        {selectedAddress.line2 ? ', ' + selectedAddress.line2 : ''}
                                        {', ' + selectedAddress.city}
                                        {', ' + selectedAddress.state}
                                        {' - ' + selectedAddress.pincode}
                                        {', ' + selectedAddress.country}
                                    </Text>
                                </View>
                            </View>
                            <TouchableOpacity onPress={() => navigation.navigate("MyAddressScreen")}>
                                <Text style={styles.changeAddress}>Change Address</Text>
                            </TouchableOpacity>
                        </>
                    ) : (
                        <View style={styles.addressBox}>
                            <Text style={styles.noAddressText}>No address found</Text>
                            <TouchableOpacity
                                style={styles.addAddressButton}
                                onPress={() => navigation.navigate("MyAddressScreen")}
                            >
                                <Text style={styles.addAddressText}>+ Add Address</Text>
                            </TouchableOpacity>
                        </View>
                    )}
                </ScrollView>

                <TouchableOpacity
                    style={styles.proceedButton}
                    onPress={handleOrder}
                    disabled={loading}
                >
                    <LinearGradient
                        colors={['#ff5cb8', '#ff5cb8', '#ff5cb8']}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                        style={styles.gradientButton}
                    >
                        {loading ? <ActivityIndicator size="small" color="#fff" /> :
                            <Text style={styles.proceedText}>Place Order</Text>}
                    </LinearGradient>
                </TouchableOpacity>
            </SafeAreaView>
        </LinearGradient>
    );
};

export default PaymentScreen;

const styles = StyleSheet.create({
    container: { flex: 1 },
    scrollContent: { padding: 16 },
    header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20,marginTop:20},
    headerTitle: { fontSize: 20, fontWeight: 'bold', color: '#000' },
    methodCard: { flexDirection: 'row', alignItems: 'center', padding: 12, borderRadius: 12, backgroundColor: '#fff', marginBottom: 10, borderWidth: 0.5, borderColor: 'gray' },
    methodLeft: { flexDirection: 'row', alignItems: 'center' },
    methodIcon: { width: 60, height: 30, marginRight: 10 },
    methodLabel: { fontSize: 16, color: '#000', fontWeight: 'bold' },
    addressBox: { padding: 12, backgroundColor: '#fff', borderRadius: 12, marginVertical: 10, margin: 10 },
    addressHeader: { flexDirection: 'row', justifyContent: 'space-between' },
    addressLabel: { fontSize: 16, fontWeight: 'bold', color: '#000' },
    addressContent: { flexDirection: 'row', alignItems: 'center', marginTop: 8 },
    addressText: { marginLeft: 10, fontSize: 14, color: '#555' },
    changeAddress: { color: '#2980b9', marginTop: 10 },
    noAddressText: { color: '#888', fontSize: 16 },
    addAddressButton: { marginTop: 10, padding: 10, backgroundColor: 'navy', borderRadius: 10 },
    addAddressText: { textAlign: 'center', color: 'white', fontWeight: 'bold' },
    proceedButton: { padding: 16, marginBottom: 77 },
    gradientButton: { paddingVertical: 12, borderRadius: 30, alignItems: 'center' },
    proceedText: { color: '#fff', fontSize: 18, fontWeight: 'bold' }
});
