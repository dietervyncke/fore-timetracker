import React from 'react';
import {Image, View, Text} from 'react-native';
import * as ImagePicker from 'expo-image-picker';

export default class ImagePickerScreen extends React.Component
{
  state = {
    rollGranted: false,
    image: null
  };

  componentDidMount() {
    this.getMediaLibraryPermission();
  }

  async getMediaLibraryPermission() {
    const { status } = await ImagePicker.requestCameraRollPermissionsAsync();
    if (status === 'granted') {
      this.setState({ rollGranted: true });
    } else {
      alert('Sorry, we need media library permissions to make this work!');
    }
  }

  pickImage = async () => {
    let asset = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.All,
      allowsEditing: false,
      quality: 0.25,
    });

    this.setState({ image: asset });

    this.props.navigation.navigate('AssetsRecord', {
      asset: asset
    });
  };

  render() {

    let image = <Text>Please select an image</Text>;

    if (this.state.image) {
      image = <Image source={{ uri: this.state.image.uri}} style={{ width: 120, height: 120 }} />
    }

    if (this.state.rollGranted && ! this.state.image) {
      this.pickImage();
    }

    return (
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          {image}
        </View>
    );
  }
}