import { getSpotifyToken } from "@/lib/auth/spotifyToken";

export default async function handler(req, res) {
  try {
    const { query, type } = req.query;

    if (!['track', 'artist'].includes(type)) {
      return res.status(400).json({ error: 'Invalid type. Use "track" or "artist".' });
    }

    const token = await getSpotifyToken();

    const response = await fetch(`https://api.spotify.com/v1/search?q=${encodeURIComponent(query)}&type=${type}`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });

    if (!response.ok) {
      return res.status(response.status).json({ error: 'Error fetching data from Spotify' });
    }

    const data = await response.json();

    let parsed;
    if (type === 'track') {
      parsed = data.tracks.items.map(item => ({
        id: item.id,
        name: item.name,
        artist: item.artists[0].name,
        album: item.album.name,
        release_date: item.album.release_date,
        image: item.album.images[0].url,
        url: item.external_urls.spotify
      }));
    } else if (type === 'artist') {
      parsed = data.artists.items.map(item => ({
        id: item.id,
        name: item.name,
        genres: item.genres,
        followers: item.followers.total,
        image: item.images.length ? item.images[0].url : null,
        url: item.external_urls.spotify
      }));
    }

    res.status(200).json(parsed);
  } catch (error) {
    console.error('Error in /api/search:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
}
