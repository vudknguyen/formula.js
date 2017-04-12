var error = require('./error');
var utils = require('./utils');

exports.MATCH = function(lookupValue, lookupArray, matchType) {
  if (!lookupValue && !lookupArray) {
    return error.na;
  }

  if (arguments.length === 2) {
    matchType = 1;
  }
  if (!(lookupArray instanceof Array)) {
    return error.na;
  }

  if (matchType !== -1 && matchType !== 0 && matchType !== 1) {
    return error.na;
  }
  var index;
  var indexValue;
  for (var idx = 0; idx < lookupArray.length; idx++) {
    if (matchType === 1) {
      if (lookupArray[idx] === lookupValue) {
        return idx + 1;
      } else if (lookupArray[idx] < lookupValue) {
        if (!indexValue) {
          index = idx + 1;
          indexValue = lookupArray[idx];
        } else if (lookupArray[idx] > indexValue) {
          index = idx + 1;
          indexValue = lookupArray[idx];
        }
      }
    } else if (matchType === 0) {
      if (typeof lookupValue === 'string') {
        lookupValue = lookupValue.replace(/\?/g, '.');
        if (lookupArray[idx].toLowerCase().match(lookupValue.toLowerCase())) {
          return idx + 1;
        }
      } else {
        if (lookupArray[idx] === lookupValue) {
          return idx + 1;
        }
      }
    } else if (matchType === -1) {
      if (lookupArray[idx] === lookupValue) {
        return idx + 1;
      } else if (lookupArray[idx] > lookupValue) {
        if (!indexValue) {
          index = idx + 1;
          indexValue = lookupArray[idx];
        } else if (lookupArray[idx] < indexValue) {
          index = idx + 1;
          indexValue = lookupArray[idx];
        }
      }
    }
  }

  return index ? index : error.na;
};

exports.VLOOKUP = function (needle, table, index, rangeLookup) {
  if (process && process.env && process.env.NODE_ENV === 'compile') {
    return 0;
  }

  if (!needle || !table || !index) {
    return error.na;
  }

  rangeLookup = rangeLookup || false;
  for (var i = 0; i < table.length; i++) {
    var row = table[i];
    if (!rangeLookup) {
      if (row[0] === needle) {
        return (index < (row.length + 1) ? row[index - 1] : error.ref);
      }
    } else {
      if (!isNaN(needle)) {
        needle = utils.parseNumber(needle);
        var startRange = utils.parseNumber(row[0]);
        var isLastIndex = i === (table.length - 1) ? true : false;
        if (isLastIndex) {
          return (index < (row.length + 1) ? row[index - 1] : error.ref);
        } else {
          var endRange = utils.parseNumber(table[i + 1][0]) - 1;
          if(needle < startRange) {
            return error.na;
          } else if (needle >= startRange && needle <= endRange) {
            return (index < (row.length + 1) ? row[index - 1] : error.ref);
          }
        }
      } else {
        if (row[0].toLowerCase().indexOf(needle.toLowerCase()) !== -1) {
          return (index < (row.length + 1) ? row[index - 1] : error.ref);
        }
      }
    }
  }
  return error.na;
};

exports.HLOOKUP = function (needle, table, index, rangeLookup) {
  if (process && process.env && process.env.NODE_ENV === 'compile') {
    return 0;
  }

  if (!needle || !table || !index) {
    return error.na;
  }

  rangeLookup = rangeLookup || false;

  var transposedTable = utils.transpose(table);

  for (var i = 0; i < transposedTable.length; i++) {
    var row = transposedTable[i];
    if ((!rangeLookup && row[0] === needle) ||
      ((row[0] === needle) ||
        (rangeLookup && typeof row[0] === "string" && row[0].toLowerCase().indexOf(needle.toLowerCase()) !== -1))) {
      return (index < (row.length + 1) ? row[index - 1] : error.ref);
    }
  }

  return error.na;
};
