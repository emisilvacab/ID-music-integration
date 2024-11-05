/**
 * Normaliza nombres de canciones y artistas entre plataformas.
 * - Elimina caracteres especiales, convierte a minúsculas, y quita espacios adicionales.
 * - Mejora la coincidencia de nombres entre plataformas.
 *
 * @param {string} name - El nombre a normalizar.
 * @returns {string} - Nombre normalizado.
 */
function normalizeName(name) {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9\s]/gi, '') // Elimina caracteres especiales
    .trim();
}

/**
 * Elimina el último tag de <a> y todo lo que viene después de él en la cadena de texto.
 *
 * @param {string} text - El texto del que se desea eliminar el tag <a> y el contenido posterior.
 * @returns {string} - El texto modificado sin el tag <a> y el contenido posterior.
 */
function normalizeDescription(text) {
  if (text) {
    const anchorIndex = text.lastIndexOf('<a');
    if (anchorIndex !== -1) {
      return text.substring(0, anchorIndex).trim();
    }
  }
  return text;
}

/**
 * Función que convierte la duración a un formato legible (MM:SS).
 *
 * @param {string|number} duration - Duración en milisegundos o formato ISO 8601.
 * @returns {string} - Duración en formato legible.
 */
function formatDuration(duration) {
  if (typeof duration === 'number') {
    const totalSeconds = Math.floor(duration / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`; // Formato MM:SS
  }

  // Si está en formato ISO 8601 (e.g., "PT4M57S"), lo convertimos
  const match = duration.match(/PT(\d+M)?(\d+S)?/);
  const minutes = parseInt(match[1]) || 0;
  const seconds = parseInt(match[2]) || 0;
  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`; // Formato MM:SS
}

/**
 * Función unificadora para el módulo de transformación.
 * Llama a las funciones f y g para aplicar las normalizaciones.
 *
 * @param {Object} rawData - Datos crudos de las APIs.
 * @returns {Object} - Datos normalizados y unificados.
 */
function unifyTrackData(rawData) {
  const { spotifyData, lastfmData, youtubeData } = rawData;

  return {
    id: { value: spotifyData.id, source: 'Spotify' },
    title: {
      value: spotifyData.name || lastfmData.track.name || youtubeData.items[0].snippet.title,
      source: spotifyData.name ? 'Spotify' : lastfmData.track.name ? 'Last.fm' : 'YouTube'
    },
    artist: {
      id: { value: spotifyData.artists[0].id, source: 'Spotify' },
      name: { value: spotifyData.artists[0].name, source: 'Spotify' },
      spotifyUrl: { value: spotifyData.artists[0].external_urls.spotify, source: 'Spotify' },
      lastFmUrl: { value: lastfmData.track.artist.url, source: 'Last.fm' },
    },
    album: {
      name: {
        value: spotifyData.album.name,
        source: 'Spotify'
      },
      spotifyCoverUrl: {
        value: spotifyData.album.images[0].url,
        source: 'Spotify'
      },
      lastFmCoverUrl: {
        value: lastfmData.track.album?.image[0]["#text"],
        source: 'Last.fm'
      },
      releaseDate: {
        value: spotifyData.album.release_date,
        source: 'Spotify'
      }
    },
    duration: {
      value: formatDuration(spotifyData.duration_ms || lastfmData.track.duration || youtubeData.items[0].contentDetails.duration),
      source: spotifyData.duration_ms ? 'Spotify' : lastfmData.track.duration ? 'Last.fm' : youtubeData.items[0].contentDetails.duration ? 'YouTube' : 'N/A'
    },
    popularity: {
      spotify: {
        value: spotifyData.popularity,
        source: 'Spotify'
      },
      lastFmListeners: {
        value: parseInt(lastfmData.track.listeners).toLocaleString(),
        source: 'Last.fm'
      },
      lastFmPlayCount: {
        value: parseInt(lastfmData.track.playcount).toLocaleString(),
        source: 'Last.fm'
      },
      youtubeViews: {
        value: parseInt(youtubeData.items[0].statistics.viewCount).toLocaleString(),
        source: 'YouTube'
      },
      youtubeLikes: {
        value: parseInt(youtubeData.items[0].statistics.likeCount).toLocaleString(),
        source: 'YouTube'
      },
      youtubeComments: {
        value: parseInt(youtubeData.items[0].statistics.commentCount).toLocaleString(),
        source: 'YouTube'
      }
    },
    urls: {
      spotifyTrack: {
        value: spotifyData.external_urls.spotify,
        source: 'Spotify'
      },
      lastFmTrack: {
        value: lastfmData.track.url,
        source: 'Last.fm'
      },
      youtubeVideo: {
        value: `https://www.youtube.com/watch?v=${youtubeData.items[0].id}`,
        source: 'YouTube'
      }
    },
    genres: {
      value: lastfmData.track.toptags.tag.map(tag => tag.name),
      source: 'Last.fm'
    },
    description: {
      value: normalizeDescription(lastfmData.track.wiki?.content),
      source: 'Last.fm'
    }
  };
};

function unifyArtistData(rawData) {
  const { spotifyData, lastfmData, youtubeData, topTracksData } = rawData;

  return {
    id: { value: spotifyData.id, source: 'Spotify' },
    name: {
      value: spotifyData.name || lastfmData.artist?.name || youtubeData.items?.[0]?.snippet?.title || 'Unknown Artist',
      source: spotifyData.name ? 'Spotify' : lastfmData.artist?.name ? 'Last.fm' : youtubeData.items?.[0]?.snippet?.title ? 'YouTube' : "N/A"
    },
    images: {
      spotify: {
        value: spotifyData.images?.[0]?.url,
        source: 'Spotify'
      },
      lastfm: {
        value: lastfmData.artist?.image?.[0]?.['#text'],
        source: 'Last.fm'
      },
      youtube: {
        value: youtubeData.items?.[0]?.snippet?.thumbnails?.high?.url,
        source: 'YouTube'
      }
    },
    genres: {
      value: spotifyData.genres || [],
      source: 'Spotify'
    },
    popularity: {
      value: spotifyData.popularity,
      source: 'Spotify'
    },
    statistics: {
      spotify_followers: {
        value: parseInt(spotifyData.followers?.total).toLocaleString(),
        source: 'Spotify'
      },
      youtube_subscribers: {
        value: parseInt(youtubeData.items?.[0]?.statistics?.subscriberCount).toLocaleString(),
        source: 'YouTube'
      },
      youtube_view_count: {
        value: parseInt(youtubeData.items?.[0]?.statistics?.viewCount).toLocaleString(),
        source: 'YouTube'
      }
    },
    description: {
      value: normalizeDescription(lastfmData.artist?.bio?.content) || youtubeData.items?.[0]?.snippet?.description || 'No description available',
      source: lastfmData.artist?.bio?.content ? 'Last.fm' : youtubeData.items?.[0]?.snippet?.description ? 'YouTube' : 'N/A'
    },
    similar_artists: lastfmData.artist?.similar?.artist?.map(artist => ({
      name: artist.name,
      url: artist.url,
      source: 'Last.fm'
    })) || [],
    external_links: {
      spotify: {
        value: spotifyData.external_urls?.spotify,
        source: 'Spotify'
      },
      lastfm: {
        value: lastfmData.artist?.url,
        source: 'Last.fm'
      },
      youtube: {
        value: `https://www.youtube.com/channel/${youtubeData.items?.[0]?.id}`,
        source: 'YouTube'
      }
    },
    on_tour: {
      value: lastfmData.artist?.ontour === '1',
      source: 'Last.fm'
    },
    top_tracks: {
      value: topTracksData.map(track => ({
        id: track.id,
        name: track.name,
        album: track.album.name,
        url: track.external_urls.spotify,
        popularity: track.popularity,
        preview_url: track.preview_url
      })) || [],
      source: 'Spotify'
    }
  };
}


export { normalizeName, formatDuration, unifyTrackData, unifyArtistData };