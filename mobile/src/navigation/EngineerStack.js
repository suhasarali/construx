import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import EngineerDashboardScreen from '../screens/EngineerDashboardScreen';
import AttendanceManagementScreen from '../screens/AttendanceManagementScreen';
import TaskManagementScreen from '../screens/TaskManagementScreen';
import RequestScreen from '../screens/RequestScreen';
import DPRScreen from '../screens/DPRScreen';
import CommunicationScreen from '../screens/CommunicationScreen';

const Tab = createBottomTabNavigator();

const EngineerStack = () => {
    return (
        <Tab.Navigator
             screenOptions={({ route }) => ({
                tabBarIcon: ({ focused, color, size }) => {
                    let iconName;
                    if (route.name === 'Dashboard') iconName = focused ? 'home' : 'home-outline';
                    else if (route.name === 'Team') iconName = focused ? 'people' : 'people-outline';
                    else if (route.name === 'Tasks') iconName = focused ? 'clipboard' : 'clipboard-outline';
                    return <Ionicons name={iconName} size={size} color={color} />;
                },
            })}
        >
            <Tab.Screen name="Dashboard" component={EngineerDashboardScreen} />
            <Tab.Screen name="AttendanceManagement" component={AttendanceManagementScreen} options={{ tabBarLabel: 'Team', tabBarIcon: ({color}) => <Ionicons name="people" size={24} color={color} /> }} />
            <Tab.Screen name="TaskManagement" component={TaskManagementScreen} options={{ tabBarLabel: 'Tasks', tabBarIcon: ({color}) => <Ionicons name="clipboard" size={24} color={color} /> }} />
            <Tab.Screen name="Requests" component={RequestScreen} options={{ tabBarButton: () => null }} />
            <Tab.Screen name="DPR" component={DPRScreen} options={{ tabBarButton: () => null }} />
            <Tab.Screen name="Communication" component={CommunicationScreen} options={{ tabBarButton: () => null }} />
        </Tab.Navigator>
    );
};

export default EngineerStack;
