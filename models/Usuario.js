import { DataTypes } from 'sequelize'
import bcrypt from 'bcrypt'
//Importar nuestra instancia de la conexion de la BASE DE DATOS
import db from '../config/db.js'

//define('') le pasamos el nombre de la tabla, sera usuarios
//Luego dentro de las llaves, le pamos los campos de la tabla
const Usuario = db.define('usuarios',{
    nombre: {
        type: DataTypes.STRING,
        allowNull: false // este campo no debe ir vacio, o sea el campo de nombre
    },
    email:{
        type: DataTypes.STRING,
        allowNull: false
    },
    password:{
        type: DataTypes.STRING,
        allowNull: false
    },
    token:{
        type: DataTypes.STRING
    },
    confirmado: {
        type: DataTypes.BOOLEAN
    }
}, {
    hooks: {
        beforeCreate: async function(usuario) {
            const salt = await bcrypt.genSalt(10)
            usuario.password = await bcrypt.hash(usuario.password, salt)
        }
    },
    scopes:{
        eliminarPassword: {
            attributes: {
                exclude:['password', 'token', 'confirmado', 'createdAt', 'updatedAt']
            }
        }
    }
});


//metodo personalizado para comparar password
Usuario.prototype.verificarPassword = function(password){
    return bcrypt.compareSync(password, this.password)
}

export default Usuario;