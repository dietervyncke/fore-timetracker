import React from 'react';
import { View, TouchableWithoutFeedback, ScrollView, Alert } from 'react-native';
import { Button, Input, Text, Icon } from 'react-native-elements';
import * as ScreenOrientation from 'expo-screen-orientation';

import {
  getFormattedRoundHoursAndMinutes,
  getFormattedTimeInterval,
  addTime,
  getUtcHoursMinutes, getTimeInterval
} from '../util/time';
import 'moment-round';
import moment from 'moment';

import colors from '../constants/Colors';
import components from '../constants/Components';

import DateTimePicker from './DateTimePicker';

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
    orientation: ScreenOrientation.Orientation.PORTRAIT_UP
  };

  /**
   *
   * @param props
   */
  constructor(props) {
    super(props);

    this.inputFields = [];
    this.orderInput = React.createRef();
    this.inputFields.push(this.orderInput);
  }

  /**
   *
   */
  componentDidMount() {

    let record = this.props.record;
    let previousRecord = this.props.records[this.props.records.length-1] ?? null;

    if (! this.props.record.key) {
      record = Object.assign(this.props.record, {
        orderNumber: '',
        description: '',
        breakDuration: 0
      });

      if (previousRecord) {
        record.startTime = previousRecord.endTime;
        record.endTime = previousRecord.endTime;
      } else {
        record.startTime = getFormattedRoundHoursAndMinutes();
        record.endTime = getFormattedRoundHoursAndMinutes();
      }
    }

    this.setState({
      record: record,
      activeBreakDuration: record.breakDuration
    });
  }

  /**
   *
   * @param prevProps
   */
  componentDidUpdate(prevProps) {
    if (prevProps.navigation.getParam('id') !== this.props.navigation.getParam('id')) {
      this.onUpdateInputField('orderNumber', (this.props.record.orderNumber ? this.props.record.orderNumber+'\n' : '')+this.props.navigation.getParam('data'));
    }
  }

  /**
   * DateTimePicker methods
   **/
  showDateTimePicker(property) {
    this.setState({
      isDateTimePickerVisible: true,
      activeDateTimeProperty: property,
      activeDateTimeValue: moment(this.state.record[property], 'HH:mm').toDate()
    });
  }

  /**
   *
   */
  hideDateTimePicker() {
    this.setState({
      isDateTimePickerVisible: false,
      activeDateTimeProperty: null
    });
  }

  /**
   *
   * @param date
   */
  handleDatePicked(date) {
    this.onUpdateInputField(this.state.activeDateTimeProperty, getFormattedRoundHoursAndMinutes(date));
    this.getTotalBreakDuration();
    this.hideDateTimePicker();
  }

  /**
   *
   * @param duration
   */
  handleBreakDuration(duration) {
    this.setState({activeBreakDuration: duration});
    this.onUpdateInputField('breakDuration', duration);
  }

  /**
   *
   */
  incrementBreakDuration() {
    if (getTimeInterval(this.state.record.startTime, this.state.record.endTime, this.state.record.breakDuration) > this.state.activeBreakDuration) {
      this.handleBreakDuration(this.state.activeBreakDuration+15);
    }
  }

  /**
   *
   */
  decrementBreakDuration() {
    this.handleBreakDuration(Math.max(this.getMinimumBreakDuration(), this.state.activeBreakDuration-15));
  }

  /**
   *
   */
  getTotalBreakDuration() {
    let totalBreak = this.getMinimumBreakDuration();
    this.handleBreakDuration(totalBreak);
  }

  /**
   *
   * @param totalBreak
   * @returns {number}
   */
  getMinimumBreakDuration(totalBreak = 0) {
    totalBreak += this.calculateBreakDuration(this.props.user.longBreaks, 30);
    totalBreak += this.calculateBreakDuration(this.props.user.shortBreaks, 15);

    return totalBreak;
  }

  /**
   *
   * @param breaks
   * @param value
   * @returns {number}
   */
  calculateBreakDuration(breaks, value) {
    let breakDuration = 0;

    breaks.forEach(b => {
      let startTime = getUtcHoursMinutes(this.props.record.startTime);
      let endTime = getUtcHoursMinutes(this.props.record.endTime);
      let currentBreak = getUtcHoursMinutes(b);

      if (startTime.isSameOrBefore(currentBreak) && currentBreak.isBefore(endTime)) {
        breakDuration += value;
      }

    });

    return breakDuration;
  }

  /**
   *
   */
  onPressSaveRow() {

    let validateAmount = this.validateTime(this.state.record.endTime);

    if (validateAmount) {
      this.correctTime('endTime', validateAmount);
      this.handleBreakDuration(this.getMinimumBreakDuration());
      Alert.alert('Whoops', 'Your time will be updated');
      return;
    }

    let isValid = true;

    this.inputFields.forEach(input => {

      const values = input.current.props.value.trim().split('\n');

      this.onUpdateInputField('multiOrder', values.length > 1);

      if (! this.isValid(values, input.current.props.pattern)) {
        isValid = false;
      }
    });

    if (!isValid) {
      Alert.alert('Whoops', 'Can\'t submit, incorrect order number');
      return;
    }

    if (this.props.record.key !== null) {
      this.props.update(this.state.record);
    } else {
      this.props.add(this.state.record);
    }

    this.props.navigation.goBack();
  };

  /**
   *
   * @param date
   * @returns {*}
   */
  validateTime(date) {

    let minimumTime = addTime(this.state.record.startTime, this.getMinimumBreakDuration(), 'minutes');

    if (moment(minimumTime, 'HH:mm') <= moment(date, 'HH:mm')) {
      return null;
    }

    if (moment(this.state.record.startTime, 'HH:mm') > moment(date, 'HH:mm')) {
      return 15;
    }

    return 30;
  }

  /**
   *
   * @param property
   * @param amount
   */
  correctTime(property, amount = 15) {
      let time = addTime(this.state.record.startTime, amount, 'minutes');
      this.onUpdateInputField(property, getFormattedRoundHoursAndMinutes(time));
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

  /**
   *
   * @param values
   * @param pattern
   * @returns {boolean}
   */
  isValid(values, pattern) {
    let isValid = true;

    values.forEach(value => {
      if (! new RegExp(pattern, 'g').test(value)) {
        isValid = false;
      }
    });

    return isValid;
  }

  /**
   *
   * @returns {*}
   */
  render() {

    let summary;

    if (this.state.orientation === ScreenOrientation.Orientation.PORTRAIT_UP) {
      summary = (
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
      );
    }

    return (
      <View style={{flex: 1}}>

        <View style={{padding: 20, flex: 1}}>

          <ScrollView>

            <View style={components.FieldsetRow}>
              <View style={components.FieldsetGroup}>
                <Input
                    ref={this.orderInput}
                    containerStyle={{flex: 1}}
                    onChangeText={(orderNumber) => this.onUpdateInputField('orderNumber', orderNumber)}
                    onEndEditing={({nativeEvent}) => this.onUpdateInputField('orderNumber', nativeEvent.text.trim())}
                    placeholder="Order number"
                    pattern={'(([a-zA-Z0-9éèà!@#$%^&*(),.?":{}|<>]{6})-((V|v|P|p|I|i|M|m|A|a|D|d)|[0-9]{1})([0-9]{3}))'}
                    value={this.state.record.orderNumber}
                    multiline={true}
                />
                <Button title="Scan" buttonStyle={{backgroundColor: colors.color06, borderRadius: 0, marginRight: 5}} onPress={() => {this.props.navigation.navigate('BarcodeScanner')}}/>
              </View>
            </View>


            <View style={components.FieldsetRow}>
              <View style={components.FieldsetGroup}>

                <TouchableWithoutFeedback onPress={() => {this.showDateTimePicker('startTime')}}>
                  <View style={{flex: 1}}>
                    <View pointerEvents="none" style={{flex: 1}}>
                      <Input value={this.state.record.startTime} />
                    </View>
                  </View>
                </TouchableWithoutFeedback>

                <TouchableWithoutFeedback onPress={() => {this.showDateTimePicker('endTime')}}>
                  <View style={{flex: 1}}>
                    <View pointerEvents="none" style={{flex: 1}}>
                      <Input value={this.state.record.endTime} />
                    </View>
                  </View>
                </TouchableWithoutFeedback>

              </View>
            </View>

            <View style={components.FieldsetRow}>
              <View style={components.FieldsetGroup}>
                <Icon type="feather" name="pause" color={colors.color06} size={30} />

                <View style={{flex: 1, flexDirection: 'row', marginRight: 15}}>
                  <Text style={[components.Input, {marginLeft: 10, marginRight: 5, flex: 1, textAlign: 'center'}]}>
                    {this.state.activeBreakDuration} min
                  </Text>
                </View>
                <Icon type="feather" name="minus" color={colors.color06} size={30} onPress={() => this.decrementBreakDuration()} iconStyle={{marginRight: 10}}/>
                <Icon type="feather" name="plus" color={colors.color06} size={30} onPress={() => this.incrementBreakDuration()} />

              </View>
            </View>

            <View style={components.FieldsetRow}>
              <Input
                onChangeText={(description) => this.onUpdateInputField('description', description)}
                placeholder="Description"
                maxLength={60}
                value={this.state.record.description}
              />
            </View>

          </ScrollView>

        </View>

        {summary}

        <Button title="Save" buttonStyle={{backgroundColor: colors.color06, borderRadius: 0, padding: 10}}
                onPress={this.onPressSaveRow.bind(this)} color={colors.color03}/>

        {!!this.state.isDateTimePickerVisible && (
            <DateTimePicker
                date={this.state.activeDateTimeValue}
                minuteInterval={15}
                mode='time'
                onConfirm={this.handleDatePicked.bind(this)}
                onCancel={this.hideDateTimePicker.bind(this)}
            />
        )}

      </View>
    );
  }
}

import { connect } from 'react-redux';
import { addRecord, getRecord, updateRecord } from '../actions/record';

const mapStateToProps = state => {
  return {
    user: state.records.user,
    record: state.records.record,
    records: state.records.records.filter(r => {
      return moment(r.date, 'YYYY/MM/DD').isSame(moment(state.records.currentDate, 'YYYY/MM/DD'), 'day');
    })
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