import React from 'react';

import {
  View, TextInput, Button, Text
} from 'react-native';

import {getFormattedHoursMinutes, getTimeInterval} from '../util/time';
import 'moment-round';

import components from '../constants/Components';

import DateTimePicker from "react-native-modal-datetime-picker";

class TimeRecordScreen extends React.Component
{
  static navigationOptions = {
    title: 'Add record'
  };

  constructor(props) {
    super(props);
  }

  state = {
    record: {},
    isDateTimePickerVisible: false,
    activeDateTimeProperty: null
  };

  showDateTimePicker(property) {
    this.setState({
      isDateTimePickerVisible: true,
      activeDateTimeProperty: property
    });
  }

  hideDateTimePicker() {
    this.setState({
      isDateTimePickerVisible: false,
      activeDateTimeProperty: null
    });
  }

  handleDatePicked(date) {
    this.onUpdateInputField(this.state.activeDateTimeProperty, date);
    this.hideDateTimePicker();
  }

  componentDidMount() {
    this.setState({record: this.props.record});
  }

  onPressSaveRow() {

    if (this.props.record.key !== null) {
      this.props.update(this.state.record);
    } else {
      this.props.add(this.state.record);
    }

    this.props.navigation.goBack();
  };

  onUpdateInputField(property, value) {
    let record = this.state.record;
    record[property] = value;
    this.setState({record});
  }

  render() {

    return (
      <View style={{flex: 1}}>

        <View style={{padding: 20, flex: 1}}>

          <View style={{alignItems: 'stretch'}}>

            <View style={components.FieldsetRow}>
              <TextInput
                style={components.Input}
                onChangeText={(orderNumber) => this.onUpdateInputField('orderNumber', orderNumber)}
                placeholder="Order number"
                value={this.state.record.orderNumber}
              />
            </View>

            <View style={components.FieldsetRow}>
              <View style={components.FieldsetGroup}>

                <Text style={[components.Input, {marginRight: 5, flex: 1}]}
                      onPress={() => this.showDateTimePicker('startTime')}>
                  {getFormattedHoursMinutes(this.state.record.startTime)}
                </Text>

                <Text style={[components.Input, {marginLeft: 5, flex: 1}]}
                      onPress={() => this.showDateTimePicker('endTime')}>
                  {getFormattedHoursMinutes(this.state.record.endTime)}
                </Text>

              </View>
            </View>

            <View style={components.FieldsetRow}>
              <View style={components.FieldsetGroup}>
                <Text>Break:</Text>

                <Text style={[components.Input, {marginLeft: 5, marginRight: 5, flex: 1}]}
                      onPress={() => this.onUpdateInputField('breakDuration', 0)}>
                  0min
                </Text>

                <Text style={[components.Input, {marginLeft: 5, marginRight: 5, flex: 1}]}
                      onPress={() => this.onUpdateInputField('breakDuration', 15)}>
                  15min
                </Text>

                <Text style={[components.Input, {marginRight: 5, flex: 1}]}
                      onPress={() => this.onUpdateInputField('breakDuration', 30)}>
                  30min
                </Text>

                <TextInput style={components.Input} placeholder="Anders"
                           onChangeText={(breakDuration) => this.onUpdateInputField('breakDuration', parseInt(breakDuration))}
                />

              </View>
            </View>

            <View style={components.FieldsetRow}>
              <TextInput
                style={components.Input}
                onChangeText={(description) => this.onUpdateInputField('description', description)}
                placeholder="Description"
                value={this.state.record.description}
              />
            </View>

          </View>

        </View>

        <Text>
          {getTimeInterval(this.state.record.startTime, this.state.record.endTime, this.state.record.breakDuration)}
        </Text>

        <Button title="Save" onPress={this.onPressSaveRow.bind(this)}/>

        <DateTimePicker
          mode={'time'}
          minuteInterval={15}
          isVisible={this.state.isDateTimePickerVisible}
          onConfirm={this.handleDatePicked.bind(this)}
          onCancel={this.hideDateTimePicker.bind(this)}
        />

      </View>
    );
  }
}

import { connect } from 'react-redux';
import {addRecord, getRecord, updateRecord} from '../actions/record';

const mapStateToProps = state => {
  return {
    record: state.records.record
  }
};

const mapDispatchToProps = dispatch => {
  return {
    add: (payload) => {
      dispatch(addRecord(payload))
    },
    update: (payload) => {
      dispatch(updateRecord(payload))
    },
    get: (key) => {
      dispatch(getRecord(key))
    }
  }
};

export default connect(mapStateToProps, mapDispatchToProps)(TimeRecordScreen);