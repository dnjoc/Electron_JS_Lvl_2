const { ipcRenderer, contextBridge } = require('electron');
contextBridge.exposeInMainWorld("api", {
    cambioPassword: onCambiarClave
})
//se reciben los datos de los inputs y se envian al main
function onCambiarClave(cambio) {
    console.log(cambio)
    ipcRenderer.send('cambiar-clave', cambio)
}
//se reciben las respuestas del main
ipcRenderer.on('clave-cambiada', (event, msg) => {
    if (msg === 'Contraseña cambiada exitosamente.') {
        document.getElementById('current').value = '';
        document.getElementById('newPass').value = '';
        document.getElementById('repNewPass').value = '';
        mensaje.style.display = 'inline-block'
        mensaje.innerText = msg
        limpiarMensaje(mensaje)
    } else {
        error.style.display = 'inline-block'
        error.innerText = msg;
        limpiarMensaje(error)
    }
});
//limpiamos el mensaje en pantalla luego de unos segundos
function limpiarMensaje(id) {
    setTimeout(() => {
        id.style.display = 'none';
        id.innerText = ""
    }, 4000);
}