import React from "react";
import {Image, View} from "react-native";

import {Button} from "react-native-elements";
import colors from "../constants/Colors";
import { Asset } from 'expo-asset';
import MediaLibrary from 'expo-media-library';

class AssetsRecordScreen extends React.Component
{
  static navigationOptions = {
    title: 'Add assets'
  };

  state = {
    record: {}
  };

  componentDidMount() {
    if (! this.props.record.assets) {
      this.props.record.assets = [];
    }

    this.setState({ record: this.props.record });
  }

  componentDidUpdate(prevProps) {
    if (prevProps.route.params?.assetUri !== this.props.route.params?.assetUri) {
      let assets = this.state.record.assets;
      assets.push(this.props.route.params.assetUri);

      this.onUpdateInputField('assets', assets);
    }
  }

  /**
   *
   * @param property
   * @param value
   */
  onUpdateInputField(property, value) {
    let record = this.state.record;
    record[property] = value;
    this.setState({record});
  }

  onPressSaveRow() {

    this.props.update(this.state.record);

    this.props.navigation.goBack();
  }

  getRenderedAssets() {

    let images = [];

    for (let i=0; i < this.state.record.assets.length; i++) {

      let image = (
          <View>
            <Image
                source={{ uri: this.state.record.assets[i] }}
                style={{ width: 100, height: 100 }}
            />
            <Button title="Delete" onPress={() => {this.deleteAssets(i)}} />
          </View>
      );

      images.push(image);
    }

    return images;
  }

  deleteAssets(index) {
    let assets = this.state.record.assets;
    assets.splice(index, 1);
    this.onUpdateInputField('assets', assets);
  }

  render() {

    let images;

    if (this.state.record.assets?.length) {
      images = this.getRenderedAssets();
    }

    return (
      <View>
        <View flexDirection={'row'}>
          <Button title="Take picture" buttonStyle={{backgroundColor: colors.color06, borderRadius: 0, padding: 10}} color={colors.color03}
                  onPress={() => { this.props.navigation.push('Camera') }}/>
          <Button title="Choose picture" buttonStyle={{backgroundColor: colors.color06, borderRadius: 0, padding: 10}} color={colors.color03}
                  onPress={() => { this.props.navigation.push('ImagePicker') }}/>
        </View>
        <View flexDirection={'row'} flexWrap={'wrap'}>
          {images}
        </View>
        <Button title="Save" buttonStyle={{backgroundColor: colors.color06, borderRadius: 0, padding: 10}}
                onPress={this.onPressSaveRow.bind(this)} color={colors.color03}/>
      </View>
    );
  }
}

import { getRecord, updateRecord } from "../actions/record";
import { connect } from "react-redux";

const mapStateToProps = state => {
  return {
    record: state.records.record
  }
};

const mapDispatchToProps = dispatch => {
  return {
    update: (payload) => {
      dispatch(updateRecord(payload))
    },
    get: (key) => {
      dispatch(getRecord(key))
    }
  }
};

export default connect(mapStateToProps, mapDispatchToProps)(AssetsRecordScreen);