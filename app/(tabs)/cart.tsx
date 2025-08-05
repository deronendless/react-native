import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  Alert,
  FlatList,
  ActivityIndicator,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useRouter } from 'expo-router';
import { CartItem } from '@/types';
import { cartApi } from '@/services/api';

export default function CartScreen() {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());
  const [updating, setUpdating] = useState<Set<string>>(new Set());
  const router = useRouter();

  useEffect(() => {
    loadCart();
  }, []);

  const loadCart = async () => {
    try {
      const response = await cartApi.getCart();
      if (response.success) {
        setCartItems(response.data);
        // 默认选中所有商品
        const allItemIds = new Set(response.data.map(item => item.id));
        setSelectedItems(allItemIds);
      }
    } catch (_error) {
      Alert.alert('错误', '加载购物车失败');
    } finally {
      setLoading(false);
    }
  };

  const updateItemQuantity = async (itemId: string, quantity: number) => {
    if (updating.has(itemId)) return;

    setUpdating(prev => new Set(prev).add(itemId));
    try {
      const response = await cartApi.updateCartItem(itemId, quantity);
      if (response.success) {
        setCartItems(response.data);
      } else {
        Alert.alert('错误', '更新失败');
      }
    } catch (_error) {
      Alert.alert('错误', '网络错误，请重试');
    } finally {
      setUpdating(prev => {
        const newSet = new Set(prev);
        newSet.delete(itemId);
        return newSet;
      });
    }
  };

  const removeItem = async (itemId: string) => {
    Alert.alert(
      '确认删除',
      '确定要删除这个商品吗？',
      [
        { text: '取消', style: 'cancel' },
        {
          text: '删除',
          style: 'destructive',
          onPress: async () => {
            try {
              const response = await cartApi.removeFromCart(itemId);
              if (response.success) {
                setCartItems(response.data);
                setSelectedItems(prev => {
                  const newSet = new Set(prev);
                  newSet.delete(itemId);
                  return newSet;
                });
              }
            } catch (_error) {
              Alert.alert('错误', '删除失败');
            }
          },
        },
      ]
    );
  };

  const toggleItemSelection = (itemId: string) => {
    setSelectedItems(prev => {
      const newSet = new Set(prev);
      if (newSet.has(itemId)) {
        newSet.delete(itemId);
      } else {
        newSet.add(itemId);
      }
      return newSet;
    });
  };

  const toggleSelectAll = () => {
    if (selectedItems.size === cartItems.length) {
      setSelectedItems(new Set());
    } else {
      setSelectedItems(new Set(cartItems.map(item => item.id)));
    }
  };

  const clearCart = async () => {
    Alert.alert(
      '清空购物车',
      '确定要清空购物车吗？',
      [
        { text: '取消', style: 'cancel' },
        {
          text: '清空',
          style: 'destructive',
          onPress: async () => {
            try {
              const response = await cartApi.clearCart();
              if (response.success) {
                setCartItems([]);
                setSelectedItems(new Set());
              }
            } catch (_error) {
              Alert.alert('错误', '清空失败');
            }
          },
        },
      ]
    );
  };

  const goToCheckout = () => {
    if (selectedItems.size === 0) {
      Alert.alert('提示', '请选择要结算的商品');
      return;
    }

    // TODO: 跳转到结算页面
    Alert.alert('提示', '结算功能开发中...');
  };

  const formatPrice = (price: number) => {
    return `¥${price.toFixed(2)}`;
  };

  const calculateTotal = () => {
    return cartItems
      .filter(item => selectedItems.has(item.id))
      .reduce((total, item) => total + item.product.price * item.quantity, 0);
  };

  const renderCartItem = ({ item }: { item: CartItem }) => {
    const isSelected = selectedItems.has(item.id);
    const isUpdating = updating.has(item.id);

    return (
      <View style={styles.cartItem}>
        <TouchableOpacity
          style={styles.checkbox}
          onPress={() => toggleItemSelection(item.id)}
        >
          <View style={[styles.checkboxInner, isSelected && styles.checkboxSelected]}>
            {isSelected && <Text style={styles.checkmark}>✓</Text>}
          </View>
        </TouchableOpacity>

        <Image source={{ uri: item.product.images[0] }} style={styles.productImage} />

        <View style={styles.productInfo}>
          <Text style={styles.productName} numberOfLines={2}>
            {item.product.name}
          </Text>
          
          {item.selectedSpecs && (
            <Text style={styles.productSpecs}>
              {Object.entries(item.selectedSpecs).map(([key, value]) => `${key}: ${value}`).join(', ')}
            </Text>
          )}

          <View style={styles.priceRow}>
            <Text style={styles.price}>{formatPrice(item.product.price)}</Text>
            <View style={styles.quantityContainer}>
              <TouchableOpacity
                style={[styles.quantityButton, (item.quantity <= 1 || isUpdating) && styles.quantityButtonDisabled]}
                onPress={() => updateItemQuantity(item.id, item.quantity - 1)}
                disabled={item.quantity <= 1 || isUpdating}
              >
                <Text style={[styles.quantityButtonText, (item.quantity <= 1 || isUpdating) && styles.quantityButtonTextDisabled]}>
                  -
                </Text>
              </TouchableOpacity>
              
              {isUpdating ? (
                <ActivityIndicator size="small" color="#e74c3c" style={styles.quantityIndicator} />
              ) : (
                <Text style={styles.quantity}>{item.quantity}</Text>
              )}
              
              <TouchableOpacity
                style={[styles.quantityButton, (item.quantity >= item.product.stock || isUpdating) && styles.quantityButtonDisabled]}
                onPress={() => updateItemQuantity(item.id, item.quantity + 1)}
                disabled={item.quantity >= item.product.stock || isUpdating}
              >
                <Text style={[styles.quantityButtonText, (item.quantity >= item.product.stock || isUpdating) && styles.quantityButtonTextDisabled]}>
                  +
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        <TouchableOpacity
          style={styles.deleteButton}
          onPress={() => removeItem(item.id)}
        >
          <Text style={styles.deleteButtonText}>删除</Text>
        </TouchableOpacity>
      </View>
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#e74c3c" />
        <Text style={styles.loadingText}>加载中...</Text>
      </View>
    );
  }

  if (cartItems.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <StatusBar style="dark" />
        <View style={styles.emptyContent}>
          <Text style={styles.emptyIcon}>🛒</Text>
          <Text style={styles.emptyText}>购物车空空如也</Text>
          <Text style={styles.emptySubText}>快去挑选心仪的商品吧</Text>
          <TouchableOpacity
            style={styles.shopButton}
            onPress={() => router.push('/(tabs)')}
          >
            <Text style={styles.shopButtonText}>去购物</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />
      
      {/* 头部 */}
      <View style={styles.header}>
        <Text style={styles.title}>购物车</Text>
        <TouchableOpacity onPress={clearCart}>
          <Text style={styles.clearButton}>清空</Text>
        </TouchableOpacity>
      </View>

      {/* 商品列表 */}
      <FlatList
        data={cartItems}
        renderItem={renderCartItem}
        keyExtractor={(item) => item.id}
        style={styles.cartList}
        showsVerticalScrollIndicator={false}
      />

      {/* 底部结算栏 */}
      <View style={styles.bottomBar}>
        <View style={styles.selectAllContainer}>
          <TouchableOpacity
            style={styles.selectAllButton}
            onPress={toggleSelectAll}
          >
            <View style={[styles.checkboxInner, selectedItems.size === cartItems.length && styles.checkboxSelected]}>
              {selectedItems.size === cartItems.length && <Text style={styles.checkmark}>✓</Text>}
            </View>
            <Text style={styles.selectAllText}>全选</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.totalContainer}>
          <Text style={styles.totalLabel}>合计:</Text>
          <Text style={styles.totalPrice}>{formatPrice(calculateTotal())}</Text>
        </View>

        <TouchableOpacity
          style={[styles.checkoutButton, selectedItems.size === 0 && styles.checkoutButtonDisabled]}
          onPress={goToCheckout}
          disabled={selectedItems.size === 0}
        >
          <Text style={styles.checkoutButtonText}>
            结算({selectedItems.size})
          </Text>
        </TouchableOpacity>
      </View>
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
    backgroundColor: '#f8f9fa',
  },
  emptyContent: {
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
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2c3e50',
  },
  clearButton: {
    fontSize: 14,
    color: '#e74c3c',
  },
  cartList: {
    flex: 1,
  },
  cartItem: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f8f9fa',
    alignItems: 'flex-start',
  },
  checkbox: {
    marginRight: 12,
    marginTop: 4,
  },
  checkboxInner: {
    width: 20,
    height: 20,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 4,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  checkboxSelected: {
    backgroundColor: '#e74c3c',
    borderColor: '#e74c3c',
  },
  checkmark: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
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
    fontSize: 14,
    fontWeight: '600',
    color: '#2c3e50',
    marginBottom: 4,
  },
  productSpecs: {
    fontSize: 12,
    color: '#7f8c8d',
    marginBottom: 8,
  },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  price: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#e74c3c',
  },
  quantityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  quantityButton: {
    width: 28,
    height: 28,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 4,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  quantityButtonDisabled: {
    backgroundColor: '#f8f9fa',
    borderColor: '#e9ecef',
  },
  quantityButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#495057',
  },
  quantityButtonTextDisabled: {
    color: '#adb5bd',
  },
  quantity: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2c3e50',
    marginHorizontal: 12,
    minWidth: 20,
    textAlign: 'center',
  },
  quantityIndicator: {
    marginHorizontal: 12,
    width: 20,
  },
  deleteButton: {
    marginLeft: 12,
    paddingVertical: 4,
  },
  deleteButtonText: {
    fontSize: 12,
    color: '#e74c3c',
  },
  bottomBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 20,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#e9ecef',
  },
  selectAllContainer: {
    marginRight: 16,
  },
  selectAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  selectAllText: {
    fontSize: 14,
    color: '#495057',
    marginLeft: 8,
  },
  totalContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    marginRight: 16,
  },
  totalLabel: {
    fontSize: 14,
    color: '#495057',
  },
  totalPrice: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#e74c3c',
    marginLeft: 4,
  },
  checkoutButton: {
    backgroundColor: '#e74c3c',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 20,
  },
  checkoutButtonDisabled: {
    backgroundColor: '#bdc3c7',
  },
  checkoutButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
});