# NPM version reader

Command line tool for reading NPM packages dependencies.

## Getting Started

### Installing

```
npm install -g npm-version-reader
```

### Arguments

The only positional argument (and the only required one) is the package name.

### Optional arguments
| Parameter | Default | Description
| :-------- | :------ | :----------
| -m, --onlyMajor | false | Inspect only the latest version for each major.
| -s, --onlyStable | false | Inspect only stable versions (no alpha, beta, prereleases).
| --registry | https://registry.npmjs.org | Registry to query
| -r, --range | | Semver range to retrieve.

## Versioning

We use [SemVer](http://semver.org/) for versioning. For the versions available, see the [tags on this repository](https://github.com/your/project/tags). 

## Authors

* **Davide Canton** - *Initial work* - [DavideCanton](https://github.com/DavideCanton)

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details
