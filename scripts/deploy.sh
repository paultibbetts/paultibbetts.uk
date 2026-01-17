#!/usr/bin/env bash
set -euo pipefail

# ------------------------------------------------------------------------------
# Deploy a pre-built static site to a host using an
# Ansible deploy_helper-style layout:
#   <BASE>/releases/<TIMESTAMP>/
#   <BASE>/current -> releases/<TIMESTAMP>
#
# Intended to run from CI.
# ------------------------------------------------------------------------------

: "${DEPLOY_HOST:?Set DEPLOY_HOST (e.g. example.com)}"
: "${DEPLOY_USER:?Set DEPLOY_USER (e.g. deploy)}"
: "${DEPLOY_PATH:?Set DEPLOY_PATH (e.g. /srv/www/website)}"
: "${LOCAL_BUILD_DIR:?Set LOCAL_BUILD_DIR (e.g. ./public)}"

DEPLOY_PORT="${DEPLOY_PORT:-22}"
KEEP_RELEASES="${KEEP_RELEASES:-5}"

RELEASE_ID="${RELEASE_ID:-$(date +%Y%m%dT%H%M%S)}"

RSYNC_FLAGS="${RSYNC_FLAGS:--az --delete --delay-updates --compress --human-readable}"

SSH_KEY_PATH="${SSH_KEY_PATH:-}"
SSH_KNOWN_HOSTS_PATH="${SSH_KNOWN_HOSTS_PATH:-}"

if [[ ! -d "$LOCAL_BUILD_DIR" ]]; then
  echo "LOCAL_BUILD_DIR does not exist or is not a directory: $LOCAL_BUILD_DIR" >&2
  exit 1
fi

ssh_opts=(
  -p "$DEPLOY_PORT"
  -o BatchMode=yes
  -o StrictHostKeyChecking=yes
)

if [[ -n "$SSH_KEY_PATH" ]]; then
  ssh_opts+=(-i "$SSH_KEY_PATH")
fi

if [[ -n "$SSH_KNOWN_HOSTS_PATH" ]]; then
  ssh_opts+=(-o "UserKnownHostsFile=$SSH_KNOWN_HOSTS_PATH")
fi

remote="${DEPLOY_USER}@${DEPLOY_HOST}"
releases_dir="${DEPLOY_PATH}/releases"
release_dir="${releases_dir}/${RELEASE_ID}"
current_link="${DEPLOY_PATH}/current"

echo "Deploying ${LOCAL_BUILD_DIR} -> ${remote}:${release_dir}"

rsync ${RSYNC_FLAGS} \
  -e "ssh ${ssh_opts[*]}" \
  "${LOCAL_BUILD_DIR}/" \
  "${remote}:${release_dir}/"

ssh "${ssh_opts[@]}" "$remote" bash -s <<EOF
set -euo pipefail

ln -sfn "${release_dir}" "${current_link}"

cd "${releases_dir}"
to_delete=\$(ls -1dt */ 2>/dev/null | tail -n +$((KEEP_RELEASES + 1)) || true)
if [[ -n "\$to_delete" ]]; then
  echo "Pruning old releases:"
  echo "\$to_delete"
  echo "\$to_delete" | while read -r d; do
    [[ -n "\$d" ]] || continue
    rm -rf -- "\$d"
  done
fi

EOF

echo "Deployment complete. current -> ${release_dir}"

