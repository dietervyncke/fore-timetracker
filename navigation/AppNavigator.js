import React from 'react';
import {
  createAppContainer,
  createStackNavigator
} from 'react-navigation';

import HomeScreen from '../screens/HomeScreen';
import TimeRecordScreen from '../screens/TimeRecordScreen';
import BarcodeScanner from "../screens/BarcodeScanner";
import SettingsScreen from "../screens/SettingsScreen";

const HomeStack = createStackNavigator({
  Home: {screen: HomeScreen},
  TimeRecord: {screen: TimeRecordScreen},
  BarcodeScanner: {screen: BarcodeScanner},
  Settings: {screen: SettingsScreen}
});

HomeStack.navigationOptions = {
  tabBarLabel: 'Home'
};

export default createAppContainer(HomeStack);