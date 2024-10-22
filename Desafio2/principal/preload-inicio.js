const { contextBridge, ipcRenderer } = require("electron");
//funcion que se envia al main para cerrar sesion
//se le envia el mensaje para que el main, oculte la ventana principal y muestre la ventana de login
contextBridge.exposeInMainWorld("api", {
    cerrarSesion: onCerrarSesion,
})
function onCerrarSesion() {
    ipcRenderer.send("cerrar-sesion")
}