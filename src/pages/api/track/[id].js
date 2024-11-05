import { getSpotifyToken } from "@/lib/auth/spotifyToken";
import { unifyTrackData } from "@/lib/normalization";
import { findBestYouTubeVideoMatch } from "@/lib/mapper";

async function getSpotifyTrack(id) {
  try {
    const token = await getSpotifyToken();
    const spotifyResponse = await fetch(`https://api.spotify.com/v1/tracks/${id}`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });

    if (!spotifyResponse.ok) {
      throw new Error(`Spotify API error: ${spotifyResponse.status} - ${spotifyResponse.statusText}`);
    }

    return await spotifyResponse.json();
  } catch (error) {
    console.error('Error fetching Spotify track:', error);
    throw new Error('Failed to fetch track from Spotify');
  }
}

async function getLastfmTrack(artistName, trackName) {
  try {
    const lastfmResponse = await fetch(`https://ws.audioscrobbler.com/2.0/?method=track.getInfo&api_key=${process.env.LASTFM_API_KEY}&artist=${encodeURIComponent(artistName)}&track=${encodeURIComponent(trackName)}&format=json`);

    if (!lastfmResponse.ok) {
      throw new Error(`Last.fm API error: ${lastfmResponse.status} - ${lastfmResponse.statusText}`);
    }

    return await lastfmResponse.json();
  } catch (error) {
    console.error('Error fetching Last.fm track:', error);
    throw new Error('Failed to fetch track from Last.fm');
  }
}

async function getYoutubeVideo(artistName, trackName) {
  try {
    const youtubeSearchResponse = await fetch(`https://www.googleapis.com/youtube/v3/search?part=snippet&q=${encodeURIComponent(artistName + " " + trackName)}&type=video&key=${process.env.YOUTUBE_API_KEY}`);

    if (!youtubeSearchResponse.ok) {
      throw new Error(`YouTube Search API error: ${youtubeSearchResponse.status} - ${youtubeSearchResponse.statusText}`);
    }

    const youtubeSearchData = await youtubeSearchResponse.json();
    const videos = youtubeSearchData.items.filter(item => item.id.kind === 'youtube#video');

    if (!videos.length) {
      throw new Error('No YouTube videos found');
    }

    const youtubeVideo = findBestYouTubeVideoMatch(trackName, artistName, videos);
    if (!youtubeVideo) {
      throw new Error('Best matching YouTube video not found');
    }

    const youtubeResponse = await fetch(`https://www.googleapis.com/youtube/v3/videos?part=snippet,contentDetails,statistics&id=${youtubeVideo.id.videoId}&key=${process.env.YOUTUBE_API_KEY}`);

    if (!youtubeResponse.ok) {
      throw new Error(`YouTube Video API error: ${youtubeResponse.status} - ${youtubeResponse.statusText}`);
    }

    return await youtubeResponse.json();
  } catch (error) {
    console.error('Error fetching YouTube track:', error);
    throw new Error('Failed to fetch track from YouTube');
  }
}

export default async function handler(req, res) {
  try {
    const { id } = req.query;

    if (!id) {
      return res.status(400).json({ error: 'Missing track ID' });
    }

    const spotifyData = await getSpotifyTrack(id);
    const artistName = spotifyData.artists[0]?.name;
    const trackName = spotifyData.name;

    if (!artistName || !trackName) {
      throw new Error('Invalid Spotify data: missing artist name or track name');
    }

    const lastfmData = await getLastfmTrack(artistName, trackName);
    const youtubeData = await getYoutubeVideo(artistName, trackName);

    const rawData = {
      spotifyData,
      lastfmData,
      youtubeData
    };

    // Normalizar y unificar los datos en un esquema común
    const unifiedTrack = unifyTrackData(rawData);

    res.status(200).json(unifiedTrack);
  } catch (error) {
    console.error('Error in /api/track:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
}
