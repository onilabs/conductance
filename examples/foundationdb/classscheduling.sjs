/*
This is the FoundationDB class scheduling example ported to Flux

See https://foundationdb.com/key-value-store/documentation/class-scheduling.html

Run like this:

  conductance classscheduling.sjs

*/

@ = require([
  'mho:std',
  {id: 'mho:flux/kv', name: 'kv'}
]);

//----------------------------------------------------------------------
// Initialization

/* Data model:

   ('attends', student, class) = ''
   ('class', class_name) = seats_left

*/

var db = @kv.LevelDB(require.url('./classscheduling-db') .. @url.toPath);

// XXX var scheduling = db .. @kv.directory('scheduling');
var scheduling = db;


var course = 'class';
var attends = 'attends';

function add_class(db, c) { db .. @kv.set([course, c], 100) }

// Generate 1620 classes like '9:00 chem for dummies'
var levels = ['intro', 'for dummies', 'remedial', '101',
              '201', '301', 'mastery', 'lab', 'seminar'];
var types = ['chem', 'bio', 'cs', 'geometry', 'calc',
             'alg', 'film', 'music', 'art', 'dance'];
var times = @integers(2,19) .. @map(h -> "#{h}:00");

var class_combos = @product(times, types, levels);
var class_names = class_combos .. @map(tup -> tup .. @join(' '));

function init(db) {
  db .. @kv.clearRange(@kv.RANGE_ALL);
  class_names .. @each { |class_name|
    db .. add_class(class_name);
  }
}

//----------------------------------------------------------------------
// Class Scheduling Functions

function available_classes(db) {
  return db .. @kv.query(@kv.ChildrenRange(course)) .. 
    @filter([k,v] -> v > 0) ..
    @map([k,v] -> k[1]);
}

function signup(db, s, c) {
  db .. @kv.withTransaction {
    |T|
    var rec = [attends, s, c];
    if (T .. @kv.get(rec) !== undefined) return; // already signed up
    
    var seats_left = T .. @kv.get([course, c]);
    if (!seats_left) throw "No remaining seats.";
    var classes = T .. @kv.query(@kv.ChildrenRange([attends, s]));
    if (classes .. @count() >= 5) throw "Too many classes";

    T .. @kv.set([course, c], seats_left -1);
    T .. @kv.set(rec, '');
  }
}

function drop(db, s, c) {
  db .. @kv.withTransaction {
    |T|
    var rec = [attends, s, c];
    if (T .. @kv.get(rec) === undefined) return; // not taking this class
    T .. @kv.set([course, c], T .. @kv.get([course, c]) + 1);
    T .. @kv.clear(rec);
  }
}

function switch_class(db, s, old_c, new_c) {
  db .. @kv.withTransaction {
    |T|
    T .. drop(s, old_c);
    T .. signup(s, new_c);
  }
}

//----------------------------------------------------------------------
// Testing

function randomElement(arr) {
  var i = Math.floor(Math.random()*(arr.length));
  return arr[i];
}

function indecisive_student(i, ops) {
  var studentID = "student#{i .. @padLeft(3,'0')}";
  var all_classes = class_names;
  var my_classes = [];

  @integers(1,ops) .. @each {
    |i|
    var class_count = my_classes.length;
    var moods = [];
    if (class_count) moods = moods.concat(['drop', 'switch']);
    if (class_count < 5) moods.push('add');
    var mood = randomElement(moods);

    try {
      if (!all_classes.length) all_classes = db .. available_classes;
      if (mood === 'add') {
        var c = randomElement(all_classes);
        console.log("#{studentID}: signup to #{c}");
        db .. signup(studentID, c);
        my_classes.push(c);
      }
      else if (mood === 'drop') {
        var c = randomElement(my_classes);
        console.log("#{studentID}: drop #{c}");
        db .. drop(studentID, c);
        my_classes .. @remove(c);
      }
      else if (mood === 'switch') {
        var old_c = randomElement(my_classes);
        var new_c = randomElement(all_classes);
        console.log("#{studentID}: switch from #{old_c} to #{new_c}");
        db .. switch_class(studentID, old_c, new_c);
        my_classes .. @remove(old_c);
        my_classes.push(new_c);
      }
    }
    catch (e) {
      console.log(studentID, e.toString(), "Need to recheck available classes");
      all_classes = [];
    }
  }
}

function run(students, ops_per_student) {
  @integers(1, students) .. @each.par {
    |s|
    indecisive_student(s, ops_per_student);
  }
  console.log("Ran #{students*ops_per_student} transactions");
}

function main() {
  db .. init;
  console.log('initialized');
  run(20, 20);
  console.log('final timetable:');
  console.log('----------------');
  db .. @kv.query(@kv.ChildrenRange([attends])) .. @groupBy([[,student]] -> student) .. @each {
    |[student,attending]|
    console.log("*** #{student} ***");
    attending .. @each {
      |[[,,course]]|
      console.log(" - #{course}");
    }
  }
}

main();
