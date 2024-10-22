//se recibe el evento del clink
cambiarPassword.onclick = (event) => {
    event.preventDefault();
    //se recuperan los valores de los inputs
    let currentPassword = document.getElementById('current').value;
    let newPassword = document.getElementById('newPass').value;
    let repNewPassword = document.getElementById('repNewPass').value;
    if (currentPassword === '') {
        error.style.display = 'inline-block'
        error.innerText = "Debe introducir la contraseña actual"
        limpiarMensaje(error)
        return;
    }else if (newPassword === '') {
        // se muestra el span y se envia el mensaje de error al usuario, si los campos estan vacios
        error.style.display = 'inline-block'
        error.innerText = "Debe introducir una contraseña nueva"
        limpiarMensaje(error)
        return;
    } else if(repNewPassword === '') {
        error.style.display = 'inline-block'
        error.innerText = "Debe confirmar la contraseña"
        limpiarMensaje(error)
        return;
    }
    //Se compara si la nueva clave y la confirmacion son diferentes y se envia el mensaje de error
    if (newPassword !== repNewPassword) {
        error.style.display = 'inline-block'
        error.innerText = 'Las contraseñas no coinciden.';
        limpiarMensaje(error)
        return;
    }
    //si las claves son iguales se envia la informacion al preload
    api.cambioPassword({ currentPassword, newPassword })
}
//limpiamos el mensaje en pantalla luego de unos segundos
function limpiarMensaje(id) {
    setTimeout(() => {
        id.style.display = 'none';
        id.innerText = ""
    }, 4000);
}