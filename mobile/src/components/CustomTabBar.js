import { View, StyleSheet, TouchableOpacity, Platform, Text } from 'react-native';
// import { BlurView } from 'expo-blur'; // Removing missing dependency
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../constants/colors';

const CustomTabBar = ({ state, descriptors, navigation }) => {
    return (
        <View style={styles.container}>
            <View style={styles.blurView}>
                <View style={styles.tabBar}>
                    {state.routes.map((route, index) => {
                        const { options } = descriptors[route.key];

                        // Skip hidden tabs (where tabBarButton returns null)
                        if (options.tabBarButton) {
                            const isHidden = options.tabBarButton() === null;
                            if (isHidden) return null;
                        }

                        const label =
                            options.tabBarLabel !== undefined
                                ? options.tabBarLabel
                                : options.title !== undefined
                                    ? options.title
                                    : route.name;

                        const isFocused = state.index === index;

                        const onPress = () => {
                            const event = navigation.emit({
                                type: 'tabPress',
                                target: route.key,
                                canPreventDefault: true,
                            });

                            if (!isFocused && !event.defaultPrevented) {
                                navigation.navigate(route.name);
                            }
                        };

                        const onLongPress = () => {
                            navigation.emit({
                                type: 'tabLongPress',
                                target: route.key,
                            });
                        };

                        // Icon Logic
                        let iconName = 'square';
                        if (options.tabBarIcon) {
                            if (route.name === 'Dashboard') iconName = isFocused ? 'home' : 'home-outline';
                            else if (route.name === 'Team' || route.name === 'AttendanceManagement') iconName = isFocused ? 'people' : 'people-outline';
                            else if (route.name === 'Tasks' || route.name === 'TaskManagement' || route.name === 'TaskList') iconName = isFocused ? 'clipboard' : 'clipboard-outline';
                            else if (route.name === 'Attendance') iconName = isFocused ? 'time' : 'time-outline';
                            else if (route.name === 'Issues') iconName = isFocused ? 'alert-circle' : 'alert-circle-outline';
                            else if (route.name === 'Profile') iconName = isFocused ? 'person' : 'person-outline';
                        }

                        return (
                            <TouchableOpacity
                                key={index}
                                accessibilityRole="button"
                                accessibilityState={isFocused ? { selected: true } : {}}
                                accessibilityLabel={options.tabBarAccessibilityLabel}
                                testID={options.tabBarTestID}
                                onPress={onPress}
                                onLongPress={onLongPress}
                                style={styles.tabItem}
                            >
                                <Ionicons
                                    name={iconName}
                                    size={28}
                                    color={isFocused ? colors.primary : colors.textSecondary}
                                />
                                {isFocused && <View style={styles.activeDot} />}
                                <Text style={[styles.label, { color: isFocused ? colors.primary : colors.textSecondary }]}>
                                    {label}
                                </Text>
                            </TouchableOpacity>
                        );
                    })}
                </View>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        position: 'absolute',
        bottom: 30, // Floating from bottom
        left: 20,
        right: 20,
        borderRadius: 35,
        overflow: 'hidden',
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 10,
        },
        shadowOpacity: 0.3,
        shadowRadius: 20,
        elevation: 5,
    },
    blurView: {
        paddingVertical: 10,
        backgroundColor: colors.surface, // Solid background
        borderRadius: 35,
        borderWidth: 1,
        borderColor: colors.border
    },
    tabBar: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        alignItems: 'center',
    },
    tabItem: {
        alignItems: 'center',
        justifyContent: 'center',
        height: 60, // Increased height for label
        width: 60,
    },
    activeDot: {
        width: 4,
        height: 4,
        borderRadius: 2,
        backgroundColor: colors.primary,
        marginTop: 4,
    },
    label: {
        fontSize: 10,
        fontWeight: '600',
        marginTop: 2
    }
});

export default CustomTabBar;
