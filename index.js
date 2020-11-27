const npm = require('npm');

// read package from args
// npm retrieve url of repo
// git clone -n <<url>> --depth 1
// cd repo
// get list of tags
// foreach tag:
// git checkout HEAD package.json
// read deps versions and store in index
// log index