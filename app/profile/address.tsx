import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  FlatList,
  RefreshControl,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Address } from '@/types';
import { addressApi } from '@/services/api';

export default function AddressScreen() {
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const router = useRouter();

  useEffect(() => {
    loadAddresses();
  }, []);

  const loadAddresses = async () => {
    try {
      const userInfoStr = await AsyncStorage.getItem('userInfo');
      if (!userInfoStr) {
        Alert.alert('错误', '请重新登录');
        router.replace('/auth/login');
        return;
      }

      const userInfo = JSON.parse(userInfoStr);
      const response = await addressApi.getAddresses(userInfo.id);

      if (response.success) {
        setAddresses(response.data);
      } else {
        Alert.alert('错误', response.message);
      }
    } catch (_error) {
      Alert.alert('错误', '加载地址失败，请重试');
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadAddresses();
    setRefreshing(false);
  };

  const handleAddAddress = () => {
    // TODO: 跳转到添加地址页面
    Alert.alert('提示', '添加地址功能开发中...');
  };

  const handleEditAddress = (_address: Address) => {
    // TODO: 跳转到编辑地址页面
    Alert.alert('提示', '编辑地址功能开发中...');
  };

  const handleSetDefault = async (addressId: string) => {
    try {
      const response = await addressApi.updateAddress(addressId, { isDefault: true });
      if (response.success) {
        loadAddresses();
        Alert.alert('成功', '已设为默认地址');
      } else {
        Alert.alert('错误', response.message);
      }
    } catch (_error) {
      Alert.alert('错误', '设置默认地址失败');
    }
  };

  const handleDeleteAddress = async (addressId: string) => {
    Alert.alert(
      '删除地址',
      '确定要删除这个地址吗？',
      [
        { text: '取消', style: 'cancel' },
        {
          text: '删除',
          style: 'destructive',
          onPress: async () => {
            try {
              const response = await addressApi.deleteAddress(addressId);
              if (response.success) {
                loadAddresses();
                Alert.alert('成功', '地址已删除');
              } else {
                Alert.alert('错误', '删除失败');
              }
            } catch (_error) {
              Alert.alert('错误', '删除地址失败');
            }
          },
        },
      ]
    );
  };

  const renderAddressItem = ({ item }: { item: Address }) => (
    <View style={styles.addressItem}>
      {/* 地址信息 */}
      <View style={styles.addressHeader}>
        <View style={styles.nameContainer}>
          <Text style={styles.addressName}>{item.name}</Text>
          <Text style={styles.addressPhone}>{item.phone}</Text>
        </View>
        {item.isDefault && (
          <View style={styles.defaultBadge}>
            <Text style={styles.defaultBadgeText}>默认</Text>
          </View>
        )}
      </View>
      
      <Text style={styles.addressLocation}>
        {item.province} {item.city} {item.district}
      </Text>
      
      <Text style={styles.addressDetail}>
        {item.detail}
      </Text>

      {/* 操作按钮 */}
      <View style={styles.addressActions}>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => handleEditAddress(item)}
        >
          <Text style={styles.actionButtonText}>编辑</Text>
        </TouchableOpacity>
        
        {!item.isDefault && (
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => handleSetDefault(item.id)}
          >
            <Text style={styles.actionButtonText}>设为默认</Text>
          </TouchableOpacity>
        )}
        
        <TouchableOpacity
          style={[styles.actionButton, styles.deleteButton]}
          onPress={() => handleDeleteAddress(item.id)}
        >
          <Text style={[styles.actionButtonText, styles.deleteButtonText]}>删除</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />
      
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#e74c3c" />
          <Text style={styles.loadingText}>加载中...</Text>
        </View>
      ) : (
        <>
          {addresses.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyIcon}>📍</Text>
              <Text style={styles.emptyText}>暂无收货地址</Text>
              <Text style={styles.emptySubText}>添加地址后可快速选择收货信息</Text>
              <TouchableOpacity
                style={styles.addFirstButton}
                onPress={handleAddAddress}
              >
                <Text style={styles.addFirstButtonText}>添加地址</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <FlatList
              data={addresses}
              renderItem={renderAddressItem}
              keyExtractor={(item) => item.id}
              style={styles.addressList}
              showsVerticalScrollIndicator={false}
              refreshControl={
                <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
              }
              contentContainerStyle={styles.listContent}
            />
          )}

          {/* 添加地址按钮 */}
          {addresses.length > 0 && (
            <View style={styles.bottomBar}>
              <TouchableOpacity
                style={styles.addButton}
                onPress={handleAddAddress}
              >
                <Text style={styles.addButtonText}>+ 新增收货地址</Text>
              </TouchableOpacity>
            </View>
          )}
        </>
      )}
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
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  emptyIcon: {
    fontSize: 80,
    marginBottom: 20,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 8,
  },
  emptySubText: {
    fontSize: 14,
    color: '#7f8c8d',
    marginBottom: 30,
    textAlign: 'center',
  },
  addFirstButton: {
    backgroundColor: '#e74c3c',
    paddingHorizontal: 32,
    paddingVertical: 12,
    borderRadius: 20,
  },
  addFirstButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  addressList: {
    flex: 1,
  },
  listContent: {
    paddingBottom: 100,
  },
  addressItem: {
    backgroundColor: '#fff',
    marginTop: 12,
    padding: 20,
    borderRadius: 8,
    marginHorizontal: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  addressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  nameContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  addressName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginRight: 12,
  },
  addressPhone: {
    fontSize: 14,
    color: '#7f8c8d',
  },
  defaultBadge: {
    backgroundColor: '#e74c3c',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  defaultBadgeText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '500',
  },
  addressLocation: {
    fontSize: 14,
    color: '#495057',
    marginBottom: 4,
  },
  addressDetail: {
    fontSize: 14,
    color: '#495057',
    lineHeight: 20,
    marginBottom: 16,
  },
  addressActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    borderTopWidth: 1,
    borderTopColor: '#f8f9fa',
    paddingTop: 12,
  },
  actionButton: {
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e1e8ed',
    marginLeft: 8,
    backgroundColor: '#fff',
  },
  actionButtonText: {
    fontSize: 12,
    color: '#495057',
    fontWeight: '500',
  },
  deleteButton: {
    borderColor: '#dc3545',
  },
  deleteButtonText: {
    color: '#dc3545',
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 16,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#e9ecef',
  },
  addButton: {
    backgroundColor: '#e74c3c',
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  addButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});