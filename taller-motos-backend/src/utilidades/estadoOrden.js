const ESTADO = {
  RECIBIDA: 'RECIBIDA',
  DIAGNOSTICO: 'DIAGNOSTICO',
  EN_PROCESO: 'EN_PROCESO',
  LISTA: 'LISTA',
  ENTREGADA: 'ENTREGADA',
  CANCELADA: 'CANCELADA'
};


const ESTADOS_VALIDOS = {
  [ESTADO.RECIBIDA]: [ESTADO.DIAGNOSTICO, ESTADO.CANCELADA],
  [ESTADO.DIAGNOSTICO]: [ESTADO.EN_PROCESO, ESTADO.CANCELADA],
  [ESTADO.EN_PROCESO]: [ESTADO.LISTA, ESTADO.CANCELADA],
  [ESTADO.LISTA]: [ESTADO.ENTREGADA, ESTADO.CANCELADA],
  [ESTADO.ENTREGADA]: [], 
  [ESTADO.CANCELADA]: [] 
};


const ESTADOS_FINALES = [ESTADO.ENTREGADA, ESTADO.CANCELADA];


const ESTADOS_CANCELABLES = [ESTADO.RECIBIDA, ESTADO.DIAGNOSTICO, ESTADO.EN_PROCESO, ESTADO.LISTA];


const TODOS_LOS_ESTADOS = [
  ESTADO.RECIBIDA,
  ESTADO.DIAGNOSTICO,
  ESTADO.EN_PROCESO,
  ESTADO.LISTA,
  ESTADO.ENTREGADA,
  ESTADO.CANCELADA
];


const esEstadoFinal = (estado) => {
  return ESTADOS_FINALES.includes(estado);
};


const esValido = (currentStatus, newStatus) => {

  if (esEstadoFinal(currentStatus)) {
    return false;
  }
  

  if (newStatus === ESTADO.CANCELADA) {
    return ESTADOS_CANCELABLES.includes(currentStatus);
  }
  

  return ESTADOS_VALIDOS[currentStatus]?.includes(newStatus) || false;
};


const esAdminValido = (currentStatus, newStatus) => {

  if (currentStatus === newStatus) {
    return false;
  }
  

  return TODOS_LOS_ESTADOS.includes(newStatus);
};


const esCambioForzado = (currentStatus) => {
  return esEstadoFinal(currentStatus);
};

module.exports = {
  ESTADO,
  ESTADOS_VALIDOS,
  ESTADOS_FINALES,
  ESTADOS_CANCELABLES,
  TODOS_LOS_ESTADOS,
  esEstadoFinal,
  esValido,
  esAdminValido,
  esCambioForzado
};