document.addEventListener("DOMContentLoaded", () => {
  if (document.getElementById("nadForm") || document.getElementById("nadTemplateForm")) initNad();
  if (document.getElementById("returnedVisitsForm")) initReturnedVisits();
  if (document.getElementById("bookOffForm")) initBookOff();
});

/* =========================================
   NAD (No Answer at Door) Engine
   ========================================= */
function initNad() {
  const form = document.getElementById("nadForm") || document.getElementById("nadTemplateForm");
  const noteOut = document.getElementById("noteOutput");
  const teamsOut = document.getElementById("teamsOutput");
  const feedback = document.getElementById("copyFeedback");

  function generate() {
    // 01: Visit Details
    const rawDate = val("visitDate");
    const date = formatDate(rawDate);
    const time = orDash(val("visitTime"));
    const priority = orDash(val("priority"));
    const rawStaff = orDash(val("staffName"));
    const htmlStaff = formatHighlightHTML(rawStaff);
    const rawClients = orDash(val("clients"));
    const htmlClients = formatHighlightHTML(rawClients);

    // 02: NAD Steps Completed
    const staffReported = orDash(val("staffReported"));
    const addressVerified = orDash(val("addressVerified"));
    const entryInstructions = orDash(val("entryInstructions"));
    const waited15 = orDash(val("waited15"));
    const nadDesc = val("nadDesc") || val("description");

    // 03: Client Contact Attempt
    const clientCalled = orDash(val("clientCalled"));
    const clientOutcome = orDash(val("clientOutcome"));
    const clientDesc = val("clientDesc");

    // 04: Contacts Called
    const c1Name = val("c1Name");
    const c1Outcome = val("c1Outcome");
    const c1Desc = val("c1Desc");

    const c2Name = val("c2Name");
    const c2Outcome = val("c2Outcome");
    const c2Desc = val("c2Desc");

    // 05: ALA Notification
    const alaNotified = orDash(val("alaNotified"));
    const alaOffice = orDash(val("alaOffice"));
    const alaMethod = orDash(val("alaMethod"));

    // Line Formatter Helpers
    const c1Line = (c1Name || c1Outcome || c1Desc)
      ? `1. ${orDash(c1Name)} – ${orDash(c1Outcome)}${c1Desc ? ` - ${c1Desc}` : ""}`
      : "1. -";

    const c2Line = (c2Name || c2Outcome || c2Desc)
      ? `2. ${orDash(c2Name)} – ${orDash(c2Outcome)}${c2Desc ? ` - ${c2Desc}` : ""}`
      : "2. -";

    // Build Procura Note
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

    // Build Teams Output
    const tDate = isToday(rawDate) ? "today" : (date !== dash ? date : "[date]");
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

    const description = val("description");

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

    const teamsHTML = `Staff ${htmlStaff} returned visit for ${htmlClients} ${tDate}, ${tKeyword}. ${tVisits} back to planner.`;
    const teamsPlain = `Staff ${rawStaff} returned visit for ${rawClients} ${tDate}.`;

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
    const description = val("description");

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

    const teamsHTML = `Staff ${htmlStaff} booked off for ${tDate} for ${tType}${clientClause} because of ${tKeyword}. ${tVisits} back to planner.`;
    const teamsPlain = `Staff ${rawStaff} booked off for ${tDate} for ${tType}${clientPlainClause} because of ${tKeyword}. ${tVisits} back to planner.`;

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