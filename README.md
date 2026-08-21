# SonarCloud AI Prompter

A browser extension that extracts SonarCloud or SonarQube issues into a clean prompt you can paste into an AI coding assistant.
Made entirely with AI (Scaffolded by Gemini Pro, finished by Copilot-GPT 5.4m)

## What it does

- Reads the current SonarCloud or SonarQube issue page from the active tab when the path is `/project/issues`.
- Groups issues by file and line so the prompt is easier to act on.
- Copies the generated prompt to your clipboard.

## Install

### From source

1. Download or clone this repository.
2. Open Chrome and go to `chrome://extensions`.
3. Enable `Developer mode`.
4. Click `Load unpacked` and select the repository folder.

### From a release zip

1. Download the release asset from GitHub Releases.
2. Unzip it locally.
3. Load the extracted folder with `Load unpacked` in Chrome.

## Use

1. Open a SonarCloud or SonarQube project issues page.
2. Click the extension icon.
3. Press `Generate & Copy Prompt`.
4. Paste the copied prompt into your AI tool of choice.

## Validation (for devs)

Run the CI checks locally before PRing:

```powershell
node --check popup.js
node scripts/validate-extension.mjs
```

## Notes

- The extension accepts any host as long as the current page path is `/project/issues`.
- It requests `activeTab` and `scripting` so it can read the current page and inject the extractor.
- If SonarCloud changes its DOM, update the selectors in `popup.js` and re-run the sanity check. Please do a PR if you do it yourself.
