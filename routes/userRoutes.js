import express from 'express'
import { formularioLogin,autenticar, formularioRegistro,registrar,confirmarEmail, formularioOlvidePassword, resetPassword, comprobarToken, nuevoPassword } from '../controllers/userControllers.js';

const router = express.Router()

//RUTA PARA EL LOGIN
router.get('/login', formularioLogin)
router.post('/login', autenticar)
// RUTA PARA EL REGISTRO
router.get('/registro', formularioRegistro)
router.post('/registro', registrar)
//confirmar email
router.get('/confirmar-email/:token', confirmarEmail)

router.get('/olvide-password', formularioOlvidePassword)
router.post('/olvide-password', resetPassword)

//Almacenar el nuevo password
//tendremos 2 rutas, la primera es el formulario y el otro el post con el nuevo password
router.get('/olvide-password/:token', comprobarToken)
router.post('/olvide-password/:token', nuevoPassword)

//Como estamos usando el nuevo formato de importaciones y ya no el require, hacemos estos
export default router;