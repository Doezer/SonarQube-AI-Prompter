# Agent Guidance

## Project Shape
- This repo is a small Chrome extension (Manifest V3) for SonarCloud prompt extraction.
- The main files are `manifest.json`, `popup.html`, `popup.js`, and `README.md`.
- Keep changes focused on those files unless a new dependency or asset is truly required.

## How It Works
- `popup.js` queries the active tab, requires a SonarCloud page, and injects `extractSonarIssues` into the page.
- `extractSonarIssues` must stay self-contained because it runs inside the SonarCloud page context.
- Any change to permissions or target sites must stay aligned between `manifest.json` and the injected logic.

## Editing Rules
- Prefer minimal, direct changes over framework-style abstractions.
- Preserve the current no-build setup unless a new build step is explicitly needed.
- Keep the popup accessible: ensure `popup.html` has a document language, a title, and a valid label for form controls.

## Validation
- Recheck the extension by loading it unpacked in Chrome and exercising the popup on a SonarCloud issue page.
- Use the Problems panel or file diagnostics to catch HTML or manifest issues before shipping.
- Verify any DOM selectors against the current SonarCloud page structure after edits.

## Documentation
- Use `README.md` for user-facing setup or usage notes.
- Link to docs instead of copying them into agent instructions when more detail is needed.