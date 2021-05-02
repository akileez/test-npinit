// internal code not yet relased (anything referencing ../lib/..)
// tasks -- adopted from https://github.com/ricardobeat/taks
// log -- internal -- just custom wrappers for console, process.stdout/stderr
// read -- part of taks
const { task, log, read } = require('../../lib/cli/tasks')

// node stuff
const {promisify} = require('util')
const exec = promisify(require('child_process').exec)
const {execSync} = require('child_process')
const $HOME = require('os').homedir

const opts = {
  meta: {
    license: '',
    version: '',
    author: '',
    email: '',
    name: '',
    url: '',
  }
}

const meta = task.process('meta',
  async () => {
    // user information & optional overrides
  try {
    nconf.load({}, function (err, config) {
      opts.meta.license = opts.meta.license || config.get('init.license') || 'ISC'
      opts.meta.version = opts.meta.version || config.get('init.version') || '0.1.0'
      opts.meta.author  = opts.meta.author || config.get('init.author.name') || 'Your Name'
      opts.meta.email   = opts.meta.email || config.get('init.author.email') || 'your@email.com'
      opts.meta.name    = opts.meta.name || config.get('init.author.github') || 'githubName'
      opts.meta.url     = opts.meta.url || config.get('init.author.url')
        || 'https://github.com/' + opts.meta.name + '/' + opts.meta.packageName
    })
  } catch (err) {
    log.fail(err)
  }
})

task('nconf', async () => {
  // only here for reference. this is the old code
  // working on retrieval below.
  await meta()
})

// testing the retrieval of data within .npmrc
// none of this is particularly performant but its working
task('meta', async () => {
  const tstfile = $HOME+`/.npmrc`
  log.debug($HOME)
  log.debug(tstfile) // this aint gonna work on Windows!!!

  // const cmd = await exec(`cat ${tstfile}`)
  // log(cmd.stdout)


  // what if I read in this file? same result... good.
  // const file = await read(tstfile)
  // log(file)
  //

  // using npm config list with json output. Much better
  const conf = 'npm config list --json'

  const conf_name = 'npm config get init.author.name'
  const conf_email = 'npm config get init.author.email'
  const conf_github = 'npm config get init.author.github'
  const conf_vers = 'npm config get init.version'

  // testing to see if this is any faster...nope.
  // try {
  //   const tst = await exec(conf_name)
  //   const tst1 = await exec(conf_github)
  //   log((tst.stdout).toString().replace(/(\n)/, ''))
  //   log((tst1.stdout).toString().replace(/(\n)/, ''))
  // } catch (error) {
  //   log.fail(error)
  // }

  // reminder: test use with execSync as well
  // const ecmd = await exec(cmd)
  const econf = await exec(conf)

  // exec
  // const econf_name = await exec(conf_name)
  // const econf_email = await exec(conf_email)
  // const econf_github = await exec(conf_github)
  // const econf_vers = await exec(conf_vers)
  // // log.log(ecmd.stdout)

  // log((econf_name.stdout).toString().replace(/(\n)/, ''))
  // log((econf_email.stdout).toString().replace(/(\n)/, ''))
  // log((econf_github.stdout).toString().replace(/(\n)/, ''))
  // log((econf_vers.stdout).toString().replace(/(\n)/, ''))

  // execSync
  // const econf_name = execSync(conf_name)
  // const econf_email = execSync(conf_email)
  // const econf_github = execSync(conf_github)
  // const econf_vers = execSync(conf_vers)

  // log(econf_name.toString().replace(/(\n)/, ''))
  // log(econf_github.toString().replace(/(\n)/, ''))


  // Much faster by a factor of ~3.5 (total time ~255ms)
  // than using individual exec commands above (~955ms)
  // must account for four(4) promises resolving verus one (1)
  const eee = JSON.parse((econf.stdout).toString())
  const fff = eee['init.author.name']
  // const ggg = eee['init.author.email']
  const hhh = eee['init.author.github']
  const iii = eee['init.version']
  log(fff)
  log(hhh)
  log(iii)

})

// task.run(process.argv[2])