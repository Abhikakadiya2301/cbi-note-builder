document.addEventListener("DOMContentLoaded", function() {
    // Check if the user has already dismissed the notice this session
    if (!sessionStorage.getItem("privacyNoticeDismissed")) {

        // Create the banner container
        const noticeBanner = document.createElement("div");
        noticeBanner.id = "global-privacy-notice";

        // Define the CSS styling inline for global injection
        noticeBanner.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            background-color: #fef08a; /* Highlighting yellow */
            color: #854d0e; /* Dark contrasting text */
            text-align: center;
            padding: 10px 40px 10px 15px;
            font-family: system-ui, -apple-system, sans-serif;
            font-size: 14px;
            font-weight: 500;
            z-index: 9999;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
            display: flex;
            justify-content: center;
            align-items: center;
        `;

        // Inject the HTML content
        noticeBanner.innerHTML = `
            <span>🔒 <strong>Notice:</strong> Your data is safe. All processing happens locally in your browser, and no information is stored on our servers.</span>
            <button id="close-privacy-notice" style="
                position: absolute;
                right: 15px;
                background: none;
                border: none;
                color: #854d0e;
                font-size: 18px;
                cursor: pointer;
                font-weight: bold;
                padding: 0;
                line-height: 1;
            ">&times;</button>
        `;

        // Prepend to the body so it sits at the very top
        document.body.prepend(noticeBanner);

        // Push the rest of the body down so the banner doesn't cover the header
        document.body.style.paddingTop = noticeBanner.offsetHeight + "px";

        // Add close functionality
        document.getElementById("close-privacy-notice").addEventListener("click", function() {
            noticeBanner.style.display = "none";
            document.body.style.paddingTop = "0";
            // Remember the dismissal for the current browser session
            sessionStorage.setItem("privacyNoticeDismissed", "true");
        });
    }
});