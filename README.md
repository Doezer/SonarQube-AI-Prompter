# Sonar AI Prompter

A small Chrome (Manifest V3) extension that turns the issues listed on a
SonarCloud or SonarQube **Issues** page into a clean, grouped prompt you can
paste into an AI coding assistant.

No build step, no dependencies, no accounts: load the folder unpacked and click
the icon.

## What it does

1. Open your project's issues page — any host, as long as the path is
   `/project/issues` (SonarCloud, or a self-hosted SonarQube at any domain).
2. Click the extension icon, then **Generate & Copy Prompt**.
3. The extension reads the issues rendered on that page, pulling out each one's
   message, its `L<line>` marker and the file it belongs to.
4. It groups them by file into a Markdown prompt — one `### File:` heading per
   file, one bullet per issue — shows it in the popup, and copies it to your
   clipboard in the same click.
5. Paste it into the AI tool of your choice.

### Privacy

Everything runs locally in your browser. The extension has no backend, makes no
network requests of its own, and sends nothing anywhere. The only data it
touches is the DOM of the tab you explicitly click it on.

## Requirements

- Chrome, Edge, Brave or another Chromium-based browser with Manifest V3
  support.
- A SonarCloud or SonarQube issues page whose path is exactly
  `/project/issues`. Other Sonar pages (rules, security hotspots, measures) are
  refused with an error in the popup.

Only Chromium browsers have been tested. The popup calls the `chrome.*`
extension APIs directly, so Firefox is untested and unsupported for now.

## Install

### From a release zip

1. Download the latest zip from [Releases](../../releases).
2. Unzip it somewhere you will keep it — Chrome loads the extension from that
   folder every start-up, so don't unzip it into a temp directory.
3. Open `chrome://extensions`, enable **Developer mode** (top-right toggle),
   click **Load unpacked** and select the extracted folder.

In PowerShell:

```powershell
Expand-Archive -Path "$HOME\Downloads\sonar-ai-prompter-v1.0.zip" -DestinationPath "$HOME\extensions\sonar-ai-prompter"
```

### From source

```powershell
git clone https://github.com/Doezer/SonarQube-AI-Prompter.git
```

Then **Load unpacked** the cloned folder as above.

## Known limitations

- **Only the issues currently on the page are captured.** Sonar paginates its
  issue list, so scroll to the bottom and use **Show more** until everything you
  care about is loaded before generating the prompt. Filter the list down first
  (by severity, by directory, by new code) if you want a focused prompt.
- **The generated prompt always says "SonarCloud issues"**, even when the
  issues came from a self-hosted SonarQube. It is wording in the prompt text
  only; the extraction itself works the same on both.
- **Sonar's DOM is not a public API.** The extractor matches Sonar's current
  `li[data-component="issue"]` structure. If Sonar redesigns the issues page the
  selectors in `popup.js` need updating — the popup will say it could not detect
  issues automatically. Pull requests for selector fixes are very welcome.
- The extension ships without its own toolbar icons, so the browser shows a
  generic placeholder icon for it.

## Repository layout

| Path | Purpose |
| --- | --- |
| `manifest.json` | Manifest V3 configuration. |
| `popup.html` | The popup UI. |
| `popup.js` | The page guard, the injected `extractSonarIssues` extractor, and the prompt formatting. |
| `scripts/validate-extension.mjs` | Sanity checks on the extension's shape, also run in CI. |
| `AGENTS.md` | Guidance for AI coding agents working in this repo. |

The extension is named **Sonar AI Prompter** in `manifest.json`; the repository
is `SonarQube-AI-Prompter`.

## Permissions, and why each is needed

| Permission | Why |
| --- | --- |
| `activeTab` + `scripting` | To read the DOM of the tab, only after you click the extension icon. |
| Host permissions | None are requested. `activeTab` grants access to just the tab you invoke the extension on, which is why it works on self-hosted SonarQube at any domain without you granting it broad site access. |

## Development

There is no build and no `node_modules`; the files in the repository are the
extension. Node.js 24 is what CI uses, but any recent Node runs the checks.

Run the same checks CI does before opening a pull request:

```powershell
node --check popup.js
node scripts/validate-extension.mjs
```

Then reload the unpacked extension in `chrome://extensions` and exercise the
popup against a real Sonar issues page — the validator checks the extension's
shape, not its selectors.

`.github/workflows/ci.yml` runs both commands on every push to `main` and every
pull request.

### Releasing

Push a `v*` tag (or run the workflow manually) and
`.github/workflows/release.yml` validates the extension, packages
`manifest.json`, `popup.html`, `popup.js` and `README.md` into
`sonar-ai-prompter-<tag>.zip`, and attaches it to the GitHub release.

## Contributing

Bug reports and feature requests are welcome — the issue templates under
[`.github/ISSUE_TEMPLATE`](.github/ISSUE_TEMPLATE) will prompt you for what is
needed. Selector fixes after a Sonar redesign are especially useful.

## Credits

Built entirely with AI assistance: scaffolded by Gemini Pro, finished with
GitHub Copilot.
