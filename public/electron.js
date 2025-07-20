const { app, BrowserWindow, Menu, shell, dialog } = require('electron');
const path = require('path');
const isDev = require('electron-is-dev');

// メインウィンドウの参照を保持
let mainWindow;

function createWindow() {
  // ブラウザウィンドウを作成
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      enableRemoteModule: false,
      webSecurity: false, // ローカルファイルアクセスのため
    },
    icon: path.join(__dirname, 'vite.svg'), // アイコン設定
    show: false // 初期表示を隠して、準備完了後に表示
  });

  // 開発モードならlocalhost、本番なら静的ファイルを読み込み
  const startUrl = isDev 
    ? 'http://localhost:5173' 
    : `file://${path.join(__dirname, '../dist/index.html')}`;
  
  mainWindow.loadURL(startUrl);

  // ウィンドウが準備完了したら表示
  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
    
    // 開発モードでは自動的にDevToolsを開く
    if (isDev) {
      mainWindow.webContents.openDevTools();
    }
  });

  // ウィンドウが閉じられたときの処理
  mainWindow.on('closed', () => {
    mainWindow = null;
  });

  // 外部リンクをデフォルトブラウザで開く
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url);
    return { action: 'deny' };
  });
}

// Electronの初期化が完了したときの処理
app.whenReady().then(() => {
  createWindow();

  // macOSでは、ドックアイコンがクリックされてもウィンドウが開いていない場合に新しいウィンドウを作成
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

// 全てのウィンドウが閉じられたときの処理
app.on('window-all-closed', () => {
  // macOS以外では、全ウィンドウが閉じられたらアプリを終了
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

// セキュリティ: 新しいウィンドウが作成されることを防ぐ
app.on('web-contents-created', (event, contents) => {
  contents.on('new-window', (event, navigationUrl) => {
    event.preventDefault();
    shell.openExternal(navigationUrl);
  });
});

// アプリケーションメニューを設定
const template = [
  {
    label: 'ファイル',
    submenu: [
      {
        label: '終了',
        accelerator: process.platform === 'darwin' ? 'Cmd+Q' : 'Ctrl+Q',
        click: () => {
          app.quit();
        }
      }
    ]
  },
  {
    label: '表示',
    submenu: [
      {
        label: '再読み込み',
        accelerator: 'F5',
        click: () => {
          if (mainWindow) {
            mainWindow.reload();
          }
        }
      },
      {
        label: '開発者ツール',
        accelerator: 'F12',
        click: () => {
          if (mainWindow) {
            mainWindow.webContents.toggleDevTools();
          }
        }
      }
    ]
  },
  {
    label: 'ヘルプ',
    submenu: [
      {
        label: 'バージョン情報',
        click: () => {
          dialog.showMessageBox(mainWindow, {
            type: 'info',
            title: 'ネオスフィア進捗管理システム',
            message: 'ネオスフィア進捗管理システム',
            detail: `バージョン: 1.0.0\nElectron: ${process.versions.electron}\nNode.js: ${process.versions.node}\nChrome: ${process.versions.chrome}`
          });
        }
      }
    ]
  }
];

const menu = Menu.buildFromTemplate(template);
Menu.setApplicationMenu(menu);