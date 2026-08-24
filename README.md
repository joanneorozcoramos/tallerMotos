# 🏍️ Taller Motos - Sistema de Gestión

Sistema para gestión de órdenes de trabajo en un taller de motos.
Incluye autenticación JWT, roles (ADMIN/MECANICO) e historial de cambios.

---

## 🛠️ Tecnologías

**Backend:** Node.js, Express, Sequelize, MySQL, JWT, Bcrypt  
**Frontend:** React, React Router, Axios

---

## 📋 Requisitos

- Node.js (v16 o superior)
- MySQL (v8 o superior)
- npm

---
##
## 🚀 Cómo levantar el proyecto

### 1. Instalar dependencias

**Backend:**

cd taller-motos-backend
npm install


## Crear la Base de datos
CREATE DATABASE taller_motos;

## Crear archivo .env en el backend
PORT=5000
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=tu_contraseña
DB_NAME=taller_motos
DB_PORT=3306

# JWT (para autenticación)
JWT_SECRET=tu_clave_secreta_muy_segura
JWT_EXPIRES_IN=1h

## Crear tablas y datos de prueba
bash
cd taller-motos-backend

- Crear tablas
npx sequelize-cli db:migrate

- Insertar datos de ejemplo (incluye usuarios ADMIN/MECANICO)
npx sequelize-cli db:seed:all

## Ejecutar proyecto

bash
cd taller-motos-backend
npm run dev

cd taller-motos-frontend
npm start


## credenciales de prueba
Usuario         Email                       Contraseña      Rol
Administrador   admin@tallermotos.com       Admin123!       ADMIN
Mecánico        mecanico@tallermotos.com    Mecanico123!    MECANICO

