import { User } from '@/types';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Image,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

interface MenuItemProps {
  icon: string;
  title: string;
  subtitle?: string;
  onPress: () => void;
  showArrow?: boolean;
}

const MenuItem: React.FC<MenuItemProps> = ({ 
  icon, 
  title, 
  subtitle, 
  onPress, 
  showArrow = true 
}) => (
  <TouchableOpacity style={styles.menuItem} onPress={onPress}>
    <View style={styles.menuItemLeft}>
      <Text style={styles.menuIcon}>{icon}</Text>
      <View style={styles.menuTextContainer}>
        <Text style={styles.menuTitle}>{title}</Text>
        {subtitle && <Text style={styles.menuSubtitle}>{subtitle}</Text>}
      </View>
    </View>
    {showArrow && <Text style={styles.arrow}>›</Text>}
  </TouchableOpacity>
);

export default function ProfileScreen() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
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
      }
    } catch (error) {
      console.error('加载用户信息失败:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    Alert.alert(
      '退出登录',
      '确定要退出登录吗？',
      [
        { text: '取消', style: 'cancel' },
        {
          text: '确定',
          style: 'destructive',
          onPress: async () => {
            try {
              await AsyncStorage.multiRemove(['userToken', 'userInfo']);
              router.replace('/auth/login');
            } catch (_error) {
              Alert.alert('错误', '退出登录失败');
            }
          },
        },
      ]
    );
  };

  const navigateToOrders = (status?: string) => {
    if (status) {
      router.push(`/profile/orders?status=${status}`);
    } else {
      router.push('/profile/orders');
    }
  };

  const navigateToEdit = () => {
    router.push('/profile/edit');
  };

  const navigateToAddress = () => {
    router.push('/profile/address');
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
      <StatusBar style="light" />
      
      {/* 头部用户信息 */}
      <View style={styles.header}>
        <View style={styles.userInfo}>
          <Image 
            source={{ 
              uri: user?.avatar || 'https://picsum.photos/100/100?random=999' 
            }} 
            style={styles.avatar} 
          />
          <View style={styles.userDetails}>
            <Text style={styles.userName}>
              {user?.realName || user?.username || '未登录'}
            </Text>
            <Text style={styles.userPhone}>
              {user?.phone || '未绑定手机号'}
            </Text>
          </View>
          <TouchableOpacity onPress={navigateToEdit}>
            <Text style={styles.editButton}>编辑</Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* 订单快捷入口 */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>我的订单</Text>
            <TouchableOpacity onPress={() => navigateToOrders()}>
              <Text style={styles.sectionMore}>查看全部 ›</Text>
            </TouchableOpacity>
          </View>
          
          <View style={styles.orderActions}>
            <TouchableOpacity 
              style={styles.orderAction}
              onPress={() => navigateToOrders('pending')}
            >
              <Text style={styles.orderActionIcon}>💰</Text>
              <Text style={styles.orderActionText}>待付款</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.orderAction}
              onPress={() => navigateToOrders('shipped')}
            >
              <Text style={styles.orderActionIcon}>🚚</Text>
              <Text style={styles.orderActionText}>待收货</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.orderAction}
              onPress={() => navigateToOrders('delivered')}
            >
              <Text style={styles.orderActionIcon}>📦</Text>
              <Text style={styles.orderActionText}>已完成</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.orderAction}
              onPress={() => navigateToOrders('refunded')}
            >
              <Text style={styles.orderActionIcon}>🔄</Text>
              <Text style={styles.orderActionText}>退换货</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* 功能菜单 */}
        <View style={styles.section}>
          <MenuItem
            icon="📍"
            title="收货地址"
            subtitle="管理收货地址"
            onPress={navigateToAddress}
          />
          
          <MenuItem
            icon="⭐"
            title="我的评价"
            subtitle="查看商品评价"
            onPress={() => Alert.alert('提示', '功能开发中...')}
          />
          
          <MenuItem
            icon="💰"
            title="优惠券"
            subtitle="查看可用优惠券"
            onPress={() => Alert.alert('提示', '功能开发中...')}
          />
          
          <MenuItem
            icon="🎁"
            title="积分商城"
            subtitle="积分兑换好礼"
            onPress={() => Alert.alert('提示', '功能开发中...')}
          />
        </View>

        {/* 设置菜单 */}
        <View style={styles.section}>
          <MenuItem
            icon="📞"
            title="客服中心"
            subtitle="联系客服"
            onPress={() => Alert.alert('客服电话', '400-123-4567')}
          />
          
          <MenuItem
            icon="ℹ️"
            title="关于我们"
            subtitle="了解内蒙特产商城"
            onPress={() => Alert.alert('关于我们', '内蒙特产商城致力于为您提供最优质的草原特产。')}
          />
          
          <MenuItem
            icon="⚙️"
            title="设置"
            subtitle="应用设置"
            onPress={() => Alert.alert('提示', '功能开发中...')}
          />
        </View>

        {/* 退出登录 */}
        <View style={styles.section}>
          <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
            <Text style={styles.logoutText}>退出登录</Text>
          </TouchableOpacity>
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
    backgroundColor: '#e74c3c',
    paddingTop: 50,
    paddingBottom: 20,
    paddingHorizontal: 20,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginRight: 16,
  },
  userDetails: {
    flex: 1,
  },
  userName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 4,
  },
  userPhone: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  editButton: {
    fontSize: 14,
    color: '#fff',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    overflow: 'hidden',
  },
  content: {
    flex: 1,
  },
  section: {
    backgroundColor: '#fff',
    marginTop: 12,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f8f9fa',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2c3e50',
  },
  sectionMore: {
    fontSize: 14,
    color: '#7f8c8d',
  },
  orderActions: {
    flexDirection: 'row',
    paddingVertical: 20,
  },
  orderAction: {
    flex: 1,
    alignItems: 'center',
  },
  orderActionIcon: {
    fontSize: 24,
    marginBottom: 8,
  },
  orderActionText: {
    fontSize: 12,
    color: '#495057',
    fontWeight: '500',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f8f9fa',
  },
  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  menuIcon: {
    fontSize: 20,
    marginRight: 16,
    width: 24,
    textAlign: 'center',
  },
  menuTextContainer: {
    flex: 1,
  },
  menuTitle: {
    fontSize: 15,
    color: '#2c3e50',
    fontWeight: '500',
  },
  menuSubtitle: {
    fontSize: 12,
    color: '#7f8c8d',
    marginTop: 2,
  },
  arrow: {
    fontSize: 18,
    color: '#bdc3c7',
    fontWeight: '300',
  },
  logoutButton: {
    marginHorizontal: 20,
    marginVertical: 20,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e74c3c',
    borderRadius: 8,
    paddingVertical: 16,
    alignItems: 'center',
  },
  logoutText: {
    fontSize: 16,
    color: '#e74c3c',
    fontWeight: '600',
  },
  bottomPadding: {
    height: 20,
  },
});