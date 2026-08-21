import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

async function loadJson(relativePath) {
  const content = await readFile(path.join(rootDir, relativePath), 'utf8');
  return JSON.parse(content);
}

async function loadText(relativePath) {
  return readFile(path.join(rootDir, relativePath), 'utf8');
}

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

const manifest = await loadJson('manifest.json');
const popupHtml = await loadText('popup.html');
const popupJs = await loadText('popup.js');

assert(manifest.manifest_version === 3, 'manifest.json must use Manifest V3.');
assert(manifest.action?.default_popup === 'popup.html', 'manifest.json must point to popup.html.');
assert(Array.isArray(manifest.permissions) && manifest.permissions.includes('activeTab'), 'manifest.json must request activeTab.');
assert(Array.isArray(manifest.permissions) && manifest.permissions.includes('scripting'), 'manifest.json must request scripting.');
assert(Array.isArray(manifest.host_permissions) && manifest.host_permissions.includes('*://sonarcloud.io/*'), 'manifest.json must target SonarCloud only.');

assert(/<html[^>]*lang="en"/i.test(popupHtml), 'popup.html must declare a document language.');
assert(/<title>Sonar AI Prompter<\/title>/i.test(popupHtml), 'popup.html must include a title.');
assert(/<label[^>]*for="result"/i.test(popupHtml), 'popup.html must label the result textarea.');
assert(/id="result"/i.test(popupHtml), 'popup.html must contain the result textarea.');
assert(/id="extractBtn"/i.test(popupHtml), 'popup.html must contain the extract button.');

assert(/function\s+isSupportedIssuesPage\s*\(/.test(popupJs), 'popup.js must define the supported issues page guard.');
assert(/pathname\s*===\s*["']\/project\/issues["']/.test(popupJs), 'popup.js must verify the current page path is /project/issues.');
assert(/function\s+extractSonarIssues\s*\(/.test(popupJs), 'popup.js must define extractSonarIssues.');
assert(/chrome\.scripting\.executeScript/.test(popupJs), 'popup.js must inject the extractor into the active tab.');

console.log('Extension validation passed.');