// Example user provided configuration file for npinit
// All inputs required.

module.exports = {
  // global defaults
  defs: {
    // install dependencies or devDependencies, true or false
    install: true,
    // devDependencies to be installed. use an array.
    devpackages: ['akileez/toolz'],
    // dependencies to be installed. use an array.
    packages: ['colorz', 'json-colorz'],
    // a git repo? true or false
    git: false,
    // verbose output? true or false
    verbose: false,
    // dryrun ? true or false
    dryrun: false
  },
  // files to be added during installation. true or false
  files: {
    gitignore: false,
    eslintrc: false,
    index: true,
    license: false,
    package: true,
    readme: true,
    test: false,
    travis: false
  },
  // metadata to fill out templates, licenses and type of git repo
  meta: {
    // Name of package/project
    packageName: 'myStuff',
    // private or public
    type: 'private',
    // none or git
    repo: 'none',
    // false, addRemote or hubCreate
    remote: false,
    // true or false
    push: false,
    // your name
    author: 'Jane Doe',
    // your github email address
    email: 'me@u2.com',
    // your github user name
    name: 'apple4ever',
    // address of github project or elsewhere
    url: 'https://github.com/apple4ever/myStuff',
    // project version number
    version: '0.1.1',
    // license
    license: 'MIT',
    // package/project description
    description: 'Reading in from a config file'
  }
}
