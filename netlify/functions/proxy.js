import fetch from 'node-fetch';

export async function handler(event, context) {
  const baseUrl = 'https://script.google.com/macros/s/AKfycbxPCh3ANaZAl_kc2StbF19scMAyKDzQZv2n746FvVGHTJk3urIltB3qn59HNEUY4_ZQ/exec';
  const url = `${baseUrl}${event.rawQuery ? '?' + event.rawQuery : ''}`;

  try {
    const response = await fetch(url, {
      method: event.httpMethod,
      headers: { 'Content-Type': 'application/json' },
      body: event.body || undefined,
    });

    const data = await response.text();

    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Content-Type': 'application/json',
      },
      body: data,
    };
  } catch (error) {
    console.error('Proxy Error:', error);
    return {
      statusCode: 500,
      headers: { 'Access-Control-Allow-Origin': '*' },
      body: JSON.stringify({ error: error.message }),
    };
  }
}
