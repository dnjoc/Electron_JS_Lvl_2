const { contextBridge, ipcRenderer } = require("electron");
console.log("preload")
contextBridge.exposeInMainWorld("api", {
    enviarRegistro: onEnviarRegistro,
    abrirIniciarSesion: onAbrirIniciarSesion,
})
//funcion para enviar los datos del usuario al main para registrar
function onEnviarRegistro(user) {
    console.log("enviar en preload");
    console.log(user)
    resultado = ipcRenderer.sendSync("registrar", user)
    //se recibe el resultado y dependiendo el valor se realiza una accion tanto en el HTML
    //como otro mensaje al main para ocultar o mostrar las ventanas
    if (resultado === 0) {
        console.log("Error campos vacios");
        //se compara si los datos ingresados son un string vacio para notificar al usuario
        if (user.name === '' || user.username === '' || user.password === '') {
            // se muestra el span y se envia el mensaje de error al usuario
            errorUser.style.display = 'inline-block'
            errorUser.innerText = "Los campos no pueden estar vacios"
            limpiarMensaje(errorUser)
        }
    } else {
        if (resultado === 1) {
            console.log("Nombre de usuario existente");
            // se muestra el span y se envia el mensaje de error al usuario
            errorUser.style.display = 'inline-block'
            errorUser.innerText = "El nombre de usuario ya esta registrado!"
            limpiarMensaje(errorUser)
        } else {
            //si el resultado de los datos ingresados se consigue en la base de datos, se envia un mensaje al main
            //para crear si no existe, y/o mostrar la ventana si ya fue creada
            ipcRenderer.send("guardar-registro")
            console.log("Guardando registro");
            //se limpian los valores de los inputs y del span del mensaje de error
            limpiarInputs()
        }
    }
}
//llamada al main para abrir la ventana de inicio de sesion
function onAbrirIniciarSesion() {
    ipcRenderer.send("abrir-inicio-sesion")
    limpiarInputs()
}
//llamamos al main para agregar el registro al archivo del arreglo
ipcRenderer.on("Registro exitoso", (event, msg) => {
    console.log("llego un mensaje del main:" + msg)
    //realizar un setTimeOut para mostrar el mensaje y luego ocultarlo
    mensaje.style.display = 'inline-block'
    mensaje.innerText = msg
    limpiarMensaje(mensaje)
})
//limpiamos el mensaje en pantalla luego de unos segundos
function limpiarMensaje(id) {
    setTimeout(() => {
        id.style.display = 'none';
        id.innerText = ""
    }, 4000);
}
//limpiamos los imputs
function limpiarInputs() {
    document.getElementById('name').value = '';
    document.getElementById('username').value = '';
    document.getElementById('password').value = '';
}