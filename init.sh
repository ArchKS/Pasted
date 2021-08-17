npm install election --save-dev
npm install --arch=ia32 --platform=win32 electron

# fast in china

npm config set registry https://registry.npm.taobao.org
cat  >> ~/.npmrc << EOF
registry=https://registry.npm.taobao.org/
sass_binary_site=https://npm.taobao.org/mirrors/node-sass/
phantomjs_cdnurl=http://npm.taobao.org/mirrors/phantomjs
ELECTRON_MIRROR=http://npm.taobao.org/mirrors/electron/
EOF

# vertify
npx election -v 
