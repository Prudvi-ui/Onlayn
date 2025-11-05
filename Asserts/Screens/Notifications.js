import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  SafeAreaView,
  StatusBar,
  TouchableOpacity,
  Alert,
  ActivityIndicator
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import AsyncStorage from '@react-native-async-storage/async-storage'; // ✅ Missing import

export default function NotificationScreen({ navigation }) {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);

  const getNotifications = async () => {
    const customerid = await AsyncStorage.getItem('id');
    console.log("===>", customerid);
    setLoading(true);
    try {
      const response = await fetch('https://apis.toyshack.in/App/notifications/all-notifications');
      if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
      const result = await response.json();

      console.log('Server Response:', result);

      if (Array.isArray(result.notifications)) {
        const filterData = result.notifications.filter(item => item.customerId === customerid);
        console.log("Filtered Notifications:", filterData);
        setNotifications(filterData); // ✅ Use filtered data
      } else {
        Alert.alert('Error', 'Invalid response format.');
      }
    } catch (error) {
      console.error('Fetch Error:', error);
      Alert.alert('Error', 'Failed to fetch notifications.');
    } finally {
      setLoading(false);
    }
  };

  const deleteNotification = async (notificationId) => {
    try {
  
      const url = `https://apis.toyshack.in/App/Notifications/delete-notification/${notificationId}`;
      console.log("🔗 Deleting URL:", url);

      const response = await fetch(url, { method: "DELETE" });

      // Get raw text first (avoid crash on HTML response)
      const text = await response.text();
      console.log("🧾 Raw Delete Response:", response.status, text);

      let responseData;
      try {
        responseData = JSON.parse(text); // Try to parse JSON
      } catch (e) {
        console.warn("⚠️ Response not JSON:", text.substring(0, 100));
        Alert.alert("Error", "Server did not return JSON");
        return;
      }

      if (response.ok && responseData.message === "Notification deleted successfully.") {
        setNotifications((prev) => prev.filter((n) => n._id !== notificationId));
      } else {
        Alert.alert("Error", responseData.error || "Failed to delete notification");
      }
    } catch (error) {
      console.error("❌ Delete Error:", error);
      Alert.alert("Error", "Something went wrong while deleting");
    }
  };

  const NotificationItem = ({ item }) => (
    <View style={styles.card}>
      <View style={styles.iconContainer}>
        <Icon name="bell-circle-outline" size={30} color="navy" />
      </View>
      <View style={styles.textContainer}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
          <Text style={styles.title}>{item.notificationTitle}</Text>
          <Text style={styles.time}>{item.time}</Text>
        </View>
        <View style={{ flexDirection: 'row', margin: 5, alignItems: 'center' }}>
          <Text style={[styles.message, { flex: 1 }]}>{item.message}</Text>
          <TouchableOpacity onPress={() => deleteNotification(item._id)}>
            <Icon name="delete" size={24} color="#ff4fd8" />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  useEffect(() => {
    getNotifications();
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Icon name="menu-left" size={34} />
        </TouchableOpacity>
        <Text style={styles.headerText}>Notification</Text>
      </View>

      {loading ? (
        <ActivityIndicator size="large" color="navy" style={{ marginTop: 350 }} />
      ) : (
        <FlatList
          data={notifications}
          keyExtractor={(item) => item._id?.toString() || Math.random().toString()} // ✅ Safe key
          renderItem={({ item }) => <NotificationItem item={item} />}
          contentContainerStyle={styles.list}
          ListEmptyComponent={<Text style={{ textAlign: 'center', marginTop: 350 }}>No notifications found.</Text>}
        />
      )}
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
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 12,
    marginTop: 38,
  },
  headerText: {
    fontSize: 18,
    fontWeight: '600',
    marginLeft: 10,
  },
  list: {
    paddingHorizontal: 16,
    paddingTop: 10,
  },
  card: {
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 15,
    marginBottom: 12,
    flexDirection: 'row',
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2,
  },
  iconContainer: {
    marginRight: 10,
    marginTop: 3,
  },
  textContainer: {
    flex: 1,
  },
  title: {
    fontWeight: 'bold',
    fontSize: 14,
    marginBottom: 2,
  },
  message: {
    fontSize: 13,
    color: '#555',
  },
  time: {
    fontSize: 11,
    color: '#888',
    marginTop: 3,
    marginLeft: 5,
  },
});
