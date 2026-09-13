const dash = "-";

function val(id) {
  const el = document.getElementById(id);
  return el && el.value !== undefined ? el.value.trim() : "";
}

function orDash(str) {
  return str && str !== "" ? str : dash;
}

/* =========================================
   Interactive Multi-Date Calendar Class
   ========================================= */
class MultiDateCalendar {
  constructor(containerId, onChangeCallback) {
    this.container = typeof containerId === "string" ? document.getElementById(containerId) : containerId;
    this.onChangeCallback = onChangeCallback;

    // Default pre-select today's local date
    const todayStr = getTodayString();
    this.selectedDates = new Set([todayStr]);

    const today = new Date();
    this.currentViewDate = new Date(today.getFullYear(), today.getMonth(), 1);

    this.render();
  }

  getSelectedDates() {
    return Array.from(this.selectedDates).sort();
  }

  render() {
    if (!this.container) return;
    this.container.innerHTML = "";

    const year = this.currentViewDate.getFullYear();
    const month = this.currentViewDate.getMonth();

    const wrapper = document.createElement("div");
    wrapper.className = "calendar-container";

    const header = document.createElement("div");
    header.className = "calendar-header";

    const prevBtn = document.createElement("button");
    prevBtn.type = "button";
    prevBtn.innerHTML = "&#8249;";
    prevBtn.className = "cal-nav-btn";
    prevBtn.addEventListener("click", (e) => {
      e.preventDefault();
      this.currentViewDate.setMonth(this.currentViewDate.getMonth() - 1);
      this.render();
    });

    const monthLabel = document.createElement("span");
    monthLabel.className = "month-label";
    monthLabel.style.fontWeight = "bold";
    monthLabel.textContent = this.currentViewDate.toLocaleString("default", { month: "long", year: "numeric" });

    const nextBtn = document.createElement("button");
    nextBtn.type = "button";
    nextBtn.innerHTML = "&#8250;";
    nextBtn.className = "cal-nav-btn";
    nextBtn.addEventListener("click", (e) => {
      e.preventDefault();
      this.currentViewDate.setMonth(this.currentViewDate.getMonth() + 1);
      this.render();
    });

    header.appendChild(prevBtn);
    header.appendChild(monthLabel);
    header.appendChild(nextBtn);
    wrapper.appendChild(header);

    const grid = document.createElement("div");
    grid.className = "calendar-grid";

    const dayLabels = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    dayLabels.forEach((label) => {
      const headerCell = document.createElement("div");
      headerCell.className = "day-header";
      headerCell.textContent = label;
      grid.appendChild(headerCell);
    });

    const firstDayIndex = new Date(year, month, 1).getDay();
    const totalDaysInMonth = new Date(year, month + 1, 0).getDate();

    for (let i = 0; i < firstDayIndex; i++) {
      const emptyCell = document.createElement("div");
      emptyCell.className = "date-cell empty";
      grid.appendChild(emptyCell);
    }

    for (let day = 1; day <= totalDaysInMonth; day++) {
      const monthFormatted = String(month + 1).padStart(2, "0");
      const dayFormatted = String(day).padStart(2, "0");
      const dateKey = `${year}-${monthFormatted}-${dayFormatted}`;

      const cell = document.createElement("div");
      cell.className = "date-cell";
      cell.textContent = day;

      if (this.selectedDates.has(dateKey)) {
        cell.classList.add("selected");
      }

      cell.addEventListener("click", () => {
        if (this.selectedDates.has(dateKey)) {
          this.selectedDates.delete(dateKey);
        } else {
          this.selectedDates.add(dateKey);
        }
        this.render();
        if (typeof this.onChangeCallback === "function") {
          this.onChangeCallback(this.getSelectedDates());
        }
      });

      grid.appendChild(cell);
    }

    wrapper.appendChild(grid);
    this.container.appendChild(wrapper);
  }
}

/* =========================================
   Date & Helper Utilities
   ========================================= */

function getTodayString() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function formatDate(dateStr) {
  if (!dateStr) return dash;
  const parts = dateStr.split("-");
  if (parts.length !== 3) return dateStr;
  return `${parts[1]}/${parts[2]}/${parts[0]}`;
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

function formatDateArrayForTeams(dateArray) {
  const validDates = dateArray.map((d) => d.trim()).filter(Boolean);
  if (validDates.length === 0) return "[date]";

  const formattedList = validDates.map((d) => getTeamsDate(d));

  if (formattedList.length === 1) return formattedList[0];
  if (formattedList.length === 2) return `${formattedList[0]} and ${formattedList[1]}`;

  const last = formattedList.pop();
  return `${formattedList.join(", ")}, and ${last}`;
}

function formatDateArrayForNote(dateArray) {
  const validDates = dateArray.map((d) => d.trim()).filter(Boolean);
  if (validDates.length === 0) return dash;

  const formattedList = validDates.map((d) => formatDate(d));
  return formattedList.join(", ");
}

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
  setTimeout(() => {
    el.style.display = "none";
  }, 2500);
}

function copyText(inputEl, feedbackEl, generateFn) {
  if (generateFn) generateFn();
  if (!inputEl) return;

  const textToCopy = inputEl.value !== undefined ? inputEl.value : inputEl.innerText;
  if (navigator.clipboard) {
    navigator.clipboard
      .writeText(textToCopy)
      .then(() => {
        showFeedback(feedbackEl, "Copied Note!");
      })
      .catch(() => {
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
          "text/plain": textBlob,
        }),
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