import { View, Text, ImageBackground, TouchableOpacity, ActivityIndicator, Image } from 'react-native';
import React, { useState } from 'react';
// import LottieView from 'lottie-react-native';


export default function Network({ navigation }) {
    const [loading, setLoading] = useState(false);


    const handleRetry = () => {
        setLoading(true);
        setTimeout(() => {
            navigation.navigate("Main")
            setLoading(false);
        }, 2000);
    };


    return (
        <View style={{ backgroundColor: 'white', flex: 1, justifyContent: 'center' }}>
            {/* <ImageBackground
                source={require('../Image/RK.png')}
                resizeMode="cover"
                style={{ flex: 1, justifyContent: 'center' }}
            > */}
            <View style={{ alignItems: "center", bottom: 10 }}>
                <Image style={{
                    width: 280,
                    height: 250,
                    marginTop: 30,
                    borderRadius: 25
                }} source={require('../Images/nonet.png')} />
            </View>
            <Text style={{ fontSize: 25, textAlign: 'center', color: '#ff4da6', fontWeight: '600' }}>
                Connection Lost 📡
            </Text>
            <Text style={{ fontSize: 15, textAlign: 'center', color: '#ff4da6', marginTop: 8, paddingHorizontal: 20, fontWeight: '600' }}>
                Don’t worry, it happens! Check your internet and try again.
            </Text>



            <TouchableOpacity
                style={{
                    backgroundColor: 'navy',
                    width: '30%',
                    alignSelf: 'center',
                    borderRadius: 10,
                    marginBottom: 80,
                    marginTop: 20,
                    flexDirection: 'row',
                    justifyContent: 'center',
                    alignItems: 'center',
                    paddingVertical: 7,
                }}
                onPress={handleRetry}
                disabled={loading}
            >
                {loading ? (
                    <ActivityIndicator color="white" />
                ) : (
                    <Text
                        style={{
                            fontSize: 16,
                            color: 'white',
                            textAlign: 'center',
                            fontWeight: 'bold',
                        }}
                    >
                        Try Again
                    </Text>
                )}
            </TouchableOpacity>
            {/* </ImageBackground> */}
        </View>
    );
}
