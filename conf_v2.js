/*
  This is a simulated bin/npinit file which will run on the command line.
  Constructed here to test command line arguments, the display of the
  configuration (displace json-colorz with console), and hopefully
  improve the logic of 6 year old code

  This is a stand-alone copy. does not interact with any other code at
  the moment.

  conf_version_2.js
*/

// internal code not yet relased. (anything referencing ../lib/..)
// tasks -- adopted from https://github.com/ricardobeat/taks
// log -- internal -- just custom wrappers for console, process.stdout/stderr
const {task, log} = require('../lib/cli/tasks')
// just like Object.assign()
const extend = require('../lib/object/extend')
// new code added to tasks. memo -- a miniture cache, args -- argh passthru
// all in effort to facilitate this project.
const conf = task.memo()
const args = task.memo()
const argv = task.args

// Most options adjusted to deal with new code. Some older code still exists
// as I work thru ideas.
const dryRun        = argv.dry
const noCommands    = process.argv.length <= 2 && process.stdin.isTTY
const argvUNDEF     = argv.argv === undefined
const validName     = !argvUNDEF && process.argv[2] === argv.argv[0]
const noProjName    = (argvUNDEF || !validName) && !(argv.v || dryRun)
const chk4help      = validName && argv.argv[0] === 'help' || argv.h || argv.help
const chk4test      = validName && argv.argv[0] === 'test'
const validProjName = validName && !chk4help && !chk4test

// call version and help early
if (argv.v || argv.version) vers()
if (argv.h || argv.help) usage()

// testing additional task.memo to ensure no data polution
args.set('args', argv)
args.set('keeda', 'bananas')
log.log(args.values())

// playing around with a different style of setting up config options
// Also, using a different type of cache than I normally use.
// eyeball test...this will be slower but hey.

// work arounds due to the limited aspect of task.memo
// the set method is not dynamic. must extend updates to
// objects in order to update items in the conf cache.
// that is, for deeply nested objects.

// initial metadata (author and project) settings
const meta = {
  date: new Date().toLocaleString(),
  year: new Date().getFullYear().toString(),
  packageName: '', // projectName()
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
// initial settings for files delivered
const files = {
  gitignore: false,
  eslintrc: false,
  index: true,
  license: false,
  package: true,
  readme: true,
  test: true,
  travis: false
}

// setting the global configuration
conf.set('install', false)
conf.set('devpackages', [])
conf.set('packages', [])
conf.set('git', false)
conf.set('verbose', false)
conf.set('dryrun', false)
conf.set('files', files)
conf.set('meta', meta)

// check what the conf looks loke
// log.log(conf.values())
// check to see if i can get individual values
log('what is the setting for conf.git', conf.get('git'))
// check a alternative way. cannot access deeply nested objects!
log('has files', conf.has('files'))
log.log(conf.get('files'))

task('init', () => {
  // the goal of init is to populate configuration options
  // with command line options and process logic

  // init a cache to handle command line args
  const options = task.memo()
  // populate the cache with args
  options.set('verbose',     argv.verbose || false)
  options.set('git',         argv.g       || argv.git     || false)
  // change push to noPush??? argv naturally have a 'push' method
  options.set('push',        argv.p       || argv['push'] || false)
  options.set('dev',         argv.dev     || argv.D       || false)
  options.set('dep',         argv.dep     || argv.d       || false)
  options.set('dry',         argv.dry     || argv.dryRun  || false)
  options.set('help',        argv.help    || argv.h       || false)
  options.set('hub',         argv.hub     || false)
  options.set('remote',      argv.remote  || false)
  options.set('description', argv.desc    || false)
  options.set('email',       argv.email   || false)
  options.set('name',        argv.user    || false)
  options.set('url',         argv.url     || false)
  options.set('license',     argv.license || false)
  options.set('author',      argv.author  || false)
  options.set('pkgversion',  argv.pkgv    || false)
  options.set('appversion',  argv.v       || false)

  // const opts = conf.values()
  // log.log(options.values())
  log('options has verbose?', options.has('verbose'))
  // initialize metadata settings
  if (options.has('verbose')) conf.set('verbose', true)
  if (options.has('dry')) conf.set('dryrun', true)

  // work around in action...
  conf.set('meta', extend(meta, {packageName: projName()}))
  conf.set('git', options.has('git'))

  // git repository configuration
  // check for private and public projects being created together
  const pub = options.has('push')
  const priv = options.has('git')
  log('pub?', pub, 'priv?', priv)

  // private repo if option -g or -github
  if (!pub && priv && !chk4test) {
    conf.set('meta', extend(meta, {
      type: 'private',
      remote: 'addRemote',
      push: false
    }))
    conf.set('files', extend(files, {
      gitignore: true,
      license: false,
      travis: false
    }))
  } else if ((priv && pub) || priv) {
    conf.set('meta', extend(meta, {
      type: 'public',
      remote: 'addRemote',
      push: true
    }))
    conf.set('files', extend(files, {
      gitignore: true,
      license: true,
      travis: true
    }))
  }

  // REMINDER: No configuration for "hub"

  // install dependencies configuration
  // check for user install dependencies
  if (options.has('dev')) {
    conf.set('devpackages', makeArray(options.get('dev')))
    conf.set('install', true)
  }
  if (options.has('dep')) {
    conf.set('packages', makeArray(options.get('dep')))
    conf.set('install', true)
  }

  log.log(conf.values())
})

function projName () {
  // Fix this logic
  if (chk4test) return 'test-' + Math.floor(Math.random() * (1000 - 101) + 101)
  else if (validProjName) return slug(argv.argv[0].toString())
  else return 'dry-run'
}

function vers () {
  // simluation due to testing
  const appvers = '0.0.1'
  log.info('npinit version, %s', appvers)
  // not running yet. package.json file does not exist
  // within internally testing directory
  // log.info('npinit version, %s', require('./package.json').version)
  process.exit(0)
}

function usage () {
  log('HELP! not wired in yet.')
  process.exit(0)
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

task.run(process.argv[2])