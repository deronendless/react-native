import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Image,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Order, OrderStatus } from '@/types';
import { orderApi, getOrderStatusText, getOrderStatusColor } from '@/services/api';

export default function OrderDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    if (id) {
      loadOrderDetail();
    }
  }, [id]);

  const loadOrderDetail = async () => {
    try {
      const response = await orderApi.getOrderDetail(id!);
      if (response.success) {
        setOrder(response.data);
      } else {
        Alert.alert('错误', response.message);
        router.back();
      }
    } catch (_error) {
      Alert.alert('错误', '加载订单详情失败');
      router.back();
    } finally {
      setLoading(false);
    }
  };

  const handleCancelOrder = async () => {
    if (!order) return;

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
              const response = await orderApi.cancelOrder(order.id);
              if (response.success) {
                setOrder(response.data);
                Alert.alert('成功', '订单已取消');
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
      second: '2-digit',
    });
  };

  const formatPrice = (price: number) => {
    return `¥${price.toFixed(2)}`;
  };

  const getStatusSteps = (status: OrderStatus) => {
    const allSteps = [
      { key: 'pending', label: '待付款', completed: false },
      { key: 'paid', label: '已付款', completed: false },
      { key: 'shipped', label: '已发货', completed: false },
      { key: 'delivered', label: '已送达', completed: false },
    ];

    const statusOrder = ['pending', 'paid', 'shipped', 'delivered'];
    const currentIndex = statusOrder.indexOf(status);

    if (status === 'cancelled' || status === 'refunded') {
      return [{ key: status, label: getOrderStatusText(status), completed: true }];
    }

    return allSteps.map((step, index) => ({
      ...step,
      completed: index <= currentIndex,
      current: index === currentIndex,
    }));
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#e74c3c" />
        <Text style={styles.loadingText}>加载中...</Text>
      </View>
    );
  }

  if (!order) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>订单不存在</Text>
      </View>
    );
  }

  const statusSteps = getStatusSteps(order.status);

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />
      
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* 订单状态 */}
        <View style={styles.statusSection}>
          <View style={styles.statusHeader}>
            <Text style={[styles.statusText, { color: getOrderStatusColor(order.status) }]}>
              {getOrderStatusText(order.status)}
            </Text>
            <Text style={styles.orderId}>订单号: {order.id}</Text>
          </View>

          {/* 物流信息 */}
          {order.trackingNumber && (
            <View style={styles.trackingInfo}>
              <Text style={styles.trackingLabel}>物流单号:</Text>
              <Text style={styles.trackingNumber}>{order.trackingNumber}</Text>
            </View>
          )}

          {order.estimatedDelivery && (
            <View style={styles.trackingInfo}>
              <Text style={styles.trackingLabel}>预计送达:</Text>
              <Text style={styles.estimatedDelivery}>{order.estimatedDelivery}</Text>
            </View>
          )}

          {/* 订单状态进度 */}
          <View style={styles.progressContainer}>
            {statusSteps.map((step, index) => (
              <View key={step.key} style={styles.progressStep}>
                <View style={styles.progressLine}>
                  {index > 0 && (
                    <View 
                      style={[
                        styles.progressLineFill,
                        step.completed && styles.progressLineFillCompleted,
                      ]} 
                    />
                  )}
                </View>
                <View 
                  style={[
                    styles.progressDot,
                    step.completed && styles.progressDotCompleted,
                    step.current && styles.progressDotCurrent,
                  ]}
                />
                <Text 
                  style={[
                    styles.progressLabel,
                    step.completed && styles.progressLabelCompleted,
                    step.current && styles.progressLabelCurrent,
                  ]}
                >
                  {step.label}
                </Text>
              </View>
            ))}
          </View>
        </View>

        {/* 收货地址 */}
        <View style={styles.addressSection}>
          <Text style={styles.sectionTitle}>收货地址</Text>
          <View style={styles.addressInfo}>
            <Text style={styles.addressName}>
              {order.shippingAddress.name} {order.shippingAddress.phone}
            </Text>
            <Text style={styles.addressDetail}>
              {order.shippingAddress.province} {order.shippingAddress.city} {order.shippingAddress.district}
            </Text>
            <Text style={styles.addressDetail}>
              {order.shippingAddress.detail}
            </Text>
          </View>
        </View>

        {/* 商品信息 */}
        <View style={styles.productsSection}>
          <Text style={styles.sectionTitle}>商品信息</Text>
          {order.items.map((item, index) => (
            <View key={index} style={styles.productItem}>
              <Image source={{ uri: item.productImage }} style={styles.productImage} />
              <View style={styles.productInfo}>
                <Text style={styles.productName}>{item.productName}</Text>
                {item.specifications && (
                  <Text style={styles.productSpecs}>
                    {Object.entries(item.specifications).map(([key, value]) => 
                      `${key}: ${value}`
                    ).join(', ')}
                  </Text>
                )}
                <View style={styles.productFooter}>
                  <Text style={styles.productPrice}>
                    {formatPrice(item.price)}
                  </Text>
                  <Text style={styles.productQuantity}>
                    x{item.quantity}
                  </Text>
                </View>
              </View>
            </View>
          ))}
        </View>

        {/* 订单信息 */}
        <View style={styles.orderInfoSection}>
          <Text style={styles.sectionTitle}>订单信息</Text>
          
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>订单号:</Text>
            <Text style={styles.infoValue}>{order.id}</Text>
          </View>
          
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>下单时间:</Text>
            <Text style={styles.infoValue}>{formatDate(order.createdAt)}</Text>
          </View>
          
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>支付方式:</Text>
            <Text style={styles.infoValue}>{order.paymentMethod}</Text>
          </View>
          
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>商品总计:</Text>
            <Text style={styles.infoValue}>
              {formatPrice(order.items.reduce((sum, item) => 
                sum + item.price * item.quantity, 0
              ))}
            </Text>
          </View>
          
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>运费:</Text>
            <Text style={styles.infoValue}>免运费</Text>
          </View>
          
          <View style={[styles.infoRow, styles.totalRow]}>
            <Text style={styles.totalLabel}>实付款:</Text>
            <Text style={styles.totalValue}>{formatPrice(order.totalAmount)}</Text>
          </View>
        </View>

        <View style={styles.bottomPadding} />
      </ScrollView>

      {/* 底部操作栏 */}
      {order.status === OrderStatus.PENDING && (
        <View style={styles.bottomBar}>
          <TouchableOpacity
            style={[styles.actionButton, styles.cancelButton]}
            onPress={handleCancelOrder}
          >
            <Text style={styles.cancelButtonText}>取消订单</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.actionButton, styles.payButton]}
            onPress={() => Alert.alert('提示', '支付功能开发中...')}
          >
            <Text style={styles.payButtonText}>立即支付</Text>
          </TouchableOpacity>
        </View>
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
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    color: '#e74c3c',
    fontSize: 16,
  },
  content: {
    flex: 1,
  },
  statusSection: {
    backgroundColor: '#fff',
    padding: 20,
    borderBottomWidth: 8,
    borderBottomColor: '#f8f9fa',
  },
  statusHeader: {
    marginBottom: 16,
  },
  statusText: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  orderId: {
    fontSize: 14,
    color: '#7f8c8d',
  },
  trackingInfo: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  trackingLabel: {
    fontSize: 14,
    color: '#495057',
    width: 80,
  },
  trackingNumber: {
    fontSize: 14,
    color: '#2c3e50',
    fontWeight: '500',
  },
  estimatedDelivery: {
    fontSize: 14,
    color: '#e74c3c',
    fontWeight: '500',
  },
  progressContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  progressStep: {
    flex: 1,
    alignItems: 'center',
    position: 'relative',
  },
  progressLine: {
    position: 'absolute',
    top: 10,
    left: '50%',
    right: '-50%',
    height: 2,
    backgroundColor: '#e9ecef',
  },
  progressLineFill: {
    height: '100%',
    backgroundColor: '#e9ecef',
  },
  progressLineFillCompleted: {
    backgroundColor: '#28a745',
  },
  progressDot: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#e9ecef',
    borderWidth: 2,
    borderColor: '#fff',
    zIndex: 1,
  },
  progressDotCompleted: {
    backgroundColor: '#28a745',
  },
  progressDotCurrent: {
    backgroundColor: '#e74c3c',
  },
  progressLabel: {
    fontSize: 12,
    color: '#7f8c8d',
    marginTop: 8,
    textAlign: 'center',
  },
  progressLabelCompleted: {
    color: '#28a745',
    fontWeight: '500',
  },
  progressLabelCurrent: {
    color: '#e74c3c',
    fontWeight: 'bold',
  },
  addressSection: {
    backgroundColor: '#fff',
    padding: 20,
    borderBottomWidth: 8,
    borderBottomColor: '#f8f9fa',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 12,
  },
  addressInfo: {
    paddingLeft: 4,
  },
  addressName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2c3e50',
    marginBottom: 4,
  },
  addressDetail: {
    fontSize: 14,
    color: '#495057',
    marginBottom: 2,
  },
  productsSection: {
    backgroundColor: '#fff',
    padding: 20,
    borderBottomWidth: 8,
    borderBottomColor: '#f8f9fa',
  },
  productItem: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  productImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
    marginRight: 12,
  },
  productInfo: {
    flex: 1,
  },
  productName: {
    fontSize: 15,
    color: '#2c3e50',
    fontWeight: '500',
    marginBottom: 4,
  },
  productSpecs: {
    fontSize: 12,
    color: '#7f8c8d',
    marginBottom: 8,
  },
  productFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  productPrice: {
    fontSize: 16,
    color: '#e74c3c',
    fontWeight: 'bold',
  },
  productQuantity: {
    fontSize: 14,
    color: '#7f8c8d',
  },
  orderInfoSection: {
    backgroundColor: '#fff',
    padding: 20,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
  },
  infoLabel: {
    fontSize: 14,
    color: '#495057',
  },
  infoValue: {
    fontSize: 14,
    color: '#2c3e50',
    fontWeight: '500',
  },
  totalRow: {
    borderTopWidth: 1,
    borderTopColor: '#e9ecef',
    marginTop: 8,
    paddingTop: 12,
  },
  totalLabel: {
    fontSize: 16,
    color: '#2c3e50',
    fontWeight: 'bold',
  },
  totalValue: {
    fontSize: 18,
    color: '#e74c3c',
    fontWeight: 'bold',
  },
  bottomPadding: {
    height: 100,
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    padding: 16,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#e9ecef',
  },
  actionButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginHorizontal: 8,
  },
  cancelButton: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#dc3545',
  },
  cancelButtonText: {
    color: '#dc3545',
    fontSize: 16,
    fontWeight: '600',
  },
  payButton: {
    backgroundColor: '#e74c3c',
  },
  payButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});