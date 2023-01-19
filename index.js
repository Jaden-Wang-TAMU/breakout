const { app, BrowserWindow } = require('electron')

// include the Node.js 'path' module at the top of your file
const path = require('path')

const createWindow = () => {
    const win = new BrowserWindow({
      width: 500,
      height: 660,
      webPreferences: {
        preload: path.join(__dirname, 'preload.js')
      },
      resizable: false
    })
  
    win.loadFile('index.html')
  }

  app.whenReady().then(() => {
    createWindow()
  })

  app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') app.quit()
  })
