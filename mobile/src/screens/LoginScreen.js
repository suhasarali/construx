import { useState, useContext } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator, Image } from 'react-native';
import { AuthContext } from '../context/AuthContext';
import { colors } from '../constants/colors';
import { Ionicons } from '@expo/vector-icons';

const LoginScreen = () => {
    const [phone, setPhone] = useState('');
    const [password, setPassword] = useState('');
    const { login, isLoading, error } = useContext(AuthContext);

    return (
        <View style={styles.container}>
            <View style={styles.iconContainer}>
                <Ionicons name="construct" size={64} color={colors.primary} />
            </View>
            <Text style={styles.title}>CONSTRUX</Text>
            <Text style={styles.subtitle}>Field Management</Text>

            {error && <Text style={styles.error}>{error}</Text>}

            <View style={styles.inputContainer}>
                <Ionicons name="call-outline" size={20} color={colors.textSecondary} style={styles.inputIcon} />
                <TextInput
                    style={styles.input}
                    placeholder="Phone Number"
                    placeholderTextColor="#ccc"
                    value={phone}
                    onChangeText={setPhone}
                    keyboardType="phone-pad"
                />
            </View>

            <View style={styles.inputContainer}>
                <Ionicons name="lock-closed-outline" size={20} color={colors.textSecondary} style={styles.inputIcon} />
                <TextInput
                    style={styles.input}
                    placeholder="Password"
                    placeholderTextColor="#ccc"
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry
                />
            </View>

            <TouchableOpacity style={styles.button} onPress={() => login(phone, password)}>
                {isLoading ? (
                    <ActivityIndicator color={colors.textInverted} />
                ) : (
                    <Text style={styles.buttonText}>Login</Text>
                )}
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        padding: 24,
        backgroundColor: colors.background,
    },
    iconContainer: {
        alignItems: 'center',
        marginBottom: 20,
    },
    title: {
        fontSize: 42,
        fontWeight: '900',
        textAlign: 'center',
        color: colors.text,
        marginBottom: 5,
        letterSpacing: 2,
    },
    subtitle: {
        fontSize: 16,
        textAlign: 'center',
        color: colors.textSecondary,
        marginBottom: 60,
        textTransform: 'uppercase',
        letterSpacing: 4,
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.inputBg,
        borderRadius: 16,
        marginBottom: 16,
        paddingHorizontal: 16,
        height: 60,
        borderWidth: 1,
        borderColor: colors.border,
    },
    inputIcon: {
        marginRight: 12,
    },
    input: {
        flex: 1,
        color: colors.text,
        fontSize: 16,
    },
    button: {
        backgroundColor: colors.primary,
        padding: 18,
        borderRadius: 16,
        alignItems: 'center',
        marginTop: 20,
        shadowColor: colors.primary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 10,
        elevation: 5,
    },
    buttonText: {
        color: colors.textInverted,
        fontSize: 18,
        fontWeight: 'bold',
        textTransform: 'uppercase',
        letterSpacing: 1,
    },
    error: {
        color: colors.danger,
        textAlign: 'center',
        marginBottom: 20,
        backgroundColor: 'rgba(255, 69, 58, 0.1)',
        padding: 10,
        borderRadius: 8,
    }
});

export default LoginScreen;
