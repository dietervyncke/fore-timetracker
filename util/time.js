import moment from 'moment';

export const getFormattedHoursMinutes = (time) => {
  return moment(time).format('HH:mm');
};

export const getTimeInterval = (startTime, endTime, breakDuration = 0) => {
  const start = moment.utc(startTime, 'HH:mm');
  const end = moment.utc(endTime, 'HH:mm');
  const diff = moment.duration(end.diff(start));

  diff.subtract(breakDuration, 'minutes');

  return moment.utc(+diff).format('HH:mm');
};