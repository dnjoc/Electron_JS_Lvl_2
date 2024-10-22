const { app, BrowserWindow, ipcMain, Menu, Tray, shell, Notification } = require("electron");
const fs = require("fs")
process.env["ELECTRON_DISABLE_SECURITY_WARNINGS"] = true;
//se crean las variables de las ventanas
let win
let principal
let winReg
let winCambioPassword
//se crean las demas variables
let usuarios
let icoPath
let tiempoSesion
let tray
let usuarioActual
let rutaUser
// si se esta ejecutando la aplicacion compilada
if (app.isPackaged){
    rutaUser = 'resources\\usuarios.json'
    icoPath = 'resources\\logo.ico'
}else{
    rutaUser = 'usuarios.json'
    icoPath = 'logo.ico'
}
//Calculo para mostrar el tiempo transcurrido en una notificacion
function calculoTiempo() {
    const terminoSesion = new Date().getTime()
    const tiempoDeSesion = terminoSesion - tiempoSesion
    const horasTranscurridas = Math.floor((tiempoDeSesion / 1000) / 60 / 60)
    const minutosTranscurridos = Math.floor((tiempoDeSesion / 1000) / 60)
    const segundosTranscurridos = Math.floor((tiempoDeSesion / 1000) % 60)
    new Notification({
        title: 'Sesión cerrada',
        body: `Estuviste en la aplicación por ${horasTranscurridas} hr - ${minutosTranscurridos} min - ${segundosTranscurridos} seg.`,
        icon: icoPath,
    }).show();
}
//Funciones para crear el try menu inicial
function crearTryMenuInicial() {
    return Menu.buildFromTemplate([
        {
            label: 'Salir', click: () => {
                //se cierra la aplicacion
                app.quit()
            }
        },
        {
            label: 'Ayuda', click: () => {
                //se llama a la ventana del navegador por defecto con una pagina 
                shell.openExternal('https://icon-icons.com/es/icono/pruebas-rendimiento-dwh/261699')
            }
        },
    ])
}
//Funciones para crear el tray menu al iniciar sesion
function crearTryMenuOnSesion() {
    return Menu.buildFromTemplate([
        { label: 'Salir', click: () => { 
            app.quit(); 
            } 
        },
        {
            label: 'Cerrar sesión', click: () => {
                //Al hacer click se cierra la sesion y se muestra la ventana de inicio de sesion
                principal.hide();
                win.show();
                //se cambia el try menu
                tray.setContextMenu(crearTryMenuInicial())
                usuarioActual = null
                //se muestra el mensaje con el tiempo que duró la sesion activa
                calculoTiempo()
            }
        },
        {
            label: 'Cambiar clave', click: () => {
                //al hacer click se abre la ventana para cambiar la clave
                if (winCambioPassword) {
                    winCambioPassword.show();
                } else {
                    winCambioPassword = new BrowserWindow({
                        width: 400,
                        height: 500,
                        webPreferences: {
                            nodeIntegration: false,
                            contextIsolation: true,
                            sandbox: false,
                            preload: __dirname + "\\update-password\\preload-update.js",
                        },
                    });
                    winCambioPassword.loadFile("./update-password/update.html");
                    //winCambioPassword.webContents.openDevTools();
                    winCambioPassword.on("close", () => {
                        winCambioPassword = null;
                    });
                }
            }
        }
    ])
}
//se elimina el menu por defecto de las ventanas
Menu.setApplicationMenu(null);
//al iniciar la aplicacion se crea la ventana del login
app.on("ready", () => {
    tray = new Tray(icoPath)
    tray.setToolTip("Desafio 4 Electron")
    tray.setContextMenu(crearTryMenuInicial())
    app.setAppUserModelId("Desafio 4 Electron");
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
        app.quit();
    });
});
//se recibe el mensaje del click del formulario con los datos de los inputs
ipcMain.on("login", (event, user) => {
    console.log("log de datos ingresados:")
    console.log(user);
    // console.log(user.username);
    // console.log(user.password);
    fs.readFile(rutaUser, "utf8", (err, data) => {
        console.log(data)
        if (!data)
            console.log("el archivo no existe")
        else
            try {
                usuarios = JSON.parse(data)
                console.log("log de usuarios:")
                console.log(usuarios)
            } catch (error) {
                console.log("no se pudo procesar el archivo")
                console.log(error)
            }
        //se busca en el arreglo si existe o no los datos ingresados por el usuario
        if (usuarios) {
            const users = usuarios.find(
                (users) =>
                    users.username === user.username && users.password === user.password
            );
        
        //se retornan las respuestas al preload
        if (users) {
            tiempoSesion = new Date().getTime();
            usuarioActual = users
            //pasar a Capitalize el nombre de usuario
            const userLog = users.name.charAt(0).toUpperCase() + users.name.slice(1);
            //se muestra una notificacion de bienvenida con el nombre del usuario y la fecha y hora
            new Notification({
                title: 'Bienvenido: ',
                body: `${userLog}. Fecha: ${new Date().toLocaleDateString()} Hora: ${new Date().toLocaleTimeString()}`,
                icon: icoPath,
            }).show()
            event.returnValue = 1;
            //se crea el try menu al iniciar sesion
            tray.setContextMenu(crearTryMenuOnSesion());
        } else {
            event.returnValue = 0;
            console.log("Usuario o contraseña incorrectos");
        }
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
            app.quit();
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
    fs.readFile(rutaUser, "utf8", (err, data) => {
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
        if (usuarios) {
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
            app.quit();
        });
    }
});
//se oculta la ventana principal y se vuelve a mostrar la ventana de login al recibir el mensaje del click de cerrar sesion
ipcMain.on("cerrar-sesion", () => {
    usuarioActual = null
    tray.setContextMenu(crearTryMenuInicial())
    //Se muestra el tiempo transcurrido en la sesion, al cerrar sesion con el boton de la ventana
    calculoTiempo()
    principal.hide(), win.show()
});
//Se reciben los datos para el cambio de clave
ipcMain.on('cambiar-clave', (event, { currentPassword, newPassword }) => {
    const usuarioLogueado = usuarioActual
    //se compara la clave anterior ingresada, para verificar si es igual a la clave almacenada
    if (usuarioLogueado.password !== currentPassword) {
        winCambioPassword.webContents.send('clave-cambiada', 'La contraseña anterior es incorrecta.')
        return;
    }
    console.log("antes de guardar", usuarios)
    usuarioLogueado.password = newPassword
    console.log("despues de guardar", usuarios)
    //se intenta actualizar la clave nueva
    fs.writeFile('usuarios.json', JSON.stringify(usuarios), (err) => {
        if (err) {
            //se envia el mensaje de error de cambio de clave
            winCambioPassword.webContents.send('clave-cambiada', 'Error al cambiar la contraseña.')
        } else {
            //se envia el mensaje de cambio de clave exitosa
            winCambioPassword.webContents.send('clave-cambiada', 'Contraseña cambiada exitosamente.')
        }
    });
});
