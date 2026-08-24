const errorHandler = (err, req, res, next) => {
  console.error('Error:', err);

  if (err.name === 'SequelizeValidationError') {
    const messages = err.errors.map(e => e.message);
    return res.status(400).json({
      error: 'Error de validación',
      details: messages
    });
  }

  if (err.name === 'SequelizeUniqueConstraintError') {
    const messages = err.errors.map(e => e.message);
    return res.status(409).json({
      error: 'Conflicto de datos',
      details: messages
    });
  }

  if (err.statusCode) {
    return res.status(err.statusCode).json({
      error: err.message
    });
  }

  res.status(500).json({
    error: 'Error interno del servidor',
    message: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
};

module.exports = errorHandler;