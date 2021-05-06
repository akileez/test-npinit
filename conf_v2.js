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

// call version and help early; removed function calls
if (argv.v || argv.version) {
  // simluation due to testing
  const appvers = '0.0.1'
  log.info('npinit version, %s', appvers)
  log.info('npinit version, %s', require('./package.json').version)
  process.exit(0)
}
// removed function call. wired in help task.
// Note: setting up help in this fashion means that 'help'
// does not appear in the task list. Will need to require
// it outside this conditional block for alternative.
if (argv.h || argv.help) {
  require('./usage.js')
  task.run('help')
  process.exit(0)
}

// // testing additional task.memo to ensure no data polution
// args.set('args', argv)
// args.set('keeda', 'bananas')
// log.log(args.values())

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
  packageName: '',
  type: 'private',
  // not using repo just yet.
  repo: 'none',
  remote: false,
  push: false,
  author: '',
  email: '',
  name: '',
  url: '',
  version: '',
  license: '',
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
// log('what is the setting for conf.git', conf.get('git'))
// check a alternative way. cannot access deeply nested objects!
// log('has files', conf.has('files'))
// log.log(conf.get('files'))

task('init', async () => {
  // the goal of init is to populate configuration options
  // with command line options and process logic

  // init a cache to handle command line args
  const options = task.memo()
  // populate the cache with args
  options.set('verbose',     argv.verbose || false)
  options.set('git',         argv.g       || argv.git     || false)
  // change push to noPush??? argv naturally have a 'push' method
  options.set('push',        argv.p       || argv.push    || false)
  options.set('dev',         argv.dev     || argv.D       || false)
  options.set('dep',         argv.dep     || argv.d       || false)
  options.set('dry',         argv.dry     || argv.dryRun  || false)
  options.set('help',        argv.help    || argv.h       || false)
  options.set('hub',         argv.hub     || false)
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
  // log('options has verbose?', options.has('verbose'))
  // initialize metadata settings
  if (options.has('verbose')) conf.set('verbose', true)
  if (options.has('dry')) conf.set('dryrun', true)
  if (options.has('description'))
    conf.set('meta', extend(meta, {description: options.get('description')}))

  // work around in action...
  conf.set('meta', extend(meta, {packageName: projName()}))
  conf.set('git', options.has('git'))

  // git repository configuration
  // check for private and public projects being created together
  const pub = options.has('push')
  const priv = options.has('git')
  log('pub?', pub, 'priv?', priv)

  // private repo -g --git
  if (!pub && priv) {
    conf.set('meta', extend(meta, {
      type: 'private',
      remote: options.has('hub') ? 'hubCreate' : 'addRemote',
      repo: 'git',
      push: false
    }))
    conf.set('files', extend(files, {
      gitignore: true,
      license: false,
      travis: false
    }))
  }
  // public repo -gp --git --push
  if ((pub && priv)) {
    conf.set('meta', extend(meta, {
      type: 'public',
      remote: options.has('hub') ? 'hubCreate' : 'addRemote',
      repo: 'git',
      push: true
    }))
    conf.set('files', extend(files, {
      gitignore: true,
      license: true,
      travis: true
    }))
  }
  // private project no repo no options
  if ((!pub && !priv)) {
    conf.set('meta', extend(meta, {
      type: 'private',
      remote: 'none',
      repo: 'none',
      push: false
    }))
    conf.set('files', extend(files, {
      gitignore: false,
      license: false,
      travis: false
    }))
  }

  // fourth case (pub && !priv) is eqivalent to the default settings

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

  // incorporate meta.js here to complete initial fill of configuration.
  const npmconfig = 'npm config list --json'
  // included child_process.exec in tasks
  const econf = await task.exec(npmconfig)
  const data = JSON.parse((econf.stdout).toString())

  // may need to reverse the order here. think this is correct.
  conf.set('meta', extend(meta, {
    license:  options.get('license')    || data['init.license']       || 'ISC',
    version:  options.get('pkgversion') || data['init.version']       || '0.1.0',
    author:   options.get('author')     || data['init.author.name']   || 'Your Name',
    email:    options.get('email')      || data['init.author.email']  || 'your@email.com',
    name:     options.get('name')       || data['init.author.github'] || 'githubName',
    // need to fix this url
    url:     options.get('url')         || data['init.author.url']    || 'https://github.com/' //+ opts.meta.name + '/' + opts.meta.packageName,
  }))

  log.log(conf.values())
})

function projName () {
  // renamed constants to tidy code up.
  // everything relevant
  const args = task.args.argv
  const undef = args === undefined
  // no commands -- future use
  const nocom = process.argv.length <= 2 && process.stdin.isTTY
  // valid name
  const vname = !undef && process.argv[3] === args[1]
  // no project name -- future use
  const nopro = (undef || !vname) && !(args.v || args.dry)
  // check for 'test'
  const ctest = vname && args[1] === 'test'
  // valid project name
  const vpnam = vname && !ctest && args[1] !== undefined

  if (ctest) return 'test-project-'
    + Math.floor(Math.random() * (1000 - 101) + 101)

  // default project name if invalid or none given
  return args[1] && vpnam
    ? slug(args[1].toString())
    : 'test-project'
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