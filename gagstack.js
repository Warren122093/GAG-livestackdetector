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
function navCloseHandler(event) {
  if (!mainNav.contains(event.target)) {
    mainNav.classList.remove("open");
    window.removeEventListener("click", navCloseHandler);
  }
}

// Theme selector and localStorage
const themeSelect = document.getElementById("themeSelect");
function setTheme(theme) {
  document.documentElement.setAttribute("data-theme", theme);
  localStorage.setItem("gag_theme", theme);
}
themeSelect.addEventListener("change", function () {
  setTheme(this.value);
});
(function () {
  const savedTheme = localStorage.getItem("gag_theme");
  if (savedTheme) {
    setTheme(savedTheme);
    themeSelect.value = savedTheme;
  } else {
    setTheme("dark");
    themeSelect.value = "dark";
  }
})();

// Highlight current nav link
(function () {
  let navLinks = document.querySelectorAll(".nav-link");
  let currentPage = window.location.pathname.replace(/\\/g, '/').split('/').pop() || "index.html";
  navLinks.forEach(link => {
    if (link.getAttribute("href") === currentPage) {
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

// Important items config
const importantHoney = ["Bee Egg"];
const importantEggs = ["Bug Egg", "Rare Egg", "Legendary Egg", "Mythical Egg"];
const importantSeeds = [
  "Ember Lily Seed", "Sugar Apple Seed", "Beanstalk Seed",
  "Cacao Seed", "Pepper Seed", "Mushroom Seed", "Grape Seed", "Mango Seed"
];
const importantGears = [
  "Basic Sprinkler", "Advanced Sprinkler", "Godly Sprinkler",
  "Master Sprinkler", "Lightning Rod", "Friendship Pot"
];
let notifiedAvailable = {};
const emojis = {
  "Common Egg": '🥚', "Uncommon Egg": '🐣', "Rare Egg": '🍳',
  "Legendary Egg": '🪺', "Mythical Egg": '🔮', "Bug Egg": '🪲',
  "Watering Can": '🚿', "Cleaning Spray": '🧴', "Friendship Pot": '💑',
  "Trowel": "🛠️", "Recall Wrench": '🔧', "Basic Sprinkler": '💧',
  "Advanced Sprinkler": '💦', "Godly Sprinkler": '⛲', "Lightning Rod": '⚡',
  "Master Sprinkler": '🌊', "Favorite Tool": '❤️', "Harvest Tool": '🌾',
  "Carrot": '🥕', "Strawberry": '🍓', "Blueberry": '🫐', "Orange Tulip": '🌷',
  "Tomato": '🍅', "Corn": '🌽', "Daffodil": '🌼', "Watermelon": '🍉',
  "Pumpkin": '🎃', "Apple": '🍎', "Bamboo": '🎍', "Coconut": '🥥',
  "Cactus": '🌵', "Dragon Fruit": '🍈', "Mango": '🥭', "Grape": '🍇',
  "Mushroom": '🍄', "Pepper": "🌶️", "Cacao": '🍫', "Beanstalk": '🌱',
  "Ember Lily": "🏵️", "Sugar Apple": '🍏', "Wild Honey": '🍯',
  "Royal Jelly": '👑', "Sunflower Crown": '🌻', "Bunny Ears": '🐰',
  "Pumpkin Mask": '🎭', "Cherry Blossom Pin": '🌸'
};

// Pad function
function pad(n) {
  return n < 10 ? '0' + n : n;
}

// Get Philippine time
function getPHTime() {
  return new Date(new Date().toLocaleString("en-US", { timeZone: "Asia/Manila" }));
}

// Countdown formatting
function getCountdown(targetDate) {
  const now = getPHTime();
  const diff = targetDate - now;
  if (diff <= 0) return "00h 00m 00s";
  const h = Math.floor(diff / 3600000);
  const m = Math.floor((diff % 3600000) / 60000);
  const s = Math.floor((diff % 60000) / 1000);
  return (h < 10 ? '0' + h : h) + "h " + (m < 10 ? '0' + m : m) + "m " + (s < 10 ? '0' + s : s) + 's';
}

// Next restock timers
function getNextRestocks() {
  const now = getPHTime();
  const out = {};
  // Egg: every 30 minutes
  const eggTime = new Date(now);
  eggTime.setSeconds(0, 0);
  if (now.getMinutes() < 30) {
    eggTime.setMinutes(30);
  } else {
    eggTime.setHours(now.getHours() + 1);
    eggTime.setMinutes(0);
  }
  out.egg = getCountdown(eggTime);

  // Gear/seed: every 5 minutes
  const gsTime = new Date(now);
  const next5 = Math.ceil((now.getMinutes() + (now.getSeconds() > 0 ? 1 : 0)) / 5) * 5;
  gsTime.setSeconds(0, 0);
  if (next5 === 60) {
    gsTime.setHours(now.getHours() + 1);
    gsTime.setMinutes(0);
  } else {
    gsTime.setMinutes(next5);
  }
  out.gear = out.seed = getCountdown(gsTime);

  // Honey: every 1 hour
  const honeyTime = new Date(now);
  honeyTime.setHours(now.getHours() + 1, 0, 0, 0);
  out.honey = getCountdown(honeyTime);

  // Cosmetics: every 7 hours
  const cosTime = new Date(now);
  const hourFloat = now.getHours() + now.getMinutes() / 60 + now.getSeconds() / 3600;
  const next7 = Math.ceil(hourFloat / 7) * 7;
  cosTime.setHours(next7, 0, 0, 0);
  out.cosmetics = getCountdown(cosTime);

  return out;
}

// Format value
function formatValue(val) {
  if (val >= 1000000) return 'x' + (val / 1000000).toFixed(1) + 'M';
  if (val >= 1000) return 'x' + (val / 1000).toFixed(1) + 'K';
  return 'x' + val;
}

// Get price from item
function getItemPrice(item) {
  if (typeof item.price !== "undefined") return formatValue(Number(item.price));
  if (typeof item.cost !== "undefined") return formatValue(Number(item.cost));
  return '--';
}

// Should notify
function shouldNotify(section, name) {
  const impOnly = document.getElementById("importantNotifySwitch")?.checked;
  if (!impOnly) return true;
  if (section === "honey") return importantHoney.includes(name);
  if (section === "egg") return importantEggs.includes(name);
  if (section === "seed") return importantSeeds.includes(name);
  if (section === "gear") return importantGears.includes(name);
  return false;
}

// Send system notification
function sendAvailabilityNotification(name, quantity) {
  if ("Notification" in window && Notification.permission === "granted") {
    new Notification("Available: " + name, {
      body: "Qty: " + quantity,
      icon: "https://cdn-icons-png.flaticon.com/512/616/616408.png"
    });
  }
}

// Important overlay
function showImportantOverlay(list) {
  if (!list.length) return;
  const overlay = document.getElementById("importantOverlay");
  const overlayList = document.getElementById("overlayAvailableList");
  overlayList.innerHTML = list.map(({ section, name, quantity }) =>
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

// Fetch and render
async function fetchAndRender() {
  const sectionsDiv = document.getElementById("sections");
  const scrollY = window.scrollY;
  const updateTime = document.getElementById("updateTime");
  try {
    const resp = await fetch("https://corsproxy.io/?https://gagstock.gleeze.com/grow-a-garden");
    if (!resp.ok) throw new Error("Failed to fetch API");
    const data = (await resp.json()).data;
    const restocks = getNextRestocks();
    const sections = [
      { label: "🛠️ Gear", emoji: "🛠️", sectionKey: "gear", rows: data.gear.items, restock: restocks.gear },
      { label: "🌱 Seeds", emoji: "🌱", sectionKey: "seed", rows: data.seed.items, restock: restocks.seed },
      { label: "🥚 Eggs", emoji: "🥚", sectionKey: "egg", rows: data.egg.items, restock: restocks.egg },
      { label: "🎨 Cosmetics", emoji: "🎨", sectionKey: "cosmetics", rows: data.cosmetics.items, restock: restocks.cosmetics },
      { label: "🍯 Honey", emoji: "🍯", sectionKey: "honey", rows: data.honey.items, restock: restocks.honey }
    ];

    // Important overlay logic
    let importantList = [];
    ["gear", "seed", "egg", "cosmetics", "honey"].forEach(section => {
      (data[section]?.items || []).forEach(item => {
        const should = shouldNotify(section, item.name);
        const qty = Number(item.quantity);
        if (should && qty > 0) {
          if (!notifiedAvailable[item.name]) {
            sendAvailabilityNotification(item.name, item.quantity);
            notifiedAvailable[item.name] = true;
          }
          importantList.push({ section, name: item.name, quantity: qty });
        } else {
          notifiedAvailable[item.name] = false;
        }
      });
    });
    const onlyImportant = document.getElementById("importantNotifySwitch")?.checked;
    if (onlyImportant && importantList.length > 0) showImportantOverlay(importantList);

    // Render table
    sectionsDiv.innerHTML = '';
    for (const section of sections) {
      const div = document.createElement("div");
      div.className = "section";
      if (window.innerWidth <= 550) {
        div.innerHTML = `
          <div class="section-title"><span class="emoji">${section.emoji}</span>${section.label.replace(section.emoji, '')}</div>
          <span class="restock">${section.restock ? "⏳ Restock in: " + section.restock : ''}</span>
          <table>
            <tbody>
              ${section.rows.map(row => `
                <tr>
                  <td data-label="Item">${emojis[row.name] ? `<span class="emoji">${emojis[row.name]}</span>` : ''}${row.name}</td>
                  <td data-label="Qty Available">${formatValue(Number(row.quantity))}</td>
                  <td data-label="Price">${getItemPrice(row)}</td>
                </tr>
              `).join('')}
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
              ${section.rows.map(row => `
                <tr>
                  <td>${emojis[row.name] ? `<span class="emoji">${emojis[row.name]}</span>` : ''}${row.name}</td>
                  <td>${formatValue(Number(row.quantity))}</td>
                  <td>${getItemPrice(row)}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        `;
      }
      sectionsDiv.appendChild(div);
    }
    updateTime.textContent = "Last updated: " + new Date(new Date().toLocaleString("en-US", {
      timeZone: "Asia/Manila"
    })).toLocaleTimeString("en-PH", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit"
    });
  } catch (err) {
    updateTime.innerHTML = `<span class="error-msg">Failed to fetch data! Please check your connection.</span>`;
  }
  setTimeout(() => { window.scrollTo(0, scrollY); }, 0);
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
  if (e.target === this) this.style.display = "none";
});
fetchAndRender();
setInterval(fetchAndRender, 5000);
window.addEventListener("resize", fetchAndRender);

// API Online/Offline Status (theme aware, uses GET not HEAD)
async function checkApiStatus() {
  const apiStatusElem = document.getElementById('apiStatus');
  const onlineColor = getComputedStyle(document.documentElement).getPropertyValue('--online').trim() || '#4be87a';
  const offlineColor = getComputedStyle(document.documentElement).getPropertyValue('--offline').trim() || '#ff5252';
  try {
    // Use GET to avoid HEAD being blocked
    const resp = await fetch("https://corsproxy.io/?https://gagstock.gleeze.com/grow-a-garden", { method: "GET", cache: "no-cache" });
    if (resp.ok) {
      apiStatusElem.textContent = "API: Online";
      apiStatusElem.style.color = onlineColor;
    } else {
      apiStatusElem.textContent = "API: Offline";
      apiStatusElem.style.color = offlineColor;
    }
  } catch (e) {
    apiStatusElem.textContent = "API: Offline";
    apiStatusElem.style.color = offlineColor;
  }
}
checkApiStatus();
setInterval(checkApiStatus, 15000);
