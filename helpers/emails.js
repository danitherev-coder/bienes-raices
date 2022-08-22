import nodemailer from 'nodemailer'
import dotenv from 'dotenv'
dotenv.config()
//vamos a tener 2 email, uno para confirmar cuenta y otro cuando al usuario se le olvide su password
const emailRegistro = async (datos) => {
    var transport = nodemailer.createTransport({
        host: "smtp.mailtrap.io",
        port: 2525,
        auth: {
          user: "4e22e79eb5c585",
          pass: "47b1d3a87e4b43"
        }
      });

    const { nombre, email, token } = datos;
    //ENVIAR EL EMAIL, para eso usamos el transport que sirve para tener acceso a la funcion de sendMail
    // como puede demorar un poco en enviar los email, debemos usar el await
    await transport.sendMail({
        from: "<Bienes Raices>",
        to: email,
        subject: 'Confirma tu Cuenta',
        text: 'Confirma tu Cuenta',
        html: `
            <p>Hola ${nombre} confirma tu cuenta en la pagina de PORNHUB</p>
            <a href="${process.env.BACKEND_URL}:${process.env.PORT ?? 3000}/auth/confirmar-email/${token}">confirmar cuenta</a>
        `
    })
}

const emailOlvidePassword = async (datos) => {
    var transport = nodemailer.createTransport({
        host: "smtp.mailtrap.io",
        port: 2525,
        auth: {
          user: "4e22e79eb5c585",
          pass: "47b1d3a87e4b43"
        }
      });

    const { nombre, email, token } = datos;
    //ENVIAR EL EMAIL, para eso usamos el transport que sirve para tener acceso a la funcion de sendMail
    // como puede demorar un poco en enviar los email, debemos usar el await
    await transport.sendMail({
        from: "<Bienes Raices>",
        to: email,
        subject: 'Restablece tu password en BienesRaices.com',
        text: 'Restablece tu password en BienesRaices.com',
        html: `
            <p>Hola ${nombre} ha solicitado restablecer tu password de PORNHUB</p>
            <p>Sigue el siguiente enlace para generar un password nuevo</p>
            <a href="${process.env.BACKEND_URL}:${process.env.PORT ?? 3000}/auth/olvide-password/${token}">Restablecer Password</a>

            <p>Si tu no solicitaste el cambio de password, puede ignorar este mensaje</p>
        `
    })
}


export {
    emailRegistro,
    emailOlvidePassword
}