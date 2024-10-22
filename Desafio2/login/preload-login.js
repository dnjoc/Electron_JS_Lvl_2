const { contextBridge, ipcRenderer } = require("electron");
console.log("preload")
contextBridge.exposeInMainWorld("api", {
    enviarUser: onEnviarUsuario,
})
//funcion para enviar los datos del usuario al main
function onEnviarUsuario(user) {
    console.log("enviar en preload");
    console.log(user)
    resultado = ipcRenderer.sendSync("login", user)
    //se recibe el resultado y dependiendo el valor se realiza una accion tanto en el HTML
    //como otro mensaje al main para ocultar o mostrar las ventanas
    if (resultado === 0) {
        //se compara si los datos ingresados son un string vacio para notificar al usuario
        if (user.username === '' || user.password === '') {
            // se muestra el span y se envia el mensaje de error al usuario
            errorUser.style.display = 'inline-block'
            errorUser.innerText = "Los campos no pueden estar vacios"
        } else {
            // se muestra el span y se envia el mensaje de error al usuario
            errorUser.style.display = 'inline-block'
            errorUser.innerText = "Usuario o Contraseña, no existen!"
        }
    } else {
        //si el resultado de los datos ingresados se consigue en la base de datos, se envia un mensaje al main
        //para crear si no existe, y/o mostrar la ventana si ya fue creada
        ipcRenderer.send("ocultar-abrir")
        //se limpian los valores de los inputs y del span del mensaje de error
        document.getElementById('username').value = '';
        document.getElementById('password').value = '';
        errorUser.style.display = 'none'
        errorUser.innerText = ""
    }
}
