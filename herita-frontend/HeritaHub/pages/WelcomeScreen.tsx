import React from 'react';
import {
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
} from 'react-native';
import { RootStackParamList } from '../App';
import { StackScreenProps } from '@react-navigation/stack';


type Props = StackScreenProps<RootStackParamList, "Welcome">;

const WelcomeScreen: React.FC<Props> = ({ navigation }) => {
  return (
    <SafeAreaView style={styles.container}>
      <Image
        source={require('../assets/logo.png')}
        style={styles.logo}
        resizeMode="contain"
      />
      <Text style={styles.title}>HeritaHub</Text>
      <Text style={styles.description}>
        Welcome to HeritaHub, hope you have a great experience with HeritaHub!
      </Text>

      <TouchableOpacity
        style={styles.signInBtn}
        onPress={() => navigation.navigate('SignIn')}
      >
        <Text style={styles.signInText}>Sign in</Text>
      </TouchableOpacity>
 
      <TouchableOpacity
        style={styles.signUpBtn}
        onPress={() => navigation.navigate('SignUp')}
      >
        <Text style={styles.signUpText}>Sign up</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
};

export default WelcomeScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 30,
  },
  logo: {
    width: 100,
    height: 100,
    marginBottom: 30,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#000',
  },
  description: {
    textAlign: 'center',
    fontSize: 14,
    color: '#555',
    marginBottom: 50,
  },
  signInBtn: {
    backgroundColor: '#FF6F20',
    borderRadius: 10,
    width: '100%',
    paddingVertical: 14,
    marginBottom: 15,
    alignItems: 'center',
  },
  signInText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  signUpBtn: {
    backgroundColor: '#FFE6D8',
    borderRadius: 10,
    width: '100%',
    paddingVertical: 14,
    alignItems: 'center',
  },
  signUpText: {
    color: '#FF6A00',
    fontSize: 16,
    fontWeight: '600',
  },
});
