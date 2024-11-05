let spotifyAccessToken = null;
let tokenExpirationTime = null;

const fetchSpotifyToken = async () => {
  const response = await fetch('https://accounts.spotify.com/api/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      Authorization: `Basic ${Buffer.from(`${process.env.SPOTIFY_CLIENT_ID}:${process.env.SPOTIFY_CLIENT_SECRET}`).toString('base64')}`
    },
    body: new URLSearchParams({ grant_type: 'client_credentials' })
  });

  const data = await response.json();
  spotifyAccessToken = data.access_token;
  tokenExpirationTime = Date.now() + data.expires_in * 1000; // Guardamos el tiempo de expiración en milisegundos
};

// Función para asegurarse de que el token esté siempre actualizado
const ensureSpotifyToken = async () => {
  // Si el token está cerca de expirar (por ejemplo, en menos de 1 minuto), lo renovamos
  if (!spotifyAccessToken || Date.now() > tokenExpirationTime - 60 * 1000) {
    await fetchSpotifyToken();
  }
};

export const getSpotifyToken = async () => {
  await ensureSpotifyToken();
  return spotifyAccessToken;
};
