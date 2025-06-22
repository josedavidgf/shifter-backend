// scripts/createContentCard.js
require('dotenv').config();
const path = require('path');
const supabase = require('../src/config/supabaseAdmin');
const fs = require('fs');

async function main() {
  const filePath = process.argv[2];
  if (!filePath) {
    console.error('❌ Debes indicar el path a la plantilla. Ej: node createContentCard.js templates/promoCard.js');
    process.exit(1);
  }

  const fullPath = path.resolve(filePath);
  if (!fs.existsSync(fullPath)) {
    console.error('❌ Archivo no encontrado:', fullPath);
    process.exit(1);
  }

  const cards = require(fullPath);
  const cardsArray = Array.isArray(cards) ? cards : [cards];

  const { error } = await supabase.from('content_cards').insert(cardsArray);

  if (error) {
    console.error('❌ Error al crear las tarjetas:', error.message);
    process.exit(1);
  }

  console.log(`✅ ${cardsArray.length} tarjeta(s) creadas correctamente.`);
}

main();
