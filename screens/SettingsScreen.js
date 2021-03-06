import components from "../constants/Components";
import React from 'react';

import { Input, Button, Icon, Overlay } from 'react-native-elements';
import {KeyboardAvoidingView, Platform, ScrollView, View} from "react-native";

class SettingsScreen extends React.Component {

  static navigationOptions = {
    title: 'Settings',
  };

  static defaultProps = {
    'defaultPassword': '180.308.414'
  };

  state = {
    user: {},
    password: '',
    isAuthenticated: false,
    isDateTimePickerVisible: false,
    activeDateTimeValue: new Date(),
    activeDateTimeProperty: null,
  };

  componentDidMount() {
    this.setState({ user: this.props.user });
  }

  /**
   * DateTimePicker methods
   **/
  showDateTimePicker(property) {
    this.setState({
      isDateTimePickerVisible: true,
      activeDateTimeProperty: property,
    });
  }

  hideDateTimePicker() {
    this.setState({
      isDateTimePickerVisible: false,
      activeDateTimeProperty: null
    });
  }

  handleDatePicked(date) {
    this.onUpdateInputField(this.state.activeDateTimeProperty, getFormattedHoursAndMinutes(date));
    this.hideDateTimePicker();
  }

  clearInput(property) {
    this.onUpdateInputField(property, []);
  }

  isAuthenticated() {
    if (this.state.password !== this.props.defaultPassword) {
      return;
    }

    this.setState({ isAuthenticated: true });
  }

  goBack() {
    this.props.navigation.navigate('Home');
  }

  onUpdatePassword(password) {
    this.setState({password: password});
  }

  onUpdateInputField(property, value) {
    let user = this.state.user;

    if (!Array.isArray(user[property])) {
      user[property] = value;
      this.setState({user});
      return;
    }

    if (value.length) {
      user[property].push(value);
      this.setState({user});
      return;
    }

    user[property] = value;
    this.setState({user});
  }

  onPressSaveRow() {
    this.props.updateUser(this.state.user);
    this.goBack();
  }

  getBreakValues(breaks) {
    if (!breaks) {
      return;
    }

    return breaks.join(', ');
  }

  render() {

    let userInputs;

    if (this.state.user) {

      userInputs = (
          <View style={{flex: 1}}>

            <ScrollView>

              <Input onChangeText={(code) => this.onUpdateInputField('code', code)}
                     placeholder="Staff number"
                     label="Staff number"
                     value={this.state.user.code}
              />

              <Input onChangeText={(storeEmail) => this.onUpdateInputField('storeEmail', storeEmail)}
                     placeholder="Time logs email"
                     label="Time logs email"
                     value={this.state.user.storeEmail}
              />

              <Input onChangeText={(emailSubject) => this.onUpdateInputField('emailSubject', emailSubject)}
                     placeholder="Time logs subject"
                     label="Time logs subject"
                     value={this.state.user.emailSubject}
              />

              <View style={components.FieldsetRow}>
                <View style={components.FieldsetGroup}>
                  <View style={{flex: 1}}>
                    <Input
                        placeholder="Short breaks"
                        label="Short breaks"
                        disabled={true}
                        value={this.getBreakValues(this.state.user.shortBreaks)}
                    />
                  </View>
                  <Icon type="feather" name="plus" color={colors.color06} size={25} onPress={() => {this.showDateTimePicker('shortBreaks')}} iconStyle={{marginRight: 10}}/>
                  <Icon type="feather" name="trash-2" color={colors.color06} size={25} onPress={() => {this.clearInput('shortBreaks')}}/>
                </View>
              </View>

              <View style={components.FieldsetRow}>
                <View style={components.FieldsetGroup}>
                  <View style={{flex: 1}}>
                    <Input
                        placeholder="Long breaks"
                        label="Long breaks"
                        disabled={true}
                        value={this.getBreakValues(this.state.user.longBreaks)}
                    />
                  </View>
                  <Icon type="feather" name="plus" color={colors.color06} size={25} onPress={() => {this.showDateTimePicker('longBreaks')}} iconStyle={{marginRight: 10}}/>
                  <Icon type="feather" name="trash-2" color={colors.color06} size={25} onPress={() => {this.clearInput('longBreaks')}}/>
                </View>
              </View>

              <KeyboardAvoidingView style={{ flex: 1, marginTop: 15 }} behavior={Platform.OS == 'ios' ? 'padding' : 'height'} enabled>
                <Input onChangeText={(assetsEmail) => this.onUpdateInputField('assetsEmail', assetsEmail)}
                       placeholder="Assets email"
                       label="Email"
                       value={this.state.user.assetsEmail}
                />

                <Input onChangeText={(assetsEmailSubject) => this.onUpdateInputField('assetsEmailSubject', assetsEmailSubject)}
                       placeholder="Email subject"
                       label="Assets email subject"
                       value={this.state.user.assetsEmailSubject}
                />
              </KeyboardAvoidingView>

            </ScrollView>
          </View>
      );
    }

    return (

        <View style={{flex: 1}}>

          <Overlay isVisible={!this.state.isAuthenticated} overlayStyle={{justifyContent: 'center'}} fullScreen={true}>
            <View style={{alignItems: 'center'}}>
              <Input
                  containerStyle={{flex: 1, minHeight: 60}}
                  onChangeText={(password) => this.onUpdatePassword(password)}
                  placeholder="Password"
              />
              <View style={{flexDirection: 'row', justifyContent: 'center'}}>
                <Button title="Authenticate" onPress={() => this.isAuthenticated()} containerStyle={{marginRight: 5}} buttonStyle={{backgroundColor: colors.color06, borderRadius: 0, padding: 10}}/>
                <Button title="Cancel" onPress={() => this.goBack()} containerStyle={{marginLeft: 5}} buttonStyle={{backgroundColor: colors.color06, borderRadius: 0, padding: 10}}/>
              </View>
            </View>
          </Overlay>

          <View style={{padding: 20, flex: 1}}>
            {userInputs}
            <Button title="Save" buttonStyle={{backgroundColor: colors.color06, borderRadius: 0, padding: 10}}
                    containerStyle={{marginTop: 40}} color={colors.color03}
                    onPress={() => this.onPressSaveRow()} />
          </View>

          <DateTimePicker
              isVisible={this.state.isDateTimePickerVisible}
              minuteInterval={15}
              mode='time'
              onConfirm={this.handleDatePicked.bind(this)}
              onCancel={this.hideDateTimePicker.bind(this)}
          />

        </View>
    );
  }
}

import { connect } from 'react-redux';
import colors from "../constants/Colors";
import { updateUser } from "../actions/user";
import DateTimePicker from "./DateTimePicker";
import {getFormattedHoursAndMinutes, getFormattedRoundHoursAndMinutes} from "../util/time";

const mapStateToProps = state => {
  return {
    user: state.records.user
  }
};

const mapDispatchToProps = dispatch => {
  return {
    updateUser: (user) => dispatch(updateUser(user)),
  }
};

export default connect(mapStateToProps, mapDispatchToProps)(SettingsScreen);
