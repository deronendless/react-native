// 用户类型定义
export interface User {
  id: string;
  username: string;
  email: string;
  phone: string;
  avatar?: string;
  realName?: string;
  address?: string;
  createdAt: string;
}

// 商品类型定义
export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  originalPrice?: number;
  images: string[];
  category: string;
  stock: number;
  sales: number;
  rating: number;
  reviews: number;
  specifications?: { [key: string]: string };
  tags?: string[];
}

// 购物车商品类型
export interface CartItem {
  id: string;
  product: Product;
  quantity: number;
  selectedSpecs?: { [key: string]: string };
}

// 订单状态枚举
export enum OrderStatus {
  PENDING = 'pending', // 待付款
  PAID = 'paid', // 已付款
  SHIPPED = 'shipped', // 已发货
  DELIVERED = 'delivered', // 已送达
  CANCELLED = 'cancelled', // 已取消
  REFUNDED = 'refunded', // 已退款
}

// 订单类型定义
export interface Order {
  id: string;
  userId: string;
  items: OrderItem[];
  totalAmount: number;
  shippingAddress: Address;
  paymentMethod: string;
  status: OrderStatus;
  createdAt: string;
  updatedAt: string;
  trackingNumber?: string;
  estimatedDelivery?: string;
}

// 订单商品类型
export interface OrderItem {
  id: string;
  productId: string;
  productName: string;
  productImage: string;
  price: number;
  quantity: number;
  specifications?: { [key: string]: string };
}

// 地址类型定义
export interface Address {
  id: string;
  userId: string;
  name: string;
  phone: string;
  province: string;
  city: string;
  district: string;
  detail: string;
  isDefault: boolean;
}

// API响应类型
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message: string;
  code: number;
}

// 分页类型
export interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

// 商品分类
export interface Category {
  id: string;
  name: string;
  icon: string;
  description?: string;
}