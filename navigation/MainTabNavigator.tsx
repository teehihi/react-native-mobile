import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { 
  HomepageScreen, 
  SearchScreen, 
  CartScreen,
  AccountScreen,
  ProfileScreen,
  ChangePasswordScreen,
  ChangeEmailScreen,
  ChangePhoneScreen 
} from '../screens';
import { CustomTabBar } from '../components/CustomTabBar';

const Tab = createBottomTabNavigator();
const ProfileStack = createStackNavigator();

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
      <Tab.Screen name="Home" component={HomepageScreen} />
      <Tab.Screen name="Search" component={SearchScreen} />
      <Tab.Screen name="Cart" component={CartScreen} />
      <Tab.Screen name="Profile" component={ProfileStackNavigator} />
    </Tab.Navigator>
  );
};
