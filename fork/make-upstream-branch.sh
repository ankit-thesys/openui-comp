#!/usr/bin/env bash
# Makes the upstream branch for a fork branch: one commit on the fork branch's merge base with the
# upstream base, holding the fork branch's tree minus fork/upstream-exclude.txt. Paths the base
# also has are restored from that merge base, the fork's workspace line is dropped and the lockfile
# is regenerated. Writes only the local branch upstream/<fork-branch>; it never pushes.
#
#   fork/make-upstream-branch.sh <fork-branch> [upstream-base]   (base: codex/production-core-kits)
#
# An existing upstream/<fork-branch> on the same merge base gets a new commit on top (none when
# nothing changed); one on another merge base is recreated. UPSTREAM_MESSAGE sets the message.
set -euo pipefail

usage() { echo "usage: $0 <fork-branch> [upstream-base]" >&2; exit 2; }
[[ $# -ge 1 && $# -le 2 ]] || usage
fork_branch=$1
base=${2:-codex/production-core-kits}
target=upstream/$fork_branch

repo=$(git rev-parse --show-toplevel)
resolve() {
  git -C "$repo" rev-parse --verify --quiet "refs/heads/$1^{commit}" ||
    git -C "$repo" rev-parse --verify --quiet "refs/remotes/origin/$1^{commit}" ||
    git -C "$repo" rev-parse --verify --quiet "$1^{commit}" ||
    { echo "error: no branch or commit named $1" >&2; exit 1; }
}
fork_commit=$(resolve "$fork_branch")
base_commit=$(resolve "$base")
merge_base=$(git -C "$repo" merge-base "$fork_commit" "$base_commit")
exclude_list=$(git -C "$repo" show "$fork_commit:fork/upstream-exclude.txt")

work=$(mktemp -d "${TMPDIR:-/tmp}/upstream-branch.XXXXXX")
cleanup() { git -C "$repo" worktree remove --force "$work" >/dev/null 2>&1 || rm -rf "$work"; }
trap cleanup EXIT
git -C "$repo" worktree add --quiet --detach "$work" "$fork_commit"
cd "$work"

while IFS= read -r entry; do
  [[ -z $entry || $entry == \#* ]] && continue
  if [[ $entry == *"|"* ]]; then
    file=${entry%%|*} line=${entry#*|}
    [[ -f $file ]] || continue
    grep -vxF -- "$line" "$file" >"$file.upstream" || true
    mv "$file.upstream" "$file"
    continue
  fi
  path=${entry%/}
  git rm -r -q --cached --ignore-unmatch -- "$path"
  rm -rf -- "$path"
  if git cat-file -e "$merge_base:$path" 2>/dev/null; then
    git checkout -q "$merge_base" -- "$path"
  fi
done <<<"$exclude_list"

pnpm install --lockfile-only --ignore-scripts --prefer-offline >/dev/null
git add -A
tree=$(git write-tree)

message=${UPSTREAM_MESSAGE:-"Upstream snapshot of $fork_branch at $(git rev-parse --short "$fork_commit")"}
if previous=$(git rev-parse --verify --quiet "refs/heads/$target") &&
  git merge-base --is-ancestor "$merge_base" "$previous" &&
  [[ $(git rev-list --count "$merge_base..$previous") -gt 0 ]]; then
  if [[ $(git rev-parse "$previous^{tree}") == "$tree" ]]; then
    echo "$target is already up to date at $(git rev-parse --short "$previous")"
    exit 0
  fi
  parent=$previous
else
  [[ -n ${previous:-} ]] && echo "recreating $target on merge base $(git rev-parse --short "$merge_base")"
  parent=$merge_base
fi
commit=$(git commit-tree "$tree" -p "$parent" -m "$message")
git update-ref "refs/heads/$target" "$commit"
echo "$target -> $(git rev-parse --short "$commit") (on $(git rev-parse --short "$parent"), from $fork_branch at $(git rev-parse --short "$fork_commit"))"
