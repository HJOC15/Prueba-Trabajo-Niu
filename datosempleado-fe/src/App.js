import React, { useState, useEffect } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css';

function App() {
  // ——————————————————————————————————
  // Estado de autenticación y datos
  // ——————————————————————————————————
  const [token, setToken] = useState(() => localStorage.getItem('token') || '');
  const [colaboradores, setColaboradores] = useState([]);
  const [form, setForm] = useState({
    nombre: '', apellido: '', direccion: '', edad: '', profesion: '', estado_civil: ''
  });
  const [editingId, setEditingId] = useState(null);
  const [page, setPage] = useState(1);
  const [limit] = useState(5);
  const [totalPages, setTotalPages] = useState(1);
  const [credentials, setCredentials] = useState({ username: '', password: '' });


  // ——————————————————————————————————
  // Cargar colaboradores con paginación y token
  // ——————————————————————————————————
  useEffect(() => {
    fetch(`http://localhost:3000/colaboradores?page=${page}&limit=${limit}`, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    })
      .then(res => {
        if (res.status === 401) throw new Error('No autorizado');
        return res.json();
      })
      .then(({ data, totalPages }) => {
        setColaboradores(data);
        setTotalPages(totalPages);
      })
      .catch(err => {
        console.error(err);
        if (err.message === 'No autorizado') {
          localStorage.removeItem('token');
          setToken('');
        }
      });
  }, [page, limit, token]);

  // ——————————————————————————————————
  // Manejadores de formulario y CRUD
  // ——————————————————————————————————
  const handleChange = e => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = e => {
    e.preventDefault();
    const url = editingId
      ? `http://localhost:3000/colaboradores/${editingId}`
      : 'http://localhost:3000/colaboradores';
    const method = editingId ? 'PUT' : 'POST';

    fetch(url, {
      method,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        nombre: form.nombre,
        apellido: form.apellido,
        direccion: form.direccion,
        edad: Number(form.edad),
        profesion: form.profesion,
        estado_civil: form.estado_civil
      }),
    })
      .then(res => {
        if (res.status === 401) throw new Error('No autorizado');
        return res.json();
      })
      .then(data => {
        if (editingId) {
          setColaboradores(colaboradores.map(c => c.id === editingId ? data : c));
        } else {
          setColaboradores([...colaboradores, data]);
        }
        setForm({ nombre: '', apellido: '', direccion: '', edad: '', profesion: '', estado_civil: '' });
        setEditingId(null);
      })
      .catch(err => {
        console.error(err);
        if (err.message === 'No autorizado') {
          localStorage.removeItem('token');
          setToken('');
        }
      });
  };

  const handleEdit = colaborador => {
    setEditingId(colaborador.id);
    setForm({
      nombre: colaborador.nombre,
      apellido: colaborador.apellido,
      direccion: colaborador.direccion,
      edad: colaborador.edad.toString(),
      profesion: colaborador.profesion,
      estado_civil: colaborador.estado_civil
    });
  };

  const handleDelete = id => {
    fetch(`http://localhost:3000/colaboradores/${id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })
      .then(res => {
        if (res.status === 401) throw new Error('No autorizado');
        setColaboradores(colaboradores.filter(c => c.id !== id));
      })
      .catch(err => {
        console.error(err);
        if (err.message === 'No autorizado') {
          localStorage.removeItem('token');
          setToken('');
        }
      });
  };

  // ——————————————————————————————————
  // Si no hay token, mostramos mensaje (puedes reemplazarlo por un formulario de login)
  // ——————————————————————————————————
  if (!token) {
    if (!token) {
  return (
    <div className="container my-4" style={{ maxWidth: '400px' }}>
      <div className="card p-4">
        <h2 className="mb-3">Iniciar Sesión</h2>
        <form onSubmit={async e => {
          e.preventDefault();
          try {
            const res = await fetch('http://localhost:3000/login', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(credentials)
            });
            if (!res.ok) throw new Error('Credenciales incorrectas');
            const { token: t } = await res.json();
            localStorage.setItem('token', t);
            setToken(t);
          } catch (err) {
            alert(err.message);
          }
        }}>
          <div className="mb-3">
            <label className="form-label">Usuario</label>
            <input
              type="text"
              className="form-control"
              value={credentials.username}
              onChange={e => setCredentials({ ...credentials, username: e.target.value })}
              required
            />
          </div>
          <div className="mb-3">
            <label className="form-label">Contraseña</label>
            <input
              type="password"
              className="form-control"
              value={credentials.password}
              onChange={e => setCredentials({ ...credentials, password: e.target.value })}
              required
            />
          </div>
          <button type="submit" className="btn btn-primary w-100">Entrar</button>
        </form>
      </div>
    </div>
  );
}

  }

  // ——————————————————————————————————
  // Renderizado de la UI principal
  // ——————————————————————————————————
  return (
    <div className="container my-4">
      <h1>Colaboradores</h1>
      <button
        className="btn btn-secondary mb-3"
        onClick={() => {
          localStorage.removeItem('token');
          setToken('');
        }}
      >
        Cerrar sesión
      </button>

      <div className="d-flex align-items-center mb-3">
        <button
          className="btn btn-outline-primary me-2"
          onClick={() => setPage(p => Math.max(1, p - 1))}
          disabled={page <= 1}
        >
          « Anterior
        </button>
        <span>Página {page} de {totalPages}</span>
        <button
          className="btn btn-outline-primary ms-2"
          onClick={() => setPage(p => Math.min(totalPages, p + 1))}
          disabled={page >= totalPages}
        >
          Siguiente »
        </button>
      </div>

      <table className="table table-striped table-hover">
        <thead className="table-primary">
          <tr>
            <th>ID</th><th>Nombre</th><th>Apellido</th><th>Edad</th><th>Profesión</th><th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {colaboradores.map(c => (
            <tr key={c.id}>
              <td>{c.id}</td>
              <td>{c.nombre}</td>
              <td>{c.apellido}</td>
              <td>{c.edad}</td>
              <td>{c.profesion}</td>
              <td>
                <button
                  className="btn btn-sm btn-info me-1"
                  onClick={() => {
                    let msg = '';
                    if (c.edad < 18) msg = 'Fuera de peligro';
                    else if (c.edad < 60) msg = 'Tenga cuidado';
                    else msg = 'Quédese en casa';
                    alert(`${c.nombre} ${c.apellido}: ${msg}`);
                  }}
                >
                  Riesgo
                </button>
                <button
                  className="btn btn-sm btn-warning me-1"
                  onClick={() => handleEdit(c)}
                >
                  Editar
                </button>
                <button
                  className="btn btn-sm btn-danger"
                  onClick={() => handleDelete(c.id)}
                >
                  Eliminar
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <h2>{editingId ? 'Editar Colaborador' : 'Agregar Colaborador'}</h2>
      <div className="card p-3 mb-4">
        <form onSubmit={handleSubmit}>
          {['nombre','apellido','direccion','edad','profesion','estado_civil'].map(field => (
            <div className="mb-3 row" key={field}>
              <label className="col-sm-3 col-form-label">
                {field.charAt(0).toUpperCase() + field.slice(1)}:
              </label>
              <div className="col-sm-9">
                <input
                  type={field === 'edad' ? 'number' : 'text'}
                  className="form-control"
                  name={field}
                  value={form[field]}
                  onChange={handleChange}
                  required={['nombre','apellido','edad'].includes(field)}
                />
              </div>
            </div>
          ))}
          <button type="submit" className="btn btn-primary">
            {editingId ? 'Guardar cambios' : 'Crear'}
          </button>
        </form>
      </div>
    </div>
  );
}

export default App;
