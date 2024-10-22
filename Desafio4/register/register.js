//se escucha el evento del click del boton del formulario
registrarse.onclick = (event) => {
    //prevent default
    event.preventDefault();
    console.log("click")
    //se reciben los valores de los inputs
    let name = document.getElementById("name").value;
    let username = document.getElementById("username").value;
    let password = document.getElementById("password").value;

    //se envia al preload del login los datos de los ingresados para iniciar sesion
    api.enviarRegistro({
        "username": username,
        "password": password,
        "name": name
    })
}
//se escucha el evento del click para enviar al main la solicitud de abrir la ventana de inicio de sesion
iniciarSesion.onclick = (event) => {
    event.preventDefault();
    console.log("click en iniciar sesion")

    api.abrirIniciarSesion()
}