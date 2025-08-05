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
  FlatList,
  Dimensions,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Product } from '@/types';
import { productApi, cartApi } from '@/services/api';

const { width: screenWidth } = Dimensions.get('window');

export default function ProductDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [addingToCart, setAddingToCart] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const router = useRouter();

  useEffect(() => {
    if (id) {
      loadProductDetail();
    }
  }, [id]);

  const loadProductDetail = async () => {
    try {
      const response = await productApi.getProductDetail(id!);
      if (response.success) {
        setProduct(response.data);
      } else {
        Alert.alert('错误', response.message);
        router.back();
      }
    } catch (_error) {
      Alert.alert('错误', '加载商品详情失败');
      router.back();
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = async () => {
    if (!product) return;

    setAddingToCart(true);
    try {
      const response = await cartApi.addToCart({
        product,
        quantity,
      });

      if (response.success) {
        Alert.alert('成功', `已添加${quantity}件商品到购物车`, [
          { text: '继续购物', style: 'cancel' },
          { text: '去购物车', onPress: () => router.push('/(tabs)/cart') },
        ]);
      } else {
        Alert.alert('错误', '添加到购物车失败');
      }
    } catch (_error) {
      Alert.alert('错误', '网络错误，请重试');
    } finally {
      setAddingToCart(false);
    }
  };

  const handleBuyNow = () => {
    // TODO: 实现立即购买功能
    Alert.alert('提示', '立即购买功能开发中...');
  };

  const updateQuantity = (delta: number) => {
    const newQuantity = quantity + delta;
    if (newQuantity >= 1 && newQuantity <= (product?.stock || 1)) {
      setQuantity(newQuantity);
    }
  };

  const formatPrice = (price: number) => {
    return `¥${price.toFixed(2)}`;
  };

  const renderImageItem = ({ item }: { item: string; index: number }) => (
    <Image source={{ uri: item }} style={styles.productImage} />
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#e74c3c" />
        <Text style={styles.loadingText}>加载中...</Text>
      </View>
    );
  }

  if (!product) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>商品不存在</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />
      
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* 商品图片轮播 */}
        <View style={styles.imageContainer}>
          <FlatList
            data={product.images}
            renderItem={renderImageItem}
            keyExtractor={(item, index) => index.toString()}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            onMomentumScrollEnd={(event) => {
              const index = Math.round(event.nativeEvent.contentOffset.x / screenWidth);
              setCurrentImageIndex(index);
            }}
          />
          {product.images.length > 1 && (
            <View style={styles.imageIndicator}>
              {product.images.map((_, index) => (
                <View
                  key={index}
                  style={[
                    styles.indicatorDot,
                    index === currentImageIndex && styles.indicatorDotActive,
                  ]}
                />
              ))}
            </View>
          )}
        </View>

        {/* 商品基本信息 */}
        <View style={styles.productInfo}>
          <Text style={styles.productName}>{product.name}</Text>
          <Text style={styles.productDesc}>{product.description}</Text>
          
          <View style={styles.priceContainer}>
            <Text style={styles.price}>{formatPrice(product.price)}</Text>
            {product.originalPrice && (
              <Text style={styles.originalPrice}>
                {formatPrice(product.originalPrice)}
              </Text>
            )}
          </View>

          <View style={styles.statsContainer}>
            <Text style={styles.stats}>销量: {product.sales}</Text>
            <Text style={styles.stats}>库存: {product.stock}</Text>
            <Text style={styles.stats}>评分: {product.rating}分</Text>
            <Text style={styles.stats}>评价: {product.reviews}条</Text>
          </View>

          {product.tags && product.tags.length > 0 && (
            <View style={styles.tagsContainer}>
              {product.tags.map((tag, index) => (
                <View key={index} style={styles.tag}>
                  <Text style={styles.tagText}>{tag}</Text>
                </View>
              ))}
            </View>
          )}
        </View>

        {/* 商品规格 */}
        {product.specifications && (
          <View style={styles.specsContainer}>
            <Text style={styles.sectionTitle}>商品规格</Text>
            {Object.entries(product.specifications).map(([key, value]) => (
              <View key={key} style={styles.specItem}>
                <Text style={styles.specKey}>{key}:</Text>
                <Text style={styles.specValue}>{value}</Text>
              </View>
            ))}
          </View>
        )}

        {/* 数量选择 */}
        <View style={styles.quantityContainer}>
          <Text style={styles.sectionTitle}>购买数量</Text>
          <View style={styles.quantitySelector}>
            <TouchableOpacity
              style={[styles.quantityButton, quantity <= 1 && styles.quantityButtonDisabled]}
              onPress={() => updateQuantity(-1)}
              disabled={quantity <= 1}
            >
              <Text style={[styles.quantityButtonText, quantity <= 1 && styles.quantityButtonTextDisabled]}>
                -
              </Text>
            </TouchableOpacity>
            <Text style={styles.quantityText}>{quantity}</Text>
            <TouchableOpacity
              style={[styles.quantityButton, quantity >= product.stock && styles.quantityButtonDisabled]}
              onPress={() => updateQuantity(1)}
              disabled={quantity >= product.stock}
            >
              <Text style={[styles.quantityButtonText, quantity >= product.stock && styles.quantityButtonTextDisabled]}>
                +
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.bottomPadding} />
      </ScrollView>

      {/* 底部操作栏 */}
      <View style={styles.bottomBar}>
        <TouchableOpacity
          style={styles.cartButton}
          onPress={handleAddToCart}
          disabled={addingToCart || product.stock === 0}
        >
          {addingToCart ? (
            <ActivityIndicator color="#fff" size="small" />
          ) : (
            <Text style={styles.cartButtonText}>加入购物车</Text>
          )}
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.buyButton, product.stock === 0 && styles.buyButtonDisabled]}
          onPress={handleBuyNow}
          disabled={product.stock === 0}
        >
          <Text style={styles.buyButtonText}>
            {product.stock === 0 ? '暂时缺货' : '立即购买'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
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
  imageContainer: {
    position: 'relative',
  },
  productImage: {
    width: screenWidth,
    height: screenWidth,
    resizeMode: 'cover',
  },
  imageIndicator: {
    position: 'absolute',
    bottom: 16,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
  },
  indicatorDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
    marginHorizontal: 4,
  },
  indicatorDotActive: {
    backgroundColor: '#fff',
  },
  productInfo: {
    padding: 20,
    borderBottomWidth: 8,
    borderBottomColor: '#f8f9fa',
  },
  productName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 8,
  },
  productDesc: {
    fontSize: 14,
    color: '#7f8c8d',
    lineHeight: 20,
    marginBottom: 16,
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  price: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#e74c3c',
  },
  originalPrice: {
    fontSize: 16,
    color: '#95a5a6',
    textDecorationLine: 'line-through',
    marginLeft: 12,
  },
  statsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 16,
  },
  stats: {
    fontSize: 12,
    color: '#7f8c8d',
    marginRight: 16,
    marginBottom: 4,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  tag: {
    backgroundColor: '#e74c3c',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginRight: 8,
    marginBottom: 8,
  },
  tagText: {
    fontSize: 12,
    color: '#fff',
    fontWeight: '500',
  },
  specsContainer: {
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
  specItem: {
    flexDirection: 'row',
    paddingVertical: 6,
  },
  specKey: {
    fontSize: 14,
    color: '#495057',
    width: 80,
  },
  specValue: {
    fontSize: 14,
    color: '#7f8c8d',
    flex: 1,
  },
  quantityContainer: {
    padding: 20,
    borderBottomWidth: 8,
    borderBottomColor: '#f8f9fa',
  },
  quantitySelector: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  quantityButton: {
    width: 36,
    height: 36,
    borderWidth: 1,
    borderColor: '#e1e8ed',
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
    fontSize: 18,
    fontWeight: 'bold',
    color: '#495057',
  },
  quantityButtonTextDisabled: {
    color: '#adb5bd',
  },
  quantityText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2c3e50',
    marginHorizontal: 20,
    minWidth: 30,
    textAlign: 'center',
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
  cartButton: {
    flex: 1,
    backgroundColor: '#f39c12',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginRight: 12,
  },
  cartButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  buyButton: {
    flex: 1,
    backgroundColor: '#e74c3c',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  buyButtonDisabled: {
    backgroundColor: '#bdc3c7',
  },
  buyButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});