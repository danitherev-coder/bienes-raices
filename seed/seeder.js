import { exit } from 'node:process'
// CATEGORIAS
import categorias from "./categorias.js";
// import Categoria from '../models/Categoria.js'
// PRECIOS
// import Precio from '../models/Precio.js';
import precios from './precios.js'
import usuarios from './usuarios.js'
import {Precio, Categoria, Usuario} from '../models/index.js'
import db from "../config/db.js";

const importarDatos = async () => {
    try {
        // autenticar 
        await db.authenticate()
        //Generar las columnas
        await db.sync()
        //Insertamos los datos

        // bulkCreate inserta todos los Datos
        await Promise.all([
            Categoria.bulkCreate(categorias),
            Precio.bulkCreate(precios),
            Usuario.bulkCreate(usuarios)
        ])
        console.log('Datos importados correctamente');
        // exit en cero significa que si termina la ejecucion del proceso, es porque esta todo bien, si va en 1 es porque tiene error
        exit(0)
    } catch (error) {
        console.log(error);
        // como es un seeder y trabaja con la base de datos, debemos terminar los procesos por eos pondemos esto, si hay un error lo cierre al instante
        exit(1)
    }
}


const eliminarDatos = async () => {
    try {
        // PRIMERA FORMA DE ELIMINAR DATOS
        // await Promise.all([
        //     Categoria.destroy({where: {}, truncate:true}),
        //     Precio.destroy({where: {}, truncate:true})
        // ])

        // SEGUNDA FORMA DE ELIMINAR DATOS
        await db.sync({force:true}) // esto elimina las tablas y las vuelve a crear
        console.log('Datos eliminados correctamente');
        exit(0);
    } catch (error) {
        console.log(error);
    }
}

// importar datos
if (process.argv[2] === "-i") {
    importarDatos()
}

// Eliminar datos
if (process.argv[2] === "-e") {
    eliminarDatos()
}