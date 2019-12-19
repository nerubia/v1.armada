#!/bin/bash

GIT_REPO_NAME=$(cat .alfred/git-repo-name.txt)

set -x

docker system prune -f
