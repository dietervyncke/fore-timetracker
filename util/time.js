import moment from 'moment';

export const getFormattedRoundHoursAndMinutes = (time = moment()) => moment(time).round(15, 'minutes').format('HH:mm');

export const getFormattedHoursAndMinutes = (time = moment()) => moment(time).format('HH:mm');
export const getUtcHoursMinutes = (time) => moment.utc(time, 'HH:mm');
export const getFormattedDate = (dateTime) => moment(dateTime).format('YYYY/MM/DD');
export const getFormattedDisplayDate = (dateTime) => moment(new Date(dateTime)).format('dd DD/MM/YYYY');

export const getTimeInterval = (startTime, endTime, breakDuration = 0) => {
  const start = getUtcHoursMinutes(startTime);
  const end = getUtcHoursMinutes(endTime);

  let diff = moment.duration(end.diff(start));
  diff = diff.subtract(breakDuration, 'minutes');

  return moment.utc(+diff);
};

export const getFormattedTimeInterval = (startTime, endTime, breakDuration = 0) => {
  const diff = getTimeInterval(startTime, endTime, breakDuration);
  let validatedDiff = moment.max(moment.utc(0), diff);

  return validatedDiff.format('HH:mm');
};

export const addTime = (dateTime, value, key) => moment(dateTime, 'HH:mm').add(value, key);
export const subtractTime = (dateTime, value, key) => moment(dateTime, 'HH:mm').subtract(value, key);

export const subtractDays = (date, value = 1) => moment(date, 'YYYY/MM/DD').subtract(value, 'day');
export const addDays = (date, value = 1) => moment(date, 'YYYY/MM/DD').add(value, 'day');

export const pad = (num) => {
  return num.toString().padStart(2,'0');
};

export const formatTime = (minutes) => {
  return [pad(Math.floor(minutes/60)%60),
    pad(minutes%60),
  ].join(":");
};

export const timeStringToMinutes = (timeString) => {
  let parts = timeString.split(":");
  return (parts[0] * 60) + (+parts[1]);
};

export const sortDates = (dateRanges) => {

  return dateRanges.sort((previous, current) => {

    let firstStartTime = getUtcHoursMinutes(previous.startTime);
    let secondStartTime = getUtcHoursMinutes(current.startTime);

    if (firstStartTime.isBefore(secondStartTime)) {
      return -1;
    }

    if (secondStartTime.isBefore(firstStartTime)) {
      return 1;
    }

    return 0;
  });
};

export const checkTimeOverlap = (dateRanges) => {
  let sortedRanges = sortDates(dateRanges);

  return sortedRanges.reduce((result, current, id, arr) => {
    if (id === 0) {
      return result;
    }

    let previous = arr[id-1];

    let prevEnd = getUtcHoursMinutes(previous.endTime);
    let currentStart = getUtcHoursMinutes(current.startTime);

    let overlap = (prevEnd > currentStart);

    if (overlap) {
      result.overlap = overlap;
      result.ranges.push({
        previous: previous,
        current: current
      });
    }

    return result;

  }, {overlap: false, ranges: []});
};