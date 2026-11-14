import { execFileSync } from 'node:child_process';

const git = (args) => execFileSync('git', args, { encoding: 'utf8' }).trim();
const tagArgs = [
  'describe',
  '--tags',
  '--abbrev=0',
  '--match',
  'v[0-9]*',
  '--match',
  'staging/[0-9]*',
];

function getFetchRemote() {
  try {
    return git(['remote', 'get-url', 'origin']);
  } catch {
    const owner = process.env.VERCEL_GIT_REPO_OWNER;
    const repository = process.env.VERCEL_GIT_REPO_SLUG;
    if (owner && repository) {
      return `https://github.com/${owner}/${repository}.git`;
    }

    throw new Error(
      'Cannot fetch Git tags or history: no origin remote or Vercel repository metadata is available.',
    );
  }
}

const shallow = git(['rev-parse', '--is-shallow-repository']) === 'true';
if (shallow) {
  const remote = getFetchRemote();
  const branch = process.env.VERCEL_GIT_COMMIT_REF;
  if (!branch) {
    throw new Error(
      'Cannot calculate a full commit count from a shallow checkout without VERCEL_GIT_COMMIT_REF.',
    );
  }

  git([
    'fetch',
    '--unshallow',
    '--tags',
    remote,
    `+refs/heads/${branch}:refs/remotes/version/${branch}`,
  ]);
}

let tag;
try {
  tag = git(tagArgs);
} catch {
  git(['fetch', '--tags', getFetchRemote()]);
  tag = git(tagArgs);
}

const match =
  /^v(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)$/.exec(tag) ??
  /^staging\/(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)-rc\.(0|[1-9]\d*)$/.exec(tag);

if (!match) {
  throw new Error(
    `Nearest reachable Git tag "${tag}" must use vMAJOR.MINOR.PATCH or staging/MAJOR.MINOR.PATCH-rc.N format.`,
  );
}

const commitCount = Number(git(['rev-list', '--count', 'HEAD']));
if (!Number.isSafeInteger(commitCount) || commitCount < 1) {
  throw new Error(`Invalid Git commit count: ${commitCount}`);
}

const [, major, minor, patch] = match;
process.stdout.write(`${major}.${minor}.${patch}.${commitCount}\n`);
