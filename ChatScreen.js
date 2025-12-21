import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  FlatList,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { supabase } from '../services/supabase';
import MessageBubble from '../components/MessageBubble';

export default function ChatScreen({ route }) {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [contact, setContact] = useState(route.params?.contact || null);
  const flatListRef = useRef(null);

  useEffect(() => {
    if (contact) {
      loadMessages();
      subscribeToMessages();
    }
  }, [contact]);

  const loadMessages = async () => {
    if (!contact) return;

    setLoading(true);
    const { data, error } = await supabase
      .from('messages')
      .select('*')
      .or(`and(sender_id.eq.${supabase.auth.user()?.id},receiver_id.eq.${contact.id}),and(sender_id.eq.${contact.id},receiver_id.eq.${supabase.auth.user()?.id})`)
      .order('created_at', { ascending: true });

    if (error) {
      Alert.alert('Error', error.message);
    } else {
      setMessages(data || []);
    }
    setLoading(false);
  };

  const subscribeToMessages = () => {
    const subscription = supabase
      .channel(`messages:${contact.id}`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'messages',
        filter: `or(sender_id.eq.${contact.id},receiver_id.eq.${contact.id})`,
      }, (payload) => {
        setMessages(prev => [...prev, payload.new]);
        markAsRead(payload.new);
      })
      .subscribe();

    return () => supabase.removeChannel(subscription);
  };

  const markAsRead = async (message) => {
    if (message.sender_id !== supabase.auth.user()?.id && !message.read) {
      await supabase
        .from('messages')
        .update({ read: true })
        .eq('id', message.id);
    }
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || !contact) return;

    const message = {
      sender_id: supabase.auth.user()?.id,
      receiver_id: contact.id,
      message: newMessage.trim(),
      read: false,
      created_at: new Date().toISOString(),
    };

    // Optimistic update
    setMessages(prev => [...prev, { ...message, id: Date.now().toString() }]);
    setNewMessage('');

    const { error } = await supabase
      .from('messages')
      .insert([message]);

    if (error) {
      Alert.alert('Error', 'Failed to send message');
      // Remove optimistic message
      setMessages(prev => prev.filter(m => m.id !== Date.now().toString()));
    }
  };

  const renderMessage = ({ item }) => (
    <MessageBubble
      message={item}
      isOwn={item.sender_id === supabase.auth.user()?.id}
    />
  );

  if (!contact) {
    return (
      <View style={styles.noContactContainer}>
        <Ionicons name="chatbubbles-outline" size={80} color="#ddd" />
        <Text style={styles.noContactText}>Select a contact to start chatting</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <View style={styles.contactInfo}>
          <View style={[styles.avatar, { backgroundColor: contact.color || '#6a11cb' }]}>
            <Text style={styles.avatarText}>
              {contact.display_name?.charAt(0) || contact.username?.charAt(0) || 'U'}
            </Text>
          </View>
          <View>
            <Text style={styles.contactName}>
              {contact.display_name || contact.username}
            </Text>
            <Text style={styles.contactStatus}>Online</Text>
          </View>
        </View>
      </View>

      <FlatList
        ref={flatListRef}
        data={messages}
        renderItem={renderMessage}
        keyExtractor={(item) => item.id?.toString() || Date.now().toString()}
        contentContainerStyle={styles.messagesList}
        onContentSizeChange={() => flatListRef.current?.scrollToEnd()}
        refreshing={loading}
        onRefresh={loadMessages}
      />

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.inputContainer}
      >
        <TextInput
          style={styles.input}
          value={newMessage}
          onChangeText={setNewMessage}
          placeholder="Type a message..."
          multiline
          maxLength={500}
        />
        <TouchableOpacity
          style={styles.sendButton}
          onPress={sendMessage}
          disabled={!newMessage.trim()}
        >
          <Ionicons
            name="send"
            size={24}
            color={newMessage.trim() ? 'white' : '#999'}
          />
        </TouchableOpacity>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  noContactContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
  },
  noContactText: {
    marginTop: 20,
    fontSize: 16,
    color: '#666',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
  },
  backButton: {
    marginRight: 15,
  },
  contactInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  avatarText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  contactName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  contactStatus: {
    fontSize: 12,
    color: '#4CAF50',
    marginTop: 2,
  },
  messagesList: {
    padding: 20,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    backgroundColor: 'white',
    borderTopWidth: 1,
    borderTopColor: '#e9ecef',
  },
  input: {
    flex: 1,
    borderWidth: 2,
    borderColor: '#e9ecef',
    borderRadius: 25,
    paddingHorizontal: 18,
    paddingVertical: 14,
    fontSize: 15,
    maxHeight: 120,
    backgroundColor: '#f8f9fa',
  },
  sendButton: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: '#6a11cb',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 12,
  },
});