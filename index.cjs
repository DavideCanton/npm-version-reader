#!/usr/bin/env node
// @ts-check

const {exec} = require('child_process');
const semver = require('semver');
const yargs = require('yargs/yargs');
const {hideBin} = require('yargs/helpers');
const fetch = require('node-fetch');
const {promisify} = require('util');

const argv = yargs(hideBin(process.argv))
    .command(
        '$0 <pkg>',
        'Queries the provided registry and returns all the dependencies for each version.',
        (yargs) => {
            yargs.positional('pkg', {
                describe: 'package identifier',
                type: 'string',
            });
        },
    )
    .options({
        range: {
            alias: 'r',
            type: 'string',
            default: '',
            description: 'Semver range to retrieve.',
        },
        major: {
            alias: 'm',
            type: 'boolean',
            default: false,
            description: 'Inspect only the latest version for each major.',
        },
        stable: {
            alias: 's',
            type: 'boolean',
            default: false,
            description:
                'Inspect only stable versions (no alpha, beta, prereleases).',
        },
        registry: {
            type: 'string',
            default: '',
            description:
                'Registry to query. Leave empty to use current registry set in NPM config.',
        },
    })
    .strict()
    .demandCommand(1)
    .help()
    .parseSync();

(async () => {
    let {registry, major, stable, range, pkg} = argv;

    if (!registry) {
        registry = (
            await promisify(exec)('npm config get registry', {
                encoding: 'utf-8',
            })
        ).stdout.trim();
    }

    console.log(`Using registry ${registry}...`);

    const {versions, time} = await fetch(`${registry}/${pkg}`).then((v) =>
        v.json(),
    );

    let allVersions = [];
    for (const v in versions) {
        allVersions.push({
            version: v,
            time: new Date(time[v]),
        });
    }

    // sort desc
    allVersions.sort((v1, v2) => v2['time'].valueOf() - v1['time'].valueOf());

    if (range) {
        allVersions = allVersions.filter(({version}) =>
            semver.satisfies(version, range),
        );
    }

    if (stable) {
        allVersions = allVersions.filter(
            ({version}) => !semver.prerelease(version),
        );
    }

    if (major) {
        const majors = new Set();
        const latestVersions = [];
        for (const versionObj of allVersions) {
            const major = semver.major(versionObj.version);
            if (!majors.has(major)) {
                majors.add(major);
                latestVersions.push(versionObj);
            }
        }
        allVersions = latestVersions;
    }

    const out = {};
    const keys = ['dependencies', 'devDependencies', 'peerDependencies'];

    for (const {version} of allVersions) {
        out[version] = {};
        for (const k of keys) {
            const src = versions[version][k];
            if (src) {
                out[version][k] = src;
            }
        }
    }

    console.log(out);
})();
