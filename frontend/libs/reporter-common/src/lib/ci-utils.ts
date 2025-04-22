import { execSync } from 'child_process';
import { CommitInfo, ActorInfo } from '@openwright/reporting-api'; // Assuming types are accessible

function runGitCommand(command: string): string | undefined {
  try {
    return execSync(command, { stdio: 'pipe' }).toString().trim();
  } catch (error) {
    // Silently ignore errors (e.g., git not installed, not a git repo)
    // console.error(`Error running git command "${command}":`, error);
    return undefined;
  }
}

function detectCI(): 'github' | 'gitlab' | 'azure' | null {
  if (process.env['GITHUB_ACTIONS'] === 'true') return 'github';
  if (process.env['GITLAB_CI'] === 'true') return 'gitlab';
  if (process.env['TF_BUILD'] === 'true') return 'azure'; // Common Azure DevOps variable
  return null;
}

export function getCommitInfo(): CommitInfo | undefined {
  const ciProvider = detectCI();
  let commitInfo: CommitInfo = {};

  if (ciProvider === 'github') {
    commitInfo = {
      sha: process.env['GITHUB_SHA'],
      branch: process.env['GITHUB_REF_NAME'],
      message: undefined, // GITHUB_COMMIT_MESSAGE not standard
      author: process.env['GITHUB_ACTOR'], // Or parse from commit data if needed
      // date: Requires fetching commit details via API or git
      url: process.env['GITHUB_SERVER_URL'] && process.env['GITHUB_REPOSITORY'] && process.env['GITHUB_SHA']
           ? `${process.env['GITHUB_SERVER_URL']}/${process.env['GITHUB_REPOSITORY']}/commit/${process.env['GITHUB_SHA']}`
           : undefined,
    };
  } else if (ciProvider === 'gitlab') {
    const authorInfo = process.env['CI_COMMIT_AUTHOR']?.match(/^(.*?)\s*<(.*?)>$/);
    commitInfo = {
      sha: process.env['CI_COMMIT_SHA'],
      branch: process.env['CI_COMMIT_REF_NAME'],
      message: process.env['CI_COMMIT_MESSAGE'],
      author: authorInfo ? authorInfo[1] : undefined,
      date: process.env['CI_COMMIT_TIMESTAMP'],
      url: process.env['CI_PROJECT_URL'] && process.env['CI_COMMIT_SHA']
           ? `${process.env['CI_PROJECT_URL']}/-/commit/${process.env['CI_COMMIT_SHA']}`
           : undefined,
    };
  } else if (ciProvider === 'azure') {
    commitInfo = {
      sha: process.env['Build_SourceVersion'],
      branch: process.env['Build_SourceBranchName'],
      message: process.env['Build_SourceVersionMessage'],
      author: process.env['Build_RequestedFor'], // Might be user display name
      // date: Requires fetching commit details via API or git
      // url: Requires specific repo type handling (GitHub, Azure Repos, etc.)
    };
  } else {
    // Not in a known CI or CI detection failed, try git CLI
    commitInfo = {
      sha: runGitCommand('git rev-parse HEAD'),
      branch: runGitCommand('git rev-parse --abbrev-ref HEAD'),
      message: runGitCommand('git log -1 --pretty=%B'),
      author: runGitCommand('git log -1 --pretty=%an'),
      date: runGitCommand('git log -1 --pretty=%cI'),
      // url: Difficult to determine reliably from local git
    };
  }

  // Return undefined if no essential info was found
  return commitInfo.sha ? commitInfo : undefined;
}

export function getActorInfo(): ActorInfo | undefined {
  const ciProvider = detectCI();
  let actorInfo: Partial<ActorInfo> = {};

  if (ciProvider === 'github') {
    actorInfo = {
      name: process.env['GITHUB_ACTOR'],
      email: undefined, // GITHUB_ACTOR_EMAIL not standard
    };
  } else if (ciProvider === 'gitlab') {
    actorInfo = {
      name: process.env['GITLAB_USER_NAME'],
      email: process.env['GITLAB_USER_EMAIL'],
    };
  } else if (ciProvider === 'azure') {
    actorInfo = {
      name: process.env['Build_RequestedFor'], // Might be display name
      email: process.env['Build_RequestedForEmail'],
    };
  } else {
    // Try getting from local git config
    actorInfo = {
      name: runGitCommand('git config user.name'),
      email: runGitCommand('git config user.email'),
    };
  }

  // ActorInfo requires name and email
  if (actorInfo.name && actorInfo.email) {
    return actorInfo as ActorInfo;
  }

  return undefined;
}