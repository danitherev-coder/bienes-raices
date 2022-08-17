import jwt from 'jsonwebtoken'


const generarJWT = (id) => {
    return jwt.sign({id}, process.env.JWT_PALABRASECRET, {
        expiresIn: '1d'
    })
}

const generarID = () => Math.random().toString(32).substring(2) + Date.now().toString(32);


export {
    generarID,
    generarJWT
}