import { check, validationResult } from 'express-validator'
import bcrypt from 'bcrypt'
import Usuario from '../models/Usuario.js'
import { generarID,generarJWT } from '../helpers/tokens.js'
import { emailRegistro, emailOlvidePassword } from '../helpers/emails.js'


const formularioLogin = (req, res) => {
    res.render('auth/login', {
        pagina: 'Iniciar Sesion',
        csrfToken: req.csrfToken()
    })
}

const autenticar = async (req, res) => {
    await check("email", 'El email es obligatorio').isEmail().run(req)
    await check("password", 'El password es obligatorio').notEmpty().run(req)

    let resultado = validationResult(req)
    //verificar que el resultadoe ste vacio, si esta vacio es porque no hay error y puede crear al usuario, pero en esta ocasion negaremos para poder validar con ! 
    if (!resultado.isEmpty()) {
        // errores
        return res.render('auth/login', {
            pagina: 'Iniciar Sesion',
            csrfToken: req.csrfToken(), // para mostrar estos errores nos vamos al archivo registro.pug y hacemos un IF
            errores: resultado.array()
        })
    }
    const {email, password} = req.body
    //comprobar que l usuario exista
    const usuario = await Usuario.findOne({where: {email}})
    if(!usuario){
        return res.render('auth/login', {
            pagina: 'Iniciar Sesion',
            csrfToken: req.csrfToken(),
            errores: [{msg: 'El usuario no existe'}]
        })
    }
    //ahora que sabemos si el usuairo o no existe, debemos verificar que haya confirmado su cuenta(email) para continuar
    if(!usuario.confirmado){
        return res.render('auth/login', {
            pagina: 'Iniciar Sesion',
            csrfToken: req.csrfToken(),
            errores: [{msg: 'Tu cuenta no ha sido confirmada'}]
        })
    }
    //revisar que el password coincida, en nuestro mdoelo de Usuario, hicimos la verificacion del password y aca lo llamamos
    if(!usuario.verificarPassword(password)){
        return res.render('auth/login', {
            pagina: 'Iniciar Sesion',
            csrfToken: req.csrfToken(),
            errores: [{msg: 'El password es incorrecto'}]
        })
    }
    //ahora autenticamos al usuario - crearemos un JSON WEB TOKEN

    const token = generarJWT(usuario.id) //creare una funcion en la crpeta helpers para generar un JWT

    console.log(token);
    //el token lo almacenaremos en una cookie
    return res.cookie('_token', token, {
        httpOnly: true, // cookie no sera accesible desde la API de JS para seguridad
        //secure: true // ESTO SIRVE PARA COENXINES SEGURAS, COMO HTTPS, pero como no tenemos lo comento

    }).redirect('/mis-propiedades')
}

// CERRAR SESION
const cerrarSesion = (req, res) => {
    return res.clearCookie('_token').status(200).redirect('/auth/login')
}


const formularioRegistro = (req, res) => {
    res.render('auth/registro', {
        pagina: 'Crear Cuenta',
        csrfToken: req.csrfToken()
    })
}
const registrar = async (req, res) => {
    //Validaciones de los campos del registro
    await check("nombre", 'El nombre no debe ir vacio').notEmpty().run(req)
    await check("email", 'El email no es valido').isEmail().run(req)
    await check("password", 'La contraseña debe tener minimo 6 caracteres').isLength({ min: 6 }).run(req)
    await check("repetir_password", 'Las contraseñas no son iguales').equals(req.body.password).run(req)

    let resultado = validationResult(req)
    //verificar que el resultadoe ste vacio, si esta vacio es porque no hay error y puede crear al usuario, pero en esta ocasion negaremos para poder validar con ! 
    if (!resultado.isEmpty()) {
        // errores
        return res.render('auth/registro', {
            pagina: 'Crear Cuenta',
            errores: resultado.array(),
            csrfToken: req.csrfToken(), // para mostrar estos errores nos vamos al archivo registro.pug y hacemos un IF
            usuario: {
                nombre: req.body.nombre,
                email: req.body.email
            }
        })
    }

    // Extraer los datos del modelo
    const { nombre, email, password } = req.body;

    //VERIFICAR QUE EL USUARIO NO ESTE REGISTRADO
    const existeUsuario = await Usuario.findOne({ where: { email } })
    if (existeUsuario) {
        return res.render('auth/registro', {
            pagina: 'Crear Cuenta',
            csrfToken: req.csrfToken(),
            errores: [{ msg: 'El Usuario ya esta registrado' }], // para mostrar estos errores nos vamos al archivo registro.pug y hacemos un IF
            usuario: {
                nombre: req.body.nombre,
                email: req.body.email
            }
        })
    }

    //Los errores lo guardamos en resultado como lo pusimos arriba y lo convertimos en array
    // res.json(resultado.array()) Como queremos que los errores se muestren para el usuario, cortamos la parte de resultado.array() y lo pegamos en el return de arriba poniendo un nombre de errores para reconcerlo ejejej

    //Almacenar USUARIOS
    const usuario = await Usuario.create({
        nombre,
        email,
        password,
        token: generarID()
    })

    //verificar que el usuario confirme su email, para esto, usamos el email de la carpeta token, una vez hecho esto nos vamos a esa carpeta y a email para configurar el senMail.
    emailRegistro({
        nombre: usuario.nombre,
        email: usuario.email,
        token: usuario.token
    })



    //Mostrar mensaje de confirmacion de cuenta
    res.render('templates/mensaje', {
        pagina: 'Cuenta Creada Correctamente',
        csrfToken: req.csrfToken(),
        mensaje: 'Hemos enviado un Email de confirmacion, presiona en el siguiente enlace:'
    })
}
//Confirmar email
const confirmarEmail = async (req, res) => {
    const { token } = req.params;

    //verificar si el token es valido
    const usuario = await Usuario.findOne({ where: { token } });
    if (!usuario) {
        return res.render('auth/confirmar-email', {
            pagina: 'Error al intentar Confirmar email',
            csrfToken: req.csrfToken(),
            mensaje: 'Hubo un error al confirmar tu cuenta',
            error: true
        })
    }
    //confirmar la cuenta
    //vamos a eliminar el token generado para que se pueda uzar solo una vez y asi aumentar la seguridad de la app
    usuario.token = null;
    usuario.confirmado = true
    await usuario.save()
    res.render('auth/confirmar-email', {
        pagina: 'Cuenta Confirmada',
        csrfToken: req.csrfToken(),
        mensaje: 'El email se confirmo correctamente',
    })
}

const formularioOlvidePassword = (req, res) => {
    res.render('auth/olvide-password', {
        pagina: 'Recuperar tu acceso a Bienes Raices',
        csrfToken: req.csrfToken()
    })
}

//desde aca empieza la seccion 9 , para generar otro password hasheado para cmabiar contraseña
//nos creamos otro endpoint y lo usamos en la ruta
const resetPassword = async (req, res) => {
    //Validacion
    await check("email", 'El email no es valido').isEmail().run(req)

    let resultado = validationResult(req)
    //verificar que el resultadoe ste vacio, si esta vacio es porque no hay error y puede crear al usuario, pero en esta ocasion negaremos para poder validar con ! 
    if (!resultado.isEmpty()) {
        // errores
        return res.render('auth/olvide-password', {
            pagina: 'Recuperar tu acceso a Bienes Raices',
            csrfToken: req.csrfToken(),
            errores: resultado.array(), // para mostrar estos errores nos vamos al archivo registro.pug y hacemos un IF
            
        })
    }
    //Para poder restablecer la contraseña, debemos verificar que el usuario exista, si existe, vamos a generar un nuevo token y enviar el email, si no esta registrado, no hay usuario con esa cuenta
    const { email } = req.body
    const usuario = await Usuario.findOne({ where: { email } })
    if (!usuario) {
        return res.render('auth/olvide-password', {
            pagina: 'Recuperar tu acceso a Bienes Raices',
            csrfToken: req.csrfToken(),
            errores: [{ msg: 'El email no pertenece a ninguna cuenta' }]
        })
    }
    //AHORA SI Generamos un nuevo token y enviar email
    usuario.token = generarID()
    //guardamos el nuevo token generado
    await usuario.save()

    // enviar un email 
    //enviamos este objeto para que en el helper esta funcion la que tiene (datos) pueda capturarla y usarla en esa funcion xd
    emailOlvidePassword({
        email: usuario.email,
        nombre: usuario.nombre,
        token: usuario.token
    })

    //renderizar un mensaje que diga al usuairo que revise su email para seguir las instrucciones de restablecer contraseña
    res.render('templates/mensaje', {
        pagina: 'Restablece tu password',
        csrfToken: req.csrfToken(),
        mensaje: 'Hemos enviado un email con las instrucciones'
    })
}

const comprobarToken = async (req, res) => {
    //Queremos identidicar quien es la persona que solicita cambiar password
    const { token } = req.params
    const usuario = await Usuario.findOne({ where: { token } })
    //Si el usuario no es valido
    if (!usuario) {
        return res.render('auth/confirmar-email', {
            pagina: 'Restablece tu password',
            csrfToken: req.csrfToken(),
            mensaje: 'Hubo un error al validar tu informacion, intenta de nuevo',
            error: true
        })
    }
   //Si el usuario es VALIDO
   //mostraremos el formulario para modificar el password
   res.render('auth/resetPassword', {
        pagina: 'Restablece tu password',
        csrfToken: req.csrfToken()
   })
}

const nuevoPassword = async (req, res) => {
    //Validar el password
    await check("password", 'La contraseña debe tener minimo 6 caracteres').isLength({ min: 6 }).run(req)
    let resultado = validationResult(req)
    if (!resultado.isEmpty()) {
        // errores
        return res.render('auth/resetPassword', {
            pagina: 'Restablece tu password',
            csrfToken: req.csrfToken(),
            errores: resultado.array()
        })
    }

    const {token} = req.params
    const {password} = req.body
    //Identificar quien hace el cambio
    const usuario = await Usuario.findOne({where: {token}})

    //Hashea el password - cifrar
    const salt = await bcrypt.genSalt(10)
    usuario.password = await bcrypt.hash(password, salt)
    //ahora quitamos el token para que no pueda volver a usarlo, para eso tendria que enviar otra peticion de cambio de contraseña
    usuario.token = null

    //guardamos los cambios
    await usuario.save()
    
    //renderizar una vista de confirmar email
    res.render('auth/confirmar-email', {
        pagina: 'Password restablecido',
        csrfToken: req.csrfToken(),
        mensaje: 'El password se guardo correctamente'
    })
}

export {
    formularioLogin,
    autenticar,
    cerrarSesion,
    formularioRegistro,
    formularioOlvidePassword,
    registrar,
    confirmarEmail,
    //seccion 9 
    resetPassword,
    comprobarToken,
    nuevoPassword
}