import React, { useState, useEffect } from 'react';
import { Button, Image, View, Platform } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import * as Permissions from "expo-permissions";

export default class ImagePickerScreen extends React.Component
{
  state = {
    rollGranted: false,
    image: null
  };

  componentDidMount() {
    this.getMediaLibraryPermission();
    this.pickImage();
  }

  async getMediaLibraryPermission() {
    if (Platform.OS !== 'web') {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        alert('Sorry, we need media library permissions to make this work!');
      }
    }
  }

  pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.All,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.cancelled) {
      console.log(result.uri);
    }
  };

  render() {
    return (
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
        </View>
    );
  }
}
//
// export default function ImagePickerExample() {
//   const [image, setImage] = useState(null);
//
//   useEffect(() => {
//     (async () => {
//       if (Platform.OS !== 'web') {
//         const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
//         if (status !== 'granted') {
//           alert('Sorry, we need camera roll permissions to make this work!');
//         }
//       }
//     })();
//   }, []);
//
//   const pickImage = async () => {
//     let result = await ImagePicker.launchImageLibraryAsync({
//       mediaTypes: ImagePicker.MediaTypeOptions.All,
//       allowsEditing: true,
//       aspect: [4, 3],
//       quality: 1,
//     });
//
//     if (!result.cancelled) {
//       setImage(result.uri);
//     }
//   };
//
//   return (
//       <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
//         <Button title="Pick an image from camera roll" onPress={pickImage} />
//         {image && <Image source={{ uri: image }} style={{ width: 200, height: 200 }} />}
//       </View>
//   );
// }