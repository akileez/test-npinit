/*

Test file for playing out the idea of an individual license task

*/

// internal code not yet relased (anything referencing ../lib/..)
// tasks -- adopted from https://github.com/ricardobeat/taks
// log -- internal -- just custom wrappers for console, process.stdout/stderr
const {task, log} =  require('../../lib/cli/tasks')
// adopted from https://github.com/shannonmoeller/ygor/tree/master/packages/file
const File = require('../../lib/file/file')
// adopted from https://github.com/overlookmotel/promise-methods
const {forEach} = require('../../lib/async/each')
// eliminate -- adopted from https://github.com/terkelg/eliminate
const {eliminate} = require('../../lib/file/eliminate')
// https://github.com/folder/readdir
const readdir = require('../../lib/file/readdir-async2')
// https://github.com/nodeca/js-yaml
const yaml = require('../../lib/parse/js-yaml').safeLoad
// argh -- https://github.com/3rd-Eden/argh -- using it for ages
const {argv} = require('../../lib/cli/argh')

// simulated data. this === this module
// if this is a cli-app, how would I re-create this data.
// if this is a plugin, we send data through the options argument.
// if this is a part of an integrated whole, we pass internal messages.
const meta = {
  date: new Date().toLocaleString(),
  year: new Date().getFullYear().toString(),
  packageName: 'testing123',
  author: 'Keith Williams',
  version: '0.0.1',
  license: 'mit-0',
}
// these will need to be read in at runtime, somehow
const destination = 'tmp'
// license directory could be re-located
// possible to read in from a config file or cache
const licensedir  = 'lib/license'

async function routeLicense (fp) {
  // set up file object
  const file = File({path: fp})
  // read in file
  await file.read()
  // extract yaml front-matter
  await file.extract(yaml)
  // expand any template strings
  await file.expand(meta)

  // interject help system here
  if (argv.h || argv.help) {
    help('license', file.data['spdx-id'], {data: file.data})
    return
  }

  // send transposed "content" on its way
  await file.router({dest: destination, stem: 'LICENSE', ext: '', put: true})
  // log.debug(file.data) -- checking file data
  // log message
  log(`${file.dest.name}(${file.data['spdx-id']}) => ${destination}`)
  // log(file.data.description) -- display description along with above message
}

// A rudimentary "help" system using yaml front-matter from license files.
// license text files are courtesy of https://github.com/github/choosealicense.com
const help = task.process('help', async (inp, out, opts) => {
  const data = opts.data
  log.log(data.title+'\n')
  log.log('DESCRIPTION\n'+data.description+'\n')
  log.log('HOW TO\n' + data.how + '\n')
  log.log('PERMISSIONS\n'+ data.permissions.join(', ') + '\n')
  log.log('CONDITIONS\n'+ data.conditions.join(', ') + '\n')
})

// License file tasks
task('afl3', async () => {
  await routeLicense(`${licensedir}/afl-3.0.txt`)
})
task('agpl3', async () => {
  await routeLicense(`${licensedir}/agpl-3.0.txt`)
})
task('apache', async () => {
  await routeLicense(`${licensedir}/apache-2.0.txt`)
})
task('artistic', async () => {
  await routeLicense(`${licensedir}/artistic-2.0.txt`)
})
task('bsd0', async () => {
  await routeLicense(`${licensedir}/0bsd.txt`)
})
task('bsd2', async () => {
  await routeLicense(`${licensedir}/bsd-2-clause.txt`)
})
task('bsd3', async () => {
  await routeLicense(`${licensedir}/bsd-3-clause.txt`)
})
task('bsd3c', async () => {
  await routeLicense(`${licensedir}/bsd-3-clause-clear.txt`)
})
task('bsd4', async () => {
  await routeLicense(`${licensedir}/bsd-4-clause.txt`)
})
task('bsl', async () => {
  await routeLicense(`${licensedir}/bsl-1.0.txt`)
})
task('cc4', async () => {
  await routeLicense(`${licensedir}/cc-by-4.0.txt`)
})
task('cc4sa', async () => {
  await routeLicense(`${licensedir}/cc-by-sa-4.0.txt`)
})
task('cc0', async () => {
  await routeLicense(`${licensedir}/cc0-1.0.txt`)
})
task('cecill', async () => {
  await routeLicense(`${licensedir}/cecill-2.1.txt`)
})
task('ecl', async () => {
  await routeLicense(`${licensedir}/ecl-2.0.txt`)
})
task('epl', async () => {
  await routeLicense(`${licensedir}/epl-1.0.txt`)
})
task('epl2', async () => {
  await routeLicense(`${licensedir}/epl-2.0.txt`)
})
task('eupl', async () => {
  await routeLicense(`${licensedir}/eupl-1.1.txt`)
})
task('eupl2', async () => {
  await routeLicense(`${licensedir}/eupl-1.2.txt`)
})
task('gpl2', async () => {
  await routeLicense(`${licensedir}/gpl-2.0.txt`)
})
task('gpl3', async () => {
  await routeLicense(`${licensedir}/gpl-3.0.txt`)
})
task('isc', async () => {
  await routeLicense(`${licensedir}/isc.txt`)
})
task('lgpl1', async () => {
  await routeLicense(`${licensedir}/lgpl-1.3c.txt`)
})
task('lgpl2', async () => {
  await routeLicense(`${licensedir}/lgpl-2.1.txt`)
})
task('lgpl3', async () => {
  await routeLicense(`${licensedir}/lgpl-3.0.txt`)
})
task('mit0', async () => {
  await routeLicense(`${licensedir}/mit-0.txt`)
})
task('mit', async () => {
  await routeLicense(`${licensedir}/mit.txt`)
})
task('mpl', async () => {
  await routeLicense(`${licensedir}/mpl-2.0.txt`)
})
task('mspl', async () => {
  await routeLicense(`${licensedir}/ms-pl.txt`)
})
task('msrl', async () => {
  await routeLicense(`${licensedir}/ms-rl.txt`)
})
task('mulanpsl', async () => {
  await routeLicense(`${licensedir}/mulanpsl-2.0.txt`)
})
task('ncsa', async () => {
  await routeLicense(`${licensedir}/ncsa.txt`)
})
task('no', async () => {
  await routeLicense(`${licensedir}/no`)
})
task('odbl', async () => {
  await routeLicense(`${licensedir}/odbl-1.0.txt`)
})
task('ofl', async () => {
  await routeLicense(`${licensedir}/ofl-1.1.txt`)
})
task('osl', async () => {
  await routeLicense(`${licensedir}/osl-3.0.txt`)
})
task('postgresql', async () => {
  await routeLicense(`${licensedir}/postgresql.txt`)
})
task('un', async () => {
  await routeLicense(`${licensedir}/unlicense.txt`)
})
task('upl', async () => {
  await routeLicense(`${licensedir}/upl-1.0.txt`)
})
task('vim', async () => {
  await routeLicense(`${licensedir}/vim.txt`)
})
task('wtfpl', async () => {
  await routeLicense(`${licensedir}/wtfpl.txt`)
})
task('zlib', async () => {
  await routeLicense(`${licensedir}/zlib.txt`)
})

task('_clean', async () => {
  // nice little clean-up app right here
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