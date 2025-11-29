import React, { useState, useContext, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  FlatList,
  Dimensions,
  ActivityIndicator,
  Pressable,
  Modal,
  StatusBar,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useRoute } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { CartContext } from '../context';
import Share from 'react-native-share';
import RNFetchBlob from 'react-native-blob-util';
import Toast from 'react-native-toast-message';
import Swiper from 'react-native-swiper';
import ImageViewing from 'react-native-image-viewing';
import { useFocusEffect } from "@react-navigation/native";
import ImageViewer from 'react-native-image-zoom-viewer';
import YoutubePlayer from "react-native-youtube-iframe";



const { width } = Dimensions.get('window');

export default function ProductDetailScreen({ navigation }) {
  const route = useRoute();
  const { product, quantity: passedQty, amount: passedAmount } = route.params || {};
  console.log("product.productId===================>", product.productId)
  if (!product) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <Text>No product data.</Text>
      </View>
    );
  }
  const [quantity, setQuantity] = useState(passedQty || 1);
  // determine base/main price
  const mainPrice =
    Number(product.mainPrice) > 0
      ? Number(product.mainPrice)
      : Number(product.finalPrice) > 0
        ? Number(product.finalPrice)
        : Number(product.price) > 0
          ? Number(product.price)
          : 0;

  const discount = Number(product.discount) || 0;

  const discountPrice =
    discount > 0
      ? Math.round(mainPrice - (mainPrice * discount) / 100)
      : mainPrice;

  console.log("💰 mainPrice:", mainPrice);
  console.log("💸 discountPrice:", discountPrice);


  // total for selected quantity (dynamic calculation)
  const [totalPrice, setTotalPrice] = useState(
    passedAmount || discountPrice * quantity
  );
  useEffect(() => {
    setTotalPrice(discountPrice * quantity);
  }, [quantity, discountPrice]);
  const [loading, setLoading] = useState(false);
  const [mainLoading, setMainLoading] = useState(false);

  const { cartCount, setCartCount } = useContext(CartContext) || {};

  const [products, setProducts] = useState([]); // related products
  const [allProducts, setAllProducts] = useState([]);
  const [filteredProduct, setFilteredProduct] = useState(null);

  // cart local map: productId -> qty
  const [cartItems, setCartItems] = useState({});
  const [updatingItem, setUpdatingItem] = useState(null);

  // image viewer state
  const [visible, setVisible] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);

  // slider index
  const [currentIndex, setCurrentIndex] = useState(0);
  const [likedItems, setLikedItems] = useState({});
  const [videoVisible, setVideoVisible] = useState(false);
  const [playing, setPlaying] = useState(false);
  // toggle like for product
  const toggleLike = (productId) => {
    setLikedItems((prev) => ({
      ...prev,
      [productId]: !prev[productId],
    }));
  };

  const rawImages = Array.isArray(product.images)
    ? product.images
    : product.images
      ? [product.images]
      : [];

  const images = rawImages.length > 0
    ? rawImages.map(img => ({
      uri: `https://apis.toyshack.in/storage/productimages/${img}`, // 👈 for Swiper
      url: `https://apis.toyshack.in/storage/productimages/${img}`, // 👈 for ImageViewer
    }))
    : [
      {
        uri: 'https://via.placeholder.com/150',
        url: 'https://via.placeholder.com/150',
      },
    ];



  const handlePrevImage = () => {
    if (currentIndex > 0) setCurrentIndex(i => i - 1);
  };

  const handleNextImage = () => {
    if (currentIndex < images.length - 1) setCurrentIndex(i => i + 1);
  };

  const getRelatedProducts = async () => {
    setLoading(true);
    try {
      const response = await fetch('https://apis.toyshack.in/App/products/all-products');
      const data = await response.json();
      if (Array.isArray(data)) {
        const related = data.filter(
          item => item.category === product.category && item._id !== (product._id || product.productId)
        );
        setProducts(related);
      }
    } catch (err) {
      console.error('Error fetching related products:', err);
    } finally {
      setLoading(false);
    }
  };

  const getProducts = async () => {
    setLoading(true);
    try {
      const response = await fetch("https://apis.toyshack.in/App/products/all-products");
      const data = await response.json();

      if (Array.isArray(data)) {
        // Match by _id or productId
        const match = data.find(
          (p) => p._id === product._id || p._id === product.productId
        );
        setFilteredProduct(match || product);
        console.log("🔄 singleproduct filter===>", match);
        setAllProducts(match ? [match] : []);
      } else {
        console.warn('❗ "products" is not an array:', data);
      }
    } catch (error) {
      console.error("❌ Error fetching products:", error);
    } finally {
      setLoading(false);
    }
  };

  // ⬇️ refresh every second when screen is focused
  useFocusEffect(
    useCallback(() => {
      getProducts();
      const interval = setInterval(() => {
        getProducts();
      }, 10000); // refresh every 10 seconds instead of 0.5s
      return () => clearInterval(interval);
    }, [product._id || product.productId])
  );



  const addCart = async () => {
    try {
      const userId = await AsyncStorage.getItem('id');
      const username = await AsyncStorage.getItem('Name');

      if (!userId || !username) {
        Toast.show({ type: 'error', text1: 'Error', text2: 'User not logged in.' });
        return;
      }

      const prod = filteredProduct || product;
      if (!prod.stock || Number(prod.stock) <= 0) {
        Toast.show({ type: 'error', text1: 'Out of Stock', text2: `${prod.productName} is unavailable.` });
        return;
      }

      setMainLoading(true);

      // ✅ Base & discount price calculation
      const basePrice = Number(prod.price) || Number(prod.finalPrice) || Number(prod.mainPrice) || 0;
      const discountPrice =
        prod.discount > 0
          ? Math.round(basePrice - (basePrice * prod.discount) / 100)
          : basePrice;

      // ✅ Match backend expected keys
      const cartData = {
        customerId: userId,
        customerName: username,
        productId: prod._id || prod.productId,
        productName: prod.productName || "Unknown Product",
        description: prod.description || "No description available",
        mainPrice: basePrice,                        // ✅ backend expects this
        discountedPrice: discountPrice,              // ✅ backend expects this
        category: prod.category || "General",
        brand: prod.brand || "Generic",
        unit: prod.unit || "piece",
        size: prod.size || "",
        discount: Number(prod.discount) || 0,
        material: prod.material || "",
        color: prod.color || "",
        age: prod.age ? String(prod.age).replace(/"/g, "") : "All Ages",
        stock: Number(prod.stock) || 0,
        quantity: quantity || 1,                     // ✅ required
        reviews: Number(prod.reviews) || 0,
        images:
          Array.isArray(prod.images) && prod.images.length > 0
            ? prod.images
            : ["https://via.placeholder.com/150"],
        igst: prod.igst || "0",
        cgst: prod.cgst || "0",
        sgst: prod.sgst || "0",
        cess: prod.cess || "0",
        videoUrl: prod.videoUrl || "",
      };

      console.log('📦 Cart Data (Final):', cartData);

      const res = await fetch('https://apis.toyshack.in/App/Cart/create-cart', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(cartData),
      });

      const data = await res.json();
      console.log('🛒 Cart API Response:', data);

      if (res.ok) {
        Toast.show({ type: 'success', text1: 'Added to Cart', text2: data.message || 'Product added successfully!' });

        // Local AsyncStorage handling
        const storedCart = await AsyncStorage.getItem('cart');
        let cart = storedCart ? JSON.parse(storedCart) : [];
        cart = cart.filter((p) => p.productId !== cartData.productId);
        cart.push(cartData);
        await AsyncStorage.setItem('cart', JSON.stringify(cart));

        const totalCount = cart.reduce((acc, p) => acc + p.quantity, 0);
        setCartCount?.(totalCount);
        await AsyncStorage.setItem('Count', totalCount.toString());
      } else {
        Toast.show({ type: 'error', text1: 'Error', text2: data.error || 'Failed to add product to cart.' });
      }
    } catch (error) {
      console.error('❌ Exception adding to cart:', error);
      Toast.show({ type: 'error', text1: 'Error', text2: 'Something went wrong.' });
    } finally {
      setMainLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      setCartItems({});
    }, [])
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

    loadCart();
    getProducts();
    getRelatedProducts();
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



  const createWishlist = async () => {
    try {
      const userId = await AsyncStorage.getItem('id');
      const username = await AsyncStorage.getItem('Name');

      if (!userId || !username) {
        Toast.show({ type: 'error', text1: 'Error', text2: 'User not logged in.' });
        return;
      }

      // calculate price properly
      const basePrice = product.mainPrice ?? product.finalPrice ?? product.price ?? 0;
      const discountPrice =
        product.discount > 0
          ? Math.round(basePrice - (basePrice * product.discount) / 100)
          : basePrice;

      const wishlistData = {
        customerid: userId,
        customerName: username,
        productId: product._id || product.productId,
        productName: product.productName,
        description: product.description,
        discountedPrice: discountPrice,   // ✅ discounted price stored
        mainPrice: basePrice,             // ✅ store original price too
        category: product.category,
        quantity: 1,
        brand: product.brand,
        unit: product.unit,
        size: product.size,
        stock: product.stock,
        discount: product.discount,
        material: product.material,
        color: product.color,
        age: product.age,
        gst: product.gst,
        cess: product.cess,
        images: Array.isArray(product.images)
          ? product.images
          : product.images
            ? [product.images]
            : [],
      };

      console.log("❤️ Wishlist Data =>", wishlistData);

      const response = await fetch('https://apis.toyshack.in/App/wishlist/create-wishlist', {
        method: 'POST',
        headers: { Accept: 'application/json', 'Content-Type': 'application/json' },
        body: JSON.stringify(wishlistData),
      });

      const data = await response.json();

      if (response.ok) {
        Toast.show({ type: 'success', text1: 'Success', text2: data.message || 'Product added to wishlist!' });
      } else {
        Toast.show({ type: 'error', text1: 'Error', text2: data.message || data.error || 'Failed to add to wishlist.' });
      }
    } catch (error) {
      console.error('Exception adding to wishlist:', error);
      Toast.show({ type: 'error', text1: 'Error', text2: 'Something went wrong. Please try again.' });
    }
  };


  const onShare = async () => {
    const appLink = 'https://play.google.com/store/apps/details?id=com.onlayn';
    const firstImageRaw = rawImages.length > 0 ? rawImages[0] : null;
    const imageUrl = firstImageRaw ? `https://apis.toyshack.in/storage/productimages/${firstImageRaw}` : 'https://via.placeholder.com/100';

    try {
      const { config, fs } = RNFetchBlob;
      const imagePath = `${fs.dirs.CacheDir}/${firstImageRaw || 'temp_image.jpg'}`;
      const res = await config({ fileCache: true, path: imagePath }).fetch('GET', imageUrl);
      const localImagePath = `file://${res.path()}`;

      const shareOptions = {
        title: 'Check out this Toy!',
        message: `Take a look at this Toy: ${product.productName}\nAmount: ₹${product.price ?? product.finalPrice ?? ''}\nDownload the app: ${appLink}`,
        url: localImagePath,
        failOnCancel: false,
      };

      await Share.open(shareOptions);
      // cleanup
      try { await fs.unlink(res.path()); } catch (_) { /* ignore */ }
    } catch (error) {
      console.log('Error sharing:', error);
      Toast.show({ type: 'error', text1: 'Share failed', text2: 'Unable to share this item.' });
    }
  };


  const getYoutubeId = (url) => {
    if (!url || typeof url !== "string") return null;  // ✅ Prevent crash
    const regex = /(?:v=|youtu\.be\/|embed\/)([^#&?]*).*/;
    const match = url.match(regex);
    return match && match[1] ? match[1] : null;
  };


  return (
    <ScrollView style={styles.container}>
      <StatusBar backgroundColor="#E8F6FF" barStyle="dark-content" />
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Icon name="menu-left" size={34} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Product Detail</Text>
        <View style={{ width: 30 }} />
      </View>

      <LinearGradient style={styles.imageCard} colors={['white', 'white']}>
        <TouchableOpacity
          style={styles.favoriteIcon}
          onPress={() => {
            createWishlist();
            toggleLike(filteredProduct?._id || filteredProduct?.productId);
          }}
        >
          <Icon
            name={likedItems[filteredProduct?._id || filteredProduct?.productId] ? 'heart' : 'heart-outline'}
            size={26}
            color={likedItems[filteredProduct?._id || filteredProduct?.productId] ? '#e91e63' : '#ea1d68ff'}
          />
        </TouchableOpacity>

        <TouchableOpacity style={styles.shareIcon} onPress={onShare}>
          <Icon name="share-variant" size={18} color="#e67aa1" />
        </TouchableOpacity>

        <Swiper
          style={{ height: 250 }}
          showsPagination={false}
          autoplay={false}
          loop={false}
          scrollEnabled={false} // 👈 disable manual swipe
        >
          <View style={{ height: 250 }}>
            <TouchableOpacity
              style={{ flex: 1 }}
              onPress={() => {
                setSelectedIndex(selectedImageIndex);
                setVisible(true);
              }}
            >
              <Image
                source={{ uri: images[selectedImageIndex]?.uri }}
                style={styles.productImage}
                resizeMode="cover"
              />
            </TouchableOpacity>
          </View>

          {filteredProduct?.videoUrl ? (
            <View
              style={{
                height: 250,
                justifyContent: 'center',
                alignItems: 'center',
                backgroundColor: '#000',
              }}
            >
              <TouchableOpacity
                style={{ justifyContent: 'center', alignItems: 'center', flex: 1 }}
                onPress={() => {
                  setVideoVisible(true);
                  setPlaying(true);
                }}
              >
                <Icon name="play-circle" size={64} color="#fff" />
                <Text style={{ color: '#fff', marginTop: 8 }}>Watch Video</Text>
              </TouchableOpacity>
            </View>
          ) : null}
        </Swiper>


        <View style={styles.quantityRow}>
          <TouchableOpacity
            onPress={() => quantity > 1 && setQuantity(q => q - 1)}
            disabled={quantity === 1}
          >
            <Icon name="minus-circle" size={24} color={quantity === 1 ? '#ccc' : '#000'} />
          </TouchableOpacity>

          <Text style={styles.quantityText}>{quantity}</Text>

          <TouchableOpacity
            onPress={() => {
              if (quantity < (Number(filteredProduct?.stock) || 0))
                setQuantity(q => q + 1);
              else {
                Toast.show({
                  type: 'info',
                  text1: 'Stock Limit',
                  text2: `Only ${filteredProduct?.stock} items available in stock.`,
                });
              }
            }}
            disabled={quantity >= (Number(filteredProduct?.stock) || 0)}
          >
            <Icon
              name="plus-circle"
              size={24}
              color={quantity >= (Number(filteredProduct?.stock) || 0) ? '#ccc' : '#000'}
            />
          </TouchableOpacity>
        </View>
      </LinearGradient>

      <Modal visible={visible} transparent onRequestClose={() => setVisible(false)}>
        <ImageViewer
          imageUrls={images}
          index={selectedIndex}
          enableSwipeDown
          onSwipeDown={() => setVisible(false)}
        />
      </Modal>

      <Modal
        visible={videoVisible}
        transparent={false}
        animationType="slide"
        onRequestClose={() => {
          setVideoVisible(false);
          setPlaying(false);
        }}
      >
        <View style={{ flex: 1, backgroundColor: 'black', justifyContent: 'center' }}>
          <TouchableOpacity
            style={{ position: 'absolute', top: 40, left: 20, zIndex: 1 }}
            onPress={() => {
              setVideoVisible(false);
              setPlaying(false);
            }}
          >
            <Icon name="close" size={30} color="#fff" />
          </TouchableOpacity>

          <YoutubePlayer
            height={300}
            play={playing}
            videoId={getYoutubeId(filteredProduct?.videoUrl) || ''}
            onChangeState={state => {
              if (state === 'ended') {
                setPlaying(false);
                setVideoVisible(false);
              }
            }}
          />
        </View>
      </Modal>
      <View style={{ flexDirection: 'row', left: 15, marginTop: 10 }}>
        {images.map((img, index) => (
          <TouchableOpacity
            key={index}
            onPress={() => setSelectedImageIndex(index)}
            style={{
              borderWidth: selectedImageIndex === index ? 2 : 1,
              borderColor: selectedImageIndex === index ? 'navy' : '#ccc',
              borderRadius: 6,
              marginHorizontal: 5,
              padding: 2,
            }}
          >
            <Image
              source={{ uri: img.uri }}
              style={{ width: 50, height: 50, borderRadius: 4 }}
              resizeMode="cover"
            />
          </TouchableOpacity>
        ))}

        {/* 👇 Add this block to show video thumbnail at end */}
        {filteredProduct?.videoUrl ? (
          <TouchableOpacity
            onPress={() => {
              setVideoVisible(true);
              setPlaying(true);
            }}
            style={{
              borderWidth: 1,
              borderColor: '#ccc',
              borderRadius: 6,
              marginHorizontal: 5,
              padding: 2,
              justifyContent: 'center',
              alignItems: 'center',
            }}
          >
            <View
              style={{
                width: 50,
                height: 50,
                borderRadius: 4,
                backgroundColor: '#000',
                justifyContent: 'center',
                alignItems: 'center',
              }}
            >
              <Icon name="play-circle" size={24} color="#fff" />
            </View>
          </TouchableOpacity>
        ) : null}
      </View>

      <View style={styles.productDetails}>
        <View style={styles.titleRow}>
          <Text style={styles.cardTitle1} numberOfLines={2} ellipsizeMode="tail">
            {filteredProduct?.productName}
          </Text>
        </View>

        <View style={{ flexDirection: 'row', alignItems: 'center', left: 14 }}>
          <Text style={styles.priceText}>₹ {Math.round(discountPrice)}</Text>

          <Text
            style={{
              fontSize: 15,
              color: 'gray',
              textDecorationLine: 'line-through',
            }}
          >
            ₹ {Math.round(mainPrice)}
          </Text>

          <View style={styles.discountBadge}>
            <Text style={{ fontSize: 13, color: 'navy' }}>
              {filteredProduct?.discount ?? 0}% OFF
            </Text>
          </View>
        </View>

        {Number(filteredProduct?.stock) === 0 ? (
          <View
            style={{
              padding: 6,
              borderRadius: 15,
              width: '80%', backgroundColor: '#ffcccc'
            }}
          >
            <Text style={{ fontSize: 15, color: 'red', fontWeight: '300', left: 20 }}>
              This product is currently out of stock
            </Text>
          </View>
        ) : null}

        <Text style={styles.description}>{filteredProduct?.description}</Text>

        <TouchableOpacity onPress={addCart} disabled={mainLoading}>
          <LinearGradient colors={['#ff4da6', '#ff4da6']} style={styles.cartButton}>
            {mainLoading ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <Text style={styles.cartButtonText}>Add to Cart</Text>
            )}
          </LinearGradient>
        </TouchableOpacity>
      </View>



      <View style={styles.specCard}>
        <View style={styles.specs}>
          <Spec label="Size" value={filteredProduct?.size} />
          <Spec label="Material" value={filteredProduct?.material} />
          <Spec label="Color" value={filteredProduct?.color} />
          <Spec label="Item Weight" value={filteredProduct?.unit} />
          <Spec label="Age Suitability" value={`${filteredProduct?.age} Years`} />
          <Spec label="Shipping" value="Free" />
        </View>
      </View>

      <View style={styles.relatedHeader}>
        <Text style={styles.relatedTitle}>Related Product</Text>
        <TouchableOpacity onPress={() => navigation.navigate('Products')}>
          <Text style={styles.viewAll}>View all</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={products}
        horizontal
        showsHorizontalScrollIndicator={false}
        keyExtractor={(item) => String(item._id)}
        contentContainerStyle={styles.relatedList}
        renderItem={({ item }) => {
          const finalPrice = item.discount > 0 ? Math.round(item.finalPrice || item.price - (item.finalPrice || item.price * item.discount) / 100) : item.finalPrice;
          const isOutOfStock = Number(item.stock) <= 0;
          return (
            <LinearGradient colors={['white', 'white']} style={styles.relatedCard}>
              <TouchableOpacity onPress={() => navigation.navigate('ProductDetailScreen', { product: item })}>
                <Image
                  source={{
                    uri: Array.isArray(item.images) && item.images.length > 0
                      ? `https://apis.toyshack.in/storage/productimages/${item.images[0]}`
                      : (item.images ? `https://apis.toyshack.in/storage/productimages/${item.images}` : 'https://via.placeholder.com/150')
                  }}
                  style={styles.relatedImage}
                />
                <View style={{ gap: 10, alignItems: 'center' }}>
                  <View>
                    <Text style={styles.relatedText}>
                      {item.productName}
                    </Text>

                    <View style={{ flexDirection: 'row', alignItems: 'center', }}>
                      <View style={styles.cardBottom}>
                        {item.discount > 0 ? (
                          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginLeft: 20 }}>
                            <Text style={{
                              fontSize: 14,
                              fontWeight: 'bold',
                              color: 'black'
                            }}>
                              ₹ {Math.round((item.finalPrice || item.price) - ((item.finalPrice || item.price) * item.discount / 100))}
                            </Text>
                            <Text style={{ fontSize: 13, color: 'gray', textDecorationLine: 'line-through' }}>
                              ₹ {Math.round(item.finalPrice || item.price)}
                            </Text>
                          </View>
                        ) : (
                          <Text style={styles.cardPrice}>₹ {Math.round(item.finalPrice)}</Text>
                        )}
                      </View>
                    </View>

                  </View>

                  {cartItems[item._id] > 0 ? (
                    <View style={styles.qtyContainer}>
                      <Pressable
                        style={styles.qtyBtn}
                        onPress={() => updateCartQuantity(item, (cartItems[item._id] || 1) - 1)}
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
                </View>
                {isOutOfStock && (
                  <View style={styles.outOfStockOverlay}>
                    <Text style={styles.outOfStockText}>OUT OF STOCK</Text>
                  </View>
                )}
              </TouchableOpacity>
            </LinearGradient>
          );
        }}
      />
    </ScrollView>
  );
}

const Spec = ({ label, value }) => (
  <View style={styles.specRow}>
    <Text style={styles.specLabel}>{label}</Text>
    <Text style={styles.specValue}>{value ?? '-'}</Text>
  </View>
);


const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: 'white' },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    margin: 16,
    marginTop: 45,
  },
  headerTitle: { fontSize: 18, fontWeight: 'bold' },
  imageCard: {
    marginHorizontal: 16,
    backgroundColor: '#fff',
    borderRadius: 20,
    alignItems: 'center',
    padding: 16,
    borderWidth: 1,
    borderColor: '#ed91bfff',
  },
  favoriteIcon: {
    alignSelf: 'flex-start',
    backgroundColor: '#fff',
    padding: 6,
    borderRadius: 10,
    position: 'absolute',
    top: 16,
    left: 16,
    zIndex: 1,
  },
  productImage: {
    width: '100%',
    height: 250,
    resizeMode: 'cover',
    borderRadius: 20
  },
  videoContainer: {
    width: '100%',
    height: 250,
    backgroundColor: 'black',
    justifyContent: 'center',
    alignItems: 'center', borderRadius: 20
  },
  playIcon: {
    opacity: 0.9,
  },
  videoLabel: {
    color: '#fff',
    fontSize: 16,
    marginTop: 10,
  },
  dot: {
    backgroundColor: '#ccc',
  },
  activeDot: {
    backgroundColor: '#000',
  },
  shareIcon: {
    position: 'absolute',
    top: 8,
    right: 8,
    zIndex: 1,
    padding: 6,
    borderRadius: 10,
    backgroundColor: '#fff',
  },
  quantityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
    gap: 12,
  },
  quantityText: { fontWeight: '700', fontSize: 16 },
  productDetails: { padding: 16 },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  productTitle: { fontSize: 18, fontWeight: 'bold', color: 'black' },
  priceText: { fontSize: 16, color: '#ff4da6', fontWeight: 'bold', right: 10 },
  description: { fontSize: 14, color: '#555', marginVertical: 6 },
  cartButton: {
    marginTop: 10,
    padding: 12,
    borderRadius: 30,
    alignItems: 'center',
  },
  cartButtonText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  specCard: {
    backgroundColor: '#fff',
    margin: 16,
    borderRadius: 16,
    padding: 16,
  },
  specs: { marginTop: 10 },
  specRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 2,
  },
  specLabel: { fontWeight: '600', color: '#444' },
  specValue: { color: '#888' },
  relatedHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginHorizontal: 16,
    marginTop: 10,
  },
  relatedTitle: { fontWeight: 'bold', fontSize: 16, marginBottom: 10 },
  viewAll: { color: '#888' },
  relatedList: { paddingHorizontal: 16, paddingBottom: 40 },
  relatedCard: {
    backgroundColor: '#fff',
    borderRadius: 20,
    // padding: 2,
    margin: 6, left: 10,
    width: 140,
    marginRight: 18,
    borderColor: '#d46cf0',
    borderWidth: 0.5,
    overflow: 'hidden',   // keep this so image corners clip correctly
  },
  relatedImage: {
    width: '100%',
    height: 100,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    resizeMode: 'cover',
    marginBottom: 8,
  },
  cardTitle1: {
    fontWeight: "800",
    marginBottom: 6,
    color: "#ff4da6",
    textAlign: "center",
    fontSize: 18,
    height: 40,        // ✅ fixes card height for 2 lines
    lineHeight: 20,
    padding: 5
  },
  relatedText: {
    fontWeight: "800",
    marginBottom: 6,
    color: "#ff4da6",
    textAlign: "center",
    // fontSize: 14,
    height: 40,        // ✅ fixes card height for 2 lines
    lineHeight: 20,
  },
  relatedPrice: {
    color: 'black',
    fontWeight: '700',
    marginTop: 2,
  },
  addButton: {
    marginTop: 8,
    backgroundColor: 'navy',
    padding: 8,
    borderRadius: 20,
    width: 34,
    alignItems: 'center',
    justifyContent: 'center',
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
  cartIcon: {
    width: 110,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10, marginBottom: 15
  },
  cardBottom: { alignItems: 'center' },
  cardPrice: { fontSize: 14, fontWeight: '700' },
  discountBadge: {
    left: 10,
    padding: 5,
    margin: 5,
    backgroundColor: '#bacef5',
    borderRadius: 25,
    alignItems: 'center',
    alignSelf: 'center',
    marginRight: 10
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
    borderRadius: 20,   // 🔥 match relatedCard radius
    zIndex: 2,          // 🔥 ensure overlay stays on top
  },

  outOfStockText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
    backgroundColor: 'rgba(255,0,0,0.8)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    textAlign: 'center'
  },
});





// import React, { useState, useContext, useEffect, useCallback } from 'react';
// import {
//   View,
//   Text,
//   Image,
//   TouchableOpacity,
//   StyleSheet,
//   ScrollView,
//   FlatList,
//   Dimensions,
//   ActivityIndicator,
//   Pressable
// } from 'react-native';
// import LinearGradient from 'react-native-linear-gradient';
// import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
// import { useRoute, useFocusEffect } from '@react-navigation/native';
// import AsyncStorage from '@react-native-async-storage/async-storage';
// import { CartContext } from '../context';
// import Share from 'react-native-share';
// import RNFetchBlob from 'react-native-blob-util';
// import Toast from 'react-native-toast-message';
// import Swiper from 'react-native-swiper';
// import ImageViewing from 'react-native-image-viewing';

// const { width } = Dimensions.get('window');

// export default function ProductDetailScreen({ navigation }) {
//   const route = useRoute();
//   const { product, quantity: passedQty, amount: passedAmount } = route.params || {};

//   if (!product) {
//     return (
//       <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
//         <Text>No product data.</Text>
//       </View>
//     );
//   }

//   const [quantity, setQuantity] = useState(passedQty || 1);
//   const mainPrice = product.mainPrice ?? product.price ?? 0;
//   const discountPrice =
//     product.discount > 0
//       ? Math.round(mainPrice - (mainPrice * product.discount) / 100)
//       : mainPrice;

//   const [totalPrice, setTotalPrice] = useState(passedAmount || discountPrice * quantity);
//   const [loading, setLoading] = useState(false);
//   const [mainLoading, setMainLoading] = useState(false);

//   const { cartItems, cartCount, addToCart, updateCartQuantity } = useContext(CartContext);

//   const [products, setProducts] = useState([]); // related products
//   const [filteredProduct, setFilteredProduct] = useState(null);

//   const [visible, setVisible] = useState(false);
//   const [selectedIndex, setSelectedIndex] = useState(0);
//   const [currentIndex, setCurrentIndex] = useState(0);
//   const [likedItems, setLikedItems] = useState({});

//   const rawImages = Array.isArray(product.images)
//     ? product.images
//     : product.images
//       ? [product.images]
//       : [];

//   const images = rawImages.length > 0
//     ? rawImages.map(img => ({ uri: `https://apis.toyshack.in/storage/productimages/${img}` }))
//     : [{ uri: 'https://via.placeholder.com/150' }];

//   const toggleLike = (productId) => {
//     setLikedItems((prev) => ({
//       ...prev,
//       [productId]: !prev[productId],
//     }));
//   };

//   const handlePrevImage = () => {
//     if (currentIndex > 0) setCurrentIndex(i => i - 1);
//   };

//   const handleNextImage = () => {
//     if (currentIndex < images.length - 1) setCurrentIndex(i => i + 1);
//   };

//   const getRelatedProducts = async () => {
//     setLoading(true);
//     try {
//       const response = await fetch('https://apis.toyshack.in/App/products/all-products');
//       const data = await response.json();
//       if (Array.isArray(data)) {
//         const related = data.filter(
//           item => item.category === product.category && item._id !== (product._id || product.productId)
//         );
//         setProducts(related);
//       }
//     } catch (err) {
//       console.error('Error fetching related products:', err);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const getProducts = async () => {
//     setLoading(true);
//     try {
//       const response = await fetch("https://apis.toyshack.in/App/products/all-products");
//       const data = await response.json();
//       if (Array.isArray(data)) {
//         const match = data.find(
//           (p) => p._id === product._id || p._id === product.productId
//         );
//         setFilteredProduct(match || product);
//         console.log("🔄 singleproduct filter===>", match);
//       }
//     } catch (error) {
//       console.error("❌ Error fetching products:", error);
//     } finally {
//       setLoading(false);
//     }
//   };

//   useFocusEffect(
//     useCallback(() => {
//       getProducts();
//       getRelatedProducts();
//     }, [product._id || product.productId])
//   );

//   const handleAddToCart = async () => {
//     setMainLoading(true);
//     try {
//       const prod = filteredProduct || product;
//       await addToCart(prod, quantity);
//       Toast.show({ type: "success", text1: "Added to Cart", text2: `${prod.productName} added.` });
//     } catch (error) {
//       console.error(error);
//       Toast.show({ type: "error", text1: "Error", text2: "Failed to add to cart." });
//     } finally {
//       setMainLoading(false);
//     }
//   };

//   const createWishlist = async () => {
//     try {
//       const userId = await AsyncStorage.getItem('id');
//       const username = await AsyncStorage.getItem('Name');

//       if (!userId || !username) {
//         Toast.show({ type: 'error', text1: 'Error', text2: 'User not logged in.' });
//         return;
//       }

//       const basePrice = product.mainPrice ?? product.price ?? 0;
//       const discountPrice =
//         product.discount > 0
//           ? Math.round(basePrice - (basePrice * product.discount) / 100)
//           : basePrice;

//       const wishlistData = {
//         customerid: userId,
//         customerName: username,
//         productId: product._id || product.productId,
//         productName: product.productName,
//         description: product.description,
//         discountedPrice: discountPrice,
//         mainPrice: basePrice,
//         category: product.category,
//         quantity: 1,
//         brand: product.brand,
//         unit: product.unit,
//         size: product.size,
//         stock: product.stock,
//         discount: product.discount,
//         material: product.material,
//         color: product.color,
//         age: product.age,
//         gst: product.gst,
//         cess: product.cess,
//         images: Array.isArray(product.images)
//           ? product.images
//           : product.images
//             ? [product.images]
//             : [],
//       };

//       const response = await fetch('https://apis.toyshack.in/App/wishlist/create-wishlist', {
//         method: 'POST',
//         headers: { Accept: 'application/json', 'Content-Type': 'application/json' },
//         body: JSON.stringify(wishlistData),
//       });

//       const data = await response.json();

//       if (response.ok) {
//         Toast.show({ type: 'success', text1: 'Success', text2: data.message || 'Product added to wishlist!' });
//       } else {
//         Toast.show({ type: 'error', text1: 'Error', text2: data.message || data.error || 'Failed to add to wishlist.' });
//       }
//     } catch (error) {
//       console.error(error);
//       Toast.show({ type: 'error', text1: 'Error', text2: 'Something went wrong.' });
//     }
//   };

//   const onShare = async () => {
//     const appLink = 'https://play.google.com';
//     const firstImageRaw = rawImages.length > 0 ? rawImages[0] : null;
//     const imageUrl = firstImageRaw ? `https://apis.toyshack.in/storage/productimages/${firstImageRaw}` : 'https://via.placeholder.com/100';

//     try {
//       const { config, fs } = RNFetchBlob;
//       const imagePath = `${fs.dirs.CacheDir}/${firstImageRaw || 'temp_image.jpg'}`;
//       const res = await config({ fileCache: true, path: imagePath }).fetch('GET', imageUrl);
//       const localImagePath = `file://${res.path()}`;

//       const shareOptions = {
//         title: 'Check out this Toy!',
//         message: `Take a look at this Toy: ${product.productName}\nAmount: ₹${product.price ?? ''}\nDownload the app: ${appLink}`,
//         url: localImagePath,
//         failOnCancel: false,
//       };

//       await Share.open(shareOptions);
//       try { await fs.unlink(res.path()); } catch (_) { }
//     } catch (error) {
//       console.log('Error sharing:', error);
//       Toast.show({ type: 'error', text1: 'Share failed', text2: 'Unable to share this item.' });
//     }
//   };

//   useEffect(() => {
//     setTotalPrice(discountPrice * quantity);
//   }, [quantity, discountPrice]);

//   return (
//     <ScrollView style={styles.container}>
//       {/* Header */}
//       <View style={styles.header}>
//         <TouchableOpacity onPress={() => navigation.goBack()}>
//           <Icon name="menu-left" size={34} color="#333" />
//         </TouchableOpacity>
//         <Text style={styles.headerTitle}>Product Detail</Text>
//         <View style={{ width: 30 }} />
//       </View>

//       {/* Images */}
//       <LinearGradient style={styles.imageCard} colors={['white', 'white']}>
//         <TouchableOpacity
//           style={styles.favoriteIcon}
//           onPress={() => {
//             createWishlist();
//             toggleLike(product._id || product.productId);
//           }}
//         >
//           <Icon
//             name={likedItems[product._id || product.productId] ? 'heart' : 'heart-outline'}
//             size={26}
//             color={likedItems[product._id || product.productId] ? '#e91e63' : '#ea1d68ff'}
//           />
//         </TouchableOpacity>
//         <TouchableOpacity style={styles.shareIcon} onPress={onShare}>
//           <Icon name="share-variant" size={18} color="#e67aa1" />
//         </TouchableOpacity>

//         <Swiper style={{ height: 250 }} showsPagination dotStyle={styles.dot} activeDotStyle={styles.activeDot}>
//           {images.map((item, index) => (
//             <TouchableOpacity
//               key={index}
//               onPress={() => {
//                 setSelectedIndex(index);
//                 setVisible(true);
//               }}
//             >
//               <Image source={{ uri: item.uri }} style={styles.productImage} />
//             </TouchableOpacity>
//           ))}
//         </Swiper>

//         <View style={styles.quantityRow}>
//           <TouchableOpacity onPress={() => quantity > 1 && setQuantity(q => q - 1)} disabled={quantity === 1}>
//             <Icon name="minus-circle" size={24} color={quantity === 1 ? '#ccc' : '#000'} />
//           </TouchableOpacity>

//           <Text style={styles.quantityText}>{quantity}</Text>

//           <TouchableOpacity
//             onPress={() => {
//               if (quantity < (Number(product.stock) || 0)) setQuantity(q => q + 1);
//               else Toast.show({ type: 'info', text1: 'Stock Limit', text2: `Only ${product.stock} items available.` });
//             }}
//             disabled={quantity >= (Number(product.stock) || 0)}
//           >
//             <Icon name="plus-circle" size={24} color={quantity >= (Number(product.stock) || 0) ? '#ccc' : '#000'} />
//           </TouchableOpacity>
//         </View>
//       </LinearGradient>

//       <ImageViewing
//         images={images}
//         imageIndex={selectedIndex}
//         visible={visible}
//         onRequestClose={() => setVisible(false)}
//         presentationStyle="overFullScreen"
//         swipeToCloseEnabled
//         doubleTapToZoomEnabled
//       />

//       {/* Product Details */}
//       <View style={styles.productDetails}>
//         <View style={styles.titleRow}>
//           <Text style={styles.cardTitle1} numberOfLines={2} ellipsizeMode="tail">{product.productName}</Text>
//         </View>
//         <View style={{ flexDirection: "row", alignItems: 'center', left: 14 }}>
//           <Text style={styles.priceText}>₹ {discountPrice}</Text>
//           <Text style={{ fontSize: 15, color: 'gray', textDecorationLine: 'line-through', right: 5 }}>
//             ₹ {mainPrice}
//           </Text>
//           <View style={styles.discountBadge}>
//             <Text style={{ fontSize: 13, color: 'navy' }}>{product.discount ?? 0}% OFF</Text>
//           </View>
//         </View>
//         <Text style={styles.description}>{product.description}</Text>

//         <TouchableOpacity onPress={handleAddToCart} disabled={mainLoading}>
//           <LinearGradient colors={['#ff4da6', '#ff4da6']} style={styles.cartButton}>
//             {mainLoading ? <ActivityIndicator size="small" color="#fff" /> : <Text style={styles.cartButtonText}>Add to Cart</Text>}
//           </LinearGradient>
//         </TouchableOpacity>
//       </View>

//       {/* Specs */}
//       <View style={styles.specCard}>
//         <View style={styles.specs}>
//           <Spec label="Size" value={product.size} />
//           <Spec label="Material" value={product.material} />
//           <Spec label="Color" value={product.color} />
//           <Spec label="Item Weight" value={product.unit} />
//           <Spec label="Age Suitability" value={`${product.age} Years`} />
//           <Spec label="Shipping" value={"Free"} />
//         </View>
//       </View>

//       {/* Related Products */}
//       <View style={styles.relatedHeader}>
//         <Text style={styles.relatedTitle}>Related Product</Text>
//         <TouchableOpacity onPress={() => navigation.navigate('Products')}>
//           <Text style={styles.viewAll}>View all</Text>
//         </TouchableOpacity>
//       </View>

//       <FlatList
//         data={products}
//         horizontal
//         showsHorizontalScrollIndicator={false}
//         keyExtractor={(item) => String(item._id)}
//         contentContainerStyle={styles.relatedList}
//         renderItem={({ item }) => {
//           const finalPrice = item.discount > 0 ? Math.round(item.price - (item.price * item.discount) / 100) : item.price;
//           const isOutOfStock = Number(item.stock) <= 0;

//           return (
//             <LinearGradient colors={['white', 'white']} style={styles.relatedCard}>
//               <TouchableOpacity onPress={() => navigation.navigate('ProductDetailScreen', { product: item })}>
//                 <Image
//                   source={{
//                     uri: Array.isArray(item.images) && item.images.length > 0
//                       ? `https://apis.toyshack.in/storage/productimages/${item.images[0]}`
//                       : (item.images ? `https://apis.toyshack.in/storage/productimages/${item.images}` : 'https://via.placeholder.com/150')
//                   }}
//                   style={styles.relatedImage}
//                 />
//                 <View style={{ gap: 10, alignItems: 'center' }}>
//                   <View>
//                     <Text style={styles.relatedText}>{item.productName}</Text>
//                     <View style={{ flexDirection: 'row', alignItems: 'center', left: 12 }}>
//                       <View style={styles.cardBottom}>
//                         {item.discount > 0 ? (
//                           <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
//                             <Text style={{ fontSize: 14, fontWeight: 'bold', color: 'black' }}>₹ {finalPrice}</Text>
//                             <Text style={{ fontSize: 13, color: 'gray', textDecorationLine: 'line-through' }}>₹ {item.price}</Text>
//                           </View>
//                         ) : (
//                           <Text style={styles.cardPrice}>₹ {item.price}</Text>
//                         )}
//                       </View>
//                     </View>
//                   </View>

//                   {cartItems[item._id] > 0 ? (
//                     <View style={styles.qtyContainer}>
//                       <Pressable
//                         style={styles.qtyBtn}
//                         onPress={() => updateCartQuantity(item, cartItems[item._id] - 1)}
//                         disabled={cartItems[item._id] <= 0}
//                       >
//                         <Text style={styles.qtyBtnText}>-</Text>
//                       </Pressable>

//                       <Text style={styles.qtyValue}>{cartItems[item._id]}</Text>

//                       <Pressable
//                         style={[styles.qtyBtn, cartItems[item._id] >= item.stock && { backgroundColor: '#ccc' }]}
//                         onPress={() => updateCartQuantity(item, cartItems[item._id] + 1)}
//                         disabled={cartItems[item._id] >= item.stock}
//                       >
//                         <Text style={styles.qtyBtnText}>+</Text>
//                       </Pressable>
//                     </View>
//                   ) : (
//                     <LinearGradient colors={isOutOfStock ? ['#ccc', '#bbb'] : ['navy', 'navy']} style={styles.cartIcon}>
//                       <TouchableOpacity
//                         onPress={() => !isOutOfStock && updateCartQuantity(item, 1)}
//                         disabled={isOutOfStock}
//                       >
//                         <Text style={{ fontSize: 15, fontWeight: 'bold', color: 'white' }}>Add to cart</Text>
//                       </TouchableOpacity>
//                     </LinearGradient>
//                   )}
//                 </View>
//               </TouchableOpacity>
//             </LinearGradient>
//           );
//         }}
//       />
//     </ScrollView>
//   );
// }

// const Spec = ({ label, value }) => (
//   <View style={styles.specRow}>
//     <Text style={styles.specLabel}>{label}</Text>
//     <Text style={styles.specValue}>{value ?? '-'}</Text>
//   </View>
// );

{/* <LinearGradient style={styles.imageCard} colors={['white', 'white']}>
        <TouchableOpacity
          style={styles.favoriteIcon}
          onPress={() => {
            createWishlist();
            toggleLike(product._id || product.productId);
          }}
        >
          <Icon
            name={likedItems[product._id || product.productId] ? 'heart' : 'heart-outline'}
            size={26}
            color={likedItems[product._id || product.productId] ? '#e91e63' : '#ea1d68ff'}
          />
        </TouchableOpacity>

        <TouchableOpacity style={styles.shareIcon} onPress={onShare}>
          <Icon name="share-variant" size={18} color="#e67aa1" />
        </TouchableOpacity>

        <Swiper
          style={{ height: 250 }}
          showsPagination
          dotStyle={styles.dot}
          activeDotStyle={styles.activeDot}
          autoplay={false}        // ✅ No automatic slide change
          autoplayTimeout={0}     // ✅ Extra safety
          loop={false}            // ✅ Stop looping
          scrollEnabled={true}    // ✅ Allow manual swipe only
        >
          {/* 🖼️ Image slides */}
{/* {images.map((item, index) => (
            <View key={index} style={{ height: 250 }}>
              <TouchableOpacity
                style={{ flex: 1 }}
                onPress={() => {
                  setSelectedIndex(index);
                  setVisible(true);
                }}
              >
                <Image
                  source={{ uri: item.uri }}
                  style={styles.productImage}
                  resizeMode="cover"
                />
              </TouchableOpacity>
            </View>
          ))} */}

{/* 🎥 Video slide */ }
{/* {product.videoUrl && (
            <View key="video" style={{ height: 250, justifyContent: 'center', alignItems: 'center', backgroundColor: '#000' }}>
              <TouchableOpacity
                style={{ justifyContent: 'center', alignItems: 'center', flex: 1 }}
                onPress={() => {
                  setVideoVisible(true);
                  setPlaying(true);
                }}
              >
                <Icon name="play-circle" size={64} color="#fff" />
                <Text style={{ color: '#fff', marginTop: 8 }}>Watch Video</Text>
              </TouchableOpacity>
            </View>
          )}
        </Swiper> */}



{/* {Number(product.stock) === 0 ? (
          <View style={{ padding: 6, borderRadius: 15, alignItems: 'center', width: "30%", }}>

            <Text style={{ fontSize: 16, color: 'red', fontWeight: 'bold' }}>Out Of Stock</Text>
          </View>
        ) : null}

        <View style={styles.quantityRow}>

          <TouchableOpacity onPress={() => quantity > 1 && setQuantity(q => q - 1)} disabled={quantity === 1}>
            <Icon name="minus-circle" size={24} color={quantity === 1 ? '#ccc' : '#000'} />
          </TouchableOpacity>

          <Text style={styles.quantityText}>{quantity}</Text>

          <TouchableOpacity
            onPress={() => {
              if (quantity < (Number(product.stock) || 0)) setQuantity(q => q + 1);
              else {
                Toast.show({ type: 'info', text1: 'Stock Limit', text2: `Only ${product.stock} items available in stock.` });
              }
            }}
            disabled={quantity >= (Number(product.stock) || 0)}
          >
            <Icon name="plus-circle" size={24} color={quantity >= (Number(product.stock) || 0) ? '#ccc' : '#000'} />
          </TouchableOpacity>
        </View>
      </LinearGradient>

      <Modal visible={visible} transparent onRequestClose={() => setVisible(false)}>
        <ImageViewer
          imageUrls={images}
          index={selectedIndex}
          enableSwipeDown
          onSwipeDown={() => setVisible(false)}
        />
      </Modal>
      <Modal
        visible={videoVisible}
        transparent={false}
        animationType="slide"
        onRequestClose={() => {
          setVideoVisible(false);
          setPlaying(false);
        }}
      >
        <View style={{ flex: 1, backgroundColor: "black", justifyContent: "center" }}>
          <TouchableOpacity
            style={{ position: "absolute", top: 40, left: 20, zIndex: 1 }}
            onPress={() => {
              setVideoVisible(false);
              setPlaying(false);
            }}
          >
            <Icon name="close" size={30} color="#fff" />
          </TouchableOpacity>

          <YoutubePlayer
            height={300}
            play={playing}
            videoId={getYoutubeId(product.videoUrl) || ""}  // ✅ Fallback empty string
            onChangeState={(state) => {
              if (state === "ended") {
                setPlaying(false);
                setVideoVisible(false);
              }
            }}
          />
        </View>
      </Modal>

      <View style={styles.productDetails}>
        <View style={styles.titleRow}>
          <Text style={styles.cardTitle1} numberOfLines={2} ellipsizeMode="tail">
            {product.productName}
          </Text>
        </View>
        <View style={{ flexDirection: "row", alignItems: 'center', left: 14 }}>
          <Text style={styles.priceText}>
            ₹ {Math.round(discountPrice)}
          </Text>

          <Text
            style={{
              fontSize: 15,
              color: 'gray',
              textDecorationLine: 'line-through',
            }}
          >
            ₹ {Math.round(mainPrice)}
          </Text>
          <View style={styles.discountBadge}>
            <Text style={{ fontSize: 13, color: 'navy' }}>{product.discount ?? 0}% OFF</Text>
          </View>

        </View>

        <Text style={styles.description}>{product.description}</Text>

        <TouchableOpacity onPress={addCart} disabled={mainLoading}>
          <LinearGradient colors={['#ff4da6', '#ff4da6']} style={styles.cartButton}>
            {mainLoading ? <ActivityIndicator size="small" color="#fff" /> : <Text style={styles.cartButtonText}>Add to Cart</Text>}
          </LinearGradient>
        </TouchableOpacity>
      </View>

      <View style={styles.specCard}>
        <View style={styles.specs}>
          <Spec label="Size" value={product.size} />
          <Spec label="Material" value={product.material} />
          <Spec label="Color" value={product.color} />
          <Spec label="Item Weight" value={product.unit} />
          <Spec label="Age Suitability" value={`${product.age} Years`} />
          <Spec label="Shipping" value={"Free"} />
        </View>
      </View> */}
