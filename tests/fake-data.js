/**
 * FAKE DATA GENERATION
 * ----------------------------------------------------------------------
 * Generates fake data to use for testing an STV election. Data comes
 * in the form of an array of ballots, each of which are simply an array
 * of ids that correspond to candidates. In addition, a dictionary of
 * candidate names corresponding with the ids must be supplied.
 */

fs = require('fs');


exports.fakeData = function(n) {
  n = n || 100;
  var candidates = [{id : 21, name : 'Boots'},
		    {id : 42, name : 'Hannah'},
		    {id : 3, name : 'Mara'},
		    {id : 39, name : 'Sean'},
		    {id : 402, name : 'Big Chill'},
		    {id : 10, name : 'William Brigham Albert Jones III'}];

  var ballots = [];

  // Generate the list of ballots
  for (var i = 0; i < n; i++)
    ballots.push(generateBallot(candidates));

    return ballots;
};

function generateBallot(keys) {
    // Shuffle randomly
    ballot = shuffle(keys);
    // Randomly chop off some
    return ballot.slice(0, randomInt(2, keys.length));
}

function shuffle(array) {
    var curr_index = array.length,
        temp_value,
        rand_index;
    while(curr_index > 0) {
        rand_index = Math.floor(Math.random() * curr_index);
        curr_index -= 1;
        temp_value = array[curr_index];
        array[curr_index] = array[rand_index];
        array[rand_index] = temp_value;
    }
    return array;
}

function randomInt(bottom, top) {
  // Generates a random integer between bottom and top (inclusive.)
  if (top == undefined)
    top = bottom, bottom = 0;
  var width = top - bottom + 1;
  return Math.floor(Math.random() * width + bottom);
}

