// internal code not yet relased. (anything referencing ../lib/..)
// tasks -- adopted from https://github.com/ricardobeat/taks
// read, write part of taks
// log -- internal -- just custom wrappers for console, process.stdout/stderr
const {task, log, read, write, forEach} = require('../../lib/cli/tasks')
// expand -- a very minor version of https://github.com/jonschlinkert/expand
const expand = require('../../lib/string/expand')
// https://github.com/overlookmotel/promise-methods
// --> now integrated into tasks
// const {forEach} = require('../../lib/async/each')
// eliminate -- adopted from https://github.com/terkelg/eliminate
const {eliminate} = require('../../lib/file/eliminate')
const {join} = require('path')
const sliced = (a, b, c) => Array.prototype.slice.call(a, b, c)

function isOr (value) {
  var args = sliced(arguments, 1, arguments.length)
  return args.some(function (val) {
    return (value === val)
  })
}

// simulate options parameters for testing
// just testing three files at the moment.
const opts = {
  files: {
    gitignore: true,
    eslintrc: true,
    index: false,
    license: true,
    package: false,
    readme: false,
    test: false,
    travis: false
  },
  meta: {
    year: new Date().getFullYear().toString(),
    license: 'isc',
    author: 'Keith Williams'
  }
}

// clean up this code.
// there is no error checking yet
async function tmpls (opts) {
  const license = opts.meta.license
  const tmpl = opts.files
  let files = []
  let filePath
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

  // clean this up...old code but now working
  await forEach(files, async (file) => {
    const filePath = 'tmp/' + file

    await processFile(filePath, 'lib/templates/', file, opts)
  }).then(async () => {
    if (license && license !== true) lic = license.toLowerCase()
    else lic = 'no'

    await processFile('tmp/LICENSE', 'lib/license/', lic, opts)
  })

}

// clean this code. no error checking yet.
async function processFile (filePath, srcdir, file, opts) {
  const res = await read(join(__dirname, srcdir + file))
  // log(res)
  const tmpl = await expand(res, opts.meta)
  // log.dir(tmpl)
  await write(filePath, tmpl).then(() => {
    if (srcdir === 'lib/license/') file = file.toUpperCase() + ' LICENSE'
    log('create:', file, 'white')
  })
}

task('tmpls', async () => {
  await tmpls(opts)
})

task('clean_tmpls', async () => {
  await eliminate('.eslintrc')
  await eliminate('.gitignore')
  await eliminate('LICENSE')
})

task.run(process.argv[2])