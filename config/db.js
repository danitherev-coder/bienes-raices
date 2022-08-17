import Sequelize from 'sequelize'
import dotenv from 'dotenv'
dotenv.config()
//Sequelize toma 4 parametros.
// 1. Nombre de la base de datos
// 2. Usuario
// 3. contraseña
// 4. Pueden ser mas parametros que desea(HOSTING)
const db = new Sequelize(process.env.BD_NOMBRE, process.env.BD_USER, process.env.BD_PASS ?? '', {
    //Se puede pasar un HOST
    host: process.env.BD_HOST,
    port: 3306,
    dialect: 'mysql',
    define: {
        timestamps: true, //agrega 2 columnas extras, uno es cuando fue creado un usuario y cuando fue actualizado
    },
    //pool configura como va ser el comportamiento para conexiones nuevas o existentes, mantener o reutilizar conexiones que esten activas y no crear una nueva, maximo es 5 conexiones para mantenerlo activo y cero, es decir desconectar para aligerar recursos, acquire es tiempo de intentar conexion antes de marcar error y idle es si no hay visitas nadie usa el proyecto, da 10 segundos para finalizar la conexion
    pool:{
        max: 5,
        min:0,
        acquire:30000,
        idle: 10000
    },
    operatorAliases: false
});

export default db