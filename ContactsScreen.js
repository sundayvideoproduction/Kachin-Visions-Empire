import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  TextInput,
  Alert,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { supabase } from '../services/supabase';

export default function ContactsScreen({ navigation }) {
  const [contacts, setContacts] = useState([]);
  const [filteredContacts, setFilteredContacts] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadContacts();
    subscribeToContacts();
  }, []);

  useEffect(() => {
    if (searchQuery) {
      const filtered = contacts.filter(contact =>
        contact.display_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        contact.username?.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredContacts(filtered);
    } else {
      setFilteredContacts(contacts);
    }
  }, [searchQuery, contacts]);

  const loadContacts = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .neq('id', supabase.auth.user()?.id)
      .order('display_name');

    if (error) {
      Alert.alert('Error', error.message);
    } else {
      setContacts(data || []);
      setFilteredContacts(data || []);
    }
    setLoading(false);
  };

  const subscribeToContacts = () => {
    const subscription = supabase
      .channel('contacts')
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'users',
      }, () => {
        loadContacts();
      })
      .subscribe();

    return () => supabase.removeChannel(subscription);
  };

  const startChat = (contact) => {
    navigation.navigate('ChatScreen', { contact });
  };

  const renderContact = ({ item }) => {
    const colors = ['#6a11cb', '#2575fc', '#ff6b6b', '#4ecdc4', '#1a936f'];
    const color = colors[item.id?.charCodeAt(0) % colors.length] || '#6a11cb';

    return (
      <TouchableOpacity
        style={styles.contactCard}
        onPress={() => startChat(item)}
      >
        <View style={[styles.avatar, { backgroundColor: color }]}>
          <Text style={styles.avatarText}>
            {item.display_name?.charAt(0) || item.username?.charAt(0) || 'U'}
          </Text>
        </View>
        <View style={styles.contactInfo}>
          <Text style={styles.contactName}>
            {item.display_name || item.username}
          </Text>
          <Text style={styles.contactUsername}>@{item.username}</Text>
          {item.phone && (
            <Text style={styles.contactPhone}>{item.phone}</Text>
          )}
        </View>
        <Ionicons name="chevron-forward" size={20} color="#999" />
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Contacts</Text>
        <Text style={styles.subtitle}>Connect with other users</Text>
      </View>

      <View style={styles.searchContainer}>
        <Ionicons name="search" size={20} color="#999" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search contacts..."
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      <FlatList
        data={filteredContacts}
        renderItem={renderContact}
        keyExtractor={(item) => item.id}
        refreshing={loading}
        onRefresh={loadContacts}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="people-outline" size={60} color="#ddd" />
            <Text style={styles.emptyText}>No contacts found</Text>
          </View>
        }
        contentContainerStyle={styles.listContainer}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    padding: 25,
    backgroundColor: 'white',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    margin: 15,
    paddingHorizontal: 15,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#e9ecef',
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 14,
    fontSize: 15,
  },
  listContainer: {
    paddingHorizontal: 15,
  },
  contactCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    padding: 18,
    borderRadius: 15,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2,
  },
  avatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
  },
  contactInfo: {
    flex: 1,
    marginLeft: 15,
  },
  contactName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 3,
  },
  contactUsername: {
    fontSize: 13,
    color: '#666',
    marginBottom: 2,
  },
  contactPhone: {
    fontSize: 12,
    color: '#999',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 50,
  },
  emptyText: {
    marginTop: 15,
    fontSize: 16,
    color: '#666',
  },
});