export const timeToMinutes = (value) => {
  const [hours, minutes] = String(value || "").split(":").map(Number);
  return Number.isInteger(hours) && Number.isInteger(minutes)
    ? hours * 60 + minutes
    : null;
};

export const minutesToTime = (minutes) =>
  `${String(Math.floor(minutes / 60)).padStart(2, "0")}:${String(minutes % 60).padStart(2, "0")}:00`;

export const dateAtTime = (date, time) => {
  const [hours, minutes] = String(time || "").split(":").map(Number);
  const result = new Date(date);
  result.setHours(hours, minutes, 0, 0);
  return result;
};

export const getUsualDayRanges = (date, businessHours) =>
  businessHours
    .filter((range) => range.daysOfWeek.includes(date.getDay()))
    .map((range) => ({
      start: dateAtTime(date, range.startTime),
      end: dateAtTime(date, range.endTime),
    }));

export const getExtendedDayRange = (date, businessHours, marginMinutes = 60) => {
  const ranges = getUsualDayRanges(date, businessHours);
  if (!ranges.length) return null;

  return {
    start: new Date(Math.min(...ranges.map((range) => range.start.getTime())) - marginMinutes * 60_000),
    end: new Date(Math.max(...ranges.map((range) => range.end.getTime())) + marginMinutes * 60_000),
  };
};

export const appointmentFitsUsualHours = (start, durationMinutes, businessHours) => {
  const end = new Date(start.getTime() + Number(durationMinutes) * 60_000);
  return getUsualDayRanges(start, businessHours).some(
    (range) => start >= range.start && end <= range.end,
  );
};

export const appointmentFitsExtendedHours = (start, durationMinutes, businessHours) => {
  const range = getExtendedDayRange(start, businessHours);
  if (!range) return false;
  const end = new Date(start.getTime() + Number(durationMinutes) * 60_000);
  return start >= range.start && end <= range.end;
};
