// utils/workerTypeTranslations.js

const WORKER_TYPE_TRANSLATIONS = {
  'doctor': 'médicos',
  'nurse': 'enfermeros/as',
  'porter': 'celadores/as',
  'assistant': 'auxiliares',
  // Añade más si aparecen nuevos tipos
};

function getWorkerTypePlural(workerTypeName) {
  return WORKER_TYPE_TRANSLATIONS[workerTypeName] || workerTypeName.toLowerCase();
}

module.exports = {
  getWorkerTypePlural,
};
