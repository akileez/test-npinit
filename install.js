// internal code not yet relased. (anything referencing ../lib/..)
// tasks -- adopted from https://github.com/ricardobeat/taks
// log -- internal -- just custom wrappers for console, process.stdout/stderr
const {task, log} = require('../../lib/cli/tasks')
// https://github.com/overlookmotel/promise-methods
const {forEach, parallel} = require('../../lib/async/each')
// eliminate -- adopted from https://github.com/terkelg/eliminate
const {eliminate} = require('../../lib/file/eliminate')
// argh -- https://github.com/3rd-Eden/argh -- using it for ages
const {argv} = require('../../lib/cli/argh')
// node stuff
const {promisify} = require('util')
// using execFile here
const exec = promisify(require('child_process').execFile)

// simulated options configuration for testing
const opts = {
  install: true,
  verbose: true,
  packages: ['colorz', 'json-colorz', 'npinit'],
  devpackages: ['akileez/toolz']
}

async function installDependencies (cmd, packages) {
  if (isEmpty(packages)) return

  await forEach(packages, async (module) => {
    const output = await exec('npm', ['install', cmd, module])
    if (argv.verbose) {
      if (output.stderr) log.warn(`module: ${module}\n`+ output.stderr)
      if (output.stdout) log.info('installed module: %s %s', module, output.stdout)
    } else {
      log('module:', output.stderr ? module + ' (err)' : module, 'red')
    }
  })
}

function isEmpty (arr) {
  return !arr.length
}

// init task
task('init', async () => {
  if (!opts.install) {
    log.warn('Install not enabled, skipping')
    return
  }

  log('Dependencies:')

  const commands = [
    async () => await installDependencies('--save-dev', opts.devpackages),
    async () => await installDependencies('--save', opts.packages)
  ]

  await parallel(commands)
})

// clean up
task('clean', async () => {
  await eliminate('node_modules')
  await eliminate('package-lock.json')
  // await eliminate('package.json')
})

task.run(process.argv[2])
