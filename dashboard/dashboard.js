document.addEventListener("DOMContentLoaded", () => {
  const gridContainer = document.getElementById("gridContainer");
  const emptyState = document.getElementById("emptyState");
  const searchInput = document.getElementById("searchInput");
  const filterChips = document.getElementById("filterChips");
  
  const settingsBtn = document.getElementById("settingsBtn");
  const settingsMenu = document.getElementById("settingsMenu");
  const exportBtn = document.getElementById("exportBtn");
  const importFile = document.getElementById("importFile");
  const deleteAllBtn = document.getElementById("deleteAllBtn");
  const learnHowBtn = document.getElementById("learnHowBtn");

  let allFounders = [];
  let currentFilter = "All";
  let currentSearch = "";

  // Load Data
  function loadFounders() {
    chrome.storage.local.get({ founders: [] }, (result) => {
      allFounders = result.founders;
      renderFounders();
    });
  }

  // Render Grid
  function renderFounders() {
    gridContainer.innerHTML = "";
    
    // Apply Filters
    let filtered = allFounders;
    
    if (currentFilter !== "All") {
      filtered = filtered.filter(f => 
        f.platform === currentFilter || f.tags.includes(currentFilter)
      );
    }
    
    if (currentSearch.trim() !== "") {
      const q = currentSearch.toLowerCase();
      filtered = filtered.filter(f => 
        f.name.toLowerCase().includes(q) ||
        f.username.toLowerCase().includes(q) ||
        f.role.toLowerCase().includes(q) ||
        f.bio.toLowerCase().includes(q)
      );
    }

    if (filtered.length === 0) {
      if (allFounders.length === 0) {
        emptyState.classList.remove("hidden");
        gridContainer.style.display = "none";
      } else {
        emptyState.classList.add("hidden");
        gridContainer.style.display = "grid";
        gridContainer.innerHTML = `<div style="color: var(--text-muted); grid-column: 1/-1; text-align:center; padding: 40px;">No founders match your search/filter.</div>`;
      }
      return;
    }

    emptyState.classList.add("hidden");
    gridContainer.style.display = "grid";

    filtered.forEach(founder => {
      const card = document.createElement("div");
      card.className = "card";
      
      const isX = founder.platform === "X";
      
      card.innerHTML = `
        <div class="card-top">
          <img src="${founder.profileImage || 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSIjOWU5ZTllIiBzdHJva2Utd2lkdGg9IjIiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIgc3Ryb2tlLWxpbmVqb2luPSJyb3VuZCI+PHBhdGggZD0iTTIwIDIxdi0yYTRgNCAwIDAgMC00LTRINThhNCA0IDAgMCAwLTQgNHYyIj48L3BhdGg+PGNpcmNsZSBjeD0iMTIiIGN5PSI3IiByPSI0Ij48L2NpcmNsZT48L3N2Zz4='}" alt="${founder.name}" class="profile-img" onerror="this.src='data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSIjOWU5ZTllIiBzdHJva2Utd2lkdGg9IjIiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIgc3Ryb2tlLWxpbmVqb2luPSJyb3VuZCI+PHBhdGggZD0iTTIwIDIxdi0yYTRgNCAwIDAgMC00LTRINThhNCA0IDAgMCAwLTQgNHYyIj48L3BhdGg+PGNpcmNsZSBjeD0iMTIiIGN5PSI3IiByPSI0Ij48L2NpcmNsZT48L3N2Zz4='">
          <div class="card-header-info">
            <div class="name-row">
              <h3 class="name" title="${founder.name}">${founder.name}</h3>
              <span class="platform-badge ${isX ? 'x' : 'linkedin'}">${founder.platform}</span>
            </div>
          </div>
          <button class="delete-btn" data-id="${founder.id}" title="Delete Founder">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
          </button>
        </div>
        <div class="card-middle">
          <p class="bio">${founder.bio || 'No bio available.'}</p>
        </div>
        <div class="card-bottom">
          <a href="${founder.profileUrl}" target="_blank" rel="noopener noreferrer" class="btn-primary">
            Open Profile 
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>
          </a>
          <button class="btn-secondary copy-btn" data-url="${founder.profileUrl}" title="Copy URL">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>
          </button>
        </div>
      `;
      gridContainer.appendChild(card);
    });

    // Attach Event Listeners to generated elements
    document.querySelectorAll('.delete-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const id = e.currentTarget.getAttribute('data-id');
        deleteFounder(id);
      });
    });

    document.querySelectorAll('.copy-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const url = e.currentTarget.getAttribute('data-url');
        navigator.clipboard.writeText(url).then(() => {
          const originalIcon = e.currentTarget.innerHTML;
          e.currentTarget.innerHTML = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#FF9A52" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>';
          setTimeout(() => {
            e.currentTarget.innerHTML = originalIcon;
          }, 2000);
        });
      });
    });
  }

  // Delete Individual Founder
  function deleteFounder(id) {
    allFounders = allFounders.filter(f => f.id !== id);
    chrome.storage.local.set({ founders: allFounders }, renderFounders);
  }

  // Search
  searchInput.addEventListener("input", (e) => {
    currentSearch = e.target.value;
    renderFounders();
  });

  // Filter Chips
  filterChips.addEventListener("click", (e) => {
    if (e.target.classList.contains("chip")) {
      document.querySelectorAll(".chip").forEach(c => c.classList.remove("active"));
      e.target.classList.add("active");
      currentFilter = e.target.getAttribute("data-filter");
      renderFounders();
    }
  });

  // Settings Menu Toggle
  settingsBtn.addEventListener("click", (e) => {
    e.stopPropagation();
    settingsMenu.classList.toggle("hidden");
  });

  document.addEventListener("click", (e) => {
    if (!settingsMenu.classList.contains("hidden") && !settingsMenu.contains(e.target)) {
      settingsMenu.classList.add("hidden");
    }
  });

  // Export JSON
  exportBtn.addEventListener("click", () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(allFounders, null, 2));
    const dlAnchorElem = document.createElement('a');
    dlAnchorElem.setAttribute("href", dataStr);
    dlAnchorElem.setAttribute("download", "founderdeck_export.json");
    dlAnchorElem.click();
    settingsMenu.classList.add("hidden");
  });

  // Import JSON
  importFile.addEventListener("change", (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const imported = JSON.parse(event.target.result);
          if (Array.isArray(imported)) {
            // Merge avoiding duplicates by profileUrl
            const currentUrls = new Set(allFounders.map(f => f.profileUrl));
            const newFounders = imported.filter(f => f.profileUrl && !currentUrls.has(f.profileUrl));
            
            allFounders = [...newFounders, ...allFounders];
            chrome.storage.local.set({ founders: allFounders }, () => {
              renderFounders();
              alert(`Imported ${newFounders.length} new founders.`);
            });
          }
        } catch (err) {
          alert("Invalid JSON file.");
        }
      };
      reader.readAsText(file);
    }
    settingsMenu.classList.add("hidden");
  });

  // Delete All
  deleteAllBtn.addEventListener("click", () => {
    if (confirm("Are you sure you want to delete all saved founders? This cannot be undone.")) {
      allFounders = [];
      chrome.storage.local.set({ founders: [] }, renderFounders);
    }
    settingsMenu.classList.add("hidden");
  });

  // Empty State button
  learnHowBtn.addEventListener("click", () => {
    alert("To save a founder, simply visit their LinkedIn or X (Twitter) profile and click the FounderDeck extension icon in your toolbar.");
  });

  // Initial Load
  loadFounders();
});
