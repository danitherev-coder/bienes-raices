import express from 'express'
import { body } from 'express-validator'
import { admin, crear, guardar, agregarImagen, almacenarImagen, editar, guardarCambios, eliminar, cambiarEstado, mostrarPropiedad, enviarMensaje, verMensajes } from '../controllers/propiedadController.js'
import protegerRuta from '../middleware/protegerRuta.js'
import upload from '../middleware/subirImagen.js'
import identificarUsuario from '../middleware/identificarUsuario.js'



const router = express.Router()


router.get('/mis-propiedades', protegerRuta, admin)
router.get('/propiedades/crear', protegerRuta, crear)
router.post('/propiedades/crear',
    protegerRuta,
    body('titulo', 'El titulo es obligatorio').notEmpty(),
    body('descripcion', 'La descripcion no debe estar vacia').notEmpty()
        .isLength({ max: 15000 }).withMessage('La descripcion es muy corta'),
    body('categoria', 'Seleccione una categoria').isNumeric(),
    body('precio', 'Seleccione un precio').isNumeric(),
    body('habitaciones', 'Seleccione la cantidad de habitaciones').isNumeric(),
    body('estacionamiento', 'Seleccione los estacionamientos').isNumeric(),
    body('wc', 'Seleccione cuantos baños quiere').isNumeric(),
    body('lat', 'Ubique la propiedad en el mapa').notEmpty(),
    guardar
)

router.get('/propiedades/agregar-imagen/:id', protegerRuta, agregarImagen)
router.post('/propiedades/agregar-imagen/:id',
    protegerRuta,
    upload.single('imagen'), // esto hace que suba UNA SOLO IMAGEN
    // upload.array() // esto hace que puedas subir varias imagenes
    almacenarImagen
)

router.get('/propiedades/editar/:id', protegerRuta, editar)
router.post('/propiedades/editar/:id',
    protegerRuta,
    body('titulo', 'El titulo es obligatorio').notEmpty(),
    body('descripcion', 'La descripcion no debe estar vacia').notEmpty()
        .isLength({ max: 15000 }).withMessage('La descripcion es muy corta'),
    body('categoria', 'Seleccione una categoria').isNumeric(),
    body('precio', 'Seleccione un precio').isNumeric(),
    body('habitaciones', 'Seleccione la cantidad de habitaciones').isNumeric(),
    body('estacionamiento', 'Seleccione los estacionamientos').isNumeric(),
    body('wc', 'Seleccione cuantos baños quiere').isNumeric(),
    body('lat', 'Ubique la propiedad en el mapa').notEmpty(),
    guardarCambios
)

router.post('/propiedades/eliminar/:id', protegerRuta, eliminar)
router.put('/propiedades/:id',
    protegerRuta,
    cambiarEstado

)

// AREA PUBLICA, CUALQUIERA PODRA VER LAS PROPIEDADES, MAS NO EDITARLAS
router.get('/propiedad/:id',
    identificarUsuario,
    mostrarPropiedad
)

// ALMACENAR LOS MENSAJES
router.post('/propiedad/:id',
    identificarUsuario,
    body('mensaje').isLength({ min: 10 }).withMessage('El mensaje no puede ir vacio o es muy corto'),
    enviarMensaje
)

// Ver los mensajes
router.get('/mensajes/:id',
    protegerRuta,
    verMensajes
)

export default router