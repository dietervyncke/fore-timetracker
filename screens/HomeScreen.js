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

import {createDirectoryZipFile} from '../util/zip';

import typography from '../constants/Typography';
import colors from '../constants/Colors';
import components from '../constants/Components';
import moment from 'moment';

import { convertDataToCsv, convertDataToTxt } from "../util/export";
import { sendMail } from "../util/send";

import DateTimePicker from './DateTimePicker';

import * as ScreenOrientation from 'expo-screen-orientation';
import * as FileSystem from 'expo-file-system';

import {Text, View, Alert, TouchableHighlight } from 'react-native';
import {Icon, Button} from 'react-native-elements';
import {SwipeListView} from 'react-native-swipe-list-view';

class HomeScreen extends Component
{
  state = {
    isDateTimePickerVisible: false,
    activeDateTimeProperty: null,
    dayTotal: 0,
    timeLogsSynced: false,
    assetsSynced: false,
    orientation: ScreenOrientation.Orientation.PORTRAIT_UP,
    loading: false
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
      let timeLogsSynced = this.timeLogsSynced();
      let assetsSynced = this.assetsSynced();

      this.setState({
        dayTotal: dayTotal,
        timeLogsSynced: timeLogsSynced,
        assetsSynced: assetsSynced
      });

    }
  }

  /**
   *
   */
  componentDidMount() {
    let dayTotal = this.getDayTotal();
    let timeLogsSynced = this.timeLogsSynced();
    let assetsSynced = this.assetsSynced();

    ScreenOrientation.getOrientationAsync().then(orientation => {
      this.setState({orientation: orientation});
    });

    this.setState({
      dayTotal: dayTotal,
      timeLogsSynced: timeLogsSynced,
      assetsSynced: assetsSynced
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
  timeLogsSynced() {
    if (this.props.records.length) {
      let unSyncedData = this.props.records.find(r => r.timeLogsSynced === false);
      return unSyncedData === undefined;
    }
  }

  /**
   *
   * @returns {boolean}
   */
  assetsSynced() {
    if (this.props.records.length) {
      return this.props.records.findIndex(r => ! r.assetsSynced) === -1;
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
  navigateToRecordAssets(key) {
    this.props.set(key);
    this.props.navigation.navigate('AssetsRecord');
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

  recordsContainsAssets() {
    return this.props.records.findIndex(record => (record.assets?.length || record.assetComments)) > -1;
  }

  /**
   *  Export and send mail
   **/
  exportData() {

    if (! this.state.timeLogsSynced) {
      this.export();
      return;
    }

    Alert.alert('Are you sure?', 'This data is already synced, send it again?', [{
      text: 'Export', onPress: () => this.export()
    }, {
      text: 'Cancel',
      onPress: () => {},
      style: 'cancel',
    }]);
  }

  async exportAssets() {

    this.toggleLoading();

    let baseDirectory = FileSystem.documentDirectory + 'fore/';
    let records = this.prepareRecordsForAssetsExport(this.props.records);

    let zipAttachments = [];

    for (let record of Object.values(records)) {

      let currentDirectory = baseDirectory + this.getFileName(record);

      try {
        await FileSystem.makeDirectoryAsync(currentDirectory, {intermediates: true});
      } catch (e) {
        this.toggleLoading();
      }

      if (record.assetComments) {
        await this.createTextFile( 'fore/'+this.getFileName(record)+'/comments', record.assetComments);
      }

      for (let i=0; i < record.assets.length; i++) {
        await FileSystem.copyAsync({
          from: record.assets[i],
          to: currentDirectory+'/'+i+'.jpg'
        });
      }

      let zip = await createDirectoryZipFile(currentDirectory, this.getFileName(record));

      if (zip) {
        zipAttachments.push(zip);
      }
    }

    let response = await sendMail(
        this.props.user.assetsEmailSubject,
        [this.props.user.assetsEmail],
        this.props.user.assetsEmailSubject,
        zipAttachments
    );

    for (let record of Object.values(records)) {
      await FileSystem.deleteAsync(baseDirectory + this.getFileName(record));
    }

    this.toggleLoading();

    if (response.status === 'sent') {
      this.props.syncAssets();
      Alert.alert('Success', 'Email sent successfully');
    }
  }

  getFileName(record) {
    return record.orderNumber+'_'+record.date.replace(new RegExp('/', 'g'), '-')+'_'+this.props.user.code;
  }

  toggleLoading() {
    this.setState(prevState => {
      return {
        loading: !prevState.loading
      }
    });
  }

  prepareRecordsForAssetsExport(records, recordsCopy = {}) {

    records.forEach(record => {

      if (record.orderNumber.trim().split('\n').length > 1) {
        return;
      }

      if (! recordsCopy[record.orderNumber]) {
        recordsCopy[record.orderNumber] = Object.assign({}, record);
        return;
      }

      const currentRecord = recordsCopy[record.orderNumber];
      currentRecord.assetComments = currentRecord.assetComments.concat('\n', record.assetComments);
      currentRecord.assets = currentRecord.assets.concat(record.assets);
    });

    return recordsCopy;
  }

  async createTextFile(name, data) {
    return await convertDataToTxt(name+'.txt', data);
  }

  /**
   *
   */
  export() {

    this.toggleLoading();

    let result = checkTimeOverlap(this.props.records);

    if (result.overlap) {
      Alert.alert('Woops', 'Can\'t submit, there is a time overlap.');
      this.toggleLoading();
      return;
    }

    let data = this.prepareDataForExport(Object.assign({}, {records: this.props.records}, {code: this.props.user.code}));
    let headers = ['Date - Time', 'Werkorder', 'Van', 'Tot', 'Opmerking', 'Schaft 15\'', 'Schaft 30\'', 'Totaal', 'Personeelscode'];

    if (! data.length) {
      Alert.alert('Woops', 'No data to export');
      this.toggleLoading();
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
          this.props.syncTimeLogs();
          Alert.alert('Success', 'Email sent successfully');
        }

        this.toggleLoading();

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
    let sendTimeLogButton = null;
    let sendAssetButton = null;

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
                  <View style={{justifyContent: 'space-between', flex: 1, flexDirection: 'row', alignItems: 'center'}}>
                    {data.item.multiOrder ?
                        <Icon name="slash" type="feather"
                              color={colors.color06}
                              size={30}
                              iconStyle={{paddingLeft: 10}}
                        /> :
                        <Icon name="file-plus" type="feather"
                              color={colors.color06}
                              size={30}
                              iconStyle={{paddingLeft: 10}}
                              onPress={() => {
                                this.navigateToRecordAssets(data.item.key)
                              }}
                        />
                    }
                    <Icon name="x" type="feather"
                          color={colors.color06}
                          size={30}
                          iconStyle={{paddingRight: 10}}
                          onPress={() => {
                            this.props.remove(data.item.key)
                          }}
                    />
                  </View>
              )}
              leftOpenValue={50}
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
        sendTimeLogButton = (
            <View flex={1}>
              <Button style={{marginTop: 10}} color={colors.color03} title="Export time logs"
                      onPress={() => this.exportData()}
                      containerStyle={{ borderRadius: 0 }}
                      disabled={!this.props.records.length || this.state.loading}
                      buttonStyle={[
                          { backgroundColor: colors.color06, borderRadius: 0, padding: 10 },
                          this.state.timeLogsSynced ? components.SyncedData : ''
                        ]}
              />
            </View>
        );
      }

      if (this.recordsContainsAssets()) {
        sendAssetButton = (
            <View flex={1}>
              <Button style={{marginTop: 10}}
                      containerStyle={{ borderRadius: 0 }}
                      color={colors.color03}
                      title="Export assets"
                      onPress={this.exportAssets.bind(this)}
                      disabled={!this.props.records.length || this.state.loading}
                      buttonStyle={[
                        { backgroundColor: colors.color06, borderRadius: 0, padding: 10 },
                        this.state.assetsSynced ? components.SyncedData : ''
                      ]}
              />
            </View>
        );
      }
    }

    return (

        <View style={{flex: 1, justifyContent: 'space-between', backgroundColor: colors.color01}}>

          {/* Header */}
          <View style={{
            justifyContent: 'space-between',
            flexDirection: 'row',
            alignItems: 'center',
            paddingLeft: 15,
            paddingRight: 15
          }}>
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

          <View style={{flexDirection: 'row'}}>
            {sendTimeLogButton}
            {sendAssetButton}
          </View>

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
import {removeRecord, setRecord, setDate, syncTimeLogs, syncAssets} from '../actions/record';

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
    syncTimeLogs: () => dispatch(syncTimeLogs()),
    syncAssets: () => dispatch(syncAssets())
  }
};

export default connect(mapStateToProps, mapDispatchToProps)(HomeScreen);
