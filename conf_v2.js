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
const {task, log, read, write} = require('../../lib/cli/tasks')
// just like Object.assign()
const extend = require('../../lib/object/extend')
// expand -- a very minor version of https://github.com/jonschlinkert/expand
const expand = require('../../lib/string/expand')
// https://github.com/overlookmotel/promise-methods
const {forEach, parallel} = require('../../lib/async/each')
// eliminate -- adopted from https://github.com/terkelg/eliminate
const {eliminate} = require('../../lib/file/eliminate')

// node stuff
const {join} = require('path')
const {mkdir} = require('fs')
const {promisify} = require('util')
const mkdirp = promisify(mkdir)
// using execFile here
const execFile = promisify(require('child_process').execFile)

// new code added to tasks. memo -- a miniture cache, args -- argh passthru
// all in effort to facilitate this project.
const conf = task.memo()
// const args = task.memo()
const argv = task.args

// call version and help early; removed function calls
if (argv.v || argv.version) {
  // simluation due to testing
  const appvers = '0.0.1'
  log.log('npinit version, %s', appvers)
  log.log('npinit version, %s', require('./package.json').version)
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

// check what the conf looks like
// log.log(conf.values())
// check to see if i can get individual values
// log('what is the setting for conf.git', conf.get('git'))
// check a alternative way. cannot access deeply nested objects!
// log('has files', conf.has('files'))
// log.log(conf.get('files'))

task('init', async () => {
  // the goal of init is to populate configuration options
  // with command line options and process logic

  // testing reading a user config
  // argv.config should be the path of the config file
  // e.g. node conf_v2.js init --config ./.npinit.js
  if (argv.config) {
    log.log(argv.config)
    // need to sanitize this
    const file = require(argv.config)
    // log.log(file)
    // to a more suitable format
    let umeta = file.meta
    let ufile = file.files
    let udefs = file.defs
    // user defined settings
    conf.set('install', udefs.install)
    conf.set('devpackages', udefs.devpackages)
    conf.set('packages', udefs.packages)
    conf.set('git', udefs.git)
    conf.set('verbose', udefs.verbose)
    conf.set('dryrun', udefs.dryrun)
    conf.set('meta', extend(meta, umeta))
    conf.set('files', extend(files, ufile))
    log.log(conf.values())
    // exit out of init to eventually continue on...
    return
  }

  // init a cache to handle command line args
  const options = task.memo()
  // populate the cache with args
  options.set('verbose',     argv.verbose || false)
  options.set('git',         argv.g       || argv.git     || false)
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

  // Global options
  conf.set('git', options.has('git'))
  if (options.has('verbose')) conf.set('verbose', true)
  if (options.has('dry')) conf.set('dryrun', true)
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

  // moved lower to NOT slow down this process any further than necessary
  const npmconfig = 'npm config list --json'
  const econf = await task.exec(npmconfig)
  const data = JSON.parse((econf.stdout).toString())

  // Global Meta options
  // work around in action...
  conf.set('meta', extend(meta, {packageName: projName()}))
  conf.set('meta', extend(meta, {
    license:  options.get('license')    || data['init.license']       || 'ISC',
    version:  options.get('pkgversion') || data['init.version']       || '0.1.0',
    author:   options.get('author')     || data['init.author.name']   || 'Your Name',
    email:    options.get('email')      || data['init.author.email']  || 'your@email.com',
    name:     options.get('name')       || data['init.author.github'] || 'githubName',
    // need to fix this url
    url:     options.get('url')         || data['init.author.url']    || 'https://github.com/' //+ opts.meta.name + '/' + opts.meta.packageName,
  }))
  if (options.has('description'))
    conf.set('meta', extend(meta, {description: options.get('description')}))

  // Global Meta and File options
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
      eslintrc: true,
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
      eslintrc: true,
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

  log.log(conf.values())
})

// Additions below added for testing flow control of the app
// Need to confim if project directory is created and files
// moved to that location after init is run (also for a user config)

// process createDir in index.js
task('createDir', async () => {
  const pkgName = conf.get('meta').packageName
  const dest = __dirname + '/' + pkgName
  log.debug(pkgName)
  try {
    await mkdirp(dest, {recursive: true})

  } catch (err) {
    // do something with error
    log.fail(err)
  }
  // log.debug(__dirname)
  process.chdir(dest)
  log.debug(process.cwd())
})

// simulate tmpls.js
task('template', async () => {
  const pkgName = conf.get('meta').packageName
  const license = conf.get('meta').license
  const tmpl = conf.get('files')
  const dest = __dirname + '/' + pkgName
  const src = 'lib/templates/'
  let files = []
  let lic

  Object.keys(tmpl).forEach((file) => {
    if (tmpl[file]) {
      if (isOr(file, 'gitignore', 'eslintrc')) return files.push('.'+file)
      if (isOr(file, 'index', 'test')) return files.push(file+'.js')
      if (file === 'package') return files.push(file+'.json')
      if (file === 'readme') return files.push(file.toUpperCase()+'.md')
      if (file === 'travis') return files.push('.'+file+'.yml')
    }
  })
  // fix display
  log('Templates')
  log.debug(files)
  log.debug(process.cwd())

  // clean this up...old code but now working
  await forEach(files, async (file) => {
    const filePath = dest + '/' + file

    await processFile(filePath, src, file)
  }).then(async () => {
    if (license && license !== true) lic = license.toLowerCase()
    else lic = 'no'

    await processFile(`${dest}/LICENSE`, 'lib/license/', lic)
  })

  // clean this code. no error checking yet.
  async function processFile (filePath, srcdir, file) {
    const res = await read(join(__dirname, srcdir + file))
    // log(res)
    const tmpl = await expand(res, conf.get('meta'))
    // log.dir(tmpl)
    await write(filePath, tmpl).then(() => {
      if (srcdir === 'lib/license/') file = file.toUpperCase() + ' LICENSE'
      log('create:', file, 'white')
    })
  }
})

// simulate install.js
task('install', async () => {
  const install = conf.get('install')
  const devpackages = conf.get('devpackages')
  const packages = conf.get('packages')

  if (!install) {
    log.warn('Install not enabled, skipping')
    return
  }

  log('Dependencies:')
  log.debug(process.cwd())

  const commands = [
    async () => await installDependencies('--save-dev', devpackages),
    async () => await installDependencies('--save', packages)
  ]

  await parallel(commands)

  async function installDependencies (cmd, bundles) {
    if (isEmpty(bundles)) return

    await forEach(bundles, async (module) => {
      const output = await execFile('npm', ['install', cmd, module])
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
})

task('build', async () => {
  task.series(['init', 'createDir', 'template', 'install'])
})

task('clean', async () => {
  // await eliminate('./myStuff')
  await eliminate('./test-project')
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

function isOr(value) {
  const sliced = (a, b, c) => Array.prototype.slice.call(a, b, c)
  const args = sliced(arguments, 1, arguments.length)
  return args.some(function (val) {
    return (value === val)
  })
}

task.run(process.argv[2])