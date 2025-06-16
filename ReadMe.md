# Sistema de Gestión de Colaboradores con riesgo a COVID

Aplicación full-stack para gestionar colaboradores construida con:

- **Backend**: Node.js, Express y MySQL
- **Frontend**: React y Bootstrap

Incluye operaciones CRUD, paginación, autenticación JWT y estilos responsivos.

## Requisitos previos

- Node.js (v14 o superior) y npm
- MySQL instalado y en ejecución
- git (opcional, para clonar este repositorio)

## Estructura del repositorio


DATOSEMPLEADO.BE       # Código del backend (Express + MySQL)
datosempleado-fe       # Código del frontend (React + Bootstrap)


## Configuración y ejecución

### 1. Clonar el repositorio

bash
git clone <URL_DEL_REPO>
cd <NOMBRE_REPO>


### 2. Backend

1. Entra en la carpeta del backend:
   
   cd DATOSEMPLEADO.BE
   
2. Crea el archivo de variables de entorno a partir del ejemplo:
   bash
   cp .env.example .env
   
3. Abre .env y define:
   dotenv
   DB_HOST=localhost
   DB_USER=root
   DB_PASSWORD=tu_contraseña
   DB_NAME=TEST
   JWT_SECRET=una_claveSecreta
   
4. Instala dependencias y arranca en modo desarrollo:
   bash
   npm install
   npm run dev   # usa nodemon para recarga automática
   
5. El servidor escuchará en http://localhost:3000.

### 3. Frontend

1. Abre otra terminal y ve a la carpeta del frontend:
   bash
   cd ../datosempleado-fe
   
2. Instala dependencias:
   bash
   npm install
   
3. Ejecuta la aplicación:
   bash
   npm start
   
4. Se abrirá automáticamente http://localhost:3000 (o 3001).

## Uso de la aplicación

1. En la pantalla de login, introduce:
   - **Usuario**: admin
   - **Contraseña**: password123
2. Al iniciar sesión, podrás:
   - **Listar** colaboradores con paginación
   - **Crear**, **Editar** y **Eliminar** registros
   - Consultar el **nivel de riesgo** según la edad
   - Navegar entre páginas con controles “Anterior” / “Siguiente”

## Documentación de la API

Todas las rutas de colaboradores requieren JWT en el header:

Authorization: Bearer <token>


| Método | Ruta                   | Descripción                    |
|--------|------------------------|--------------------------------|
| POST   | /login               | Autentica y devuelve un token  |
| GET    | /colaboradores       | Lista con paginación           |
| POST   | /colaboradores       | Crea un colaborador            |
| PUT    | /colaboradores/:id   | Actualiza un colaborador       |
| DELETE | /colaboradores/:id   | Elimina un colaborador         |


