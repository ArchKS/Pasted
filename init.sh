git clone  https://github.com/electron/electron-quick-start 
cd election-quick-start
npm install && npm start

# fast in china
export http.proxys=socks5://127.0.0.1:7777
# unset proxy
export http.proxys=


npm i -g election-packager
npm config set proxy=http://127.0.0.1:7776
electron-packager .
or 
npm run 