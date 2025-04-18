import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  SafeAreaView,
} from 'react-native';
import api from '../api';
import * as SecureStore from 'expo-secure-store';

interface Props {
  navigation: {
    navigate: (screen: string) => void;
  };
}

const SignInScreen: React.FC<Props> = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSignIn = async () => {
    try {
      const response = await api.post('/auth/signin', {
        email,
        password,
      });
      await SecureStore.setItemAsync('access_token', response.data.result.access_token);
      await SecureStore.setItemAsync('refresh_token', response.data.result.refresh_token);
      Alert.alert('Success', 'Signed in successfully!');
      navigation.navigate('Home')
    } catch (error: any) {
      console.log(error)
      Alert.alert('Error', error.response?.data?.message || 'Sign in failed');
    }
  };

  return ( 
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <Text style={styles.title}>Access Account</Text>
        <Text style={styles.subtitle}>
          Access your account to connect and contribute
        </Text>

        <TextInput
          placeholder="Your email address"
          placeholderTextColor="#aaa"
          style={styles.input}
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
        />

        <TextInput
          placeholder="Enter your password"
          placeholderTextColor="#aaa"
          style={styles.input}
          secureTextEntry
          value={password}
          onChangeText={setPassword}
        />

        <TouchableOpacity style={styles.button} onPress={handleSignIn}>
          <Text style={styles.buttonText}>Sign in</Text>
        </TouchableOpacity>

        <Text style={styles.bottomText}>
          Need to create an account?{' '}
          <Text style={styles.linkText} onPress={() => navigation.navigate('SignUp')}>Sign up</Text>
        </Text>
      </View>
    </SafeAreaView>
  );
};

export default SignInScreen;

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#fff',
  },
  container: {
    flex: 1,
    paddingHorizontal: 30,
    justifyContent: 'center',
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    textAlign: 'center',
    fontSize: 14,
    marginBottom: 30,
    color: '#333',
  },
  input: {
    height: 50,
    backgroundColor: '#F6F6F8',
    borderRadius: 10,
    paddingHorizontal: 15,
    fontSize: 16,
    marginBottom: 15,
  },
  button: {
    backgroundColor: '#FF6F20',
    borderRadius: 12,
    paddingVertical: 15,
    alignItems: 'center',
    marginBottom: 20,
  },
  buttonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
  },
  bottomText: {
    textAlign: 'center',
    fontSize: 14,
    color: '#000',
  },
  linkText: {
    color: '#FF6F20',
    fontWeight: '600',
  },
});
