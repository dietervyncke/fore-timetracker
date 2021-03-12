import {
  ADD_RECORD,
  REMOVE_RECORD,
  UPDATE_RECORD,
  GET_RECORD,
  SET_RECORD,
  PURGE_RECORDS,
  SET_DATE,
  SYNC_TIME_LOGS, SYNC_ASSETS, UNSET_RECORD
} from './types';

export const addRecord = payload => {
  return {
    type: ADD_RECORD,
    payload: payload
  }
};

export const removeRecord = key => {
  return {
    type: REMOVE_RECORD,
    key: key
  }
};

export const updateRecord = (payload, dataType = 'timeLogs') => {
  return {
    type: UPDATE_RECORD,
    key: payload.key,
    dataType: dataType,
    payload: payload
  }
};

export const getRecord = key => {
  return {
    type: GET_RECORD,
    key: key
  }
};

export const setRecord = key => {
  return {
    type: SET_RECORD,
    key: key
  }
};

export const unsetRecord = () => {
  return {
    type: UNSET_RECORD
  }
};

export const purgeRecords = () => {
  return {
    type: PURGE_RECORDS
  }
};

export const setDate = (date) => {
  return {
    type: SET_DATE,
    date: date
  }
};

export const syncTimeLogs = () => {
  return {
    type: SYNC_TIME_LOGS
  }
};

export const syncAssets = () => {
  return {
    type: SYNC_ASSETS
  }
};