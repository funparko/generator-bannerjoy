'use strict';
var path = require('path');
var helpers = require('yeoman-generator').test;
var assert = require('yeoman-assert');

describe('general', function () {
  before(function (done) {
    helpers.run(path.join(__dirname, '../app'))
      // .inDir(path.join(__dirname, 'tmp'))
      .inTmpDir()
      .withOptions({})
      .withPrompts({features: [], clickTag : 'http://example.org'})
      .withGenerators([
        [helpers.createDummyGenerator(), 'mocha:app']
      ])
      .on('end', done);
  });

  it('the generator can be required without throwing', function () {
    // not testing the actual run of generators yet
    require('../app');
  });

  it('creates expected files', function () {
    assert.file([
      'package.json',
      'gulpfile.js',
      '.gitignore',
      'src'
    ]);
  });
});