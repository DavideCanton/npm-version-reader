# NPM version reader

Command line tool for reading NPM packages dependencies.

## Getting Started

### Installing

```shell
# node js
npm install -g npm-version-reader

# yarn
yarn global add npm-version-reader
```

### Usage

```shell
npm-version-reader <pkg> [-r|--range] [-m|--major] [-s|--stable] [--registry] [--help]

Queries the provided registry and returns all the dependencies for each major version.

Positionals:
  pkg  package identifier                                               [string]

Options:
      --version   Show version number                                  [boolean]
  -r, --range     Semver range to retrieve.               [string] [default: ""]
  -m, --major     Inspect only the latest version for each major.
                                                      [boolean] [default: false]
  -s, --stable    Inspect only stable versions (no alpha, beta, prereleases).   
                                                      [boolean] [default: false]
      --registry  Registry to query. Leave empty to use current registry set in 
                  NPM config.                             [string] [default: ""]
      --help      Show help                                            [boolean]
```

### Example outputs

```shell
$ npm-version-reader foo

Using registry https://registry.npmjs.org/...
{
  '0.0.1': {
    dependencies: { 'bar': '^0.1.0' },
    devDependencies: { 'baz': '1.0.0' }
  },
  '0.1.1': {
    dependencies: { 'bar': '^0.2.0' },
    devDependencies: { 'baz': '1.1.0' }
  },
  '1.0.0-beta': {
    dependencies: { 'bar': '^1.0.0' },
    devDependencies: { 'baz': '1.1.0' }
  },
  '1.0.0': {
    dependencies: { 'bar': '^1.1.0' },
    devDependencies: { 'baz': '1.1.0' }
  }
}

$ npm-version-reader foo --major

{
  '0.1.1': {
    dependencies: { 'bar': '^0.2.0' },
    devDependencies: { 'baz': '1.1.0' }
  },
  '1.0.0': {
    dependencies: { 'bar': '^1.1.0' },
    devDependencies: { 'baz': '1.1.0' }
  }
}

$ npm-version-reader foo --stable

{
  '0.0.1': {
    dependencies: { 'bar': '^0.1.0' },
    devDependencies: { 'baz': '1.0.0' }
  },
  '0.1.1': {
    dependencies: { 'bar': '^0.2.0' },
    devDependencies: { 'baz': '1.1.0' }
  },
  '1.0.0': {
    dependencies: { 'bar': '^1.1.0' },
    devDependencies: { 'baz': '1.1.0' }
  }
}

$ npm-version-reader foo -r '>=1.0.0 <2.0.0'

{
  '1.0.0': {
    dependencies: { 'bar': '^1.1.0' },
    devDependencies: { 'baz': '1.1.0' }
  }
}

```

## Versioning

We use [SemVer](http://semver.org/) for versioning. For the versions available, see the [tags on this repository](https://github.com/your/project/tags).

## Authors

- **Davide Canton** - *Initial work* - [DavideCanton](https://github.com/DavideCanton)

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
