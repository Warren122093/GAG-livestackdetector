// Responsive NAVBAR hamburger toggle
const navToggle = document.getElementById('navToggle');
const mainNav = document.getElementById('mainNav');
navToggle.addEventListener('click', function() {
  mainNav.classList.toggle('open');
  // Close on click outside
  if (mainNav.classList.contains('open')) {
    setTimeout(() => {
      window.addEventListener('click', navCloseHandler);
    }, 0);
  }
});
function navCloseHandler(e) {
  if (!mainNav.contains(e.target)) {
    mainNav.classList.remove('open');
    window.removeEventListener('click', navCloseHandler);
  }
}

// Theme changer logic
const THEME_KEY = "gag_theme";
const themeSelect = document.getElementById('themeSelect');
function setTheme(theme) {
  document.documentElement.setAttribute('data-theme', theme);
  localStorage.setItem(THEME_KEY, theme);
}
themeSelect.addEventListener("change", function() {
  setTheme(this.value);
});
// On load: restore theme
(function() {
  const saved = localStorage.getItem(THEME_KEY);
  if(saved) {
    setTheme(saved);
    themeSelect.value = saved;
  } else {
    setTheme("dark");
    themeSelect.value = "dark";
  }
})();

// Highlight current nav link
(function() {
  let navLinks = document.querySelectorAll('.nav-link');
  let current = window.location.pathname.replace(/\\/g,'/').split('/').pop() || 'index.html';
  navLinks.forEach(link => {
    if(link.getAttribute('href') === current) {
      link.classList.add('active');
    } else {
      link.classList.remove('active');
    }
  });
})();

// Request notification permission on load
if ("Notification" in window && Notification.permission !== "granted") {
  Notification.requestPermission();
}

// IMPORTANT item lists per section
const importantHoney = ["Bee Egg"];
const importantEggs = ["Bug Egg", "Rare Egg"];
const importantSeeds = [
  "Ember Lily Seed", "Sugar Apple Seed", "Beanstalk Seed", "Cacao Seed",
  "Pepper Seed", "Mushroom Seed", "Grape Seed", "Mango Seed"
];
const importantGears = [
  "Basic Sprinkler", "Advanced Sprinkler", "Godly Sprinkler", "Master Sprinkler",
  "Lightning Rod", "Friendship Pot"
];

let notifiedAvailable = {};

const PH_TIMEZONE = "Asia/Manila";
const emojis = {
  "Common Egg": "🥚", "Uncommon Egg": "🐣", "Rare Egg": "🍳", "Legendary Egg": "🪺",
  "Mythical Egg": "🔮", "Bug Egg": "🪲", "Watering Can": "🚿", "Cleaning Spray": "🧴",
  "Friendship Pot": "💑", "Trowel": "🛠️", "Recall Wrench": "🔧", "Basic Sprinkler": "💧",
  "Advanced Sprinkler": "💦", "Godly Sprinkler": "⛲", "Lightning Rod": "⚡", "Master Sprinkler": "🌊",
  "Favorite Tool": "❤️", "Harvest Tool": "🌾", "Carrot": "🥕", "Strawberry": "🍓",
  "Blueberry": "🫐", "Orange Tulip": "🌷", "Tomato": "🍅", "Corn": "🌽", "Daffodil": "🌼",
  "Watermelon": "🍉", "Pumpkin": "🎃", "Apple": "🍎", "Bamboo": "🎍", "Coconut": "🥥",
  "Cactus": "🌵", "Dragon Fruit": "🍈", "Mango": "🥭", "Grape": "🍇", "Mushroom": "🍄",
  "Pepper": "🌶️", "Cacao": "🍫", "Beanstalk": "🌱", "Ember Lily": "🏵️", "Sugar Apple": "🍏",
  "Wild Honey": "🍯", "Royal Jelly": "👑", "Sunflower Crown": "🌻", "Bunny Ears": "🐰",
  "Pumpkin Mask": "🎭", "Cherry Blossom Pin": "🌸"
};
function pad(n){return n<10?"0"+n:n;}
function getPHTime(){return new Date(new Date().toLocaleString("en-US",{timeZone:PH_TIMEZONE}));}
function getCountdown(target){
  const now=getPHTime(),msLeft=target-now;
  if(msLeft<=0)return"00h 00m 00s";
  const h=Math.floor(msLeft/3.6e6),m=Math.floor((msLeft%3.6e6)/6e4),s=Math.floor((msLeft%6e4)/1e3);
  return`${pad(h)}h ${pad(m)}m ${pad(s)}s`;
}
function getNextRestocks(){
  const now=getPHTime(),timers={};
  // Egg: every 30m
  const nextEgg=new Date(now);
  nextEgg.setSeconds(0,0);
  if(now.getMinutes()<30){nextEgg.setMinutes(30);}
  else{nextEgg.setHours(now.getHours()+1);nextEgg.setMinutes(0);}
  timers.egg=getCountdown(nextEgg);
  // Gear/Seeds: every 5m
  const next5=new Date(now);
  const nextM=Math.ceil((now.getMinutes()+(now.getSeconds()>0?1:0))/5)*5;
  next5.setSeconds(0,0);
  if(nextM===60){next5.setHours(now.getHours()+1);next5.setMinutes(0);}
  else{next5.setMinutes(nextM);}
  timers.gear=timers.seed=getCountdown(next5);
  // Honey: every hour
  const nextHour=new Date(now);nextHour.setHours(now.getHours()+1,0,0,0);
  timers.honey=getCountdown(nextHour);
  // Cosmetics: every 7hr
  const next7=new Date(now);
  const totalHours=now.getHours()+now.getMinutes()/60+now.getSeconds()/3600;
  const next7h=Math.ceil(totalHours/7)*7;next7.setHours(next7h,0,0,0);
  timers.cosmetics=getCountdown(next7);
  return timers;
}
function formatValue(val){if(val>=1_000_000)return`x${(val/1_000_000).toFixed(1)}M`;if(val>=1_000)return`x${(val/1_000).toFixed(1)}K`;return`x${val}`;}

// Price helper: supports both 'price' and 'cost' as API might use either
function getItemPrice(item) {
  if (typeof item.price !== "undefined") return formatValue(Number(item.price));
  if (typeof item.cost !== "undefined") return formatValue(Number(item.cost));
  return "--";
}

// Notification logic based on switch and section
function shouldNotify(section, itemName) {
  const importantOnly = document.getElementById('importantNotifySwitch')?.checked;
  if (!importantOnly) return true;
  if (section === "honey")  return importantHoney.includes(itemName);
  if (section === "egg")    return importantEggs.includes(itemName);
  if (section === "seed")   return importantSeeds.includes(itemName);
  if (section === "gear")   return importantGears.includes(itemName);
  return false;
}

function sendAvailabilityNotification(itemName, qty) {
  if ("Notification" in window && Notification.permission === "granted") {
    new Notification(`Available: ${itemName}`, {
      body: `Qty: ${qty}`,
      icon: 'https://cdn-icons-png.flaticon.com/512/616/616408.png'
    });
  }
}

// Overlay helpers
function showImportantOverlay(items) {
  if (!items.length) return;
  const overlay = document.getElementById('importantOverlay');
  const listDiv = document.getElementById('overlayAvailableList');
  listDiv.innerHTML = items.map(({section, name, quantity}) =>
    `<div><b>${name}</b> (${sectionLabel(section)}): <span style="color:#4be87a;font-weight:bold;">${quantity}</span></div>`
  ).join('');
  overlay.style.display = "flex";
}

function hideImportantOverlay() {
  document.getElementById('importantOverlay').style.display = "none";
}

function sectionLabel(section) {
  switch(section) {
    case "gear": return "Gear";
    case "seed": return "Seed";
    case "egg": return "Egg";
    case "honey": return "Honey";
    case "cosmetics": return "Cosmetics";
    default: return section;
  }
}

function isMobileView() {
  return window.innerWidth <= 550;
}

async function fetchAndRender() {
  const url = "https://corsproxy.io/?https://gagstock.gleeze.com/grow-a-garden";
  const updateTimeDiv = document.getElementById('updateTime');
  try {
    const resp = await fetch(url);
    if (!resp.ok) throw new Error("Failed to fetch API");
    const data = (await resp.json()).data;
    const timers = getNextRestocks();
    const sectionMap = [
      { label: "🛠️ Gear", emoji: "🛠️", sectionKey: "gear", rows: data.gear.items, restock: timers.gear },
      { label: "🌱 Seeds", emoji: "🌱", sectionKey: "seed", rows: data.seed.items, restock: timers.seed },
      { label: "🥚 Eggs", emoji: "🥚", sectionKey: "egg", rows: data.egg.items, restock: timers.egg },
      { label: "🎨 Cosmetics", emoji: "🎨", sectionKey: "cosmetics", rows: data.cosmetics.items, restock: timers.cosmetics },
      { label: "🍯 Honey", emoji: "🍯", sectionKey: "honey", rows: data.honey.items, restock: timers.honey }
    ];
    // Notification logic + overlay
    let importantAvailable = [];
    ['gear', 'seed', 'egg', 'cosmetics', 'honey'].forEach(section => {
      (data[section]?.items || []).forEach(item => {
        const isImportant = shouldNotify(section, item.name);
        const qty = Number(item.quantity);
        if (isImportant && qty > 0) {
          if (!notifiedAvailable[item.name]) {
            sendAvailabilityNotification(item.name, item.quantity);
            notifiedAvailable[item.name] = true;
          }
          importantAvailable.push({section, name: item.name, quantity: qty});
        } else {
          notifiedAvailable[item.name] = false;
        }
      });
    });
    // Overlay if any important available and switch is ON
    const importantOnly = document.getElementById('importantNotifySwitch')?.checked;
    if (importantOnly && importantAvailable.length > 0) {
      showImportantOverlay(importantAvailable);
    }

    // Render logic
    const secDiv = document.getElementById('sections');
    secDiv.innerHTML = '';
    for(const sec of sectionMap) {
      const sectionBox = document.createElement('div');
      sectionBox.className = 'section';
      if(isMobileView()) {
        sectionBox.innerHTML = `
          <div class="section-title"><span class="emoji">${sec.emoji}</span>${sec.label.replace(sec.emoji, "")}</div>
          <span class="restock">${sec.restock ? '⏳ Restock in: ' + sec.restock : ''}</span>
          <table>
            <tbody>
              ${sec.rows.map(item => `
                <tr>
                  <td data-label="Item">${emojis[item.name]?`<span class="emoji">${emojis[item.name]}</span>`:""}${item.name}</td>
                  <td data-label="Qty Available">${formatValue(Number(item.quantity))}</td>
                  <td data-label="Price">${getItemPrice(item)}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        `;
      } else {
        sectionBox.innerHTML = `
          <div class="section-title"><span class="emoji">${sec.emoji}</span>${sec.label.replace(sec.emoji, "")}</div>
          <span class="restock">${sec.restock ? '⏳ Restock in: ' + sec.restock : ''}</span>
          <table>
            <thead>
              <tr>
                <th>Item</th>
                <th>Qty Available</th>
                <th>Price</th>
              </tr>
            </thead>
            <tbody>
              ${sec.rows.map(item => `
                <tr>
                  <td>${emojis[item.name]?`<span class="emoji">${emojis[item.name]}</span>`:""}${item.name}</td>
                  <td>${formatValue(Number(item.quantity))}</td>
                  <td>${getItemPrice(item)}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        `;
      }
      secDiv.appendChild(sectionBox);
    }
    updateTimeDiv.textContent =
      'Last updated: ' + getPHTime().toLocaleTimeString('en-PH',{hour:'2-digit',minute:'2-digit',second:'2-digit'});
  } catch (err) {
    updateTimeDiv.innerHTML = `<span class="error-msg">Failed to fetch data! Please check your connection.</span>`;
  }
}

document.getElementById("refresh-btn").addEventListener("click", fetchAndRender);
document.getElementById("importantNotifySwitch").addEventListener("change", () => {
  // Reset all notification state on switch
  notifiedAvailable = {};
  fetchAndRender();
});
document.getElementById("overlayCloseBtn").onclick = hideImportantOverlay;

// About Dev Overlay logic
document.getElementById("aboutDevBtn").addEventListener("click", function(e) {
  e.preventDefault();
  document.getElementById("aboutDevOverlay").style.display = "flex";
});
document.getElementById("aboutDevCloseBtn").onclick = function() {
  document.getElementById("aboutDevOverlay").style.display = "none";
};
// Optional: Close About Dev overlay on Esc or click outside
document.getElementById("aboutDevOverlay").addEventListener("click", function(e) {
  if (e.target === this) this.style.display = "none";
});

// Initial render & auto-update every 5 seconds
fetchAndRender();
setInterval(fetchAndRender, 5000);

// Re-render on resize for mobile/desktop switch
window.addEventListener('resize', fetchAndRender);
