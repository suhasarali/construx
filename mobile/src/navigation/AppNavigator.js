import React, { useContext } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { ActivityIndicator, View, Text } from 'react-native';
import { AuthContext } from '../context/AuthContext';
import LoginScreen from '../screens/LoginScreen';
import WorkerStack from './WorkerStack';
import EngineerStack from './EngineerStack';
import DailyWorkScreen from '../screens/DailyWorkScreen';
import CommunicationScreen from '../screens/CommunicationScreen';
const HomeScreen = () => (
    <View style={{flex:1, justifyContent:'center', alignItems:'center'}}>
        <Text>Welcome Home</Text>
    </View>
);

const Stack = createStackNavigator();

const AppNavigator = () => {
    const { isLoading, userToken, userInfo } = useContext(AuthContext);

    if (isLoading) {
        return (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                <ActivityIndicator size="large" color="#FFC107" />
            </View>
        );
    }

    return (
        <NavigationContainer>
            <Stack.Navigator screenOptions={{ headerShown: false }}>
                {userToken ? (
                    userInfo?.role === 'Worker' ? (
                        <>
                            <Stack.Screen name="WorkerHome" component={WorkerStack} />
                            <Stack.Screen name="DailyWork" component={DailyWorkScreen} />
                            <Stack.Screen name="Communication" component={CommunicationScreen} />
                        </>
                    ) : (
                        <Stack.Screen name="EngineerHome" component={EngineerStack} />
                    )
                ) : (
                    <Stack.Screen name="Login" component={LoginScreen} />
                )}
            </Stack.Navigator>
        </NavigationContainer>
    );
};

export default AppNavigator;
