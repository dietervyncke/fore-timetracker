import React from 'react';
import { createAppContainer, createStackNavigator } from 'react-navigation';

import HomeScreen from '../screens/HomeScreen';
import TimeRecordScreen from '../screens/TimeRecordScreen';

const MainNavigator = createStackNavigator({
  Home: {screen: HomeScreen},
  TimeRecord: {screen: TimeRecordScreen}
});

export default createAppContainer(MainNavigator);