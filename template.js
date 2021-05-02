/*

Test file for playing out the idea of an individual project file tasks
!! Not working with index.js

*/

// internal code not yet relased (anything referencing ../lib/..)
// tasks -- adopted from https://github.com/ricardobeat/taks
// log -- internal -- just custom wrappers for console, process.stdout/stderr
// colr -- internal ansi color
const {task, log, colr} =  require('../../lib/cli/tasks')
// adopted from https://github.com/shannonmoeller/ygor/tree/master/packages/file
const File = require('../../lib/file/file')
// adopted from https://github.com/overlookmotel/promise-methods
const {forEach, forOwn} = require('../../lib/async/each')
// eliminate -- adopted from https://github.com/terkelg/eliminate
const {eliminate} = require('../../lib/file/eliminate')
// https://github.com/folder/readdir
const readdir = require('../../lib/file/readdir-async2')

// give me yellow
const {yellow} = colr
// append time stamp to log output
log._showtime = true

// simulated data. this === this module
// if this is a cli-app, how would I re-create this data.
// if this is a plugin, we send data through the options argument.
// if this is a part of an integrated whole, we pass internal messages.
const meta = {
  date: new Date().toLocaleString(),
  year: new Date().getFullYear().toString(),
  packageName: 'testing123',
  type: 'private',
  repo: 'none',
  remote: false,
  push: false,
  author: 'Keith Williams',
  email: 'git@keeda.net',
  name: 'akileez',
  url: 'https://github.com/akileez/testing123',
  version: '0.0.1',
  license: 'mit-0',
  description: 'An awesome module being created'
}
// these will need to be read in at runtime, somehow
const destination = 'tmp'
// license directory could be re-located
const templatedir  = 'lib/templates'

// helper functions for File
async function writeFiles (fp) {
  const file = File({path: fp})
  await file.read()
  await file.expand(meta)
  await file.writer({dest: destination})
  log(`writing to ${yellow(destination)} <= ${file.basename}`)
}

async function fileWriter (fp, dest, ext, stem) {
  const file = File({path: fp})
  await file.read()
  await file.expand(meta)
  await file.router({dest: dest, ext: ext, stem: stem, put: true})
}

// test sending all files
task('tst1', async () => {
  const timer = task.time({msg: 'tst1 runtime:'}).start()
  // do all the files
  log('All files (runtime start)')
  let files = await readdir('lib/templates/', {base: './', dot: true})
  log.debug(files, files.length)
  await forEach(files, async(fp) => await writeFiles(fp))
  log(timer.end().duration())
})

// test sending selected files
task('tst2', async () => {
  // do some of the files (user config)
  const timer = task.time({msg: 'tst2 runtime:'}).start()
  // this will scaffold out a project structure based on a boolean value
  const dirs = {
    readme: true,
    index: true,
    test: false,
    package: true,
    data: false,
    eslintrc: true,
    gitignore: true,
    travis: true,
    changelog: true,
  }
  log('Individual files (runtime start)')

  await forOwn(dirs, async (val, key) => {
    val ? await task.run(key) : ''
    // log.debug(key, val)
  })

  // stupid message
  log('Hello World from tst!', 'yea, right!')
  // log time
  log(timer.end().duration())
})

// testing here. work in progress
const pkg = task.process('pkg', async (input, output, opts) => {
  await fileWriter(`${templatedir}/package.json`, output, opts.ext, opts.stem)
})
// Individual files by task
task('readme', async () => {
  await writeFiles(`${templatedir}/README.md`)
})

task('index', async () => {
  await writeFiles(`${templatedir}/index.js`)
})

task('test', async () => {
  await writeFiles(`${templatedir}/test.js`)
})

task('package', async () => {
  await writeFiles(`${templatedir}/package.json`)
})

task('eslintrc', async () => {
  await writeFiles(`${templatedir}/.eslintrc`)
})

task('gitignore', async () => {
  await writeFiles(`${templatedir}/.gitignore`)
})

task('changelog', async () => {
  await writeFiles(`${templatedir}/CHANGELOG.md`)
})

task('travis', async () => {
  await writeFiles(`${templatedir}/.travis.yml`)
})
// testing task.process structure.
task('data', async () => {
  await data('data', destination, {stem: 'data', ext: 'yml'})
})

const data = task.process('data', async (input, output, opts) => {
  await fileWriter(`${templatedir}/index.js`, output, opts.ext, opts.stem)
})

// clean up
task('clean', async () => {
  const dir = destination
  const opt = { base: './', dot: true}
  const files = await readdir(dir, opt)
  log.debug(files)

  await forEach(files, async (file) => {
    log('removing:', file)
    await eliminate(file)
  })
})

task.run(process.argv[2])