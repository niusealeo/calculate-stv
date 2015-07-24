var fake_data = require('./fake-data').fakeData;
var calculate = require('../src/calculate');

var data = fake_data(100);

console.log(calculate(data, 3));
