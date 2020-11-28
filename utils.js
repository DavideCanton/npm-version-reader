const { execSync } = require("child_process");
const fs = require("fs");
const path = require("path");

exports.execAndRead = (command, options) => {
  return execSync(command, options).toString("utf-8").trim();
};

exports.readDependencies = (cwd, map, key) => {
  execSync("git checkout --quiet HEAD package.json", { cwd });
  const file = fs.readFileSync(path.join(cwd, "package.json"));
  const { dependencies, devDependencies, peerDependencies } = JSON.parse(file);
  map[key] = { dependencies, devDependencies, peerDependencies };
};

exports.checkoutTag = (cwd, tag) => {
  execSync(`git checkout --quiet ${tag} package.json`, { cwd });
};

exports.exportVersions = (versions, out_file) => {
  fs.writeFileSync(out_file, JSON.stringify(versions));
};
