import { validationResult } from 'express-validator'
import { Precio, Categoria, Propiedad } from '../models/index.js'
import { unlink } from 'node:fs/promises'


const admin = async (req, res) => {

    // PAGINACION DE LAS PROPIEDADES
    const { pagina: paginaActual } = req.query
    const expresionRegular = /^[1-9]$/

    if (!expresionRegular.test(paginaActual)) {
        return res.redirect('/mis-propiedades?pagina=1')
    }

    try {
        const { id } = req.usuario
        console.log(id);

        // LIMITES Y OFFSET PARA EL PAGINADOR
        const limit = 3
        const offset = ((paginaActual * limit) - limit)



        const [propiedades, total] = await Promise.all([
            Propiedad.findAll({
                limit,
                offset,
                where: {
                    usuarioID: id
                },
                // estamos haciendo un join en una base de datos, en sequelize se hace asi sencillo
                include: [
                    { model: Categoria, as: 'categoria' },
                    { model: Precio, as: 'precio' }
                ],
                order: [
                    ['createdAt', 'DESC']
                ]
            }),
            Propiedad.count({
                where: {
                    usuarioID: id
                }
            })
        ])



        console.log(total);


        res.render('propiedades/admin', {
            pagina: 'Mis propiedades',
            csrfToken: req.csrfToken(),
            propiedades,
            paginas: Math.ceil(total / limit),
            paginaActual: Number(paginaActual),
            total,
            offset,
            limit
        })
    } catch (error) {
        console.log(error);
    }


}
//formulario para crerar una nueva propeidad
const crear = async (req, res) => {
    // Consultar modelo de precios y categorias
    const [categorias, precios] = await Promise.all([
        Categoria.findAll(),
        Precio.findAll()
    ])
    res.render('propiedades/crear', {
        pagina: 'Crear Propiedad',
        csrfToken: req.csrfToken(),
        categorias,
        precios,
        datos: {}
    })
}

const guardar = async (req, res) => {

    let resultado = validationResult(req)

    if (!resultado.isEmpty()) {
        // Consultar modelo de precios y categorias
        const [categorias, precios] = await Promise.all([
            Categoria.findAll(),
            Precio.findAll()
        ])

        return res.render('propiedades/crear', {
            pagina: 'Crear Propiedad',
            csrfToken: req.csrfToken(),
            categorias,
            precios,
            errores: resultado.array(),
            datos: req.body
        })
    }

    // creamos un registro
    const { titulo, descripcion, habitaciones, estacionamiento, wc, calle, lat, lng, precio: precioID, categoria: categoriaID } = req.body
    const { id: usuarioID } = req.usuario
    try {
        // como en nuestra tabla las relaciones las tenemos como precioID, categoriaID, y cuando eviamos datos por el formulario salen sin el ID, aca vamos a configurar para que salga igual los nombres
        const propiedadGuardar = await Propiedad.create({
            titulo,
            descripcion,
            habitaciones,
            estacionamiento,
            wc,
            calle,
            lat,
            lng,
            precioID,
            categoriaID,
            usuarioID,
            imagen: ''
        })

        const { id } = propiedadGuardar
        res.redirect(`/propiedades/agregar-imagen/${id}`)

    } catch (error) {
        console.log(error);
    }
}

const agregarImagen = async (req, res) => {

    const { id } = req.params

    // Validar que la propiedad exista
    const propiedad = await Propiedad.findByPk(id)
    if (!propiedad) {
        return res.redirect('/mis-propiedades')
    }

    // Validar que la propiedad no este publicada
    if (propiedad.publicado) {
        return res.redirect('/mis-propiedades')
    }

    // Validar que la propiedad pertenece a quien visita la pagina
    if (req.usuario.id.toString() !== propiedad.usuarioID.toString()) {
        return res.redirect('/mis-propiedades')
    }

    //
    res.render('propiedades/agregar-imagen', {
        pagina: `Agregar Imagen: ${propiedad.titulo}`,
        csrfToken: req.csrfToken(),
        propiedad
    })
}


const almacenarImagen = async (req, res, next) => {
    const { id } = req.params

    // Validar que la propiedad exista
    const propiedad = await Propiedad.findByPk(id)
    if (!propiedad) {
        return res.redirect('/mis-propiedades')
    }

    // Validar que la propiedad no este publicada
    if (propiedad.publicado) {
        return res.redirect('/mis-propiedades')
    }

    // Validar que la propiedad pertenece a quien visita la pagina
    if (req.usuario.id.toString() !== propiedad.usuarioID.toString()) {
        return res.redirect('/mis-propiedades')
    }

    try {

        console.log(req.file);
        //almacenar la imagen y publicar propiedad
        propiedad.imagen = req.file.filename
        propiedad.publicado = 1

        await propiedad.save()

        next()

    } catch (error) {
        console.log(error);
    }
}

const editar = async (req, res) => {
    const { id } = req.params
    const propiedad = await Propiedad.findByPk(id)
    if (!propiedad) {
        return res.redirect('/mis-propiedades')
    }

    // Validar que la propiedad pertenece a quien visita la pagina
    if (propiedad.usuarioID.toString() !== req.usuario.id.toString()) {
        return res.redirect('/mis-propiedades')
    }
    // Consultar modelo de precios y categorias
    const [categorias, precios] = await Promise.all([
        Categoria.findAll(),
        Precio.findAll()
    ])
    res.render('propiedades/editar', {
        pagina: 'Editar Propiedad',
        csrfToken: req.csrfToken(),
        categorias,
        precios,
        datos: propiedad
    })

}

const guardarCambios = async (req, res) => {
    let resultado = validationResult(req)

    if (!resultado.isEmpty()) {
        // Consultar modelo de precios y categorias
        const [categorias, precios] = await Promise.all([
            Categoria.findAll(),
            Precio.findAll()
        ])

        return res.render('propiedades/editar', {
            pagina: 'Editar Propiedad',
            csrfToken: req.csrfToken(),
            errores: resultado.array(),
            categorias,
            precios,
            datos: req.body
        })
    }

    const { id } = req.params
    const propiedad = await Propiedad.findByPk(id)
    if (!propiedad) {
        return res.redirect('/mis-propiedades')
    }

    // Validar que la propiedad pertenece a quien visita la pagina
    if (propiedad.usuarioID.toString() !== req.usuario.id.toString()) {
        return res.redirect('/mis-propiedades')
    }

    try {

        const { titulo, descripcion, habitaciones, estacionamiento, wc, calle, lat, lng, precio: precioID, categoria: categoriaID } = req.body

        // como en nuestra tabla las relaciones las tenemos como precioID, categoriaID, y cuando eviamos datos por el formulario salen sin el ID, aca vamos a configurar para que salga igual los nombres
        propiedad.set({
            titulo,
            descripcion,
            habitaciones,
            estacionamiento,
            wc,
            calle,
            lat,
            lng,
            precioID,
            categoriaID
        })
        await propiedad.save()
        res.redirect('/mis-propiedades')
    } catch (error) {
        console.log(error);
    }
}

const eliminar = async (req, res) => {
    const { id } = req.params
    const propiedad = await Propiedad.findByPk(id)
    if (!propiedad) {
        return res.redirect('/mis-propiedades')
    }

    // Validar que la propiedad pertenece a quien visita la pagina
    if (propiedad.usuarioID.toString() !== req.usuario.id.toString()) {
        return res.redirect('/mis-propiedades')
    }

    await unlink(`public/uploads/${propiedad.imagen}`)
    await propiedad.destroy()

    res.redirect('/mis-propiedades')
}


// MOSTRANDO LAS PROPIEDADES PARA EL PUBLICO

const mostrarPropiedad = async (req, res) => {

    const { id } = req.params

    // comprobar que la propiedad exista
    const propiedad = await Propiedad.findByPk(id, {
        include: [
            { model: Categoria, as: 'categoria' },
            { model: Precio, as: 'precio' }
        ]
    })
    if (!propiedad) {
        return res.redirect('/404')
    }

    res.render('propiedades/mostrar', {
        propiedad,
        pagina: propiedad.titulo,
        csrfToken: req.csrfToken()
    })
}

export {
    admin, crear, guardar, agregarImagen, almacenarImagen, editar, guardarCambios, eliminar, mostrarPropiedad
}