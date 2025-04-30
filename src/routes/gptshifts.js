// routes/gptshifts.js
const express = require('express');
const router = express.Router();
const { OpenAI } = require('openai');

// Inicializar OpenAI
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Endpoint POST /api/gpt-shifts
router.post('/', async (req, res) => {
  const { message, history = [], calendarData } = req.body;

  const fullPrompt = [
    {
      role: 'system',
      content: `
Eres un asistente experto en optimización de turnos laborales para trabajadores con horarios rotativos.
Tu objetivo es ayudar a:

- Detectar cómo conseguir más días libres consecutivos.
- Contar turnos de mañana, tarde y noche.
- Asesorar sobre cómo reorganizar turnos en caso de vacaciones.
- Proponer cambios que mejoren el descanso del trabajador.
- Siempre responder de forma breve, clara y en español.

El formato de los turnos será similar a: "01 mayo: mañana", "02 mayo: libre", "03 mayo: noche", etc.
      `,
    },
    ...history,
    {
      role: 'user',
      content: `Estos son mis turnos: ${calendarData}.
Mi pregunta: ${message}`,
    },
  ];

  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: fullPrompt,
    });

    res.json({ reply: response.choices[0].message.content });
  } catch (error) {
    // Mostrar el error completo que devuelve OpenAI
    console.error('❌ Error al contactar con OpenAI:', error.response?.data || error.message || error);
    res.status(500).json({ error: 'Error al procesar la solicitud con GPT' });
  }
});

module.exports = router;