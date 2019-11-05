import components from "../constants/Components";
import React from 'react';

import { Input, Button, Icon, Overlay } from 'react-native-elements';
import { View } from "react-native";

class SettingsScreen extends React.Component {

  static navigationOptions = {
    title: 'Settings',
  };

  static defaultProps = {
    'defaultPassword': 'test'
  };

  state = {
    user: {},
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
    if (this.state.user.password !== this.props.defaultPassword) {
      return;
    }

    this.setState({ isAuthenticated: true });
  }

  goBack() {
    this.props.navigation.navigate('Home');
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
          <View style={{alignItems: 'stretch'}}>

            <View style={components.FieldsetRow}>
              <View style={components.FieldsetGroup}>

              </View>
            </View>

            <Input onChangeText={(code) => this.onUpdateInputField('code', code)}
                   placeholder="Staff number"
                   label="Staff number"
                   value={this.state.user.code}
                   inputContainerStyle={{marginBottom: 20}}
            />

            <Input onChangeText={(storeEmail) => this.onUpdateInputField('storeEmail', storeEmail)}
                   placeholder="Storage email"
                   label="Storage email"
                   value={this.state.user.storeEmail}
                   inputContainerStyle={{marginBottom: 20}}
            />

            <Input onChangeText={(emailSubject) => this.onUpdateInputField('emailSubject', emailSubject)}
                   placeholder="Subject"
                   label="Subject"
                   value={this.state.user.emailSubject}
                   inputContainerStyle={{marginBottom: 20}}
            />

            <View style={[components.FieldsetRow, {marginTop: 20, marginBottom: 10}]}>
              <View style={components.FieldsetGroup}>
                <View style={{flex: 1}}>
                  <Input
                      placeholder="Short breaks"
                      label="Short breaks"
                      disabled={true}
                      value={this.getBreakValues(this.state.user.shortBreaks)}
                      inputContainerStyle={{marginBottom: 20}}
                  />
                </View>
                <Icon type="feather" name="plus" color={colors.color06} size={25} onPress={() => {this.showDateTimePicker('shortBreaks')}} iconStyle={{marginRight: 10}}/>
                <Icon type="feather" name="trash-2" color={colors.color06} size={25} onPress={() => {this.clearInput('shortBreaks')}}/>
              </View>
            </View>

            <View style={[components.FieldsetRow, {marginTop: 20, marginBottom: 10}]}>
              <View style={components.FieldsetGroup}>
                <View style={{flex: 1}}>
                  <Input
                      placeholder="Long breaks"
                      label="Long breaks"
                      disabled={true}
                      value={this.getBreakValues(this.state.user.longBreaks)}
                      inputContainerStyle={{marginBottom: 20}}
                  />
                </View>
                <Icon type="feather" name="plus" color={colors.color06} size={25} onPress={() => {this.showDateTimePicker('longBreaks')}} iconStyle={{marginRight: 10}}/>
                <Icon type="feather" name="trash-2" color={colors.color06} size={25} onPress={() => {this.clearInput('longBreaks')}}/>
              </View>
            </View>
          </View>
      );
    }

    return (

        <View style={{flex: 1}}>

          <Overlay isVisible={!this.state.isAuthenticated}>
            <View style={{flex: 1}}>
              <Input
                  containerStyle={{flex: 1}}
                  onChangeText={(password) => this.onUpdateInputField('password', password)}
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
import moment from "./TimeRecordScreen";
import DateTimePicker from "./DateTimePicker";
import {getFormattedHoursAndMinutes} from "../util/time";

const mapStateToProps = state => {
  return {
    user: state.records.user
  }
};

const mapDispatchToProps = dispatch => {
  return {
    updateUser: (user) => dispatch(updateUser(user))
  }
};

export default connect(mapStateToProps, mapDispatchToProps)(SettingsScreen);
