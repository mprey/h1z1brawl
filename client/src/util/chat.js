export function getCommandProperties(array) {
  var command = {};
  var reading = false,
      readArray = [],
      identifier = '';
  for (var i = 1; i < array.length; i++) {
    var current = array[i];
    if (current.indexOf(":") !== -1 && !reading) { //start reading
      logData(current);
    } else if (reading && current.indexOf(":") === -1) { //continue reading
      readArray.push(current);
    } else if (reading && current.indexOf(":") !== -1){ //onto next object
      reading = false;
      identifier = '';
      readArray = [];
      logData(current);
    }
  }
  function logData(current) {
    reading = true;
    var parts = current.split(":");
    identifier = parts[0];
    readArray.push(parts[1]);
    command[identifier] = readArray;
  }
  return command;
}

export function futureDateFromText(text) {
  var parts = text.split(',');
  var months = 0,
      days = 0,
      hours = 0,
      minutes = 0,
      seconds = 0;
  for (var index in parts) {
    var partArray = parts[index].match(/(\d+|[^\d]+)/g);
    if (partArray.length == 2) {
      switch(partArray[1]) {
        case 'mt':
          months += parseInt(partArray[0]);
          break;
        case 'd':
          days += parseInt(partArray[0]);
          break;
        case 'h':
          hours += parseInt(partArray[0]);
          break;
        case 'm':
          minutes += parseInt(partArray[0]);
          break;
        case 's':
          seconds += parseInt(partArray[0]);
          break;
        default:
      }
    }
  }
  var date = new Date();
  date.setMonth(date.getMonth() + months);
  date.setDate(date.getDate() + days);
  date.setHours(date.getHours() + hours);
  date.setMinutes(date.getMinutes() + minutes);
  date.setSeconds(date.getSeconds() + seconds);
  return date;
}
