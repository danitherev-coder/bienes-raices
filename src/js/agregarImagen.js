import { Dropzone } from 'dropzone'

const token = document.querySelector('meta[name="csrf-token"]').getAttribute('content')

Dropzone.options.imagen = {
    // todo lo que tenga dict - es para cambiar texto de ingles a español
    dictDefaultMessage: 'Sube tus imagenes aqui',
    //archivos que soporta para la subiuda de iamgenes
    acceptedFiles: '.png, .jpg, .jpeg',
    maxFilesize: 5, 
    maxFiles: 1, // puedo poner para subir mas archivos, poner 5
    paralleUploads: 1, // si pongo 5 imagenes aca debe ir tambien 5
    autoProcessQueue: false,
    addRemoveLinks: true,
    dictRemoveFile: 'Borrar archivo',
    dictMaxFilesExceeded: 'Solo puedes subir una imagen',
    // validar el token de csrf
    headers:{
        'CSRF-Token': token
    },
    paramName: 'imagen', // esto va a la ruta donde dice upload.single('imagen')
    init: function(){
        const dropzone = this
        const btnPublicar = document.querySelector('#publicar')

        btnPublicar.addEventListener('click', function() {
            dropzone.processQueue()
        })

        dropzone.on('queuecomplete', function(){
            if(dropzone.getActiveFiles().length === 0){
                window.location.href = '/mis-propiedades'
            }
        })
    }
}