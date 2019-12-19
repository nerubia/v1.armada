# DEVELOPMENT GUIDE

This document will help you when deploying feature(s) to UAT environment and/or production environment.

---

#### NOTE

- We do not release all changes on a sprint
- We release only specific feature or a set of features

#### STEPS

1. Check latest version with `git tag`.
1. Create release branch. You can rename branch after creating Git tag (step 4).
   - `git checkout -b release/<new_version> <latest_version>`
1. Cherry pick commits of the feature(s) you want to include in the release.
   - To get commit hash of the feature: - `git log --pretty=oneline --abbrev-commit` or - Get commit hash from PRs.
   - `git cherry-pick <hash>`
   - Repeat cherry-picking for every feature to include in the release.
   - This is why we **MUST SQUASH EVERY COMMIT** to `integration` branch.
1. Create Git tag and update package version.
   - `npm version <major | minor | patch>`
   - The team will decide if the release is a major, minor or patch release.
1. Push tag.
   - `git push origin <tag>`
   - `<tag>` usually is the version output from `npm version <version>` (step 4).
1. Push release branch.
   - `git push --set-upstream origin release/<version>`
1. Push package version increment to `integration` branch.
   - `git checkout integration`
   - `git pull` if needed.
   - Since our release branch contains multiple commits for the features, we will only pick the specific commit for updating the package version.
   - `git log --pretty=oneline --abbrev-commit`
   - Get commit hash for the changes made in step 4.
   - `git cherrry-pick <hash>`
   - `git push`
1. Check Jenkins build.
   - If build success, release candidate will be auto deployed to https://airside-uat.cag.group/.
1. Inform the team for the new release candidate.
1. Test release branch.
1. Wait for approval from PM before deploying to production environement.
1. Once approved, create PR merging `release/<version>` branch to `master`.
1. Squash merge.
1. Check Jenkins build.
   - If build success, changes will be auto deployed to https://airside.cag.group/.
1. Done.
