import { execFileSync } from 'node:child_process';

const git = (args) => execFileSync('git', args, { encoding: 'utf8' }).trim();
const tagArgs = [
  'describe',
  '--tags',
  '--abbrev=0',
  '--match',
  'v[0-9]*',
];

if (git(['rev-parse', '--is-shallow-repository']) === 'true') {
  git(['fetch', '--unshallow', '--tags', 'origin']);
}

let tag;
try {
  tag = git(tagArgs);
} catch {
  git(['fetch', '--tags', 'origin']);
  tag = git(tagArgs);
}

const match = /^v(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)$/.exec(tag);

if (!match) {
  throw new Error(`Nearest reachable Git tag "${tag}" must use the vMAJOR.MINOR.PATCH format.`);
}

const commitCount = Number(git(['rev-list', '--count', 'HEAD']));
if (!Number.isSafeInteger(commitCount) || commitCount < 1) {
  throw new Error(`Invalid Git commit count: ${commitCount}`);
}

process.stdout.write(`${match[1]}.${match[2]}.${match[3]}.${commitCount}\n`);
