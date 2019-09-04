import moment from 'moment';

export const getFormattedHoursAndMinutes = (time) => moment(time).format('HH:mm');

export const getFormattedDate = (dateTime) => moment(dateTime).format('DD/MM/YYYY');

export const getTimeInterval = (startTime, endTime, breakDuration = 0) => {
  const start = moment.utc(startTime, 'HH:mm');
  const end = moment.utc(endTime, 'HH:mm');
  let diff = moment.duration(end.diff(start));
  diff = diff.subtract(breakDuration, 'minutes');

  return moment.utc(+diff);
};

export const getFormattedTimeInterval = (startTime, endTime, breakDuration = 0) => {
  const diff = getTimeInterval(startTime, endTime, breakDuration);
  return diff.format('HH:mm');
};

export const addTime = (dateTime, value, key) => moment(dateTime, 'HH:mm').add(value, key);
export const subtractTime = (dateTime, value, key) => moment(dateTime, 'HH:mm').subtract(value, key);

export const subtractDays = (date, value = 1) => moment(date, 'DD/MM/YYYY').subtract(value, 'day');
export const addDays = (date, value = 1) => moment(date, 'DD/MM/YYYY').add(value, 'day');

export const pad = (num) => {
  return num.toString().padStart(2,'0');
};

export const formatTime = (seconds) => {
  return [pad(Math.floor(seconds/60)%60),
    pad(seconds%60),
  ].join(":");
};

export const timeStringToSec = (timeString) => {
  let parts = timeString.split(":");
  return (parts[0] * 60) + (+parts[1]);
};