import { User, Product, Order, OrderStatus, Category, Address } from '@/types';

// Mock用户数据
export const mockUsers: User[] = [
  {
    id: '1',
    username: 'user123',
    email: 'user@example.com',
    phone: '13800138000',
    avatar: 'https://picsum.photos/100/100?random=1',
    realName: '张三',
    address: '内蒙古自治区呼和浩特市新城区中山路100号',
    createdAt: '2024-01-01T00:00:00Z',
  },
];

// Mock商品分类
export const mockCategories: Category[] = [
  { id: '1', name: '奶制品', icon: '🥛', description: '纯天然草原奶制品' },
  { id: '2', name: '肉制品', icon: '🥩', description: '优质草原牛羊肉' },
  { id: '3', name: '特色小食', icon: '🍘', description: '传统内蒙古小食' },
  { id: '4', name: '饮品茶叶', icon: '🍵', description: '草原奶茶和特色茶叶' },
  { id: '5', name: '干货坚果', icon: '🥜', description: '天然干果坚果' },
  { id: '6', name: '工艺品', icon: '🎨', description: '民族特色工艺品' },
];

// Mock商品数据
export const mockProducts: Product[] = [
  {
    id: '1',
    name: '内蒙古纯牛奶',
    description: '来自呼伦贝尔大草原的纯天然牛奶，无添加剂，口感香浓醇厚',
    price: 28.8,
    originalPrice: 35.0,
    images: [
      'https://picsum.photos/300/300?random=10',
      'https://picsum.photos/300/300?random=11',
    ],
    category: '1',
    stock: 100,
    sales: 1250,
    rating: 4.8,
    reviews: 156,
    specifications: {
      '规格': '250ml×12盒',
      '保质期': '30天',
      '储存方式': '冷藏保存',
    },
    tags: ['纯天然', '无添加', '草原奶'],
  },
  {
    id: '2',
    name: '手工奶酪',
    description: '传统工艺制作的内蒙古奶酪，营养丰富，口感独特',
    price: 58.0,
    originalPrice: 68.0,
    images: [
      'https://picsum.photos/300/300?random=20',
      'https://picsum.photos/300/300?random=21',
    ],
    category: '1',
    stock: 50,
    sales: 680,
    rating: 4.9,
    reviews: 89,
    specifications: {
      '规格': '500g',
      '保质期': '15天',
      '储存方式': '冷藏保存',
    },
    tags: ['手工制作', '传统工艺', '营养丰富'],
  },
  {
    id: '3',
    name: '草原牛肉干',
    description: '选用优质草原牛肉，传统工艺风干制作，口感鲜美',
    price: 88.0,
    images: [
      'https://picsum.photos/300/300?random=30',
      'https://picsum.photos/300/300?random=31',
    ],
    category: '2',
    stock: 80,
    sales: 950,
    rating: 4.7,
    reviews: 128,
    specifications: {
      '规格': '200g',
      '保质期': '180天',
      '储存方式': '常温保存',
    },
    tags: ['纯牛肉', '无添加', '传统工艺'],
  },
  {
    id: '4',
    name: '奶茶粉',
    description: '正宗内蒙古奶茶粉，浓郁奶香，传统口味',
    price: 38.0,
    images: [
      'https://picsum.photos/300/300?random=40',
      'https://picsum.photos/300/300?random=41',
    ],
    category: '4',
    stock: 120,
    sales: 2100,
    rating: 4.6,
    reviews: 245,
    specifications: {
      '规格': '400g',
      '保质期': '12个月',
      '储存方式': '常温干燥处保存',
    },
    tags: ['正宗口味', '浓郁奶香', '即冲即饮'],
  },
  {
    id: '5',
    name: '马奶酒',
    description: '传统发酵马奶酒，酒精度低，营养价值高',
    price: 128.0,
    images: [
      'https://picsum.photos/300/300?random=50',
      'https://picsum.photos/300/300?random=51',
    ],
    category: '4',
    stock: 30,
    sales: 180,
    rating: 4.5,
    reviews: 32,
    specifications: {
      '规格': '500ml',
      '酒精度': '3-5度',
      '保质期': '6个月',
    },
    tags: ['传统发酵', '低度酒', '营养丰富'],
  },
  {
    id: '6',
    name: '蒙古包摆件',
    description: '精美的蒙古包工艺品摆件，展现草原文化',
    price: 168.0,
    images: [
      'https://picsum.photos/300/300?random=60',
      'https://picsum.photos/300/300?random=61',
    ],
    category: '6',
    stock: 25,
    sales: 85,
    rating: 4.9,
    reviews: 18,
    specifications: {
      '材质': '天然木质',
      '尺寸': '15×15×12cm',
      '工艺': '手工雕刻',
    },
    tags: ['手工制作', '民族特色', '收藏价值'],
  },
];

// Mock地址数据
export const mockAddresses: Address[] = [
  {
    id: '1',
    userId: '1',
    name: '张三',
    phone: '13800138000',
    province: '内蒙古自治区',
    city: '呼和浩特市',
    district: '新城区',
    detail: '中山路100号阳光小区1单元202室',
    isDefault: true,
  },
  {
    id: '2',
    userId: '1',
    name: '李四',
    phone: '13900139000',
    province: '北京市',
    city: '北京市',
    district: '朝阳区',
    detail: '三里屯街道工体北路8号',
    isDefault: false,
  },
];

// Mock订单数据
export const mockOrders: Order[] = [
  {
    id: 'ORD20241201001',
    userId: '1',
    items: [
      {
        id: '1',
        productId: '1',
        productName: '内蒙古纯牛奶',
        productImage: 'https://picsum.photos/300/300?random=10',
        price: 28.8,
        quantity: 2,
        specifications: { '规格': '250ml×12盒' },
      },
      {
        id: '2',
        productId: '3',
        productName: '草原牛肉干',
        productImage: 'https://picsum.photos/300/300?random=30',
        price: 88.0,
        quantity: 1,
        specifications: { '规格': '200g' },
      },
    ],
    totalAmount: 145.6,
    shippingAddress: mockAddresses[0],
    paymentMethod: '微信支付',
    status: OrderStatus.SHIPPED,
    createdAt: '2024-12-01T10:30:00Z',
    updatedAt: '2024-12-02T14:20:00Z',
    trackingNumber: 'SF1234567890',
    estimatedDelivery: '2024-12-05',
  },
  {
    id: 'ORD20241202002',
    userId: '1',
    items: [
      {
        id: '3',
        productId: '2',
        productName: '手工奶酪',
        productImage: 'https://picsum.photos/300/300?random=20',
        price: 58.0,
        quantity: 1,
        specifications: { '规格': '500g' },
      },
    ],
    totalAmount: 58.0,
    shippingAddress: mockAddresses[0],
    paymentMethod: '支付宝',
    status: OrderStatus.DELIVERED,
    createdAt: '2024-12-02T15:45:00Z',
    updatedAt: '2024-12-04T09:30:00Z',
    trackingNumber: 'YTO9876543210',
    estimatedDelivery: '2024-12-06',
  },
  {
    id: 'ORD20241203003',
    userId: '1',
    items: [
      {
        id: '4',
        productId: '4',
        productName: '奶茶粉',
        productImage: 'https://picsum.photos/300/300?random=40',
        price: 38.0,
        quantity: 3,
        specifications: { '规格': '400g' },
      },
    ],
    totalAmount: 114.0,
    shippingAddress: mockAddresses[1],
    paymentMethod: '微信支付',
    status: OrderStatus.PENDING,
    createdAt: '2024-12-03T20:15:00Z',
    updatedAt: '2024-12-03T20:15:00Z',
  },
];

// 获取订单状态显示文本
export const getOrderStatusText = (status: OrderStatus): string => {
  const statusMap = {
    [OrderStatus.PENDING]: '待付款',
    [OrderStatus.PAID]: '已付款',
    [OrderStatus.SHIPPED]: '已发货',
    [OrderStatus.DELIVERED]: '已送达',
    [OrderStatus.CANCELLED]: '已取消',
    [OrderStatus.REFUNDED]: '已退款',
  };
  return statusMap[status];
};

// 获取订单状态颜色
export const getOrderStatusColor = (status: OrderStatus): string => {
  const colorMap = {
    [OrderStatus.PENDING]: '#f39c12',
    [OrderStatus.PAID]: '#3498db',
    [OrderStatus.SHIPPED]: '#9b59b6',
    [OrderStatus.DELIVERED]: '#27ae60',
    [OrderStatus.CANCELLED]: '#e74c3c',
    [OrderStatus.REFUNDED]: '#95a5a6',
  };
  return colorMap[status];
};