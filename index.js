// require('../../lib/util/require-time')
// internal code not yet relased. (anything referencing ../lib/..)
// tasks -- adopted from https://github.com/ricardobeat/taks
// log -- internal -- just custom wrappers for console, process.stdout/stderr
const {task, log} = require('../../lib/cli/tasks')
// https://github.com/overlookmotel/promise-methods
const {forEach, series} = require('../../lib/async/each')
// node stuff
const {mkdir} = require('fs')
const {promisify} = require('util')
const mkdirp = promisify(mkdir)
// task processes
var meta    = require('./meta')
var tmpls   = require('./tmpls')
var git     = require('./git2')
var install = require('./install')

// need an opts object for configuration
// need to run conf.js as the "init" task if this app is an integrated whole
// need to compose this as a task.process or a general function to allow the passing
// of options data if this app is a cli-app.

// psuedo code!!!! Not Working. Just scaffolding out some ideas.
// testing out "task list" with task files required here within.
// running of tasks from required task files are executing fine. tasks within this module
// do not work at all! Not the effect I was going for, just playing with the idea.
const proc = task.process('process_operations', async (inp, out, opts) => {
  task.series(['getUserIndo', 'createDir', 'expandTmpls', 'npmInstall', 'initRepo'])
})

task('getUserInfo', async () => {
  // run meta
  await meta(opts)
  // display log
  log('something here')
  // check if dry run; if so display heading: "Options"
  // and display complete configuration

  // done
})

task('createDir', async () => {
  try {
    await mkdirp(opts.meta.packageName, {recursive: true})
    process.chdir(opts.meta.packageName)
  } catch (err) {
    // do something with error
  }
})

task('expandTmpls', async () => {
  // run tmpls and pass in opts somehow
  await tmpls(opts)
  // done
})

task('npmInstall', async () => {
  // run install and pass in opts somehow
  await install(opts)
  // done
})

task('initRepo', async () => {
  // run git and pass in opts somehow
  await git(opts)
  // done
})

task.run(process.argv[2])
// module.exports = proc
