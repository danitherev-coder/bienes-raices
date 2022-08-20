import express from 'express'
import { buscador, categoria, inicio, noEncontrado } from '../controllers/appController.js'
const router = express.Router()


// PAGINA DE INICIO
router.get('/', inicio)

// PAGINA CATEGORIAS
router.get('/categorias/:id', categoria)
// BUSCADOR
router.get('/404', noEncontrado)
// PAGINA 404
router.post('/buscador', buscador)

export default router

