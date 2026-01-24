import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import WorkerDashboardScreen from '../screens/WorkerDashboardScreen';
import AttendanceScreen from '../screens/AttendanceScreen';
import TaskListScreen from '../screens/TaskListScreen';
// import ProfileScreen from '../screens/ProfileScreen'; // To be implemented

import { colors } from '../constants/colors';

const Tab = createBottomTabNavigator();

const WorkerStack = () => {
    return (
        <Tab.Navigator
            screenOptions={({ route }) => ({
                headerStyle: { backgroundColor: colors.headerBackground },
                headerTintColor: colors.headerTint,
                tabBarActiveTintColor: colors.tabBarActive, // Yellow
                tabBarInactiveTintColor: colors.tabBarInactive,
                tabBarIcon: ({ focused, color, size }) => {
                    let iconName;
                    if (route.name === 'Dashboard') iconName = focused ? 'home' : 'home-outline';
                    else if (route.name === 'Attendance') iconName = focused ? 'time' : 'time-outline';
                    else if (route.name === 'Tasks') iconName = focused ? 'list' : 'list-outline';
                    else if (route.name === 'Profile') iconName = focused ? 'person' : 'person-outline';
                    return <Ionicons name={iconName} size={size} color={color} />;
                },
            })}
        >
            <Tab.Screen name="Dashboard" component={WorkerDashboardScreen} />
            <Tab.Screen name="Attendance" component={AttendanceScreen} />
            <Tab.Screen name="Tasks" component={TaskListScreen} />
            {/* <Tab.Screen name="Profile" component={ProfileScreen} /> */}
        </Tab.Navigator>
    );
};

export default WorkerStack;
