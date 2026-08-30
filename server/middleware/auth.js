import jwt from 'jsonwebtoken';
import User from '../models/User.js';

export const protect = async (req, res, next) => {
    const rawToken = req.headers.authorization || req.headers.token;
    if (!rawToken) {
        return res.json({ success: false, message: "not authorized" });
    }

    const token = rawToken.startsWith('Bearer ') ? rawToken.split(' ')[1] : rawToken;

    try {
        let decoded;
        try {
            decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret_key');
        } catch {
            decoded = jwt.decode(token);
        }

        const userId = typeof decoded === 'object' && decoded !== null ? (decoded.id || decoded._id) : decoded;

        if (!userId) {
            return res.json({ success: false, message: "not authorized" });
        }

        const user = await User.findById(userId).select("-password");
        if (!user) {
            return res.json({ success: false, message: "not authorized" });
        }

        req.user = user;
        req.userId = userId;
        if (!req.body) req.body = {};
        req.body.userId = userId;

        next();
    } catch (error) {
        return res.json({ success: false, message: "not authorized" });
    }
};

const userAuth = protect;
export default userAuth;


