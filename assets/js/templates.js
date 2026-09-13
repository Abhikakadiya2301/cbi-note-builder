document.addEventListener("DOMContentLoaded", () => {
  if (document.getElementById("nadForm") || document.getElementById("nadTemplateForm")) initNad();
  if (document.getElementById("returnedVisitsForm")) initReturnedVisits();
  if (document.getElementById("bookOffForm")) initBookOff();
});

/* Helper to setup popover multi-date picker */
function setupCalendarPopover(inputId, toggleBtnId, containerId, onDateChange) {
  const input = document.getElementById(inputId);
  const toggleBtn = document.getElementById(toggleBtnId);
  const container = document.getElementById(containerId);

  if (!input || !container) return null;

  const calendar = new MultiDateCalendar(containerId, (selectedDates) => {
    input.value = formatDateArrayForNote(selectedDates);
    onDateChange(selectedDates);
  });

  // Set default date in text input immediately on load
  const initialDates = calendar.getSelectedDates();
  input.value = formatDateArrayForNote(initialDates);

  function toggleCalendar(e) {
    e.preventDefault();
    e.stopPropagation();
    const isHidden = container.style.display === "none" || container.style.display === "";
    container.style.display = isHidden ? "block" : "none";
  }

  if (toggleBtn) toggleBtn.addEventListener("click", toggleCalendar);
  input.addEventListener("click", toggleCalendar);

  document.addEventListener("click", (e) => {
    if (
      container.style.display !== "none" &&
      !container.contains(e.target) &&
      e.target !== input &&
      e.target !== toggleBtn &&
      !toggleBtn?.contains(e.target)
    ) {
      container.style.display = "none";
    }
  });

  return calendar;
}

/* =========================================
   NAD Engine
   ========================================= */
function initNad() {
  const form = document.getElementById("nadForm") || document.getElementById("nadTemplateForm");
  const noteOut = document.getElementById("noteOutput");
  const teamsOut = document.getElementById("teamsOutput");
  const feedback = document.getElementById("copyFeedback");

  function generate() {
    const rawDate = val("visitDate");
    const date = formatDate(rawDate);
    const time = orDash(val("visitTime"));
    const priority = orDash(val("priority"));
    const rawStaff = orDash(val("staffName"));
    const htmlStaff = formatHighlightHTML(rawStaff);
    const rawClients = orDash(val("clients"));
    const htmlClients = formatHighlightHTML(rawClients);

    const staffReported = orDash(val("staffReported"));
    const addressVerified = orDash(val("addressVerified"));
    const entryInstructions = orDash(val("entryInstructions"));
    const waited15 = orDash(val("waited15"));
    const nadDesc = val("nadDesc") || val("description");

    const clientCalled = orDash(val("clientCalled"));
    const clientOutcome = orDash(val("clientOutcome"));
    const clientDesc = val("clientDesc");

    const c1Name = val("c1Name");
    const c1Outcome = val("c1Outcome");
    const c1Desc = val("c1Desc");

    const c2Name = val("c2Name");
    const c2Outcome = val("c2Outcome");
    const c2Desc = val("c2Desc");

    const alaNotified = orDash(val("alaNotified"));
    const alaOffice = orDash(val("alaOffice"));
    const alaMethod = orDash(val("alaMethod"));

    const c1Line = (c1Name || c1Outcome || c1Desc)
      ? `1. ${orDash(c1Name)} – ${orDash(c1Outcome)}${c1Desc ? ` - ${c1Desc}` : ""}`
      : "1. -";

    const c2Line = (c2Name || c2Outcome || c2Desc)
      ? `2. ${orDash(c2Name)} – ${orDash(c2Outcome)}${c2Desc ? ` - ${c2Desc}` : ""}`
      : "2. -";

    if (noteOut) {
      noteOut.value = [
        "Title - NAD",
        "",
        "Visit Details:",
        `Date: ${date} | Time: ${time} | Priority: ${priority}`,
        `Staff Name: ${rawStaff}`,
        "",
        "NAD Steps Completed:",
        `Staff reported NAD: ${staffReported}`,
        `Address verified with staff: ${addressVerified}`,
        `Entry instructions followed, if applicable: ${entryInstructions}`,
        `Staff waited 15 minutes: ${waited15}${nadDesc ? ` - ${nadDesc}` : ""}`,
        "",
        "Client Contact Attempt:",
        `Client called: ${clientCalled}`,
        `Outcome: ${clientOutcome}${clientDesc ? ` - ${clientDesc}` : ""}`,
        "",
        "Contacts Called:",
        c1Line,
        c2Line,
        "",
        "ALA Notification:",
        `ALA notified: ${alaNotified} | ALA office/site notified: ${alaOffice}`,
        `Method: ${alaMethod}`
      ].join("\n");
    }

    const tDate = getTeamsDate(rawDate);
    const teamsHTML = `Staff ${htmlStaff} reported NAD for client ${htmlClients} ${tDate}.`;
    const teamsPlain = `Staff ${rawStaff} reported NAD for client ${rawClients} ${tDate}.`;

    if (teamsOut) {
      if (teamsOut.tagName === "TEXTAREA" || teamsOut.tagName === "INPUT") {
        teamsOut.value = teamsPlain;
      } else {
        teamsOut.innerHTML = teamsHTML;
        teamsOut.dataset.plainText = teamsPlain;
      }
    }
  }

  setTodayDate("visitDate");

  if (form) {
    form.addEventListener("input", generate);
    form.addEventListener("change", generate);
  }

  const copyNoteBtn = document.getElementById("copyNoteBtn");
  if (copyNoteBtn) {
    copyNoteBtn.addEventListener("click", () => copyText(noteOut, feedback, generate));
  }

  const copyTeamsBtn = document.getElementById("copyTeamsBtn");
  if (copyTeamsBtn) {
    copyTeamsBtn.addEventListener("click", () => {
      generate();
      if (!teamsOut) return;
      const htmlContent = teamsOut.innerHTML || teamsOut.value;
      const plainContent = teamsOut.dataset ? teamsOut.dataset.plainText : teamsOut.value;
      copyTeamsRichText(htmlContent, plainContent, feedback);
    });
  }

  generate();
}

/* =========================================
   Returned Visits Engine (Popover Multi-Date)
   ========================================= */
function initReturnedVisits() {
  const form = document.getElementById("returnedVisitsForm");
  const noteOut = document.getElementById("noteOutput");
  const teamsOut = document.getElementById("teamsOutput");
  const feedback = document.getElementById("copyFeedback");

  const calendar = setupCalendarPopover("rvDateInput", "rvCalToggleBtn", "rvCalendarContainer", () => {
    generate();
  });

  function generate() {
    const selectedDates = calendar ? calendar.getSelectedDates() : [getTodayString()];
    const dateNoteDisplay = formatDateArrayForNote(selectedDates);
    const dateTeamsDisplay = formatDateArrayForTeams(selectedDates);

    const rawStaff = orDash(val("staffName"));
    const htmlStaff = formatHighlightHTML(rawStaff);

    const numVisits = orDash(val("numVisits"));
    const hoursReturned = formatHours(val("hoursReturned"), val("minutesReturned"));
    const keyword = orDash(val("keyword"));

    const rawClients = orDash(val("clients"));
    const htmlClients = formatHighlightHTML(rawClients);

    const description = val("description");

    if (noteOut) {
      noteOut.value = [
        "Title - Returned Visits Book Off",
        `Date: ${dateNoteDisplay} | Staff Name: ${rawStaff}`,
        `Number of visits returned: ${numVisits}`,
        `Total hours returned: ${hoursReturned}`,
        `Keyword/Reason: ${keyword}`,
        `Client(s): ${rawClients}`,
        `Description: ${description}`
      ].join("\n");
    }

    const tKeyword = keyword !== dash ? keyword : "[keyword]";
    const tVisits = numVisits !== dash ? `${numVisits}` : "[number of]";

    const teamsHTML = `Staff ${htmlStaff} returned visit for ${htmlClients} ${dateTeamsDisplay}, ${tKeyword}. ${tVisits} back to planner.`;
    const teamsPlain = `Staff ${rawStaff} returned visit for ${rawClients} ${dateTeamsDisplay}, ${tKeyword}. ${tVisits} back to planner.`;

    if (teamsOut) {
      if (teamsOut.tagName === "TEXTAREA" || teamsOut.tagName === "INPUT") {
        teamsOut.value = teamsPlain;
      } else {
        teamsOut.innerHTML = teamsHTML;
        teamsOut.dataset.plainText = teamsPlain;
      }
    }
  }

  if (form) {
    form.addEventListener("input", generate);
    form.addEventListener("change", generate);
  }

  const copyNoteBtn = document.getElementById("copyNoteBtn");
  if (copyNoteBtn) {
    copyNoteBtn.addEventListener("click", () => copyText(noteOut, feedback, generate));
  }

  const copyTeamsBtn = document.getElementById("copyTeamsBtn");
  if (copyTeamsBtn) {
    copyTeamsBtn.addEventListener("click", () => {
      generate();
      if (!teamsOut) return;
      const htmlContent = teamsOut.innerHTML || teamsOut.value;
      const plainContent = teamsOut.dataset ? teamsOut.dataset.plainText : teamsOut.value;
      copyTeamsRichText(htmlContent, plainContent, feedback);
    });
  }

  generate();
}

/* =========================================
   Book Off Engine (Popover Multi-Date)
   ========================================= */
document.addEventListener("DOMContentLoaded", function () {
  if (document.getElementById("staffBookOffForm")) {
    initStaffBookOff();
  }
});

function initStaffBookOff() {
  const form = document.getElementById("staffBookOffForm");
  const noteOut = document.getElementById("noteOutput");
  const teamsOut = document.getElementById("teamsOutput");
  const feedback = document.getElementById("copyFeedback");

  const getFieldValue = (id) => {
    const el = document.getElementById(id);
    return el ? el.value.trim() : "";
  };

  const dashChar = "-";
  const getOrDashVal = (v) => (v && v !== "" ? v : dashChar);

  let calendarInstance = null;
  if (typeof setupCalendarPopover === "function") {
    calendarInstance = setupCalendarPopover(
      "boDateInput",
      "boCalToggleBtn",
      "boCalendarContainer",
      function () {
        generateNote();
      }
    );
  }

  function generateNote() {
    let dates = [];
    if (calendarInstance && typeof calendarInstance.getSelectedDates === "function") {
      dates = calendarInstance.getSelectedDates();
    }
    if (!dates || dates.length === 0) {
      const todayIso = new Date().toISOString().split("T")[0];
      dates = [todayIso];
    }

    const formattedDateNote = typeof formatDateArrayForNote === "function"
      ? formatDateArrayForNote(dates)
      : dates.join(", ");

    const formattedDateTeams = typeof formatDateArrayForTeams === "function"
      ? formatDateArrayForTeams(dates)
      : dates.join(", ");

    const durationType = getFieldValue("bookOffType") || "Full Day";
    const rawStaffName = getOrDashVal(getFieldValue("staffName"));
    const htmlStaffName = typeof formatHighlightHTML === "function" ? formatHighlightHTML(rawStaffName) : rawStaffName;

    const visitsCount = getOrDashVal(getFieldValue("numVisits"));
    const hrsVal = getFieldValue("hoursReturned");
    const minsVal = getFieldValue("minutesReturned");
    const totalHoursStr = typeof formatHours === "function" ? formatHours(hrsVal, minsVal) : `${hrsVal || 0}h ${minsVal || 0}m`;
    const keywordStr = getOrDashVal(getFieldValue("keyword"));

    const rawClientsStr = getOrDashVal(getFieldValue("clients"));
    const htmlClientsStr = typeof formatHighlightHTML === "function" ? formatHighlightHTML(rawClientsStr) : rawClientsStr;

    const descStr = getFieldValue("description");

    if (noteOut) {
      noteOut.value = [
        `Title: Staff Book Off (${durationType})`,
        `Date: ${formattedDateNote} | Staff Name: ${rawStaffName}`,
        `Number of visits affected: ${visitsCount}`,
        `Total hours: ${totalHoursStr}`,
        `Keyword/Reason: ${keywordStr}`,
        `Client(s): ${rawClientsStr}`,
        `Description: ${descStr}`
      ].join("\n");
    }

    const tKeyword = keywordStr !== dashChar ? keywordStr : "[keyword]";
    const tVisits = visitsCount !== dashChar ? `${visitsCount}` : "[number of]";

    const teamsHTML = `Staff ${htmlStaffName} booked off (${durationType.toLowerCase()}) for ${formattedDateTeams} for ${htmlClientsStr}, ${tKeyword}. ${tVisits} visits returned to planner.`;
    const teamsPlain = `Staff ${rawStaffName} booked off (${durationType.toLowerCase()}) for ${formattedDateTeams} for ${rawClientsStr}, ${tKeyword}. ${tVisits} visits returned to planner.`;

    if (teamsOut) {
      if (teamsOut.tagName === "TEXTAREA" || teamsOut.tagName === "INPUT") {
        teamsOut.value = teamsPlain;
      } else {
        teamsOut.innerHTML = teamsHTML;
        teamsOut.dataset.plainText = teamsPlain;
      }
    }
  }

  if (form) {
    form.addEventListener("input", generateNote);
    form.addEventListener("change", generateNote);
  }

  const copyNoteBtn = document.getElementById("copyNoteBtn");
  if (copyNoteBtn) {
    copyNoteBtn.addEventListener("click", function () {
      if (typeof copyText === "function") {
        copyText(noteOut, feedback, generateNote);
      }
    });
  }

  const copyTeamsBtn = document.getElementById("copyTeamsBtn");
  if (copyTeamsBtn) {
    copyTeamsBtn.addEventListener("click", function () {
      generateNote();
      if (!teamsOut) return;
      const htmlContent = teamsOut.innerHTML || teamsOut.value;
      const plainContent = teamsOut.dataset ? teamsOut.dataset.plainText : teamsOut.value;
      if (typeof copyTeamsRichText === "function") {
        copyTeamsRichText(htmlContent, plainContent, feedback);
      }
    });
  }

  generateNote();
}