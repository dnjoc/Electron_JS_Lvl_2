const { app, BrowserWindow, ipcMain, Menu } = require("electron");
process.env["ELECTRON_DISABLE_SECURITY_WARNINGS"] = true;
//se crea el arreglo de objetos con el nombre del usuario, el username y password
const usuarios = [
    { username: "danieljcs", password: "daniel", name: "Daniel Castellanos" },
    { username: "joserojas", password: "joserojas", name: "Jose Rojas" },
    { username: "master", password: "master", name: "admin master" },
    { username: "josuec", password: "josue", name: "Josue Castellanos" },
];
//se crean las variables de las ventanas
let win;
let principal;
//se elimina el menu por defecto de las ventanas
Menu.setApplicationMenu(null);
//al iniciar la aplicacion se crea la ventana del login
app.on("ready", () => {
    win = new BrowserWindow({
        width: 800,
        height: 600,
        webPreferences: {
            nodeIntegration: false,
            contextIsolation: true,
            sandbox: false,
            preload: __dirname + "\\login\\preload-login.js",
        },
    });
    win.loadFile("./login/login.html");
    //se maneja el evento si el usuario cierra la ventana, para evitar que siga en ejecucion el programa
    win.on("close", () => {
        BrowserWindow.getAllWindows().forEach((win) => win.close());
    });
});
//se recibe el mensaje del click del formulario con los datos de los inputs
ipcMain.on("login", (event, user) => {
    console.log(user);
    console.log(user.username);
    console.log(user.password);
    //se busca en el arreglo si existe o no los datos ingresados por el usuario
    const users = usuarios.find(
        (users) =>
            users.username === user.username && users.password === user.password
    );
    //se retornan las respuestas al preload
    if (users) {
        event.returnValue = 1;
    } else {
        event.returnValue = 0;
        console.log("Usuario o contraseña incorrectos");
    }
});
//se recibe el mensaje del preload para abrir la ventana principal
//si la ventana principal estaba oculta, solamente la vuelve a mostrar
ipcMain.on("ocultar-abrir", () => {
    if (principal) {
        win.hide();
        principal.show();
        console.log("Exsite ventana principal - Oculta");
    } else {
        principal = new BrowserWindow({
            width: 600,
            height: 400,
            webPreferences: {
                nodeIntegration: false,
                contextIsolation: true,
                sandbox: false,
                preload: __dirname + "\\principal\\preload-inicio.js",
            },
        });
        console.log("Creando ventana principal");
        win.hide(), principal.loadFile("./principal/principal.html");
        //se maneja el evento si el usuario cierra la ventana, para evitar que siga en ejecucion el programa
        principal.on("close", () => {
            BrowserWindow.getAllWindows().forEach((win) => win.close());
        });
    }
});
//se oculta la ventana principal y se vuelve a mostrar la ventana de login al recibir el mensaje del click de cerrar sesion
ipcMain.on("cerrar-sesion", () => {
    principal.hide(), win.show();
});
