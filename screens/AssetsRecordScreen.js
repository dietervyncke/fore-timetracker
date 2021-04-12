import React from "react";
import {Image, ScrollView, KeyboardAvoidingView, View, Platform} from "react-native";

import {Button, Icon, Input} from "react-native-elements";
import colors from "../constants/Colors";

class AssetsRecordScreen extends React.Component
{
  static navigationOptions = {
    title: 'Add assets'
  };

  state = {
    record: {}
  };

  constructor(props) {
    super(props);

    this.assetCommentsInput = React.createRef();
  }

  componentDidMount() {

    let record = this.props.record;

    this.setState({ record: record });
  }

  componentDidUpdate(prevProps) {

    if (this.props.route.params?.asset && prevProps.route.params?.asset !== this.props.route.params?.asset) {
      let assets = this.state.record.assets;
      assets = [...assets, this.props.route.params.asset];
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
    this.setState({ record });
  }

  onPressSaveRow() {
    this.props.update(this.state.record);
    this.props.navigation.goBack();
  }

  getRenderedAssets() {

    let images = [];

    for (let i=0; i < this.state.record.assets.length; i++) {

      let image = (
          <View key={i} style={{ borderStyle: 'solid', borderWidth: 3, borderColor: 'transparent' }}>
            <Image
                source={{ uri: this.state.record.assets[i] }}
                style={{ width: 100, height: 100 }}
            />
            <Icon name="x-circle" type="feather"
                  onPress={() => {this.deleteAssets(i)}}
                  size={30}
                  color="white"
                  containerStyle={{ position: "absolute", top: 5, right: 5 }}
            />
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
      <View flex={1}>
        <View style={{ padding: 20, paddingTop: 10 }} flex={1}>
          <View flexDirection={'row'} style={{ paddingBottom: 5, marginTop: 10 }}>
            <View flex={1} style={{paddingRight: 5}}>
              <Button title="Take picture" containerStyle={{ borderRadius: 0 }} buttonStyle={{backgroundColor: colors.color06, borderRadius: 0, padding: 10}} color={colors.color03}
                      onPress={() => { this.props.navigation.push('Camera') }}/>
            </View>
            <View flex={1} style={{paddingLeft: 5}}>
              <Button title="Choose picture" buttonStyle={{backgroundColor: colors.color06, borderRadius: 0, padding: 10}} color={colors.color03}
                      onPress={() => { this.props.navigation.push('ImagePicker') }}/>
            </View>
          </View>
          <ScrollView style={{ flex: 1 }}>
            <View flexDirection={'row'} flexWrap={'wrap'}>
              {images}
            </View>
          </ScrollView>
          <KeyboardAvoidingView style={{ flex: 1, marginTop: 15 }} behavior={Platform.OS == 'ios' ? 'padding' : 'height'} enabled keyboardVerticalOffset={50}>
            <View style={{ flex: 1 }}>
              <Input
                  ref={this.assetCommentsInput}
                  value={this.state.record.assetComments}
                  containerStyle={{ height: 100 }}
                  inputContainerStyle={{ height: 100 }}
                  inputStyle={{ height: 100 }}
                  label="Comments"
                  multiline={true}
                  textAlignVertical={'top'}
                  onChangeText={(assetComments) => this.onUpdateInputField('assetComments', assetComments)}
                  onEndEditing={({nativeEvent}) => this.onUpdateInputField('assetComments', nativeEvent.text.trim())}
              />
            </View>
          </KeyboardAvoidingView>
        </View>
        <Button title="Save" buttonStyle={{backgroundColor: colors.color06, borderRadius: 0, padding: 10}}
                onPress={this.onPressSaveRow.bind(this)} color={colors.color03}/>
      </View>
    );
  }
}

import { updateRecord } from "../actions/record";
import { connect } from "react-redux";

const mapStateToProps = state => {
  return {
    record: state.records.record
  }
};

const mapDispatchToProps = dispatch => {
  return {
    update: (payload) => {
      dispatch(updateRecord(payload, 'assets'))
    }
  }
};

export default connect(mapStateToProps, mapDispatchToProps)(AssetsRecordScreen);