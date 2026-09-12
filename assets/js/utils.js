const dash = "-";

function val(id) {
  const el = document.getElementById(id);
  return el && el.value !== undefined ? el.value.trim() : "";
}

function orDash(str) {
  return str && str !== "" ? str : dash;
}

function formatDate(dateStr) {
  if (!dateStr) return dash;
  const parts = dateStr.split("-");
  if (parts.length !== 3) return dateStr;
  return `${parts[1]}/${parts[2]}/${parts[0]}`;
}

// Get exact current local date in YYYY-MM-DD format (prevents UTC evening offset bug)
function getTodayString() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function isToday(dateStr) {
  if (!dateStr) return false;
  return dateStr === getTodayString();
}

function getTeamsDate(dateStr) {
  if (!dateStr) return "[date]";
  const parts = dateStr.split("-");
  if (parts.length !== 3) return "[date]";

  const year = parseInt(parts[0], 10);
  const month = parseInt(parts[1], 10) - 1;
  const day = parseInt(parts[2], 10);

  const targetDate = new Date(year, month, day);
  targetDate.setHours(0, 0, 0, 0);

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const tomorrow = new Date(today);
  tomorrow.setDate(today.getDate() + 1);

  if (targetDate.getTime() === today.getTime()) {
    return "today";
  } else if (targetDate.getTime() === tomorrow.getTime()) {
    return "tomorrow";
  } else {
    const formatted = formatDate(dateStr);
    return formatted !== dash ? formatted : "[date]";
  }
}

// Always sets the field default to the local current date
function setTodayDate(id) {
  const el = document.getElementById(id);
  if (el) {
    el.value = getTodayString();
  }
}

function formatHours(h, m) {
  const hours = parseInt(h, 10) || 0;
  const mins = parseInt(m, 10) || 0;
  if (hours === 0 && mins === 0) return dash;
  return `${hours}h ${mins}m`;
}

function formatHighlightHTML(nameText) {
  if (!nameText || nameText === "-" || nameText.startsWith("[")) {
    return nameText;
  }
  return `<span style="font-size: 1.4em; font-weight: bold; color: #000000; background-color: #e8f0fe; padding: 1px 4px; border-radius: 3px;">${nameText}</span>`;
}

function showFeedback(el, msg) {
  if (!el) return;
  el.textContent = msg;
  el.style.display = "block";
  setTimeout(() => { el.style.display = "none"; }, 2500);
}

function copyText(inputEl, feedbackEl, generateFn) {
  if (generateFn) generateFn();
  if (!inputEl) return;

  const textToCopy = inputEl.value !== undefined ? inputEl.value : inputEl.innerText;
  if (navigator.clipboard) {
    navigator.clipboard.writeText(textToCopy).then(() => {
      showFeedback(feedbackEl, "Copied Note!");
    }).catch(() => {
      fallbackCopyText(inputEl, feedbackEl);
    });
  } else {
    fallbackCopyText(inputEl, feedbackEl);
  }
}

function fallbackCopyText(inputEl, feedbackEl) {
  if (!inputEl) return;
  if (inputEl.select) {
    inputEl.select();
  } else {
    const range = document.createRange();
    range.selectNodeContents(inputEl);
    const sel = window.getSelection();
    sel.removeAllRanges();
    sel.addRange(range);
  }
  document.execCommand("copy");
  showFeedback(feedbackEl, "Copied Note!");
}

async function copyTeamsRichText(htmlString, plainString, feedbackEl) {
  if (navigator.clipboard && window.ClipboardItem) {
    try {
      const htmlBlob = new Blob([htmlString], { type: "text/html" });
      const textBlob = new Blob([plainString], { type: "text/plain" });

      await navigator.clipboard.write([
        new ClipboardItem({
          "text/html": htmlBlob,
          "text/plain": textBlob
        })
      ]);
      showFeedback(feedbackEl, "Copied formatted message for Teams!");
      return;
    } catch (err) {
      console.warn("Clipboard API fallback execution...", err);
    }
  }

  const hiddenDiv = document.createElement("div");
  hiddenDiv.innerHTML = htmlString;
  hiddenDiv.style.position = "fixed";
  hiddenDiv.style.left = "-9999px";
  document.body.appendChild(hiddenDiv);

  const range = document.createRange();
  range.selectNodeContents(hiddenDiv);
  const selection = window.getSelection();
  selection.removeAllRanges();
  selection.addRange(range);

  document.execCommand("copy");
  selection.removeAllRanges();
  document.body.removeChild(hiddenDiv);

  showFeedback(feedbackEl, "Copied for Teams!");
}