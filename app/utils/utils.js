import ms from "ms";

function getTimezoneOffsetString(offset) {
    // Ensure the offset is a number and within the range of -12 to 14
    if (typeof offset !== 'number' || offset < -12 || offset > 14) {
        throw new Error('Offset must be a number between -12 and 14');
    }

    // Calculate the absolute value of the hours and minutes
    const hours = Math.floor(Math.abs(offset));
    const minutes = Math.floor((Math.abs(offset) * 60) % 60);

    // Format the hours and minutes to always be two digits
    const formattedHours = String(hours).padStart(2, '0');
    const formattedMinutes = String(minutes).padStart(2, '0');

    // Determine the sign of the offset
    const sign = offset >= 0 ? '+' : '-';

    // Construct and return the timezone offset string
    return `${sign}${formattedHours}${formattedMinutes}`;
}

function buildADMSCommand(id, command) {
    let commandString = `C:${id}:`
    commandString += command.header.join(" ");
    if (command.body) {
        commandString += " " + Object.entries(command.body).map(v => `${v[0]}=${v[1]}`).join("\t")
    }
    return commandString;
}

function getDateAgo(timeString) {
    const milliseconds = ms(timeString);  // Convert time string to milliseconds
    if (milliseconds == undefined) throw new Error(`Invalid time string: ${timeString}`);
    const currentDate = new Date();       // Get the current date and time
    return new Date(currentDate.getTime() - milliseconds);  // Subtract the time
}

export {
    getTimezoneOffsetString,
    buildADMSCommand,
    getDateAgo,
}