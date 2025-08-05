import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Image,
  TouchableOpacity,
  TextInput,
  FlatList,
  Alert,
  RefreshControl,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Product, Category, User } from '@/types';
import { productApi } from '@/services/api';

export default function HomeScreen() {
  const [user, setUser] = useState<User | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [searchText, setSearchText] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const router = useRouter();

  useEffect(() => {
    checkUserToken();
    loadData();
  }, []);

  const checkUserToken = async () => {
    try {
      const token = await AsyncStorage.getItem('userToken');
      if (!token) {
        router.replace('/auth/login');
        return;
      }

      const userInfoStr = await AsyncStorage.getItem('userInfo');
      if (userInfoStr) {
        const userInfo = JSON.parse(userInfoStr);
        setUser(userInfo);
      }
    } catch (error) {
      console.error('检查用户token失败:', error);
      router.replace('/auth/login');
    }
  };

  const loadData = async () => {
    setLoading(true);
    try {
      const [productsRes, categoriesRes] = await Promise.all([
        productApi.getProducts({ page: 1, limit: 20 }),
        productApi.getCategories(),
      ]);

      if (productsRes.success) {
        setProducts(productsRes.data.products);
      }

      if (categoriesRes.success) {
        setCategories(categoriesRes.data);
      }
    } catch (_error) {
      Alert.alert('错误', '加载数据失败，请重试');
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const handleSearch = async () => {
    if (!searchText.trim()) {
      return;
    }

    setLoading(true);
    try {
      const response = await productApi.getProducts({
        keyword: searchText,
        category: selectedCategory,
      });

      if (response.success) {
        setProducts(response.data.products);
      }
    } catch (_error) {
      Alert.alert('错误', '搜索失败，请重试');
    } finally {
      setLoading(false);
    }
  };

  const handleCategorySelect = async (categoryId: string) => {
    setSelectedCategory(categoryId);
    setLoading(true);
    
    try {
      const response = await productApi.getProducts({
        category: categoryId || undefined,
        keyword: searchText || undefined,
      });

      if (response.success) {
        setProducts(response.data.products);
      }
    } catch (_error) {
      Alert.alert('错误', '加载分类商品失败，请重试');
    } finally {
      setLoading(false);
    }
  };

  const goToProductDetail = (productId: string) => {
    router.push(`/product/${productId}`);
  };

  const formatPrice = (price: number) => {
    return `¥${price.toFixed(2)}`;
  };

  const renderCategoryItem = ({ item }: { item: Category }) => (
    <TouchableOpacity
      style={[
        styles.categoryItem,
        selectedCategory === item.id && styles.categoryItemSelected,
      ]}
      onPress={() => handleCategorySelect(item.id)}
    >
      <Text style={styles.categoryIcon}>{item.icon}</Text>
      <Text
        style={[
          styles.categoryText,
          selectedCategory === item.id && styles.categoryTextSelected,
        ]}
      >
        {item.name}
      </Text>
    </TouchableOpacity>
  );

  const renderProductItem = ({ item }: { item: Product }) => (
    <TouchableOpacity
      style={styles.productItem}
      onPress={() => goToProductDetail(item.id)}
    >
      <Image source={{ uri: item.images[0] }} style={styles.productImage} />
      <View style={styles.productInfo}>
        <Text style={styles.productName} numberOfLines={2}>
          {item.name}
        </Text>
        <Text style={styles.productDesc} numberOfLines={1}>
          {item.description}
        </Text>
        <View style={styles.productFooter}>
          <View style={styles.priceContainer}>
            <Text style={styles.price}>{formatPrice(item.price)}</Text>
            {item.originalPrice && (
              <Text style={styles.originalPrice}>
                {formatPrice(item.originalPrice)}
              </Text>
            )}
          </View>
          <Text style={styles.sales}>已售{item.sales}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />
      
      {/* 头部 */}
      <View style={styles.header}>
        <Text style={styles.greeting}>
          {user ? `你好，${user.realName || user.username}` : '内蒙特产商城'}
        </Text>
        <Text style={styles.subGreeting}>发现草原好物</Text>
      </View>

      {/* 搜索框 */}
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="搜索特产商品..."
          value={searchText}
          onChangeText={setSearchText}
          onSubmitEditing={handleSearch}
          returnKeyType="search"
        />
        <TouchableOpacity style={styles.searchButton} onPress={handleSearch}>
          <Text style={styles.searchButtonText}>搜索</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* 分类选择 */}
        <View style={styles.categoriesContainer}>
          <TouchableOpacity
            style={[
              styles.categoryItem,
              selectedCategory === '' && styles.categoryItemSelected,
            ]}
            onPress={() => handleCategorySelect('')}
          >
            <Text style={styles.categoryIcon}>🏪</Text>
            <Text
              style={[
                styles.categoryText,
                selectedCategory === '' && styles.categoryTextSelected,
              ]}
            >
              全部
            </Text>
          </TouchableOpacity>
          <FlatList
            data={categories}
            renderItem={renderCategoryItem}
            keyExtractor={(item) => item.id}
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.categoriesList}
          />
        </View>

        {/* 商品列表 */}
        <View style={styles.productsContainer}>
          <Text style={styles.sectionTitle}>
            {selectedCategory ? '分类商品' : '推荐商品'}
          </Text>
          {loading ? (
            <Text style={styles.loadingText}>加载中...</Text>
          ) : (
            <FlatList
              data={products}
              renderItem={renderProductItem}
              keyExtractor={(item) => item.id}
              numColumns={2}
              columnWrapperStyle={styles.productRow}
              showsVerticalScrollIndicator={false}
              scrollEnabled={false}
            />
          )}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    backgroundColor: '#fff',
    paddingTop: 50,
    paddingBottom: 20,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
  },
  greeting: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2c3e50',
  },
  subGreeting: {
    fontSize: 14,
    color: '#7f8c8d',
    marginTop: 4,
  },
  searchContainer: {
    flexDirection: 'row',
    padding: 16,
    backgroundColor: '#fff',
    alignItems: 'center',
  },
  searchInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#e1e8ed',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: '#f8f9fa',
    marginRight: 12,
  },
  searchButton: {
    backgroundColor: '#e74c3c',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
  },
  searchButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
  content: {
    flex: 1,
  },
  categoriesContainer: {
    backgroundColor: '#fff',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
  },
  categoriesList: {
    paddingLeft: 16,
  },
  categoryItem: {
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginRight: 12,
    borderRadius: 20,
    backgroundColor: '#f8f9fa',
    minWidth: 60,
  },
  categoryItemSelected: {
    backgroundColor: '#e74c3c',
  },
  categoryIcon: {
    fontSize: 20,
    marginBottom: 4,
  },
  categoryText: {
    fontSize: 12,
    color: '#495057',
    fontWeight: '500',
  },
  categoryTextSelected: {
    color: '#fff',
  },
  productsContainer: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 16,
  },
  loadingText: {
    textAlign: 'center',
    color: '#7f8c8d',
    marginTop: 40,
  },
  productRow: {
    justifyContent: 'space-between',
  },
  productItem: {
    backgroundColor: '#fff',
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 16,
    width: '48%',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  productImage: {
    width: '100%',
    height: 140,
    resizeMode: 'cover',
  },
  productInfo: {
    padding: 12,
  },
  productName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2c3e50',
    marginBottom: 4,
  },
  productDesc: {
    fontSize: 12,
    color: '#7f8c8d',
    marginBottom: 8,
  },
  productFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  price: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#e74c3c',
  },
  originalPrice: {
    fontSize: 12,
    color: '#95a5a6',
    textDecorationLine: 'line-through',
    marginLeft: 4,
  },
  sales: {
    fontSize: 11,
    color: '#7f8c8d',
  },
});