/*
 * Copyright 2013 Palantir Technologies, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

"use strict";

module.exports = function(grunt) {

  var Linter = require("tslint");

  grunt.registerMultiTask("tslint", "A linter for TypeScript.", function() {
    var options = this.options({
      formatter: "prose",
      outputFile: null,
      appendToOutput: false
    });
    var done = this.async();
    var failed = 0;
    this.success = true;

    grunt.util.async.filter(this.filesSrc, function(filepath, callback){
      var success = true;
      if (!grunt.file.exists(filepath)) {
        grunt.log.warn('Source file "' + filepath + '" not found.');
      } else {
        var contents = grunt.file.read(filepath);
        var linter = new Linter(filepath, contents, options);

        var result = linter.lint();

        if(result.failureCount > 0) {
          var outputString = "";
          var outputFile = options.outputFile;

          failed += result.failureCount;

          if (outputFile != null) {
            outputString = grunt.file.read(outputFile);
          }
          result.output.split("\n").forEach(function(line) {
            if(line !== "") {
              if (outputFile != null) {
                outputString += line + "\n";
              } else {
                grunt.log.error(line);
              }
            }
          });
          if(outputFile != null) {
            grunt.file.write(outputFile, outputString);
          }
          this.success = false;
          success = false;
        }
      }
      // Using setTimout as process.nextTick() doesn't flush
      setTimeout(function() { callback(!success); }, 1);

    }.bind(this),
    function (results){
      if (!this.success) {
          grunt.log.error(failed + " " + grunt.util.pluralize(failed,"error/errors") + " in " +
                          this.filesSrc.length + " " + grunt.util.pluralize(this.filesSrc.length,"file/files"));
          done(false);
      } else {
          grunt.log.ok(this.filesSrc.length + " " + grunt.util.pluralize(this.filesSrc.length,"file/files") + " lint free.");
          done();
      }
    }.bind(this));

  })
};
