const fs = require('fs');
const path = './users.json'; // Aquí se especifica la ruta del archivo donde se guardan los usuarios
if (!fs.existsSync(path)) {
    fs.writeFileSync(path, JSON.stringify([])); // Crea el archivo si no existe
}
let usersDB1 = JSON.parse(fs.readFileSync(path)); // Leer datos del archivo

const express = require('express');
const app = express();

app.use(express.json());

let users = [];

// Ruta pública para verificar que la API funciona
app.get('/', (req, res) => {
    res.send('API funcionando correctamente');
});

// Verifica si ya existe un archivo de usuarios
let usersDB = [];
if (fs.existsSync(path)) {
    usersDB = JSON.parse(fs.readFileSync(path));
}

// Obtener lista de usuarios
app.get('/users', (req, res) => {
    res.json(usersDB);
});

// Agregar un usuario
app.post('/users', (req, res) => {
    const { username, password } = req.body;

    // Verificar si el usuario ya existe
    const userExists = usersDB.some(u => u.username === username);
    if (userExists) {
        return res.status(400).json({ message: 'El usuario ya existe' });
    }

    // Agregar el usuario al arreglo
    usersDB.push({ username, password });

    // Guardar el arreglo actualizado en el archivo
    fs.writeFileSync(path, JSON.stringify(usersDB));

    res.status(201).json({ message: 'Usuario agregado exitosamente' });
});

// Autenticación básica
app.post('/login', (req, res) => {
    const { username, password } = req.body;

    // Buscar el usuario
    const user = usersDB.find(u => u.username === username && u.password === password);
    if (!user) return res.status(401).json({ message: 'Credenciales incorrectas' });

    res.json({ message: 'Autenticación exitosa' });
});

// Iniciar servidor
const port = 3000;
app.listen(port, () => {
    console.log(`Servidor corriendo en http://localhost:${port}`);
});

// Middleware para proteger rutas
const authMiddleware = (req, res, next) => {
    const { username, password } = req.body; // Usamos req.body en lugar de req.headers
    const user = usersDB.find(u => u.username === username && u.password === password);
    if (!user) return res.status(403).json({ message: 'Acceso denegado' });

    next();
};

// Ruta protegida
app.get('/secure-data', authMiddleware, (req, res) => {
    res.json({ message: 'Accediste a datos protegidos' });
});

// Configurar el puerto dinámicamente para Render
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`API corriendo en el puerto ${PORT}`);
});

