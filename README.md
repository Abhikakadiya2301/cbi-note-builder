# ⚡ CBI Note Builder

## 📖 Why This Tool Was Built
As a **Care Access Representative**, I noticed how much time our team was spending typing out the exact same notes over and over again every single day. Writing these notes manually was repetitive, slow, and exhausting.

I wanted to make things easier for everyone on our team. So, I used my problem-solving skills to build this website! It handles the formatting for you so you can finish your notes in seconds instead of minutes.

---

## 🔒 100% Secure: Your Data Is Never Saved
Your privacy and patient safety come first. 

* **No Information Is Saved:** This tool runs **entirely inside your own web browser**. 
* **Zero Storage:** Nothing you type is saved to a server, database, or the internet. 
* **Complete Protection:** As soon as you refresh or close the web page, everything you typed completely disappears. Customer medical data stays 100% safe and secure on your computer.

---

## 📋 How to Use the Note Builder
Using the tool is super easy and fast:

1. **Pick a Template:** Choose the type of note you need to make (like *NAD*, *Book Off*, or *Returned Visits*).
2. **Fill in the Boxes:** Select options from the dropdown menus (like *Yes/No*) and fill in any quick details.
3. **Copy Your Note:** Click the **Copy Note** or **Copy Teams MSG** button.
4. **Paste and Go:** Paste the copied text straight into Procura or Microsoft Teams!

---

## 📁 Project Structure

```
cbi-note-builder/
├── index.html                    # Main template selector page
├── NAD.html                       # NAD (No Answer at Door) template
├── book-off-template.html         # Staff Book Off template
├── returned-visits-book-off.html  # Returned Visits template
├── README.md                      # This file
├── assets/
│   ├── css/
│   │   └── global.css            # Global styling for all templates
│   └── js/
│       ├── utils.js              # Utility functions (formatting, clipboard)
│       ├── templates.js          # Template generation engines
│       └── privacy-banner.js     # Privacy notice banner
└── .github/
    └── workflows/
        └── static.yml            # GitHub Pages deployment config
```

---

## 🎨 Design Philosophy: Apple-Inspired

The CBI Note Builder follows Apple's design principles:

- **Simplicity**: Clean, distraction-free interface focused on one task
- **Hierarchy**: Clear visual distinction between input and output sections
- **Consistency**: Unified design language across all three templates
- **Accessibility**: High contrast, readable typography, semantic HTML
- **Performance**: Zero external dependencies—runs entirely client-side

---

## 🛠️ Technical Details

### JavaScript Architecture

**utils.js** provides reusable utility functions:
- `val(id)` – Get trimmed input value
- `orDash(str)` – Return dash if value is empty
- `formatDate(dateStr)` – Convert YYYY-MM-DD to MM/DD/YYYY
- `getTodayString()` – Get local current date as YYYY-MM-DD
- `formatHours(h, m)` – Format hours and minutes display
- `boldLabel(label)` – Bold label formatting for plaintext
- `copyText(inputEl, feedbackEl, generateFn)` – Clipboard operations
- `copyTeamsRichText(htmlString, plainString, feedbackEl)` – Rich text copying

**templates.js** contains three independent note generation engines:
- `initNad()` – NAD template engine
- `initBookOff()` – Book Off template engine
- `initReturnedVisits()` – Returned Visits template engine

Each engine:
- Listens to form input/change events
- Generates plaintext Procura notes
- Generates Teams-formatted messages
- Updates output in real-time
- Handles clipboard operations

### CSS System

**global.css** uses CSS custom properties for theme switching:
```css
:root {
  --nad: #0e6e6b;          /* NAD theme color */
  --bookoff: #a15b1f;      /* Book Off theme color */
  --returned: #3a5a8c;     /* Returned Visits theme color */
}
```

Each template dynamically overrides `--accent` variables for consistent theming.

---

## ✨ Key Features

### Real-Time Generation
Notes update instantly as you type, with no lag or delay.

### Two Output Formats
- **Procura Note**: Plaintext format with bold labels for Procura system
- **Teams Message**: HTML-formatted, preview-optimized for Microsoft Teams

### Smart Date Handling
- Defaults to today's date (never UTC offset bugs)
- Shows "today" / "tomorrow" in Teams messages
- Formats as MM/DD/YYYY in notes

### Flexible Hours Formatting
Separate hours and minutes inputs combine into human-readable format (e.g., "2h 45m")

### Privacy-First Banner
Dismissible banner assures users that all data stays local—never uploaded.

---

## 🚀 Deployment

This project is configured for **GitHub Pages** automatic deployment:

1. Push to `main` branch
2. GitHub Actions runs `.github/workflows/static.yml`
3. Site deploys to GitHub Pages automatically

No build step required—static HTML/CSS/JS only.

---

## 🔧 Development Notes

### Adding a New Template

1. Create new HTML file (e.g., `new-template.html`)
2. Copy structure from existing template (NAD, Book Off, or Returned Visits)
3. Update theme colors in `<style>` section
4. Add form with unique ID (e.g., `id="newForm"`)
5. Implement generator function in `templates.js`:
   ```javascript
   function initNewTemplate() {
     const form = document.getElementById("newForm");
     // ... generation logic
   }
   ```
6. Register in DOMContentLoaded check:
   ```javascript
   if (document.getElementById("newForm")) initNewTemplate();
   ```
7. Add card link in `index.html`

### Modifying Note Output

Edit the generation logic in `templates.js`. Each engine constructs notes as arrays joined with `\n`:

```javascript
noteOut.value = [
  "Title - My Template",
  `${boldLabel("Field Name")} ${fieldValue}`,
  "",
  boldLabel("Section Header"),
  // ...
].join("\n");
```

---

## 📞 Support

For questions or issues:
1. Check browser console (F12) for JavaScript errors
2. Verify all form field IDs match those referenced in `templates.js`
3. Confirm CSS file path is correct
4. Test in incognito/private mode (rules out cache issues)

---

## 📝 Version History

**v1.0** (Current)
- Three template types (NAD, Book Off, Returned Visits)
- Real-time note generation
- Clipboard integration
- Privacy-focused design
- GitHub Pages deployment

---

## 📜 License & Author

Built with ❤️ by Abhishek (Care Access Representative)

This tool is designed for internal team use. All data stays in your browser.