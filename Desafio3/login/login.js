//se escucha el evento del click del boton del formulario
iniciarSesion.onclick = (event) => {
    //prevent default
    event.preventDefault();
    console.log("click")
    //se reciben los valores de los inputs
    let username = document.getElementById("username").value;
    let password = document.getElementById("password").value;

    //se envia al preload del login los datos de los ingresados para iniciar sesion
    api.enviarUser({
        "username": username,
        "password": password
    })
}
register.onclick = (event) => {
    event.preventDefault();
    console.log("click en registrarse")

    api.abrirRegister()
}