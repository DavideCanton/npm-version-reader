const { execSync } = require("child_process");
const rimraf = require("rimraf");
const path = require("path");
const {
  execAndRead,
  readDependencies,
  checkoutTag,
  exportVersions,
} = require("./utils");
const { promisify } = require("util");

const sleep = promisify(setTimeout);

const srcDir = "C:\\Users\\Davide\\Documents\\GitHub\\npm-version-reader";
const tmp = path.join(srcDir, "tmp");
const out_file = path.join(srcDir, "out.json");

async function main() {
  rimraf.sync(tmp);
  // const registry = execAndRead('npm config get registry');

  console.info("Retrieving args...");
  const package = process.argv[2];
  let count = process.argv[3];
  if (!count || count <= 0) count = 0;
  if (!package) throw new Error("No package specified");

  console.info("Retrieving repository url...");
  const input = `npm view ${package} repository.url`;
  let repository = execAndRead(input);
  repository = repository.replace(/^git\+/, "");
  if (!package) throw new Error("Can't retrieve repository URL");

  console.info("Cloning repository...");
  execSync(`git clone --quiet --no-checkout ${repository} --depth 1 ${tmp}`);

  console.info("Reading tags...");
  execSync("git fetch --tags --quiet", { cwd: tmp });
  let tags = execAndRead("git tag --list --sort=-committerdate", { cwd: tmp })
    .split("\n")
    .map((s) => s.trim());
  if (count > 0) tags = tags.slice(0, count);

  const versions = {};
  for (const tag of tags) {
    console.info(`Reading dependencies of tag ${tag}...`);
    checkoutTag(tmp, tag);
    readDependencies(tmp, versions, tag);
    await sleep(1000);
  }

  console.info("Writing out file...");
  exportVersions(versions, out_file);

  console.info("Cleaning up...");
  rimraf.sync(tmp);
}

main();
