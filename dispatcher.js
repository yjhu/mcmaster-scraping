var child_process = require('child_process');

var worker = child_process.exec('phantomjs --cookies-file=cookie.txt mcmaster-phantom2.js',
                function (error, stdout, stderr) {
                    var results = JSON.parse(stdout);
                    for (var key in results) {
                        var out_line = '';
                        for (var prop in results[key]) {
                            out_line += results[key][prop] + "\t";
                        }
                        console.log(out_line);
                    }
                    console.log('stderr: ' + stderr);
                    if (error !== null) {
                        console.log('exec error: ' + error);
                    }
                });