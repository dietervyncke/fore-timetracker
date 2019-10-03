import React, {Component} from 'react';
import typography from '../constants/Typography';
import colors from '../constants/Colors';
import components from '../constants/Components';
import moment from 'moment';

import DateTimePicker from "react-native-modal-datetime-picker";
import * as MailComposer from 'expo-mail-composer';
import * as FileSystem from 'expo-file-system';
import { ExportToCsv } from 'export-to-csv';

import { Text, View, Button, Alert, TouchableHighlight } from 'react-native';
import { SwipeListView } from 'react-native-swipe-list-view';
import { Icon } from 'react-native-elements';

import { getFormattedTimeInterval, getFormattedDate, subtractDays, addDays, timeStringToSec, formatTime } from '../util/time';

class HomeScreen extends Component
{
  static navigationOptions = {
    title: 'Time clock',
  };

  constructor(props) {
    super(props);
  }

  state = {
    isDateTimePickerVisible: false,
    activeDateTimeProperty: null,
    dayTotal: 0
  };

  componentDidUpdate(prevProps, prevState, snapshot) {
    if (prevProps.records !== this.props.records) {
      let dayTotal = this.getDayTotal();
      this.setState({dayTotal: dayTotal});
    }
  }

  componentDidMount() {
    let dayTotal = this.getDayTotal();
    this.setState({dayTotal: dayTotal});
  }

  getDayTotal() {
    let dayTotal = '00:00';

    this.props.records.forEach(record => {
      let diff = getFormattedTimeInterval(record.startTime, record.endTime, record.breakDuration);
      dayTotal = formatTime(timeStringToSec(dayTotal)+timeStringToSec(diff));
    });

    return dayTotal;
  }

  showDateTimePicker() {
    this.setState({
      isDateTimePickerVisible: true
    });
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

  exportData() {
    let fileName = 'test.csv';
    let csvContent = this.exportCsvFile(this.props.records);
    const fileUri = FileSystem.documentDirectory+fileName;

    this.writeFile(csvContent, fileUri).then(() => {
     this.getFileInfo(fileUri).then(file => {
       this.sendMail(
         'fore time tracker record',
         ['vynckedieter@gmail.com'],
         'testjen',
         [file.uri]
       );
     });
   });
  }

  async getFileInfo(fileUri) {
    return await FileSystem.getInfoAsync(fileUri);
  }

  async writeFile(content, fileUri) {
    return await FileSystem.writeAsStringAsync(
      fileUri,
      content
    );
  }

  exportCsvFile(objects) {
    const options = {
      fieldSeparator: ',',
      quoteStrings: '"',
      decimalSeparator: '.',
      showLabels: true,
      showTitle: false,
      useTextFile: false,
      useBom: true,
      useKeysAsHeaders: true
    };
    const csvExporter = new ExportToCsv(options);
    return csvExporter.generateCsv(objects, true);
  }

  sendMail(subject, recipients = [], body, attachments = []) {
    MailComposer.composeAsync({
      recipients: recipients,
      subject: subject,
      body: body,
      isHtml: true,
      attachments
    }).then((response) => {

      if (response.status === "send") {
        Alert.alert('Success ', 'Email sent successfully');
      }
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

      dayTotal = <Text>{this.state.dayTotal}</Text>;
    }

    return (

      <View style={{flex: 1}}>

        {/* Header */}
        <View style={{height: 75, flexDirection: 'row', alignItems: 'center', justifyContent: 'center'}}>
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
          <View>
            {dayTotal}
          </View>
        </View>

        <View style={{flex: 1, alignItems: 'center', justifyContent: 'center'}}>
          <View style={{marginTop: 25}}>
            <Icon name="plus-circle" type="feather" color={colors.color06} size={30}
                  onPress={this.navigateToRecordDetail.bind(this, null)}/>
          </View>
        </View>

        <Button style={{marginTop: 25}} color={colors.color03} title="Send email data" onPress={() => this.exportData()}/>

        <DateTimePicker
          mode={'date'}
          date={moment(this.props.currentDate, 'DD/MM/YYYY').toDate()}
          isVisible={this.state.isDateTimePickerVisible}
          onConfirm={this.handleDatePicked.bind(this)}
          onCancel={this.hideDateTimePicker.bind(this)}
        />

      </View>
    );
  }
}

import { connect } from 'react-redux';
import { removeRecord, setRecord, setDate } from '../actions/record';

const mapStateToProps = state => {
  return {
    currentDate: state.records.currentDate,
    records: state.records.records.filter(r => {
      return moment(r.date, 'DD/MM/YYYY').isSame(moment(state.records.currentDate, 'DD/MM/YYYY'), 'day');
    })
  }
};

const mapDispatchToProps = dispatch => {
  return {
    remove: (key) => dispatch(removeRecord(key)),
    set: (key) => dispatch(setRecord(key)),
    setDate: (date) => dispatch(setDate(date))
  }
};

export default connect(mapStateToProps, mapDispatchToProps)(HomeScreen);
