import React, { useContext } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { ActivityIndicator, View, Text } from 'react-native';
import { AuthContext } from '../context/AuthContext';
import LoginScreen from '../screens/LoginScreen';

// Placeholder Screens for now
const HomeScreen = () => (
    <View style={{flex:1, justifyContent:'center', alignItems:'center'}}>
        <Text>Welcome Home</Text>
    </View>
);

const Stack = createStackNavigator();

import WorkerDashboardScreen from '../screens/WorkerDashboardScreen';
import ManagerDashboardScreen from '../screens/ManagerDashboardScreen';
import EngineerDashboardScreen from '../screens/EngineerDashboardScreen';

const AppNavigator = () => {
    const { userToken, userInfo, isLoading } = useContext(AuthContext);

    if (isLoading) {
        return (
            <View style={{flex:1, justifyContent:'center', alignItems:'center'}}>
                <ActivityIndicator size="large" />
            </View>
        );
    }

    return (
        <NavigationContainer>
            <Stack.Navigator screenOptions={{ headerShown: false }}>
                {userToken === null ? (
                    <Stack.Screen name="Login" component={LoginScreen} />
                ) : (
                    userInfo?.role === 'Worker' ? (
                        <Stack.Screen name="WorkerHome" component={WorkerDashboardScreen} />
                    ) : userInfo?.role === 'Engineer' ? (
                        <Stack.Screen name="EngineerHome" component={EngineerDashboardScreen} />
                    ) : (
                        <Stack.Screen name="ManagerHome" component={ManagerDashboardScreen} />
                    )
                )}
            </Stack.Navigator>
        </NavigationContainer>
    );
};

export default AppNavigator;
