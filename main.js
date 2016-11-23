var fs = require("fs");
var CronJob = require('cron').CronJob;

// "@chorebot: create a new chore called kitchen due 0-7 times a week for @albert @michael @harald @logan"
console.log(process.argv);
var chorename = process.argv[8];
console.log(chorename);
var frequency = process.argv[10];
console.log(frequency);

var names = "";
for (i = 15; i < process.argv.length; i++){
   names += process.argv[i] + ", ";
}

console.log(chorename + ", " + frequency + ", " + names);

var job = new CronJob({
  cronTime: '00 00 23 * * 1-5',
  onTick: function() {
    fs.readFile('kitchen.txt', function(err, data){
      if (err) {
         return console.error(err);
      }
      str = data.toString();
      var array = str.split(", ");
      console.log(array);
    });
    /*
     * Runs every weekday (Monday through Friday)
     * at 11:30:00 AM. It does not run on Saturday
     * or Sunday.
     */
  },
  start: false,
  timeZone: 'America/New_York'
});
job.start();

// fs.writeFile('chore.txt', '@albert, @michael, @harald, @logan',  function(err) {
//    if (err) {
//       return console.error(err);
//    }
//
//    console.log("Data written successfully!");
//    console.log("Let's read newly written data");
//    fs.readFile('input.txt', function (err, data) {
//       if (err) {
//          return console.error(err);
//       }
//       str = data.toString();
//       console.log("Asynchronous read: " + str);
//       var array = str.split(", ");
//       console.log(array[0]);
//    });
// });
