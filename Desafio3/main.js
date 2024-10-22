const { app, BrowserWindow, ipcMain, Menu } = require("electron");
const fs = require("fs")
process.env["ELECTRON_DISABLE_SECURITY_WARNINGS"] = true;
//se crean las variables de las ventanas
let win
let principal
let winReg
let usuarios
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
    console.log("log de datos ingresados:")
    console.log(user);
    // console.log(user.username);
    // console.log(user.password);
    fs.readFile("usuarios.json", "utf8", (err, data) => {
        console.log(data)
        if (!data)
            console.log("el archivo no existe")
        else
            try {
                usuarios = JSON.parse(data)
                console.log("log de usuarios:")
                console.log(usuarios)
            } catch (error) {
                console.log("no se puedo procesar el archivo")
                console.log(error)
            }
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
    })
});
//abre la ventanda de registro, desde la ventana de inicio de sesion
ipcMain.on("abrir-registro", () => {
    if (winReg) {
        win.hide()
        winReg.show()
    } else {
        winReg = new BrowserWindow({
            width: 800,
            height: 600,
            webPreferences: {
                nodeIntegration: false,
                contextIsolation: true,
                sandbox: false,
                preload: __dirname + "\\register\\preload-register.js",
            },
        });
        win.hide();
        winReg.loadFile("./register/register.html");
        winReg.on("close", () => {
            BrowserWindow.getAllWindows().forEach((win) => win.close());
        });
    }
})
//abre la ventana de iniciar sesion, desde la ventana de registro
ipcMain.on("abrir-inicio-sesion", () => {
    winReg.hide()
    win.show()
})
//se buscar el usuario a registrar, para comprobar si no existe, o si no estan vacios los datos, 
//para luego agregarlos al arreglo en la variable
ipcMain.on("registrar", (event, user) => {
    console.log("log de datos ingresados:")
    console.log(user);
    // console.log(user.username);
    // console.log(user.password);
    fs.readFile("usuarios.json", "utf8", (err, data) => {
        console.log(data)
        if (!data)
            console.log("el archivo no existe")
        else
            try {
                usuarios = JSON.parse(data)
                console.log("log de usuarios:")
                console.log(usuarios)
            } catch (error) {
                console.log("no se puedo procesar el archivo")
                console.log(error)
            }
        //se busca en el arreglo si existe o no los datos ingresados por el usuario
        const esxisteUsuario = usuarios.find(
            (users) =>
                users.username === user.username
        );
        //se retornan las respuestas al preload
        if (esxisteUsuario) {
            //si existe el username, se retorna 1 a la ventanda de registro, para no agregar usuario duplicado
            console.log("retornando 1")
            event.returnValue = 1;
        } else if (!(user.name === '' || user.username === '' || user.password === '')) {
            // si el username no esta registrado y contiene todos los valores
            // se guarda el nuevo usuario en la variable
            usuarios.push(user)
            console.log("retornando 2")
            event.returnValue = 2;
        }
        else {
            //se retorna 0 si existe algun valor vacio
            console.log("retornando 0")
            event.returnValue = 0;
        }
    })
});
//recibe el mensaje del registro para guardar en el arreglo el nuevo usuario
ipcMain.on("guardar-registro", (event) => {
    console.log("guardando registro");
    const msg = "Se ha registrado exitosamente, por favor, vuelva a la ventana de inicio de sesion"
    fs.writeFile("usuarios.json", JSON.stringify(usuarios), (err) => {
        if (err == null) {
            //envia mensaje a la ventana registro para indicar que se agrego satisfactoriamente el nuevo usuario
            winReg.webContents.send("Registro exitoso", msg)
            console.log("se guardaron los cambios")
        } else
            console.log("error al guardar los cambios en el archivo:" + err)
    })

})
//se recibe el mensaje del preload para abrir la ventana principal
//si la ventana principal estaba oculta, solamente la vuelve a mostrar
ipcMain.on("ocultar-abrir", (event, userLogin) => {
    //conseguir el nombre del usuario logueado, buscando en el arreglo de usuarios
    const usuario = usuarios.find((users) => users.username === userLogin);
    if (principal) {
        win.hide();
        principal.webContents.send("usuario-logueado", usuario.name)
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
        principal.webContents.send("usuario-logueado", usuario.name)
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
