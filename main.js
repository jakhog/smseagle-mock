var child_process = require('child_process');

var outputLines = function(stream, prefix) {
  stream.setEncoding('utf-8');
  var data = '';
  stream.on('data', function(chunk) {
    data += chunk;
    // Print out lines
    var nl;
    while ((nl = data.indexOf('\n')) >= 0) {
      console.log(prefix+data.substring(0,nl));
      data = data.substring(nl+1);
    }
  });
};

var outputStdOutErr = function(child, prefix) {
  outputLines(child.stdout,prefix+'OUT:');
  outputLines(child.stderr,prefix+'ERR:');
};

var exitWith = function(child) {
  child.on('error', function() { process.exit(1); });
  child.on('exit', function() { process.exit(1); });
};

/* --- Start mock web server --- */
console.log('Starting SMSeagle mock API...');
var srv = child_process.fork('./srv/main.js', [process.argv[2]], {
  silent: true
});
exitWith(srv);
outputStdOutErr(srv,'SRV');
process.stdin.pipe(srv.stdin);

/* --- Start FRP client --- */
console.log('Starting FRP client...');
var frp = child_process.spawn('./frpc',['-c',process.argv[3]]);
exitWith(frp);
outputStdOutErr(frp,'FRP');

process.on('SIGINT', function() { process.exit() });
process.on('SIGTERM', function() { process.exit() });

process.on('exit', function() {
  console.log('Exiting');
  srv.kill();
  frp.kill();
});
