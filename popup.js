document.getElementById('extractBtn').addEventListener('click', async () => {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  const resultArea = document.getElementById('result');
  const btn = document.getElementById('extractBtn');

  // Verify we are on a supported SonarCloud or SonarQube issues page.
  if (!isSupportedIssuesPage(tab.url)) {
    resultArea.value = "Error: Please open a SonarCloud or SonarQube project issues page (/project/issues).";
    return;
  }

  btn.innerText = "Extracting...";

  // Inject and execute the extraction function in the active tab
  chrome.scripting.executeScript({
    target: { tabId: tab.id },
    func: extractSonarIssues
  }, (results) => {
    if (chrome.runtime.lastError || !results?.[0]?.result) {
      resultArea.value = `Error: ${chrome.runtime.lastError?.message ?? "Could not extract issues from the page."}`;
      btn.innerText = "Generate & Copy Prompt";
      return;
    }

    const promptText = results[0].result;
    resultArea.value = promptText;

    // Copy to clipboard
    navigator.clipboard.writeText(promptText).then(() => {
      btn.innerText = "Copied to Clipboard! ✓";
      btn.style.backgroundColor = "#16a34a"; // Green success color
      setTimeout(() => {
        btn.innerText = "Generate & Copy Prompt";
        btn.style.backgroundColor = "#2563eb";
      }, 3000);
    }).catch(() => {
      btn.innerText = "Generate & Copy Prompt";
    });
  });
});

function isSupportedIssuesPage(pageUrl) {
  try {
    const url = new URL(pageUrl);
    return url.pathname === "/project/issues";
  } catch {
    return false;
  }
}

// --- THIS FUNCTION RUNS INSIDE THE SONARCLOUD WEBPAGE ---
function extractSonarIssues() {
  let prompt = "I need to fix the following SonarCloud issues in my codebase. Please provide the corrected code for each:\n\n";
  let issueCount = 0;
  const issuesByFile = {};

  // Find all individual issue items
  const issueNodes = document.querySelectorAll('li[data-component="issue"]');

  issueNodes.forEach(node => {
    // 1. Extract the issue message
    // It is stored in an anchor tag pointing to the issue link
    const messageNode = node.querySelector('a[href*="/project/issues"]');
    const message = messageNode ? messageNode.innerText.trim() : "Unknown Issue";

    // 2. Extract the line number
    // It's in a list item starting with "L" (e.g., "L520")
    let line = "Unknown Line";
    const metaListNodes = node.querySelectorAll('li[data-component="issue-meta-li"]');
    metaListNodes.forEach(meta => {
      const text = meta.innerText.trim();
      if (/^L\d+$/.test(text)) {
        line = text;
      }
    });

    // 3. Extract the file name
    // SonarCloud links the issue group `ul` to the file header `li` via aria-labelledby
    let file = "Unknown File";
    const parentUl = node.closest('ul[aria-labelledby]');
    if (parentUl) {
      const headerId = parentUl.getAttribute('aria-labelledby');
      const headerNode = document.getElementById(headerId);
      if (headerNode) {
        // The file name is usually inside a span with class 'fs-mask' and a title attribute
        const fileNode = headerNode.querySelector('.fs-mask[title]');
        if (fileNode) {
          file = fileNode.getAttribute('title');
        } else {
          // Fallback if the DOM structure changes slightly
          file = headerNode.innerText.trim();
        }
      }
    }

    // Group the issues by their file path
    if (!issuesByFile[file]) {
      issuesByFile[file] = [];
    }
    issuesByFile[file].push({ message, line });
    issueCount++;
  });

  if (issueCount === 0) {
    return "Could not detect issues automatically. Please ensure the page has fully loaded and issues are visible.";
  }

  // Format the grouped issues into a clean Markdown prompt
  for (const [file, issues] of Object.entries(issuesByFile)) {
    prompt += `### File: \`${file}\`\n`;
    issues.forEach(issue => {
      prompt += `- **${issue.line}**: ${issue.message}\n`;
    });
    prompt += `\n`;
  }

  return prompt;
}