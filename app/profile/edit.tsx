import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Image,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { User } from '@/types';
import { authApi } from '@/services/api';

export default function EditProfileScreen() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    realName: '',
    email: '',
    phone: '',
    address: '',
  });
  const router = useRouter();

  useEffect(() => {
    loadUserInfo();
  }, []);

  const loadUserInfo = async () => {
    try {
      const userInfoStr = await AsyncStorage.getItem('userInfo');
      if (userInfoStr) {
        const userInfo = JSON.parse(userInfoStr);
        setUser(userInfo);
        setFormData({
          realName: userInfo.realName || '',
          email: userInfo.email || '',
          phone: userInfo.phone || '',
          address: userInfo.address || '',
        });
      }
    } catch (error) {
      console.error('加载用户信息失败:', error);
      Alert.alert('错误', '加载用户信息失败');
      router.back();
    } finally {
      setLoading(false);
    }
  };

  const updateFormData = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const validateForm = () => {
    const { email, phone } = formData;

    if (email && email.trim()) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        Alert.alert('提示', '请输入正确的邮箱格式');
        return false;
      }
    }

    if (phone && phone.trim()) {
      const phoneRegex = /^1[3-9]\d{9}$/;
      if (!phoneRegex.test(phone)) {
        Alert.alert('提示', '请输入正确的手机号格式');
        return false;
      }
    }

    return true;
  };

  const handleSave = async () => {
    if (!validateForm()) {
      return;
    }

    setSaving(true);
    try {
      const token = await AsyncStorage.getItem('userToken');
      if (!token) {
        Alert.alert('错误', '请重新登录');
        router.replace('/auth/login');
        return;
      }

      const updateData = {
        ...formData,
        realName: formData.realName.trim() || undefined,
        email: formData.email.trim() || undefined,
        phone: formData.phone.trim() || undefined,
        address: formData.address.trim() || undefined,
      };

      const response = await authApi.updateUserInfo(token, updateData);
      
      if (response.success) {
        // 更新本地存储的用户信息
        await AsyncStorage.setItem('userInfo', JSON.stringify(response.data));
        
        Alert.alert('成功', '个人信息更新成功', [
          {
            text: '确定',
            onPress: () => router.back(),
          },
        ]);
      } else {
        Alert.alert('错误', response.message);
      }
    } catch (_error) {
      Alert.alert('错误', '网络错误，请重试');
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    router.back();
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#e74c3c" />
        <Text style={styles.loadingText}>加载中...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />
      
      {/* 头部导航 */}
      <View style={styles.header}>
        <TouchableOpacity onPress={handleCancel}>
          <Text style={styles.cancelButton}>取消</Text>
        </TouchableOpacity>
        <Text style={styles.title}>编辑个人信息</Text>
        <TouchableOpacity 
          onPress={handleSave}
          disabled={saving}
        >
          {saving ? (
            <ActivityIndicator size="small" color="#e74c3c" />
          ) : (
            <Text style={styles.saveButton}>保存</Text>
          )}
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* 头像部分 */}
        <View style={styles.avatarSection}>
          <Text style={styles.sectionTitle}>头像</Text>
          <View style={styles.avatarContainer}>
            <Image 
              source={{ 
                uri: user?.avatar || 'https://picsum.photos/100/100?random=999' 
              }} 
              style={styles.avatar} 
            />
            <TouchableOpacity 
              style={styles.changeAvatarButton}
              onPress={() => Alert.alert('提示', '更换头像功能开发中...')}
            >
              <Text style={styles.changeAvatarText}>更换头像</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* 基本信息 */}
        <View style={styles.formSection}>
          <View style={styles.inputContainer}>
            <Text style={styles.label}>用户名</Text>
            <View style={styles.disabledInput}>
              <Text style={styles.disabledText}>{user?.username}</Text>
            </View>
            <Text style={styles.hint}>用户名不能修改</Text>
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>真实姓名</Text>
            <TextInput
              style={styles.input}
              value={formData.realName}
              onChangeText={(value) => updateFormData('realName', value)}
              placeholder="请输入真实姓名"
              placeholderTextColor="#999"
              maxLength={20}
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>邮箱</Text>
            <TextInput
              style={styles.input}
              value={formData.email}
              onChangeText={(value) => updateFormData('email', value)}
              placeholder="请输入邮箱地址"
              placeholderTextColor="#999"
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>手机号</Text>
            <TextInput
              style={styles.input}
              value={formData.phone}
              onChangeText={(value) => updateFormData('phone', value)}
              placeholder="请输入手机号"
              placeholderTextColor="#999"
              keyboardType="phone-pad"
              maxLength={11}
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>地址</Text>
            <TextInput
              style={[styles.input, styles.addressInput]}
              value={formData.address}
              onChangeText={(value) => updateFormData('address', value)}
              placeholder="请输入详细地址"
              placeholderTextColor="#999"
              multiline
              numberOfLines={3}
              textAlignVertical="top"
            />
          </View>
        </View>

        <View style={styles.bottomPadding} />
      </ScrollView>
    </View>
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
  },
  loadingText: {
    marginTop: 12,
    color: '#7f8c8d',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 50,
    paddingBottom: 16,
    paddingHorizontal: 20,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
  },
  cancelButton: {
    fontSize: 16,
    color: '#7f8c8d',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2c3e50',
  },
  saveButton: {
    fontSize: 16,
    color: '#e74c3c',
    fontWeight: '600',
  },
  content: {
    flex: 1,
  },
  avatarSection: {
    backgroundColor: '#fff',
    paddingVertical: 24,
    paddingHorizontal: 20,
    borderBottomWidth: 8,
    borderBottomColor: '#f8f9fa',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 16,
  },
  avatarContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginRight: 20,
  },
  changeAvatarButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: '#e74c3c',
    borderRadius: 16,
  },
  changeAvatarText: {
    fontSize: 14,
    color: '#e74c3c',
  },
  formSection: {
    backgroundColor: '#fff',
    paddingVertical: 8,
  },
  inputContainer: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f8f9fa',
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2c3e50',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#e1e8ed',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    backgroundColor: '#fff',
    color: '#2c3e50',
  },
  addressInput: {
    minHeight: 80,
  },
  disabledInput: {
    borderWidth: 1,
    borderColor: '#e9ecef',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#f8f9fa',
  },
  disabledText: {
    fontSize: 16,
    color: '#adb5bd',
  },
  hint: {
    fontSize: 12,
    color: '#7f8c8d',
    marginTop: 4,
  },
  bottomPadding: {
    height: 40,
  },
});