#!/bin/sh
set -eu
# download directory can be mounted from host : allow any regular user to edit or delete the downloaded files
umask 000

# This script downloads an asset from a github repository and makes it available in $ASSET_PATH.
# Downloaded assets are kept in /downloads as a cache for later downloads.

# Input validation
if [ -z "$GITHUB_API_TOKEN" ];
  then echo "Error: Please define a GITHUB_API_TOKEN variable." >&2;
  exit 1;
fi;

if [ -z "$GITHUB_REPOSITORY" ];
  then echo "Error: Please define a GITHUB_REPOSITORY variable." >&2;
  exit 1;
fi;

if [ -z "$TARGET_VERSION" ];
  then echo "Error: Please define a TARGET_VERSION variable." >&2;
  exit 1;
fi;

if [ -z "$TARGET_ASSET" ];
  then echo "Error: Please define a TARGET_ASSET variable." >&2;
  exit 1;
fi;

# Define variables
GH_REPO_URL="https://api.github.com/repos/$GITHUB_REPOSITORY"
ASSET_PATH=${ASSET_PATH:-"/asset"}
DOWNLOAD_PATH="/downloads/"

mkdir -p "${DOWNLOAD_PATH}";

OUTPUT="${FINAL_ASSET:-$TARGET_ASSET}";

if [ -f "${DOWNLOAD_PATH}/${OUTPUT}"  ]
then
  echo "Asset $TARGET_ASSET already downloaded, skipping."
  touch "${DOWNLOAD_PATH}/${OUTPUT}" # update write date to mark the asset as fresh
else
  echo "Asset $TARGET_ASSET not found locally, downloading..."
  echo "Validate token..."
  curl --fail -s -L -H "Authorization: token $GITHUB_API_TOKEN" "$GH_REPO_URL" > /dev/null || {
    echo "Error: Invalid repo, token or network issue!";
    exit 1;
  }

  # Get the asset id
  echo "Get the asset id for ${TARGET_VERSION}"
  URL="$GH_REPO_URL/releases/tags/$TARGET_VERSION";
  RES=$(curl --fail -s -L -H "Accept: application/vnd.github+json" -H "Authorization: token $GITHUB_API_TOKEN" "$URL") || {
    echo "Error: failed to get asset id for $TARGET_ASSET (version $TARGET_VERSION) in $GITHUB_REPOSITORY";
    exit 2;
  }

  ASSET_ID=$(echo "$RES" | jq -r '.assets[] | select(.name == "'$TARGET_ASSET'").id') || {
    echo "Error: failed to extract asset id for $TARGET_ASSET (version $TARGET_VERSION) in $GITHUB_REPOSITORY";
    exit 2;
  }

  # Download the github asset
  echo "Downloading asset $TARGET_ASSET with id:$ASSET_ID...";
  curl --fail -LJ -o "${DOWNLOAD_PATH}/${OUTPUT}" -H "Accept: application/octet-stream" -H "Authorization: token $GITHUB_API_TOKEN" "$GH_REPO_URL/releases/assets/$ASSET_ID" || {
    echo "Error: cannot download the requested asset";
    exit 3;
  }
fi

# clean downloaded assets from this repo
( cd "${ASSET_PATH}" && find "${DOWNLOAD_PATH}" -type f -print0 | xargs -0 -n1 basename | xargs rm -f )
# keep only the requested asset in the asset folder
cp "${DOWNLOAD_PATH}/${OUTPUT}" "${ASSET_PATH}/${OUTPUT}";

echo "Asset is now available at: ${ASSET_PATH}/${OUTPUT}";
