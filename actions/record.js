import {
  ADD_RECORD,
  REMOVE_RECORD,
  UPDATE_RECORD,
  GET_RECORD,
  SET_RECORD,
  PURGE_RECORDS
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

export const updateRecord = payload => {
  return {
    type: UPDATE_RECORD,
    key: payload.key,
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

export const purgeRecords = () => {
  return {
    type: PURGE_RECORDS
  }
};