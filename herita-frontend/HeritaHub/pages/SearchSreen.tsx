import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  FlatList,
  ActivityIndicator,
} from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import api from '../api';
import { navigate } from '../services/NavigationService';

let typingTimeout: NodeJS.Timeout;

const SearchScreen = () => {
  const [searchText, setSearchText] = useState('');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<any[]>([]);


  const handlePressItem = (item: {id: string, name: string, type: string}) => {
    if (item.type === 'user') {
      navigate('MainTabs', {
        screen: 'Profile',  
        params: { screen: 'FriendProfile', params: {userId: item.id} }
      });    
    } else if (item.type === 'place') {
      navigate('Document', { id: item.id });
    }
  }

  const handleSearch = (text: string) => {
    setSearchText(text);

    if (typingTimeout) {
      clearTimeout(typingTimeout);
    }

    typingTimeout = setTimeout(async () => {
      if (text.trim() === '') {
        setResults([]);
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const response = await api.get(`user?key=${text}`)
        setResults(response.data.result)
      } catch (error) {
        console.log(error)
      } finally {
        setLoading(false);
      }
    }, 400); 
  };

  const renderItem = ({ item }: { item: any }) => (
    <TouchableOpacity style={styles.resultItem} onPress={() => handlePressItem(item)}>
    <Ionicons
      name={item.type === 'user' ? 'person-circle-outline' : 'location-outline'}
      size={24}
      color="#FF6F20"
      style={{ marginRight: 10 }}
    />
    <Text style={styles.resultText}>{item.name}</Text>
  </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <Text style={styles.title}>Tìm kiếm</Text>
        <View style={styles.searchContainer}>
          <TextInput
            style={styles.input}
            placeholder="Nhập tên người dùng hoặc địa điểm..."
            value={searchText}
            onChangeText={handleSearch}
            returnKeyType="search"
          />
        </View>

        {loading ? (
          <ActivityIndicator size="large" color="#FF6F20" style={{ marginTop: 30 }} />
        ) : (
          <FlatList
            data={results}
            keyExtractor={item => item.id}
            renderItem={renderItem}
            contentContainerStyle={{ marginTop: 20 }}
          />
        )}
      </View>
    </SafeAreaView>
  );
};

export default SearchScreen;

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#fff',
  },
  container: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
    color: '#333',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F6F6F8',
    borderRadius: 10,
    paddingHorizontal: 10,
  },
  input: {
    flex: 1,
    height: 50,
    fontSize: 16,
  },
  resultItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderColor: '#eee',
  },
  resultText: {
    fontSize: 16,
    color: '#333',
  },
});
