import dayjs from 'dayjs';

const formatConferenceTime = ({ startTime, duration }) => {
  if (!startTime) {
    return 'Timeless';
  }

  const startTimeStr = dayjs(startTime).format(
    (() => {
      if (dayjs(startTime).isSame(dayjs(), 'day')) {
        return 'HH:mm';
      }
      if (dayjs(startTime).isSame(dayjs(), 'year')) {
        return 'MM-DD HH:mm';
      }
      return 'YYYY-MM-DD HH:mm';
    })()
  );
  if (!duration) {
    return `Starting from ${startTimeStr}`;
  }
  const endTimeStr = dayjs(startTime).add(duration, 'minute').format('HH:mm');

  return `${startTimeStr} - ${endTimeStr}`;
};

export default formatConferenceTime;
