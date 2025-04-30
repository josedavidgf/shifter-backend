const fetch = require('node-fetch');

const BASE_URL = 'http://localhost:4000';

const paths = [
  '/api/shifts',
  '/api/swaps',
  '/api/swap-preferences',
  '/api/hospitals',
  '/api/specialities',
  '/api/workerTypes',
];

async function checkEndpoint(path) {
  try {
    const res = await fetch(`${BASE_URL}${path}`);
    const contentType = res.headers.get('content-type');

    if (!res.ok) {
      console.error(`❌ Error en ${path}: HTTP ${res.status}`);
      return false;
    }

    if (!contentType || !contentType.includes('application/json')) {
      const text = await res.text();
      console.error(`⚠️ ${path} devolvió contenido no JSON:`, text.slice(0, 100));
      return false;
    }

    const json = await res.json();
    console.log(`✅ ${path} OK`, JSON.stringify(json).slice(0, 100));
    return true;
  } catch (err) {
    console.error(`🔥 Fallo al conectar con ${path}:`, err.message);
    return false;
  }
}

(async () => {
  console.log('🧪 Verificando API...');

  const results = await Promise.all(paths.map(checkEndpoint));

  if (results.every(Boolean)) {
    console.log('🎯 API OK ✅');
    process.exit(0);
  } else {
    console.error('❌ Hay endpoints que fallan');
    process.exit(1);
  }
})();
