import { Precio, Categoria, Propiedad } from '../models/index.js'

const inicio = async (req, res) => {


    const [categorias, precios, casas, departamentos] = await Promise.all([
        Categoria.findAll({ raw: true }),
        Precio.findAll({ raw: true }),
        Propiedad.findAll({
            limit: 3,
            where: {
                categoriaID: 1
            },
            include: [
                { model: Precio, as: 'precio' }
            ],
            order: [
                ['createdAt', 'DESC']
            ]
        }),
        Propiedad.findAll({
            limit: 3,
            where: {
                categoriaID: 2
            },
            include: [
                { model: Precio, as: 'precio' }
            ],
            order: [
                ['createdAt', 'DESC']
            ]
        })
    ])
    console.log(categorias);
    res.render('inicio', {
        pagina: 'Inicio',
        categorias,
        precios,
        casas,
        departamentos
    })
}

const categoria = async (req, res) => {
    const { id } = req.params

    // Comprobar que la categoria visita exista
    const categoria = await Categoria.findByPk(id)
    if (!categoria) {
        return res.redirect('/404')
    }
    // Obtener las propiedades una vez validado la categoria
    // si llego hasta aca es porque existe la categoria
    const propiedades = await Propiedad.findAll({
        where: {
            categoriaID: id
        },
        include: [
            { model: Precio, as: 'precio' }
        ]
    })

    res.render('categoria', {
        pagina: `${categoria.nombre}s en Venta`,
        propiedades,
    })
}

const noEncontrado = (req, res) => {
    res.render('404', {
        
    })
}

const buscador = (req, res) => {

}

export {
    inicio,
    categoria,
    noEncontrado,
    buscador
}