var assert = require('assert');
var path = require('path');
var helpers = require('yeoman-generator').test;
var exec = require('child_process').exec;
var donejsPackage = require('donejs/package.json');
var npmVersion = require('../lib/utils').npmVersion;

function pipe(child) {
  child.stdout.pipe(process.stdout);
  child.stderr.pipe(process.stderr);
}

describe('generator-donejs', function () {
  it('donejs:app', function (done) {
    var tmpDir;

    helpers.run(path.join(__dirname, '../app'))
      .inTmpDir(function (dir) {
        tmpDir = dir;
      })
      .withOptions({
        packages: donejsPackage.donejs,
        skipInstall: false
      })
      .withPrompts({
        name: 'place-my-tmp'
      })
      .on('end', function () {
        child = exec('npm test', {
          cwd: tmpDir
        });

        pipe(child);

        child.on('exit', function (status) {
          assert.equal(status, 0, 'Got correct exist status');
          done();
        });
      });
  });

  describe('NPM 3 support', function(){
    before(function(done){
      var test = this;
      npmVersion(function(err, version){
        if(err) return done(err);
        test.npmVersion = version;
        done();
      });
    });

    it('npmAlgorithm flag set if using NPM 3+', function(done){
      var major = this.npmVersion.major;
      var tmpDir;

      helpers.run(path.join(__dirname, '../app'))
        .inTmpDir(function (dir) {
          tmpDir = dir;
        })
        .withOptions({
          packages: donejsPackage.donejs,
          skipInstall: true
        })
        .withPrompts({
          name: 'place-my-npm'
        })
        .on('end', function () {
          var pkg = require(tmpDir + '/package.json');
          var npmAlgorithm = pkg.system.npmAlgorithm;

          if(major >= 3) {
            assert.equal(npmAlgorithm, 'flat', 'If the user is using npm 3 or greater then npmAlgorithm should be "flat"');
          } else {
            assert.equal(npmAlgorithm, undefined, 'If the user is using npm 2 or less then npmAlgorithm should not be set');
          }

          done();
        });
    });
  });
});
