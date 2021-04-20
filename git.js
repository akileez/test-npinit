'use strict'

// scaffolding out npinit piece by piece

// internal code not yet relased.
// tasks -- adopted from https://github.com/ricardobeat/taks
// log -- internal -- just custom wrappers for console, process.stdout/stderr
const {task, log} = require('../../lib/cli/tasks')
// eliminate -- adopted from https://github.com/terkelg/eliminate
// exists -- internal --fs.access with promise wrapper
const { exists, eliminate } = require('../../lib/file/eliminate')

// node stuff
const {promisify} = require('util')
const exec = promisify(require('child_process').exec)


// init values in main program but simulated here
const isPublic = false
const conf = {
  verbose: true
}

// not sold on task.process api. wip
// just using here to organize code.
// most likely will not be in final version
const gitInit = task.process('gitInit',
  async (input, output, opts) => {
    // using arrays to concatenate the commands
    // could use sh.exec (internal code)
    const addGit = [
      'git add --all',
      'git commit -m "initial commit"'
    ]

    const initGit = conf.verbose
      ? ['git init']
      : ['git init --quiet']

    const cmd = initGit.concat(addGit).join(' && ')

    // switch to try/catch for error handling
    // and this is fugly!!! but this is how my code originates
    try {
      const doit = await exec(cmd, {cwd: process.cwd()})
      const gitExists = await exists('./.git')
      if (conf.verbose) log('git init, add and commit\n'+doit.stdout)
      else if (gitExists) {
        // forgot why I added these logs here. will figure out later
        // NOTE create a log.event type message for offshoot customization
        // e.g. log.event([prefix], [msg], [color], [options???])
        log('repo:', 'inited', 'yellow')
        log('repo:', 'templates added', 'yellow')
        log('repo:', 'initial commit', 'yellow')
      }
    } catch (err) {
      log.fail('git error! '+err)
      if (isPublic) process.exit(1)
    }

})

// testing git init process; working but output not clean
task('init', async () => {
  await gitInit('working', '???')
})
// remove .git directory
task('clean', async () => {
  await eliminate('./.git')
})

task.run(process.argv[2])