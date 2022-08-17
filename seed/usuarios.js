import bcrypt from 'bcrypt'

const usuarios = [
    {
        nombre: 'Carlos Daniel',
        email: 'cd@mail.com',
        confirmado: 1,
        password: bcrypt.hashSync('password', 10)
    }
]


export default usuarios