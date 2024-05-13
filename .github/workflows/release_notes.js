const fs = require('fs');
const childProcess = require('child_process');

/**
 * This function grabs the latest tag for the repo.
 *
 * @remarks
 * For more information on {@link https://git-scm.com/book/en/v2/Git-Basics-Tagging | Git Tags}
 *
 * @returns latest git tag 
 *
 */
const getLatestTag = () => {
  try {
    // https://stackoverflow.com/questions/1404796/how-can-i-get-the-latest-tag-name-in-current-branch-in-git
    return childProcess.execSync('git describe --tags --abbrev=0').toString().trim().split('\n');
  } catch (error) {
    console.error('Error getting latest tag:', error);
    return null;
  }
}

/**
 * This function reads the contents of the CHANGELOG.md
 *
 * @remarks
 * For more information on {@link http://keepachangelog.com/ | changelogs}
 *
 * @returns contents of the CHANGELOG.md file
 *
 */
const readChangelogFile = () => {
  try {
    // Changelog is at the root of the repo
    return fs.readFileSync('./CHANGELOG.md', 'utf-8');
  } catch (error) {
    console.error('Error reading CHANGELOG.md:', error);
    return null;
  }
}

/**
 * This function extracts the section of the changelog which contains the latest tag
 *
 * @remarks
 * For more information on {@link https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Regular_expressions | JavaScript Regex}
 *
 * @param changelogContent - The changelog content
 * @param latestTag - The latest tag
 * 
 * @returns release notes for the latest tag
 *
 */
const extractLatestTagSection = (changelogContent, latestTag) => {
  // This regex will match all lines from the newest tag line just before the next line starting with ##
  const tagPattern = new RegExp(`^## ${latestTag}.*?(?=^## )`, 'gms');
  const match = changelogContent.match(tagPattern);
  return match ? match[0].trim() : null;
}

/**
 * This function creates release notes for the latest tag version
 *
 * @remarks
 * For more information on {@link http://keepachangelog.com/ | changelogs}
 *
 * @returns contents of the CHANGELOG.md file
 *
 */
const release_notes = () => {
  const latestTag = getLatestTag();
  if (!latestTag) {
    console.error('Failed to get the latest tag.');
    return;
  }

  const changelogContent = readChangelogFile();
  if (!changelogContent) {
    console.error('Failed to read CHANGELOG.md.');
    return;
  }

  const latestTagSection = extractLatestTagSection(changelogContent, latestTag);
  if (latestTagSection) {
    console.log(`Section for the latest tag (${latestTag}):\n\n${latestTagSection}`);
    return latestTagSection;
  } else {
    console.error(`No section found for the latest tag (${latestTag}) in CHANGELOG.md.`);
  }
}

// Create release notes
release_notes()