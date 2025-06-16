require('dotenv').config();


const express = require('express');
const mysql   = require('mysql2');
const cors = require('cors');


const app = express();
app.use(cors());
app.use(express.json());

const db = mysql.createPool({
  host:     process.env.DB_HOST,
  user:     process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME
});

// Usuario de ejemplo (en un proyecto real vendría de la base)
const demoUser = {
  id: 1,
  username: 'admin',
  // contraseña: "password123" hasheada con bcrypt
  passwordHash: '$2b$10$8WoPF8gsgpZp7i2cCci/J.h1YJ.U26I/04c5vSKUYzooG5UUciBje'
};

const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

// Ruta de login
app.post('/login', (req, res) => {
  const { username, password } = req.body;
  if (username !== demoUser.username) {
    return res.status(401).json({ error: 'Usuario o contraseña incorrectos' });
  }
  if (!bcrypt.compareSync(password, demoUser.passwordHash)) {
    return res.status(401).json({ error: 'Usuario o contraseña incorrectos' });
  }
  // Generar token
  const token = jwt.sign(
    { sub: demoUser.id, username: demoUser.username },
    process.env.JWT_SECRET,
    { expiresIn: '1h' }
  );
  res.json({ token });
});

function authenticate(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Token faltante o mal formado' });
  }
  const token = authHeader.split(' ')[1];
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    req.user = payload;
    next();
  } catch {
    return res.status(401).json({ error: 'Token inválido o expirado' });
  }
}


app.get('/colaboradores', authenticate, (req, res) => {
  // 1. Leer page y limit de la query, con valores por defecto
  const page  = parseInt(req.query.page)  || 1;
  const limit = parseInt(req.query.limit) || 5;
  const offset = (page - 1) * limit;

  // 2. Primero contamos el total de registros
  db.query('SELECT COUNT(*) AS total FROM Colaborador', (err, countRes) => {
    if (err) return res.status(500).json({ error: 'Error contando registros' });
    const total = countRes[0].total;

    // 3. Luego traemos sólo la página actual
    db.query(
      'SELECT * FROM Colaborador LIMIT ? OFFSET ?',
      [limit, offset],
      (err, rows) => {
        if (err) return res.status(500).json({ error: 'Error al leer la DB' });
        // 4. Devolvemos datos y metadatos de paginación
        res.json({
          data: rows,
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit)
        });
      }
    );
  });
});


// Crear un colaborador nuevo
app.post('/colaboradores', authenticate, (req, res) => {
  const { nombre, apellido, direccion, edad, profesion, estado_civil } = req.body;

  // Validación básica: todos los campos obligatorios deben llegar
  if (!nombre || !apellido || !edad) {
    return res
      .status(400)
      .json({ error: 'Debe enviar al menos nombre, apellido y edad' });
  }

  const sql = `
    INSERT INTO Colaborador
      (nombre, apellido, direccion, edad, profesion, estado_civil)
    VALUES (?, ?, ?, ?, ?, ?)
  `;
  const params = [nombre, apellido, direccion, edad, profesion, estado_civil];

  db.query(sql, params, (err, result) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: 'Error al insertar en la base de datos' });
    }
    // Devuelve el ID del registro creado
    res.status(201).json({ id: result.insertId, ...req.body });
  });
});

// Actualizar datos de un colaborador por ID
app.put('/colaboradores/:id', authenticate, (req, res) => {
  const { id } = req.params;
  const { nombre, apellido, direccion, edad, profesion, estado_civil } = req.body;

  if (!nombre || !apellido || !edad) {
    return res
      .status(400)
      .json({ error: 'Debe enviar al menos nombre, apellido y edad' });
  }

  const sql = `
    UPDATE Colaborador
    SET nombre = ?, apellido = ?, direccion = ?, edad = ?, profesion = ?, estado_civil = ?
    WHERE id = ?
  `;
  const params = [nombre, apellido, direccion, edad, profesion, estado_civil, id];

  db.query(sql, params, (err, result) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: 'Error al actualizar en la base de datos' });
    }
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Colaborador no encontrado' });
    }
    res.json({ id: Number(id), ...req.body });
  });
});

// Eliminar un colaborador por ID
app.delete('/colaboradores/:id', authenticate, (req, res) => {
  const { id } = req.params;

  db.query('DELETE FROM Colaborador WHERE id = ?', [id], (err, result) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: 'Error al eliminar en la base de datos' });
    }
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Colaborador no encontrado' });
    }
    res.status(204).send();
  });
});


// Ponemos al servidor a escuchar en el puerto 3000
const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Servidor escuchando en http://localhost:${PORT}`);
});
