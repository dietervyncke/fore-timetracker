import React from 'react';

import * as MediaLibrary from 'expo-media-library';
import * as Permissions from 'expo-permissions';

import { View, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { Camera } from 'expo-camera';
import { Icon } from "react-native-elements";

export default class CameraScreen extends React.Component {

  state = {
    rollGranted: false,
    cameraGranted: false,
    loading: false,
  };

  componentDidMount() {
    this.getCameraPermissions();
  }

  async getCameraPermissions() {
    const { status } = await Permissions.askAsync(Permissions.CAMERA);
    if (status === 'granted') {
      this.setState({ cameraGranted: true });
    } else {
      this.setState({ cameraGranted: false });
      console.log('Uh oh! The user has not granted us permission.');
    }
    this.getCameraRollPermissions();
  }

  async getCameraRollPermissions() {
    const { status } = await Permissions.askAsync(Permissions.CAMERA_ROLL);
    if (status === 'granted') {
      this.setState({ rollGranted: true });
    } else {
      console.log('Uh oh! The user has not granted us permission.');
      this.setState({ rollGranted: false });
    }
  }

  toggleLoading() {
    this.setState({ loading: !this.state.loading });
  }

  takePictureAndCreateAlbum = async () => {
    this.toggleLoading();
    const { uri } = await this.camera.takePictureAsync();
    await MediaLibrary.createAssetAsync(uri).then(asset => {
      this.toggleLoading();
      this.props.navigation.navigate('AssetsRecord', {
        assetUri: asset.uri
      });
    });
  };

  render() {
    return (
        <View style={{ flex: 1 }}>
          <Camera ref={ref => this.camera = ref} type={Camera.Constants.Type.back} style={{ flex: 1 }}>
            {! this.state.loading &&
              <View style={styles.buttonContainerPortrait}>
                <TouchableOpacity
                    style={styles.buttonPortrait}
                    onPress={() =>
                        this.state.rollGranted && this.state.cameraGranted
                            ? this.takePictureAndCreateAlbum()
                            : Alert.alert('Permissions not granted')
                    }
                >
                  <Icon name="camera" iconStyle={{ fontSize: 40, color: 'white' }} />
                </TouchableOpacity>
              </View>
            }
          </Camera>
        </View>
    );
  }
}

const styles = StyleSheet.create({
  buttonContainerPortrait: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center'
  },
  buttonPortrait: {
    padding: 20,
    backgroundColor: 'transparent'
  }
});