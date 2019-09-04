import React from 'react';
import { View, TextInput, Button, Text, StyleSheet } from 'react-native';

import { getFormattedHoursAndMinutes, getFormattedTimeInterval, addTime, subtractTime } from '../util/time';
import 'moment-round';
import moment from 'moment';

import colors from '../constants/Colors';
import components from '../constants/Components';

import DateTimePicker from "react-native-modal-datetime-picker";

class TimeRecordScreen extends React.Component
{
  static navigationOptions = {
    title: 'Add record'
  };

  state = {
    record: {},
    isDateTimePickerVisible: false,
    activeDateTimeValue: new Date(),
    activeDateTimeProperty: null,
    activeBreakDuration: 0,
    hasCameraPermission: null,
    scanned: false,
  };

  componentDidMount() {
    this.setState({
      record: this.props.record,
      activeBreakDuration: this.props.record.breakDuration
    });
  }

  showDateTimePicker(property) {
    this.setState({
      isDateTimePickerVisible: true,
      activeDateTimeProperty: property,
      activeDateTimeValue: moment(this.state.record[property], 'HH:mm').toDate()
    });
  }

  hideDateTimePicker() {
    this.setState({
      isDateTimePickerVisible: false,
      activeDateTimeProperty: null
    });
  }

  handleDatePicked(date) {
    let validatedDate = this.validateInputField(date);
    this.onUpdateInputField(this.state.activeDateTimeProperty, getFormattedHoursAndMinutes(validatedDate));
    this.hideDateTimePicker();
  }

  handleBreakDuration(duration) {
    this.setState({activeBreakDuration: duration});
    this.onUpdateInputField('breakDuration', duration);
  }

  onPressSaveRow() {

    if (this.props.record.key !== null) {
      this.props.update(this.state.record);
    } else {
      this.props.add(this.state.record);
    }

    this.props.navigation.goBack();
  };

  validateInputField(date) {

    if (this.state.activeDateTimeProperty === 'endTime' && date <= moment(this.state.record.startTime, 'HH:mm')) {
      return addTime(this.state.record.startTime, 15, 'minutes');
    }

    if (this.state.activeDateTimeProperty === 'startTime' && date >= moment(this.state.record.endTime, 'HH:mm')) {
      return subtractTime(this.state.record.endTime, 15, 'minutes');
    }

    return date;
  }

  onUpdateInputField(property, value) {
    let record = this.state.record;
    record[property] = value;
    this.setState({record});
  }

  getActiveBreakDurationStyling(id) {
    if (id === this.state.activeBreakDuration) {
      return {backgroundColor: 'red'};
    }
  }

  render() {

    console.log(this.props.navigation.getParam('data', this.state.record.orderNumber));

    return (
      <View style={{flex: 1}}>

        <View style={{padding: 20, flex: 1}}>

          <View style={{alignItems: 'stretch'}}>

            <View style={components.FieldsetRow}>
              <TextInput
                style={components.Input}
                onChange={(orderNumber) => this.onUpdateInputField('orderNumber', orderNumber)}
                placeholder="Order number"
                defaultValue={this.props.navigation.getParam('data') ?? this.state.record.orderNumber}
              />
            </View>

            <View style={components.FieldsetRow}>
              <View style={components.FieldsetGroup}>

                <Text style={[components.Input, {marginRight: 5, flex: 1}]}
                      onPress={() => this.showDateTimePicker('startTime')}>
                  {this.state.record.startTime}
                </Text>

                <Text style={[components.Input, {marginLeft: 5, flex: 1}]}
                      onPress={() => this.showDateTimePicker('endTime')}>
                  {this.state.record.endTime}
                </Text>

              </View>
            </View>

            <View style={components.FieldsetRow}>
              <View style={components.FieldsetGroup}>
                <Text>Break:</Text>

                <Text style={[components.Input, {marginLeft: 5, marginRight: 5, flex: 1}, this.getActiveBreakDurationStyling(0)]}
                      onPress={() => this.handleBreakDuration(0)}>
                  0 min
                </Text>

                <Text style={[components.Input, {marginLeft: 5, marginRight: 5, flex: 1}, this.getActiveBreakDurationStyling(15)]}
                      onPress={() => this.handleBreakDuration(15)}>
                  15 min
                </Text>

                <Text style={[components.Input, {marginLeft: 5, marginRight: 5, flex: 1}, this.getActiveBreakDurationStyling(30)]}
                      onPress={() => this.handleBreakDuration(30)}>
                  30 min
                </Text>

                <TextInput style={components.Input} placeholder="Anders"
                           onChangeText={(breakDuration) => this.handleBreakDuration(parseInt(breakDuration))}
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

        <View style={components.TimeRecordDetailSummary}>
          <View style={components.TimeRecordDetailCalculation}>
            <Text style={[components.TimeRecordDetailTotalTime, components.Title02]}>
              {getFormattedTimeInterval(this.state.record.startTime, this.state.record.endTime)}
            </Text>
            <Text style={components.TimeRecordDetailBreakDuration}>
              -{this.state.activeBreakDuration} min
            </Text>
          </View>
          <Text style={components.Title01}>
            {getFormattedTimeInterval(this.state.record.startTime, this.state.record.endTime, this.state.record.breakDuration)}
          </Text>
        </View>

        <Button title="Save" onPress={this.onPressSaveRow.bind(this)} color={colors.color03}/>

        <Button title="Scan" onPress={(data) => {
          this.props.navigation.navigate('BarcodeScanner');
          console.log(data);
        }}/>

        <DateTimePicker
          mode={'time'}
          minuteInterval={15}
          date={this.state.activeDateTimeValue}
          isVisible={this.state.isDateTimePickerVisible}
          onConfirm={this.handleDatePicked.bind(this)}
          onCancel={this.hideDateTimePicker.bind(this)}
        />

      </View>
    );
  }
}

import { connect } from 'react-redux';
import { addRecord, getRecord, updateRecord } from '../actions/record';

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