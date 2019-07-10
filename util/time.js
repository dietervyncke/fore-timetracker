import moment from 'moment';

export const getFormattedHoursMinutes = (time) => {
  return moment(time).format('HH:mm');
};

export const getTimeDiff = (startTime, endTime) => {
  let diffTime = moment(endTime).diff(moment(startTime));
  return moment.max(moment(diffTime), moment(0));
};

export const getFormattedTimeDiff = (milliseconds) => {
  const hours = Math.floor((milliseconds)/(60*60*1000));
  const minutes = Math.floor((milliseconds % (60*60*1000))/(60*1000));

  return String(hours).padStart(2, '0') + ':' + String(minutes).padStart(2, '0');
};

export const calculateTimeDiff = (startTime, endTime) => {
  return getFormattedTimeDiff(getTimeDiff(startTime, endTime));
};