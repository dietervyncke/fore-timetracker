import * as React from 'react';
import * as Permissions from 'expo-permissions';

import v4 from 'uuid/v4';
import { Text, View, StyleSheet, Button } from 'react-native';
import { BarCodeScanner } from 'expo-barcode-scanner';
import { Audio } from 'expo-av';

export default class BarcodeScannerExample extends React.Component {

  static navigationOptions = {
    title: 'BarcodeScanner',
  };

  state = {
    hasCameraPermission: null,
    scanned: false,
  };

  async componentDidMount() {
    const { status } = await Permissions.askAsync(Permissions.CAMERA);
    this.setState({ hasCameraPermission: status === 'granted' });
  }

  render() {
    const { hasCameraPermission, scanned } = this.state;

    if (hasCameraPermission === null) {
      return <Text>Requesting for camera permission</Text>;
    }
    if (hasCameraPermission === false) {
      return <Text>No access to camera</Text>;
    }
    return (
      <View
        style={{
          flex: 1,
          flexDirection: 'column',
          justifyContent: 'flex-end',
        }}>
        <BarCodeScanner
          onBarCodeScanned={scanned ? undefined : this.handleBarCodeScanned}
          style={StyleSheet.absoluteFillObject}
        />

        {scanned && (
          <Button title={'Tap to Scan Again'} onPress={() => this.setState({ scanned: false })} />
        )}
      </View>
    );
  }

  handleBarCodeScanned = async ({ type, data }) => {

    const soundObject = new Audio.Sound();

    try {
      await soundObject.loadAsync(require('../assets/sounds/beep.mp3'));
      await soundObject.playAsync();
    } catch (error) {}

    this.setState({ scanned: true });
    this.props.navigation.navigate('TimeRecord', {
      id: v4(),
      data: data
    });
  };
}