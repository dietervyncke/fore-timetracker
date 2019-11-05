import React, { Component } from 'react';

import { getFormattedTimeInterval, getFormattedDate, subtractDays, addDays, timeStringToSec, formatTime } from '../util/time';
import typography from '../constants/Typography';
import colors from '../constants/Colors';
import components from '../constants/Components';
import moment from 'moment';

import { convertDataToCsv } from "../util/export";
import { sendMail } from "../util/send";

import DateTimePicker from './DateTimePicker';

import { Text, View, Alert, TouchableHighlight } from 'react-native';
import { Icon, Button } from 'react-native-elements';
import { SwipeListView } from 'react-native-swipe-list-view';

class HomeScreen extends Component
{
  static navigationOptions = ({ navigation }) => {
    return {
      title: 'Time clock',
      headerLeft: () => (
          <Icon type="feather" name="settings" color={colors.color06}
                onPress={() => navigation.push('Settings')} iconStyle={{paddingLeft: 10}}
          />
      ),
    }
  };

  state = {
    isDateTimePickerVisible: false,
    activeDateTimeProperty: null,
    dayTotal: 0,
    isSynced: false
  };

  componentDidUpdate(prevProps, prevState, snapshot) {
    if (prevProps.records !== this.props.records) {
      let dayTotal = this.getDayTotal();
      let isSynced = this.isDataSynced();

      this.setState({
        dayTotal: dayTotal,
        isSynced: isSynced
      });

    }
  }

  componentDidMount() {
    let dayTotal = this.getDayTotal();
    let isSynced = this.isDataSynced();
    this.setState({
      dayTotal: dayTotal,
      isSynced: isSynced
    });
  }

  getDayTotal() {
    let dayTotal = '00:00';

    this.props.records.forEach(record => {
      let diff = getFormattedTimeInterval(record.startTime, record.endTime, record.breakDuration);
      dayTotal = formatTime(timeStringToSec(dayTotal)+timeStringToSec(diff));
    });

    return dayTotal;
  }

  isDataSynced() {
    if (this.props.records.length) {
      let unSyncedData = this.props.records.find(r => r.isSynced === false);
      return unSyncedData === undefined;
    }
  }

  /**
  * DateTimePicker methods
  **/
  showDateTimePicker() {
    this.setState({ isDateTimePickerVisible: true });
  }

  hideDateTimePicker() {
    this.setState({
      isDateTimePickerVisible: false,
      activeDateTimeProperty: null
    });
  }

  handleDatePicked(date) {
    this.props.setDate(getFormattedDate(date));
    this.hideDateTimePicker();
  }

  navigateToRecordDetail(key) {
    this.props.set(key);
    this.props.navigation.navigate('TimeRecord');
  }

  setPreviousDay() {
    let prevDay = subtractDays(this.props.currentDate);
    this.props.setDate(getFormattedDate(prevDay));
  }

  setNextDay() {
    let nextDay = addDays(this.props.currentDate);
    this.props.setDate(getFormattedDate(nextDay));
  }

  /**
   *  Export and send mail
   **/
  exportData() {

    let data = this.prepareDataForExport(Object.assign({}, {records: this.props.records}, {code: this.props.user.code}));
    let headers = ['Date - Time', 'Werkorder', 'Van', 'Tot', 'Opmerking', 'Schaft 15\'', 'Schaft 30\'', 'Totaal', 'Personeelscode'];

    convertDataToCsv(this.props.user.emailSubject+'.csv', data, headers).then(file => {

      sendMail(
          this.props.user.emailSubject,
          [this.props.user.storeEmail],
          this.props.user.emailSubject,
          [file.uri]
      ).then(response => {

        if (response.status === 'sent') {
          this.props.syncData();
          Alert.alert('Success ', 'Email sent successfully');
        }

      });
    });
  }

  prepareDataForExport(data) {
    return data.records.map(record => {

      let longBreak = Math.floor(record.breakDuration/30);
      let shortBreak = (record.breakDuration % 30)/15;

      return {
        'date': record.date,
        'orderNumber': record.orderNumber,
        'startTime': record.startTime,
        'endTime': record.endTime,
        'description': record.description,
        'shortBreaks': shortBreak,
        'longBreaks': longBreak,
        'total': getFormattedTimeInterval(record.startTime, record.endTime, record.breakDuration),
        'userCode': data.code
      };
    });
  }

  getRenderedTimeRecord(record) {

    let breakDuration;

    if (record.breakDuration > 0) {
      breakDuration = <Text style={{marginRight: 15}}>{record.breakDuration}min</Text>
    }

    return (
      <TouchableHighlight onPress={this.navigateToRecordDetail.bind(this, record.key)}>
        <View style={components.TimeRecordRow}>

          <View style={components.TimeRecordRowMain}>

            <View style={components.TimeRecordRowHeader}>
              <Text>{record.orderNumber}</Text>

              <View style={components.TimeRecordRowTimeDetail}>
                {breakDuration}
                <Text>{record.startTime} - {record.endTime}</Text>
              </View>

            </View>

          </View>

          <View style={components.TimeRecordRowTotalTime}>
            <Text>
              {getFormattedTimeInterval(record.startTime, record.endTime, record.breakDuration)}
            </Text>
          </View>

        </View>
      </TouchableHighlight>
    );
  }

  render() {

    let dayTotal = null;
    let timeRecords = null;
    let currentDate = null;

    if (this.props.currentDate) {
      currentDate = this.props.currentDate;
    }

    if (this.props.records.length) {

      timeRecords = (
        <SwipeListView
          data={this.props.records}
          keyExtractor={(item, index) => index.toString()}
          renderItem={({item}) => this.getRenderedTimeRecord(item)}
          renderHiddenItem={ (data) => (
            <View style={{justifyContent: 'flex-end', flex: 1, flexDirection: 'row', alignItems: 'center'}}>
              <Icon name="x" type="feather" color={colors.color06} size={30}
                    iconStyle={{paddingRight: 10}}
                    onPress={() => {this.props.remove(data.item.key)}}/>
            </View>
          )}
          rightOpenValue={-50}
        />
      );

      dayTotal = (
          <Text>{this.state.dayTotal}</Text>
      );
    }

    return (

      <View style={{flex: 1}}>

        {/* Header */}
        <View style={[{height: 75, flexDirection: 'row', alignItems: 'center', justifyContent: 'center'}, this.state.isSynced ? components.SyncedData : '']}>
            <Icon type="feather" name="chevron-left" color={colors.color06} onPress={() => {this.setPreviousDay()}} iconStyle={{paddingRight: 15}} />
            <Text style={typography.title01} onPress={() => this.showDateTimePicker()}>
              {currentDate}
            </Text>
          <Icon type="feather" name="chevron-right" color={colors.color06} onPress={() => {this.setNextDay()}} iconStyle={{paddingLeft: 15}} />
        </View>

        {/* Main Content */}
        <View style={{flex: 5}}>
          <View>
            {timeRecords}
          </View>
          <View style={{flex: 1, alignItems: 'flex-end', paddingRight: 20, paddingTop: 10}}>
            {dayTotal}
          </View>
        </View>

        {/* Footer */}
        <View style={{flex: 1, alignItems: 'center', justifyContent: 'center'}}>
          <View style={{marginTop: 25}}>
            <Icon name="plus-circle" type="feather" color={colors.color06} size={30}
                  onPress={this.navigateToRecordDetail.bind(this, null)}/>
          </View>
        </View>

        <Button style={{marginTop: 25}} color={colors.color03} title="Send email data" onPress={() => this.exportData()}
                buttonStyle={{backgroundColor: colors.color06, borderRadius: 0, padding: 10}}
        />

        <DateTimePicker
            date={moment(this.props.currentDate, 'YYYY/MM/DD').toDate()}
            isVisible={this.state.isDateTimePickerVisible}
            onConfirm={this.handleDatePicked.bind(this)}
            onCancel={this.hideDateTimePicker.bind(this)}
        />

      </View>
    );
  }
}

import { connect } from 'react-redux';
import { removeRecord, setRecord, setDate, syncData } from '../actions/record';

const mapStateToProps = state => {
  return {
    currentDate: state.records.currentDate,
    records: state.records.records.filter(r => {
      return moment(r.date, 'YYYY/MM/DD').isSame(moment(state.records.currentDate, 'YYYY/MM/DD'), 'day');
    }),
    user: state.records.user
  }
};

const mapDispatchToProps = dispatch => {
  return {
    remove: (key) => dispatch(removeRecord(key)),
    set: (key) => dispatch(setRecord(key)),
    setDate: (date) => dispatch(setDate(date)),
    syncData: () => dispatch(syncData())
  }
};

export default connect(mapStateToProps, mapDispatchToProps)(HomeScreen);
