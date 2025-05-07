import express from 'express';
import axios, { all } from 'axios';
import path from 'path';
import si from 'systeminformation';
import dotenv from 'dotenv';
import bcrypt from 'bcrypt';
import { JSONFilePreset } from 'lowdb/node'
import cookieParser from 'cookie-parser';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 8000;
const __dirname = import.meta.dirname;

const db = await JSONFilePreset('db.json', { currentOnlinePlayers: [] ,allPlayers : [],lastOnlinePlayer:{}, messages: '' });
await db.write()
await db.read();

app.use(cookieParser());
app.use(express.static('Public',{ index: false }));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

async function hashedCredentials(){

const hashedUsername = await bcrypt.hash(process.env.CONSOLE_USERNAME, 10);

const hashedPassword = await bcrypt.hash(process.env.CONSOLE_PASSWORD, 10);

return { hashedUsername , hashedPassword}
}

app.get('/login', (req, res) => {
    res.sendFile(path.join(__dirname, 'Public', 'login.html'));
  });
app.post('/login',async(req,res)=>{
    const { username, password } = req.body;
    
    if(username !== process.env.CONSOLE_USERNAME || password !== process.env.CONSOLE_PASSWORD){
        return res.status(401).json({status:'failed'});
    }
    const credentials = await hashedCredentials();
   
    res.cookie('username', credentials.hashedUsername, { 
        httpOnly: true, // Cannot access from JavaScript
        secure: false,   // Only sent over HTTPS
        sameSite: 'Strict', // Prevent cross-site requests
        maxAge: 60 * 1000 * 60 * 24 * 90, // Set expiration time (1 hour)
      });
      
      res.cookie('password', credentials.hashedPassword, {
        httpOnly: true,
        secure: false,
        sameSite: 'Strict',
        maxAge: 60 * 1000 * 60 * 24 * 90,
      });
    res.json({status:'success'})
});

async function authenticate(req,res,next){
 
    if(req.cookies.username && req.cookies.password){
        const isUsernameValid = await bcrypt.compare(process.env.CONSOLE_USERNAME,req.cookies.username)
        const isPasswordValid = await bcrypt.compare(process.env.CONSOLE_PASSWORD,req.cookies.password);
        if(isUsernameValid && isPasswordValid){
    
           return next();
            
           }else{
            return res.redirect('/login')
           }
    }else{
        return res.redirect('/login')
    }
   
}
app.use(authenticate);

app.get('/', async (req, res) => {
    res.sendFile(path.join(__dirname, 'Public', 'index.html'));
  });

app.get('/logout',(req,res)=>{
    res.clearCookie('username', {
        httpOnly: true,
        secure: true,
        sameSite: 'Strict',
        path: '/',  // Make sure this matches when you first set the cookie
      });
    
      res.clearCookie('password', {
        httpOnly: true,
        secure: true,
        sameSite: 'Strict',
        path: '/',
      });
    
      res.json({ status: 'logged out' });
});

async function updateOnlinePLayer(){
    
    try{
        
        const response = await axios.get('http://palworld.icyflow.in:8212/v1/api/players',{  auth: {
            username: process.env.ADMIN_USERNAME,
            password: process.env.ADMIN_PASSWORD
          }});
          if(response.status != 200){
            console.log('error')
            return;
          }
          const currentOnlinePlayers = response.data.players.filter(player=> player.playerId !== "None");
        db.data.currentOnlinePlayers = currentOnlinePlayers;
     
        for (const player of currentOnlinePlayers) {

            // Find the player in the database
            const foundPlayer = db.data.allPlayers.find(eachPlayer => player.name === eachPlayer.name);
        
            if (foundPlayer){
                foundPlayer.onlineTime = new Date().toISOString();
            }else{
              // Set the onlineTime for the new player and add them to the database
              player.onlineTime = new Date().toISOString();
              db.data.allPlayers.push(player);
            }
            
        };

        const offlinePlayers = db.data.allPlayers.filter(player => !currentOnlinePlayers.some(onlinePlayer => onlinePlayer.name === player.name ) );
       if(!offlinePlayers.length > 0){
        db.data.lastOnlinePlayer = '';
       }else{
        const lastOnlinePlayer = offlinePlayers.sort((a, b) => new Date(b.onlineTime) - new Date(a.onlineTime));
        db.data.lastOnlinePlayer = lastOnlinePlayer[0];
       }
        await db.write();
      
    }catch(e){
        console.log(e)
    }
}

updateOnlinePLayer();
setInterval(updateOnlinePLayer, 15000 )

app.get('/v1/api/lastOnlinePlayer', async (req, res) => {

    try{
        const lastOnlinePlayer = db.data.lastOnlinePlayer;
        res.status(200).json(lastOnlinePlayer)
    }catch(e){
        res.status(500).json({message:'Something Went Wrong!'})
    }

});

app.get('/v1/api/players', async (req, res) => {
    try {
        const onlinePlayers = db.data.currentOnlinePlayers;
        res.json({onlinePlayers});
    } catch (error) {
        console.error('Error fetching players:', error);
        res.status(500).json({ error: 'Failed to fetch players' });
    }
});
  
app.get('/v1/api/serverFPS', async (req, res) => {
    try {
        const response = await axios.get('http://palworld.icyflow.in:8212/v1/api/metrics',{  auth: {
            username: process.env.ADMIN_USERNAME,
            password: process.env.ADMIN_PASSWORD
          }});
        res.json(response.data);
    } catch (error) {
        console.error('Error fetching server FPS:', error);
        res.status(500).json({ error: 'Failed to fetch server FPS' });
    }
});

async function getSystemStats() {
    const cpu = await si.currentLoad();  
    const mem = await si.mem();          
    const cpuInfo = await si.cpu();      

    const systemStats = {
        cpuUsage: Number((cpu.currentLoad).toFixed(2)),
        ramUsage: Number((mem.used / mem.total * 100).toFixed(2)), // RAM usage %
        totalMemory: Number(Math.ceil((mem.total / (1024 ** 3)).toFixed(2))),
        usedMemory: Number((mem.used / (1024 ** 3)).toFixed(2)),
        totalCores : cpuInfo.cores,
    };
    return systemStats;
}


app.get('/v1/api/serverSystemStats', async (req, res) => {

    const sysInfo = await getSystemStats();

    res.json(sysInfo);
});

app.get('/v1/api/announce', async (req, res) => {

    try {
        const message = db.data.messages;
        res.json({ message });
    } catch (error) {
        console.error('Error fetching announcement:', error);
        res.status(500).json({ error: 'Failed to fetch announcement' });
    }
    
});

app.post('/v1/api/announce', async (req, res) => {

    try {

        const { message } = req.body;
        const response = await axios.post('http://palworld.icyflow.in:8212/v1/api/announce', { message }, {
            auth: {
                username: process.env.ADMIN_USERNAME,
                password: process.env.ADMIN_PASSWORD
            }
        });
        if (response.status !== 200) {
            return res.status(500).json({ error: 'Failed to send announcement' });
        }
        db.data.messages = message;
        await db.write();
        // Handle the response from the server if needed
        res.json(response.data);
    } catch (error) {
        console.error('Error sending announcement:', error);
        res.status(500).json({ error: 'Failed to send announcement' });
    }
    
});

app.listen(
    PORT,() => {
        console.log('Server is running on port 8000')
    }
)

