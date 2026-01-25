import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import WorkerDashboardScreen from '../screens/WorkerDashboardScreen';
import AttendanceScreen from '../screens/AttendanceScreen';
import TaskListScreen from '../screens/TaskListScreen';
import IssuesListScreen from '../screens/IssuesListScreen';
import ReportIssueScreen from '../screens/ReportIssueScreen';
import FaceEnrollmentScreen from '../screens/FaceEnrollmentScreen';
import BiometricAttendanceScreen from '../screens/BiometricAttendanceScreen';
import FaceScreen from '../screens/FaceScreen';
// import ProfileScreen from '../screens/ProfileScreen'; // To be implemented
import CustomTabBar from '../components/CustomTabBar';

import { colors } from '../constants/colors';

const Tab = createBottomTabNavigator();

const WorkerStack = () => {
    return (
        <Tab.Navigator
            tabBar={props => <CustomTabBar {...props} />}
            screenOptions={({ route }) => ({
                headerStyle: { backgroundColor: colors.headerBackground },
                headerTintColor: colors.headerTint,
                tabBarActiveTintColor: colors.tabBarActive, // Yellow
                tabBarInactiveTintColor: colors.tabBarInactive,
                headerShown: false,
                tabBarIcon: () => <Ionicons name="home" /> // Placeholder
            })}
        >
            <Tab.Screen name="Dashboard" component={WorkerDashboardScreen} />
            <Tab.Screen name="Attendance" component={AttendanceScreen} />
            <Tab.Screen name="Tasks" component={TaskListScreen} />
            <Tab.Screen name="Issues" component={IssuesListScreen} />
            <Tab.Screen name="Face" component={FaceScreen} options={{
                tabBarIcon: ({ color, size }) => <Ionicons name="scan" size={size} color={color} />
            }} />
            <Tab.Screen name="ReportIssue" component={ReportIssueScreen} options={{ tabBarButton: () => null }} />
            <Tab.Screen name="FaceEnrollment" component={FaceEnrollmentScreen} options={{ tabBarButton: () => null }} />
            <Tab.Screen name="BiometricAttendance" component={BiometricAttendanceScreen} options={{ tabBarButton: () => null }} />
            {/* <Tab.Screen name="Profile" component={ProfileScreen} /> */}
        </Tab.Navigator>
    );
};

export default WorkerStack;