# Palworld-server-monitor
Web UI to monitor palworld server made in nodejs express

### Requirements  :
  **Nodejs** -Important for running web ui  
  
   1. Install nodejs from : ```https://github.com/nvm-sh``` (run curl ... command from description install section)  and then restart shell/session by logout login or other way  
   2. Run `nvm install node` and then again restart session
    
 **pm2** - running server monitor in background   
 
   &nbsp;&nbsp;&nbsp;&nbsp;     Run Command  `npm install pm2@latest -g`
       
  **git**  - cloning this repo
  
   &nbsp;&nbsp;&nbsp;&nbsp;     Run Command `sudo apt install git`
    
### Steps to Use (Run following commands):
1. ``` git clone https://github.com/NurMd07/Palworld-server-monitor.git ```
2. ``` cd Palworld-server-monitor ```
3. run ``` npm i ```
4. Edit **PalWorldSettings.ini** by using nano file location ( /home/steam/palworld/Pal/Saved/Config/LinuxServer/PalWorldSettings.ini) adjust accordingly to your path and then
    1.Change RESTAPIEnabled=True (from false to True)
    2.Change AdminPassword="changepassword"  , Save.
6. edit .env by running
     ``` nano .env ```    , then edit and add following values :
             (console username/password is what used when login on web ui and admin username/password is servers username/password - by default server username is admin (so dont change this value keep it as is) ) 
       CONSOLE_USERNAME = 'palworld'
       CONSOLE_PASSWORD = 'palworld123'
       ADMIN_USERNAME = 'admin'
       ADMIN_PASSWORD = 'changewhatsinconfig'
           (admin password is from  PalWorldSettings.ini AdminPassword="password") , Save.
7. ``` pm2 start app.js ```
8. At last visit on **http://localhost:8000** and login using console username/password
   
10. **Done!** Enjoy.
     
