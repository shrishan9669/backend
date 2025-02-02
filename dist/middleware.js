"use strict";
const jwt = require('jsonwebtoken');
function Authentication(req, res, next) {
    const authheader = req.headers['authorization'];
    const token = authheader && authheader.split(' ')[1];
    if (!token) {
        return res.send({ msg: "Access denied : No token provided" });
    }
    jwt.verify(token, SECRET_KEY, (err, user) => {
        if (err) {
            return res.send({ msg: "Invalid token" });
        }
        next();
    });
}
module.exports = Authentication;
