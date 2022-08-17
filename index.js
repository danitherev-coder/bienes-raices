// const express = require('express') // CommomJS -> esta es la forma antigua de importar en node
import express from 'express' //ASI ES LO DE JAVASCRIPT CON EL ACMASCRIPT6 O ESC6, PERO A ESTO LO DEBEMOS DECLARARLO EN NUESTRO PACKAGE.JSON, lo pondre en la primera parte para notarlo mas rapido.
import csrf from 'csurf'
import cookieParser from 'cookie-parser'
import usuarioRoutes from './routes/userRoutes.js'
import propiedadesRoutes from './routes/propiedadesRoutes.js'
import db from './config/db.js'

// Creando la App
const app = express()

//Habilitar lectura de datos por formulario EXPRESS
app.use(express.urlencoded({ extended: true }));
//habilitar cookie-parser
app.use(cookieParser())
//habilitar el CSRF
app.use(csrf({ cookie: true }))

//Conexion a la base de datos
try {
    await db.authenticate();
    //sincronizar con la base de datos y crear las tablas y registros
    db.sync()
    console.log('Conexion correcta a la base de datos');
} catch (error) {
    console.log(error);
}

// HABILITAR PUG - TEMPLATE ENGINE - MOTOR DE PLANTILLA
//set se utiliza para configuraciones
app.set('view engine', 'pug')
app.set('views', './views')
// archivos estaticos
app.use(express.static('public'))


// Routing
// app.get('/auth', usuarioRoutes) //Este GET sirve para que BUSQUE UNA SOLA VEZ Y ESPECIFICAMENTE LA RUTA / 
app.use('/auth', usuarioRoutes) // este USE busca TODAS LAS RUTAS QUE EMPIEZEN POR / asi que si nosotros ponemos en el navegador /nosotros, lo encuentra, pero si usamos solo GET no, porque solo definimos el / y solo eso busca.
app.use('/', propiedadesRoutes)


//Definir un puerto y arrancar el proyecto
const port = 3000;

app.listen(port, () => {
    console.log(`El servidor esta funcionando en el puerto: ${port}`);
})
