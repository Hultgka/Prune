// --- Notification Permission Request (improved) ---
if ('Notification' in window) {
  // If permission is default, request it.
  if (Notification.permission === 'default') {
    Notification.requestPermission().then(permission => {
      // Optional: Log or handle user's choice
      console.log('Notification permission:', permission);
    });
  } else {
    // Optional: Log current permission
    console.log('Notification permission:', Notification.permission);
  }
}

// --- Navigation logic ---
const navItems = document.querySelectorAll('nav li');
const sections = document.querySelectorAll('main section');
navItems.forEach(item => {
  item.addEventListener('click', () => {
    navItems.forEach(n => n.classList.remove('active'));
    item.classList.add('active');
    const target = item.getAttribute('data-section');
    sections.forEach(section => {
      if (section.id === target) section.classList.add('visible');
      else section.classList.remove('visible');
    });
    if (document.getElementById('scan').classList.contains('visible')) {
      startScanBtn.style.display = 'inline-block';
      resetScanSection();
    }
    if (target === "programs") renderProgramShortcutList();
    if (target === "media") renderMediaCleaner();
  });
});
sections.forEach(section => section.classList.remove('visible'));
document.getElementById('dashboard').classList.add('visible');

// --- Mood advice ---
const moodSelect = document.getElementById('moodSelect');
const moodAdvice = document.getElementById('moodAdvice');
const advice = {
  neutral: "Ready for a gentle tidy-up? Pick a small task to get started, or scan now!",
  overwhelmed: "Take it slow. Try cleaning just one folder or file. Small steps are progress!",
  chill: "Relax and let Prune suggest a quick auto-clean. Or just organize your desktop for some calm.",
  motivated: "Awesome! Go for a full scan and challenge yourself to clear as much as you can. Your digital plant is cheering you on!"
};
moodSelect.addEventListener('change', function() {
  moodAdvice.textContent = advice[moodSelect.value];
});

// --- Plant companion logic ---
const plantImage = document.getElementById('plantImage');
const plantStatus = document.getElementById('plantStatus');
const scanNowBtn = document.getElementById('scanNowBtn');
const plantStages = [
  { src: "plant0.png", status: "Your plant awaits some gentle care!" },
  { src: "plant1.png", status: "Your plant is sprouting—keep going!" },
  { src: "plant2.png", status: "Your plant is happy and growing!" },
  { src: "plant3.png", status: "Your plant is blooming thanks to your tidy habits!" },
  { src: "plant4.png", status: "Your plant looks a bit sad... try a cleanup to cheer it up!" }
];
let plantState = 0, neglectTimer = null;
const WILT_DELAY = 4 * 24 * 60 * 60 * 1000;
function updatePlant() {
  plantImage.src = plantStages[plantState].src;
  plantStatus.textContent = plantStages[plantState].status;
  plantImage.classList.remove('grow');
  if (plantState === 3) plantImage.classList.add('grow');
}
function growPlant() {
  if (plantState === 4) plantState = 0;
  else if (plantState < 3) plantState += 1;
  else if (plantState === 3) {
    plantImage.classList.add('grow');
    setTimeout(updatePlant, 400);
  }
  updatePlant();
  resetNeglectTimer();
}
function wiltPlant() { plantState = 4; updatePlant(); }
function resetNeglectTimer() {
  if (neglectTimer) clearTimeout(neglectTimer);
  neglectTimer = setTimeout(() => { wiltPlant(); }, WILT_DELAY);
}
updatePlant();
resetNeglectTimer();

// Scan Toast
const scanToast = document.getElementById('scanToast');
const scanToastProgress = document.getElementById('scanToastProgress');
const scanToastSummary = document.getElementById('scanToastSummary');
const scanToastResults = document.getElementById('scanToastResults');
const scanToastCleanNowBtn = document.getElementById('scanToastCleanNowBtn');
const closeScanToast = document.getElementById('closeScanToast');
const scanToastInner = document.getElementById('scanToastInner');
scanNowBtn.addEventListener('click', () => { showScanToast(); });
function showScanToast() {
  scanToast.classList.add('active');
  scanToastSummary.style.display = 'none';
  scanToastInner.style.display = 'block';
  scanToastResults.textContent = '';
  scanToastProgress.style.width = '0%';
  let progress = 0;
  let scanInterval = setInterval(() => {
    progress += Math.floor(Math.random() * 15) + 15;
    if (progress >= 100) progress = 100;
    scanToastProgress.style.width = progress + '%';
    if (progress >= 100) {
      clearInterval(scanInterval);
      setTimeout(() => {
        let filesFound = Math.floor(Math.random() * 40) + 15;
        let spaceSaved = Math.floor(Math.random() * 250) + 50;
        scanToastResults.innerHTML = `Found <strong>${filesFound} files</strong>.<br>Total space to recover: <strong>${spaceSaved} MB</strong>.`;
        scanToastSummary.style.display = 'block';
        scanToastInner.style.display = 'none';
      }, 500);
    }
  }, 400);
}
scanToastCleanNowBtn.addEventListener('click', () => {
  growPlant();
  growSidebarPlant();
  scanToast.classList.remove('active');
});
closeScanToast.addEventListener('click', () => {
  scanToast.classList.remove('active');
});

// Scheduler
const reminderToggle = document.getElementById('reminderToggle');
const reminderFrequency = document.getElementById('reminderFrequency');
const customReminderDays = document.getElementById('customReminderDays');
const reminderDaysInput = document.getElementById('reminderDaysInput');
const nextReminderMsg = document.getElementById('nextReminderMsg');
const autoCleanupToggle = document.getElementById('autoCleanupToggle');
const autoCleanupFrequency = document.getElementById('autoCleanupFrequency');
const customAutoDays = document.getElementById('customAutoDays');
const autoDaysInput = document.getElementById('autoDaysInput');
const nextAutoMsg = document.getElementById('nextAutoMsg');
const schedulerFunMsg = document.getElementById('schedulerFunMsg');
function getNextDate(frequency, daysInput) {
  const now = new Date();
  switch (frequency) {
    case 'daily': now.setDate(now.getDate() + 1); break;
    case 'weekly': now.setDate(now.getDate() + 7); break;
    case 'monthly': now.setMonth(now.getMonth() + 1); break;
    case 'custom': now.setDate(now.getDate() + Number(daysInput)); break;
    default: return null;
  }
  return now;
}
function formatDate(date) {
  if (!date) return '';
  return date.toLocaleDateString(undefined, { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' });
}
function isBadFileName(name) {
  // Bad if name is too short/long or contains 'untitled' (case-insensitive)
  return (
    name.length < 4 ||
    name.length > 20 ||
    /untitled/i.test(name)
  );
}
function updateSchedulerUI() {
  if (reminderToggle.checked) {
    let freq = reminderFrequency.value;
    let days = freq === 'custom' ? reminderDaysInput.value : null;
    let nextDate = getNextDate(freq, days);
    nextReminderMsg.textContent = `Next reminder: ${formatDate(nextDate)}`;
  } else nextReminderMsg.textContent = "Reminders are off";
  if (autoCleanupToggle.checked) {
    let freq = autoCleanupFrequency.value;
    let days = freq === 'custom' ? autoDaysInput.value : null;
    let nextDate = getNextDate(freq, days);
    nextAutoMsg.textContent = `Next auto-cleanup: ${formatDate(nextDate)}`;
  } else nextAutoMsg.textContent = "Auto-Cleanup is off";
  let funMsg = "";
  if (reminderToggle.checked && autoCleanupToggle.checked)
    funMsg = "🌱 Double tidy power! Your plant is dancing with joy. ✨";
  else if (reminderToggle.checked)
    funMsg = "📅 A gentle nudge is on its way. Your files will thank you!";
  else if (autoCleanupToggle.checked)
    funMsg = "🧹 Sit back and relax! Prune will tidy up automatically.";
  else
    funMsg = "😴 Scheduler is snoozing. Don't forget to prune sometimes!";
  schedulerFunMsg.textContent = funMsg;
  localStorage.setItem('pruneScheduler', JSON.stringify({
    reminderOn: reminderToggle.checked,
    reminderFreq: reminderFrequency.value,
    reminderCustomDays: reminderDaysInput.value,
    autoOn: autoCleanupToggle.checked,
    autoFreq: autoCleanupFrequency.value,
    autoCustomDays: autoDaysInput.value
  }));
}
function restoreSchedulerSettings() {
  let settings = localStorage.getItem('pruneScheduler');
  if (settings) {
    try {
      let s = JSON.parse(settings);
      reminderToggle.checked = !!s.reminderOn;
      reminderFrequency.value = s.reminderFreq || 'weekly';
      reminderDaysInput.value = s.reminderCustomDays || 3;
      autoCleanupToggle.checked = !!s.autoOn;
      autoCleanupFrequency.value = s.autoFreq || 'weekly';
      autoDaysInput.value = s.autoCustomDays || 7;
    } catch (e) {}
  }
  customReminderDays.style.display = reminderFrequency.value === 'custom' ? '' : 'none';
  customAutoDays.style.display = autoCleanupFrequency.value === 'custom' ? '' : 'none';
  updateSchedulerUI();
}
restoreSchedulerSettings();
reminderToggle.addEventListener('change', updateSchedulerUI);
reminderFrequency.addEventListener('change', function() {
  customReminderDays.style.display = reminderFrequency.value === 'custom' ? '' : 'none';
  updateSchedulerUI();
});
reminderDaysInput.addEventListener('input', updateSchedulerUI);
autoCleanupToggle.addEventListener('change', updateSchedulerUI);
autoCleanupFrequency.addEventListener('change', function() {
  customAutoDays.style.display = autoCleanupFrequency.value === 'custom' ? '' : 'none';
  updateSchedulerUI();
});
autoDaysInput.addEventListener('input', updateSchedulerUI);

// Scan & Cleanup Section
const mockFiles = [
  { name: "Old Resume (resume2018.pdf)", size: 0.8, type: "pdf", recommended: false, lastAccessed: "2024-09-02", preview: null, folder: "Documents" },
  { name: "Screenshot (2022-01-05).png", size: 1.2, type: "image", recommended: true, lastAccessed: "2022-01-07", preview: "https://via.placeholder.com/320x180.png?text=Screenshot", folder: "Desktop" },
  { name: "Screenshot (2022-01-05).png", size: 1.2, type: "image", recommended: false, lastAccessed: "2023-01-07", preview: "https://via.placeholder.com/320x180.png?text=Screenshot", folder: "Desktop" },
  { name: "Unused App Installer.exe", size: 45, type: "exe", recommended: true, lastAccessed: "2023-12-01", preview: null, folder: "Downloads" },
  { name: "DraftPresentation.pptx", size: 2.5, type: "ppt", recommended: false, lastAccessed: "2025-06-26", preview: null, folder: "Documents" },
  { name: "Temp Folder.zip", size: 12.4, type: "archive", recommended: true, lastAccessed: "2024-02-15", preview: null, folder: "Downloads" },
  { name: "Notes (Spring 2020).txt", size: 0.2, type: "txt", recommended: false, lastAccessed: "2025-07-01", preview: "Spring 2020 notes...\n1. Intro\n2. Topic A\n3. Topic B\n4. More notes...", folder: "Documents" },
  { name: "Big Video.mp4", size: 120, type: "video", recommended: true, lastAccessed: "2023-04-22", preview: "https://via.placeholder.com/320x180.png?text=Big+Video", folder: "Downloads" },
  { name: "CatPhoto.jpg", size: 0.9, type: "image", recommended: false, lastAccessed: "2025-07-17", preview: "https://via.placeholder.com/160x160.png?text=CatPhoto", folder: "Pictures" },
  { name: "Report.pdf", size: 1.5, type: "pdf", recommended: false, lastAccessed: "2025-07-10", preview: null, folder: "Documents" },
  { name: "Vacation.mov", size: 24, type: "video", recommended: true, lastAccessed: "2022-08-10", preview: "https://via.placeholder.com/320x180.png?text=Vacation+Video", folder: "Desktop" },
  { name: "Unused App Installer.exe", size: 45, type: "exe", recommended: false, lastAccessed: "2024-01-01", preview: null, folder: "Downloads" },
  { name: "Old Empty Folder", size: 0, type: "folder", recommended: false, lastAccessed: "2022-01-01", preview: null, folder: "Documents", isEmpty: true },
  { name: "Unused Empty Folder", size: 0, type: "folder", recommended: false, lastAccessed: "2023-02-10", preview: null, folder: "Downloads", isEmpty: true }
];
let cleanedFiles = [];
let previousPlantState = plantState;
const fileTypeIcons = {
  pdf: "📄", image: "🖼️", video: "🎬", ppt: "📊",
  txt: "📝", archive: "🗄️", exe: "💾", other: "📁"
};
let currentFilter = "all";
let currentSort = "largest";

// ====== MOCK DATA FOR REPORTS ======
const pruneMockReports = [
  {
    date: "2025-07-20",
    filesCleaned: 27,
    spaceSavedMB: 120,
    fileTypes: { image: 14, video: 3, pdf: 2, txt: 4, archive: 1, exe: 2, other: 1 },
    folders: { "Desktop": 8, "Downloads": 10, "Documents": 6, "Pictures": 3 },
    plantStage: 2
  },
  {
    date: "2025-07-14",
    filesCleaned: 10,
    spaceSavedMB: 45,
    fileTypes: { image: 4, video: 1, pdf: 1, txt: 2, archive: 1, exe: 1 },
    folders: { "Desktop": 3, "Downloads": 4, "Documents": 2, "Pictures": 1 },
    plantStage: 1
  },
  {
    date: "2025-07-05",
    filesCleaned: 40,
    spaceSavedMB: 220,
    fileTypes: { image: 18, video: 7, pdf: 3, txt: 4, archive: 2, exe: 4, other: 2 },
    folders: { "Desktop": 12, "Downloads": 18, "Documents": 5, "Pictures": 5 },
    plantStage: 3
  }
];
// ====== END MOCK DATA ======

// Duplicates logic
function getDuplicateFileIndices(files) {
  const map = {};
  files.forEach((f, i) => {
    const key = `${f.name.trim().toLowerCase()}-${f.size}`;
    if (!map[key]) map[key] = [];
    map[key].push(i);
  });
  return Object.values(map)
    .filter(group => group.length > 1)
    .flat();
}

function getFilteredSortedFiles() {
  let files = [...mockFiles];
  // Filter by folder (new)
  if (window.currentScanFolder && window.currentScanFolder !== "All") {
    files = files.filter(f => f.folder === window.currentScanFolder);
  }
  // Filter by type (existing logic)
  if (currentFilter === "duplicates") {
    const indices = getDuplicateFileIndices(files);
    files = indices.map(i => files[i]);
  } else if (currentFilter !== "all") {
    files = files.filter(f => f.type === currentFilter);
  }
  switch (currentSort) {
    case "largest": files.sort((a, b) => b.size - a.size); break;
    case "smallest": files.sort((a, b) => a.size - b.size); break;
    case "az": files.sort((a, b) => a.name.localeCompare(b.name)); break;
    case "za": files.sort((a, b) => b.name.localeCompare(a.name)); break;
  }
  return files;
}

function formatLastAccessed(dateString) {
  const today = new Date();
  const accessedDate = new Date(dateString);
  const diffDays = Math.floor((today - accessedDate) / (24 * 60 * 60 * 1000));
  if (diffDays === 0) return "Today";
  if (diffDays === 1) return "Yesterday";
  return accessedDate.toLocaleDateString();
}

function makeFileLi(file, idx) {
  const li = document.createElement('li');
  let isDuplicate = false;
  // Mark duplicates for ALL view and for Duplicates filter
  if (currentFilter === "duplicates" || getDuplicateFileIndices(getFilteredSortedFiles()).includes(idx)) {
    isDuplicate = true;
    li.classList.add('duplicate-group');
  }
  if (file.recommended) li.classList.add('recommended');
  const iconSpan = document.createElement('span');
  iconSpan.textContent = fileTypeIcons[file.type] || fileTypeIcons.other;
  iconSpan.setAttribute("aria-label", file.type);
  iconSpan.style.fontSize = "1.3em";
  iconSpan.style.marginRight = "0.5em";
  iconSpan.style.flexShrink = "0";
  const infoWrap = document.createElement('div');
  infoWrap.className = 'file-info-wrap';
  const topRow = document.createElement('div');
  topRow.className = 'file-top-row';
  const checkbox = document.createElement('input');
  checkbox.type = 'checkbox';
  checkbox.name = 'clutterFile';
  checkbox.value = idx;
  checkbox.checked = file.checked !== false;
  checkbox.addEventListener('change', () => {
    file.checked = checkbox.checked;
  });
  checkbox.setAttribute('data-file-index', idx);
  const label = document.createElement('label');
  label.textContent = file.name;
  const folderBadge = document.createElement('span');
  folderBadge.textContent = ` (${file.folder})`;
  folderBadge.style.color = "#888";
  label.appendChild(folderBadge);
  label.className = 'file-name-label';
  label.style.cursor = "pointer";
  label.addEventListener('click', (e) => {
    e.preventDefault();
    openPreviewModal(file);
  });
  topRow.appendChild(label);
if (isBadFileName(file.name)) {
  const renameBtn = document.createElement('button');
  renameBtn.textContent = "Rename";
  renameBtn.className = "prune-btn small-btn";
  renameBtn.style.marginLeft = "0.5em";
  renameBtn.onclick = () => {
    const newName = prompt("Enter a new file name (4-20 chars):", file.name);
    if (newName && !isBadFileName(newName.trim())) {
      file.name = newName.trim();
      renderClutterFiles();
    } else if (newName) {
      alert("Name must be 4-20 characters.");
    }
  };
  topRow.appendChild(renameBtn);
}
  if (file.recommended) {
    const badge = document.createElement('span');
    badge.className = 'recommended-badge';
    badge.textContent = 'Recommended';
    topRow.appendChild(badge);
  }
  if (isDuplicate) {
    const dupBadge = document.createElement('span');
    dupBadge.className = 'duplicate-badge';
    dupBadge.textContent = 'Duplicate';
    topRow.appendChild(dupBadge);
  }
  const bottomRow = document.createElement('div');
  bottomRow.className = 'file-bottom-row';
  bottomRow.textContent = `${file.size} MB · Last Accessed: ${formatLastAccessed(file.lastAccessed)}`;
  infoWrap.appendChild(topRow);
  infoWrap.appendChild(bottomRow);
  li.appendChild(iconSpan);
  li.appendChild(checkbox);
  li.appendChild(infoWrap);
  return li;
}

const startScanBtn = document.getElementById('startScanBtn');
const scanProgressBox = document.getElementById('scanProgressBox');
const scanProgressBar = document.getElementById('scanProgressBar');
const scanProgressStatus = document.getElementById('scanProgressStatus');
const scanResultsBox = document.getElementById('scanResultsBox');
const clutterFilesList = document.getElementById('clutterFilesList');
const cleanSelectedBtn = document.getElementById('cleanSelectedBtn');
const scanSummaryBox = document.getElementById('scanSummaryBox');
const selectControls = document.getElementById('selectControls');
const selectAllBtn = document.getElementById('selectAllBtn');
const deselectAllBtn = document.getElementById('deselectAllBtn');
const filterSortControls = document.getElementById('filterSortControls');
const fileTypeFilter = document.getElementById('fileTypeFilter');
const fileSortOrder = document.getElementById('fileSortOrder');
// --- Folder filter for scan ---
const scanFolderFilter = document.createElement('select');
scanFolderFilter.id = "scanFolderFilter";
scanFolderFilter.style.marginRight = "1em";
const allFolderOpt = document.createElement('option');
allFolderOpt.value = "All";
allFolderOpt.textContent = "All Folders";
scanFolderFilter.appendChild(allFolderOpt);
// Get unique folder names from mockFiles
Array.from(new Set(mockFiles.map(f => f.folder))).forEach(folder => {
  const opt = document.createElement('option');
  opt.value = folder;
  opt.textContent = folder;
  scanFolderFilter.appendChild(opt);
});
scanFolderFilter.value = window.currentScanFolder || "All";
scanFolderFilter.addEventListener('change', (e) => {
  window.currentScanFolder = e.target.value;
  renderClutterFiles();
});
filterSortControls.insertBefore(scanFolderFilter, fileTypeFilter);
// Initialize global state if not set
if (!window.currentScanFolder) window.currentScanFolder = "All";
const undoCleanBtn = document.getElementById('undoCleanBtn');
const scanSpinner = document.getElementById('scanSpinner');
const criteriaControls = document.getElementById('criteriaControls');
const criteriaSelect = document.getElementById('criteriaSelect');
const filePreviewModal = document.getElementById('filePreviewModal');
const modalPreviewBody = document.getElementById('modalPreviewBody');
const closePreviewModal = document.getElementById('closePreviewModal');

function resetScanSection() {
  scanProgressBox.style.display = 'none';
  scanResultsBox.style.display = 'none';
  scanSummaryBox.style.display = 'none';
  selectControls.style.display = 'none';
  filterSortControls.style.display = 'none';
  criteriaControls.style.display = 'none';
  scanProgressBar.style.width = '0%';
  scanProgressStatus.textContent = '';
  clutterFilesList.innerHTML = '';
  undoCleanBtn.style.display = 'none';
  scanSpinner.style.display = 'none';
  scanSummaryBox.innerHTML = '';
  scanSummaryBox.appendChild(undoCleanBtn);
}

function renderClutterFiles() {
  clutterFilesList.innerHTML = '';
  const files = getFilteredSortedFiles();
  files.forEach((file, idx) => {
    clutterFilesList.appendChild(makeFileLi(file, idx));
  });
}

selectAllBtn.addEventListener('click', () => {
  const checkboxes = clutterFilesList.querySelectorAll('input[type="checkbox"]');
  checkboxes.forEach(cb => cb.checked = true);
});

deselectAllBtn.addEventListener('click', () => {
  const checkboxes = clutterFilesList.querySelectorAll('input[type="checkbox"]');
  checkboxes.forEach(cb => cb.checked = false);
});

fileTypeFilter.addEventListener('change', (e) => {
  currentFilter = e.target.value;
  renderClutterFiles();
});

fileSortOrder.addEventListener('change', (e) => {
  currentSort = e.target.value;
  renderClutterFiles();
});

criteriaSelect.addEventListener('change', function () {
  const value = criteriaSelect.value;
  const now = new Date();
  mockFiles.forEach(file => {
    switch (value) {
      case "emptyfolders":
        file.checked = (file.type === "folder" && file.isEmpty);
        break;
      case "older1y":
        let accessed = new Date(file.lastAccessed);
        let days = (now - accessed) / (1000 * 60 * 60 * 24);
        file.checked = days > 365;
        break;
      case "images10mb":
        file.checked = (file.type === "image" && file.size > 10);
        break;
      case "videos":
        file.checked = (file.type === "video");
        break;
      case "smallfiles":
        if (file.size < 1) file.checked = false;
        break;
      case "recommended":
        file.checked = file.recommended;
        break;
      case "notaccessed365":
        let accessed2 = new Date(file.lastAccessed);
        let days2 = (now - accessed2) / (1000 * 60 * 60 * 24);
        file.checked = (days2 > 365);
        break;
      default:
        break;
    }
  });
  renderClutterFiles(); // Force re-render
});
startScanBtn.addEventListener('click', () => {
  mockFiles.forEach(f => f.checked = true); // <<--- ADD THIS LINE
  resetScanSection();
  startScanBtn.style.display = 'none';
  scanProgressBox.style.display = 'block';
  scanSpinner.style.display = 'block';
  scanProgressBar.style.width = '0%';
  scanProgressStatus.textContent = "Scanning for clutter...";
  let progress = 0;
  let scanDuration = 1600 + Math.random() * 1000;
  let start = Date.now();
  let scanInterval = setInterval(() => {
    let elapsed = Date.now() - start;
    progress = Math.min(100, Math.round((elapsed / scanDuration) * 100));
    scanProgressBar.style.width = progress + '%';
    if (progress < 100) scanProgressStatus.textContent = `Scanning... (${progress}%)`;
    if (progress >= 100) {
      clearInterval(scanInterval);
      scanProgressStatus.textContent = "Scan complete!";
      scanSpinner.style.display = 'none';
      setTimeout(() => { showScanResults(); }, 600);
    }
  }, 120);
});

function showScanResults() {
  scanProgressBox.style.display = 'none';
  scanResultsBox.style.display = 'block';
  selectControls.style.display = 'block';
  filterSortControls.style.display = 'flex';
  criteriaControls.style.display = 'flex';
  renderClutterFiles();
}

scanResultsBox.addEventListener('submit', (e) => {
  e.preventDefault();
  cleanedFiles = [];
  previousPlantState = plantState;
  const files = getFilteredSortedFiles();
  const checked = Array.from(clutterFilesList.querySelectorAll('input[type="checkbox"]:checked'));
  cleanedFiles = checked.map(c => files[parseInt(c.getAttribute('data-file-index'))]);
  const cleanedCount = cleanedFiles.length;
  const cleanedSize = cleanedFiles.reduce((sum, f) => sum + f.size, 0);
  mockFiles.splice(0, mockFiles.length, ...mockFiles.filter(f => !cleanedFiles.includes(f)));
  scanResultsBox.style.display = 'none';
  selectControls.style.display = 'none';
  criteriaControls.style.display = 'none';
  filterSortControls.style.display = 'none';
  scanSummaryBox.innerHTML =
    `<b>${cleanedCount}</b> files tidied! <br>
     <b>${cleanedSize.toFixed(1)} MB</b> cleaned.<br>
     Your plant companion is grateful 🌱`;
  scanSummaryBox.appendChild(undoCleanBtn);
  scanSummaryBox.style.display = 'block';
  undoCleanBtn.style.display = cleanedFiles.length > 0 ? 'inline-block' : 'none';
  filesTidiedToday += cleanedFiles.length;
localStorage.setItem('filesTidiedToday', filesTidiedToday);
pruneHistory.push(Date.now());
localStorage.setItem('pruneHistory', JSON.stringify(pruneHistory));
updateWellnessUI();
  growPlant();
  growSidebarPlant();
  showNatureFireworks(); // <--- Fireworks here!
});


undoCleanBtn.addEventListener('click', () => {
  cleanedFiles.forEach(f => {
    if (!mockFiles.includes(f)) mockFiles.push(f);
  });
  plantState = previousPlantState;
  updatePlant();
  scanSummaryBox.style.display = 'none';
  startScanBtn.style.display = 'inline-block';
  resetScanSection();
});
undoCleanBtn.style.display = 'none';
scanSummaryBox.appendChild(undoCleanBtn);

// Modal preview logic
function openPreviewModal(file) {
  filePreviewModal.style.display = 'block';
  modalPreviewBody.innerHTML = renderPreviewHTML(file);
}
closePreviewModal.onclick = function() {
  filePreviewModal.style.display = 'none';
};
window.onclick = function(event) {
  if (event.target === filePreviewModal) {
    filePreviewModal.style.display = "none";
  }
};
function renderPreviewHTML(file) {
  let html = '';
  if (file.type === "image" && file.preview) {
    html += `<img src="${file.preview}" class="modal-preview-thumb" alt="${file.name} Image preview" />`;
  } else if (file.type === "video" && file.preview) {
    html += `<img src="${file.preview}" class="modal-preview-thumb" alt="${file.name} Video preview" />`;
    html += `<div class="modal-icon">${fileTypeIcons.video}</div>`;
  } else if (file.type === "txt" && file.preview) {
    html += `<div class="modal-icon">${fileTypeIcons.txt}</div>`;
    html += `<div class="modal-snippet">${escapeHTML(file.preview.substr(0, 280))}${file.preview.length > 280 ? "..." : ""}</div>`;
  } else if (file.type === "pdf") {
    html += `<div class="modal-icon">${fileTypeIcons.pdf}</div>`;
    html += `<div class="modal-snippet">PDF preview not available.</div>`;
  } else if (file.type === "ppt") {
    html += `<div class="modal-icon">${fileTypeIcons.ppt}</div>`;
    html += `<div class="modal-snippet">Presentation preview not available.</div>`;
  } else if (file.type === "archive") {
    html += `<div class="modal-icon">${fileTypeIcons.archive}</div>`;
    html += `<div class="modal-snippet">Archive file. Preview not available.</div>`;
  } else if (file.type === "exe") {
    html += `<div class="modal-icon">${fileTypeIcons.exe}</div>`;
    html += `<div class="modal-snippet">Application installer. Preview not available.</div>`;
  } else {
    html += `<div class="modal-icon">${fileTypeIcons.other}</div>`;
    html += `<div class="modal-snippet">Preview not available.</div>`;
  }
  html += `<div class="modal-file-details">
    <strong>${file.name}</strong><br>
    ${file.size} MB<br>
    Last accessed: ${formatLastAccessed(file.lastAccessed)}<br>
    Type: ${file.type.charAt(0).toUpperCase() + file.type.slice(1)}
    ${file.recommended ? `<br><span class="recommended-badge">Recommended</span>` : ""}
  </div>`;
  return html;
}
function escapeHTML(str) {
  return str.replace(/[&<>"']/g, function(m) {
    return ({
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#39;'
    })[m];
  });
}

// === ORGANIZE DESKTOP FEATURE ===
// --- ORGANIZE DESKTOP DOM ELEMENTS ---
const organizeConfirmBtn = document.getElementById('organizeConfirmBtn');
const organizePreviewList = document.getElementById('organizePreviewList');
const organizeUndoBtn = document.getElementById('organizeUndoBtn');
const organizePresetSelect = document.getElementById('organizePresetSelect');
const organizeExcludeInput = document.getElementById('organizeExcludeInput');
const organizePlantReact = document.getElementById('organizePlantReact');
const organizeSnapshotList = document.getElementById('organizeSnapshotList');
const organizeAnimationToggle = document.getElementById('organizeAnimationToggle');
const organizeSoundToggle = document.getElementById('organizeSoundToggle');

const beforeAfterModal = document.getElementById('beforeAfterModal');
const closeBeforeAfter = document.getElementById('closeBeforeAfter');// Added for Before & After

const desktopFiles = [
  { name: "Vacation.jpg", type: "image", created: "2025-06-30", size: 2.4 },
  { name: "Invoice_June.pdf", type: "pdf", created: "2025-06-26", size: 0.5 },
  { name: "Budget.xlsx", type: "excel", created: "2025-04-12", size: 1.1 },
  { name: "SpringProject_Draft.docx", type: "doc", created: "2025-06-01", size: 0.7 },
  { name: "Untitled (1).jpg", type: "image", created: "2025-05-14", size: 4.2 },
  { name: "Shortcut.lnk", type: "shortcut", created: "2025-03-02", size: 0.001, target: "C:\\Windows\\explorer.exe" },
  { name: "OldNotes.txt", type: "txt", created: "2024-07-12", size: 0.02 },
  { name: "Readme.md", type: "md", created: "2025-06-22", size: 0.03 },
  { name: "SchoolProject", type: "folder", created: "2025-05-01", size: 0 },
  { name: "Vacation (copy).jpg", type: "image", created: "2025-06-30", size: 2.4 }
];
const programShortcutsDesktop = [
  { name: "Word 2021.lnk", type: "shortcut", target: "C:\\Program Files\\Microsoft Office\\Word.exe", created: "2025-06-20", size: 0.002 },
  { name: "Minecraft.exe", type: "exe", created: "2025-01-12", size: 35 },
  { name: "OldApp.lnk", type: "shortcut", target: "C:\\OldApp\\OldApp.exe", created: "2024-11-02", size: 0.001 }
];
const allDesktopItems = [
  ...desktopFiles,
  ...programShortcutsDesktop
];
let desktopFilesCurrent = [...allDesktopItems];
const fileTypeIconsDesktop = {
  image: "🖼️", pdf: "📄", excel: "📊", doc: "📝", txt: "📃", md: "📑",
  shortcut: "🔗", exe: "💾", folder: "📁", other: "📦"
};
const organizePresets = [
  { name: "Type Folders", description: "Group files by their type", rules: { type: true } },
  { name: "Date Folders", description: "Group files by creation month", rules: { date: true } },
  { name: "Project Detection", description: "Group files by project name patterns", rules: { project: true } }
];
let chosenPreset = organizePresets[0];
let organizationPreview = [];
let lastOrganizationSnapshot = null;
let snapshots = [];
let customFolderNames = {}; // stores custom folder names

window.manualFileGroups = {};

// --- Show Before & After Button Handler ---
if (showBeforeAfterBtn) {
  showBeforeAfterBtn.addEventListener('click', function() {
    if (window._lastBeforeAfter) {
      showBeforeAfterNature(window._lastBeforeAfter.before, window._lastBeforeAfter.after);
    } else {
      alert("No before/after data available yet!");
    }
  });
}

// Find similar name groups (for flagging similar names)
function getSimilarNameGroups(files) {
  const normalize = n => n.replace(/\s*\(copy\)|\s*\d+|\s*\(\d+\)/gi, '').replace(/\.[^.]+$/, '').toLowerCase();
  const map = {};
  files.forEach(f => {
    const key = normalize(f.name);
    if (!map[key]) map[key] = [];
    map[key].push(f);
  });
  return Object.values(map).filter(g => g.length > 1);
}

// Define bad name detection
function isBadName(name) {
  return /^(untitled|img_\d+|new\s*file|doc\d+)$/i.test(name.replace(/\.[^.]+$/, ''));
}

// Detect Duplicates
function getDuplicateFilesDesktop(files) {
  const map = {};
  files.forEach((f, i) => {
    const key = `${f.name.trim().toLowerCase()}-${f.size}`;
    if (!map[key]) map[key] = [];
    map[key].push(i);
  });
  return Object.values(map)
    .filter(group => group.length > 1)
    .flat()
    .map(idx => files[idx]);
}

// Smart Project Grouping
function detectProjectsDesktop(files) {
  const projects = {};
  files.forEach(f => {
    let match = /^([A-Za-z]+Project)/.exec(f.name);
    if (match) {
      let proj = match[1];
      if (!projects[proj]) projects[proj] = [];
      projects[proj].push(f);
    }
  });
  return projects;
}

// Date Grouping
function groupByMonthDesktop(files) {
  const groups = {};
  files.forEach(f => {
    let date = new Date(f.created);
    let group = `${date.getFullYear()}-${String(date.getMonth()+1).padStart(2,"0")}`;
    if (!groups[group]) groups[group] = [];
    groups[group].push(f);
  });
  return groups;
}

// Type Grouping - UPDATED to group shortcuts and exe as 'programs'
function groupByTypeDesktop(files) {
  const groups = {};
  files.forEach(f => {
    let type = f.type || "other";
    // Group shortcuts & exes into 'programs'
    if (type === "shortcut" || type === "exe") type = "programs";
    if (!groups[type]) groups[type] = [];
    groups[type].push(f);
  });
  return groups;
}

// Exclusion
function excludeFilesDesktop(files, pattern) {
  if (!pattern) return files;
  return files.filter(f => !f.name.includes(pattern));
}

// Organization Suggestion Algorithm
function suggestOrganizationDesktop(files, preset, excludePattern = "") {
  files = excludeFilesDesktop(files, excludePattern);
  let preview = [];
  if (preset.rules.type) {
    const groups = groupByTypeDesktop(files);
    Object.keys(groups).forEach(type => {
      let folderLabel = type.charAt(0).toUpperCase() + type.slice(1);
      if (type === "programs") folderLabel = "Programs";
      preview.push({ folder: folderLabel, files: groups[type] });
    });
  } else if (preset.rules.date) {
    const groups = groupByMonthDesktop(files);
    Object.keys(groups).forEach(month => {
      preview.push({ folder: month, files: groups[month] });
    });
  } else if (preset.rules.project) {
    const projects = detectProjectsDesktop(files);
    Object.keys(projects).forEach(proj => {
      preview.push({ folder: proj, files: projects[proj] });
    });
    let categorized = Object.values(projects).flat();
    let rest = files.filter(f => !categorized.includes(f));
    if (rest.length > 0) {
      preview.push({ folder: "Other", files: rest });
    }
  }
  return preview;
}

// --- Add Folder Button ---
const addFolderBtn = document.createElement('button');
addFolderBtn.textContent = '+ Add Folder';
addFolderBtn.className = 'prune-btn small-btn';
addFolderBtn.style.marginBottom = '1em';
addFolderBtn.addEventListener('click', () => {
  const name = prompt('Enter folder name:');
  if (name && name.trim()) {
    customFolderNames[organizationPreview.length] = name.trim();
    organizationPreview.push({ folder: name.trim(), files: [] });
    renderOrganizationPreviewDesktop(organizationPreview);
  }
});
window.addEventListener('DOMContentLoaded', () => {
  if (organizePreviewList && organizePreviewList.parentNode) {
    organizePreviewList.parentNode.insertBefore(addFolderBtn, organizePreviewList);
  }
});

// --- Manual move logic: regroup preview according to manualFileGroups mapping
function updateManualGrouping(preview) {
  const regrouped = preview.map((group, idx) => ({
    folder: customFolderNames[idx] || group.folder,
    files: []
  }));
  preview.forEach((group, groupIdx) => {
    group.files.forEach(f => {
      const targetIdx = window.manualFileGroups[f.name];
      if (typeof targetIdx === "number" && regrouped[targetIdx]) {
        regrouped[targetIdx].files.push(f);
      } else {
        regrouped[groupIdx].files.push(f);
      }
    });
  });
  organizationPreview = regrouped;
  renderOrganizationPreviewDesktop(regrouped);
}

// Organization Preview UI with editable folder names and drag & drop for moving files
function renderOrganizationPreviewDesktop(preview) {
  organizePreviewList.innerHTML = "";
  // Find similar name groups
  const similarGroups = getSimilarNameGroups(desktopFilesCurrent);

  preview.forEach((group, groupIdx) => {
    const groupDiv = document.createElement('div');
    groupDiv.className = 'organize-group';
    groupDiv.setAttribute('data-group-idx', groupIdx);

    // Editable folder name input
    const folderName = customFolderNames[groupIdx] || group.folder;
    const input = document.createElement('input');
    input.type = 'text';
    input.value = folderName;
    input.className = 'organize-folder-name-input';
    input.addEventListener('input', () => {
      customFolderNames[groupIdx] = input.value;
      renderOrganizationPreviewDesktop(preview);
    });
    groupDiv.appendChild(input);

    // Drop target for files
    groupDiv.addEventListener('dragover', (e) => { e.preventDefault(); groupDiv.classList.add('drag-over'); });
    groupDiv.addEventListener('dragleave', (e) => { groupDiv.classList.remove('drag-over'); });
    groupDiv.addEventListener('drop', (e) => {
      e.preventDefault();
      groupDiv.classList.remove('drag-over');
      const fileName = e.dataTransfer.getData('text/plain');
      // Find and move file
      let moved = false;
      preview.forEach((g, idx) => {
        const fileIdx = g.files.findIndex(f => f.name === fileName);
        if (fileIdx !== -1) {
          const fileObj = g.files[fileIdx];
          g.files.splice(fileIdx, 1);
          preview[groupIdx].files.push(fileObj);
          window.manualFileGroups[fileName] = groupIdx;
          moved = true;
        }
      });
      if (moved) renderOrganizationPreviewDesktop(preview);
    });

    // Files in this group
    const ul = document.createElement('ul');
    group.files.forEach(f => {
      const li = document.createElement('li');
      let inSimilar = similarGroups.some(grp => grp.includes(f));
      li.innerHTML = `${fileTypeIconsDesktop[f.type]||fileTypeIconsDesktop.other} <span class="organize-file-name">${f.name}</span>`;
      // For shortcuts, show target path
      if (f.type === "shortcut" && f.target) {
        li.innerHTML += `<span style="color:var(--text-soft);font-size:0.95em;"> → ${f.target}</span>`;
      }
      // If similar name, add badge and rename button
      if (inSimilar) {
        li.innerHTML += `<span class="similar-badge" style="margin-left:0.7em;color:#d66b00;background:#fff4e1;border-radius:5px;padding:0.1em 0.5em;">Similar Name</span>
          <button class="prune-btn small-btn rename-btn" style="margin-left:0.5em;">Rename</button>`;
      }
    // If bad name (length rule), add badge and rename button
if (isBadFileName(f.name)) {
  li.innerHTML += `<span class="badname-badge" style="margin-left:0.7em;color:#fff;background:#d66b00;border-radius:5px;padding:0.1em 0.5em;">Bad Name</span>
    <button class="prune-btn small-btn rename-btn" style="margin-left:0.5em;">Rename</button>`;
}
      li.setAttribute('draggable', 'true');
      li.addEventListener('dragstart', (e) => {
        e.dataTransfer.setData('text/plain', f.name);
      });
      ul.appendChild(li);

      // Add rename button logic
 setTimeout(() => {
  li.querySelectorAll('.rename-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      let newName = prompt("Enter a better name for this file (4-20 chars):", f.name);
      if (newName && !isBadFileName(newName.trim())) {
        f.name = newName.trim();
        renderOrganizationPreviewDesktop(organizationPreview);
      } else if (newName) {
        alert("Name must be 4-20 characters.");
      }
    });
  });
}, 0);
    });
    groupDiv.appendChild(ul);
    organizePreviewList.appendChild(groupDiv);
  });
}

// Preset Select UI
function setupPresetSelectDesktop() {
  organizePresetSelect.innerHTML = "";
  organizePresets.forEach((preset, idx) => {
    const opt = document.createElement('option');
    opt.value = idx;
    opt.textContent = preset.name + " - " + preset.description;
    organizePresetSelect.appendChild(opt);
  });
  organizePresetSelect.value = "0";
}

// Confirm Action (snapshot, animation, plant react)
function organizeDesktopConfirm() {
  // Save a snapshot before confirming so we can use it for Before/After
  lastOrganizationSnapshot = {
    time: Date.now(),
    files: JSON.parse(JSON.stringify(desktopFilesCurrent)),
    preview: JSON.parse(JSON.stringify(organizationPreview)),
    folderNames: { ...customFolderNames },
    manualFileGroups: { ...window.manualFileGroups }
  };
  // Prepare before/after data for the button/modal
  window._lastBeforeAfter = {
    before: lastOrganizationSnapshot ? lastOrganizationSnapshot.preview : [],
    after: organizationPreview
  };
  if (showBeforeAfterBtn) showBeforeAfterBtn.style.display = 'inline-block';

  desktopFilesCurrent = organizationPreview.flatMap(g => g.files);
  if (organizeAnimationToggle && organizeAnimationToggle.checked) showNatureFireworks();

  if (organizeSoundToggle && organizeSoundToggle.checked) playNatureSoundDesktop();
  if (organizePlantReact) {
    organizePlantReact.textContent = "🌷 Your plant is thrilled with the tidy desktop!";
    organizePlantReact.classList.add("plant-excited");
    setTimeout(() => {
      organizePlantReact.textContent = "";
      organizePlantReact.classList.remove("plant-excited");
    }, 2500);
  }
  renderOrganizationPreviewDesktop(suggestOrganizationDesktop(desktopFilesCurrent, chosenPreset, organizeExcludeInput.value));
  renderOrganizationSnapshotsDesktop();
  organizeUndoBtn.style.display = "inline-block";
}

// Undo/Restore Feature (also restores folder names and manual moves)
function organizeDesktopUndo() {
  if (snapshots.length > 0) {
    const snap = snapshots[snapshots.length - 1];
    desktopFilesCurrent = JSON.parse(JSON.stringify(snap.files));
    customFolderNames = { ...snap.folderNames };
    window.manualFileGroups = snap.manualFileGroups || {};
    organizationPreview = snap.preview;
    renderOrganizationPreviewDesktop(organizationPreview);
    if (organizePlantReact) {
      organizePlantReact.textContent = "🌿 Desktop restored!";
      setTimeout(() => { organizePlantReact.textContent = ""; }, 1500);
    }
    organizeUndoBtn.style.display = "none";
  }
}

// Snapshot History Feature (restores folder names and manual moves)
function renderOrganizationSnapshotsDesktop() {
  if (!organizeSnapshotList) return;
  organizeSnapshotList.innerHTML = "";
  if (lastOrganizationSnapshot) {
    snapshots.push(lastOrganizationSnapshot);
    if (snapshots.length > 5) snapshots.shift();
    lastOrganizationSnapshot = null;
  }
  snapshots.slice(-5).forEach((snap, idx) => {
    const item = document.createElement("li");
    item.textContent = `Snapshot ${snapshots.length-5+idx+1} - ${new Date(snap.time).toLocaleString()}`;
    item.addEventListener('click', () => {
      desktopFilesCurrent = JSON.parse(JSON.stringify(snap.files));
      customFolderNames = { ...snap.folderNames };
      window.manualFileGroups = snap.manualFileGroups || {};
      organizationPreview = snap.preview;
      renderOrganizationPreviewDesktop(organizationPreview);
      if (organizePlantReact) {
        organizePlantReact.textContent = "🌾 Snapshot restored!";
        setTimeout(() => { organizePlantReact.textContent = ""; }, 1500);
      }
    });
    organizeSnapshotList.appendChild(item);
  });
}

// Nature Sound
function playNatureSoundDesktop() {
  // You can replace this with any local nature sound mp3
  const snd = new Audio('nature-sound.mp3');
  snd.volume = 0.4;
  snd.play();
}

// Event Listeners
setupPresetSelectDesktop();
organizationPreview = suggestOrganizationDesktop(desktopFilesCurrent, chosenPreset, "");
renderOrganizationPreviewDesktop(organizationPreview);

organizePresetSelect.addEventListener('change', () => {
  chosenPreset = organizePresets[parseInt(organizePresetSelect.value)];
  organizationPreview = suggestOrganizationDesktop(desktopFilesCurrent, chosenPreset, organizeExcludeInput.value);
  renderOrganizationPreviewDesktop(organizationPreview);
});
organizeExcludeInput.addEventListener('input', () => {
  organizationPreview = suggestOrganizationDesktop(desktopFilesCurrent, chosenPreset, organizeExcludeInput.value);
  renderOrganizationPreviewDesktop(organizationPreview);
});
if (organizeConfirmBtn) organizeConfirmBtn.addEventListener('click', organizeDesktopConfirm);
if (organizeUndoBtn) organizeUndoBtn.addEventListener('click', organizeDesktopUndo);
// ---------- Media Cleaner Section ----------

// Utility: Example media mockFiles array (use your own or real one)
const mediaCleanerArea = document.getElementById('mediaCleanerArea');
// ----------------- ADVANCED MEDIA CLEANER SECTION START -----------------

// --- Helper and state utilities
let mediaDeletedFilesBin = [];
window.currentMediaFolder = "All Folders";
window.mediaTypeFilter = "All";
window.mediaSortKey = "name";
window.mediaSortDir = "asc";
window.mediaDateRange = { from: "", to: "" };

// Get all unique folders for the dropdown
function getAllFolders() {
  const folders = mockFiles.filter(f =>
    (f.type === "image" || f.type === "video") || (/screenshot/i.test(f.name))
  ).map(f => f.folder || "Unsorted");
  return Array.from(new Set(folders.concat(["Unsorted"])));
}

// Get all unique tags
function getAllTags() {
  let tags = [];
  mockFiles.forEach(f => {
    if (f.tags && Array.isArray(f.tags)) tags = tags.concat(f.tags);
  });
  return Array.from(new Set(tags));
}

// Utility: Find all media files (images, videos, screenshots)
function getMediaFiles() {
  return mockFiles.filter(f =>
    (f.type === "image" || f.type === "video") ||
    (/screenshot/i.test(f.name))
  );
}

// Group by type for UI
function groupMediaFiles(mediaFiles) {
  let screenshots = [];
  let photos = [];
  let videos = [];
  mediaFiles.forEach(f => {
    if (f.type === "image" && /screenshot/i.test(f.name)) {
      screenshots.push(f);
    } else if (f.type === "image") {
      photos.push(f);
    } else if (f.type === "video") {
      videos.push(f);
    }
  });
  return { screenshots, photos, videos };
}

// Find similar images/screenshots by filename base (ignoring date/number)
function groupSimilarMedia(files) {
  const groups = {};
  files.forEach(f => {
    const base = f.name.replace(/\(\d{4}-\d{2}-\d{2}\)/, '')
                       .replace(/[\d-]+/g, '')
                       .replace(/\.[^.]+$/, '')
                       .toLowerCase();
    if (!groups[base]) groups[base] = [];
    groups[base].push(f);
  });
  // Only return groups with >1 file
  return Object.values(groups).filter(g => g.length > 1);
}
// Simulated visual duplicate finder
function findVisualDuplicates(files) {
  // In real app, use perceptual hash or image processing
  // Here, just simulate: if names are similar, call them "visual duplicates"
  const groups = {};
  files.forEach(f => {
    const base = (f.name.substr(0, 5) + f.type).toLowerCase();
    if (!groups[base]) groups[base] = [];
    groups[base].push(f);
  });
  return Object.values(groups).filter(g => g.length > 1);
}
function getTotalStorage(files) {
  return files.reduce((acc, f) => acc + (f.size || 0), 0);
}
function formatBytes(bytes) {
  if (!bytes) return "0 B";
  if (bytes < 1024) return bytes + " B";
  if (bytes < 1024*1024) return (bytes/1024).toFixed(1) + " KB";
  if (bytes < 1024*1024*1024) return (bytes/1024/1024).toFixed(1) + " MB";
  return (bytes/1024/1024/1024).toFixed(1) + " GB";
}

// --------- Main Media Cleaner UI ----------
function renderMediaCleaner() {
  mediaCleanerArea.innerHTML = '';

  // --- FILTER BAR ---
  const folders = getAllFolders();
  let currentFolder = window.currentMediaFolder || "All Folders";
  const folderFilterDiv = document.createElement('div');
  folderFilterDiv.style.marginBottom = "1em";
  const filterSelect = document.createElement('select');
  filterSelect.style.marginRight = "1em";
  const allOpt = document.createElement('option');
  allOpt.value = "All Folders";
  allOpt.textContent = "All Folders";
  if (currentFolder === "All Folders") allOpt.selected = true;
  filterSelect.appendChild(allOpt);
  folders.forEach(folder => {
    const opt = document.createElement('option');
    opt.value = folder;
    opt.textContent = folder;
    if (currentFolder === folder) opt.selected = true;
    filterSelect.appendChild(opt);
  });
  filterSelect.addEventListener('change', () => {
    window.currentMediaFolder = filterSelect.value;
    renderMediaCleaner();
  });
  folderFilterDiv.appendChild(document.createTextNode("Show folder: "));
  folderFilterDiv.appendChild(filterSelect);

  // Media type filter (All, Image, Video, Screenshot)
  const typeFilter = document.createElement('select');
  typeFilter.style.marginRight = "1em";
  ["All", "Photos", "Screenshots", "Videos"].forEach(type => {
    const opt = document.createElement('option');
    opt.value = type;
    opt.textContent = type;
    if (window.mediaTypeFilter === type) opt.selected = true;
    typeFilter.appendChild(opt);
  });
  typeFilter.addEventListener('change', () => {
    window.mediaTypeFilter = typeFilter.value;
    renderMediaCleaner();
  });
  folderFilterDiv.appendChild(document.createTextNode(" Type: "));
  folderFilterDiv.appendChild(typeFilter);

  // Sort by dropdown
  const sortSelect = document.createElement('select');
  sortSelect.style.marginRight = "1em";
  [
    {key: "name", label: "Name"},
    {key: "size", label: "Size"},
    {key: "date", label: "Date"}
  ].forEach(({key, label}) => {
    const opt = document.createElement('option');
    opt.value = key;
    opt.textContent = "Sort by " + label;
    if (window.mediaSortKey === key) opt.selected = true;
    sortSelect.appendChild(opt);
  });
  sortSelect.addEventListener('change', () => {
    window.mediaSortKey = sortSelect.value;
    renderMediaCleaner();
  });
  folderFilterDiv.appendChild(sortSelect);

  // Sort direction (asc/desc)
  const sortDirBtn = document.createElement('button');
  sortDirBtn.textContent = (window.mediaSortDir === "asc") ? "↑" : "↓";
  sortDirBtn.title = "Toggle sort direction";
  sortDirBtn.style.marginRight = "1em";
  sortDirBtn.onclick = () => {
    window.mediaSortDir = (window.mediaSortDir === "asc") ? "desc" : "asc";
    renderMediaCleaner();
  };
  folderFilterDiv.appendChild(sortDirBtn);

  // Date range filter
  const dateLabel = document.createElement('span');
  dateLabel.textContent = "Date: ";
  folderFilterDiv.appendChild(dateLabel);
  const dateFrom = document.createElement('input');
  dateFrom.type = "date";
  dateFrom.value = window.mediaDateRange.from || "";
  dateFrom.style.marginRight = "0.3em";
  dateFrom.onchange = () => {
    window.mediaDateRange.from = dateFrom.value;
    renderMediaCleaner();
  };
  folderFilterDiv.appendChild(dateFrom);
  const dateTo = document.createElement('input');
  dateTo.type = "date";
  dateTo.value = window.mediaDateRange.to || "";
  dateTo.style.marginRight = "1em";
  dateTo.onchange = () => {
    window.mediaDateRange.to = dateTo.value;
    renderMediaCleaner();
  };
  folderFilterDiv.appendChild(dateTo);

  // Tag filter
  const tagLabel = document.createElement('span');
  tagLabel.textContent = "Tag: ";
  folderFilterDiv.appendChild(tagLabel);
  const tagSelect = document.createElement('select');
  tagSelect.style.marginRight = "1em";
  const allTagOpt = document.createElement('option');
  allTagOpt.value = "";
  allTagOpt.textContent = "All";
  tagSelect.appendChild(allTagOpt);
  getAllTags().forEach(tag => {
    const opt = document.createElement('option');
    opt.value = tag;
    opt.textContent = tag;
    tagSelect.appendChild(opt);
  });
  tagSelect.value = window.mediaTagFilter || "";
  tagSelect.onchange = () => {
    window.mediaTagFilter = tagSelect.value;
    renderMediaCleaner();
  };
  folderFilterDiv.appendChild(tagSelect);

  // Show trash bin/undo if there are deleted files
  if (mediaDeletedFilesBin.length) {
    const undoBtn = document.createElement('button');
    undoBtn.textContent = `Undo Delete (${mediaDeletedFilesBin.length})`;
    undoBtn.style.marginLeft = "1em";
    undoBtn.onclick = () => {
      mockFiles.push(...mediaDeletedFilesBin);
      mediaDeletedFilesBin = [];
      renderMediaCleaner();
    };
    folderFilterDiv.appendChild(undoBtn);
  }

  mediaCleanerArea.appendChild(folderFilterDiv);

  // --- MAIN MEDIA FILES RENDER ---
  // Filter files
  let mediaFiles = getMediaFiles();

  // Filter by folder
  if (window.currentMediaFolder && window.currentMediaFolder !== "All Folders") {
    mediaFiles = mediaFiles.filter(f => f.folder === window.currentMediaFolder);
  }
  // Filter by media type
  if (window.mediaTypeFilter === "Photos") {
    mediaFiles = mediaFiles.filter(f => f.type === "image" && !/screenshot/i.test(f.name));
  } else if (window.mediaTypeFilter === "Screenshots") {
    mediaFiles = mediaFiles.filter(f => f.type === "image" && /screenshot/i.test(f.name));
  } else if (window.mediaTypeFilter === "Videos") {
    mediaFiles = mediaFiles.filter(f => f.type === "video");
  }
  // Date range filter
  if (window.mediaDateRange.from) {
    mediaFiles = mediaFiles.filter(f => f.date && f.date >= window.mediaDateRange.from);
  }
  if (window.mediaDateRange.to) {
    mediaFiles = mediaFiles.filter(f => f.date && f.date <= window.mediaDateRange.to);
  }
  // Tag filter
  if (window.mediaTagFilter) {
    mediaFiles = mediaFiles.filter(f => f.tags && f.tags.includes(window.mediaTagFilter));
  }
  // Sort
  mediaFiles = [...mediaFiles];
  const key = window.mediaSortKey;
  mediaFiles.sort((a, b) => {
    let av = a[key] || "";
    let bv = b[key] || "";
    if (key === "size") { av = Number(av)||0; bv = Number(bv)||0; }
    if (key === "date") { av = av || "0000-01-01"; bv = bv || "0000-01-01"; }
    if (av < bv) return window.mediaSortDir==="asc"? -1 : 1;
    if (av > bv) return window.mediaSortDir==="asc"? 1 : -1;
    return 0;
  });

  // Storage usage bar
  const storageDiv = document.createElement('div');
  storageDiv.style.margin = "1em 0";
  const totalSize = getTotalStorage(mockFiles);
  const mediaSize = getTotalStorage(mediaFiles);
  storageDiv.innerHTML = `
    <div style="margin-bottom:0.3em;">Total Media Storage: <b>${formatBytes(totalSize)}</b> (Showing: ${formatBytes(mediaSize)})</div>
    <div style="height:18px;width:100%;background:#eee;border-radius:8px;overflow:hidden;">
      <div style="height:18px;width:${(mediaSize/totalSize*100)||0}%;background:#8f8;border-radius:8px;"></div>
    </div>
  `;
  mediaCleanerArea.appendChild(storageDiv);

  // Bulk actions bar
  if (mediaFiles.length) {
    const bulkDiv = document.createElement('div');
    bulkDiv.style.marginBottom = "1em";
    const selectAllBtn = document.createElement('button');
    selectAllBtn.textContent = "Select All";
    selectAllBtn.onclick = () => {
      mediaFiles.forEach(f => f._selected = true);
      renderMediaCleaner();
    };
    bulkDiv.appendChild(selectAllBtn);

    const deselectAllBtn = document.createElement('button');
    deselectAllBtn.textContent = "Deselect All";
    deselectAllBtn.onclick = () => {
      mediaFiles.forEach(f => f._selected = false);
      renderMediaCleaner();
    };
    bulkDiv.appendChild(deselectAllBtn);

    const invertBtn = document.createElement('button');
    invertBtn.textContent = "Invert Selection";
    invertBtn.onclick = () => {
      mediaFiles.forEach(f => f._selected = !f._selected);
      renderMediaCleaner();
    };
    bulkDiv.appendChild(invertBtn);

    // Move selected to folder
    const moveSelect = document.createElement('select');
    getAllFolders().forEach(folder => {
      const opt = document.createElement('option');
      opt.value = folder;
      opt.textContent = "Move to " + folder;
      moveSelect.appendChild(opt);
    });
    moveSelect.onchange = () => {
      const selected = mediaFiles.filter(f => f._selected);
      selected.forEach(f => f.folder = moveSelect.value);
      renderMediaCleaner();
    };
    bulkDiv.appendChild(moveSelect);

    // Bulk delete
    const bulkDeleteBtn = document.createElement('button');
bulkDeleteBtn.textContent = "Delete Selected";
bulkDeleteBtn.className = "danger";
bulkDeleteBtn.onclick = () => {
  const selected = mediaFiles.filter(f => f._selected);
  if (!selected.length) return;
  showMediaDeleteModal(selected);
};
bulkDiv.appendChild(bulkDeleteBtn);

    // Bulk tag
    const tagBtn = document.createElement('button');
    tagBtn.textContent = "Add Tag";
    tagBtn.onclick = () => {
      const tag = prompt("Enter tag:");
      if (!tag) return;
      mediaFiles.filter(f => f._selected).forEach(f => {
        if (!f.tags) f.tags = [];
        if (!f.tags.includes(tag)) f.tags.push(tag);
      });
      renderMediaCleaner();
    };
    bulkDiv.appendChild(tagBtn);

    // Bulk star
    const starBtn = document.createElement('button');
    starBtn.textContent = "Star Selected";
    starBtn.onclick = () => {
      mediaFiles.filter(f => f._selected).forEach(f => f.starred = true);
      renderMediaCleaner();
    };
    bulkDiv.appendChild(starBtn);

    // Slideshow
    const slideBtn = document.createElement('button');
    slideBtn.textContent = "Slideshow";
    slideBtn.onclick = () => {
      openSlideshow(mediaFiles.filter(f => f._selected && f.type === "image"));
    };
    bulkDiv.appendChild(slideBtn);

    mediaCleanerArea.appendChild(bulkDiv);
  }

   // No files found
  if (!mediaFiles.length) {
    mediaCleanerArea.innerHTML += `<div>No media files found!</div>`;
    // --- FIX: Show Undo if there are deleted files, even after all files are gone ---
    if (mediaDeletedFilesBin.length) {
      const undoBtn = document.createElement('button');
      undoBtn.textContent = `Undo Delete (${mediaDeletedFilesBin.length})`;
      undoBtn.style.margin = "1em";
      undoBtn.onclick = () => {
        mockFiles.push(...mediaDeletedFilesBin);
        mediaDeletedFilesBin = [];
        renderMediaCleaner();
      };
      mediaCleanerArea.appendChild(undoBtn);
    }
    return;
  }

  // --- SIMILAR/ DUPLICATE FINDERS ---
  // Visual duplicates (mocked)
  const visualDupGroups = findVisualDuplicates(mediaFiles.filter(f => f.type === "image"));
  if (visualDupGroups.length) {
    visualDupGroups.forEach((group, idx) => {
      const div = document.createElement('div');
      div.className = 'media-group';
      div.innerHTML = `<h4>Visual Duplicates Group ${idx+1} (${group.length})</h4>`;
      const thumbs = document.createElement('div');
      thumbs.className = 'media-thumbs';
      group.forEach((file, i) => {
        const thumb = makeMediaThumb(file, mediaFiles, `vdup${idx}_${i}`);
        thumbs.appendChild(thumb);
      });
      div.appendChild(thumbs);
      // Bulk delete for group
      const btn = document.createElement('button');
      btn.className = 'prune-btn danger small-btn';
      btn.textContent = 'Delete Selected';
      btn.onclick = () => {
        const selected = group.filter(f => f._selected);
        if (!selected.length) return;
        mediaDeletedFilesBin.push(...selected);
        selected.forEach(f => {
          const idx = mockFiles.indexOf(f);
          if (idx !== -1) mockFiles.splice(idx, 1);
        });
        growPlant(selected.length);
        renderMediaCleaner();
      };
      div.appendChild(btn);
      mediaCleanerArea.appendChild(div);
    });
  }

  // --- MAIN LISTING BY TYPE ---
  const { screenshots, photos, videos } = groupMediaFiles(mediaFiles);

  // Helper to render section
  function renderSection(list, label) {
    if (!list.length) return;
    const div = document.createElement('div');
    div.className = 'media-group';
    div.innerHTML = `<h4>${label} (${list.length})</h4>`;
    const thumbs = document.createElement('div');
    thumbs.className = 'media-thumbs';
    list.forEach((file, i) => {
      const thumb = makeMediaThumb(file, mediaFiles, `${label.replace(/\s/g,"")}${i}`);
      thumbs.appendChild(thumb);
    });
    div.appendChild(thumbs);
    mediaCleanerArea.appendChild(div);
  }

  renderSection(screenshots, "Screenshots");
  renderSection(photos, "Photos");
  renderSection(videos, "Videos");

  // --- Plant/fun celebration
  if (!document.getElementById('plantArea')) {
    const plantDiv = document.createElement('div');
    plantDiv.id = "plantArea";
    plantDiv.style.marginTop = "2em";
    mediaCleanerArea.appendChild(plantDiv);
  }
  updatePlantView();
}

// Helper: Create media thumb element with all features
function makeMediaThumb(file, mediaFiles, uniqId) {
  const thumb = document.createElement('div');
  thumb.className = 'media-thumb';
  thumb.style.position = "relative";

  // Selection
  const chk = document.createElement('input');
  chk.type = "checkbox";
  chk.checked = !!file._selected;
  chk.style.marginRight = "0.3em";
  chk.onchange = () => {
    file._selected = chk.checked;
  };
  thumb.appendChild(chk);

  // Starred
  const star = document.createElement('span');
  star.textContent = file.starred ? "★" : "☆";
  star.style.color = file.starred ? "gold" : "#ccc";
  star.title = file.starred ? "Unstar" : "Star";
  star.style.cursor = "pointer";
  star.onclick = () => {
    file.starred = !file.starred;
    renderMediaCleaner();
  };
  thumb.appendChild(star);

  // Image or video preview
  if (file.type === "image") {
    const img = document.createElement('img');
    img.src = file.preview || 'https://via.placeholder.com/120x80?text=Image';
    img.alt = file.name;
    img.style.maxWidth = "120px";
    img.style.maxHeight = "80px";
    img.style.borderRadius = "8px";
    img.style.margin = "0.3em";
    img.style.cursor = "pointer";
    img.onclick = () => showMediaDetails(file);
    thumb.appendChild(img);
  } else if (file.type === "video") {
    const img = document.createElement('img');
    img.src = file.preview || 'https://via.placeholder.com/120x80?text=Video';
    img.alt = file.name;
    img.style.maxWidth = "120px";
    img.style.maxHeight = "80px";
    img.style.borderRadius = "8px";
    img.style.margin = "0.3em";
    img.style.cursor = "pointer";
    img.onclick = () => showMediaDetails(file);
    thumb.appendChild(img);
  }

  // Name with tooltip for metadata
  const span = document.createElement('span');
  span.textContent = file.name;
  span.style.display = "block";
  span.style.fontSize = "0.95em";
  span.title = `Name: ${file.name}
Size: ${formatBytes(file.size)}
Date: ${file.date || "N/A"}
Folder: ${file.folder}
Tags: ${(file.tags || []).join(", ")}
Starred: ${file.starred ? "yes" : "no"}`;
  thumb.appendChild(span);

  // Show tags
  if (file.tags && file.tags.length) {
    const tagSpan = document.createElement('span');
    tagSpan.textContent = file.tags.map(t => "#" + t).join(" ");
    tagSpan.style.fontSize = "0.85em";
    tagSpan.style.color = "#999";
    thumb.appendChild(tagSpan);
  }

  // Folder dropdown
  const folders = getAllFolders();
  const select = document.createElement('select');
  select.className = 'folder-select';
  folders.forEach(folder => {
    const opt = document.createElement('option');
    opt.value = folder;
    opt.textContent = folder;
    if (file.folder === folder) opt.selected = true;
    select.appendChild(opt);
  });
  // Custom folder option
  const customOpt = document.createElement('option');
  customOpt.value = '__custom__';
  customOpt.textContent = 'Custom...';
  select.appendChild(customOpt);
  select.addEventListener('change', () => {
    if (select.value === '__custom__') {
      const newFolder = prompt('Enter new folder name:');
      if (newFolder && !folders.includes(newFolder)) {
        file.folder = newFolder;
      }
    } else {
      file.folder = select.value;
    }
    renderMediaCleaner();
  });
  thumb.appendChild(select);

  // Add tag button
  const addTagBtn = document.createElement('button');
  addTagBtn.textContent = "+Tag";
  addTagBtn.title = "Add tag";
  addTagBtn.style.fontSize = "0.8em";
  addTagBtn.onclick = () => {
    const tag = prompt("Enter tag:");
    if (!tag) return;
    if (!file.tags) file.tags = [];
    if (!file.tags.includes(tag)) file.tags.push(tag);
    renderMediaCleaner();
  };
  thumb.appendChild(addTagBtn);

  // Delete button for individual file
  const delBtn = document.createElement('button');
  delBtn.className = 'prune-btn danger small-btn';
  delBtn.textContent = 'Delete';
  delBtn.onclick = () => {
    mediaDeletedFilesBin.push(file);
    const idx = mockFiles.indexOf(file);
    if (idx !== -1) mockFiles.splice(idx, 1);
    growPlant(1);
    renderMediaCleaner();
  };
  thumb.appendChild(delBtn);

  // Slideshow button for single file (image only)
  if (file.type === "image") {
    const slideBtn = document.createElement('button');
    slideBtn.textContent = "👁";
    slideBtn.title = "View Slideshow";
    slideBtn.onclick = () => openSlideshow([file]);
    thumb.appendChild(slideBtn);
  }

  return thumb;
}

// ---- Show media details in modal dialog ----
function showMediaDetails(file) {
  // Simple overlay modal
  let overlay = document.getElementById('mediaModal');
  if (!overlay) {
    overlay = document.createElement('div');
    overlay.id = "mediaModal";
    overlay.style.position = "fixed";
    overlay.style.top = "0";
    overlay.style.left = "0";
    overlay.style.width = "100vw";
    overlay.style.height = "100vh";
    overlay.style.background = "rgba(0,0,0,0.7)";
    overlay.style.display = "flex";
    overlay.style.justifyContent = "center";
    overlay.style.alignItems = "center";
    overlay.style.zIndex = "9999";
    document.body.appendChild(overlay);
  }
  overlay.innerHTML = "";
  const modal = document.createElement('div');
  modal.style.background = "#fff";
  modal.style.padding = "2em";
  modal.style.borderRadius = "12px";
  modal.style.maxWidth = "90vw";
  modal.style.maxHeight = "90vh";
  modal.style.overflow = "auto";
  // Close button
  const closeBtn = document.createElement('button');
  closeBtn.textContent = "Close";
  closeBtn.onclick = () => overlay.remove();
  modal.appendChild(closeBtn);

  // Preview
  if (file.type === "image") {
    const img = document.createElement('img');
    img.src = file.preview || 'https://via.placeholder.com/600x400?text=Image';
    img.alt = file.name;
    img.style.maxWidth = "600px";
    img.style.maxHeight = "400px";
    img.style.display = "block";
    img.style.margin = "1em auto";
    modal.appendChild(img);
  } else if (file.type === "video") {
    const vid = document.createElement('video');
    vid.src = file.preview || '';
    vid.controls = true;
    vid.style.maxWidth = "600px";
    vid.style.maxHeight = "400px";
    vid.style.display = "block";
    vid.style.margin = "1em auto";
    modal.appendChild(vid);
  }

  // Metadata/details
  const details = document.createElement('div');
  details.innerHTML = `
    <b>Name:</b> ${file.name}<br>
    <b>Type:</b> ${file.type}<br>
    <b>Size:</b> ${formatBytes(file.size)}<br>
    <b>Date:</b> ${file.date || "N/A"}<br>
    <b>Folder:</b> ${file.folder}<br>
    <b>Tags:</b> ${(file.tags||[]).join(", ")}<br>
    <b>Starred:</b> ${file.starred ? "Yes" : "No"}
  `;
  modal.appendChild(details);

  overlay.appendChild(modal);
}

// ---- Slideshow for images ----
function openSlideshow(files) {
  if (!files.length) return;
  let idx = 0;
  let overlay = document.getElementById('slideshowModal');
  if (!overlay) {
    overlay = document.createElement('div');
    overlay.id = "slideshowModal";
    overlay.style.position = "fixed";
    overlay.style.top = "0";
    overlay.style.left = "0";
    overlay.style.width = "100vw";
    overlay.style.height = "100vh";
    overlay.style.background = "rgba(0,0,0,0.8)";
    overlay.style.display = "flex";
    overlay.style.justifyContent = "center";
    overlay.style.alignItems = "center";
    overlay.style.zIndex = "9999";
    document.body.appendChild(overlay);
  }
  function renderSlide() {
    overlay.innerHTML = "";
    const modal = document.createElement('div');
    modal.style.background = "#fff";
    modal.style.padding = "2em";
    modal.style.borderRadius = "12px";
    modal.style.maxWidth = "90vw";
    modal.style.maxHeight = "90vh";
    modal.style.overflow = "auto";
    // Close button
    const closeBtn = document.createElement('button');
    closeBtn.textContent = "Close";
    closeBtn.onclick = () => overlay.remove();
    modal.appendChild(closeBtn);

    // Image
    const img = document.createElement('img');
    img.src = files[idx].preview || 'https://via.placeholder.com/600x400?text=Image';
    img.alt = files[idx].name;
    img.style.maxWidth = "600px";
    img.style.maxHeight = "400px";
    img.style.display = "block";
    img.style.margin = "1em auto";
    modal.appendChild(img);

    // Details
    const details = document.createElement('div');
    details.innerHTML = `<b>${files[idx].name}</b> (${idx+1}/${files.length})`;
    modal.appendChild(details);

    // Prev/next
    if (files.length > 1) {
      const prevBtn = document.createElement('button');
      prevBtn.textContent = "Prev";
      prevBtn.disabled = idx === 0;
      prevBtn.onclick = () => { idx = Math.max(0, idx-1); renderSlide(); };
      modal.appendChild(prevBtn);

      const nextBtn = document.createElement('button');
      nextBtn.textContent = "Next";
      nextBtn.disabled = idx === files.length-1;
      nextBtn.onclick = () => { idx = Math.min(files.length-1, idx+1); renderSlide(); };
      modal.appendChild(nextBtn);
    }

    overlay.appendChild(modal);
  }
  renderSlide();
}

// ---- Plant/fun touch ----
let plantPoints = 0;
function updatePlantView() {
  const plantDiv = document.getElementById('plantArea');
  if (plantDiv) {
    let flowers = Math.floor(plantPoints/10);
    let leaves = Math.floor((plantPoints%10)/2);
    plantDiv.innerHTML = "🌱" + "🌿".repeat(leaves) + "🌸".repeat(flowers);
    if (plantPoints)
      plantDiv.innerHTML += `<div style="font-size:0.9em;color:#888;">(${plantPoints} files cleaned!)</div>`;
  }
}
function growPlant(points=1) {
  plantPoints += points;
  updatePlantView();
  if (plantPoints % 10 === 0) {
    showCelebration();
  }
}
function showCelebration() {
  let overlay = document.createElement('div');
  overlay.style.position = "fixed";
  overlay.style.top = "0";
  overlay.style.left = "0";
  overlay.style.width = "100vw";
  overlay.style.height = "100vh";
  overlay.style.zIndex = "99999";
  overlay.style.pointerEvents = "none";
  document.body.appendChild(overlay);
  overlay.innerHTML = "🎉🌸🎉<div style='color:#fff;font-size:2em;'>Great job cleaning media!</div>";
  setTimeout(()=>{ overlay.remove(); }, 2000);
}

// ---- Initial render ----// Nature fireworks feature
function showNatureFireworks() {
  const container = document.getElementById('natureFireworks');
  if (!container) return;
  for (let i = 0; i < 12; i++) {
    const el = document.createElement('div');
    el.className = 'nature-firework';
    // Randomize position around center of screen
    const angle = (i / 12) * 2 * Math.PI;
    const radius = 120 + Math.random() * 40;
    const x = window.innerWidth / 2 + Math.cos(angle) * radius;
    const y = window.innerHeight / 2 + Math.sin(angle) * radius;
    el.style.left = `${x - 20}px`;
    el.style.top = `${y - 20}px`;
    // Nature icon (🌱, 🌼, 🍃, 🌸, etc.)
    const icons = ['🌱', '🌼', '🍃', '🌸', '🌻', '🍀'];
    el.textContent = icons[Math.floor(Math.random() * icons.length)];
    el.style.fontSize = "2em";
    el.style.opacity = "0";
    container.appendChild(el);
    setTimeout(() => {
      el.remove();
    }, 1300);
  }
}

// ---- Before/After Nature Animation ----
function showBeforeAfterNature(beforeGroups, afterGroups) {
  const modal = document.getElementById('beforeAfterModal');
  const animation = document.getElementById('beforeAfterAnimation');
  animation.innerHTML = '';

  // BEFORE: Messy, overgrown plant and scattered files/folders
  const beforeDiv = document.createElement('div');
  beforeDiv.style.transition = "transform 1.2s, opacity 1.2s";
  beforeDiv.style.minWidth = "220px";
  beforeDiv.innerHTML = `
    <div style="font-size:3em;text-align:center;filter:grayscale(0.4);">
      🌱🌿🍃<br>🗂️📄📄📁<br>
      <span style="color:#aaa;">Messy!</span>
    </div>
    <ul style="margin:1em 0 0 0;padding:0;list-style:none;font-size:1.05em;color:#888;">
      ${beforeGroups.map(g => `<li><b>${g.folder}:</b> ${g.files.map(f=>f.name).join(", ")}</li>`).join("")}
    </ul>
  `;

  // AFTER: Pruned, happy plant and tidy folders
  const afterDiv = document.createElement('div');
  afterDiv.style.transition = "transform 1.2s, opacity 1.2s";
  afterDiv.style.minWidth = "220px";
  afterDiv.style.opacity = 0;
  afterDiv.innerHTML = `
    <div style="font-size:3em;text-align:center;">
      🌱<span style="color:#5cb85c;">✨🌸</span><br>🗂️ <span style="color:#357a38;">📁📁📁</span><br>
      <span style="color:#357a38;">Tidy!</span>
    </div>
    <ul style="margin:1em 0 0 0;padding:0;list-style:none;font-size:1.05em;color:#357a38;">
      ${afterGroups.map(g => `<li><b>${g.folder}:</b> ${g.files.map(f=>f.name).join(", ")}</li>`).join("")}
    </ul>
  `;

  animation.appendChild(beforeDiv);
  animation.appendChild(afterDiv);

  modal.style.display = 'flex';

  // Animate the switch after 1 second
  setTimeout(() => {
    beforeDiv.style.opacity = 0.1;
    beforeDiv.style.transform = "scale(0.9) rotate(-4deg)";
    afterDiv.style.opacity = 1;
    afterDiv.style.transform = "scale(1.07) rotate(2deg)";
  }, 1000);

  // Close button handler
  document.getElementById('closeBeforeAfter').onclick = () => {
    modal.style.display = 'none';
  };
}
// === Media Cleaner Delete Confirmation Modal Logic ===

function showMediaDeleteModal(selectedFiles) {
  const modal = document.getElementById('mediaDeleteModal');
  const msg = document.getElementById('mediaDeleteModalMsg');
  const preview = document.getElementById('mediaDeletePreview');

  msg.textContent = `You are about to delete ${selectedFiles.length} files. Review below before confirming.`;
  preview.innerHTML = selectedFiles.map(f =>
    f.type === 'video'
      ? `<video src="${f.preview || ''}" controls width="64" height="48"></video>`
      : `<img src="${f.preview || 'https://via.placeholder.com/120x80?text=Image'}" alt="${f.name}" title="${f.name}" />`
  ).join('');
  modal.style.display = 'block';

  // Confirm deletion handler
  document.getElementById('mediaDeleteConfirmBtn').onclick = function() {
    modal.style.display = 'none';
    // Actually delete files
    mediaDeletedFilesBin.push(...selectedFiles);
    selectedFiles.forEach(f => {
      const idx = mockFiles.indexOf(f);
      if (idx !== -1) mockFiles.splice(idx, 1);
    });
    growPlant(selectedFiles.length);
    renderMediaCleaner();
  };

  // Slideshow handler
  document.getElementById('mediaDeleteSlideshowBtn').onclick = function() {
    showMediaDeleteSlideshow(selectedFiles);
  };
}

// Slideshow for delete review
function showMediaDeleteSlideshow(selectedFiles) {
  const preview = document.getElementById('mediaDeletePreview');
  let idx = 0;
  renderSlide();
  function renderSlide() {
    const f = selectedFiles[idx];
    preview.innerHTML =
      (f.type === 'video'
        ? `<video src="${f.preview || ''}" controls width="220" height="150"></video>`
        : `<img src="${f.preview || 'https://via.placeholder.com/220x150?text=Image'}" alt="${f.name}" title="${f.name}" width="220" height="150" />`)
      + `<div class="slideshow-controls">
            <button class="prune-btn secondary small-btn" ${idx === 0 ? 'disabled' : ''} id="slidePrevBtn">&larr; Prev</button>
            <span>${idx + 1} / ${selectedFiles.length}</span>
            <button class="prune-btn secondary small-btn" ${idx === selectedFiles.length - 1 ? 'disabled' : ''} id="slideNextBtn">Next &rarr;</button>
        </div>
        <div style="margin-top:0.2em; text-align:center; color:#888;">${f.name}</div>
      `;
    setTimeout(() => {
      const prevBtn = document.getElementById('slidePrevBtn');
      const nextBtn = document.getElementById('slideNextBtn');
      if (prevBtn) prevBtn.onclick = () => { if (idx > 0) { idx--; renderSlide(); } };
      if (nextBtn) nextBtn.onclick = () => { if (idx < selectedFiles.length - 1) { idx++; renderSlide(); } };
    }, 0);
  }
}

// Modal close/cancel
document.getElementById('mediaDeleteModalClose').onclick =
document.getElementById('mediaDeleteCancelBtn').onclick = function() {
  document.getElementById('mediaDeleteModal').style.display = 'none';
};

// === PROGRAM/SHORTCUT ORGANIZER ===
const programShortcuts = [
  { name: "Word 2021", type: "Office", path: "C:\\Program Files\\Microsoft Office\\Word.exe", lastUsed: "2025-06-20", broken: false, pinned: true },
  { name: "Minecraft", type: "Game", path: "C:\\Games\\Minecraft\\Minecraft.exe", lastUsed: "2025-01-12", broken: false, pinned: false },
  { name: "OldApp.lnk", type: "Utility", path: "C:\\OldApp\\OldApp.exe", lastUsed: null, broken: true, pinned: false },
  { name: "Calculator", type: "Utility", path: "C:\\Windows\\System32\\calc.exe", lastUsed: "2025-07-15", broken: false, pinned: true },
  { name: "Steam", type: "Game", path: "C:\\Program Files\\Steam\\Steam.exe", lastUsed: "2025-07-08", broken: false, pinned: false },
  { name: "Untitled Shortcut", type: "Other", path: "C:\\Other\\Untitled.exe", lastUsed: null, broken: false, pinned: false }
];

// Utility functions
function isUnusedShortcut(sc, thresholdDays = 180) {
  if (!sc.lastUsed) return true;
  const last = new Date(sc.lastUsed);
  const now = new Date();
  return ((now - last) / (1000 * 60 * 60 * 24)) > thresholdDays;
}
function getDuplicateShortcuts(shortcuts) {
  const pathMap = {};
  const nameMap = {};
  shortcuts.forEach(sc => {
    if (!pathMap[sc.path]) pathMap[sc.path] = [];
    pathMap[sc.path].push(sc);
    if (!nameMap[sc.name]) nameMap[sc.name] = [];
    nameMap[sc.name].push(sc);
  });
  const dups = [];
  Object.values(pathMap).forEach(arr => { if (arr.length > 1) dups.push(...arr); });
  Object.values(nameMap).forEach(arr => { if (arr.length > 1) dups.push(...arr); });
  return Array.from(new Set(dups));
}
function isBadShortcutName(name) {
  return (
    !name ||
    /^untitled/i.test(name) ||
    /^shortcut/i.test(name) ||
    /^new/i.test(name) ||
    name.length < 4
  );
}

// Bulk selection logic
let selectedShortcuts = new Set();
function toggleSelectShortcut(idx) {
  if (selectedShortcuts.has(idx)) selectedShortcuts.delete(idx);
  else selectedShortcuts.add(idx);
  renderProgramShortcutList();
}
function selectAllShortcuts() {
  selectedShortcuts = new Set(programShortcuts.map((_, idx) => idx));
  renderProgramShortcutList();
}
function deselectAllShortcuts() {
  selectedShortcuts.clear();
  renderProgramShortcutList();
}

// Main render function
function renderProgramShortcutList(filterCategory) {
  const area = document.getElementById('programShortcutArea');
  if (!area) return;
  area.innerHTML = `
    <div class="bulk-actions">
      <button class="prune-btn small-btn" onclick="selectAllShortcuts()">Select All</button>
      <button class="prune-btn small-btn" onclick="deselectAllShortcuts()">Deselect All</button>
      <button class="prune-btn small-btn bulk-launch-btn" onclick="bulkLaunchShortcuts()">Bulk Launch</button>
      <button class="prune-btn small-btn bulk-delete-btn" onclick="bulkDeleteShortcuts()">Bulk Delete</button>
      <button class="prune-btn small-btn bulk-pin-btn" onclick="bulkPinShortcuts()">Bulk Pin/Unpin</button>
      <button class="prune-btn small-btn bulk-export-btn" onclick="exportShortcuts()">Export List</button>
      <button class="prune-btn small-btn bulk-create-btn" onclick="openCreateShortcutModal()">Create Shortcut</button>
    </div>
    <div class="category-filter">
      <label for="shortcutCategoryFilter">Category: </label>
      <select id="shortcutCategoryFilter">
        <option value="">All</option>
        ${Array.from(new Set(programShortcuts.map(s => s.type || "Other"))).map(cat => `<option value="${cat}">${cat}</option>`).join("")}
      </select>
    </div>
    <ul class="program-shortcut-list"></ul>
    <div id="shortcutHealthMeter"></div>
    <div id="createShortcutModal" class="modal" style="display:none;">
      <div class="modal-content">
        <span class="close" onclick="closeCreateShortcutModal()">&times;</span>
        <h3>Create New Shortcut</h3>
        <form id="createShortcutForm">
          <input type="text" name="name" placeholder="Shortcut Name" required><br>
          <input type="text" name="type" placeholder="Category" required><br>
          <input type="text" name="path" placeholder="Target Path" required><br>
          <button type="submit" class="prune-btn small-btn">Create</button>
        </form>
      </div>
    </div>
  `;
  let shortcuts = programShortcuts;
  if (filterCategory) {
    shortcuts = shortcuts.filter(sc => sc.type === filterCategory);
  }
  const ul = area.querySelector('ul');
  const duplicates = getDuplicateShortcuts(shortcuts);

  shortcuts.forEach((shortcut, idx) => {
    const li = document.createElement('li');
    li.className = "shortcut-item";
    if (shortcut.broken) li.classList.add('shortcut-broken');
    if (isUnusedShortcut(shortcut, 180)) li.classList.add('shortcut-unused');
    if (selectedShortcuts.has(idx)) li.classList.add('shortcut-selected');
    if (duplicates.includes(shortcut)) li.classList.add('shortcut-duplicate');
    if (isBadShortcutName(shortcut.name)) li.classList.add('shortcut-badname');
    li.innerHTML = `
      <input type="checkbox" ${selectedShortcuts.has(idx) ? "checked" : ""} onclick="toggleSelectShortcut(${idx})">
      <span class="shortcut-icon">🔗</span>
      <span class="shortcut-name" contenteditable="true" onblur="renameShortcut(${idx},this.textContent)">${shortcut.name}</span>
      <span class="shortcut-type-badge">${shortcut.type || "Other"}</span>
      <span class="shortcut-path" title="Target Path">${shortcut.path}</span>
      <span class="shortcut-lastused" title="Last Used">${shortcut.lastUsed ? "Last used: " + shortcut.lastUsed : "Unused"}</span>
      <span class="shortcut-status-badges">
        ${shortcut.broken ? '<span class="badge broken">Broken</span>' : ''}
        ${isUnusedShortcut(shortcut, 180) ? '<span class="badge unused">Unused</span>' : ''}
        ${selectedShortcuts.has(idx) ? '<span class="badge selected">Selected</span>' : ''}
        ${duplicates.includes(shortcut) ? '<span class="badge duplicate">Duplicate</span>' : ''}
        ${isBadShortcutName(shortcut.name) ? '<span class="badge badname">Bad Name</span>' : ''}
        ${shortcut.pinned ? '<span class="badge pinned">Pinned</span>' : ''}
      </span>
      <button class="prune-btn small-btn" onclick="launchShortcut(${idx})">Launch</button>
      <button class="prune-btn small-btn" onclick="deleteShortcut(${idx})">Delete</button>
      <button class="prune-btn small-btn" onclick="editShortcut(${idx})">Edit</button>
      <button class="prune-btn small-btn" onclick="togglePinShortcut(${idx})">${shortcut.pinned ? "Unpin" : "Pin"}</button>
      <button class="prune-btn small-btn" onclick="openLocation(${idx})">Open Location</button>
    `;
    ul.appendChild(li);
  });

  const catFilter = area.querySelector("#shortcutCategoryFilter");
  if (catFilter) {
    catFilter.value = filterCategory || "";
    catFilter.onchange = (e) => {
      renderProgramShortcutList(e.target.value || undefined);
    }
  }
  renderShortcutHealthMeter();
}

// Actions
function launchShortcut(idx) {
  const sc = programShortcuts[idx];
  alert(`Launching ${sc.name} at ${sc.path}`);
}
function deleteShortcut(idx) {
  if (!confirm(`Delete shortcut "${programShortcuts[idx].name}"?`)) return;
  programShortcuts.splice(idx, 1);
  selectedShortcuts.delete(idx);
  renderProgramShortcutList();
}
function bulkDeleteShortcuts() {
  if (!selectedShortcuts.size) return alert("Select shortcuts to delete.");
  if (!confirm("Delete selected shortcuts?")) return;
  Array.from(selectedShortcuts).sort((a,b) => b-a).forEach(idx => programShortcuts.splice(idx, 1));
  selectedShortcuts.clear();
  renderProgramShortcutList();
}
function bulkLaunchShortcuts() {
  if (!selectedShortcuts.size) return alert("Select shortcuts to launch.");
  Array.from(selectedShortcuts).forEach(idx => launchShortcut(idx));
}
function editShortcut(idx) {
  const sc = programShortcuts[idx];
  const newName = prompt("Edit shortcut name:", sc.name);
  if (newName && newName.trim()) sc.name = newName.trim();
  const newPath = prompt("Edit target path:", sc.path);
  if (newPath && newPath.trim()) sc.path = newPath.trim();
  const newType = prompt("Edit category/type:", sc.type);
  if (newType && newType.trim()) sc.type = newType.trim();
  renderProgramShortcutList();
}
function renameShortcut(idx, newName) {
  if (newName && newName.trim()) {
    programShortcuts[idx].name = newName.trim();
    renderProgramShortcutList();
  }
}
function togglePinShortcut(idx) {
  programShortcuts[idx].pinned = !programShortcuts[idx].pinned;
  renderProgramShortcutList();
}
function bulkPinShortcuts() {
  if (!selectedShortcuts.size) return alert("Select shortcuts to pin/unpin.");
  Array.from(selectedShortcuts).forEach(idx => {
    programShortcuts[idx].pinned = !programShortcuts[idx].pinned;
  });
  renderProgramShortcutList();
}
function openLocation(idx) {
  alert(`Open location for: ${programShortcuts[idx].path}`);
}
function exportShortcuts() {
  const csv = programShortcuts.map(sc =>
    `"${sc.name}","${sc.type}","${sc.path}","${sc.lastUsed || ""}","${sc.broken}","${sc.pinned}"`
  ).join("\n");
  const blob = new Blob([csv], {type: "text/csv"});
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = "shortcuts.csv";
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
}
function renderShortcutHealthMeter() {
  const meter = document.getElementById('shortcutHealthMeter');
  if (!meter) return;
  const total = programShortcuts.length;
  const broken = programShortcuts.filter(sc => sc.broken).length;
  const unused = programShortcuts.filter(sc => isUnusedShortcut(sc, 180)).length;
  const duplicates = getDuplicateShortcuts(programShortcuts).length;
  meter.innerHTML = `
    <div class="health-meter">
      <span>Shortcut Health Meter:</span>
      <span class="badge broken">Broken: ${broken}</span>
      <span class="badge unused">Unused: ${unused}</span>
      <span class="badge duplicate">Duplicates: ${duplicates}</span>
      <span class="badge total">Total: ${total}</span>
    </div>
  `;
}

// Create Shortcut Modal
function openCreateShortcutModal() {
  document.getElementById('createShortcutModal').style.display = 'block';
}
function closeCreateShortcutModal() {
  document.getElementById('createShortcutModal').style.display = 'none';
}
window.openCreateShortcutModal = openCreateShortcutModal;
window.closeCreateShortcutModal = closeCreateShortcutModal;
document.addEventListener('DOMContentLoaded', () => {
  renderProgramShortcutList();
  const form = document.getElementById('createShortcutForm');
  if (form) {
    form.onsubmit = function(e) {
      e.preventDefault();
      const name = form.name.value;
      const type = form.type.value;
      const path = form.path.value;
      programShortcuts.push({ name, type, path, lastUsed: null, broken: false, pinned: false });
      closeCreateShortcutModal();
      renderProgramShortcutList();
    };
  }
});

window.toggleSelectShortcut = toggleSelectShortcut;
window.selectAllShortcuts = selectAllShortcuts;
window.deselectAllShortcuts = deselectAllShortcuts;
window.bulkDeleteShortcuts = bulkDeleteShortcuts;
window.bulkLaunchShortcuts = bulkLaunchShortcuts;
window.bulkPinShortcuts = bulkPinShortcuts;
window.renameShortcut = renameShortcut;
window.deleteShortcut = deleteShortcut;
window.launchShortcut = launchShortcut;
window.editShortcut = editShortcut;
window.togglePinShortcut = togglePinShortcut;
window.openLocation = openLocation;
window.exportShortcuts = exportShortcuts;
if (closeBeforeAfter) {
  closeBeforeAfter.onclick = function() {
    beforeAfterModal.style.display = 'none';
  };
}

// Optional: also close the modal when clicking the background outside the content
if (beforeAfterModal) {
  beforeAfterModal.addEventListener('click', function(e) {
    if (e.target === beforeAfterModal) {
      beforeAfterModal.style.display = 'none';
    }
  });
}
/// ========== REPORTS SECTION FUNCTIONALITY ==========

// Only show confetti once per page load/session
window.confettiShown = false;

// Nature confetti function (add this if you don't already have one)
function triggerConfetti() {
  // Create a temporary fullscreen canvas for confetti
  const canvas = document.createElement('canvas');
  canvas.id = 'natureConfettiCanvas';
  canvas.style.position = "fixed";
  canvas.style.top = 0;
  canvas.style.left = 0;
  canvas.style.width = "100vw";
  canvas.style.height = "100vh";
  canvas.style.pointerEvents = "none";
  canvas.style.zIndex = 10000;
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  document.body.appendChild(canvas);

  const emojis = ["🌿", "🌸", "🍃", "🌻", "🪴", "🌼"];
  const ctx = canvas.getContext('2d');
  const drops = Array.from({ length: 30 }).map(() => ({
    x: Math.random() * canvas.width,
    y: -20,
    emoji: emojis[Math.floor(Math.random() * emojis.length)],
    speed: 2 + Math.random() * 4,
    size: 28 + Math.random() * 22
  }));

  let frames = 0;
  function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drops.forEach(d => {
      ctx.font = `${d.size}px serif`;
      ctx.fillText(d.emoji, d.x, d.y);
      d.y += d.speed;
    });
    frames++;
    if (frames < 90) {
      requestAnimationFrame(draw);
    } else {
      document.body.removeChild(canvas);
    }
  }
  draw();
}

// Render summary, charts, history, export, and social sharing for the Reports section
function renderReportsSection() {
  // 1. Summaries & plant mascot
  const summaryDiv = document.getElementById('reportsSummary');
  const totalFiles = pruneMockReports.reduce((s, r) => s + r.filesCleaned, 0);
  const totalMB = pruneMockReports.reduce((s, r) => s + r.spaceSavedMB, 0);

  // Pick mascot emoji based on progress
  let plantStageEmoji = "🪴";
  if (totalFiles > 60) {
    plantStageEmoji = "🌳";
  } else if (totalFiles > 30) {
    plantStageEmoji = "🌿";
  } else if (totalFiles > 0) {
    plantStageEmoji = "🌱";
  }

  // Compose summary
  summaryDiv.innerHTML = `
    <div style="font-size:3em; text-align:center; margin-bottom:0.2em">${plantStageEmoji}</div>
    <span style="font-size:1.3em;">🌿 <b>Total files pruned:</b> ${totalFiles}</span><br>
    <span style="font-size:1.3em;">💾 <b>Total space saved:</b> ${totalMB} MB</span><br>
    <span style="font-size:1.1em;">🪴 <b>Cleanups recorded:</b> ${pruneMockReports.length}</span>
  `;

  // Encouragement message
  let growthMsg = "";
  if (totalFiles > 60) {
    growthMsg = "🌳 Your Prune plant is a thriving tree!";
  } else if (totalFiles > 30) {
    growthMsg = "🌿 Your Prune plant is growing strong!";
  } else if (totalFiles > 0) {
    growthMsg = "🌱 Your Prune plant has sprouted!";
  } else {
    growthMsg = "🪴 Start pruning to grow your digital plant!";
  }
  summaryDiv.innerHTML += `<br><span style="color:#357a38;font-size:1.08em;">${growthMsg}</span>`;

  // Confetti for milestone (only once per session)
  if (totalMB >= 200 && !window.confettiShown) {
    summaryDiv.innerHTML += "<br>🎉 <b>New space-saving record!</b> 🎉";
    if (typeof triggerConfetti === "function") {
      triggerConfetti();
      window.confettiShown = true;
    }
  }

  // --- Social Share Buttons for Desktop App (no URL) ---
  const shareText = encodeURIComponent(
    `I just pruned ${totalFiles} files and saved ${totalMB} MB with Prune! 🌱🪴🌳 #PruneApp`
  );

  
  // 2. Charts
  const chartsDiv = document.getElementById('reportsCharts');
  chartsDiv.innerHTML = `
    <div class="report-chart-container"><canvas id="spaceSavedChart"></canvas></div>
    <div class="report-chart-container"><canvas id="fileTypesChart"></canvas></div>
    <div class="report-chart-container"><canvas id="foldersChart"></canvas></div>
    <div class="report-chart-container"><canvas id="plantMilestonesChart"></canvas></div>
  `;

  // Chart: Space saved over time
  new Chart(document.getElementById('spaceSavedChart').getContext('2d'), {
    type: 'line',
    data: {
      labels: pruneMockReports.map(r => r.date),
      datasets: [{
        label: 'Space Saved (MB)',
        data: pruneMockReports.map(r => r.spaceSavedMB),
        backgroundColor: 'rgba(109,57,114,0.13)',
        borderColor: 'rgba(109,57,114,1)',
        borderWidth: 2,
        fill: true,
        tension: 0.4
      }]
    },
    options: { plugins: { title: { display: true, text: '🌿 Space Saved Over Time' }, legend: { display: false } },
      scales: { y: { beginAtZero: true } }
    }
  });

  // Chart: File types cleaned (aggregate)
  const typeTotals = {};
  pruneMockReports.forEach(r => {
    for (const [type, count] of Object.entries(r.fileTypes)) {
      typeTotals[type] = (typeTotals[type] || 0) + count;
    }
  });
  new Chart(document.getElementById('fileTypesChart').getContext('2d'), {
    type: 'pie',
    data: {
      labels: Object.keys(typeTotals),
      datasets: [{
        data: Object.values(typeTotals),
        backgroundColor: [
          '#6D3972', '#A23E48', '#9D5C97', '#dadbe3', '#c08497', '#A7BFE8', '#FFD166'
        ]
      }]
    },
    options: { plugins: { title: { display: true, text: '🍃 File Types Pruned' } } }
  });

  // Chart: Most cleaned folders (aggregate)
  const folderTotals = {};
  pruneMockReports.forEach(r => {
    for (const [folder, count] of Object.entries(r.folders)) {
      folderTotals[folder] = (folderTotals[folder] || 0) + count;
    }
  });
  new Chart(document.getElementById('foldersChart').getContext('2d'), {
    type: 'bar',
    data: {
      labels: Object.keys(folderTotals),
      datasets: [{
        label: 'Files Cleaned',
        data: Object.values(folderTotals),
        backgroundColor: '#9D5C97'
      }]
    },
    options: { plugins: { title: { display: true, text: '🗂️ Folders Cleaned Most Often' } }, indexAxis: 'y' }
  });

  // Chart: Plant milestones (stage by cleanup event)
  new Chart(document.getElementById('plantMilestonesChart').getContext('2d'), {
    type: 'line',
    data: {
      labels: pruneMockReports.map(r => r.date),
      datasets: [{
        label: 'Plant Stage',
        data: pruneMockReports.map(r => r.plantStage),
        borderColor: '#A23E48',
        backgroundColor: 'rgba(162,62,72,0.1)',
        borderWidth: 3,
        fill: true,
        pointRadius: 5,
        pointBackgroundColor: '#A23E48'
      }]
    },
    options: {
      plugins: { title: { display: true, text: '🪴 Plant Growth Milestones' }, legend: { display: false } },
      scales: { y: { beginAtZero: true, stepSize: 1, ticks: { precision: 0 } } }
    }
  });

  // 3. History table
  const historyDiv = document.getElementById('reportsHistory');
  historyDiv.innerHTML = `
    <h3>Cleanup History</h3>
    <table>
      <thead>
        <tr>
          <th>Date</th>
          <th>Files Cleaned</th>
          <th>Space Saved (MB)</th>
          <th>Top Types</th>
          <th>Top Folder</th>
        </tr>
      </thead>
      <tbody>
        ${pruneMockReports.map(r => `
          <tr>
            <td>${r.date}</td>
            <td>${r.filesCleaned}</td>
            <td>${r.spaceSavedMB}</td>
            <td>${Object.entries(r.fileTypes).sort((a,b)=>b[1]-a[1])[0][0]}</td>
            <td>${Object.entries(r.folders).sort((a,b)=>b[1]-a[1])[0][0]}</td>
          </tr>
        `).join('')}
      </tbody>
    </table>
  `;
}

// Export as CSV
function exportReportsCSV() {
  let csv = "Date,Files Cleaned,Space Saved (MB),File Types (JSON),Folders (JSON),Plant Stage\n";
  pruneMockReports.forEach(r => {
    csv += [
      r.date,
      r.filesCleaned,
      r.spaceSavedMB,
      JSON.stringify(r.fileTypes),
      JSON.stringify(r.folders),
      r.plantStage
    ].join(",") + "\n";
  });
  const blob = new Blob([csv], {type: "text/csv"});
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = "prune-reports.csv";
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
}

// Hook up navigation and export
document.addEventListener('DOMContentLoaded', () => {
  // Show reports when section is visible
  const navReports = document.querySelector('nav li[data-section="reports"]');
  if (navReports) {
    navReports.addEventListener('click', renderReportsSection);
  }
  // Or render if already on reports
  if (document.getElementById('reports').classList.contains('visible')) {
    renderReportsSection();
  }
  // Export button
  document.getElementById('exportReportsBtn').onclick = exportReportsCSV;
});
document.addEventListener('DOMContentLoaded', function() {
  var copyBtn = document.getElementById('share-copy');
  if (copyBtn) {
    copyBtn.onclick = function() {
      navigator.clipboard.writeText(window.location.href);
      copyBtn.blur();
      copyBtn.title = "Copied!";
      setTimeout(function() {
        copyBtn.title = "Copy Link";
      }, 1000);
    };
  }
});
// === DASHBOARD WELLNESS & CUSTOMIZATION LOGIC ===

// Digital Wellness variables
const lastPruneMsg = document.getElementById('lastPruneMsg');
const breakReminders = document.getElementById('breakReminders');
const declutterGoal = document.getElementById('declutterGoal');
const goalProgress = document.getElementById('goalProgress');
const wellnessTip = document.getElementById('wellnessTip');

// --- BREAK REMINDER NOTIFICATION LOGIC (FIXED & CONSOLIDATED) ---
let breakReminderTimer = null;
const BREAK_INTERVAL_MINUTES = .5; // Change to 0.05 for testing (3 seconds)

function startBreakReminderLoop() {
  if (breakReminderTimer) clearInterval(breakReminderTimer);
  if (!breakReminders.checked) {
    console.log('[BreakReminder] Reminders not enabled');
    return;
  }

  console.log('[BreakReminder] Setting up interval...');
  if ('Notification' in window && Notification.permission === 'default') {
    Notification.requestPermission().then(permission => {
      console.log('[BreakReminder] Permission result:', permission);
      if (permission === 'granted') {
        sendBreakNotification();
      }
    });
  }

  breakReminderTimer = setInterval(() => {
    console.log('[BreakReminder] Timer fired');
    sendBreakNotification();
  }, BREAK_INTERVAL_MINUTES * 60 * 1000);
}

function sendBreakNotification() {
  console.log('Sending notification. Permission:', Notification.permission);
  if ('Notification' in window && Notification.permission === 'granted') {
    new Notification("🌿 Time for a break!", {
      body: "Step away for a few minutes and stretch. Your digital plant thanks you!",
      icon: "plant3.png"
    });
    console.log('Notification sent!');
  }
}

// Listen for toggle changes
breakReminders.addEventListener('change', () => {
  localStorage.setItem('breakReminders', breakReminders.checked ? "1" : "0");
  if (breakReminders.checked) {
    if ('Notification' in window && Notification.permission === "granted") {
      sendBreakNotification();
    }
    startBreakReminderLoop();
  } else {
    if (breakReminderTimer) clearInterval(breakReminderTimer);
    breakReminderTimer = null;
  }
});

// Restore setting on page load
if (localStorage.getItem('breakReminders') === "1") {
  breakReminders.checked = true;
  startBreakReminderLoop();
}

// Customization variables
const themePicker = document.getElementById('themePicker');
const motivationalQuote = document.getElementById('motivationalQuote');
const nextQuoteBtn = document.getElementById('nextQuoteBtn');
const unlockables = document.getElementById('unlockables');

// --- Digital Wellness Logic ---
let pruneHistory = JSON.parse(localStorage.getItem('pruneHistory') || '[]');
let goalFiles = Number(localStorage.getItem('declutterGoal') || 3);
let filesTidiedToday = Number(localStorage.getItem('filesTidiedToday') || 0);

function updateWellnessUI() {
  // Show last prune time in days
  const last = pruneHistory.length ? new Date(pruneHistory[pruneHistory.length - 1]) : null;
  lastPruneMsg.textContent = last
    ? `You last pruned ${Math.round((Date.now() - last) / (24*60*60*1000))} days ago 🌱`
    : "You haven't pruned yet!";
  // Goal progress
  goalProgress.textContent = `${filesTidiedToday}/${goalFiles} files tidied`;
  declutterGoal.value = goalFiles;
  // Random wellness tip
  const tips = [
    "Remember to stretch and look away from the screen every hour.",
    "Decluttering a little each day prevents overwhelm.",
    "Take a deep breath and enjoy your tidy space.",
    "Digital plants thrive when you do!"
  ];
  wellnessTip.textContent = tips[Math.floor(Math.random() * tips.length)];
}
declutterGoal.addEventListener('change', () => {
  goalFiles = Number(declutterGoal.value);
  localStorage.setItem('declutterGoal', goalFiles);
  updateWellnessUI();
});

// (Removed duplicate breakReminders event listener - it's handled above)
updateWellnessUI();// --- Customization Logic ---
const quotes = [
  "Small steps grow big trees!",
  "Every tidy file is a fresh start.",
  "Let your digital garden flourish.",
  "A clean desktop is a calm mind."
];
let quoteIndex = 0;
nextQuoteBtn.addEventListener('click', () => {
  quoteIndex = (quoteIndex + 1) % quotes.length;
  motivationalQuote.textContent = quotes[quoteIndex];
});
themePicker.addEventListener('change', () => {
  localStorage.setItem('plantTheme', themePicker.value);
  // You could update the sidebar plant here based on themePicker.value!
});
document.getElementById('testBreakNotificationBtn').onclick = function() {
  if ('Notification' in window) {
    if (Notification.permission === "granted") {
      new Notification("Test notification from Prune!", { body: "You should see this message." });
    } else if (Notification.permission === "default") {
      Notification.requestPermission().then(function(permission) {
        if (permission === "granted") {
          new Notification("Test notification from Prune!", { body: "Permission granted and this message should appear." });
        } else {
          alert("Notification permission was denied.");
        }
      });
    } else {
      alert("Notifications are blocked for this site.");
    }
  } else {
    alert("This browser doconsole.log("script.js loaded");

const testBtn = document.getElementById('testBreakNotificationBtn');
console.log("testBreakNotificationBtn found:", !!testBtn);

if (testBtn) {
  testBtn.onclick = function() {
    console.log("Test Notification button clicked");
    if ('Notification' in window) {
      if (Notification.permission === "granted") {
        new Notification("Test notification from Prune!", { body: "You should see this message." });
      } else if (Notification.permission === "default") {
        Notification.requestPermission().then(function(permission) {
          if (permission === "granted") {
            new Notification("Test notification from Prune!", { body: "Permission granted and this message should appear." });
          } else {
            alert("Notification permission was denied.");
          }
        });
      } else {
        alert("Notifications are blocked for this site.");
      }
    } else {
      alert("This browser does not support notifications.");
    }
  };
} else {
  console.log("testBreakNotificationBtn is missing from the DOM.");
}es not support notifications.");
  }
};

