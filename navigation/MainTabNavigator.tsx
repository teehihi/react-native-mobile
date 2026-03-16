import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { getFocusedRouteNameFromRoute } from '@react-navigation/native';
import { 
  HomepageScreen, 
  SearchScreen, 
  CategoryScreen,
  CartScreen,
  ProductDetailScreen,
  CheckoutScreen,
  OrdersScreen,
  OrderDetailScreen,
  AddressListScreen,
  AddAddressScreen,
  AccountScreen,
  ProfileScreen,
  ChangePasswordScreen,
  ChangeEmailScreen,
  ChangePhoneScreen 
} from '../screens';
import FavoritesScreen from '../screens/main/FavoritesScreen';
import WriteReviewScreen from '../screens/main/WriteReviewScreen';
import CouponsScreen from '../screens/main/CouponsScreen';
import NotificationScreen from '../screens/main/NotificationScreen';
import SpendingStatsScreen from '../screens/main/SpendingStatsScreen';
import { CustomTabBar } from '../components/CustomTabBar';

const Tab = createBottomTabNavigator();
const ProfileStack = createStackNavigator();
const MainStack = createStackNavigator();

// Main Stack Navigator (Homepage -> Category -> ProductDetail -> Cart -> Checkout)
const MainStackNavigator = () => {
  return (
    <MainStack.Navigator screenOptions={{ headerShown: false }}>
      <MainStack.Screen name="HomepageMain" component={HomepageScreen} />
      <MainStack.Screen name="Category" component={CategoryScreen} />
      <MainStack.Screen name="ProductDetail" component={ProductDetailScreen} />
      <MainStack.Screen name="Cart" component={CartScreen} />
      <MainStack.Screen name="Checkout" component={CheckoutScreen} />
      <MainStack.Screen name="AddressList" component={AddressListScreen} />
      <MainStack.Screen name="AddAddress" component={AddAddressScreen} />
      <MainStack.Screen name="Notifications" component={NotificationScreen} />
      <MainStack.Screen name="SpendingStats" component={SpendingStatsScreen} />
    </MainStack.Navigator>
  );
};

// Search Stack Navigator (Search -> Category -> ProductDetail)
const SearchStackNavigator = () => {
  return (
    <MainStack.Navigator screenOptions={{ headerShown: false }}>
      <MainStack.Screen name="SearchMain" component={SearchScreen} />
      <MainStack.Screen name="Category" component={CategoryScreen} />
      <MainStack.Screen name="ProductDetail" component={ProductDetailScreen} />
      <MainStack.Screen name="Cart" component={CartScreen} />
      <MainStack.Screen name="Checkout" component={CheckoutScreen} />
      <MainStack.Screen name="AddressList" component={AddressListScreen} />
      <MainStack.Screen name="AddAddress" component={AddAddressScreen} />
    </MainStack.Navigator>
  );
};

// Cart Stack Navigator (Cart -> Checkout -> AddressList -> AddAddress)
const CartStackNavigator = () => {
  return (
    <MainStack.Navigator screenOptions={{ headerShown: false }}>
      <MainStack.Screen name="CartMain" component={CartScreen} />
      <MainStack.Screen name="Checkout" component={CheckoutScreen} />
      <MainStack.Screen name="AddressList" component={AddressListScreen} />
      <MainStack.Screen name="AddAddress" component={AddAddressScreen} />
    </MainStack.Navigator>
  );
};

// Orders Stack Navigator (Orders -> OrderDetail -> WriteReview)
const OrdersStackNavigator = () => {
  return (
    <MainStack.Navigator screenOptions={{ headerShown: false }}>
      <MainStack.Screen name="OrdersMain" component={OrdersScreen} />
      <MainStack.Screen name="OrderDetail" component={OrderDetailScreen} />
      <MainStack.Screen name="WriteReview" component={WriteReviewScreen} />
    </MainStack.Navigator>
  );
};

// Profile Stack Navigator (Account -> ProfileEdit -> ChangePassword/ChangeEmail/ChangePhone -> Favorites -> Coupons)
const ProfileStackNavigator = () => {
  return (
    <ProfileStack.Navigator screenOptions={{ headerShown: false }}>
      <ProfileStack.Screen name="AccountMain" component={AccountScreen} />
      <ProfileStack.Screen name="ProfileEdit" component={ProfileScreen} />
      <ProfileStack.Screen name="ChangePassword" component={ChangePasswordScreen} />
      <ProfileStack.Screen name="ChangeEmail" component={ChangeEmailScreen} />
      <ProfileStack.Screen name="ChangePhone" component={ChangePhoneScreen} />
      <ProfileStack.Screen name="Favorites" component={FavoritesScreen} />
      <ProfileStack.Screen name="Coupons" component={CouponsScreen} />
      <ProfileStack.Screen name="Notifications" component={NotificationScreen} />
      <ProfileStack.Screen name="SpendingStats" component={SpendingStatsScreen} />
    </ProfileStack.Navigator>
  );
};

export const MainTabNavigator = () => {
  return (
    <Tab.Navigator
      tabBar={(props) => <CustomTabBar {...props} />}
      screenOptions={{
        headerShown: false,
      }}
    >
      <Tab.Screen 
        name="Home" 
        component={MainStackNavigator}
      />
      <Tab.Screen 
        name="Search" 
        component={SearchStackNavigator}
      />
      <Tab.Screen 
        name="Orders" 
        component={OrdersStackNavigator}
        options={({ route }) => ({
          tabBarStyle: ((route) => {
            const routeName = getFocusedRouteNameFromRoute(route) ?? '';
            if (['OrderDetail'].includes(routeName)) {
              return { display: 'none' };
            }
            return { display: 'flex' };
          })(route),
        })}
      />
      <Tab.Screen 
        name="Profile" 
        component={ProfileStackNavigator}
      />
    </Tab.Navigator>
  );
};
