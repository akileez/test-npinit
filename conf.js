/*
  This is a simulated bin/npinit file which will run on the command line.
  Constructed here to test command line arguments, the display of the
  configuration (displace json-colorz with console), and hopefully
  improve the logic of 6 year old code
*/

// internal code not yet relased. (anything referencing ../lib/..)
// tasks -- adopted from https://github.com/ricardobeat/taks
// log -- internal -- just custom wrappers for console, process.stdout/stderr
const {task, log} = require('../../lib/cli/tasks')
// argh -- https://github.com/3rd-Eden/argh -- using it for ages
const {argv} = require('../../lib/cli/argh')

// help system uploaded recently
// cannot require usage here. it will run automatically how it is configured.
// meGuesses that this will be the beginning of a plugin/middleware solution
// const usage = require('./usage')

// Change the position of the require for usage. This enables the usage/help `task`
// to appear in the task list on the command line.
require('./usage')

function projName () {
  if (chk4test) return 'test-' + Math.floor(Math.random() * (1000 - 101) + 101)
  else if (validProjName) return slug(argv.argv[0].toString())
  else return 'dry-run'
}

function vers () {
  // simluation due to testing
  const appvers = '0.0.1'
  log.info('npinit version, %s', appvers)
  // process.stdout.write(require('../package.json').version + '\n')
  process.exit(0)
}

// configure private git repository
function repo () {
  opts.git = true
  opts.meta.repo = 'init'
  opts.files.gitignore = true
}

function chkRemote () {
  // FIXME I can never get to here...no argv.remote in code.
  if (argv.remote) {
    opts.meta.remote = 'addRemote'
  } else if (argv.remote === false) {
    opts.meta.type = 'private'
    opts.meta.remote = false
    opts.meta.push = false
    opts.files.license = false
    opts.files.travis = false
  }
}

// configure user installed devDependencies
function devpackages () {
  opts.devpackages = makeArray(argv.dev)
  opts.files.test = true
  opts.install = true
}

// configure user installed dependencies
function packages () {
  opts.packages =  makeArray(argv.dep)
  opts.install = true
}

function makeArray (str) {
  return str
    .toLowerCase()
    .replace(/\,/g, '')
    .split(' ')
}

function slug (str) {
  return str
    .replace(/([A-Z])/g, '-$1')
    .replace(/[-_\s]+/g, '-')
    .replace(/^-/g, '')
    .toLowerCase()
}

const noCommands    = process.argv.length <= 2 && process.stdin.isTTY

const version       = argv.v || argv.version
const dryRun        = argv.d || argv.dry
const help          = argv.h || argv.help || false

const argvUNDEF     = argv.argv === undefined
const validName     = !argvUNDEF && process.argv[2] === argv.argv[0]

const noProjName    = (argvUNDEF || !validName) && !(version || dryRun)
const chk4help      = validName && argv.argv[0] === 'help' || help
const chk4test      = validName && argv.argv[0] === 'test'
const validProjName = validName && !chk4help && !chk4test

const opts = {
  install: false,
  devpackages: [],
  packages: [],
  git: false,
  verbose: false,
  dryrun: false,
  files: {
    gitignore: false,
    eslintrc: true,
    index: true,
    license: false,
    package: true,
    readme: true,
    test: false,
    travis: false
  },
  meta: {
    date: new Date().toLocaleString(),
    year: new Date().getFullYear().toString(),
    packageName: projName(),
    type: 'private',
    repo: 'none',
    remote: false,
    push: false,
    author: argv.author,
    email: argv.email,
    name: argv.user,
    url: argv.url,
    version: argv.pkgv,
    license: argv.license,
    description: 'An awesome module being created'
  }
}

// usage
// if (noCommands || noProjName || chk4help) {
log.debug('help? %s', help)
log.debug('argv undef? %s', argvUNDEF)
if (help) {
  // HUGE DISCOVERY 4 ME!! its always the little things in life.
  // usage
  // require('./usage') --> moved to above
  // NOTE by commentting out the run command (task.run('help')) in `usage.js`,
  // I am able to run it here as a part of this task. Awesome!!!
  // pluggin/middleware now exists for my coding endeavors.

  // NOTE must keep track of naming conventions though.
  task.run('help')
  process.exit(0)
}

// version
if (version) vers()


task('init', () => {
  // initialize metadata settings
  if (argv.verbose) opts.verbose = true
  if (dryRun) opts.dryrun = true

  // git repository configuration
  // check for private and public projects being created together
  const pub = (argv.g || argv.github)
  const priv = (argv.r || argv.repo)

  // public repo if option -g or -github
  if (!priv && pub && !chk4test) {
    opts.meta.type = 'public'
    opts.meta.remote = 'hubCreate'
    opts.meta.push = true
    opts.files.license = true
    opts.files.travis = true
    repo()
    chkRemote()
  } else if ((priv && pub) || priv) {
    repo()
  }

  // install dependencies configuration
  // check for user install dependencies
  if (argv.dev) devpackages()
  if (argv.dep) packages()

  // misc overrides
  // project description
  if (argv.desc || argv.description) {
    opts.meta.description = argv.desc || argv.description
  }

  // tags for package.json
  // if (argv.tags) opts.meta.tags = makeArray(argv.tags)
  // else opts.meta.tags = ''

  log.log(opts)
})

task.run(process.argv[2])