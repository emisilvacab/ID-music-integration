import { getSpotifyToken } from "@/lib/auth/spotifyToken";
import { unifyArtistData } from "@/lib/normalization";
import { findBestYouTubeChannelMatch } from "@/lib/mapper";

async function getSpotifyArtist(id) {
  try {
    const token = await getSpotifyToken();
    const spotifyResponse = await fetch(`https://api.spotify.com/v1/artists/${id}`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });

    if (!spotifyResponse.ok) {
      throw new Error(`Spotify API error: ${spotifyResponse.status} - ${spotifyResponse.statusText}`);
    }

    return await spotifyResponse.json();
  } catch (error) {
    console.error('Error fetching Spotify artist:', error);
    throw new Error('Failed to fetch artist from Spotify');
  }
}

const fetchTopTracks = async (artistId, country = 'US') => {
  const token = await getSpotifyToken();

  const response = await fetch(`https://api.spotify.com/v1/artists/${artistId}/top-tracks?market=${country}`, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });

  if (!response.ok) {
    throw new Error('Failed to fetch top tracks');
  }

  const data = await response.json();
  return data.tracks;
};


async function getLastfmArtist(artistName) {
  try {
    const lastfmResponse = await fetch(`https://ws.audioscrobbler.com/2.0/?method=artist.getInfo&artist=${encodeURIComponent(artistName)}&api_key=${process.env.LASTFM_API_KEY}&format=json`);

    if (!lastfmResponse.ok) {
      throw new Error(`Last.fm API error: ${lastfmResponse.status} - ${lastfmResponse.statusText}`);
    }

    return await lastfmResponse.json();
  } catch (error) {
    console.error('Error fetching Last.fm artist:', error);
    throw new Error('Failed to fetch artist from Last.fm');
  }
}

async function getYoutubeArtist(artistName) {
  try {
    const youtubeSearchResponse = await fetch(`https://www.googleapis.com/youtube/v3/search?part=snippet&q=${encodeURIComponent(artistName)}&type=channel&key=${process.env.YOUTUBE_API_KEY}`);

    if (!youtubeSearchResponse.ok) {
      throw new Error(`YouTube Search API error: ${youtubeSearchResponse.status} - ${youtubeSearchResponse.statusText}`);
    }

    const youtubeSearchData = await youtubeSearchResponse.json();
    const channels = youtubeSearchData.items.filter(item => item.id.kind === 'youtube#channel');

    if (!channels.length) {
      throw new Error('No YouTube channels found for artist');
    }

    const youtubeChannel = findBestYouTubeChannelMatch(artistName, channels); // Búsqueda general del artista


    if (!youtubeChannel) {
      throw new Error('Best matching YouTube channel not found');
    }

    const youtubeResponse = await fetch(`https://www.googleapis.com/youtube/v3/channels?part=snippet,contentDetails,statistics&id=${youtubeChannel.id.channelId}&key=${process.env.YOUTUBE_API_KEY}`);

    if (!youtubeResponse.ok) {
      throw new Error(`YouTube API error: ${youtubeResponse.status} - ${youtubeResponse.statusText}`);
    }

    return await youtubeResponse.json();
  } catch (error) {
    console.error('Error fetching YouTube artist:', error);
    throw new Error('Failed to fetch artist data from YouTube');
  }
}

export default async function handler(req, res) {
  try {
    const { id } = req.query;

    if (!id) {
      return res.status(400).json({ error: 'Missing artist ID' });
    }

    const spotifyData = await getSpotifyArtist(id);
    const topTracksData = await fetchTopTracks(id);

    const artistName = spotifyData.name;
    if (!artistName) {
      throw new Error('Invalid Spotify data: missing artist name');
    }

    const lastfmData = await getLastfmArtist(artistName);
    const youtubeData = await getYoutubeArtist(artistName);

    const rawData = {
      spotifyData,
      lastfmData,
      youtubeData,
      topTracksData
    };

    // // Normalizar y unificar los datos del artista en un esquema común
    const unifiedArtist = unifyArtistData(rawData);

    res.status(200).json(unifiedArtist);
  } catch (error) {
    console.error('Error in /api/artist:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
}
