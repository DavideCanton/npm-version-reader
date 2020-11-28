const { execSync } = require("child_process");
const path = require("path");
const semver = require("semver");
const tmp = require("tmp");
const {
  execAndRead,
  readDependencies,
  checkoutTag,
  exportVersions,
} = require("./utils");
const { promisify } = require("util");
const yargs = require("yargs/yargs");
const { hideBin } = require("yargs/helpers");

const sleep = promisify(setTimeout);

const srcDir = ".";
const tmpDir = tmp.dirSync({ unsafeCleanup: true });
const out_file = path.join(srcDir, "out.json");

const argv = yargs(hideBin(process.argv))
  .command(
    "$0",
    "the default command",
    (yargs) => {
      yargs.positional("package", {
        describe: "package name",
        type: "string",
      });
    }
  )
  .options({
    count: {
      alias: "c",
      type: "number",
      default: 0,
      description: "Number of tags",
    },
    onlyMajor: {
      alias: "m",
      type: "boolean",
      default: false,
      description: "Inspect only major",
    },
    tagPattern: {
      alias: "p",
      type: "string",
      default: "^v.+$",
      description: "Tag pattern",
    },
  })
  .help().argv;

async function main(args) {
  const [package] = args._;
  const { count, tagPattern, onlyMajor } = args;

  console.info("Retrieving repository url...");
  const input = `npm view ${package} repository.url`;
  let repository = execAndRead(input);
  repository = repository.replace(/^git\+/, "");
  if (!repository) throw new Error("Can't retrieve repository URL");

  console.info("Cloning repository...");
  execSync(
    `git clone --quiet --no-checkout ${repository} --depth 1 ${tmpDir.name}`
  );

  console.info("Reading tags...");
  execSync("git fetch --tags --quiet", { cwd: tmpDir.name });

  //TODO sort better
  let tags = execAndRead("git tag --list --sort=-committerdate", {
    cwd: tmpDir.name,
  })
    .split("\n")
    .filter((t) => !!t.match(tagPattern))
    .filter((t, i, a) => {
      if (onlyMajor && i > 0) {
        const m = semver.parse(t).major;
        const m2 = semver.parse(a[i - 1]).major;
        return m !== m2;
      }
      return true;
    })
    .map((s) => s.trim());

  if (count > 0) tags = tags.slice(0, count);

  const versions = {};
  for (const tag of tags) {
    console.info(`Reading dependencies of tag ${tag}...`);
    checkoutTag(tmpDir.name, tag);
    readDependencies(tmpDir.name, versions, tag);
    await sleep(1000);
  }

  console.info("Writing out file...");
  exportVersions(versions, out_file);

  console.info("Cleaning up...");
  try {
    tmpDir.removeCallback();
  } catch (e) {
    console.warn("Can't delete temp folder: " + e);
  }
}

main(argv);
