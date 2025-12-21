import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { supabase } from '../services/supabase';

export default function AuthScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [phone, setPhone] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please enter email and password');
      return;
    }

    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) Alert.alert('Error', error.message);
    setLoading(false);
  };

  const handleSignUp = async () => {
    if (!email || !password || !username) {
      Alert.alert('Error', 'Please fill all required fields');
      return;
    }

    setLoading(true);
    
    // Create auth user
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
    });

    if (authError) {
      Alert.alert('Error', authError.message);
      setLoading(false);
      return;
    }

    // Create user profile
    const { error: profileError } = await supabase
      .from('users')
      .insert({
        id: authData.user.id,
        email,
        username,
        display_name: displayName || username,
        phone,
        last_seen: new Date().toISOString(),
      });

    if (profileError) {
      Alert.alert('Error', profileError.message);
    } else {
      Alert.alert('Success', 'Account created! You can now login.');
      setIsSignUp(false);
    }
    
    setLoading(false);
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.logoContainer}>
          <Text style={styles.logoIcon}>💬</Text>
          <Text style={styles.logoText}>QuickChat</Text>
        </View>

        <View style={styles.card}>
          <View style={styles.tabContainer}>
            <TouchableOpacity
              style={[styles.tab, !isSignUp && styles.activeTab]}
              onPress={() => setIsSignUp(false)}
            >
              <Text style={[styles.tabText, !isSignUp && styles.activeTabText]}>
                Sign In
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.tab, isSignUp && styles.activeTab]}
              onPress={() => setIsSignUp(true)}
            >
              <Text style={[styles.tabText, isSignUp && styles.activeTabText]}>
                Sign Up
              </Text>
            </TouchableOpacity>
          </View>

          {!isSignUp ? (
            <View style={styles.form}>
              <Text style={styles.label}>Email</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter email"
                value={email}
                onChangeText={setEmail}
                autoCapitalize="none"
                keyboardType="email-address"
              />

              <Text style={styles.label}>Password</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter password"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
              />

              <TouchableOpacity
                style={styles.button}
                onPress={handleLogin}
                disabled={loading}
              >
                <Text style={styles.buttonText}>
                  {loading ? 'Signing In...' : 'Sign In'}
                </Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.form}>
              <Text style={styles.label}>Email</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter email"
                value={email}
                onChangeText={setEmail}
                autoCapitalize="none"
                keyboardType="email-address"
              />

              <Text style={styles.label}>Password</Text>
              <TextInput
                style={styles.input}
                placeholder="Choose password"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
              />

              <Text style={styles.label}>Username</Text>
              <TextInput
                style={styles.input}
                placeholder="Choose username"
                value={username}
                onChangeText={setUsername}
                autoCapitalize="none"
              />

              <Text style={styles.label}>Display Name (Optional)</Text>
              <TextInput
                style={styles.input}
                placeholder="Your display name"
                value={displayName}
                onChangeText={setDisplayName}
              />

              <Text style={styles.label}>Phone Number (Optional)</Text>
              <TextInput
                style={styles.input}
                placeholder="+959123456789"
                value={phone}
                onChangeText={setPhone}
                keyboardType="phone-pad"
              />

              <TouchableOpacity
                style={styles.button}
                onPress={handleSignUp}
                disabled={loading}
              >
                <Text style={styles.buttonText}>
                  {loading ? 'Creating Account...' : 'Create Account'}
                </Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'linear-gradient(135deg, #6a11cb 0%, #2575fc 100%)',
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 20,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 30,
  },
  logoIcon: {
    fontSize: 60,
    marginBottom: 10,
  },
  logoText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: 'white',
  },
  card: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 20,
    padding: 25,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 10,
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#f5f5f5',
    borderRadius: 12,
    padding: 5,
    marginBottom: 25,
  },
  tab: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  activeTab: {
    backgroundColor: 'white',
    shadowColor: '#6a11cb',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 3,
  },
  tabText: {
    fontWeight: '600',
    color: '#666',
  },
  activeTabText: {
    color: '#6a11cb',
  },
  form: {
    marginTop: 10,
  },
  label: {
    marginBottom: 8,
    color: '#555',
    fontWeight: '500',
    fontSize: 14,
  },
  input: {
    borderWidth: 2,
    borderColor: '#e1e5e9',
    borderRadius: 10,
    padding: 14,
    fontSize: 16,
    backgroundColor: 'white',
    marginBottom: 20,
  },
  button: {
    backgroundColor: 'linear-gradient(135deg, #6a11cb 0%, #2575fc 100%)',
    borderRadius: 10,
    padding: 15,
    alignItems: 'center',
    marginTop: 10,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});