
import { GoogleGenAI, Type } from "@google/genai";
import { Product, Transaction, ExchangeRates } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const getBusinessInsights = async (
  products: Product[],
  transactions: Transaction[],
  rates: ExchangeRates
) => {
  try {
    const prompt = `
      Como analista de negocios para una tienda minorista en Venezuela, analiza estos datos:
      Tasa de Cambio (VES/USD): ${rates.ves}
      Cantidad de Productos: ${products.length}
      Transacciones Recientes (últimas 10): ${JSON.stringify(transactions.slice(-10))}
      
      Proporciona un breve análisis diario centrado en:
      1. Tendencias de ventas.
      2. Alertas de inventario (stock bajo).
      3. Consejos sobre el riesgo cambiario dada la tasa actual del BCV.
      
      Responde en un párrafo corto y exclusivamente en ESPAÑOL.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        temperature: 0.7,
      },
    });

    return response.text || "No hay análisis disponibles en este momento.";
  } catch (error) {
    console.error("Gemini Error:", error);
    return "No se pudieron generar los análisis. Verifica tu conexión.";
  }
};
