import React, { useState, useEffect, useContext, useMemo, useCallback } from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  TextInput,
  SafeAreaView,
  Alert,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { CartContext } from '../context';
import Toast from 'react-native-toast-message';

const CartScreen = () => {
  const navigation = useNavigation();
  const { cartCount, setCartCount } = useContext(CartContext);

  const [cartItems, setCartItems] = useState([]);
  const [areaCode, setAreaCode] = useState('');
  const [deliveryCharge, setDeliveryCharge] = useState(0);
  const [isPincodeValid, setIsPincodeValid] = useState(true);
  const [deliveryData, setDeliveryData] = useState([]);
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState(null);

  // For coupon input and selection
  const [couponInput, setCouponInput] = useState('');
  const [selectedCoupon, setSelectedCoupon] = useState(null);
  const [showCouponDropdown, setShowCouponDropdown] = useState(false);

  // Fetch delivery charges
  const getDeliveryCharges = async () => {
    try {
      const response = await fetch('https://apis.toyshack.in/App/deliverypincode/all-delivery-pincodes');
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

  // Fetch coupons
  const getCoupons = async () => {
    try {
      // ✅ Retrieve logged-in customerId
      const customerId = await AsyncStorage.getItem("id");

      // ✅ Build the URL with customerId (if available)
      const url = customerId
        ? `https://apis.toyshack.in/App/coupons/getcoupons?customerId=${customerId}`
        : `https://apis.toyshack.in/App/coupons/getcoupons`;

      console.log("🔍 Fetching coupons from:", url);

      // ✅ Fetch from server
      const response = await fetch(url);
      const data = await response.json();

      // ✅ Handle response safely
      if (data && Array.isArray(data.coupons)) {
        setCoupons(data.coupons);
        console.log("✅ Coupons fetched:", data.coupons.length);
      } else {
        console.warn("❗ Invalid coupon data format:", data);
        setCoupons([]);
      }
    } catch (error) {
      console.error("❌ Error fetching coupons:", error);
    }
  };


  // Fetch stored postal code
  const fetchAreaCode = async () => {
    const storedCode = await AsyncStorage.getItem('postalcode');
    if (storedCode) {
      setAreaCode(storedCode);
    }
  };

  // Validate area code
  const validateAreaCode = (code) => {
    const found = deliveryData.find(item => item.pincode.toString() === code.toString());
    if (found) {
      setDeliveryCharge(parseInt(found.deliveryPrice, 10));
      setIsPincodeValid(true);
    } else {
      setDeliveryCharge(0);
      setIsPincodeValid(false);
    }
  };

  // Fetch cart items
  // const fetchCartItems = async () => {
  //   const customerId = await AsyncStorage.getItem('id');
  //   try {
  //     const response = await fetch('https://apis.toyshack.in/App/Cart/Cart-data', {
  //       method: 'POST',
  //       headers: { 'Content-Type': 'application/json' },
  //       body: JSON.stringify({ customerId }), // ✅ send customerId
  //     });

  //     if (response.ok && response.headers.get('content-type')?.includes('application/json')) {
  //       const data = await response.json();
  //       console.log("data===>", data);

  //       // ✅ Safely filter by customerId
  //       const items = Array.isArray(data.response)
  //         ? data.response
  //           .filter(item => item.customerId?.toString() === customerId.toString() || item.customerId?._id?.toString() === customerId.toString())
  //           .map(item => ({
  //             ...item,
  //             quantity: Number(item.quantity),
  //             price: Number(item.discountedPrice),
  //             stock: Number(item.stock || 0),
  //           }))
  //         : [];

  //       setCartItems(items);
  //       setCartCount(items.length);
  //     } else {
  //       setCartItems([]);
  //       setCartCount(0);
  //     }
  //   } catch (error) {
  //     console.error('❌ Error fetching cart items:', error);
  //     setCartItems([]);
  //     setCartCount(0);
  //   }
  // };
  const fetchCartItems = async () => {
    const customerId = await AsyncStorage.getItem('id');
    try {
      const response = await fetch('https://apis.toyshack.in/App/Cart/Cart-data', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ customerId }),
      });

      if (response.ok && response.headers.get('content-type')?.includes('application/json')) {
        const data = await response.json();
        console.log("data===>", data);

        const items = Array.isArray(data.response)
          ? data.response
            .filter(item => item.customerId?.toString() === customerId.toString() || item.customerId?._id?.toString() === customerId.toString())
            .map(item => ({
              ...item,
              quantity: Number(item.quantity),
              price: Number(item.discountedPrice),
              stock: Number(item.stock || 0),
            }))
          : [];

        // ✅ Show recently added items first
        const sortedItems = [...items].reverse();
        setCartItems(sortedItems);
        setCartCount(sortedItems.length);
      } else {
        setCartItems([]);
        setCartCount(0);
      }
    } catch (error) {
      console.error('❌ Error fetching cart items:', error);
      setCartItems([]);
      setCartCount(0);
    }
  };

  useFocusEffect(
    useCallback(() => {
      let isActive = true;

      const loadInitial = async () => {
        setLoading(true);
        await Promise.all([fetchAreaCode(), fetchCartItems(), getDeliveryCharges(), getCoupons()]);
        if (isActive) setLoading(false);
      };

      loadInitial().catch(err => {
        console.error("❌ Error loading cart screen:", err);
        setLoading(false);
      });

      return () => { isActive = false; };
    }, [])
  );

  useEffect(() => {
    if (areaCode && deliveryData.length > 0) {
      validateAreaCode(areaCode);
    }
  }, [areaCode, deliveryData]);

  const handleAreaCodeChange = async (code) => {
    setAreaCode(code);
    validateAreaCode(code);
    try {
      await AsyncStorage.setItem('postalcode', code);
    } catch (e) {
      console.error('❌ Failed to save pincode:', e);
    }
  };

  // Remove item from cart
  // Remove item from cart
  // 👇 Helper function to safely parse JSON or fallback to text
  const parseResponse = async (response) => {
    try {
      return await response.json();
    } catch {
      try {
        return { error: await response.text() };
      } catch {
        return { error: 'Unknown response format' };
      }
    }
  };

  const handleRemove = async (cartId) => {
    const customerId = await AsyncStorage.getItem('id');
    setDeletingId(cartId);

    try {
      const response = await fetch('https://apis.toyshack.in/App/Cart/delete-Cart', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ _id: cartId, customerId }),
      });

      const result = await parseResponse(response);

      if (response.ok) {
        // 🧹 Update local cart state immediately
        const updatedCart = cartItems.filter(item => item._id !== cartId);
        setCartItems(updatedCart);

        // 🧮 Update count immediately
        const totalCount = updatedCart.reduce((acc, item) => acc + item.quantity, 0);
        setCartCount(totalCount);

        // 🧠 Update AsyncStorage for global sync
        await AsyncStorage.setItem('cart', JSON.stringify(updatedCart));
        await AsyncStorage.setItem('Count', totalCount.toString());

        // ✅ Refresh from backend (optional safety)
        fetchCartItems();

        Toast.show({
          type: 'success',
          text1: 'Removed',
          text2: result.message || 'Item removed from cart.'
        });
      } else {
        Toast.show({
          type: 'error',
          text1: 'Error',
          text2: result.error || 'Failed to remove item.'
        });
      }
    } catch (error) {
      console.error('❌ Error removing item:', error);
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Something went wrong.'
      });
    } finally {
      setDeletingId(null);
    }
  };





  // ✅ Increment with stock validation
  const handleIncrement = (id) => {
    setCartItems(prevItems =>
      prevItems.map(item => {
        if (item._id === id) {
          if (item.quantity < item.stock) {
            return { ...item, quantity: item.quantity + 1 };
          } else {
            Toast.show({
              type: 'error',   // you can use 'success' | 'error' | 'info'
              text1: 'Out of Stock',
              text2: 'You cannot add more than available stock.',
              position: 'bottom', // or 'top'
              visibilityTime: 2000,
            });
            return item;
          }
        }
        return item;
      })
    );
  };

  const handleDecrement = (id) => {
    setCartItems(prevItems =>
      prevItems.map(item =>
        item._id === id && item.quantity > 1
          ? { ...item, quantity: item.quantity - 1 }
          : item
      )
    );
  };

  // Calculate subtotal
  const subtotal = useMemo(() => {
    return cartItems.reduce((sum, item) => sum + item.discountedPrice * item.quantity, 0);
  }, [cartItems]);

  // Calculate discount based on selectedCoupon
  const discount = useMemo(() => {
    if (!selectedCoupon) return 0;
    const minPurchase = Number(selectedCoupon.minPurchase || 0);
    if (subtotal < minPurchase) return 0;

    let disc = 0;
    if (selectedCoupon.discountType === 'percentage') {
      disc = (subtotal * Number(selectedCoupon.discountValue)) / 100;
      if (selectedCoupon.maxDiscount && disc > Number(selectedCoupon.maxDiscount)) {
        disc = Number(selectedCoupon.maxDiscount);
      }
    } else if (selectedCoupon.discountType === 'fixed') {
      disc = Number(selectedCoupon.discountValue);
    }
    return disc;
  }, [selectedCoupon, subtotal]);

  const total = useMemo(() => {
    return subtotal - discount;
  }, [subtotal, discount]);

  const handleCheckout = async () => {
    if (cartItems.length === 0) {
      Toast.show({
        type: 'error',
        text1: 'Cart is Empty',
        text2: 'Cannot proceed to checkout.',
        position: 'top',
        visibilityTime: 2000,
      });
      return;
    }

    if (!isPincodeValid) {
      Toast.show({
        type: 'error',
        text1: 'Invalid Pincode',
        text2: 'We do not deliver to this pincode area.',
        position: 'top',
        visibilityTime: 2000,
      });
      return;
    }

    const checkoutData = {
      items: cartItems,
      subtotal: subtotal.toFixed(2),
      discount: discount.toFixed(2),
      totalPayment: total.toFixed(2),
      appliedCoupon: selectedCoupon
        ? {
          code: selectedCoupon.couponCode,
          type: selectedCoupon.discountType,
          value: selectedCoupon.discountValue,
          minPurchase: selectedCoupon.minPurchase,
          maxDiscount: selectedCoupon.maxDiscount || null,
          appliedDiscount: discount.toFixed(2),
        }
        : null,
      // ✅ Additional params
      time: new Date().toISOString(), // current time
      place: areaCode,                // or any location string
      sent: false,                    // example default value
      totalAmount: total.toFixed(2),  // total amount same as totalPayment
    };

    console.log("checkoutData===>", checkoutData);

    try {
      await AsyncStorage.setItem('checkoutData', JSON.stringify(checkoutData));
      navigation.navigate('PaymentScreen', { checkoutData });
    } catch (error) {
      console.error('❌ Error saving checkout data:', error);
    }
  };

  const selectCoupon = (coupon) => {
    const minPurchase = Number(coupon.minPurchase || 0);

    if (subtotal >= minPurchase) {
      setSelectedCoupon(coupon);
      setCouponInput(coupon.couponCode);
      setShowCouponDropdown(false);

      Toast.show({
        type: 'success',
        text1: 'Coupon Applied 🎉',
        text2: `${coupon.couponCode} applied successfully!`,
        position: 'top',
        visibilityTime: 2000,
      });
    } else {
      const remaining = (minPurchase - subtotal).toFixed(2);
      Toast.show({
        type: 'error',
        text1: 'Coupon not applicable',
        text2: `Add ₹${remaining}/- worth items more to use coupon ${coupon.couponCode}`,
        position: 'top',
        visibilityTime: 2500,
      });

      setSelectedCoupon(null);
      setCouponInput('');
      setShowCouponDropdown(false);
    }
  };

  // Filter coupons based on input text
  const filteredCoupons = useMemo(() => {
    const inputLower = couponInput.toLowerCase();
    return coupons.filter(c =>
      c.couponCode.toLowerCase().includes(inputLower)
    );
  }, [couponInput, coupons]);

  const toggleCouponDropdown = () => {
    setShowCouponDropdown(!showCouponDropdown);
  };

  const clearCoupon = () => {
    setSelectedCoupon(null);
    setCouponInput('');
  };

  const SummaryRow = ({ label, value, bold }) => (
    <View style={styles.summaryRow}>
      <Text style={[styles.summaryLabel, bold && { fontWeight: 'bold' }]}>{label}</Text>
      <Text style={[styles.summaryValue, bold && { fontWeight: 'bold' }]}>{value}</Text>
    </View>
  );

  if (loading) {
    return (
      <SafeAreaView style={{ justifyContent: "center", marginTop: 300 }}>
        <ActivityIndicator size="large" color="navy" style={{ marginTop: 40 }} />
        <Text style={{ textAlign: 'center', marginTop: 10 }}>Loading cart...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Icon name="menu-left" size={36} color="#333" />
        </TouchableOpacity>
        <Text style={styles.title}>Cart</Text>
      </View>

      {cartItems.length === 0 ? (
        <View style={styles.emptyCartContainer}>
          <Image
            source={require('../Images/emptycart.png')}
            style={styles.emptyCartImage}
            resizeMode="contain"
          />
          <Text style={styles.emptyCartTitle}>Your cart is empty</Text>
          <Text style={styles.emptyCartSubtitle}>
            Looks like you haven't added anything yet.
          </Text>
          <TouchableOpacity onPress={() => navigation.navigate("Products")}>
            <LinearGradient
              colors={['#ff0080', '#ff66b2']} // Left-to-right pink gradient
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.shopNowButton}
            >
              <Text style={styles.shopNowText}>Shop Now</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={cartItems}
          keyExtractor={(item) => item._id.toString()}
          keyboardShouldPersistTaps="handled"
          renderItem={({ item }) => (
            <LinearGradient colors={['white', 'white']} style={styles.cartItem}>
              <Image
                source={{
                  uri: `https://apis.toyshack.in/storage/productimages/${Array.isArray(item.images) ? item.images[0] : item.images
                    }`,
                }}
                resizeMode="contain"
                style={styles.cartImage}
              />
              <View style={styles.cartInfo}>
                <View style={styles.cartHeader}>
                  <View style={{ flexDirection: "column", flex: 1 }}>
                    <Text style={styles.cartTitle}>
                      {item.productName.length > 19
                        ? item.productName.substring(0, 22)
                        : item.productName}
                    </Text>
                    {item.productName.length > 15 && (
                      <Text style={styles.cartTitle}>
                        {item.productName.substring(15, 30)}
                      </Text>
                    )}
                  </View>
                  <TouchableOpacity onPress={() => handleRemove(item._id)} disabled={deletingId === item._id}>
                    {deletingId === item._id ? (
                      <ActivityIndicator size="small" color="navy" />
                    ) : (
                      <Icon name="delete-empty" size={22} color="#ff3b3b" />
                    )}
                  </TouchableOpacity>
                </View>

                <Text style={styles.cartSize}>Size: {item.size}</Text>
                {/* <Text style={{ fontSize: 13, fontWeight: 'bold', color: "#555" }}>In Stock: {item.stock}</Text> */}
                <View style={{ flexDirection: 'row', gap: 10 }}>
                  <Text style={styles.cartPrice}>₹ {Math.round(item.discountedPrice * item.quantity)}</Text>
                  <Text style={{
                    fontSize: 18,
                    color: 'gray',
                    textDecorationLine: 'line-through'
                  }}>₹ {Math.round(item.mainPrice)}</Text>
                </View>
                <View style={styles.cartBottom}>
                  <View style={styles.quantityContainer}>
                    <TouchableOpacity onPress={() => handleDecrement(item._id)}>
                      <Icon name="minus-circle-outline" size={30} />
                    </TouchableOpacity>
                    <Text style={styles.quantityText}>{item.quantity}</Text>
                    <TouchableOpacity
                      onPress={() => handleIncrement(item._id)}
                      disabled={item.quantity >= item.stock} // ✅ disable button if stock reached
                    >
                      <Icon
                        name="plus-circle-outline"
                        size={30}
                        color={item.quantity >= item.stock ? "#ccc" : "#000"}
                      />
                    </TouchableOpacity>
                  </View>

                </View>
              </View>
            </LinearGradient>
          )}
          ListFooterComponent={
            <>
              <Text style={{ fontSize: 15, fontWeight: 'bold', color: 'navy', marginTop: 15 }}>
                Apply Coupon
              </Text>
              <View style={styles.voucherInputContainer}>
                <Icon name="ticket-percent-outline" size={26} color="navy" />
                <TextInput
                  placeholder="Add Coupon"
                  placeholderTextColor={"black"}
                  style={styles.voucherInput}
                  value={couponInput}
                  editable={false}
                  onChangeText={(text) => {
                    setCouponInput(text);
                    setSelectedCoupon(null);
                    setShowCouponDropdown(true);
                  }}
                />
                <TouchableOpacity onPress={toggleCouponDropdown}>
                  <Icon name={showCouponDropdown ? "chevron-up" : "chevron-down"} size={25} color="#555" />
                </TouchableOpacity>
                {selectedCoupon && (
                  <TouchableOpacity onPress={clearCoupon} style={{ marginLeft: 8 }}>
                    <Icon name="close-circle" size={22} color="red" />
                  </TouchableOpacity>
                )}
              </View>

              {showCouponDropdown && (
                <View style={styles.couponDropdown}>
                  <ScrollView style={{ maxHeight: 150 }}>
                    {filteredCoupons.length === 0 ? (
                      <Text style={styles.noCouponText}>No coupons available right now. Check back soon!</Text>
                    ) : (
                      filteredCoupons.map(coupon => (
                        <TouchableOpacity
                          key={coupon._id}
                          style={styles.couponItem}
                          onPress={() => selectCoupon(coupon)}
                        >
                          <Text style={styles.couponText}>{coupon.couponCode} - </Text>
                          <Text style={styles.couponText}>
                            {coupon.discountType === 'percentage'
                              ? `${coupon.discountValue}% off`
                              : `₹${coupon.discountValue} off`}   | </Text>
                          <Text style={styles.couponText}>{`Valid on orders above ₹${coupon.minPurchase}`}</Text>
                        </TouchableOpacity>
                      ))
                    )}
                  </ScrollView>
                </View>
              )}

              <Text style={{ fontSize: 15, fontWeight: 'bold', color: 'navy', marginTop: 15 }}>
                Add your Pincode
              </Text>

              <View style={styles.voucherInputContainer}>
                <Icon name="map-marker-radius-outline" size={26} color="navy" />
                <TextInput
                  placeholder="Enter Area Code"
                  value={areaCode}
                  onChangeText={handleAreaCodeChange}
                  style={styles.voucherInput}
                  keyboardType="numeric"
                />
              </View>

              {!isPincodeValid && areaCode.length > 0 && (
                <Text style={styles.errorText}>
                  We do not deliver to this pincode area
                </Text>
              )}

              <View style={styles.summary}>
                <SummaryRow label="Items" value={`${cartItems.length}`} />
                <SummaryRow label="Subtotal" value={`₹ ${subtotal.toFixed(2)}`} />
                <SummaryRow label="Discount" value={`-₹ ${discount.toFixed(2)}`} />
                <SummaryRow label="Shipping" value={`Free`} />
                <SummaryRow label="Total Payment" value={`₹ ${total.toFixed(2)}`} bold />
              </View>

              <TouchableOpacity onPress={handleCheckout}>
                <LinearGradient colors={['#ff5cb8', '#ff5cb8']} style={styles.checkoutButton}>
                  <Text style={styles.checkoutText}>Checkout</Text>
                </LinearGradient>
              </TouchableOpacity>
            </>
          }
        />
      )}
    </SafeAreaView>
  );
};


export default CartScreen;
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 16,
  },
  heading: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 12,
  },
  cartItem: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 12,
    marginBottom: 12,
    alignItems: 'center',
    elevation: 3,
    shadowColor: '#000',
    shadowOpacity: 1.1,
    shadowOffset: { width: 5, height: 2 },
  },
  cartImage: {
    width: 120,
    height: 110,
    borderRadius: 30,
  },
  cartInfo: {
    flex: 1,
    marginLeft: 12,
    margin: 5
  },
  cartHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  cartTitle: {
    fontWeight: 'bold',
    fontSize: 17,
  },
  cartSize: {
    color: '#555',
    fontSize: 16,
    marginTop: 4,
    fontWeight: 'bold'
  },
  cartBottom: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
  },
  quantityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  quantityText: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  cartPrice: {
    color: 'black',
    fontWeight: 'bold',
    fontSize: 18,
  },
  voucherInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ccc',
    paddingHorizontal: 12,
    borderRadius: 30,
    height: 44,
    marginHorizontal: 15,
    backgroundColor: '#fafafa',
    marginTop: 15,
    marginBottom: 20,
    color: 'black'
  },
  voucherInput: {
    flex: 1,
    paddingLeft: 10,
    fontSize: 16,
    color: 'black'
  },
  emptyCartContainer: {
    flex: 0.7,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
    backgroundColor: '#fff',
  },
  emptyCartImage: {
    width: 150,
    height: 150,
    marginBottom: 20,
  },
  emptyCartTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#111',
    marginBottom: 10,
    textAlign: 'center',
  },
  emptyCartSubtitle: {
    fontSize: 16,
    color: '#555',
    marginBottom: 20,
    textAlign: 'center',
  },
  shopNowButton: {
    paddingVertical: 12,
    paddingHorizontal: 40,
    borderRadius: 30,
  },
  shopNowText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  dropdown: {
    backgroundColor: '#fff',
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 6,
    maxHeight: 150,
  },
  dropdownItem: {
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderBottomColor: '#eee',
    borderBottomWidth: 1,
  },
  summary: {
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 14,
    marginBottom: 12,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  summaryLabel: {
    fontSize: 14,
    color: '#444',
  },
  summaryValue: {
    fontSize: 14,
    fontWeight: '600',
  },
  checkoutButton: {
    padding: 14,
    borderRadius: 30,
    alignItems: 'center',
    marginBottom: 100,
  },
  checkoutText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 16,
  },
  bottomNav: {
    position: 'absolute',
    bottom: 0,
    height: 60,
    backgroundColor: '#fdf0fb',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  cartBadge: {
    backgroundColor: '#f77dd2',
    padding: 10,
    borderRadius: 30,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    marginTop: 20,
  },
  title: {
    alignItems: 'center',
    fontSize: 18,
    fontWeight: 'bold',
  },
  errorText: {
    color: 'red',
    fontSize: 14,
    marginBottom: 8,
    marginLeft: 12,
  },

  couponDropdown: {
    backgroundColor: 'navy',
    borderRadius: 10,
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderWidth: 1,
    borderColor: '#ddd',
    marginTop: 10,
    elevation: 3, // for Android shadow
    shadowColor: '#000', // iOS shadow
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  couponItem: {
    paddingVertical: 10,
    paddingHorizontal: 8,
    // borderBottomWidth: 1,
    borderBottomColor: '#eee',
    flexDirection: 'row',
    // justifyContent: 'space-between',
    alignItems: 'center',
  },
  couponText: {
    fontSize: 12,
    fontWeight: '600',
    color: 'white',
  },
  couponDesc: {
    fontSize: 13,
    color: 'white',
  },
  noCouponText: {
    textAlign: 'center',
    paddingVertical: 15,
    fontSize: 14,
    color: 'white',
  },
});


// import React, { useState, useEffect, useContext, useMemo, useCallback } from 'react';
// import {
//   View,
//   Text,
//   Image,
//   TouchableOpacity,
//   StyleSheet,
//   FlatList,
//   TextInput,
//   SafeAreaView,
//   ActivityIndicator,
//   ScrollView,
// } from 'react-native';
// import LinearGradient from 'react-native-linear-gradient';
// import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
// import AsyncStorage from '@react-native-async-storage/async-storage';
// import { useNavigation, useFocusEffect } from '@react-navigation/native';
// import { CartContext } from '../context';
// import Toast from 'react-native-toast-message';

// const CartScreen = () => {
//   const navigation = useNavigation();
//   const {
//     cartItems,
//     cartCount,
//     addToCart,
//     updateCartQuantity,
//     removeFromCart,
//     fetchCartItems,
//     updatingItem,
//   } = useContext(CartContext);

//   const [areaCode, setAreaCode] = useState('');
//   const [deliveryCharge, setDeliveryCharge] = useState(0);
//   const [isPincodeValid, setIsPincodeValid] = useState(true);
//   const [deliveryData, setDeliveryData] = useState([]);
//   const [coupons, setCoupons] = useState([]);
//   const [loading, setLoading] = useState(true);

//   const [couponInput, setCouponInput] = useState('');
//   const [selectedCoupon, setSelectedCoupon] = useState(null);
//   const [showCouponDropdown, setShowCouponDropdown] = useState(false);

//   // Fetch delivery charges
//   const getDeliveryCharges = async () => {
//     try {
//       const response = await fetch('https://apis.toyshack.in/App/deliverypincode/all-delivery-pincodes');
//       const data = await response.json();
//       if (Array.isArray(data)) setDeliveryData(data);
//     } catch (error) {
//       console.error('❌ Error fetching deliverycharges:', error);
//     }
//   };

//   // Fetch coupons
//   const getCoupons = async () => {
//     try {
//       const response = await fetch('https://apis.toyshack.in/App/coupons/coupons');
//       const data = await response.json();
//       if (data && Array.isArray(data.coupons)) setCoupons(data.coupons);
//     } catch (error) {
//       console.error('❌ Error fetching coupons:', error);
//     }
//   };

//   // Fetch stored postal code
//   const fetchAreaCode = async () => {
//     const storedCode = await AsyncStorage.getItem('postalcode');
//     if (storedCode) setAreaCode(storedCode);
//   };

//   // Validate area code
//   const validateAreaCode = (code) => {
//     const found = deliveryData.find(item => item.pincode.toString() === code.toString());
//     if (found) {
//       setDeliveryCharge(parseInt(found.deliveryPrice, 10));
//       setIsPincodeValid(true);
//     } else {
//       setDeliveryCharge(0);
//       setIsPincodeValid(false);
//     }
//   };

//   useFocusEffect(
//     useCallback(() => {
//       let isActive = true;

//       const loadInitial = async () => {
//         setLoading(true);
//         await Promise.all([fetchAreaCode(), fetchCartItems(), getDeliveryCharges(), getCoupons()]);
//         if (isActive) setLoading(false);
//       };

//       loadInitial().catch(err => {
//         console.error("❌ Error loading cart screen:", err);
//         setLoading(false);
//       });

//       return () => { isActive = false; };
//     }, [])
//   );

//   useEffect(() => {
//     if (areaCode && deliveryData.length > 0) validateAreaCode(areaCode);
//   }, [areaCode, deliveryData]);

//   const handleAreaCodeChange = async (code) => {
//     setAreaCode(code);
//     validateAreaCode(code);
//     try {
//       await AsyncStorage.setItem('postalcode', code);
//     } catch (e) {
//       console.error('❌ Failed to save pincode:', e);
//     }
//   };

//   // Increment/decrement quantity using context
//   const handleIncrement = (product) => {
//     if (product.quantity < product.stock) {
//       updateCartQuantity(product, product.quantity + 1);
//     } else {
//       Toast.show({
//         type: 'error',
//         text1: 'Out of Stock',
//         text2: 'You cannot add more than available stock.',
//         position: 'bottom',
//         visibilityTime: 2000,
//       });
//     }
//   };

//   const handleDecrement = (product) => {
//     if (product.quantity > 1) updateCartQuantity(product, product.quantity - 1);
//   };

//   // Calculate subtotal
//   const subtotal = useMemo(() => {
//     return Array.isArray(cartItems)
//       ? cartItems.reduce((sum, item) => sum + (item.discountedPrice || item.price) * item.quantity, 0)
//       : 0;
//   }, [cartItems]);

//   // Calculate discount
//   const discount = useMemo(() => {
//     if (!selectedCoupon) return 0;
//     const minPurchase = Number(selectedCoupon.minPurchase || 0);
//     if (subtotal < minPurchase) return 0;

//     let disc = 0;
//     if (selectedCoupon.discountType === 'percentage') {
//       disc = (subtotal * Number(selectedCoupon.discountValue)) / 100;
//       if (selectedCoupon.maxDiscount && disc > Number(selectedCoupon.maxDiscount)) {
//         disc = Number(selectedCoupon.maxDiscount);
//       }
//     } else if (selectedCoupon.discountType === 'fixed') {
//       disc = Number(selectedCoupon.discountValue);
//     }
//     return disc;
//   }, [selectedCoupon, subtotal]);

//   const total = useMemo(() => subtotal - discount, [subtotal, discount]);

//   const handleCheckout = async () => {
//     if (!Array.isArray(cartItems) || cartItems.length === 0) {
//       Toast.show({ type: 'error', text1: 'Cart is Empty', text2: 'Cannot proceed to checkout.' });
//       return;
//     }

//     if (!isPincodeValid) {
//       Toast.show({ type: 'error', text1: 'Invalid Pincode', text2: 'We do not deliver to this pincode area.' });
//       return;
//     }

//     const checkoutData = {
//       items: cartItems,
//       subtotal: subtotal.toFixed(2),
//       discount: discount.toFixed(2),
//       totalPayment: total.toFixed(2),
//       appliedCoupon: selectedCoupon
//         ? {
//             code: selectedCoupon.couponCode,
//             type: selectedCoupon.discountType,
//             value: selectedCoupon.discountValue,
//             minPurchase: selectedCoupon.minPurchase,
//             maxDiscount: selectedCoupon.maxDiscount || null,
//             appliedDiscount: discount.toFixed(2),
//           }
//         : null,
//       time: new Date().toISOString(),
//       place: areaCode,
//       sent: false,
//       totalAmount: total.toFixed(2),
//     };

//     try {
//       await AsyncStorage.setItem('checkoutData', JSON.stringify(checkoutData));
//       navigation.navigate('PaymentScreen', { checkoutData });
//     } catch (error) {
//       console.error('❌ Error saving checkout data:', error);
//     }
//   };

//   const selectCoupon = (coupon) => {
//     const minPurchase = Number(coupon.minPurchase || 0);
//     if (subtotal >= minPurchase) {
//       setSelectedCoupon(coupon);
//       setCouponInput(coupon.couponCode);
//       setShowCouponDropdown(false);
//       Toast.show({ type: 'success', text1: 'Coupon Applied 🎉', text2: `${coupon.couponCode} applied successfully!` });
//     } else {
//       const remaining = (minPurchase - subtotal).toFixed(2);
//       Toast.show({
//         type: 'error',
//         text1: 'Coupon not applicable',
//         text2: `Add ₹${remaining}/- worth items more to use coupon ${coupon.couponCode}`,
//       });
//       setSelectedCoupon(null);
//       setCouponInput('');
//       setShowCouponDropdown(false);
//     }
//   };

//   const filteredCoupons = useMemo(() => {
//     const inputLower = couponInput.toLowerCase();
//     return coupons.filter(c => c.couponCode.toLowerCase().includes(inputLower));
//   }, [couponInput, coupons]);

//   const toggleCouponDropdown = () => setShowCouponDropdown(!showCouponDropdown);
//   const clearCoupon = () => { setSelectedCoupon(null); setCouponInput(''); };

//   const SummaryRow = ({ label, value, bold }) => (
//     <View style={styles.summaryRow}>
//       <Text style={[styles.summaryLabel, bold && { fontWeight: 'bold' }]}>{label}</Text>
//       <Text style={[styles.summaryValue, bold && { fontWeight: 'bold' }]}>{value}</Text>
//     </View>
//   );

//   if (loading) {
//     return (
//       <SafeAreaView style={{ justifyContent: "center", marginTop: 300 }}>
//         <ActivityIndicator size="large" color="navy" style={{ marginTop: 40 }} />
//         <Text style={{ textAlign: 'center', marginTop: 10 }}>Loading cart...</Text>
//       </SafeAreaView>
//     );
//   }

//   return (
//     <SafeAreaView style={styles.container}>
//       <View style={styles.header}>
//         <TouchableOpacity onPress={() => navigation.goBack()}>
//           <Icon name="menu-left" size={34} color="#333" />
//         </TouchableOpacity>
//         <Text style={styles.title}>Cart</Text>
//       </View>

//       {!Array.isArray(cartItems) || cartItems.length === 0 ? (
//         <View style={styles.emptyCartContainer}>
//           <Image source={require('../Images/emptycart.png')} style={styles.emptyCartImage} resizeMode="contain" />
//           <Text style={styles.emptyCartTitle}>Your cart is empty</Text>
//           <Text style={styles.emptyCartSubtitle}>Looks like you haven't added anything yet.</Text>
//           <TouchableOpacity onPress={() => navigation.navigate("Products")}>
//             <LinearGradient colors={['#ff0080', '#ff66b2']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.shopNowButton}>
//               <Text style={styles.shopNowText}>Shop Now</Text>
//             </LinearGradient>
//           </TouchableOpacity>
//         </View>
//       ) : (
//         <FlatList
//           data={cartItems}
//           keyExtractor={(item) => item._id}
//           keyboardShouldPersistTaps="handled"
//           renderItem={({ item }) => (
//             <LinearGradient colors={['white', 'white']} style={styles.cartItem}>
//               <Image
//                 source={{ uri: `https://apis.toyshack.in/storage/productimages/${Array.isArray(item.images) ? item.images[0] : item.images}` }}
//                 resizeMode="contain"
//                 style={styles.cartImage}
//               />
//               <View style={styles.cartInfo}>
//                 <View style={styles.cartHeader}>
//                   <View style={{ flex: 1 }}>
//                     <Text style={styles.cartTitle}>{item.productName}</Text>
//                   </View>
//                   <TouchableOpacity onPress={() => removeFromCart(item._id)} disabled={updatingItem === item._id}>
//                     {updatingItem === item._id ? <ActivityIndicator size="small" color="navy" /> : <Icon name="delete-empty" size={22} color="#ff3b3b" />}
//                   </TouchableOpacity>
//                 </View>

//                 <Text style={styles.cartSize}>Size: {item.size}</Text>
//                 <View style={{ flexDirection: 'row', gap: 10 }}>
//                   <Text style={styles.cartPrice}>₹ {(item.discountedPrice * item.quantity).toFixed(2)}</Text>
//                   <Text style={{ fontSize: 18, color: 'gray', textDecorationLine: 'line-through' }}>{item.mainPrice.toFixed(2)}</Text>
//                 </View>
//                 <View style={styles.cartBottom}>
//                   <View style={styles.quantityContainer}>
//                     <TouchableOpacity onPress={() => handleDecrement(item)}><Icon name="minus-circle-outline" size={30} /></TouchableOpacity>
//                     <Text style={styles.quantityText}>{item.quantity}</Text>
//                     <TouchableOpacity onPress={() => handleIncrement(item)} disabled={item.quantity >= item.stock}>
//                       <Icon name="plus-circle-outline" size={30} color={item.quantity >= item.stock ? "#ccc" : "#000"} />
//                     </TouchableOpacity>
//                   </View>
//                 </View>
//               </View>
//             </LinearGradient>
//           )}
//           ListFooterComponent={
//             <>
//               {/* Coupon input, Pincode input, summary, checkout button */}
//               <View style={{ padding: 10 }}>
//                 <Text style={{ fontWeight: 'bold', fontSize: 16 }}>Apply Coupon</Text>
//                 <TextInput
//                   style={styles.couponInput}
//                   placeholder="Enter coupon code"
//                   value={couponInput}
//                   onChangeText={setCouponInput}
//                 />
//                 {showCouponDropdown && filteredCoupons.length > 0 && (
//                   <View style={styles.couponDropdown}>
//                     {filteredCoupons.map(coupon => (
//                       <TouchableOpacity key={coupon._id} onPress={() => selectCoupon(coupon)} style={styles.couponItem}>
//                         <Text>{coupon.couponCode} - {coupon.discountType === 'percentage' ? `${coupon.discountValue}%` : `₹${coupon.discountValue}`}</Text>
//                       </TouchableOpacity>
//                     ))}
//                   </View>
//                 )}
//                 <TouchableOpacity onPress={toggleCouponDropdown}><Text style={{ color: 'blue' }}>{showCouponDropdown ? 'Hide Coupons' : 'Show Coupons'}</Text></TouchableOpacity>

//                 <Text style={{ marginTop: 10, fontWeight: 'bold', fontSize: 16 }}>Enter Pincode</Text>
//                 <TextInput
//                   style={styles.couponInput}
//                   placeholder="Pincode"
//                   keyboardType="number-pad"
//                   value={areaCode}
//                   onChangeText={handleAreaCodeChange}
//                 />
//                 {!isPincodeValid && <Text style={{ color: 'red' }}>Delivery not available to this area</Text>}

//                 <View style={{ marginTop: 20 }}>
//                   <SummaryRow label="Subtotal" value={`₹${subtotal.toFixed(2)}`} />
//                   {discount > 0 && <SummaryRow label="Discount" value={`- ₹${discount.toFixed(2)}`} />}
//                   <SummaryRow label="Delivery Charges" value={`₹${deliveryCharge.toFixed(2)}`} />
//                   <SummaryRow label="Total" value={`₹${(total + deliveryCharge).toFixed(2)}`} bold />
//                   <TouchableOpacity onPress={handleCheckout}>
//                     <LinearGradient colors={['#ff0080', '#ff66b2']} style={styles.checkoutButton}>
//                       <Text style={styles.shopNowText}>Checkout</Text>
//                     </LinearGradient>
//                   </TouchableOpacity>
//                 </View>
//               </View>
//             </>
//           }
//         />
//       )}
//     </SafeAreaView>
//   );
// };