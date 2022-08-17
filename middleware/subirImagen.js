import multer from 'multer'
import path from 'path'
import { generarID } from '../helpers/tokens.js'


const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        
        // si se llama el cb es cuando pasa correctamente la imagen, los demas podemos verlo con console.log
        cb(null, './public/uploads/')
    },
    //este sera el npombre del archivo con el que se va guardar, para que no se repitan los nombres, para eso generaremos el nombre con el ID xd
    filename: function (req, file, cb) {
        cb(null, generarID() + path.extname(file.originalname)) //extname guarda la extension original de la imagen
        // cb(null, generarID() + path.extname(file.originalname)) //extname guarda la extension original de la imagen
    }
})

const upload = multer({ storage })


export default upload

