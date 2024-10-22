const { app, BrowserWindow, Menu, webContents, dialog } = require("electron");
process.env["ELECTRON_DISABLE_SECURITY_WARNINGS"] = true;
app.on("ready", () => {
  Menu.setApplicationMenu(null);
  let ven = new BrowserWindow({
    webPreferences: {
      //Inicializamos la integracion de Node en false
      nodeIntegration: false,
    },
  });
  ven.loadURL("https://www.ferrari.com");
  ven.setMenu(crearMenu());
  createWindow();
});
function createWindow() {
  win = new BrowserWindow({
    width: 500,
    height: 300,
    webPreferences: {
      nodeIntegration: false,
      sandbox: false,
      preload: __dirname + "\\preload.js",
    },
  });
  win.loadFile("index.html");
}
function crearMenu() {
  let wc = webContents.getFocusedWebContents();
  let menu = Menu.buildFromTemplate([
    {
      label: "Impresora por defecto",
      click: () => {
        wc.getPrintersAsync().then((impresoras) => {
          //busqueda de la impresora por defecto
          const impresoraPorDefecto = impresoras.find(
            (impresora) => impresora.isDefault
          );
          //Si no se consigue impresora por defecto, No hay impresoras, asi que se muestra el mensaje de error
          if (!impresoraPorDefecto) {
            dialog.showErrorBox("NO hay impresoras instaladas");
          } else {
            //Si hay impresora por defecto, se muestra el nombre
            console.log(impresoraPorDefecto);
            dialog.showMessageBox(null, {
              message:
                "La impresora por defecto es " +
                impresoraPorDefecto.displayName,
              type: "info",
            });
          }
        });
      },
    },
    {
      label: "Imprimir",
      click: () => {
        //Impresion silenciosa de 3 copias
        wc.print({
          silent: true,
          landscape: true,
          copies: 3,
        });
      },
    },
  ]);
  return menu;
}
