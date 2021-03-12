import {
  ADD_RECORD, GET_RECORD,
  PURGE_RECORDS,
  REMOVE_RECORD, SET_RECORD,
  UNSET_RECORD,
  UPDATE_RECORD,
  SET_DATE,
  SYNC_TIME_LOGS,
  SYNC_ASSETS,
  UPDATE_USER
} from '../actions/types';

import { getFormattedDate, getFormattedRoundHoursAndMinutes, sortDates } from "../util/time";
import v4 from 'uuid/v4';

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
    storeEmail: '',
    emailSubject: ''
  },
  currentDate: getFormattedDate(new Date()),
  record: {
    key: null,
    orderNumber: '',
    multiOrder: false,
    date: getFormattedDate(new Date()),
    startTime: getFormattedRoundHoursAndMinutes(),
    endTime: getFormattedRoundHoursAndMinutes(),
    breakDuration: 0,
    description: '',
    timeLogsSynced: false,
    assetsSynced: false,
    assets: []
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

          let syncedDataType = action.dataType+'Synced';

          if (record.key === action.key) {
            return Object.assign({}, action.payload, {[syncedDataType]: false});
          }

          return {
            ...record
          };
        }))
      };

    case GET_RECORD:

      let index = state.records.findIndex(r => r.key === action.key);

      return {
        ...state,
        record: {...state.records[index]}
      };

    case SET_RECORD:
      let record = initialState.record;

      if (action.key) {
        let index = state.records.findIndex(r => r.key === action.key);
        record = {...state.records[index]};
      }

      return {
        ...state,
        record: record
      };

    case UNSET_RECORD:

      return {
        ...state,
        record: null
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

    case SYNC_TIME_LOGS:

      state.records.forEach(record => {
        if (record.date === state.currentDate) {
          record.timeLogsSynced = true;
        }
      });

      return {
        ...state
      };

    case SYNC_ASSETS:

      state.records
          .filter(r => r.date === state.currentDate)
          .forEach(r => r.assetsSynced = true)
      ;

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