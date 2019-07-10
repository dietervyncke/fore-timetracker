import React, {Component} from 'react';
import styles from '../constants/Typography';
import colors from '../constants/Colors';
import components from '../constants/Components';

import {
  Text,
  View,
  Button
} from 'react-native';

import {getFormattedHoursMinutes, getTimeInterval} from '../util/time';

class HomeScreen extends Component
{
  static navigationOptions = {
    title: 'Time clock',
  };

  state = {
    currentDate: new Date()
  };

  navigateToRecordDetail(key) {
    this.props.set(key);
    this.props.navigation.navigate('TimeRecord');
  }

  getTimeRecordRows() {

    if (this.props.records) {

      return this.props.records.map(record => {
        return (
          <View key={record.key} style={components.TimeRecordRow}>

            <View style={components.TimeRecordRowTotalTime}>
              <Text>
                {getTimeInterval(record.startTime, record.endTime, record.breakDuration)}
              </Text>
            </View>

            <View style={components.TimeRecordRowMain}>

              <View style={components.TimeRecordRowHeader}>
                <Text>{record.orderNumber}</Text>

                <View style={components.TimeRecordRowTimeDetail}>
                  <Text style={{marginRight: 15}}>{record.breakDuration}min</Text>
                  <Text>{getFormattedHoursMinutes(record.startTime)} - {getFormattedHoursMinutes(record.endTime)}</Text>
                </View>

              </View>

              <View style={components.TimeRecordRowDescription}>
                <Text>{record.description}</Text>
              </View>

              <View style={{flexDirection: 'row'}}>
                <Button color={colors.color03} title="Edit row" onPress={this.navigateToRecordDetail.bind(this, record.key)}/>
                <Button color={colors.color03} title="Delete row" onPress={() => {this.props.remove(record.key)}}/>
              </View>

            </View>

          </View>
        );
      });

    }

  }

  render() {

    let currentDate = this.state.currentDate;
    let dd = String(currentDate.getDate()).padStart(2, '0');
    let mm = String(currentDate.getMonth() + 1).padStart(2, '0');
    let yyyy = currentDate.getFullYear();

    let timeRecords = this.getTimeRecordRows();

    return (

      <View style={{flex: 1}}>

        {/* Header */}
        <View style={{height: 75, alignItems: 'center', justifyContent: 'center'}}>
            <Text style={styles.title01}>
              {String(mm + '/' + dd + '/' + yyyy)}
            </Text>
        </View>

        {/* Main Content */}
        {timeRecords}

        <View style={{flex: 6, alignItems: 'center', justifyContent: 'center'}}>
          <View style={{marginTop: 25}}>
            <Button color={colors.color03} title="Add row" onPress={this.navigateToRecordDetail.bind(this, null)}/>
          </View>
        </View>

        <Button color={colors.color03} title="Delete all record" onPress={() => {this.props.purge()}}/>

      </View>
    );
  }
}

import { connect } from 'react-redux';
import {addRecord, purgeRecords, removeRecord, setRecord} from '../actions/record';

const mapStateToProps = state => {
  return {
    records: state.records.records
  }
};

const mapDispatchToProps = dispatch => {
  return {
    add: () => {
      dispatch(addRecord())
    },
    remove: (key) => {
      dispatch(removeRecord(key))
    },
    purge: () => {
      dispatch(purgeRecords())
    },
    set: (key) => {
      dispatch(setRecord(key))
    }
  }
};

export default connect(mapStateToProps, mapDispatchToProps)(HomeScreen);
