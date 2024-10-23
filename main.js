const { app, BrowserWindow, Menu, dialog } = require('electron');
const path = require('path');

let mainWindow;

app.on('ready', () => {
    mainWindow = new BrowserWindow({
        width: 800,
        height: 600,
        webPreferences: {
            preload: path.join(__dirname, 'preload.js'),
            nodeIntegration: false, // Important for PWA security
            contextIsolation: true,  // Isolate context for security
            enableRemoteModule: false
        }
    });

    // Load the URL of the local or remote PWA
    mainWindow.loadURL('https://docusaurus.io/');

    createMenu();
});

// Quit when all windows are closed
app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

function createMenu() {
    const menuTemplate = [
        {
            label: 'Application',
            submenu: [
                { label: 'Check for Updates', click: checkForUpdates },
                { role: 'quit' }
            ]
        },
        {
            label: 'Edit',
            submenu: [
                { role: 'undo' },
                { role: 'redo' },
                { type: 'separator' },
                { role: 'cut' },
                { role: 'copy' },
                { role: 'paste' }
            ]
        }
    ];

    const menu = Menu.buildFromTemplate(menuTemplate);
    Menu.setApplicationMenu(menu);
}

function checkForUpdates() {
    const { net } = require('electron');

    const request = net.request('https://site1.exemple.com/check-update');
    request.on('response', (response) => {
        let data = '';

        response.on('data', (chunk) => {
            data += chunk;
        });

        response.on('end', () => {
            try {
                const updateInfo = JSON.parse(data);
                const currentVersion = app.getVersion(); // Get the current version of the app

                if (updateInfo.version !== currentVersion) {
                    dialog.showMessageBox({
                        type: 'info',
                        title: 'Update Available',
                        message: `A new version (${updateInfo.version}) is available.`,
                        buttons: ['Update', 'Cancel']
                    }).then(result => {
                        if (result.response === 0) {
                            // Download and apply the update
                            // (Here, you can trigger a download process)
                            console.log('Downloading the update...');
                        }
                    });
                } else {
                    dialog.showMessageBox({
                        type: 'info',
                        title: 'No Update',
                        message: 'Your application is up to date.'
                    });
                }
            } catch (error) {
                console.error('Failed to parse update information:', error);
                dialog.showMessageBox({
                    type: 'error',
                    title: 'Update Error',
                    message: 'Failed to check for updates.'
                });
            }
        });
    });

    request.on('error', (error) => {
        console.error('Network request failed:', error);
        dialog.showMessageBox({
            type: 'error',
            title: 'Network Error',
            message: 'Failed to check for updates due to a network error.'
        });
    });

    request.end();
}