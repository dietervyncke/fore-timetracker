import React, {Component} from 'react';

import {
  getFormattedTimeInterval,
  getFormattedDate,
  subtractDays,
  addDays,
  timeStringToMinutes,
  formatTime,
  getFormattedDisplayDate,
  checkTimeOverlap,
  addTime,
  getFormattedHoursAndMinutes
} from '../util/time';

import typography from '../constants/Typography';
import colors from '../constants/Colors';
import components from '../constants/Components';
import moment from 'moment';

import { convertDataToCsv } from "../util/export";
import { sendMail } from "../util/send";

import DateTimePicker from './DateTimePicker';

import * as ScreenOrientation from 'expo-screen-orientation';

import {Text, View, Alert, TouchableHighlight } from 'react-native';
import {Icon, Button} from 'react-native-elements';
import {SwipeListView} from 'react-native-swipe-list-view';

class HomeScreen extends Component
{
  state = {
    isDateTimePickerVisible: false,
    activeDateTimeProperty: null,
    dayTotal: 0,
    isSynced: false,
    orientation: ScreenOrientation.Orientation.PORTRAIT_UP
  };

  /**
   *
   * @param props
   */
  constructor(props) {
    super(props);

    ScreenOrientation.addOrientationChangeListener(e => {
      this.setState({orientation: e.orientationInfo.orientation});
    });
  }

  /**
   *
   * @param prevProps
   * @param prevState
   * @param snapshot
   */
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

  /**
   *
   */
  componentDidMount() {
    let dayTotal = this.getDayTotal();
    let isSynced = this.isDataSynced();

    ScreenOrientation.getOrientationAsync().then(orientation => {
      this.setState({orientation: orientation});
    });

    this.setState({
      dayTotal: dayTotal,
      isSynced: isSynced,
    });
  }

  /**
   *
   */
  componentWillUnmount() {
    ScreenOrientation.removeOrientationChangeListeners();
  }

  /**
   *
   * @returns {string}
   */
  getDayTotal() {
    let dayTotal = '00:00';

    this.props.records.forEach(record => {
      let diff = getFormattedTimeInterval(record.startTime, record.endTime, record.breakDuration);
      dayTotal = formatTime(timeStringToMinutes(dayTotal) + timeStringToMinutes(diff));
    });

    return dayTotal;
  }

  /**
   *
   * @returns {boolean}
   */
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
    this.setState({isDateTimePickerVisible: true});
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
    this.hideDateTimePicker();
    this.props.setDate(getFormattedDate(date));
  }

  /**
   *
   * @param key
   */
  navigateToRecordDetail(key) {
    this.props.set(key);
    this.props.navigation.navigate('TimeRecord');
  }

  /**
   *
   */
  setPreviousDay() {
    let prevDay = subtractDays(this.props.currentDate);
    this.props.setDate(getFormattedDate(prevDay));
  }

  /**
   *
   */
  setNextDay() {
    let nextDay = addDays(this.props.currentDate);
    this.props.setDate(getFormattedDate(nextDay));
  }

  /**
   *
   */
  setCurrentDay() {
    this.props.setDate(getFormattedDate(Date.now()));
  }

  /**
   *  Export and send mail
   **/
  exportData() {

    if (! this.state.isSynced) {
      this.export();
      return;
    }

    Alert.alert('Are you sure?', 'This data is already synced, send it again?', [
      {
        text: 'Export', onPress: () => this.export()
      },
      {
        text: 'Cancel',
        onPress: () => {},
        style: 'cancel',
      },
    ]);
  }

  /**
   *
   */
  export() {

    let result = checkTimeOverlap(this.props.records);

    if (result.overlap) {
      Alert.alert('Woops', 'Can\'t submit, there is a time overlap.');
      return;
    }

    let data = this.prepareDataForExport(Object.assign({}, {records: this.props.records}, {code: this.props.user.code}));
    let headers = ['Date - Time', 'Werkorder', 'Van', 'Tot', 'Opmerking', 'Schaft 15\'', 'Schaft 30\'', 'Totaal', 'Personeelscode'];

    if (! data.length) {
      Alert.alert('Woops', 'No data to export');
      return;
    }

    convertDataToCsv(this.props.user.emailSubject + '.csv', data, headers).then(file => {

      sendMail(
          this.props.user.emailSubject,
          [this.props.user.storeEmail],
          this.props.user.emailSubject,
          [file.uri]
      ).then(response => {

        if (response.status === 'sent') {
          this.props.syncData();
          Alert.alert('Success', 'Email sent successfully');
        }

      });
    });
  }

  /**
   *
   */
  prepareDataForExport(data) {

    let dataCopy = [];

    data.records.forEach(record => {

      let orderNumbers = record.orderNumber.trim().split('\n');

      if (orderNumbers.length === 1) {
        dataCopy.push(record);
        return;
      }

      let rowTotal = timeStringToMinutes(getFormattedTimeInterval(record.startTime, record.endTime, record.breakDuration)) / orderNumbers.length;

      let endTime = getFormattedHoursAndMinutes(addTime(record.startTime, rowTotal, 'minutes'));
      let startTime = record.startTime;

      for (let i = 0; i < orderNumbers.length; i++) {

        if (i !== 0) {
          endTime = getFormattedHoursAndMinutes(addTime(startTime, rowTotal, 'minutes'));
        }

        dataCopy.push({
          orderNumber: orderNumbers[i].trim(),
          date: record.date,
          startTime: startTime,
          endTime: endTime,
          breakDuration: 0,
          description: record.description
        });

        startTime = endTime;

      }

    });

    return dataCopy
        .filter(record => timeStringToMinutes(getFormattedTimeInterval(record.startTime, record.endTime, record.breakDuration)) > 0)
        .map(record => {

          let longBreak = Math.floor(record.breakDuration / 30);
          let shortBreak = (record.breakDuration % 30) / 15;

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

  /**
   *
   */
  getRenderedTimeRecord(record) {

    let breakDuration;
    let description;
    let multiOrderDuration;

    if (record.breakDuration > 0) {
      breakDuration = <Text style={{marginRight: 15}}>{record.breakDuration}min</Text>
    }

    if (record.description && (
        this.state.orientation === ScreenOrientation.Orientation.LANDSCAPE_LEFT ||
        this.state.orientation === ScreenOrientation.Orientation.LANDSCAPE_RIGHT
    )) {
      description = <Text style={{marginRight: 15}}>{record.description.substring(0, 30) + '...'}</Text>
    }

    if (record.multiOrder) {
      let orderNumbers = record.orderNumber.trim().split('\n');
      let perOrderTotal = formatTime(timeStringToMinutes(getFormattedTimeInterval(record.startTime, record.endTime, record.breakDuration)) / orderNumbers.length);

      multiOrderDuration = (
          <View style={{paddingTop: 5}}>
            <Text>({orderNumbers.length} x {perOrderTotal})</Text>
          </View>
      );
    }

    return (
        <TouchableHighlight onPress={this.navigateToRecordDetail.bind(this, record.key)}>
          <View style={components.TimeRecordRow}>

            <View>
              <Text>{record.orderNumber}</Text>
            </View>

            <View style={components.TimeRecordRowMain}>

              <View style={components.TimeRecordRowHeader}>
                <Text style={{paddingLeft: 25, flexGrow: 1}}>{description}</Text>
                {breakDuration}
                <Text>{record.startTime} - {record.endTime}</Text>

                <Text style={{paddingLeft: 10}}>
                  {getFormattedTimeInterval(record.startTime, record.endTime, record.breakDuration)}
                </Text>
              </View>

              {multiOrderDuration}

            </View>

          </View>
        </TouchableHighlight>
    );
  }

  /**
   *
   */
  render() {

    let dayTotal = null;
    let timeRecords = null;
    let currentDate = null;
    let sendDataButton = null;

    if (this.props.currentDate) {
      currentDate = getFormattedDisplayDate(this.props.currentDate);
    }

    if (this.props.records.length) {

      timeRecords = (
          <SwipeListView
              data={this.props.records}
              keyExtractor={(item, index) => index.toString()}
              renderItem={({item}) => this.getRenderedTimeRecord(item)}
              renderHiddenItem={(data) => (
                  <View style={{justifyContent: 'flex-end', flex: 1, flexDirection: 'row', alignItems: 'center'}}>
                    <Icon name="x" type="feather" color={colors.color06} size={30}
                          iconStyle={{paddingRight: 10}}
                          onPress={() => {
                            this.props.remove(data.item.key)
                          }}/>
                  </View>
              )}
              rightOpenValue={-50}
              disableHiddenLayoutCalculation={true}
          />
      );

      dayTotal = (
          <Text>{this.state.dayTotal}</Text>
      );

      if (
          this.state.orientation === ScreenOrientation.Orientation.PORTRAIT_UP ||
          this.state.orientation === ScreenOrientation.Orientation.PORTRAIT_DOWN
      ) {
        sendDataButton = <Button style={{marginTop: 10}} color={colors.color03} title="Export data"
                                 onPress={() => this.exportData()}
                                 buttonStyle={{backgroundColor: colors.color06, borderRadius: 0, padding: 10}}
                                 disabled={!this.props.records.length}
        />;
      }
    }

    return (

        <View style={{flex: 1, justifyContent: 'space-between', backgroundColor: colors.color01}}>

          {/* Header */}
          <View style={[{
            justifyContent: 'space-between',
            flexDirection: 'row',
            alignItems: 'center',
            paddingLeft: 15,
            paddingRight: 15
          }, this.state.isSynced ? components.SyncedData : '']}>
            <View style={{
              height: 75,
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <Text style={typography.title01} onPress={() => this.showDateTimePicker()}>
                {currentDate}
              </Text>
            </View>
            <View style={{flexDirection: 'row', alignItems: 'center', justifyContent: 'center'}}>
              <Icon type="feather" name="chevron-left" color={colors.color06} onPress={() => {
                this.setPreviousDay()
              }} iconStyle={{paddingRight: 15}}/>
              <Icon type="feather" name="sun" color={colors.color06} onPress={() => {
                this.setCurrentDay()
              }}/>
              <Icon type="feather" name="chevron-right" color={colors.color06} onPress={() => {
                this.setNextDay()
              }} iconStyle={{paddingLeft: 15}}/>
            </View>
          </View>

          {/* Main Content */}
          <View style={{flex: 1}}>
            <View>
              {timeRecords}
            </View>
            <View style={{alignItems: 'flex-end', paddingRight: 20, paddingTop: 10}}>
              {dayTotal}
            </View>
          </View>

          {/* Footer */}
          <View style={{alignItems: 'center', justifyContent: 'center', marginTop: 20, marginBottom: 10}}>
            <Icon name="plus-circle" type="feather" color={colors.color06} size={30}
                  onPress={this.navigateToRecordDetail.bind(this, null)}/>
          </View>

          {sendDataButton}

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

import {connect} from 'react-redux';
import {removeRecord, setRecord, setDate, syncData} from '../actions/record';

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
