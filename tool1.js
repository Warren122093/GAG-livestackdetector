// ========== Grow a Garden Live Tracker JS ==========

const proxy = 'https://corsproxy.io/?';

function formatTime(ts) {
  if (!ts) return "";
  const d = new Date(ts);
  return d.toLocaleString();
}

function renderList(list) {
  if (!list || !list.length) return '<tr><td colspan="2" style="color:#aaa;">None available</td></tr>';
  return list.map(item => {
    let name = String(item), qty = "";
    const match = name.match(/(.+?)\s*\*\*x(\d+)\*\*/i);
    if (match) {
      name = match[1].trim();
      qty = 'x' + match[2];
    }
    return `<tr><td>${name}</td><td style="text-align:right;font-weight:bold;">${qty}</td></tr>`;
  }).join('');
}

async function loadTool1() {
  const sections = document.getElementById('sections');
  const updateTimeDiv = document.getElementById('updateTime');
  const apiStatus = document.getElementById('apiStatus');
  let now = new Date();

  sections.innerHTML = `<div class="loading" style="text-align:center;">Loading...</div>`;
  apiStatus.textContent = "API: Checking...";
  apiStatus.style.color = "#e7c96d";
  updateTimeDiv.textContent = "Loading...";

  try {
    const [gearSeeds, egg, honey, cosmetics, weather] = await Promise.all([
      fetch(proxy + encodeURIComponent('https://growagardenstock.com/api/stock?type=gear-seeds')).then(r => r.json()),
      fetch(proxy + encodeURIComponent('https://growagardenstock.com/api/stock?type=egg')).then(r => r.json()),
      fetch(proxy + encodeURIComponent('https://growagardenstock.com/api/special-stock?type=honey')).then(r => r.json()),
      fetch(proxy + encodeURIComponent('https://growagardenstock.com/api/special-stock?type=cosmetics')).then(r => r.json()),
      fetch(proxy + encodeURIComponent('https://growagardenstock.com/api/stock/weather')).then(r => r.json())
    ]);

    sections.innerHTML = `
      <div class="section"><h2>Weather</h2>
        <div><b>${weather.icon || ''} ${weather.currentWeather || ''}</b> ${weather.description ? ' - ' + weather.description : ''}</div>
        <div>Type: ${weather.weatherType || ''} | Rarity: ${weather.rarity || ''}</div>
        <div>Bonuses: ${weather.cropBonuses || ''}</div>
        <div>Mutations: ${weather.mutations && weather.mutations.length ? weather.mutations.join(', ') : 'None'}</div>
        <div class="restock">Updated: ${formatTime(weather.updatedAt)}</div>
      </div>
      <div class="section"><h2>Gear</h2>
        <table><thead><tr><th>Name</th><th>Qty</th></tr></thead><tbody>
        ${renderList(gearSeeds.gear)}
        </tbody></table>
        <div class="restock">Updated: ${formatTime(gearSeeds.updatedAt)}</div>
      </div>
      <div class="section"><h2>Seeds</h2>
        <table><thead><tr><th>Name</th><th>Qty</th></tr></thead><tbody>
        ${renderList(gearSeeds.seeds)}
        </tbody></table>
        <div class="restock">Updated: ${formatTime(gearSeeds.updatedAt)}</div>
      </div>
      <div class="section"><h2>Eggs</h2>
        <table><thead><tr><th>Name</th><th>Qty</th></tr></thead><tbody>
        ${renderList(egg.egg)}
        </tbody></table>
        <div class="restock">Updated: ${formatTime(egg.updatedAt)}</div>
      </div>
      <div class="section"><h2>Honey</h2>
        <table><thead><tr><th>Name</th><th>Qty</th></tr></thead><tbody>
        ${renderList(honey.honey)}
        </tbody></table>
        <div class="restock">Updated: ${formatTime(honey.updatedAt)}</div>
      </div>
      <div class="section"><h2>Cosmetics</h2>
        <table><thead><tr><th>Name</th><th>Qty</th></tr></thead><tbody>
        ${renderList(cosmetics.cosmetics)}
        </tbody></table>
        <div class="restock">Updated: ${formatTime(cosmetics.updatedAt)}</div>
      </div>
    `;

    apiStatus.textContent = "API: Online";
    apiStatus.style.color = "#8ff48f";
    updateTimeDiv.textContent = "Last updated: " + now.toLocaleTimeString();
  } catch (e) {
    sections.innerHTML = `<div class="error">Failed to load data.<br><b>${e.message}</b></div>`;
    apiStatus.textContent = "API: Offline or Error";
    apiStatus.style.color = "#ff6565";
    updateTimeDiv.textContent = "Failed to update.";
  }
}

const refreshBtn = document.getElementById("refresh-btn");
if (refreshBtn) refreshBtn.addEventListener("click", loadTool1);

loadTool1();
setInterval(loadTool1, 60000);