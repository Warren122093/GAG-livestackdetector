// Request notification permission on load
if ("Notification" in window && Notification.permission !== "granted") {
  Notification.requestPermission();
}

const notifyKeywords = [
  "Bee", "Sprinkler", "Bean Stalk Seed", "Ember Lily", "Cacao", "Pepper", "Mushroom", "Grape"
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

function shouldNotify(itemName) {
  return notifyKeywords.some(keyword => itemName.toLowerCase().includes(keyword.toLowerCase()));
}

function sendAvailabilityNotification(itemName, qty) {
  if ("Notification" in window && Notification.permission === "granted") {
    new Notification(`Available: ${itemName}`, {
      body: `Qty: ${qty}`,
      icon: 'https://cdn-icons-png.flaticon.com/512/616/616408.png'
    });
  }
}

async function fetchAndRender() {
  // Use a CORS proxy for browser fetch!
  const url = "https://corsproxy.io/?https://gagstock.gleeze.com/grow-a-garden";
  try {
    const resp = await fetch(url);
    const data = (await resp.json()).data;
    const timers = getNextRestocks();
    const sectionMap = [
      { label: "🛠️ Gear", rows: data.gear.items, restock: timers.gear },
      { label: "🌱 Seeds", rows: data.seed.items, restock: timers.seed },
      { label: "🥚 Eggs", rows: data.egg.items, restock: timers.egg },
      { label: "🎨 Cosmetics", rows: data.cosmetics.items, restock: timers.cosmetics },
      { label: "🍯 Honey", rows: data.honey.items, restock: timers.honey }
    ];
    // --- Notification logic ---
    ['gear', 'seed', 'egg', 'cosmetics', 'honey'].forEach(section => {
      (data[section]?.items || []).forEach(item => {
        if (shouldNotify(item.name) && Number(item.quantity) > 0) {
          if (!notifiedAvailable[item.name]) {
            sendAvailabilityNotification(item.name, item.quantity);
            notifiedAvailable[item.name] = true;
          }
        } else {
          notifiedAvailable[item.name] = false;
        }
      });
    });
    // --- Render logic ---
    const secDiv = document.getElementById('sections');
    secDiv.innerHTML = '';
    for(const sec of sectionMap) {
      const sectionBox = document.createElement('div');
      sectionBox.className = 'section';
      sectionBox.innerHTML = `
        <div class="section-title">${sec.label}</div>
        <span class="restock">${sec.restock ? '⏳ Restock in: ' + sec.restock : ''}</span>
        <table>
          <thead>
            <tr><th>Item</th><th>Qty Available</th></tr>
          </thead>
          <tbody>
            ${sec.rows.map(item => `
              <tr>
                <td>${emojis[item.name]?`<span class="emoji">${emojis[item.name]}</span>`:""}${item.name}</td>
                <td>${formatValue(Number(item.quantity))}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      `;
      secDiv.appendChild(sectionBox);
    }
    document.getElementById('updateTime').textContent =
      'Last updated: ' + getPHTime().toLocaleTimeString('en-PH',{hour:'2-digit',minute:'2-digit',second:'2-digit'});
  } catch (err) {
    document.getElementById('updateTime').textContent = "Failed to fetch data!";
  }
}

document.getElementById("refresh-btn").addEventListener("click", fetchAndRender);

// Initial render & auto-update every 5 seconds
fetchAndRender();
setInterval(fetchAndRender, 5000);
