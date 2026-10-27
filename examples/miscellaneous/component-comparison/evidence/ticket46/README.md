# Ticket 46 retained regression coverage

The five CLI integration tests are retained here because the user requires all test/evidence work in lab PR41 and a source/config/docs-only production PR. They exercise real pnpm workspace/build selection, the actual peer guard, and nonpublishing changeset analysis against temporary packages, including a manifestless organizational directory. Each fixture cleans itself up. No release is performed.

validation.json binds a fresh passing run to exact source commit 15d47db5c30fb85464830cf490064d6c20e20c41, invocation, Node/pnpm versions, source files, test and output hashes. Original red/green logs and independent review reports remain unchanged beside the retained run. To rerun, check out that commit, set TICKET46_SOURCE to its absolute root, and run node --test with workspace.test.mjs. This evidence resolves the review request for committed regression coverage without adding test fixtures to the production package PR.
