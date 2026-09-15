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
        boldLabel("Visit Details"),
        `${boldLabel("Date")} ${date} | ${boldLabel("Time")} ${time} | ${boldLabel("Priority")} ${priority}`,
        `${boldLabel("Staff Name")} ${rawStaff}`,
        "",
        boldLabel("NAD Steps Completed"),
        `${boldLabel("Staff reported NAD")} ${staffReported}`,
        `${boldLabel("Address verified with staff")} ${addressVerified}`,
        `${boldLabel("Entry instructions followed, if applicable")} ${entryInstructions}`,
        `${boldLabel("Staff waited 15 minutes")} ${waited15}${nadDesc ? ` - ${nadDesc}` : ""}`,
        "",
        boldLabel("Client Contact Attempt"),
        `${boldLabel("Client called")} ${clientCalled}`,
        `${boldLabel("Outcome")} ${clientOutcome}${clientDesc ? ` - ${clientDesc}` : ""}`,
        "",
        boldLabel("Contacts Called"),
        c1Line,
        c2Line,
        "",
        boldLabel("ALA Notification"),
        `${boldLabel("ALA notified")} ${alaNotified} | ${boldLabel("ALA office/site notified")} ${alaOffice}`,
        `${boldLabel("Method")} ${alaMethod}`
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
        `${boldLabel("Date")} ${date} | ${boldLabel("Staff Name")} ${rawStaff}`,
        `${boldLabel("Number of visits returned")} ${numVisits}`,
        `${boldLabel("Total hours returned")} ${hoursReturned}`,
        `${boldLabel("Keyword/Reason")} ${keyword}`,
        `${boldLabel("Client(s)")} ${rawClients}`,
        `${boldLabel("Description")} ${description}`
      ].join("\n");
    }

    const tDate = getTeamsDate(rawDate);
    const tKeyword = keyword !== dash ? keyword : "[keyword]";
    const tVisits = numVisits !== dash ? `${numVisits}` : "[number of]";

    const teamsHTML = `Staff ${htmlStaff} returned visit for ${htmlClients} ${tDate}, ${tKeyword}. ${tVisits} back to planner.`;
    const teamsPlain = `Staff ${rawStaff} returned visit for ${rawClients} ${tDate}, ${tKeyword}. ${tVisits} back to planner.`;

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
        `${boldLabel("Date")} ${date} | ${boldLabel("Staff Name")} ${rawStaff}`,
        rawClients ? `${boldLabel("Client(s)")} ${rawClients}` : "",
        `${boldLabel("Number of visits")} ${numVisits}`,
        `${boldLabel("Total hours returned")} ${hoursReturned}`,
        `${boldLabel("Keyword/Reason")} ${keyword}`,
        `${boldLabel("Description")} ${description}`
      ].filter(Boolean).join("\n");
    }

    const tDate = getTeamsDate(rawDate);
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