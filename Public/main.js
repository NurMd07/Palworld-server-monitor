
const logo = document.querySelector('.logo');
const serverName = document.querySelector('.server-name span');
const menu = document.querySelector('.menu');
const menuOptions = document.querySelector('.menu-options');
const menuClose = document.querySelector('.menu-close');
const lastOnlinePlayerName = document.querySelector('.last-online-player-name');
const lastOnlinePlayerTime = document.querySelector('.last-online-player-time');
const playerTableHeading = document.querySelector('.player-table-heading');
const onlinePlayers = document.querySelector('.online-players');
const onlinePlayersCount = document.querySelector('.online-players-count');
const onlinePlayersPlaceholder = document.querySelector('.online-players-placeholder');
const serverFps = document.querySelector('.server-fps');
const ramUsage = document.querySelector('.ram-usage');
const ramTotal = document.querySelector('.ram-total');
const ramUsage1 = document.querySelector('.ram-usage1');
const ramTotal1 = document.querySelector('.ram-total1');
const ramUsageBar = document.querySelector('.ram-usage-bar');
const ramUsagePercentage = document.querySelector('.ram-usage-percentage');
const ramUsageBar1 = document.querySelector('.ram-usage-bar1');
const ramUsagePercentage1 = document.querySelector('.ram-usage-percentage1');
const cpuUsageBar = document.querySelector('.cpu-usage-bar');

const cpuTotalCores = document.querySelector('.cpu-total-cores');
const cpuUsagePercentage = document.querySelector('.cpu-usage-percentage');
const brodcastMessageHistory = document.querySelector('.brodcast-message-history');
const brodcastInput = document.querySelector('.brodcast-input');
const brodcastSendBtn = document.querySelector('.brodcast-send-btn');
const serverInfoDiv = document.querySelector('.server-info');
const loader2 = document.querySelector('.loader2');
const logoutBtn = document.querySelector('.logout');

logo.addEventListener('click', () => {
    location.reload();
}
);

menuClose.addEventListener('click', () => {
    menuOptions.classList.toggle('opacity-100');
        menuOptions.classList.toggle('invisible');
        menuOptions.classList.toggle('pointer-events-none');
}
);

menuOptions.addEventListener('click', (e) => {
    if(e.target.classList.contains('menu-options')){
       
        menuOptions.classList.toggle('opacity-100');
        menuOptions.classList.toggle('invisible');
        menuOptions.classList.toggle('pointer-events-none');
        
    }
});


menu.addEventListener('click',() => {
   
    menuOptions.classList.toggle('opacity-100');
        menuOptions.classList.toggle('invisible');
        menuOptions.classList.toggle('pointer-events-none');
   
    
});

function timeAgo(dateStr) {
    if(!dateStr) return;
    const date = new Date(dateStr);
    const now = new Date();
    const diff = (now - date) / 1000; // in seconds
  
    if (diff < 60) return `${Math.floor(diff)} sec ago`;
    if (diff < 3600) return `${Math.floor(diff / 60)} min ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)} hours ago`;
    if (diff < 2592000) return `${Math.floor(diff / 86400)} days ago`;
    if (diff < 31536000) return `${Math.floor(diff / 2592000)} months ago`;
    return `${Math.floor(diff / 31536000)} years ago`;
  }
  

async function getLastOnlinePlayer() {
    
    try{
        const response = await fetch('/v1/api/lastOnlinePlayer');
        if(response.status != 200){

            return;
        }
        const data = await response.json();
        lastOnlinePlayerName.textContent = data.name;
        lastOnlinePlayerTime.textContent = timeAgo(data.onlineTime) ;
    }catch(e){
        console.log(e);
    }
}


function updateOnlinePlayersList(players) {
    
    onlinePlayers.innerHTML = ''; // Clear the existing list
    onlinePlayersCount.textContent = players.length;
    if (players.length === 0) {
     const noPlayers = document.createElement('div');
        noPlayers.classList.add("font-semibold","text-center","flex","justify-center","text-white","mb-3");
        noPlayers.textContent = '━';
        onlinePlayers.appendChild(noPlayers);
        return;
    }

    

    players.forEach(player => {
        const playerTableValues = document.createElement('div');
        playerTableValues.classList.add('player-table-values',"mb-2","rounded","text-center","flex","justify-center",
            "text-white","list-none","lg:mb-3");
            const playerName = document.createElement('li');
            playerName.classList.add("w-3/3","p-1","m-3");
            const span = document.createElement('span');
            span.classList.add("border-b-2","border-indigo-600","p-1","px-3");
            span.textContent = player.name;
            playerName.appendChild(span);
            const playerLevel = document.createElement('li');
            playerLevel.classList.add("w-1/3","p-1","m-3","text-green-400");
            playerLevel.textContent = `${player.level}`;
            const playerId = document.createElement('li');
            playerId.classList.add("w-2/3","text-sm","text-stone-200","p-1","px-5","m-3","no-scrollbar","border-zink-600","overflow-scroll");
            playerId.textContent = `${player.userId}`;

            playerTableValues.appendChild(playerName);
            playerTableValues.appendChild(playerLevel);
            playerTableValues.appendChild(playerId);
            onlinePlayers.appendChild(playerTableValues);
    });
}

async function getOnlinePlayers() {
    try {
      const response = await fetch('/v1/api/players');
  
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
  
      const data = await response.json();
      await getLastOnlinePlayer();
    
      updateOnlinePlayersList(data.onlinePlayers);
      

    } catch (error) {
      console.error('Error fetching online players:', error);
    } finally {
        
        setTimeout(getOnlinePlayers, 30000);
    }
  }
;

async function getAndUpdateServerFPS() {

    try{
        const response =  await fetch('/v1/api/serverFPS');
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
          }
        const data = await response.json();
        serverFps.textContent = data.serverfps;
    }catch(error){
        console.error('Error fetching server info:', error);
    }finally {
       
        setTimeout(getAndUpdateServerFPS, 2000);
    }

}   

async function getAndUpdateSystemStats() {
    try{
        const response =  await fetch('/v1/api/serverSystemStats');
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
          }
        const data = await response.json();
        console.log(data);
        ramUsagePercentage.textContent = `${data.ramUsage}%`;
        ramTotal.textContent = `${data.totalMemory} GB`;
        ramUsage.textContent = `${data.usedMemory} GB`;
        ramUsageBar.style.width = `${data.ramUsage}%`;
        cpuUsagePercentage.textContent = `${data.cpuUsage}%`;
        cpuTotalCores.textContent = `${data.totalCores} Cores`;
        cpuUsageBar.style.width = `${data.cpuUsage}%`;
        ramTotal1.textContent = `${data.totalVirtualMemory} GB`;
        ramUsage1.textContent = `${data.usedVirtualMemory} GB`;
        ramUsageBar1.style.width = `${data.virtualMemoryUsage}%`;
  
        ramUsagePercentage1.textContent = `${data.virtualMemoryUsage}%`;
    }catch(error){
        console.error('Error fetching system info:', error);
    }finally {
        
        setTimeout(getAndUpdateSystemStats, 3000);
    }
}

async function getAndUpdateAnnounceHistory() {
    try {
        const response = await fetch('/v1/api/announce');
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
        const data = await response.json();
        if(data.message !== ''){
        brodcastMessageHistory.textContent = data.message;
        }else{
            brodcastMessageHistory.textContent = "No Messages!";
        }
    } catch (error) {
        console.error('Error fetching announcement history:', error);
    } 
}

async function sendAnnounceMessage() {
    const message = brodcastInput.value;
    if (message.trim() === '') return; 

    try {
        const response = await fetch('/v1/api/announce', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ message })
        });

        if (!response.ok) {
            brodcastMessageHistory.textContent = "failed to send message";
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
        getAndUpdateAnnounceHistory();
        brodcastInput.value = ''; 
    } catch (error) {
        brodcastMessageHistory.textContent = "failed to send message";
        console.error('Error sending announce message:', error);
    }
}

brodcastSendBtn.addEventListener('click', sendAnnounceMessage);

logoutBtn.addEventListener('click',async(e)=>{
    try{
    const response = await fetch('/logout');
    if(response.ok){
        window.location.href = '/login';
    }else{
        throw new Error(`HTTP error! Status: ${response.status}`);
    }
    }catch(e){
        throw new Error(`${e}`);
    }
   
});

getOnlinePlayers();
async function updateServerInfo() {
   await getAndUpdateServerFPS(); 
   await getAndUpdateSystemStats();
loader2.classList.add('hidden');
serverInfoDiv.classList.remove('hidden');
}
updateServerInfo();
getAndUpdateAnnounceHistory();


setInterval(() => {
    getAndUpdateAnnounceHistory();
}, 30000); 