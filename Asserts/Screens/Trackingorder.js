// import React, { useEffect, useState } from 'react';
// import {
//   View,
//   Text,
//   StyleSheet,
//   Image,
//   TouchableOpacity,
//   SafeAreaView,
//   FlatList,
//   ScrollView,
//   ActivityIndicator,
// } from 'react-native';
// import LinearGradient from 'react-native-linear-gradient';
// import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
// import AsyncStorage from '@react-native-async-storage/async-storage';

// const TrackOrderScreen = ({ navigation }) => {
//   const [orders, setOrders] = useState([]);
//   const [loading, setLoading] = useState(false);

//   const getOrders = async () => {
//     setLoading(true);
//     try {
//       const customerid = await AsyncStorage.getItem('id');
//       console.log("📦 Retrieved customerid from AsyncStorage:", customerid);

//       if (!customerid || customerid === 'null') {
//         console.warn('⚠️ Customer ID is missing or invalid');
//         setOrders([]);
//         return;
//       }

//       const response = await fetch('https://apis.toyshack.in/App/orders/orders-data', {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify({ customerid }),
//       });

//       const data = await response.json();
//       console.log('✅ API response:', data);

//       if (data.success && Array.isArray(data.response)) {
//         setOrders(data.response);
//       } else {
//         console.warn('⚠️ Unexpected API response structure', data);
//       }
//     } catch (error) {
//       console.error('❌ Error fetching orders:', error.message || error);
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     getOrders();
//   }, []);

//   const renderOrderCard = ({ item }) => {
//     return item.products.map((product, index) => (
//       <View key={product._id || index} style={styles.card}>
//         <View style={styles.row}>
//           <Image
//             source={{ uri: `https://apis.toyshack.in/storage/productimages/${product.images}` }} style={styles.productImage}
//             resizeMode="contain"
//           />
//           <View style={{ flex: 1 }}>
//             <Text style={styles.productTitle}>{product.productName}</Text>
//             <Text style={styles.detailText}>
//               <Text style={{ fontWeight: 'bold' }}>Size:</Text> {product.size}
//             </Text>
//             <Text style={styles.detailText}>
//               <Text style={{ fontWeight: 'bold' }}>Qty:</Text> {product.quantity}
//             </Text>
//           </View>
//           <Text style={styles.priceText}>₹ {product.price}</Text>
//         </View>
//       </View>
//     ));
//   };

//   return (
//     <LinearGradient colors={['#dff6fd', '#f8e3f9']} style={styles.container}>
//       <SafeAreaView style={{ flex: 1 }}>
//         <ScrollView contentContainerStyle={styles.content}>
//           {/* Header */}
//           <View style={styles.header}>
//             <TouchableOpacity onPress={() => navigation.goBack()}>
//               <Icon name="menu-left" size={34} color="#000" />
//             </TouchableOpacity>
//             <Text style={styles.headerText}>Track Order</Text>
//           </View>

//           {/* Stepper */}
//           <View style={styles.stepperContainer}>
//             {['Packing', 'Shipping', 'Arriving', 'Success'].map((step, index) => (
//               <View key={index} style={styles.step}>
//                 <View style={styles.circle} />
//                 <Text style={styles.stepLabel}>{step}</Text>
//                 {index !== 3 && <View style={styles.stepLine} />}
//               </View>
//             ))}
//           </View>

//           {/* Order Product List */}
//           {loading ? (
//             <ActivityIndicator size="large" color="#9b4fff" />
//           ) : orders.length === 0 ? (
//             <Text style={{ textAlign: 'center', marginTop: 20 }}>
//               No orders found.
//             </Text>
//           ) : (
//             orders.map((order, index) => (
//               <View key={order._id || index}>
//                 {renderOrderCard({ item: order })}

//                 {/* Address Card */}
//                 <View style={styles.card}>
//                   <View style={styles.rowBetween}>
//                     <Text style={styles.boldText}>Order – {order.orderId}</Text>
//                   </View>

//                   <Text style={[styles.boldText, { marginTop: 10 }]}>
//                     {order.customerName}
//                   </Text>

//                   <View style={styles.addressRow}>
//                     <Icon name="map-marker" size={16} color="#ff4fd8" />
//                     <Text style={styles.addressText}>{order.address}</Text>
//                   </View>

//                   <View style={[styles.rowBetween, { marginTop: 10 }]}>
//                     <Text style={styles.boldText}>Payment Method</Text>
//                     <Text style={styles.boldText}>Cash on delivery</Text>
//                   </View>
//                 </View>
//               </View>
//             ))
//           )}

//           {/* Change Address */}
//           <TouchableOpacity onPress={() => navigation.navigate("MyAddressScreen")}>
//             <Text style={styles.changeAddressText}>Change or Add Address</Text>
//           </TouchableOpacity>

//           {/* Cancel Order Button */}
//           <LinearGradient colors={['#9b4fff', '#ff4fd8']} style={styles.cancelButton}>
//             <TouchableOpacity onPress={() => navigation.navigate("MyOrdersScreen")}>
//               <Text style={styles.cancelButtonText}>Cancel Order</Text>
//             </TouchableOpacity>
//           </LinearGradient>
//         </ScrollView>
//       </SafeAreaView>
//     </LinearGradient>
//   );
// };
// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//   },
//   content: {
//     padding: 20,
//     paddingBottom: 40,
//   },
//   header: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     marginTop: 20,
//   },
//   headerText: {
//     marginLeft: 10,
//     fontSize: 18,
//     fontWeight: 'bold',
//   },
//   stepperContainer: {
//     flexDirection: 'row',
//     marginVertical: 30,
//     justifyContent: 'space-between',
//     alignItems: 'center',
//   },
//   step: {
//     alignItems: 'center',
//     flexDirection: 'row',
//   },
//   circle: {
//     width: 16,
//     height: 16,
//     backgroundColor: '#9b4fff',
//     borderRadius: 8,
//   },
//   stepLabel: {
//     marginLeft: 6,
//     marginRight: 12,
//     fontSize: 12,
//   },
//   stepLine: {
//     height: 2,
//     width: 20,
//     backgroundColor: '#9b4fff',
//   },
//   card: {
//     backgroundColor: '#fff',
//     borderRadius: 14,
//     padding: 15,
//     marginBottom: 20,
//     shadowColor: '#000',
//     shadowOpacity: 0.05,
//     shadowRadius: 5,
//     elevation: 2,
//   },
//   row: {
//     flexDirection: 'row',
//     alignItems: 'center',
//   },
//   rowBetween: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//   },
//   productImage: {
//     width: 60,
//     height: 60,
//     marginRight: 15,
//   },
//   productTitle: {
//     fontWeight: 'bold',
//     fontSize: 16,
//   },
//   detailText: {
//     fontSize: 13,
//     marginTop: 2,
//   },
//   priceText: {
//     color: '#ff4fd8',
//     fontWeight: 'bold',
//     fontSize: 16,
//   },
//   boldText: {
//     fontWeight: '600',
//     fontSize: 14,
//   },
//   addressRow: {
//     flexDirection: 'row',
//     alignItems: 'flex-start',
//     marginTop: 8,
//   },
//   addressText: {
//     marginLeft: 6,
//     fontSize: 13,
//     color: '#555',
//     flex: 1,
//   },
//   changeAddressText: {
//     textAlign: 'center',
//     color: '#ff4fd8',
//     fontWeight: '600',
//     marginBottom: 20,
//   },
//   cancelButton: {
//     borderRadius: 30,
//     paddingVertical: 14,
//     alignItems: 'center',
//     justifyContent: 'center',
//     marginHorizontal: 20,
//   },
//   cancelButtonText: {
//     color: '#fff',
//     fontWeight: '600',
//     fontSize: 16,
//   },
// });

// export default TrackOrderScreen;


import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import AsyncStorage from '@react-native-async-storage/async-storage';

const TrackOrderScreen = ({ navigation }) => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);

  const getOrders = async () => {
    setLoading(true);
    try {
      const customerid = await AsyncStorage.getItem('id');
      console.log("📦 Retrieved customerid from AsyncStorage:", customerid);

      if (!customerid || customerid === 'null') {
        console.warn('⚠️ Customer ID is missing or invalid');
        setOrders([]);
        return;
      }

      const response = await fetch('https://apis.toyshack.in/App/orders/orders-data', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ customerid }),
      });

      const data = await response.json();
      console.log('✅ API response:', data);

      if (data.success && Array.isArray(data.response)) {
        setOrders(data.response);
      } else {
        console.warn('⚠️ Unexpected API response structure', data);
      }
    } catch (error) {
      console.error('❌ Error fetching orders:', error.message || error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getOrders();
  }, []);

  return (
    <LinearGradient colors={['#dff6fd', '#f8e3f9']} style={styles.container}>
      <SafeAreaView style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.content}>
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity onPress={() => navigation.goBack()}>
              <Icon name="menu-left" size={34} color="#000" />
            </TouchableOpacity>
            <Text style={styles.headerText}>Track Order</Text>
          </View>

          {/* Stepper */}
          <View style={styles.stepperContainer}>
            {['Packing', 'Shipping', 'Arriving', 'Success'].map((step, index) => (
              <View key={index} style={styles.step}>
                <View style={styles.circle} />
                <Text style={styles.stepLabel}>{step}</Text>
                {index !== 3 && <View style={styles.stepLine} />}
              </View>
            ))}
          </View>

          {/* Order List */}
          {loading ? (
            <ActivityIndicator size="large" color="#9b4fff" />
          ) : orders.length === 0 ? (
            <Text style={{ textAlign: 'center', marginTop: 20 }}>
              No orders found.
            </Text>
          ) : (
            orders.map((order, index) => (
              <View key={order._id || index} style={styles.card}>
                {/* Order ID */}
                <View style={styles.rowBetween}>
                  <Text style={styles.boldText}>Order – {order.orderId}</Text>
                </View>

                {/* Customer Name */}
                <Text style={[styles.boldText, { marginTop: 10 }]}>
                  {order.customerName}
                </Text>

                {/* Address */}
                <View style={styles.addressRow}>
                  <Icon name="map-marker" size={16} color="#ff4fd8" />
                  <Text style={styles.addressText}>{order.address}</Text>
                </View>

                {/* Payment Info */}
                <View style={[styles.rowBetween, { marginTop: 10 }]}>
                  <Text style={styles.boldText}>Payment Method</Text>
                  <Text style={styles.boldText}>Cash on delivery</Text>
                </View>

                {/* Products List */}
                {order.products.map((product, pIndex) => (
                  <View key={product._id || pIndex} style={[styles.row, { marginTop: 15 }]}>
                    <Image
                      source={{ uri: `https://apis.toyshack.in/storage/productimages/${product.images}` }}
                      style={styles.productImage}
                      resizeMode="contain"
                    />
                    <View style={{ flex: 1 }}>
                      <Text style={styles.productTitle}>{product.productName}</Text>
                      <Text style={styles.detailText}><Text style={{ fontWeight: 'bold' }}>Size:</Text> {product.size}</Text>
                      <Text style={styles.detailText}><Text style={{ fontWeight: 'bold' }}>Qty:</Text> {product.quantity}</Text>
                    </View>
                    <Text style={styles.priceText}>₹ {product.price}</Text>
                  </View>
                ))}
              </View>
            ))
          )}

          {/* Change Address */}
          <TouchableOpacity onPress={() => navigation.navigate("MyAddressScreen")}>
            <Text style={styles.changeAddressText}>Change or Add Address</Text>
          </TouchableOpacity>

          {/* Cancel Order Button */}
          <LinearGradient colors={['#9b4fff', '#ff4fd8']} style={styles.cancelButton}>
            <TouchableOpacity onPress={() => navigation.navigate("MyOrdersScreen")}>
              <Text style={styles.cancelButtonText}>Cancel Order</Text>
            </TouchableOpacity>
          </LinearGradient>
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
    padding: 20,
    paddingBottom: 40,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 20,
  },
  headerText: {
    marginLeft: 10,
    fontSize: 18,
    fontWeight: 'bold',
  },
  stepperContainer: {
    flexDirection: 'row',
    marginVertical: 30,
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  step: {
    alignItems: 'center',
    flexDirection: 'row',
  },
  circle: {
    width: 16,
    height: 16,
    backgroundColor: '#9b4fff',
    borderRadius: 8,
  },
  stepLabel: {
    marginLeft: 6,
    marginRight: 12,
    fontSize: 12,
  },
  stepLine: {
    height: 2,
    width: 20,
    backgroundColor: '#9b4fff',
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 15,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rowBetween: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  productImage: {
    width: 60,
    height: 60,
    marginRight: 15,
  },
  productTitle: {
    fontWeight: 'bold',
    fontSize: 16,
  },
  detailText: {
    fontSize: 13,
    marginTop: 2,
  },
  priceText: {
    color: '#ff4fd8',
    fontWeight: 'bold',
    fontSize: 16,
  },
  boldText: {
    fontWeight: '600',
    fontSize: 14,
  },
  addressRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginTop: 8,
  },
  addressText: {
    marginLeft: 6,
    fontSize: 13,
    color: '#555',
    flex: 1,
  },
  changeAddressText: {
    textAlign: 'center',
    color: '#ff4fd8',
    fontWeight: '600',
    marginBottom: 20,
  },
  cancelButton: {
    borderRadius: 30,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 20,
  },
  cancelButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
  },
});

export default TrackOrderScreen;
