import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    FlatList,
    Modal,
    StyleSheet,
    SafeAreaView,
    Alert,
    ActivityIndicator,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import LinearGradient from 'react-native-linear-gradient';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Toast from 'react-native-toast-message';

const AddressScreen = ({ navigation }) => {
    const [customers, setCustomers] = useState([]);
    const [loading, setLoading] = useState(false);
    const [modalVisible, setModalVisible] = useState(false);
    const [selectedType, setSelectedType] = useState('Home');
    const [isPincodeValid, setIsPincodeValid] = useState(true);
    const [allowedPincodes, setAllowedPincodes] = useState([]);
    const [formData, setFormData] = useState({
        apartment: '',
        building: '',
        street: '',
        city: '',
        pincode: '',
        state: '',
    });

    // 🔑 Reset Form Helper
    const resetForm = () => {
        setFormData({
            apartment: '',
            building: '',
            street: '',
            city: '',
            pincode: '',
            state: '',
        });
        setSelectedType('Home');
    };

    useEffect(() => {
        getCustomers();
        fetchAllowedPincodes();
    }, []);

    const getCustomers = async () => {
        const customerid = await AsyncStorage.getItem('id');
        if (!customerid) {
            Alert.alert('Error', 'User not logged in.');
            return;
        }
        setLoading(true);
        try {
            const response = await fetch(
                `https://apis.toyshack.in/App/customers/Customers-data?_id=${customerid}`,
                { method: 'GET', headers: { 'Content-Type': 'application/json' } }
            );
            const data = await response.json();
            if (data.success && Array.isArray(data.response)) {
                setCustomers(data.response);
            } else {
                console.warn('Unexpected response:', data);
                Alert.alert('Error', 'Failed to load addresses.');
            }
        } catch (error) {
            console.error('Error fetching customers:', error);
            Alert.alert('Error', 'Could not fetch data.');
        } finally {
            setLoading(false);
        }
    };

    const fetchAllowedPincodes = async () => {
        try {
            const res = await fetch(
                'https://apis.toyshack.in/App/deliverypincode/all-delivery-pincodes'
            );
            const data = await res.json();
            setAllowedPincodes(data.map(item => item.pincode.toString()));
        } catch (err) {
            console.error('Error fetching delivery pincodes:', err);
        }
    };

    const validatePincode = (text) => {
        setFormData(prev => ({ ...prev, pincode: text }));
        const regex = /^[0-9]{6}$/;
        if (!regex.test(text) || !allowedPincodes.includes(text)) {
            setIsPincodeValid(false);
        } else {
            setIsPincodeValid(true);
        }
    };

    const addresses = customers.length > 0 ? customers[0].address : [];

    const AddressCard = ({ item }) => (
        <View style={styles.card}>

            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                <View style={styles.cardHeader}>
                    <Text style={styles.cardTitle}>{item.label}</Text>
                </View>
                <TouchableOpacity
                    style={styles.closeButtonText}
                    onPress={() => handleDeleteAddress(item._id)}
                >
                    <Icon name="delete-empty" size={22} color="#ff3b3b" />
                </TouchableOpacity>
            </View>
            <View style={styles.cardBody}>
                <Icon name="map-marker-account" size={34} color="#ff4fd8" />
                <Text style={styles.cardText}>
                    {item.line1}
                    {item.line2 ? ', ' + item.line2 : ''}
                    {', ' + item.city} - {item.pincode}, {item.state}, {item.country}
                </Text>
            </View>
        </View>
    );

  const handleDeleteAddress = async (addressId) => {
    Alert.alert(
        "Delete Address",
        "Are you sure you want to delete this address?",
        [
            { text: "Cancel", style: "cancel" },
            {
                text: "Delete",
                style: "destructive",
                onPress: async () => {
                    try {
                        const customerId = await AsyncStorage.getItem('id');
                        if (!customerId) {
                            Toast.show({
                                type: 'error',
                                text1: 'Error',
                                text2: 'User not logged in.'
                            });
                            return;
                        }
                        const response = await fetch(
                            `https://apis.toyshack.in/App/customers/customer-address/${customerId}/${addressId}`,
                            { method: 'DELETE' }
                        );
                        const data = await response.json();

                        if (response.ok) {
                            Toast.show({
                                type: 'success',
                                text1: 'Deleted',
                                text2: data.message || 'Address deleted successfully.'
                            });
                            setCustomers((prev) => {
                                if (prev.length === 0) return prev;
                                const updatedCustomer = { ...prev[0] };
                                updatedCustomer.address = updatedCustomer.address.filter(
                                    (addr) => addr._id !== addressId
                                );
                                return [updatedCustomer];
                            });
                        } else {
                            Toast.show({
                                type: 'error',
                                text1: 'Error',
                                text2: data.error || 'Could not delete address.'
                            });
                        }
                    } catch (error) {
                        console.error('Error deleting address:', error);
                        Toast.show({
                            type: 'error',
                            text1: 'Error',
                            text2: 'Something went wrong.'
                        });
                    }
                },
            },
        ]
    );
};


    const submitAddressToBackend = async () => {
        if (
            !formData.apartment.trim() ||
            !formData.building.trim() ||
            !formData.city.trim() ||
            !formData.pincode.trim() ||
            !formData.state.trim()
        ) {
            Toast.show({
                type: 'error',
                text1: 'Validation',
                text2: 'Please fill all required fields.'
            });
            return;
        }
        if (!isPincodeValid) {
            Toast.show({
                type: 'error',
                text1: 'Validation',
                text2: 'Please enter a valid 6-digit pincode.'
            });
            return;
        }
        try {
            const userId = await AsyncStorage.getItem('id');
            if (!userId) {
                Toast.show({
                    type: 'error',
                    text1: 'Error',
                    text2: 'User not logged in.'
                });
                return;
            }
            setLoading(true);

            const addressObj = {
                label: selectedType,
                line1: formData.apartment + ', ' + formData.building,
                line2: formData.street,
                city: formData.city,
                state: formData.state || 'Unknown',
                pincode: formData.pincode,
                country: 'India',
            };

            const response = await fetch(
                'https://apis.toyshack.in/App/customers/customer-update',
                {
                    method: 'PUT',
                    headers: {
                        Accept: 'application/json',
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        _id: userId,
                        address: addressObj,
                    }),
                }
            );

            const data = await response.json();

            if (response.ok) {
                Toast.show({
                    type: 'success',
                    text1: 'Success',
                    text2: data.message || 'Address saved!'
                });
                setModalVisible(false);
                getCustomers();
                resetForm(); // 🟢 Clear inputs after save
            } else {
                Toast.show({
                    type: 'error',
                    text1: 'Error',
                    text2: data.error || 'Something went wrong.'
                });
            }
        } catch (error) {
            console.error('Exception while saving address:', error);
            Toast.show({
                type: 'error',
                text1: 'Error',
                text2: 'Something went wrong.'
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <LinearGradient colors={['white', 'white']} style={styles.container}>
            <SafeAreaView style={{ flex: 1 }}>
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => navigation.goBack()}>
                        <Icon name="menu-left" size={36} color="#000" />
                    </TouchableOpacity>
                    <Text style={styles.headerText}>My Address</Text>
                </View>

                {/* {loading && <ActivityIndicator size="large" color="#9b4fff" />} */}

                <FlatList
                    data={addresses}
                    keyExtractor={(item) => item._id}
                    contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 20 }}
                    renderItem={({ item }) => <AddressCard item={item} />}
                    ListEmptyComponent={
                        !loading && (
                            <Text style={{ textAlign: 'center', marginTop: 20 }}>
                                No addresses found. Please add one.
                            </Text>
                        )
                    }
                />

                <TouchableOpacity
                    activeOpacity={0.7}
                    onPress={() => setModalVisible(true)}
                    style={{ margin: 20 }}
                >
                    <LinearGradient
                        colors={['navy', 'navy']} start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                        style={styles.addButton}
                    >
                        <Text style={styles.addButtonText}>Add Address</Text>
                    </LinearGradient>
                </TouchableOpacity>

                <Modal visible={modalVisible} transparent animationType="slide">
                    <View style={styles.modalContainer}>
                        <LinearGradient
                            colors={['#dff6fd', '#f8e3f9']}
                            style={styles.modalContent}
                        >
                            <TouchableOpacity
                                onPress={() => {
                                    setModalVisible(false);
                                    resetForm(); // 🟢 Reset when closing modal
                                }}
                                style={styles.closeButton}
                            >
                                <Text style={styles.closeButtonText}>×</Text>
                            </TouchableOpacity>

                            <Text style={styles.sectionTitle}>Save this Address as</Text>
                            <View style={styles.typeSelector}>
                                {['Home', 'Work', 'Other'].map((type) => (
                                    <TouchableOpacity
                                        key={type}
                                        onPress={() => setSelectedType(type)} // ✅ fixed
                                        style={[
                                            styles.typeButton,
                                            selectedType === type && styles.selectedTypeButton,
                                        ]}
                                    >
                                        {selectedType === type ? (
                                            <LinearGradient
                                                colors={['#ff4fd8', '#ff4fd8']}
                                                style={styles.gradientButton}
                                            >
                                                <Text style={styles.selectedText}>{type}</Text>
                                            </LinearGradient>
                                        ) : (
                                            <Text style={styles.typeText}>{type}</Text>
                                        )}
                                    </TouchableOpacity>
                                ))}
                            </View>

                            <Text style={styles.sectionTitle}>Add Address</Text>

                            <View style={styles.row}>
                                <TextInput
                                    placeholder="Apartment No."
                                    style={[styles.input, { flex: 1, marginRight: 5 }]}
                                    value={formData.apartment}
                                     placeholderTextColor="black"
                                    onChangeText={(text) =>
                                        setFormData((prev) => ({ ...prev, apartment: text }))
                                    }
                                />
                                <TextInput
                                    placeholder="Building Name"
                                    style={[styles.input, { flex: 1, marginLeft: 5 }]}
                                    value={formData.building}
                                     placeholderTextColor="black"
                                    onChangeText={(text) =>
                                        setFormData((prev) => ({ ...prev, building: text }))
                                    }
                                />
                            </View>

                            <TextInput
                                placeholder="Street Name/Area"
                                style={styles.input}
                                value={formData.street}
                                 placeholderTextColor="black"
                                onChangeText={(text) =>
                                    
                                    setFormData((prev) => ({ ...prev, street: text }))
                                }
                            />

                            <View style={styles.row}>
                                <TextInput
                                    placeholder="City"
                                    style={[styles.input, { flex: 1, marginRight: 5 }]}
                                    value={formData.city}
                                     placeholderTextColor="black"
                                    onChangeText={(text) =>
                                        setFormData((prev) => ({ ...prev, city: text }))
                                    }
                                />
                                <TextInput
                                    placeholder="Pincode"
                                    style={[
                                        styles.input,
                                        !isPincodeValid && { borderColor: 'red', borderWidth: 1 },
                                    ]}
                                     placeholderTextColor="black"
                                    value={formData.pincode}
                                    keyboardType="numeric"
                                    maxLength={6}
                                    onChangeText={validatePincode}
                                />
                            </View>

                            <TextInput
                                placeholder="State"
                                style={styles.input}
                                value={formData.state}
                                 placeholderTextColor="black"
                                onChangeText={(text) =>
                                    setFormData((prev) => ({ ...prev, state: text }))
                                }
                            />

                            <LinearGradient
                                colors={['navy', 'navy']}
                                style={[styles.addButton, { marginTop: 20 }]}
                            >
                                <TouchableOpacity
                                    onPress={submitAddressToBackend}
                                    disabled={loading} // disable while loading
                                    style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}
                                >
                                    {loading ? (
                                        <ActivityIndicator size="small" color="#fff" />
                                    ) : (
                                        <Text style={styles.addButtonText}>
                                            Save Address
                                        </Text>
                                    )}
                                </TouchableOpacity>
                            </LinearGradient>
                        </LinearGradient>
                    </View>
                </Modal>
            </SafeAreaView>
        </LinearGradient>
    );
};
const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        flexDirection: 'row',
        padding: 20,
        alignItems: 'center',
        marginTop: 20
    },
    headerText: {
        fontSize: 18,
        marginLeft: 10,
        fontWeight: '600',
    },
    card: {
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 15,
        marginBottom: 15,
        elevation: 4,
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 10,
    },
    cardTitle: {
        color: '#ff4fd8',
        fontWeight: 'bold',
        fontSize: 16,
    },
    cardBody: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    cardText: {
        marginLeft: 8,
        color: '#333',
        flex: 1,
    },
    addButton: {
        margin: 20,
        borderRadius: 30,
        paddingVertical: 12,
        alignItems: 'center',
        justifyContent: 'center',
    },
    addButtonText: {
        color: '#fff',
        fontWeight: '600',
        fontSize: 16,
    },
    modalContainer: {
        flex: 1,
        justifyContent: 'flex-end',
        backgroundColor: '#00000070',
    },
    modalContent: {
        borderTopLeftRadius: 30,
        borderTopRightRadius: 30,
        padding: 20,
    },
    closeButton: {
        position: 'absolute',
        top: 10,
        right: 10,
        zIndex: 1,
        backgroundColor: '#fff',
        borderRadius: 15,
        width: 30,
        height: 30,
        justifyContent: 'center',
        alignItems: 'center',
        elevation: 3,
    },
    closeButtonText: {
        color: '#333',
        fontSize: 22,
        lineHeight: 22,
    },
    sectionTitle: {
        fontWeight: 'bold',
        fontSize: 16,
        marginBottom: 10,
    },
    typeSelector: {
        flexDirection: 'row',
        marginBottom: 20,
        justifyContent: 'space-between',
    },
    typeButton: {
        flex: 1,
        marginHorizontal: 4,
    },
    gradientButton: {
        paddingVertical: 10,
        borderRadius: 10,
        alignItems: 'center',
    },
    selectedTypeButton: {
        borderRadius: 10,
        overflow: 'hidden',
    },
    selectedText: {
        color: '#fff',
        fontWeight: '600',
    },
    typeText: {
        textAlign: 'center',
        paddingVertical: 10,
        borderRadius: 10,
        backgroundColor: '#fff',
        color: '#333',
        fontWeight: '600',
    },
    input: {
        backgroundColor: '#fff',
        borderRadius: 10,
        paddingHorizontal: 12,
        paddingVertical: 10,
        marginBottom: 10,
        color: '#000'
    },
    row: {
        flexDirection: 'row',
        marginBottom: 10,
        justifyContent: 'space-between'
    },
});

export default AddressScreen;
