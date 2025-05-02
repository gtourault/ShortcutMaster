import jwt from 'jsonwebtoken';


export const verifyToken = (req, res, next) => {
    const SECRET_KEY = 'ton_secret_super_secret'; // à remplacer par process.env.SECRET_KEY en prod

    const token = req.headers.authorization?.split(' ')[1]; // format: Bearer token

    if (!token) {
        return res.status(401).json({ message: 'Accès refusé, token manquant' });
    }

    try {
        const decoded = jwt.verify(token, SECRET_KEY);
        req.user = decoded; // on ajoute les infos utilisateur à la requête
        next(); // on continue
    } catch (err) {
        return res.status(403).json({ message: 'Token invalide' });
    }
};
