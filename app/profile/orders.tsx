import { getOrderStatusColor, getOrderStatusText, orderApi } from '@/services/api';
import { Order, OrderStatus } from '@/types';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    FlatList,
    Image,
    RefreshControl,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

const orderTabs = [
  { key: '', label: '全部' },
  { key: 'pending', label: '待付款' },
  { key: 'shipped', label: '待收货' },
  { key: 'delivered', label: '已完成' },
  { key: 'cancelled', label: '已取消' },
];

export default function OrdersScreen() {
  const params = useLocalSearchParams<{ status?: string }>();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedTab, setSelectedTab] = useState('');
  const router = useRouter();

  // 初始化选中的标签页
  useEffect(() => {
    if (params.status) {
      setSelectedTab(params.status);
    }
  }, [params.status]);

  useEffect(() => {
    loadOrders();
  }, [selectedTab]);

  const loadOrders = async () => {
    try {
      const userInfoStr = await AsyncStorage.getItem('userInfo');
      if (!userInfoStr) {
        Alert.alert('错误', '请重新登录');
        router.replace('/auth/login');
        return;
      }

      const userInfo = JSON.parse(userInfoStr);
      console.log('Loading orders for user:', userInfo.id, 'with status:', selectedTab);
      
      const response = await orderApi.getOrders(userInfo.id, {
        status: selectedTab || undefined,
      });

      console.log('Orders response:', response);

      if (response.success) {
        setOrders(response.data.orders);
      } else {
        Alert.alert('错误', response.message);
      }
    } catch (error) {
      console.error('Load orders error:', error);
      Alert.alert('错误', '加载订单失败，请重试');
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadOrders();
    setRefreshing(false);
  };

  const handleTabChange = (tab: string) => {
    setSelectedTab(tab);
    setLoading(true);
  };

  const goToOrderDetail = (orderId: string) => {
    router.push(`/order/${orderId}`);
  };

  const handleCancelOrder = async (orderId: string) => {
    Alert.alert(
      '取消订单',
      '确定要取消这个订单吗？',
      [
        { text: '取消', style: 'cancel' },
        {
          text: '确定',
          style: 'destructive',
          onPress: async () => {
            try {
              const response = await orderApi.cancelOrder(orderId);
              if (response.success) {
                Alert.alert('成功', '订单已取消');
                loadOrders();
              } else {
                Alert.alert('错误', response.message);
              }
            } catch (_error) {
              Alert.alert('错误', '取消订单失败');
            }
          },
        },
      ]
    );
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatPrice = (price: number) => {
    return `¥${price.toFixed(2)}`;
  };

  const renderOrderItem = ({ item }: { item: Order }) => (
    <TouchableOpacity
      style={styles.orderItem}
      onPress={() => goToOrderDetail(item.id)}
    >
      {/* 订单头部 */}
      <View style={styles.orderHeader}>
        <Text style={styles.orderId}>订单号: {item.id}</Text>
        <Text style={[styles.orderStatus, { color: getOrderStatusColor(item.status) }]}>
          {getOrderStatusText(item.status)}
        </Text>
      </View>

      {/* 商品列表 */}
      <View style={styles.orderProducts}>
        {item.items.map((product, index) => (
          <View key={index} style={styles.productItem}>
            <Image 
              source={{ uri: product.productImage }} 
              style={styles.productImage} 
            />
            <View style={styles.productInfo}>
              <Text style={styles.productName} numberOfLines={2}>
                {product.productName}
              </Text>
              {product.specifications && (
                <Text style={styles.productSpecs}>
                  {Object.entries(product.specifications).map(([key, value]) => 
                    `${key}: ${value}`
                  ).join(', ')}
                </Text>
              )}
              <View style={styles.productFooter}>
                <Text style={styles.productPrice}>
                  {formatPrice(product.price)}
                </Text>
                <Text style={styles.productQuantity}>
                  x{product.quantity}
                </Text>
              </View>
            </View>
          </View>
        ))}
      </View>

      {/* 订单信息 */}
      <View style={styles.orderFooter}>
        <Text style={styles.orderDate}>
          下单时间: {formatDate(item.createdAt)}
        </Text>
        <Text style={styles.orderTotal}>
          共{item.items.length}件商品 合计: {formatPrice(item.totalAmount)}
        </Text>
      </View>

      {/* 操作按钮 */}
      <View style={styles.orderActions}>
        {item.status === OrderStatus.PENDING && (
          <>
            <TouchableOpacity
              style={[styles.actionButton, styles.cancelButton]}
              onPress={() => handleCancelOrder(item.id)}
            >
              <Text style={styles.cancelButtonText}>取消订单</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.actionButton, styles.payButton]}
              onPress={() => Alert.alert('提示', '支付功能开发中...')}
            >
              <Text style={styles.payButtonText}>立即支付</Text>
            </TouchableOpacity>
          </>
        )}
        
        {item.status === OrderStatus.SHIPPED && (
          <TouchableOpacity
            style={[styles.actionButton, styles.confirmButton]}
            onPress={() => Alert.alert('提示', '确认收货功能开发中...')}
          >
            <Text style={styles.confirmButtonText}>确认收货</Text>
          </TouchableOpacity>
        )}
        
        {item.status === OrderStatus.DELIVERED && (
          <TouchableOpacity
            style={[styles.actionButton, styles.reviewButton]}
            onPress={() => Alert.alert('提示', '评价功能开发中...')}
          >
            <Text style={styles.reviewButtonText}>评价商品</Text>
          </TouchableOpacity>
        )}
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />
      
      {/* 标签栏 */}
      <View style={styles.tabBar}>
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.tabBarContent}
        >
          {orderTabs.map((tab) => (
            <TouchableOpacity
              key={tab.key}
              style={[
                styles.tab,
                selectedTab === tab.key && styles.activeTab,
              ]}
              onPress={() => handleTabChange(tab.key)}
            >
              <Text
                style={[
                  styles.tabText,
                  selectedTab === tab.key && styles.activeTabText,
                ]}
              >
                {tab.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* 订单列表 */}
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#e74c3c" />
          <Text style={styles.loadingText}>加载中...</Text>
        </View>
      ) : orders.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyIcon}>📋</Text>
          <Text style={styles.emptyText}>暂无订单</Text>
          <Text style={styles.emptySubText}>快去选购心仪的商品吧</Text>
          <TouchableOpacity
            style={styles.shopButton}
            onPress={() => router.push('/(tabs)')}
          >
            <Text style={styles.shopButtonText}>去购物</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={orders}
          renderItem={renderOrderItem}
          keyExtractor={(item) => item.id}
          style={styles.orderList}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  tabBar: {
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
  },
  tabBarContent: {
    paddingHorizontal: 20,
  },
  tab: {
    paddingVertical: 16,
    paddingHorizontal: 16,
    marginRight: 8,
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: '#e74c3c',
  },
  tabText: {
    fontSize: 14,
    color: '#7f8c8d',
    fontWeight: '500',
  },
  activeTabText: {
    color: '#e74c3c',
    fontWeight: '600',
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
  },
  shopButton: {
    backgroundColor: '#e74c3c',
    paddingHorizontal: 32,
    paddingVertical: 12,
    borderRadius: 20,
  },
  shopButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  orderList: {
    flex: 1,
  },
  orderItem: {
    backgroundColor: '#fff',
    marginBottom: 12,
    paddingVertical: 16,
    paddingHorizontal: 20,
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f8f9fa',
  },
  orderId: {
    fontSize: 14,
    color: '#495057',
    fontWeight: '500',
  },
  orderStatus: {
    fontSize: 14,
    fontWeight: '600',
  },
  orderProducts: {
    marginBottom: 12,
  },
  productItem: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  productImage: {
    width: 60,
    height: 60,
    borderRadius: 8,
    marginRight: 12,
  },
  productInfo: {
    flex: 1,
  },
  productName: {
    fontSize: 14,
    color: '#2c3e50',
    fontWeight: '500',
    marginBottom: 4,
  },
  productSpecs: {
    fontSize: 12,
    color: '#7f8c8d',
    marginBottom: 4,
  },
  productFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  productPrice: {
    fontSize: 14,
    color: '#e74c3c',
    fontWeight: '600',
  },
  productQuantity: {
    fontSize: 12,
    color: '#7f8c8d',
  },
  orderFooter: {
    marginBottom: 12,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#f8f9fa',
  },
  orderDate: {
    fontSize: 12,
    color: '#7f8c8d',
    marginBottom: 4,
  },
  orderTotal: {
    fontSize: 14,
    color: '#2c3e50',
    fontWeight: '600',
    textAlign: 'right',
  },
  orderActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  actionButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 16,
    marginLeft: 8,
  },
  cancelButton: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#dc3545',
  },
  cancelButtonText: {
    fontSize: 12,
    color: '#dc3545',
    fontWeight: '500',
  },
  payButton: {
    backgroundColor: '#e74c3c',
  },
  payButtonText: {
    fontSize: 12,
    color: '#fff',
    fontWeight: '500',
  },
  confirmButton: {
    backgroundColor: '#28a745',
  },
  confirmButtonText: {
    fontSize: 12,
    color: '#fff',
    fontWeight: '500',
  },
  reviewButton: {
    backgroundColor: '#ffc107',
  },
  reviewButtonText: {
    fontSize: 12,
    color: '#212529',
    fontWeight: '500',
  },
});