(function () {
  if (window !== window.top) return; // Prevent running inside iframes (fixes extension error spam)
  if (document.getElementById("fd-host")) return;

  // ========================================
  // 1. CREATE THE WIDGET (all inline styles)
  // ========================================
  const host = document.createElement("div");
  host.id = "fd-host";
  host.setAttribute("style", `
    position: fixed !important;
    top: 50% !important;
    right: 0 !important;
    transform: translateY(-50%) !important;
    z-index: 2147483647 !important;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif !important;
  `);

  // -- Toggle Tab (collapsed state) --
  const tab = document.createElement("div");
  tab.id = "fd-tab";
  tab.title = "FounderDeck";
  tab.setAttribute("style", `
    width: 42px !important;
    height: 42px !important;
    background: #171717 !important;
    border: 1px solid rgba(255,255,255,0.1) !important;
    border-right: none !important;
    border-radius: 12px 0 0 12px !important;
    display: flex !important;
    align-items: center !important;
    justify-content: center !important;
    cursor: pointer !important;
    box-shadow: -2px 0 12px rgba(0,0,0,0.5) !important;
    transition: background 0.2s !important;
  `);
  tab.innerHTML = `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#F5F5F5" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="4" y1="6" x2="20" y2="6"/><line x1="4" y1="12" x2="20" y2="12"/><line x1="4" y1="18" x2="20" y2="18"/></svg>`;
  tab.addEventListener("mouseenter", () => { tab.style.background = "#222"; });
  tab.addEventListener("mouseleave", () => { tab.style.background = "#171717"; });

  // -- Panel (expanded state) --
  const panel = document.createElement("div");
  panel.id = "fd-panel";
  panel.setAttribute("style", `
    position: absolute !important;
    right: 0 !important;
    top: 50% !important;
    transform: translateY(-50%) translateX(110%) !important;
    opacity: 0 !important;
    pointer-events: none !important;
    width: 200px !important;
    background: #0B0B0B !important;
    border: 1px solid rgba(255,255,255,0.1) !important;
    border-right: none !important;
    border-radius: 20px 0 0 20px !important;
    padding: 16px !important;
    display: flex !important;
    flex-direction: column !important;
    gap: 10px !important;
    box-shadow: -4px 0 24px rgba(0,0,0,0.6) !important;
    transition: transform 0.25s cubic-bezier(0.25,0.8,0.25,1), opacity 0.25s !important;
  `);

  // Header row
  const header = document.createElement("div");
  header.setAttribute("style", `
    display: flex !important;
    align-items: center !important;
    justify-content: space-between !important;
  `);

  const brand = document.createElement("div");
  brand.setAttribute("style", `
    display: flex !important;
    align-items: center !important;
    gap: 8px !important;
    color: #F5F5F5 !important;
    font-size: 14px !important;
    font-weight: 700 !important;
  `);
  const logoUrl = chrome.runtime.getURL("dashboard/logo.png");
  brand.innerHTML = `<img src="${logoUrl}" style="width:20px;height:20px;border-radius:4px;flex-shrink:0;object-fit:contain;" alt="FD">FounderDeck`;

  const closeBtn = document.createElement("button");
  closeBtn.title = "Hide";
  closeBtn.setAttribute("style", `
    background: none !important;
    border: none !important;
    outline: none !important;
    cursor: pointer !important;
    color: #9E9E9E !important;
    display: flex !important;
    align-items: center !important;
    padding: 4px !important;
    border-radius: 4px !important;
    font-family: inherit !important;
  `);
  closeBtn.innerHTML = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="13 17 18 12 13 7"/><polyline points="6 17 11 12 6 7"/></svg>`;

  header.appendChild(brand);
  header.appendChild(closeBtn);

  // Save button
  const saveBtn = document.createElement("button");
  saveBtn.id = "fd-save";
  saveBtn.textContent = "Save Founder";
  saveBtn.setAttribute("style", `
    background: #FF9A52 !important;
    color: #000 !important;
    border: none !important;
    outline: none !important;
    border-radius: 10px !important;
    padding: 11px 0 !important;
    font-size: 14px !important;
    font-weight: 600 !important;
    font-family: inherit !important;
    text-align: center !important;
    cursor: pointer !important;
    transition: background 0.2s !important;
    display: block !important;
    width: 100% !important;
    box-sizing: border-box !important;
  `);
  saveBtn.addEventListener("mouseenter", () => { if (!saveBtn.dataset.busy) saveBtn.style.background = "#ffaa6e"; });
  saveBtn.addEventListener("mouseleave", () => { if (!saveBtn.dataset.busy) saveBtn.style.background = "#FF9A52"; });

  // Dashboard button
  const dashBtn = document.createElement("button");
  dashBtn.textContent = "Open Dashboard →";
  dashBtn.setAttribute("style", `
    background: transparent !important;
    color: #9E9E9E !important;
    border: 1px solid rgba(255,255,255,0.1) !important;
    outline: none !important;
    border-radius: 10px !important;
    padding: 10px 0 !important;
    font-size: 13px !important;
    font-weight: 500 !important;
    font-family: inherit !important;
    text-align: center !important;
    cursor: pointer !important;
    transition: all 0.2s !important;
    display: block !important;
    width: 100% !important;
    box-sizing: border-box !important;
  `);
  dashBtn.addEventListener("mouseenter", () => { dashBtn.style.background = "#171717"; dashBtn.style.color = "#F5F5F5"; });
  dashBtn.addEventListener("mouseleave", () => { dashBtn.style.background = "transparent"; dashBtn.style.color = "#9E9E9E"; });

  // Assemble panel
  panel.appendChild(header);
  panel.appendChild(saveBtn);
  panel.appendChild(dashBtn);

  // Assemble host
  host.appendChild(tab);
  host.appendChild(panel);
  document.documentElement.appendChild(host);

  // ========================================
  // 2. TOGGLE OPEN / CLOSE
  // ========================================
  function openPanel() {
    panel.style.transform = "translateY(-50%) translateX(0)";
    panel.style.opacity = "1";
    panel.style.pointerEvents = "auto";
    tab.style.opacity = "0";
    tab.style.pointerEvents = "none";
  }

  function closePanel() {
    panel.style.transform = "translateY(-50%) translateX(110%)";
    panel.style.opacity = "0";
    panel.style.pointerEvents = "none";
    tab.style.opacity = "1";
    tab.style.pointerEvents = "auto";
  }

  tab.addEventListener("click", openPanel);
  closeBtn.addEventListener("click", closePanel);

  // ========================================
  // 3. DASHBOARD
  // ========================================
  dashBtn.addEventListener("click", () => {
    chrome.runtime.sendMessage({ action: "open_dashboard" });
  });

  // ========================================
  // 4. SAVE
  // ========================================
  saveBtn.addEventListener("click", () => {
    saveBtn.textContent = "Saving…";
    saveBtn.dataset.busy = "1";
    saveBtn.style.background = "#555";
    saveBtn.style.color = "#ccc";

    const data = scrape();
    try {
      chrome.runtime.sendMessage({ action: "save_founder", data });
    } catch (e) {
      saveBtn.textContent = "Error – Refresh page";
      saveBtn.style.background = "#ff5252";
      saveBtn.style.color = "#fff";
    }
  });

  // Listen for save confirmation
  chrome.runtime.onMessage.addListener((msg) => {
    if (msg.action === "save_success") {
      saveBtn.textContent = "Saved ✓";
      saveBtn.style.background = "#4CAF50";
      saveBtn.style.color = "#fff";
      delete saveBtn.dataset.busy;
      setTimeout(() => {
        saveBtn.textContent = "Save Founder";
        saveBtn.style.background = "#FF9A52";
        saveBtn.style.color = "#000";
      }, 2000);
    }
  });

  // ========================================
  // 5. SCRAPING
  // ========================================
  function scrape() {
    const url = window.location.href;
    let platform = "", name = "", username = "", bio = "", profileImage = "";
    let tags = [];

    if (url.includes("linkedin.com")) {
      platform = "LinkedIn";


      console.log("[FounderDeck] Starting LinkedIn scrape...");

      // === NAME ===
      // Try multiple selectors — LinkedIn may or may not use h1
      const nameSelectors = [
        "h1",
        ".text-heading-xlarge",
        ".top-card-layout__title",
        ".profile-topcard-person-entity__name",
        "[data-anonymize='person-name']",
      ];
      for (const sel of nameSelectors) {
        try {
          const el = document.querySelector(sel);
          if (el) {
            const t = (el.innerText || el.textContent || "").trim();
            if (t.length > 1 && t.length < 100) { name = t; break; }
          }
        } catch (_) {}
      }
      // Fallback: page title
      if (!name) {
        let t = (document.title || "").replace(/^\(\d+\)\s*/, "");
        const dash = t.indexOf(" - ");
        const pipe = t.indexOf(" | ");
        if (dash > 0) name = t.substring(0, dash).trim();
        else if (pipe > 0) name = t.substring(0, pipe).trim();
      }
      console.log("[FounderDeck] NAME:", name);

      // === BIO (Headline) ===

      // 1) Try meta description
      try {
        const metas = [
          document.querySelector('meta[property="og:description"]'),
          document.querySelector('meta[name="description"]'),
          document.querySelector('meta[name="twitter:description"]'),
        ];
        for (const meta of metas) {
          if (!meta || !meta.content || meta.content.trim().length < 5) continue;
          let txt = meta.content.trim();
          if (name) {
            const lower = txt.toLowerCase();
            if (lower.startsWith(name.toLowerCase())) {
              txt = txt.substring(name.length).replace(/^\s*[-–—·|:]\s*/, "").trim();
            }
          }
          txt = txt.replace(/\s*[|–—-]\s*LinkedIn\s*$/i, "").trim();
          const bad = ["profile on linkedin", "world's largest", "professional community", "join linkedin", "sign up", "log in"];
          if (txt.length > 2 && !bad.some(b => txt.toLowerCase().includes(b))) {
            const dotIdx = txt.indexOf(". ");
            if (dotIdx > 10) txt = txt.substring(0, dotIdx);
            bio = txt;
            break;
          }
        }
      } catch (_) {}

      // 2) Try page title — "Name - Headline | LinkedIn"
      if (!bio) {
        try {
          let t = (document.title || "").replace(/^\(\d+\)\s*/, "");
          const dashIdx = t.indexOf(" - ");
          const pipeIdx = t.lastIndexOf(" | ");
          if (dashIdx > 0 && pipeIdx > dashIdx) {
            bio = t.substring(dashIdx + 3, pipeIdx).trim();
          } else if (dashIdx > 0) {
            bio = t.substring(dashIdx + 3).replace(/\s*[|–-]\s*LinkedIn$/i, "").trim();
          }
        } catch (_) {}
      }

      // 3) Try JSON-LD
      if (!bio) {
        try {
          for (const s of document.querySelectorAll('script[type="application/ld+json"]')) {
            try {
              const d = JSON.parse(s.textContent);
              const items = Array.isArray(d) ? d : [d];
              for (const item of items) {
                const p = item["@type"] === "Person" ? item : null;
                if (p && (p.jobTitle || p.headline || p.description)) {
                  bio = p.jobTitle || p.headline || p.description;
                  break;
                }
              }
            } catch (_) {}
            if (bio) break;
          }
        } catch (_) {}
      }

      // 4) Try DOM — search for headline elements directly
      if (!bio) {
        const headlineSelectors = [
          "div.text-body-medium",
          ".text-body-medium.break-words",
          ".top-card-layout__headline",
          ".top-card__headline",
          ".profile-topcard-person-entity__headline",
          ".artdeco-entity-lockup__subtitle",
          "[data-generated-suggestion-target]",
          "[class*='headline' i]",
        ];
        for (const sel of headlineSelectors) {
          try {
            const els = document.querySelectorAll(sel);
            for (const el of els) {
              if (el.closest("nav, footer")) continue;
              const txt = (el.innerText || el.textContent || "").trim();
              if (txt.length > 3 && txt.length < 300 && txt !== name) {
                bio = txt.split("\n")[0].trim();
                break;
              }
            }
            if (bio) break;
          } catch (_) {}
        }
      }

      // 5) Brute force — find the name element, then walk forward linearly to find the bio
      if (!bio && name) {
        try {
          const allEls = Array.from(document.querySelectorAll("main *, [role='main'] *"));
          let nameElIndex = -1;
          for (let i = 0; i < allEls.length; i++) {
            const txt = (allEls[i].innerText || allEls[i].textContent || "").trim();
            if (txt === name && allEls[i].children.length === 0) {
              nameElIndex = i;
              break;
            }
          }
          
          if (nameElIndex !== -1) {
            for (let i = nameElIndex + 1; i < allEls.length; i++) {
              const el = allEls[i];
              if (el.closest("button, nav, svg, img, style, script, footer")) continue;
              if (el.children.length > 3) continue; // Must be mostly a leaf node
              
              const txt = (el.innerText || el.textContent || "").trim();
              if (txt.length < 5 || txt.length > 300 || txt === name) continue;
              if (/^[\d\s·•,|:–-]+$/.test(txt)) continue;
              
              const lower = txt.toLowerCase();
              
              // Skip connection degrees (e.g., "· 3rd", "2nd", "1st degree")
              const cleanTxt = lower.replace(/[\s·•,|:–-]/g, '');
              if (["1st", "2nd", "3rd", "1stdegree", "2nddegree", "3rddegree"].includes(cleanTxt)) continue;
              
              if (/^\d+\s*(connections?|followers?|mutual|posts?)/i.test(lower)) continue;
              if (["connect", "follow", "message", "more", "pending", "linkedin"].includes(lower)) continue;
              if (["he/him", "she/her", "they/them"].includes(lower)) continue; // skip pronouns
              if (lower.includes("sign in") || lower.includes("join now")) continue;
              
              // We found the next valid text block after the name!
              bio = txt.split("\n")[0].trim();
              break;
            }
          }
        } catch (_) {}
      }

      console.log("[FounderDeck] FINAL BIO:", bio || "(empty)");

      // === IMAGE ===
      // 1) og:image meta
      try {
        const ogImg = document.querySelector('meta[property="og:image"]');
        if (ogImg && ogImg.content && ogImg.content.startsWith("http")) {
          profileImage = ogImg.content;
        }
      } catch (_) {}

      // 2) Profile picture selectors
      if (!profileImage) {
        const imgSelectors = [
          "img.pv-top-card-profile-picture__image--show",
          "img.pv-top-card-profile-picture__image",
          "button[aria-label*='profile picture'] img",
          "button[aria-label*='Profile photo'] img",
          "img[alt*='profile photo' i]",
          "img[alt*='photo of' i]",
          ".profile-topcard-person-entity__image img",
          ".top-card-layout__entity-image",
        ];
        for (const sel of imgSelectors) {
          try {
            const el = document.querySelector(sel);
            const src = el && (el.src || el.getAttribute("data-delayed-url") || "");
            if (src && src.startsWith("http") && !src.includes("data:image/gif")) {
              profileImage = src;
              break;
            }
          } catch (_) {}
        }
      }

      // 3) Scan for licdn.com profile images (skip wide banners)
      if (!profileImage) {
        for (const img of document.querySelectorAll("main img, img")) {
          if (img.closest("nav")) continue;
          const src = img.src || "";
          if (!src.includes("licdn.com")) continue;
          const w = img.naturalWidth || img.width || 0;
          const h = img.naturalHeight || img.height || 0;
          // Skip banners (very wide images)
          if (w > 0 && h > 0 && w / h > 2.5) continue;
          if (w >= 40) { profileImage = src; break; }
        }
      }

      // === USERNAME ===
      const m = window.location.pathname.match(/\/in\/([^\/\?]+)/);
      username = m ? m[1] : "";

    } else if (url.includes("x.com") || url.includes("twitter.com")) {
      platform = "X";

      // Name
      const uc = document.querySelector('[data-testid="UserName"]');
      if (uc) for (const s of uc.querySelectorAll("span")) {
        const t = s.innerText.trim();
        if (t && !t.startsWith("@") && t.length > 1) { name = t; break; }
      }
      if (!name) {
        const t = document.title;
        const i = t.indexOf(" (");
        if (i > 0) name = t.substring(0, i).trim();
      }

      // Username
      const parts = window.location.pathname.split("/").filter(Boolean);
      username = parts.length ? "@" + parts[0] : "";

      // Bio
      const bioEl = document.querySelector('[data-testid="UserDescription"]');
      bio = bioEl ? bioEl.innerText.trim() : "";

      // Image (inside primaryColumn only)
      const col = document.querySelector('[data-testid="primaryColumn"]') || document.querySelector("main") || document.body;
      const pl = col.querySelector('a[href$="/photo"] img');
      if (pl && pl.src && pl.src.includes("pbs.twimg.com")) {
        profileImage = pl.src.replace(/_normal\./, "_400x400.").replace(/_bigger\./, "_400x400.");
      }
      if (!profileImage) {
        let biggest = 0;
        for (const img of col.querySelectorAll("img")) {
          if (img.src && img.src.includes("pbs.twimg.com/profile_images")) {
            const s = Math.max(img.naturalWidth || 0, img.width || 0);
            if (s > biggest) { biggest = s; profileImage = img.src.replace(/_normal\./, "_400x400.").replace(/_bigger\./, "_400x400."); }
          }
        }
      }
    }

    console.log("[FounderDeck] Scraped:", { platform, name, username, bio: bio ? bio.substring(0, 40) + "..." : "", profileImage: profileImage ? "found" : "empty" });

    return {
      id: Date.now().toString(36) + Math.random().toString(36).slice(2, 8),
      platform, name: name || "Unknown", username: username || "unknown",
      role: "", bio: bio || "", profileImage: profileImage || "",
      profileUrl: url.split("?")[0], tags, savedAt: new Date().toISOString()
    };
  }
})();
