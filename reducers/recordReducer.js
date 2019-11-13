import {
  ADD_RECORD, GET_RECORD,
  PURGE_RECORDS,
  REMOVE_RECORD, SET_RECORD,
  UPDATE_RECORD,
  SET_DATE,
  SYNC_DATA,
  UPDATE_USER
} from '../actions/types';

import moment from 'moment';
import { getFormattedDate, getFormattedHoursAndMinutes, sortDates } from "../util/time";
import v4 from 'uuid/v4';

let initialStartTime = moment().round(15, 'minutes');
let initialEndTime = moment(initialStartTime).add(15, 'minutes');

const initialState = {
  user: {
    code: '',
    shortBreaks: [
        '09:00',
        '15:00'
    ],
    longBreaks: [
        '12:00'
    ],
    storeEmail: 'dagfiche@fore.be',
    emailSubject: 'scan be0414308180'
  },
  currentDate: getFormattedDate(new Date()),
  record: {
    key: null,
    orderNumber: '',
    date: getFormattedDate(new Date()),
    startTime: getFormattedHoursAndMinutes(initialStartTime),
    endTime: getFormattedHoursAndMinutes(initialEndTime),
    breakDuration: 0,
    description: '',
    isSynced: false
  },
  records: []
};

export default function recordReducer(state = initialState, action) {

  switch(action.type) {

    case ADD_RECORD:
      return {
        ...state,
        records: sortDates(state.records.concat(Object.assign({}, action.payload, {key: v4(), date: state.currentDate})))
      };

    case REMOVE_RECORD:
      return {
        ...state,
        records: state.records.filter(record => record.key !== action.key)
      };

    case UPDATE_RECORD:
      return {
        ...state,
        records: sortDates(state.records.map(record => {

          if (record.key === action.key) {
            return Object.assign({}, action.payload, {isSynced: false});
          }

          return {
            ...record
          };
        }))
      };

    case GET_RECORD:
      return {
        ...state,
        record: state.records.find(record => {

          if (record.key === action.key) {
            return {
              ...record
            };
          }
        })
      };

    case SET_RECORD:
      let record = initialState.record;

      if (action.key) {
         record = state.records.find(record => {

          if (record.key === action.key) {
            return {
              ...record
            };
          }
        });
      }

      return {
        ...state,
        record: record
      };

    case PURGE_RECORDS:
      return {
        ...state,
        records: initialState.records
      };

    case SET_DATE:
      return {
        ...state,
        currentDate: action.date
      };

    case SYNC_DATA:

      state.records.forEach(record => {
        if (record.date === state.currentDate) {
          record.isSynced = true;
        }
      });

      return {
        ...state
      };

    case UPDATE_USER:
      return {
        ...state,
        user: Object.assign({}, state.user, action.payload.user)
      };

    default:
      return state;
  }
};