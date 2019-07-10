import {
  ADD_RECORD, GET_RECORD,
  PURGE_RECORDS,
  REMOVE_RECORD, SET_RECORD,
  UPDATE_RECORD
} from '../actions/types';

import moment from 'moment';

let nextRecordId = 1;
let initialStartTime = moment().round(15, 'minutes');
let initialEndTime = moment(initialStartTime).add(15, 'minutes');

const initialState = {
  record: {
    key: null,
    orderNumber: '',
    startTime: initialStartTime,
    endTime: initialEndTime,
    breakDuration: 0,
    description: ''
  },
  records: []
};

const recordReducer = (state = initialState, action) => {

  switch(action.type) {
    case ADD_RECORD:
      return {
        ...state,
        records: state.records.concat(Object.assign({}, action.payload, {key: nextRecordId++}))
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

    default:
      return state;
  }
};

export default recordReducer;