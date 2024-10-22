const { contextBridge, ipcRenderer } = require("electron");
//funcion que se envia al main para cerrar sesion
//se le envia el mensaje para que el main, oculte la ventana principal y muestre la ventana de login
contextBridge.exposeInMainWorld("api", {
    cerrarSesion: onCerrarSesion,
})
function onCerrarSesion() {
    ipcRenderer.send("cerrar-sesion")
}
ipcRenderer.on("usuario-logueado", (event, userLogin) => {
    console.log("llego un mensaje del main:" + userLogin)
    //realizar un setTimeOut para mostrar el mensaje y luego ocultarlo

    nombre_usuario.innerText = userLogin
})