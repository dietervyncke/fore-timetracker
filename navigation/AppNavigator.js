import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';

import HomeScreen from '../screens/HomeScreen';

import TimeRecordScreen from '../screens/TimeRecordScreen';
import BarcodeScanner from "../screens/BarcodeScanner";
import SettingsScreen from "../screens/SettingsScreen";
import {Icon} from "react-native-elements";
import colors from "../constants/Colors";
import AssetsRecordScreen from "../screens/AssetsRecordScreen";
import CameraScreen from "../screens/CameraScreen";
import ImagePickerScreen from "../screens/ImagePickerScreen";

const Stack = createStackNavigator();
const Tab = createMaterialTopTabNavigator();

export default function RootStack() {
  return (
    <Stack.Navigator initialRouteName="Home" headerMode="screen">
      <Stack.Screen
          name="Home"
          component={HomeScreen}
          options={({navigation}) => ({
            title: 'Time clock',
            headerLeft: () => (
                <Icon type="feather" name="settings" color={colors.color06}
                      onPress={() => navigation.push('Settings')} iconStyle={{paddingLeft: 10}}
                />
            )
          })}
      />
      <Stack.Screen
          name="TimeRecord"
          component={TimeRecordScreen}
          options={{
            title: 'Record'
          }}
      />
      <Stack.Screen
          name="AssetsRecord"
          component={AssetsRecordScreen}
          options={{
            title: 'Assets'
          }}
      />
      <Stack.Screen
          name="BarcodeScanner"
          component={BarcodeScanner}
      />
      <Stack.Screen
          name="Camera"
          component={CameraScreen}
      />
      <Stack.Screen
          name="ImagePicker"
          component={ImagePickerScreen}
      />
      <Stack.Screen
          name="Settings"
          component={SettingsScreen}
      />
    </Stack.Navigator>
  );
}