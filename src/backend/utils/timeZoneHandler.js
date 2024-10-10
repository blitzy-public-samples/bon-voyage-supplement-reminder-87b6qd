const moment = require('moment-timezone');

/**
 * Converts a local time to UTC
 * @param {string} localTime - The local time in HH:mm format
 * @param {string} timeZone - The time zone of the local time
 * @returns {Date} UTC date object
 * @throws {Error} If the input format is invalid or the time zone is not recognized
 */
function convertToUTC(localTime, timeZone) {
    if (!localTime || !timeZone) {
        throw new Error('Local time and time zone are required');
    }

    if (!/^\d{2}:\d{2}$/.test(localTime)) {
        throw new Error('Invalid local time format. Use HH:mm');
    }

    if (!moment.tz.zone(timeZone)) {
        throw new Error('Invalid or unrecognized time zone');
    }

    const [hours, minutes] = localTime.split(':');
    const utcDate = moment.tz(`${moment().format('YYYY-MM-DD')} ${hours}:${minutes}`, timeZone).utc();
    
    return utcDate.toDate();
}

/**
 * Converts a UTC time to a specified time zone
 * @param {Date} utcTime - The UTC time as a Date object
 * @param {string} timeZone - The target time zone
 * @returns {string} Formatted local time string in HH:mm format
 * @throws {Error} If the input is invalid or the time zone is not recognized
 */
function convertFromUTC(utcTime, timeZone) {
    if (!(utcTime instanceof Date) || !timeZone) {
        throw new Error('Valid UTC time (as Date object) and time zone are required');
    }

    if (!moment.tz.zone(timeZone)) {
        throw new Error('Invalid or unrecognized time zone');
    }

    const localTime = moment(utcTime).tz(timeZone);
    return localTime.format('HH:mm');
}

/**
 * Calculates the next reminder time based on the user's preferred time and current time
 * @param {string} preferredTime - The user's preferred reminder time in HH:mm format
 * @param {string} timeZone - The user's time zone
 * @returns {Date} Next reminder time in UTC
 * @throws {Error} If the input format is invalid or the time zone is not recognized
 */
function calculateNextReminderTime(preferredTime, timeZone) {
    if (!preferredTime || !timeZone) {
        throw new Error('Preferred time and time zone are required');
    }

    if (!/^\d{2}:\d{2}$/.test(preferredTime)) {
        throw new Error('Invalid preferred time format. Use HH:mm');
    }

    if (!moment.tz.zone(timeZone)) {
        throw new Error('Invalid or unrecognized time zone');
    }

    const [prefHours, prefMinutes] = preferredTime.split(':');
    const now = moment().tz(timeZone);
    
    let nextReminder = moment.tz(timeZone);
    nextReminder.hours(parseInt(prefHours, 10));
    nextReminder.minutes(parseInt(prefMinutes, 10));
    nextReminder.seconds(0);
    nextReminder.milliseconds(0);
    
    if (nextReminder.isSameOrBefore(now)) {
        nextReminder.add(1, 'day');
    }
    
    return nextReminder.utc().toDate();
}

/**
 * Checks if a given time zone is valid
 * @param {string} timeZone - The time zone to validate
 * @returns {boolean} True if the time zone is valid, false otherwise
 */
function isValidTimeZone(timeZone) {
    return moment.tz.zone(timeZone) !== null;
}

module.exports = {
    convertToUTC,
    convertFromUTC,
    calculateNextReminderTime,
    isValidTimeZone
};