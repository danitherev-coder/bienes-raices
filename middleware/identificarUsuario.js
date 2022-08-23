import jwt from 'jsonwebtoken'
import Usuario from '../models/Usuario.js'

const idetentificarUsuario = async (req, res, next) => {
    // identificar si hay un token
    const {_token} = req.cookies
    if (!_token) {
        req.usuario = null
        return next()
    }
    // comprobar el token
    try {
        // similar a proteger ruta
        const decoded = jwt.verify(_token, process.env.JWT_PALABRASECRET)
        const usuario = await Usuario.findByPk(decoded.id)
        if (usuario) {
            req.usuario = usuario
        }

        return next()
    } catch (error) {
        console.log(error);
        return res.clearCookie('_token').redirect('/auth/login')
    }
} 

export default idetentificarUsuario