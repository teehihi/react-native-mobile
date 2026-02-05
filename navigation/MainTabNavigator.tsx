import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { 
  HomepageScreen, 
  SearchScreen, 
  CategoryScreen,
  CartScreen,
  ProductDetailScreen,
  AccountScreen,
  ProfileScreen,
  ChangePasswordScreen,
  ChangeEmailScreen,
  ChangePhoneScreen 
} from '../screens';
import { CustomTabBar } from '../components/CustomTabBar';

const Tab = createBottomTabNavigator();
const ProfileStack = createStackNavigator();
const MainStack = createStackNavigator();

// Main Stack Navigator (Homepage -> Category -> ProductDetail)
const MainStackNavigator = () => {
  return (
    <MainStack.Navigator screenOptions={{ headerShown: false }}>
      <MainStack.Screen name="HomepageMain" component={HomepageScreen} />
      <MainStack.Screen name="Category" component={CategoryScreen} />
      <MainStack.Screen name="ProductDetail" component={ProductDetailScreen} />
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
    </MainStack.Navigator>
  );
};

// Profile Stack Navigator (Account -> ProfileEdit -> ChangePassword/ChangeEmail/ChangePhone)
const ProfileStackNavigator = () => {
  return (
    <ProfileStack.Navigator screenOptions={{ headerShown: false }}>
      <ProfileStack.Screen name="AccountMain" component={AccountScreen} />
      <ProfileStack.Screen name="ProfileEdit" component={ProfileScreen} />
      <ProfileStack.Screen name="ChangePassword" component={ChangePasswordScreen} />
      <ProfileStack.Screen name="ChangeEmail" component={ChangeEmailScreen} />
      <ProfileStack.Screen name="ChangePhone" component={ChangePhoneScreen} />
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
      <Tab.Screen name="Home" component={MainStackNavigator} />
      <Tab.Screen name="Search" component={SearchStackNavigator} />
      <Tab.Screen name="Cart" component={CartScreen} />
      <Tab.Screen name="Profile" component={ProfileStackNavigator} />
    </Tab.Navigator>
  );
};
