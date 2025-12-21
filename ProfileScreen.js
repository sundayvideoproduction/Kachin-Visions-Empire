import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  Alert,
  Modal,
  TextInput,
  Switch,
  ActivityIndicator,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';

// Sample user data
const sampleUser = {
  id: 'current_user',
  username: 'sun_day',
  display_name: 'Sun Day',
  email: 'sun@example.com',
  phone: '+959123456789',
  bio: 'Mobile developer and tech enthusiast',
  created_at: '2024-01-01T00:00:00Z',
};

export default function ProfileScreen({ navigation }) {
  const [user, setUser] = useState(sampleUser);
  const [loading, setLoading] = useState(false);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [settingsModalVisible, setSettingsModalVisible] = useState(false);
  const [editData, setEditData] = useState({ ...sampleUser });
  const [darkMode, setDarkMode] = useState(false);
  const [notifications, setNotifications] = useState(true);
  const [sounds, setSounds] = useState(true);

  const stats = {
    chats: 24,
    contacts: 18,
    online: 8,
  };

  const menuItems = [
    {
      icon: 'person-outline',
      title: 'Edit Profile',
      color: '#6a11cb',
      onPress: () => setEditModalVisible(true),
    },
    {
      icon: 'settings-outline',
      title: 'Settings',
      color: '#2575fc',
      onPress: () => setSettingsModalVisible(true),
    },
    {
      icon: 'notifications-outline',
      title: 'Notifications',
      color: '#ff6b6b',
      onPress: () => Alert.alert('Notifications', 'Notification settings'),
    },
    {
      icon: 'shield-outline',
      title: 'Privacy & Security',
      color: '#4ecdc4',
      onPress: () => Alert.alert('Privacy', 'Privacy settings'),
    },
    {
      icon: 'help-circle-outline',
      title: 'Help & Support',
      color: '#1a936f',
      onPress: () => Alert.alert('Help', 'Contact support@quickchat.com'),
    },
    {
      icon: 'information-circle-outline',
      title: 'About QuickChat',
      color: '#ff9a76',
      onPress: () => Alert.alert(
        'About QuickChat',
        'Version 2.0.0\n\nA real-time messaging application built with React Native & Supabase.',
      ),
    },
  ];

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: () => {
            setLoading(true);
            setTimeout(() => {
              setLoading(false);
              Alert.alert('Success', 'Logged out successfully!');
              navigation.reset({
                index: 0,
                routes: [{ name: 'Auth' }],
              });
            }, 1000);
          },
        },
      ]
    );
  };

  const handleSaveProfile = () => {
    setLoading(true);
    setTimeout(() => {
      setUser({ ...editData });
      setEditModalVisible(false);
      setLoading(false);
      Alert.alert('Success', 'Profile updated successfully!');
    }, 800);
  };

  const handleSaveSettings = () => {
    Alert.alert('Success', 'Settings saved successfully!');
    setSettingsModalVisible(false);
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#6a11cb" />
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Profile Header */}
        <View style={styles.header}>
          <View style={styles.avatarLarge}>
            <Text style={styles.avatarText}>
              {user.display_name?.charAt(0) || user.username?.charAt(0) || 'U'}
            </Text>
          </View>
          <Text style={styles.name}>{user.display_name}</Text>
          <Text style={styles.username}>@{user.username}</Text>
          
          {user.bio && (
            <Text style={styles.bio}>{user.bio}</Text>
          )}
          
          <Text style={styles.memberSince}>
            Member since {formatDate(user.created_at)}
          </Text>
        </View>

        {/* Stats */}
        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{stats.chats}</Text>
            <Text style={styles.statLabel}>Chats</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{stats.contacts}</Text>
            <Text style={styles.statLabel}>Contacts</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{stats.online}</Text>
            <Text style={styles.statLabel}>Online</Text>
          </View>
        </View>

        {/* Contact Info */}
        <View style={styles.infoContainer}>
          <View style={styles.infoItem}>
            <Ionicons name="mail-outline" size={20} color="#666" />
            <Text style={styles.infoText}>{user.email}</Text>
          </View>
          {user.phone && (
            <View style={styles.infoItem}>
              <Ionicons name="call-outline" size={20} color="#666" />
              <Text style={styles.infoText}>{user.phone}</Text>
            </View>
          )}
        </View>

        {/* Menu Items */}
        <View style={styles.menuContainer}>
          {menuItems.map((item, index) => (
            <TouchableOpacity
              key={index}
              style={styles.menuItem}
              onPress={item.onPress}
            >
              <View style={[styles.menuIcon, { backgroundColor: `${item.color}15` }]}>
                <Ionicons name={item.icon} size={22} color={item.color} />
              </View>
              <Text style={styles.menuText}>{item.title}</Text>
              <Ionicons name="chevron-forward" size={20} color="#999" />
            </TouchableOpacity>
          ))}
        </View>

        {/* Logout Button */}
        <TouchableOpacity
          style={styles.logoutButton}
          onPress={handleLogout}
        >
          <View style={styles.logoutIcon}>
            <Ionicons name="log-out-outline" size={22} color="#f44336" />
          </View>
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>

        <View style={styles.footer}>
          <Text style={styles.version}>QuickChat v2.0.0</Text>
          <Text style={styles.copyright}>© 2024 QuickChat Messenger</Text>
        </View>
      </ScrollView>

      {/* Edit Profile Modal */}
      <Modal
        visible={editModalVisible}
        animationType="slide"
        transparent={true}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Edit Profile</Text>
              <TouchableOpacity onPress={() => setEditModalVisible(false)}>
                <Ionicons name="close" size={24} color="#333" />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalBody}>
              <View style={styles.formGroup}>
                <Text style={styles.label}>Display Name</Text>
                <TextInput
                  style={styles.input}
                  value={editData.display_name}
                  onChangeText={(text) => setEditData({...editData, display_name: text})}
                  placeholder="Enter display name"
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.label}>Username</Text>
                <TextInput
                  style={styles.input}
                  value={editData.username}
                  onChangeText={(text) => setEditData({...editData, username: text})}
                  placeholder="Enter username"
                  autoCapitalize="none"
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.label}>Email</Text>
                <TextInput
                  style={styles.input}
                  value={editData.email}
                  onChangeText={(text) => setEditData({...editData, email: text})}
                  placeholder="Enter email"
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.label}>Phone Number</Text>
                <TextInput
                  style={styles.input}
                  value={editData.phone}
                  onChangeText={(text) => setEditData({...editData, phone: text})}
                  placeholder="+959123456789"
                  keyboardType="phone-pad"
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.label}>Bio</Text>
                <TextInput
                  style={[styles.input, styles.textArea]}
                  value={editData.bio}
                  onChangeText={(text) => setEditData({...editData, bio: text})}
                  placeholder="Tell us about yourself"
                  multiline
                  numberOfLines={3}
                />
              </View>
            </ScrollView>

            <View style={styles.modalFooter}>
              <TouchableOpacity
                style={[styles.button, styles.cancelButton]}
                onPress={() => setEditModalVisible(false)}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.button, styles.saveButton]}
                onPress={handleSaveProfile}
              >
                <Text style={styles.saveButtonText}>Save Changes</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Settings Modal */}
      <Modal
        visible={settingsModalVisible}
        animationType="slide"
        transparent={true}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Settings</Text>
              <TouchableOpacity onPress={() => setSettingsModalVisible(false)}>
                <Ionicons name="close" size={24} color="#333" />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalBody}>
              <View style={styles.settingItem}>
                <View>
                  <Text style={styles.settingTitle}>Dark Mode</Text>
                  <Text style={styles.settingDescription}>Switch between light and dark theme</Text>
                </View>
                <Switch
                  value={darkMode}
                  onValueChange={setDarkMode}
                  trackColor={{ false: '#767577', true: '#6a11cb' }}
                  thumbColor={darkMode ? '#fff' : '#f4f3f4'}
                />
              </View>

              <View style={styles.settingItem}>
                <View>
                  <Text style={styles.settingTitle}>Notifications</Text>
                  <Text style={styles.settingDescription}>Receive message notifications</Text>
                </View>
                <Switch
                  value={notifications}
                  onValueChange={setNotifications}
                  trackColor={{ false: '#767577', true: '#6a11cb' }}
                  thumbColor={notifications ? '#fff' : '#f4f3f4'}
                />
              </View>

              <View style={styles.settingItem}>
                <View>
                  <Text style={styles.settingTitle}>Notification Sounds</Text>
                  <Text style={styles.settingDescription}>Play sound for new messages</Text>
                </View>
                <Switch
                  value={sounds}
                  onValueChange={setSounds}
                  trackColor={{ false: '#767577', true: '#6a11cb' }}
                  thumbColor={sounds ? '#fff' : '#f4f3f4'}
                />
              </View>

              <View style={styles.settingItem}>
                <View>
                  <Text style={styles.settingTitle}>Auto-download Media</Text>
                  <Text style={styles.settingDescription}>Automatically download images and files</Text>
                </View>
                <Switch
                  value={true}
                  onValueChange={() => {}}
                  trackColor={{ false: '#767577', true: '#6a11cb' }}
                  thumbColor={'#fff'}
                />
              </View>

              <View style={styles.settingItem}>
                <View>
                  <Text style={styles.settingTitle}>Show Online Status</Text>
                  <Text style={styles.settingDescription}>Let others see when you're online</Text>
                </View>
                <Switch
                  value={true}
                  onValueChange={() => {}}
                  trackColor={{ false: '#767577', true: '#6a11cb' }}
                  thumbColor={'#fff'}
                />
              </View>

              <View style={styles.settingSection}>
                <Text style={styles.sectionTitle}>Privacy</Text>
                <TouchableOpacity style={styles.settingOption}>
                  <Text style={styles.optionText}>Blocked Users</Text>
                  <Ionicons name="chevron-forward" size={20} color="#999" />
                </TouchableOpacity>
                <TouchableOpacity style={styles.settingOption}>
                  <Text style={styles.optionText}>Last Seen & Online</Text>
                  <Ionicons name="chevron-forward" size={20} color="#999" />
                </TouchableOpacity>
                <TouchableOpacity style={styles.settingOption}>
                  <Text style={styles.optionText}>Profile Photo</Text>
                  <Ionicons name="chevron-forward" size={20} color="#999" />
                </TouchableOpacity>
              </View>

              <View style={styles.settingSection}>
                <Text style={styles.sectionTitle}>Data & Storage</Text>
                <TouchableOpacity style={styles.settingOption}>
                  <Text style={styles.optionText}>Storage Usage</Text>
                  <Ionicons name="chevron-forward" size={20} color="#999" />
                </TouchableOpacity>
                <TouchableOpacity style={styles.settingOption}>
                  <Text style={styles.optionText}>Network Usage</Text>
                  <Ionicons name="chevron-forward" size={20} color="#999" />
                </TouchableOpacity>
                <TouchableOpacity style={styles.settingOption}>
                  <Text style={styles.optionText}>Clear Cache</Text>
                  <Text style={styles.optionValue}>125 MB</Text>
                </TouchableOpacity>
              </View>
            </ScrollView>

            <View style={styles.modalFooter}>
              <TouchableOpacity
                style={[styles.button, styles.cancelButton]}
                onPress={() => setSettingsModalVisible(false)}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.button, styles.saveButton]}
                onPress={handleSaveSettings}
              >
                <Text style={styles.saveButtonText}>Save Settings</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
  },
  loadingText: {
    marginTop: 10,
    color: '#666',
  },
  header: {
    padding: 40,
    backgroundColor: 'white',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
  },
  avatarLarge: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#6a11cb',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 15,
    borderWidth: 5,
    borderColor: 'white',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 10,
  },
  avatarText: {
    color: 'white',
    fontSize: 40,
    fontWeight: 'bold',
  },
  name: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  username: {
    fontSize: 16,
    color: '#666',
    marginBottom: 10,
  },
  bio: {
    fontSize: 14,
    color: '#555',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 10,
    paddingHorizontal: 20,
  },
  memberSince: {
    fontSize: 12,
    color: '#999',
    marginTop: 5,
  },
  statsContainer: {
    flexDirection: 'row',
    backgroundColor: 'white',
    marginHorizontal: 20,
    marginTop: -20,
    borderRadius: 15,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 3,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statDivider: {
    width: 1,
    backgroundColor: '#e9ecef',
  },
  statNumber: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#6a11cb',
    marginBottom: 5,
  },
  statLabel: {
    fontSize: 13,
    color: '#666',
  },
  infoContainer: {
    backgroundColor: 'white',
    marginHorizontal: 20,
    marginTop: 15,
    borderRadius: 15,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  infoText: {
    marginLeft: 12,
    fontSize: 15,
    color: '#333',
    flex: 1,
  },
  menuContainer: {
    backgroundColor: 'white',
    marginHorizontal: 20,
    marginTop: 15,
    borderRadius: 15,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 18,
    borderBottomWidth: 1,
    borderBottomColor: '#f5f5f5',
  },
  menuIcon: {
    width: 40,
    height: 40,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  menuText: {
    flex: 1,
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    marginHorizontal: 20,
    marginTop: 15,
    padding: 18,
    borderRadius: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2,
  },
  logoutIcon: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: 'rgba(244, 67, 54, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  logoutText: {
    flex: 1,
    fontSize: 16,
    color: '#f44336',
    fontWeight: '500',
  },
  footer: {
    alignItems: 'center',
    paddingVertical: 30,
  },
  version: {
    fontSize: 14,
    color: '#666',
    marginBottom: 5,
  },
  copyright: {
    fontSize: 12,
    color: '#999',
  },
  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: 'white',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '90%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  modalBody: {
    maxHeight: 400,
    padding: 20,
  },
  formGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: '#555',
    marginBottom: 8,
  },
  input: {
    borderWidth: 2,
    borderColor: '#e1e5e9',
    borderRadius: 10,
    padding: 14,
    fontSize: 16,
    backgroundColor: 'white',
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  modalFooter: {
    flexDirection: 'row',
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#e9ecef',
  },
  button: {
    flex: 1,
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginHorizontal: 5,
  },
  cancelButton: {
    backgroundColor: '#f5f5f5',
  },
  cancelButtonText: {
    color: '#666',
    fontSize: 16,
    fontWeight: '600',
  },
  saveButton: {
    backgroundColor: '#6a11cb',
  },
  saveButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  // Settings Styles
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#f5f5f5',
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
    marginBottom: 4,
  },
  settingDescription: {
    fontSize: 13,
    color: '#666',
  },
  settingSection: {
    marginTop: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
  settingOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#f5f5f5',
  },
  optionText: {
    fontSize: 16,
    color: '#333',
  },
  optionValue: {
    fontSize: 14,
    color: '#666',
  },
});