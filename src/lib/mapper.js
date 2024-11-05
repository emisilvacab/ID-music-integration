import Levenshtein from "levenshtein";

/**
 * Normaliza el texto eliminando caracteres especiales y espacios extra, y pasa a minúsculas.
 *
 * @param {string} text - El texto a normalizar.
 * @returns {string} - El texto normalizado.
 */
function normalize(text) {
  return text.toLowerCase().replace(/[^a-z0-9\s]/gi, '').trim();
}

/**
 * Calcula la similitud entre dos cadenas usando la distancia de Levenshtein.
 *
 * @param {string} a - Primera cadena.
 * @param {string} b - Segunda cadena.
 * @returns {number} - Similitud de 0 a 1.
 */
function similarity(a, b) {
  const levenshtein = new Levenshtein(a, b);
  const distance = levenshtein.distance;
  return 1 - distance / Math.max(a.length, b.length);
}

/**
 * Busca el video más parecido en una lista de resultados de YouTube, tomando en cuenta que el nombre del artista puede estar al principio o al final del título.
 *
 * @param {string} targetTitle - Título de la canción que buscas.
 * @param {string} targetArtist - Nombre del artista.
 * @param {Array} youtubeResults - Lista de resultados de YouTube.
 * @returns {Object|null} - El video que mejor coincide o null si no hay coincidencias.
 */
function findBestYouTubeVideoMatch(targetTitle, targetArtist, youtubeResults) {
  let bestMatch = null;
  let bestMatchFound = false;
  let highestScore = 0;

  youtubeResults.forEach(result => {
    const normalizedTitle = normalize(targetTitle);
    const normalizedArtist = normalize(targetArtist);
    const normalizedResultTitle = normalize(result.snippet.title);
    const normalizedResultArtist = normalize(result.snippet.channelTitle);

    // Si el título del video contiene palabras clave como official/oficial/music/version y "video", se considera el mejor resultado
    if (
      (normalizedResultTitle.includes("official") ||
        normalizedResultTitle.includes("oficial") ||
        normalizedResultTitle.includes("music") ||
        normalizedResultTitle.includes("version")
      ) && normalizedResultTitle.includes("video")
    ) {
      bestMatch = result;
      bestMatchFound = true;
    }

    const titleWithoutArtist = normalizedResultTitle
      .replace(normalizedArtist, '')  // Elimina el artista del título del video si está presente
      .trim();

    const titleSim = similarity(normalizedTitle, titleWithoutArtist);
    const artistSim = similarity(normalizedArtist, normalizedResultArtist);
    const matchScore = (titleSim + artistSim) / 2;

    if (matchScore > highestScore && !bestMatchFound) {
      highestScore = matchScore;
      bestMatch = result;
    }
  });

  return bestMatch;
}

/**
 * Busca el mejor canal de YouTube que coincida con el nombre del artista.
 *
 * @param {string} targetArtist - Nombre del artista.
 * @param {Array} youtubeChannels - Lista de resultados de canales de YouTube.
 * @returns {Object|null} - El canal que mejor coincide o null si no hay coincidencias.
 */
function findBestYouTubeChannelMatch(targetArtist, youtubeChannels) {
  let bestChannel = null;
  let highestScore = 0;

  youtubeChannels.forEach(channel => {
    const normalizedArtist = normalize(targetArtist);
    const normalizedChannelTitle = normalize(channel.snippet.title);

    const channelSim = similarity(normalizedArtist, normalizedChannelTitle);

    if (channelSim > highestScore) {
      highestScore = channelSim;
      bestChannel = channel;
    }
  });

  return bestChannel;
}

export { findBestYouTubeVideoMatch, findBestYouTubeChannelMatch };
