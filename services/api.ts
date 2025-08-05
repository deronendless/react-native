import {
    Address,
    ApiResponse,
    CartItem,
    Category,
    Order,
    Pagination,
    Product,
    User
} from '@/types';
import {
    getOrderStatusColor,
    getOrderStatusText,
    mockAddresses,
    mockCategories,
    mockOrders,
    mockProducts,
    mockUsers
} from './mockData';

// 模拟网络延迟
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// 模拟API响应
const createResponse = <T>(data: T, success = true, message = 'Success'): ApiResponse<T> => ({
  success,
  data,
  message,
  code: success ? 200 : 400,
});

// 用户认证相关API
export const authApi = {
  // 登录
  login: async (username: string, password: string): Promise<ApiResponse<{ user: User; token: string }>> => {
    await delay(1000);
    
    const user = mockUsers.find(u => u.username === username);
    if (user && password === '123456') { // 简单的密码验证
      return createResponse({
        user,
        token: 'mock_token_' + user.id,
      });
    }
    
    return createResponse(null as any, false, '用户名或密码错误');
  },

  // 注册
  register: async (userData: {
    username: string;
    email: string;
    phone: string;
    password: string;
  }): Promise<ApiResponse<{ user: User; token: string }>> => {
    await delay(1000);
    
    // 检查用户名是否存在
    const existingUser = mockUsers.find(u => u.username === userData.username);
    if (existingUser) {
      return createResponse(null as any, false, '用户名已存在');
    }
    
    const newUser: User = {
      id: Date.now().toString(),
      username: userData.username,
      email: userData.email,
      phone: userData.phone,
      createdAt: new Date().toISOString(),
    };
    
    mockUsers.push(newUser);
    
    return createResponse({
      user: newUser,
      token: 'mock_token_' + newUser.id,
    });
  },

  // 获取用户信息
  getUserInfo: async (token: string): Promise<ApiResponse<User>> => {
    await delay(500);
    
    const userId = token.replace('mock_token_', '');
    const user = mockUsers.find(u => u.id === userId);
    
    if (user) {
      return createResponse(user);
    }
    
    return createResponse(null as any, false, '用户不存在');
  },

  // 更新用户信息
  updateUserInfo: async (token: string, userData: Partial<User>): Promise<ApiResponse<User>> => {
    await delay(800);
    
    const userId = token.replace('mock_token_', '');
    const userIndex = mockUsers.findIndex(u => u.id === userId);
    
    if (userIndex !== -1) {
      mockUsers[userIndex] = { ...mockUsers[userIndex], ...userData };
      return createResponse(mockUsers[userIndex]);
    }
    
    return createResponse(null as any, false, '更新失败');
  },
};

// 商品相关API
export const productApi = {
  // 获取商品列表
  getProducts: async (params?: {
    page?: number;
    limit?: number;
    category?: string;
    keyword?: string;
  }): Promise<ApiResponse<{ products: Product[]; pagination: Pagination }>> => {
    await delay(800);
    
    let filteredProducts = [...mockProducts];
    
    // 分类筛选
    if (params?.category) {
      filteredProducts = filteredProducts.filter(p => p.category === params.category);
    }
    
    // 关键词搜索
    if (params?.keyword) {
      const keyword = params.keyword.toLowerCase();
      filteredProducts = filteredProducts.filter(p => 
        p.name.toLowerCase().includes(keyword) || 
        p.description.toLowerCase().includes(keyword)
      );
    }
    
    const page = params?.page || 1;
    const limit = params?.limit || 10;
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    
    const products = filteredProducts.slice(startIndex, endIndex);
    const pagination: Pagination = {
      page,
      limit,
      total: filteredProducts.length,
      totalPages: Math.ceil(filteredProducts.length / limit),
    };
    
    return createResponse({ products, pagination });
  },

  // 获取商品详情
  getProductDetail: async (productId: string): Promise<ApiResponse<Product>> => {
    await delay(500);
    
    const product = mockProducts.find(p => p.id === productId);
    if (product) {
      return createResponse(product);
    }
    
    return createResponse(null as any, false, '商品不存在');
  },

  // 获取商品分类
  getCategories: async (): Promise<ApiResponse<Category[]>> => {
    await delay(300);
    return createResponse(mockCategories);
  },
};

// 购物车相关API (使用本地存储模拟)
let mockCart: CartItem[] = [];

export const cartApi = {
  // 获取购物车
  getCart: async (): Promise<ApiResponse<CartItem[]>> => {
    await delay(300);
    return createResponse(mockCart);
  },

  // 添加到购物车
  addToCart: async (item: Omit<CartItem, 'id'>): Promise<ApiResponse<CartItem[]>> => {
    await delay(500);
    
    const existingItemIndex = mockCart.findIndex(
      cartItem => cartItem.product.id === item.product.id
    );
    
    if (existingItemIndex !== -1) {
      mockCart[existingItemIndex].quantity += item.quantity;
    } else {
      const newItem: CartItem = {
        id: Date.now().toString(),
        ...item,
      };
      mockCart.push(newItem);
    }
    
    return createResponse(mockCart);
  },

  // 更新购物车商品数量
  updateCartItem: async (itemId: string, quantity: number): Promise<ApiResponse<CartItem[]>> => {
    await delay(300);
    
    const itemIndex = mockCart.findIndex(item => item.id === itemId);
    if (itemIndex !== -1) {
      if (quantity <= 0) {
        mockCart.splice(itemIndex, 1);
      } else {
        mockCart[itemIndex].quantity = quantity;
      }
    }
    
    return createResponse(mockCart);
  },

  // 删除购物车商品
  removeFromCart: async (itemId: string): Promise<ApiResponse<CartItem[]>> => {
    await delay(300);
    
    mockCart = mockCart.filter(item => item.id !== itemId);
    return createResponse(mockCart);
  },

  // 清空购物车
  clearCart: async (): Promise<ApiResponse<CartItem[]>> => {
    await delay(300);
    
    mockCart = [];
    return createResponse(mockCart);
  },
};

// 订单相关API
export const orderApi = {
  // 获取订单列表
  getOrders: async (userId: string, params?: {
    page?: number;
    limit?: number;
    status?: string;
  }): Promise<ApiResponse<{ orders: Order[]; pagination: Pagination }>> => {
    await delay(800);
    
    console.log('API getOrders called with userId:', userId, 'params:', params);
    console.log('Available orders:', mockOrders);
    
    let filteredOrders = mockOrders.filter(order => order.userId === userId);
    console.log('Filtered orders by userId:', filteredOrders);
    
    // 状态筛选
    if (params?.status) {
      filteredOrders = filteredOrders.filter(order => order.status === params.status);
      console.log('Filtered orders by status:', filteredOrders);
    }
    
    // 按创建时间倒序排列
    filteredOrders.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    
    const page = params?.page || 1;
    const limit = params?.limit || 10;
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    
    const orders = filteredOrders.slice(startIndex, endIndex);
    const pagination: Pagination = {
      page,
      limit,
      total: filteredOrders.length,
      totalPages: Math.ceil(filteredOrders.length / limit),
    };
    
    const result = { orders, pagination };
    console.log('API getOrders result:', result);
    return createResponse(result);
  },

  // 获取订单详情
  getOrderDetail: async (orderId: string): Promise<ApiResponse<Order>> => {
    await delay(500);
    
    const order = mockOrders.find(o => o.id === orderId);
    if (order) {
      return createResponse(order);
    }
    
    return createResponse(null as any, false, '订单不存在');
  },

  // 创建订单
  createOrder: async (orderData: Omit<Order, 'id' | 'createdAt' | 'updatedAt'>): Promise<ApiResponse<Order>> => {
    await delay(1000);
    
    const newOrder: Order = {
      ...orderData,
      id: 'ORD' + Date.now(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    
    mockOrders.push(newOrder);
    return createResponse(newOrder);
  },

  // 取消订单
  cancelOrder: async (orderId: string): Promise<ApiResponse<Order>> => {
    await delay(800);
    
    const orderIndex = mockOrders.findIndex(o => o.id === orderId);
    if (orderIndex !== -1) {
      mockOrders[orderIndex].status = 'cancelled' as any;
      mockOrders[orderIndex].updatedAt = new Date().toISOString();
      return createResponse(mockOrders[orderIndex]);
    }
    
    return createResponse(null as any, false, '订单不存在');
  },
};

// 地址相关API
export const addressApi = {
  // 获取地址列表
  getAddresses: async (userId: string): Promise<ApiResponse<Address[]>> => {
    await delay(500);
    
    const addresses = mockAddresses.filter(addr => addr.userId === userId);
    return createResponse(addresses);
  },

  // 添加地址
  addAddress: async (addressData: Omit<Address, 'id'>): Promise<ApiResponse<Address>> => {
    await delay(800);
    
    const newAddress: Address = {
      ...addressData,
      id: Date.now().toString(),
    };
    
    // 如果设置为默认地址，先取消其他默认地址
    if (newAddress.isDefault) {
      mockAddresses.forEach(addr => {
        if (addr.userId === addressData.userId) {
          addr.isDefault = false;
        }
      });
    }
    
    mockAddresses.push(newAddress);
    return createResponse(newAddress);
  },

  // 更新地址
  updateAddress: async (addressId: string, addressData: Partial<Address>): Promise<ApiResponse<Address>> => {
    await delay(800);
    
    const addressIndex = mockAddresses.findIndex(addr => addr.id === addressId);
    if (addressIndex !== -1) {
      // 如果设置为默认地址，先取消其他默认地址
      if (addressData.isDefault) {
        mockAddresses.forEach(addr => {
          if (addr.userId === mockAddresses[addressIndex].userId) {
            addr.isDefault = false;
          }
        });
      }
      
      mockAddresses[addressIndex] = { ...mockAddresses[addressIndex], ...addressData };
      return createResponse(mockAddresses[addressIndex]);
    }
    
    return createResponse(null as any, false, '地址不存在');
  },

  // 删除地址
  deleteAddress: async (addressId: string): Promise<ApiResponse<boolean>> => {
    await delay(500);
    
    const addressIndex = mockAddresses.findIndex(addr => addr.id === addressId);
    if (addressIndex !== -1) {
      mockAddresses.splice(addressIndex, 1);
      return createResponse(true);
    }
    
    return createResponse(false, false, '地址不存在');
  },
};

// 导出辅助函数
export { getOrderStatusColor, getOrderStatusText };
