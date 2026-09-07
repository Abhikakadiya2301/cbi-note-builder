document.addEventListener("DOMContentLoaded", () => {
  if (document.getElementById("returnedVisitsForm")) initReturnedVisits();
  if (document.getElementById("bookOffForm")) initBookOff();
});

// Helper: Formats staff & client names into 2x larger bold HTML text for Teams pasting
function formatHighlightHTML(nameText) {
  if (!nameText || nameText === "-" || nameText.startsWith("[")) {
    return nameText;
  }
  // Renders 1.4x-2x larger, bold, with a soft background highlight for MS Teams
  return `<span style="font-size: 1.4em; font-weight: bold; color: #000000; background-color: #e8f0fe; padding: 1px 4px; border-radius: 3px;">${nameText}</span>`;
}

// Helper: Async Clipboard copy that writes both HTML (for Teams) and Plain Text
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
      console.warn("Clipboard API failed, attempting fallback copy...", err);
    }
  }

  // Fallback for older browsers
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

function showFeedback(el, msg) {
  if (!el) return;
  el.textContent = msg;
  el.style.display = "block";
  setTimeout(() => { el.style.display = "none"; }, 2500);
}

/* =========================================
   Returned Visits Engine
   ========================================= */
function initReturnedVisits() {
  const form = document.getElementById("returnedVisitsForm");
  const noteOut = document.getElementById("noteOutput");
  const teamsOut = document.getElementById("teamsOutput");
  const feedback = document.getElementById("copyFeedback");

  function generate() {
    const rawDate = val("visitDate");
    const date = formatDate(rawDate);

    const rawStaff = orDash(val("staffName"));
    const htmlStaff = formatHighlightHTML(rawStaff);

    const numVisits = orDash(val("numVisits"));
    const hoursReturned = formatHours(val("hoursReturned"), val("minutesReturned"));
    const keyword = orDash(val("keyword"));

    const rawClients = orDash(val("clients"));
    const htmlClients = formatHighlightHTML(rawClients);

    const description = document.getElementById("description") ? document.getElementById("description").value : "";

    // Plain text version for standard Note copy
    if (noteOut) {
      noteOut.value = [
        "Title - Returned Visits Book Off",
        `Date: ${date} | Staff Name: ${rawStaff}`,
        `Number of visits returned: ${numVisits}`,
        `Total hours returned: ${hoursReturned}`,
        `Keyword/Reason: ${keyword}`,
        `Client(s): ${rawClients}`,
        `Description: ${description}`
      ].join("\n");
    }

    const tDate = isToday(rawDate) ? "today" : (date !== dash ? date : "[date]");
    const tKeyword = keyword !== dash ? keyword : "[keyword]";
    const tVisits = numVisits !== dash ? `${numVisits}` : "[number of]";

    // Teams Rich HTML output
    const teamsHTML = `Staff ${htmlStaff} returned visit for ${htmlClients} ${tDate}, ${tKeyword}. ${tVisits} back to planner.`;
    const teamsPlain = `Staff ${rawStaff} returned visit for ${rawClients} ${tDate}, ${tKeyword}. ${tVisits} back to planner.`;

    if (teamsOut) {
      teamsOut.innerHTML = teamsHTML;
      teamsOut.dataset.plainText = teamsPlain;
    }
  }

  setTodayDate("visitDate");
  form.addEventListener("input", generate);

  const copyNoteBtn = document.getElementById("copyNoteBtn");
  if (copyNoteBtn) {
    copyNoteBtn.addEventListener("click", () => copyText(noteOut, feedback, generate));
  }

  const copyTeamsBtn = document.getElementById("copyTeamsBtn");
  if (copyTeamsBtn) {
    copyTeamsBtn.addEventListener("click", () => {
      generate();
      copyTeamsRichText(teamsOut.innerHTML, teamsOut.dataset.plainText, feedback);
    });
  }

  generate();
}

/* =========================================
   Book Off Engine
   ========================================= */
function initBookOff() {
  const form = document.getElementById("bookOffForm");
  const noteOut = document.getElementById("noteOutput");
  const teamsOut = document.getElementById("teamsOutput");
  const feedback = document.getElementById("copyFeedback");

  function generate() {
    const rawDate = val("visitDate");
    const date = formatDate(rawDate);

    const rawType = val("bookOffType");
    const typeTitle = rawType === "full day" ? "Full Day" : (rawType === "partial day" ? "Partial Day" : "Partial/Full Day");

    const rawStaff = orDash(val("staffName"));
    const htmlStaff = formatHighlightHTML(rawStaff);

    const rawClients = val("clients") ? orDash(val("clients")) : "";
    const htmlClients = rawClients ? formatHighlightHTML(rawClients) : "";

    const numVisits = orDash(val("numVisits"));
    const hoursReturned = formatHours(val("hoursReturned"), val("minutesReturned"));
    const keyword = orDash(val("keyword"));
    const description = document.getElementById("description") ? document.getElementById("description").value : "";

    // Plain text for CRM/system note
    if (noteOut) {
      noteOut.value = [
        `Title - Staff Book Off (${typeTitle})`,
        `Date: ${date} | Staff Name: ${rawStaff}`,
        rawClients ? `Client(s): ${rawClients}` : "",
        `Number of visits: ${numVisits}`,
        `Total hours returned: ${hoursReturned}`,
        `Keyword/Reason: ${keyword}`,
        `Description: ${description}`
      ].filter(Boolean).join("\n");
    }

    const tDate = isToday(rawDate) ? "today" : (date !== dash ? date : "[date]");
    const tType = rawType || "[full day/partial day]";
    const tKeyword = keyword !== dash ? keyword : "[keyword]";
    const tVisits = numVisits !== dash ? `${numVisits} visit(s)` : "[No of] visits";
    const clientClause = htmlClients ? ` for client ${htmlClients}` : "";
    const clientPlainClause = rawClients ? ` for client ${rawClients}` : "";

    // Teams Rich HTML output
    const teamsHTML = `Staff ${htmlStaff} booked off for ${tDate} for ${tType}${clientClause} because of ${tKeyword}. ${tVisits} back to planner.`;
    const teamsPlain = `Staff ${rawStaff} booked off for ${tDate} for ${tType}${clientPlainClause} because of ${tKeyword}. ${tVisits} back to planner.`;

    if (teamsOut) {
      teamsOut.innerHTML = teamsHTML;
      teamsOut.dataset.plainText = teamsPlain;
    }
  }

  setTodayDate("visitDate");
  form.addEventListener("input", generate);

  const copyNoteBtn = document.getElementById("copyNoteBtn");
  if (copyNoteBtn) {
    copyNoteBtn.addEventListener("click", () => copyText(noteOut, feedback, generate));
  }

  const copyTeamsBtn = document.getElementById("copyTeamsBtn");
  if (copyTeamsBtn) {
    copyTeamsBtn.addEventListener("click", () => {
      generate();
      copyTeamsRichText(teamsOut.innerHTML, teamsOut.dataset.plainText, feedback);
    });
  }

  generate();
}