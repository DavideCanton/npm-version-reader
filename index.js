const semver = require("semver");
const yargs = require("yargs/yargs");
const { hideBin } = require("yargs/helpers");
const fetch = require("node-fetch");
const _ = require("lodash");

const argv = yargs(hideBin(process.argv))
  .command("$0", "the default command", (yargs) => {
    yargs.positional("package", {
      describe: "package name",
      type: "string",
    });
  })
  .options({
    range: {
      alias: "r",
      type: "string",
      default: "",
      description: "Semver range",
    },
    onlyMajor: {
      alias: "m",
      type: "boolean",
      default: false,
      description: "Inspect only major",
    },
    onlyStable: {
      alias: "s",
      type: "boolean",
      default: false,
      description: "Inspect only stable",
    },
  })
  .help().argv;

async function main(args) {
  const [package] = args._;
  const { onlyMajor, onlyStable, range } = args;

  const { versions, time } = await fetch(
    `https://registry.npmjs.org/${package}`
  ).then((v) => v.json());

  Object.keys(time).forEach((k) => (time[k] = new Date(time[k])));

  let allVersions = _.chain(Object.keys(versions)).orderBy((v) => time[v], [
    "desc",
  ]);

  if (range)
    allVersions = allVersions.filter((v) => semver.satisfies(v, range));

  if (onlyStable)
    allVersions = allVersions.filter((v) => !semver.prerelease(v));

  if (onlyMajor) {
    allVersions = allVersions
      .groupBy((v) => semver.major(v))
      .mapValues((vv) => vv[0])
      .values();
  }

  allVersions = allVersions.value();

  const out = {};
  for (const version of allVersions) {
    out[version] = _.pick(versions[version], [
      "dependencies",
      "devDependencies",
      "peerDependencies",
    ]);
  }

  console.log(out);
}

main(argv);
