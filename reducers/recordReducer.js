import {
  ADD_RECORD, GET_RECORD,
  PURGE_RECORDS,
  REMOVE_RECORD, SET_RECORD,
  UPDATE_RECORD,
  SET_DATE, GET_RECORDS
} from '../actions/types';

import moment from 'moment';
import { getFormattedDate, getFormattedHoursAndMinutes } from "../util/time";
import v4 from 'uuid/v4';

let initialStartTime = moment().round(15, 'minutes');
let initialEndTime = moment(initialStartTime).add(15, 'minutes');

const initialState = {
  currentDate: getFormattedDate(new Date()),
  record: {
    key: null,
    orderNumber: '',
    date: getFormattedDate(new Date()),
    startTime: getFormattedHoursAndMinutes(initialStartTime),
    endTime: getFormattedHoursAndMinutes(initialEndTime),
    breakDuration: 0,
    description: ''
  },
  records: []
};

export default function recordReducer(state = initialState, action) {

  switch(action.type) {

    case ADD_RECORD:
      return {
        ...state,
        records: state.records.concat(Object.assign({}, action.payload, {key: v4(), date: state.currentDate}))
      };

    case REMOVE_RECORD:
      return {
        ...state,
        records: state.records.filter(record => record.key !== action.key)
      };

    case UPDATE_RECORD:
      return {
        ...state,
        records: state.records.map(record => {

          if (record.key === action.key) {
            return action.payload;
          }

          return {
            ...record
          };
        })
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

    case GET_RECORDS:
      return action.filter;

    default:
      return state;
  }
};