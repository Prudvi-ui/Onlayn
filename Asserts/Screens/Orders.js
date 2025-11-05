import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Image,
  SafeAreaView,
  ActivityIndicator,
  Alert,
  Dimensions
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Toast from 'react-native-toast-message';
const { width } = Dimensions.get('window');
const MyOrdersScreen = ({ navigation }) => {
  const [activeTab, setActiveTab] = useState('Processing');
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [Delivery, setDelivery] = useState([]);


  const getOrders = async () => {
    setLoading(true);
    try {
      const customerId = await AsyncStorage.getItem('id');
      if (!customerId || customerId === 'null') {
        setOrders([]);
        return;
      }

      const response = await fetch('https://apis.toyshack.in/App/orders/orders-data', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ customerId }),
      });

      if (!response.ok) return;

      const data = await response.json();
      if (data.success && Array.isArray(data.response)) {
        // ✅ Sort orders: recent first (assuming createdAt exists)
        const sortedOrders = [...data.response].sort(
          (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
        );

        setOrders(sortedOrders);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const status = async (orderId) => {
    const customerId = await AsyncStorage.getItem('id');
    setLoading(true);
    try {
      const response = await fetch('https://apis.toyshack.in/App/orders/status-update', {
        method: 'PUT',
        headers: { Accept: 'application/json', 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerId,
          orderId,
          orderStatus: 'Cancelled',
        }),
      });
      const data = await response.json();
      if (data.message === 'Order status updated successfully') {
        Toast.show({
          type: 'success',
          text1: 'Success',
          text2: 'Order canceled successfully!',
          position: 'bottom',
          visibilityTime: 2000,
        });
        getOrders();
      } else {
        Toast.show({
          type: 'error',
          text1: 'Error',
          text2: data?.message || 'Update failed',
          position: 'bottom',
          visibilityTime: 2000,
        });
      }
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: error.message || 'Something went wrong',
        position: 'bottom',
        visibilityTime: 2000,
      });
    } finally {
      setLoading(false);
    }
  };

  const getDeliveryData = async (orderId) => {
    if (!orderId) return;
    try {
      const customerId = await AsyncStorage.getItem('id');
      if (!customerId) return;

      const response = await fetch(`https://apis.toyshack.in/App/delivery/${customerId}/${orderId}`);
      const data = await response.json();

      setDelivery(prev => ({
        ...prev,
        [orderId]: data.success && data.data?.length ? data.data[0] : null
      }));
    } catch (error) {
      console.error(error);
      setDelivery(prev => ({ ...prev, [orderId]: null }));
    }
  };

  useEffect(() => {
    getOrders();
  }, []);

  const renderTab = (label) => (
    <TouchableOpacity
      onPress={() => setActiveTab(label)}
      style={[styles.tab, activeTab === label && styles.activeTab]}
    >
      {activeTab === label ? (
        <LinearGradient colors={['#ff4fd8', '#ff4fd8']} style={styles.gradientTab}>
          <Text style={styles.activeTabText}>{label}</Text>
        </LinearGradient>
      ) : (
        <Text style={styles.tabText}>{label}</Text>
      )}
    </TouchableOpacity>
  );

  const filteredOrders = orders.filter((item) => {
    if (activeTab === 'Processing') return item.orderStatus === 'Processing';
    if (activeTab === 'Delivered') return item.orderStatus === 'Delivered';
    if (activeTab === 'Cancelled') return item.orderStatus === 'Cancelled';
    return false;
  });

  const handleCancelOrder = (orderId) => {
    Alert.alert(
      'Cancel Order',
      'Are you sure you want to cancel this order?',
      [
        { text: 'No', style: 'cancel' },
        { text: 'Yes', onPress: () => status(orderId) },
      ]
    );
  };

  const renderItem = ({ item }) => {
    const shouldShowDetails = activeTab === 'Processing' || activeTab === 'Delivered';
    const deliveryData = Delivery[item._id];

    return (
      <View style={styles.card}>
        {/* Header */}
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', margin: 10 }}>
          <Text style={styles.orderId}>Order ID: {item.orderId}</Text>

          {item.orderStatus === 'Delivered' && (
            <TouchableOpacity onPress={() => navigation.navigate("Invoice", { orderData: item })}>
              <Text style={{ fontSize: 15, fontWeight: '900', color: "blue" }}>Invoice</Text>
            </TouchableOpacity>
          )}

          <Text
            style={[
              styles.statusText,
              item.orderStatus === 'Processing' && { color: 'orange' },
              item.orderStatus === 'Cancelled' && { color: 'red' },
              item.orderStatus === 'Delivered' && { color: 'green' },
            ]}
          >
            {item.orderStatus}
          </Text>
        </View>

        <View style={styles.card}>
          {/* Products */}
          {item.products.map((product, index) => (
            <TouchableOpacity
              key={index}
              style={styles.row}
              onPress={() => {
                navigation.navigate("ProductDetailScreen", {
                  product: {
                    ...product,
                    mainPrice: product.mainPrice,
                  },
                  orderId: item.orderId,
                });
              }}
            >
              <Image
                source={{
                  uri: `https://apis.toyshack.in/storage/productimages/${Array.isArray(product.images) ? product.images[0] : product.images
                    }`,
                }}
                style={styles.productImage}
              />

              <View style={{ flex: 1 }}>
                <Text style={styles.productTitle}>{product.productName || product.name}</Text>
                <Text style={styles.detailText}>
                  <Text style={styles.label}>Size:</Text> {product.size || 'N/A'}
                </Text>
                <Text style={styles.detailText}>
                  <Text style={styles.label}>Quantity:</Text> {product.quantity || 1}
                </Text>

                <Text style={[styles.detailText, styles.priceText]}>
                  <Text style={styles.label}>Price:</Text> ₹{Math.round(Number(product.discountedPrice || 0))}
                </Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {/* Subtotal */}
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 10 }}>
          <Text style={{ fontSize: 13, fontWeight: 'bold', color: "black" }}>SubTotal:</Text>
          <Text style={styles.detailText}>₹ {Math.round(Number(item.subTotal || 0))}</Text>
        </View>

        {/* Coupon Discount */}
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 5 }}>
          <Text style={{ fontSize: 13, fontWeight: 'bold', color: "black" }}>
            Coupon Discount {item.couponApplied ? `(${item.couponApplied})` : ""}
          </Text>
          <Text style={styles.detailText}>₹ {Math.round(Number(item.discountedAmount || 0))}</Text>
        </View>

        {/* Total Amount */}
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', borderTopWidth: 1 }}>
          <Text style={{ fontSize: 13, fontWeight: 'bold' }}>Total Amount:</Text>
          <Text style={styles.detailText}>₹ {Math.round(Number(item.totalAmount || 0))}</Text>
        </View>

        {/* Delivery Details Toggle */}
        {shouldShowDetails && (
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', margin: 5, alignItems: 'center' }}>
            <TouchableOpacity
              onPress={async () => {
                if (showDetails !== item._id) {
                  await getDeliveryData(item._id);
                  setShowDetails(item._id);
                } else setShowDetails(null);
              }}
            >
              <Text style={styles.deliveryToggleText}>
                {showDetails === item._id ? "Hide" : "Show"} Delivery Details
              </Text>
            </TouchableOpacity>

            <Text style={{ color: 'green', top: 5, fontWeight: '700' }}>
              <Text style={{ color: 'green', fontWeight: 'bold' }}>Shipping:</Text> Free
            </Text>
          </View>
        )}

        {/* Delivery Details */}
        {shouldShowDetails && showDetails === item._id && (
          <View style={{ marginTop: 10 }}>
            {deliveryData ? (
              <>
                <Text style={styles.deliveryText}>
                  <Text style={styles.label}>Customer Name: </Text>{item.customerName}
                </Text>

                <View style={styles.addressRow}>
                  <Icon name="map-marker" size={16} color="#ff4fd8" />
                  <Text style={styles.addressText}>{deliveryData.address || "Pending"}</Text>
                </View>

                <Text style={{ alignSelf: 'center', fontSize: 14, color: 'black', fontWeight: 'bold', marginVertical: 5 }}>
                  Delivery Person Details
                </Text>

                <Text style={styles.deliveryText}>
                  <Text style={styles.label}>Delivery Person: </Text>{deliveryData.deliveryAgent || "Pending"}
                </Text>
                <Text style={styles.deliveryText}>
                  <Text style={styles.label}>Delivery Person Number: </Text>{deliveryData.mobileNumber || "Pending"}
                </Text>
                <Text style={styles.deliveryText}>
                  <Text style={styles.label}>Delivery Date & Time: </Text>
                  {deliveryData.estimatedDate ? new Date(deliveryData.estimatedDate).toLocaleString() : "Pending"}
                </Text>
              </>
            ) : (
              <Text
                style={{
                  color: 'red',
                  fontSize: 14,
                  fontStyle: 'italic',
                  textAlign: 'center',
                  marginVertical: 10,
                }}
              >
                Your delivery is still being processed. We’ll update the status soon — please check back later.
              </Text>
            )}

            <View style={styles.rowBetween}>
              <Text style={styles.boldText}>Delivery Method</Text>
              <Text style={styles.boldText}>Cash on delivery</Text>
            </View>

            {item.orderStatus === 'Processing' && (
              <LinearGradient colors={['navy', 'navy']} style={styles.cancelButton}>
                <TouchableOpacity onPress={() => handleCancelOrder(item._id)}>
                  <Text style={styles.cancelButtonText}>Cancel Order</Text>
                </TouchableOpacity>
              </LinearGradient>
            )}
          </View>
        )}
      </View>
    );
  };

  return (
    <LinearGradient colors={['white', 'white']} style={styles.container}>
      <SafeAreaView style={{ flex: 1 }}>
        {/* <View style={styles.header}>
          <View style={{ flexDirection: 'row' }}>
            <TouchableOpacity onPress={() => navigation.goBack()}>
              <Icon name="menu-left" size={35} />
            </TouchableOpacity>
            <Text style={styles.headerText}>My Orders</Text>
          </View>
          <TouchableOpacity onPress={() => navigation.navigate("Main")} style={{ top: 20 }}>
            <Icon name="home" size={35} />
          </TouchableOpacity>
        </View> */}
        <View style={styles.header}>
          <View style={styles.leftContainer}>
            <TouchableOpacity onPress={() => navigation.goBack()}>
              <Icon name="menu-left" size={width * 0.08} /> {/* auto scales */}
            </TouchableOpacity>
            <Text style={styles.headerText}>My Orders</Text>
          </View>
          <TouchableOpacity onPress={() => navigation.navigate('Main')}>
            <Icon name="home" size={width * 0.08} /> {/* auto scales */}
          </TouchableOpacity>
        </View>
        <View style={styles.tabsContainer}>
          {renderTab('Processing')}
          {renderTab('Delivered')}
          {renderTab('Cancelled')}
        </View>

        {loading ? (
          <ActivityIndicator size="large" color="#9b4fff" style={{ marginTop: 20 }} />
        ) : filteredOrders.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Image
              source={require('../Images/noordershere.png')}
              style={styles.emptyImage}
              resizeMode="contain"
            />
            <Text style={styles.emptyText}>No orders in this status</Text>
          </View>
        ) : (
          <FlatList
            data={filteredOrders}
            keyExtractor={(item) => item._id}
            renderItem={renderItem}
            contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 100 }}
          />
        )}
      </SafeAreaView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  // header: {
  //   padding: 15,
  //   flexDirection: 'row',
  //   alignItems: 'center',
  //   justifyContent: 'space-between',
  // },
  // headerText: { fontSize: 18, fontWeight: 'bold', marginLeft: 10, marginTop: 5 },
  header: {
    paddingVertical: 10,
    paddingHorizontal: 15,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop:30
  },
  leftContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5, // adds spacing between icon and text
  },
  headerText: {
    fontSize: width * 0.05, // responsive text size
    fontWeight: 'bold',
  },
  tabsContainer: { flexDirection: 'row', justifyContent: 'space-around', marginVertical: 15 },
  tab: { paddingHorizontal: 15, paddingVertical: 8, borderRadius: 20 },
  activeTab: { borderWidth: 0 },
  gradientTab: { borderRadius: 20, paddingHorizontal: 15, paddingVertical: 8 },
  tabText: { fontSize: 14, fontWeight: 'bold', color: '#444', margin: 5 },
  activeTabText: { fontSize: 14, fontWeight: 'bold', color: '#fff' },
  card: { backgroundColor: '#fff', borderRadius: 15, padding: 15, marginBottom: 20, elevation: 3 },
  orderId: { fontWeight: 'bold', fontSize: 16 },
  row: { flexDirection: 'row', marginTop: 10 },
  productImage: { width: 70, height: 70, marginRight: 10, borderRadius: 8, resizeMode: 'cover' },
  productTitle: { fontWeight: 'bold', fontSize: 14 },
  detailText: { fontSize: 13, color: 'black' },
  label: { fontWeight: 'bold' },
  priceText: { color: 'black' },
  statusText: { fontWeight: 'bold', textAlign: 'right' },
  totalAmountText: { fontWeight: 'bold', textAlign: 'right', fontSize: 14 },
  emptyContainer: { justifyContent: 'center', alignItems: 'center', marginTop: 50 },
  emptyImage: { width: 180, height: 180, marginBottom: 20 },
  emptyText: { fontSize: 16, color: '#777', fontWeight: '600' },
  deliveryToggleText: { color: 'navy', textAlign: 'right', marginTop: 10, fontWeight: '600', textDecorationLine: 'underline' },
  deliveryText: { fontSize: 13, marginVertical: 4 },
  addressRow: { flexDirection: 'row', alignItems: 'flex-start', marginVertical: 4 },
  addressText: { flex: 1, marginLeft: 6, fontSize: 13, color: '#555' },
  boldText: { fontWeight: '600', fontSize: 13 },
  rowBetween: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 8 },
  cancelButton: { backgroundColor: '#ff4fd8', paddingVertical: 10, borderRadius: 20, marginTop: 12, alignItems: 'center' },
  cancelButtonText: { color: '#fff', fontWeight: '600', fontSize: 14 },
});

export default MyOrdersScreen;
