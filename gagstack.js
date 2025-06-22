// --- Block access to index2.html if not signed in via sessionStorage ---
if (sessionStorage.getItem("gagstack_signedin") !== "yes") {
  window.location.replace("index.html");
}

// Navigation toggle
const navToggle = document.getElementById("navToggle");
const mainNav = document.getElementById("mainNav");
navToggle.addEventListener("click", function () {
  mainNav.classList.toggle("open");
  if (mainNav.classList.contains("open")) {
    setTimeout(() => {
      window.addEventListener("click", navCloseHandler);
    }, 0);
  }
});
function navCloseHandler(e) {
  if (!mainNav.contains(e.target)) {
    mainNav.classList.remove("open");
    window.removeEventListener("click", navCloseHandler);
  }
}

// Theme selector
const themeSelect = document.getElementById("themeSelect");
function setTheme(theme) {
  document.documentElement.setAttribute("data-theme", theme);
  localStorage.setItem("gag_theme", theme);
}
themeSelect.addEventListener("change", function () {
  setTheme(this.value);
});
(function () {
  const theme = localStorage.getItem("gag_theme");
  if (theme) {
    setTheme(theme);
    themeSelect.value = theme;
  } else {
    setTheme("main");
    themeSelect.value = "main";
  }
})();

// Highlight current nav link
(function () {
  const navLinks = document.querySelectorAll(".nav-link");
  const page = window.location.pathname.replace(/\\/g, '/').split('/').pop() || "index.html";
  navLinks.forEach(link => {
    if (link.getAttribute("href") === page) {
      link.classList.add("active");
    } else {
      link.classList.remove("active");
    }
  });
})();

// Notification permission
if ("Notification" in window && Notification.permission !== "granted") {
  Notification.requestPermission();
}

// Important items lists
const importantHoney = [];
const importantEggs = ["Bug Egg", "Rare Egg", "Legendary Egg", "Mythical Egg"];
const importantSeeds = [
  "Ember Lily Seed", "Sugar Apple Seed", "Beanstalk Seed", "Cacao Seed", "Pepper Seed", "Mushroom Seed", "Grape Seed",
  "Elephant Ears", "Rosy Delight", "Parasol Flower", "Cantaloupe", "Pear", "Wild Carrot",
  "Mango Seed", "Green Apple", "Avocado", "Banana", "Pineapple", "Bell Pepper", "Prickly Pear", "Kiwi", "Feijoa", "Loquat"
];
const importantGears = ["Basic Sprinkler", "Advanced Sprinkler", "Godly Sprinkler", "Master Sprinkler", "Lightning Rod", "Tanning Mirror", "Friendship Pot"];
let notifiedAvailable = {};

// Emoji mapping
const emojis = {
  "Rare Summer Egg": '🌞🍳',
  "Common Summer Egg": '🌞🥚',
  "Paradise Egg": '🏝️🥚',
  "Common Egg": '🥚',
  "Uncommon Egg": '🐣',
  "Rare Egg": '🍳',
  "Legendary Egg": '🪺',
  "Mythical Egg": '🔮',
  "Bug Egg": '🪲',
  "Watering Can": '🚿',
  "Cleaning Spray": '🧴',
  "Friendship Pot": '💑',
  "Trowel": "🛠️",
  "Recall Wrench": '🔧',
  "Basic Sprinkler": '💧',
  "Advanced Sprinkler": '💦',
  "Godly Sprinkler": '⛲',
  "Tanning Mirror": '🧴☀️',
  "Lightning Rod": '⚡',
  "Master Sprinkler": '🌊',
  "Favorite Tool": '❤️',
  "Harvest Tool": '🌾',
  "Carrot": '🥕',
  "Strawberry": '🍓',
  "Blueberry": '🫐',
  "Orange Tulip": '🌷',
  "Tomato": '🍅',
  "Corn": '🌽',
  "Daffodil": '🌼',
  "Watermelon": '🍉',
  "Pumpkin": '🎃',
  "Apple": '🍎',
  "Bamboo": '🎍',
  "Coconut": '🥥',
  "Cactus": '🌵',
  "Dragon Fruit": '🍈',
  "Mango": '🥭',
  "Grape": '🍇',
  "Mushroom": '🍄',
  "Pepper": "🌶️",
  "Cacao": '🍫',
  "Beanstalk": '🌱',
  "Ember Lily": "🏵️",
  "Sugar Apple": '🍏',
  "Wild Honey": '🍯',
  "Royal Jelly": '👑',
  "Sunflower Crown": '🌻',
  "Bunny Ears": '🐰',
  "Pumpkin Mask": '🎭',
  "Cherry Blossom Pin": '🌸',
  // Summer update/new seeds
  "Banana": "🍌", "Pineapple": "🍍", "Kiwi": "🥝", "Bell Pepper": "🫑", "Prickly Pear": "🌵", "Avocado": "🥑",
  "Green Apple": "🍏", "Cauliflower": "🥦", "Pear": "🍐", "Cantaloupe": "🍈", "Wild Carrot": "🥕", "Loquat": "🍑",
  "Feijoa": "🥝", "Elephant Ears": "🌿", "Rosy Delight": "🌸", "Parasol Flower": "🌼"
};

// Utility functions
function pad(num) { return num < 10 ? '0' + num : num; }
function getPHTime() { return new Date(new Date().toLocaleString("en-US", { timeZone: "Asia/Manila" })); }
function getCountdown(targetDate) {
  const now = getPHTime();
  const ms = targetDate - now;
  if (ms <= 0) return "00h 00m 00s";
  const h = Math.floor(ms / 3600000);
  const m = Math.floor((ms % 3600000) / 60000);
  const s = Math.floor((ms % 60000) / 1000);
  return pad(h) + "h " + pad(m) + "m " + pad(s) + 's';
}
function getNextRestocks() {
  const now = getPHTime();
  const restocks = {};
  // Egg: every half hour
  const eggDate = new Date(now);
  eggDate.setSeconds(0, 0);
  if (now.getMinutes() < 30) eggDate.setMinutes(30);
  else { eggDate.setHours(now.getHours() + 1); eggDate.setMinutes(0); }
  restocks.egg = getCountdown(eggDate);
  // Gear/Seeds: every 5 minutes
  const gearDate = new Date(now);
  const next5 = Math.ceil((now.getMinutes() + (now.getSeconds() > 0 ? 1 : 0)) / 5) * 5;
  gearDate.setSeconds(0, 0);
  if (next5 === 60) { gearDate.setHours(now.getHours() + 1); gearDate.setMinutes(0); }
  else { gearDate.setMinutes(next5); }
  restocks.gear = restocks.seed = getCountdown(gearDate);
  // Honey: every hour
  const honeyDate = new Date(now);
  honeyDate.setHours(now.getHours() + 1, 0, 0, 0);
  restocks.honey = getCountdown(honeyDate);
  // Cosmetics: every 7 hours
  const cosDate = new Date(now);
  const hourFloat = now.getHours() + now.getMinutes() / 60 + now.getSeconds() / 3600;
  const next7 = Math.ceil(hourFloat / 7) * 7;
  cosDate.setHours(next7, 0, 0, 0);
  restocks.cosmetics = getCountdown(cosDate);
  return restocks;
}
function formatValue(val) {
  if (val >= 1000000) return 'x' + (val / 1000000).toFixed(1) + 'M';
  if (val >= 1000) return 'x' + (val / 1000).toFixed(1) + 'K';
  return 'x' + val;
}
function getItemPrice(item) {
  if (typeof item.price !== "undefined") return formatValue(Number(item.price));
  if (typeof item.cost !== "undefined") return formatValue(Number(item.cost));
  return '--';
}
function shouldNotify(section, name) {
  const onlyImportant = document.getElementById("importantNotifySwitch")?.checked;
  if (!onlyImportant) return true;
  if (section === "honey") return importantHoney.includes(name);
  if (section === "egg") return importantEggs.includes(name);
  if (section === "seed") return importantSeeds.includes(name);
  if (section === "gear") return importantGears.includes(name);
  return false;
}
function sendAvailabilityNotification(name, qty) {
  if ("Notification" in window && Notification.permission === "granted") {
    new Notification("Available: " + name, {
      body: "Qty: " + qty,
      icon: "https://cdn-icons-png.flaticon.com/512/616/616408.png"
    });
  }
}
function showImportantOverlay(list) {
  if (!list.length) return;
  const overlay = document.getElementById("importantOverlay");
  const availableList = document.getElementById("overlayAvailableList");
  availableList.innerHTML = list.map(({ section, name, quantity }) =>
    `<div><b>${name}</b> (${sectionLabel(section)}): <span style="color:#4be87a;font-weight:bold;">${quantity}</span></div>`
  ).join('');
  overlay.style.display = "flex";
}
function hideImportantOverlay() {
  document.getElementById("importantOverlay").style.display = "none";
}
function sectionLabel(section) {
  switch (section) {
    case "gear": return "Gear";
    case "seed": return "Seed";
    case "egg": return "Egg";
    case "honey": return "Honey";
    case "cosmetics": return "Cosmetics";
    default: return section;
  }
}

// Main fetch/render loop
async function fetchAndRender() {
  const sectionsEl = document.getElementById("sections");
  const scrollY = window.scrollY;
  const updateTimeEl = document.getElementById("updateTime");
  try {
    const res = await fetch("https://corsproxy.io/?https://gagstock.gleeze.com/grow-a-garden");
    if (!res.ok) throw new Error("Failed to fetch API");
    const data = (await res.json()).data;
    const restocks = getNextRestocks();
    const sections = [
      { label: "🛠️ Gear", emoji: "🛠️", sectionKey: "gear", rows: data.gear.items, restock: restocks.gear },
      { label: "🌱 Seeds", emoji: "🌱", sectionKey: "seed", rows: data.seed.items, restock: restocks.seed },
      { label: "🥚 Eggs", emoji: "🥚", sectionKey: "egg", rows: data.egg.items, restock: restocks.egg },
      { label: "🎨 Cosmetics", emoji: "🎨", sectionKey: "cosmetics", rows: data.cosmetics.items, restock: restocks.cosmetics },
      { label: "🍯 Honey", emoji: "🍯", sectionKey: "honey", rows: data.honey.items, restock: restocks.honey }
    ];

    let importantAvailable = [];
    ["gear", "seed", "egg", "cosmetics", "honey"].forEach(sectionKey => {
      (data[sectionKey]?.items || []).forEach(item => {
        const notify = shouldNotify(sectionKey, item.name);
        const qty = Number(item.quantity);
        if (notify && qty > 0) {
          if (!notifiedAvailable[item.name]) {
            sendAvailabilityNotification(item.name, item.quantity);
            notifiedAvailable[item.name] = true;
          }
          importantAvailable.push({ section: sectionKey, name: item.name, quantity: qty });
        } else {
          notifiedAvailable[item.name] = false;
        }
      });
    });

    const onlyImportant = document.getElementById("importantNotifySwitch")?.checked;
    if (onlyImportant && importantAvailable.length > 0) showImportantOverlay(importantAvailable);

    // Render sections
    sectionsEl.innerHTML = '';
    for (const section of sections) {
      const div = document.createElement("div");
      div.className = "section";
      if (window.innerWidth <= 550) {
        div.innerHTML = `
          <div class="section-title"><span class="emoji">${section.emoji}</span>${section.label.replace(section.emoji, '')}</div>
          <span class="restock">${section.restock ? "⏳ Restock in: " + section.restock : ''}</span>
          <table>
            <tbody>
              ${section.rows.map(row =>
                `<tr>
                  <td data-label="Item">${emojis[row.name] ? `<span class="emoji">${emojis[row.name]}</span>` : ''}${row.name}</td>
                  <td data-label="Qty Available">${formatValue(Number(row.quantity))}</td>
                  <td data-label="Price">${getItemPrice(row)}</td>
                </tr>`
              ).join('')}
            </tbody>
          </table>
        `;
      } else {
        div.innerHTML = `
          <div class="section-title"><span class="emoji">${section.emoji}</span>${section.label.replace(section.emoji, '')}</div>
          <span class="restock">${section.restock ? "⏳ Restock in: " + section.restock : ''}</span>
          <table>
            <thead>
              <tr><th>Item</th><th>Qty Available</th><th>Price</th></tr>
            </thead>
            <tbody>
              ${section.rows.map(row =>
                `<tr>
                  <td>${emojis[row.name] ? `<span class="emoji">${emojis[row.name]}</span>` : ''}${row.name}</td>
                  <td>${formatValue(Number(row.quantity))}</td>
                  <td>${getItemPrice(row)}</td>
                </tr>`
              ).join('')}
            </tbody>
          </table>
        `;
      }
      sectionsEl.appendChild(div);
    }
    updateTimeEl.textContent = "Last updated: " + new Date(new Date().toLocaleString("en-US", {
      timeZone: "Asia/Manila"
    })).toLocaleTimeString("en-PH", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit"
    });
  } catch (e) {
    updateTimeEl.innerHTML = '<span class="error-msg">Failed to fetch data! Please check your connection.</span>';
  }
  setTimeout(() => {
    window.scrollTo(0, scrollY);
  }, 0);
}

// Event listeners
document.getElementById("refresh-btn").addEventListener("click", fetchAndRender);
document.getElementById("importantNotifySwitch").addEventListener("change", () => {
  notifiedAvailable = {};
  fetchAndRender();
});
document.getElementById("overlayCloseBtn").onclick = hideImportantOverlay;
document.getElementById("aboutDevBtn").addEventListener("click", function (e) {
  e.preventDefault();
  document.getElementById("aboutDevOverlay").style.display = "flex";
});
document.getElementById("aboutDevCloseBtn").onclick = function () {
  document.getElementById("aboutDevOverlay").style.display = "none";
};
document.getElementById("aboutDevOverlay").addEventListener("click", function (e) {
  if (e.target === this) {
    this.style.display = "none";
  }
});

// Initial render and intervals
fetchAndRender();
setInterval(fetchAndRender, 5000);
window.addEventListener("resize", fetchAndRender);

// API status
async function checkApiStatus() {
  const apiStatusEl = document.getElementById("apiStatus");
  const onlineColor = getComputedStyle(document.documentElement).getPropertyValue("--online").trim() || "#4be87a";
  const offlineColor = getComputedStyle(document.documentElement).getPropertyValue("--offline").trim() || "#ff5252";
  try {
    const res = await fetch("https://corsproxy.io/?https://gagstock.gleeze.com/grow-a-garden", {
      method: "GET",
      cache: "no-cache"
    });
    if (res.ok) {
      apiStatusEl.textContent = "API: Online";
      apiStatusEl.style.color = onlineColor;
    } else {
      apiStatusEl.textContent = "API: Offline";
      apiStatusEl.style.color = offlineColor;
    }
  } catch (e) {
    apiStatusEl.textContent = "API: Offline";
    apiStatusEl.style.color = offlineColor;
  }
}
checkApiStatus();
setInterval(checkApiStatus, 15000);


// Weather section (div-based, fully responsive)
async function fetchAndRenderWeatherSection() {
  const weatherEl = document.getElementById("weatherSection");
  weatherEl.innerHTML = `
    <div class="section-title"><span class="emoji">⏳</span>Weather</div>
    <div>Loading...</div>
  `;
  try {
    const corsProxy = "https://corsproxy.io/?";
    const apiUrl = "https://growagardenstock.com/api/stock/weather";
    const res = await fetch(corsProxy + encodeURIComponent(apiUrl));
    if (!res.ok) throw new Error("Failed to fetch weather");
    const weather = await res.json();

    let updatedStr = "Unknown";
    if (weather.updatedAt) {
      updatedStr = typeof weather.updatedAt === "number"
        ? new Date(weather.updatedAt).toLocaleString()
        : weather.updatedAt;
    }

    weatherEl.innerHTML = `
      <div class="section-title"><span class="emoji">${weather.icon || "🌤️"}</span>Weather</div>
      <div class="section-content weather-content">
        <div class="row"><div class="cell label">Status</div><div class="cell value">${weather.currentWeather || weather.weatherType || "Unknown"}</div></div>
        <div class="row"><div class="cell label">Description</div><div class="cell value">${weather.description || weather.effectDescription || "None"}</div></div>
        <div class="row"><div class="cell label">Crop Bonus</div><div class="cell value">${weather.cropBonuses || "None"}</div></div>
        <div class="row"><div class="cell label">Rarity</div><div class="cell value">${weather.rarity || "Unknown"}</div></div>
        <div class="row"><div class="cell label">Visual Cue</div><div class="cell value">${weather.visualCue || "None"}</div></div>
        <div class="row"><div class="cell label">Updated</div><div class="cell value">${updatedStr}</div></div>
      </div>
    `;
  } catch (e) {
    weatherEl.innerHTML = `
      <div class="section-title"><span class="emoji">❌</span>Weather</div>
      <div style="color:red;">Weather unavailable</div>
    `;
    console.error('Weather fetch error:', e);
  }
}
fetchAndRenderWeatherSection();
setInterval(fetchAndRenderWeatherSection, 5 * 60 * 1000);
