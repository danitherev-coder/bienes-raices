import Propiedad from "./Propiedades.js";
import Categoria from './Categoria.js'
import Precio from './Precio.js';
import Usuario from './Usuario.js'
import Mensaje from "./mensaje.js";

// Precio.hasOne(Propiedad) // esto es relacion 1:1 , esto creo que se lee de derecha a izqueirda, esta propiedad tiene un precio

//otra forma, pero esto se lee de izqueirda a derecha
// Propiedad.belongsTo(Precio) // a esto le podemos pasar una foreign key personalizada, ya que el anterior con el hasOne nos creo la foreign key con el nombre precioid

//agregando mas relaciones a la tabla Propiedad
Propiedad.belongsTo(Precio, { foreignKey: 'precioID' })
Propiedad.belongsTo(Categoria, { foreignKey: 'categoriaID' })
Propiedad.belongsTo(Usuario, { foreignKey: 'usuarioID' })
Propiedad.hasMany(Mensaje, {foreignKey: 'propiedadID'})

Mensaje.belongsTo(Propiedad, { foreignKey: 'propiedadID' })
Mensaje.belongsTo(Usuario, { foreignKey: 'usuarioID' })

export {
    Propiedad,
    Precio,
    Categoria,
    Usuario,
    Mensaje
}

