import React from 'react';
import { createAppContainer, createStackNavigator } from 'react-navigation';

import HomeScreen from '../screens/HomeScreen';
import TimeRecordScreen from '../screens/TimeRecordScreen';
import BarcodeScanner from "../screens/BarcodeScanner";

const MainNavigator = createStackNavigator({
  Home: {screen: HomeScreen},
  TimeRecord: {screen: TimeRecordScreen},
  BarcodeScanner: {screen: BarcodeScanner}
});

export default createAppContainer(MainNavigator);