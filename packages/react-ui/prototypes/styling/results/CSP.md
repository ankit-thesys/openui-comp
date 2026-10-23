# Strict CSP compatibility — generated observations

Installed package, React 19 renderToString and hydration. Real response CSP headers. No unsafe-inline. Static button only. nonce = component prop only (negative probe); nonce-renderer = matching style nonce also supplied to React streaming renderer.

| Browser | Policy | Styled before JS | Styled after hydration | Nonce on style |
| --- | --- | --- | --- | --- |
| chromium | none | true | true | false |
| chromium | blocked | false | false | false |
| chromium | nonce | false | false | false |
| chromium | nonce-renderer | true | true | true |
| chromium | hash | true | true | false |
| webkit | none | true | true | false |
| webkit | blocked | false | false | false |
| webkit | nonce | false | false | false |
| webkit | nonce-renderer | true | true | true |
| webkit | hash | true | true | false |

## Unavailable checks

- firefox: launch failed: browserType.launch: Failed to launch the browser process.

- CSP allowlist is owned by the application; this test does not automate its security policy
- Dynamic inline theme attributes are not covered and are prohibited by this policy
- Next.js nonce propagation and streaming CSP require a separate integrated test
