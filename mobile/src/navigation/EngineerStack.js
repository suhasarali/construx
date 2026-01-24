import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import EngineerDashboardScreen from '../screens/EngineerDashboardScreen';
import AttendanceManagementScreen from '../screens/AttendanceManagementScreen';
import TaskManagementScreen from '../screens/TaskManagementScreen';
import RequestScreen from '../screens/RequestScreen';
import DPRScreen from '../screens/DPRScreen';
import CommunicationScreen from '../screens/CommunicationScreen';
import IssuesListScreen from '../screens/IssuesListScreen';
import ReportIssueScreen from '../screens/ReportIssueScreen';
import CustomTabBar from '../components/CustomTabBar'; // Import CustomTabBar

import { colors } from '../constants/colors';

const Tab = createBottomTabNavigator();

const EngineerStack = () => {
    return (
        <Tab.Navigator
            tabBar={props => <CustomTabBar {...props} />} // Use CustomTabBar
            screenOptions={({ route }) => ({
                headerStyle: { backgroundColor: colors.headerBackground },
                headerTintColor: colors.headerTint,
                tabBarActiveTintColor: colors.tabBarActive,
                tabBarInactiveTintColor: colors.tabBarInactive,
                // Keep tabBarIcon logic or ensure options.tabBarIcon is set so CustomTabBar logic triggers if it relies on it check
                tabBarIcon: ({ focused, color, size }) => {
                    // Placeholder to satisfy CustomTabBar check
                    return <Ionicons name="home" />;
                },
                headerShown: false // Often modern apps hide default header or make it transparent
            })}
        >
            <Tab.Screen name="Dashboard" component={EngineerDashboardScreen} />
            <Tab.Screen name="AttendanceManagement" component={AttendanceManagementScreen} options={{ tabBarLabel: 'Team' }} />
            <Tab.Screen name="TaskManagement" component={TaskManagementScreen} options={{ tabBarLabel: 'Tasks' }} />
            <Tab.Screen name="Requests" component={RequestScreen} options={{ tabBarButton: () => null }} />
            <Tab.Screen name="DPR" component={DPRScreen} options={{ tabBarButton: () => null }} />
            <Tab.Screen name="Communication" component={CommunicationScreen} options={{ tabBarButton: () => null }} />
            <Tab.Screen name="Issues" component={IssuesListScreen} />
            <Tab.Screen name="ReportIssue" component={ReportIssueScreen} options={{ tabBarButton: () => null }} />
        </Tab.Navigator>
    );
};

export default EngineerStack;