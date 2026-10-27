# Ticket 47 verified production evidence

Source9006a2066f93359c991eeafcf9d812db3ae78450, draft PR51, based on discovery PR50. verified-evidence.tar.gz retains every file named in the original final-provenance.json, including the exact native pnpm chat archive, consumer/browser fixture, tests, source correspondence, schema, build and package logs. All hashes were verified before copying. Archive member names are original paths relative to /private/tmp; the original absolute-path provenance remains unchanged.

The accepted native archive is b4cb71c1d378bd4b50c69b0092af55ca55bc4ef0c33771624d367f782d739384. The diagnostic npm archive is separate and unaccepted; old results were not assigned to its bytes. Native pnpm repacking recovered the tested archive exactly. The pinned core archive is f62cf7f1d3bf9a6e3cfe57b6e2365ed821978d6d65cb080e0444bc907e94e46f.

The producer executed packed imports/types/private-path rejection, 84-entry/schema correspondence, shared custom context/actions/streaming, bundle separation and package checks. This retention step verified hashes and did not rerun those checks. Local results are bounded; remote CI was not scheduled for the stacked PR. No publication, merge or issue closure. Historical component findings remain separate.
