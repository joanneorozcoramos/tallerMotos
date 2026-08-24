const express = require('express');
const cors = require('cors');
const errorHandler = require('./middlewares/errorHandler');


const clienteRoutes = require('./routes/clienteRoutes');
const motoRoutes = require('./routes/motoRoutes');
const ordenTrabajoRoutes = require('./routes/ordenTrabajoRoutes');
const authRoutes = require('./routes/authRoutes');
const historialRoutes = require('./routes/historialRoutes');

const app = express();


app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));


app.use('/api', authRoutes);

app.use('/api', clienteRoutes);
app.use('/api', motoRoutes);
app.use('/api', ordenTrabajoRoutes);
app.use('/api', historialRoutes);

app.get('/check', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});


app.use(errorHandler);

module.exports = app;