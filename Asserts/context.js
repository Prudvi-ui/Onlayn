import React, { createContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cartCount, setCartCount] = useState(0);

  useEffect(() => {
    const loadCartCount = async () => {
      try {
        const stored = await AsyncStorage.getItem('Count');
        if (stored !== null) setCartCount(parseInt(stored));
      } catch (e) {
        console.error('Error loading cart count:', e);
      }
    };
    loadCartCount();
  }, []);

  useEffect(() => {
    AsyncStorage.setItem('Count', cartCount.toString());
  }, [cartCount]);

  return (
    <CartContext.Provider value={{ cartCount, setCartCount }}>
      {children}
    </CartContext.Provider>
  );
};


// import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
// import AsyncStorage from '@react-native-async-storage/async-storage';
// import Toast from 'react-native-toast-message';

// const CartContext = createContext();
// export const useCart = () => useContext(CartContext);

// export const CartProvider = ({ children }) => {
//   const [cartItems, setCartItems] = useState([]);
//   const [customerId, setCustomerId] = useState(null);

//   // Load user ID from AsyncStorage
//   useEffect(() => {
//     const loadCustomerId = async () => {
//       const storedId = await AsyncStorage.getItem('id');
//       setCustomerId(storedId);
//     };
//     loadCustomerId();
//   }, []);

//   // Fetch Cart Items
//   const fetchCart = async () => {
//     if (!customerId) {
//       setCartItems([]);
//       return;
//     }

//     try {
//       const response = await fetch(
//         `https://apis.toyshack.in/Dashboard/cart/cart-data?customerId=${customerId}`
//       );
//       const data = await response.json();
//       setCartItems(data.items || []);
//     } catch (error) {
//       console.error('Fetch cart failed:', error);
//       setCartItems([]);
//     }
//   };

//   useEffect(() => {
//     if (customerId) fetchCart();
//   }, [customerId]);

//   // Add to Cart
//   const addToCart = async (...args) => {
//     if (!customerId) {
//       Toast.show({ type: 'info', text1: 'Please login to add items to cart.' });
//       return;
//     }

//     let product, qty;
//     if (typeof args[0] === 'object' && args.length === 1) {
//       product = args[0];
//       qty = args[0].quantity || 1;
//     } else {
//       [product, qty = 1] = args;
//     }

//     const existingItem = cartItems.find(
//       (item) => item.productId?._id === product._id
//     );
//     const currentQty = existingItem?.quantity || 0;

//     if (currentQty + qty > Number(product.stock || 0)) {
//       Toast.show({
//         type: 'error',
//         text1: `Only ${product.stock} items available.`,
//       });
//       return;
//     }

//     try {
//       const customerName = (await AsyncStorage.getItem('customerName')) || '';
//       const originalPrice = Number(product.price) || 0;
//       const discount = product.discount || 0;
//       const discountedPrice = Math.round(
//         (originalPrice - (originalPrice * discount) / 100) * 100
//       ) / 100;

//       const payload = {
//         customerName,
//         customerId,
//         productId: product._id,
//         productName: product.productName,
//         shortId: product.shortId,
//         originalPrice,
//         discountedPrice,
//         discount,
//         category: product.category || '',
//         brand: product.brand || '',
//         unit: product.unit || '',
//         size: product.size || '',
//         stock: product.stock || 0,
//         material: product.material || '',
//         color: product.color || '',
//         age: product.age || '',
//         mainPrice: product.price,
//         quantity: qty,
//         reviews: product.reviews || 0,
//         images: product.images || [],
//         cess: product.cess || 0,
//         igst: product.igst || 0,
//         sgst: product.sgst || 0,
//         cgst: product.cgst || 0,
//       };

//       Toast.show({ type: 'info', text1: 'Adding to cart...' });

//       await fetch('https://apis.toyshack.in/Dashboard/cart/create-cart', {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify(payload),
//       });

//       await fetchCart();

//       Toast.show({
//         type: 'success',
//         text1: 'Added to Cart!',
//         text2: `${qty} × ${product.productName}`,
//       });
//     } catch (error) {
//       console.error('Add to cart failed:', error);
//       Toast.show({ type: 'error', text1: 'Failed to add to cart.' });
//     }
//   };

//   // Update Quantity
//   const updateQuantity = async (cartItemId, newQuantity, oldQuantity) => {
//     if (newQuantity < 1) {
//       Toast.show({ type: 'info', text1: 'Quantity must be at least 1' });
//       return;
//     }

//     try {
//       Toast.show({ type: 'info', text1: 'Updating cart...' });

//       await fetch('https://apis.toyshack.in/Dashboard/cart/update-cart-item', {
//         method: 'PUT',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify({ cartItemId, quantity: newQuantity, customerId }),
//       });

//       await fetchCart();

//       Toast.show({
//         type: 'success',
//         text1:
//           newQuantity > oldQuantity
//             ? 'Quantity increased!'
//             : 'Quantity decreased!',
//       });
//     } catch (error) {
//       console.error('Update quantity failed:', error);
//       Toast.show({
//         type: 'error',
//         text1: 'Something went wrong. Please try again.',
//       });
//     }
//   };

//   // Remove Item from Cart
//   const removeFromCart = async (itemId) => {
//     try {
//       Toast.show({ type: 'info', text1: 'Removing item...' });

//       await fetch(
//         `https://apis.toyshack.in/Dashboard/cart/delete-cart-item/${itemId}`,
//         {
//           method: 'DELETE',
//           headers: { 'Content-Type': 'application/json' },
//           body: JSON.stringify({ customerId }),
//         }
//       );

//       await fetchCart();
//       Toast.show({ type: 'success', text1: 'Item removed from cart!' });
//     } catch (error) {
//       console.error('Remove from cart failed:', error);
//       Toast.show({ type: 'error', text1: 'Failed to remove item.' });
//     }
//   };

//   // Clear Cart
//   const clearCart = async (showToast = true) => {
//     try {
//       if (showToast)
//         Toast.show({ type: 'info', text1: 'Clearing your cart...' });

//       await fetch('https://apis.toyshack.in/Dashboard/cart/clear-cart', {
//         method: 'DELETE',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify({ customerId }),
//       });

//       await fetchCart();

//       if (showToast)
//         Toast.show({ type: 'success', text1: 'Your cart has been cleared!' });
//     } catch (error) {
//       console.error('Clear cart failed:', error);
//       Toast.show({ type: 'error', text1: 'Failed to clear cart.' });
//     }
//   };

//   const resetCartState = () => setCartItems([]);

//   const cartCount = useMemo(
//     () =>
//       cartItems.reduce(
//         (total, item) => total + parseInt(item.quantity || 0),
//         0
//       ),
//     [cartItems]
//   );

//   return (
//     <CartContext.Provider
//       value={{
//         cartItems,
//         cartCount,
//         addToCart,
//         fetchCart,
//         updateQuantity,
//         removeFromCart,
//         clearCart,
//         resetCartState,
//         setCustomerId, // expose setter if you want to update customer manually
//       }}
//     >
//       {children}
//     </CartContext.Provider>
//   );
// };