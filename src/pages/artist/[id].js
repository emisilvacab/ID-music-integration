import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';

export default function Artist() {
  const router = useRouter();
  const { id } = router.query;
  const [artistData, setArtistData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      fetch(`/api/artist/${id}`)
        .then(response => response.json())
        .then(data => {
          setArtistData(data);
          setLoading(false);
        })
        .catch(error => {
          console.error('Error fetching artist data:', error);
          setLoading(false);
        });
    }
  }, [id]);

  if (loading) {
    return <p className="text-center">Loading...</p>;
  }

  if (!artistData) {
    return <p className="text-center">No se encontraron datos del artista.</p>;
  }

  return (
      <div className="container mx-auto p-6 bg-white rounded-lg shadow-lg">
        <div className="flex align-center">
          <div className='w-1/2' >
            <button
              onClick={() => router.push('/')}
              className="bg-green-500 text-white px-4 py-2 rounded-full m-2 shadow-md hover:bg-green-600"
            >
              Home
            </button>
          </div>
          <h1 className="text-3xl font-extrabold text-gray-800 mt-2">{artistData.name.value}</h1>
        </div>
        <div className="flex flex-col md:flex-row mb-8">
          <img
            src={artistData.images.spotify?.value || artistData.images.lastfm?.value || artistData.images.youtube?.value}
            alt={`${artistData.name.value} image`}
            className="w-full md:w-1/3 rounded-lg shadow-md object-cover"
          />
          <div className="md:ml-6 mt-4 md:mt-0 flex-grow">
            <h2 className="text-2xl font-semibold text-gray-800">Genres</h2>
            <p className="text-gray-600 mb-6">{artistData.genres.value.join(', ')}</p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h3 className="text-lg font-semibold mb-2">Statistics</h3>
                <p className="text-gray-600">Popularity on Spotify: <span className="font-medium">{artistData.popularity.value}</span></p>
                <p className="text-gray-600">Followers on Spotify: <span className="font-medium">{artistData.statistics.spotify_followers.value}</span></p>
                <p className="text-gray-600">YouTube Subscribers: <span className="font-medium">{artistData.statistics.youtube_subscribers.value}</span></p>
                <p className="text-gray-600">Total YouTube Views: <span className="font-medium">{artistData.statistics.youtube_view_count.value}</span></p>
                <div className="flex flex-col md:flex-row mt-6">
                  <div className='mb-6 mr-6'>
                    <h3 className="text-lg font-semibold">Similar Artists</h3>
                    <ul className="list-disc list-inside">
                      {artistData.similar_artists.map((artist, index) => (
                        <li key={index}>
                          <a href={artist.url} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">{artist.name}</a>
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold">On Tour</h3>
                    <p className="text-gray-600 mb-4">{artistData.on_tour.value ? 'Yes' : 'No'}</p>

                    <h3 className="text-lg font-semibold">External Links</h3>
                    <div className="flex space-x-4 mt-2">
                      <a href={artistData.external_links.spotify.value} target="_blank" rel="noopener noreferrer" className="text-green-500 hover:underline">Spotify</a>
                      <a href={artistData.external_links.lastfm.value} target="_blank" rel="noopener noreferrer" className="text-red-500 hover:underline">Last.fm</a>
                      <a href={artistData.external_links.youtube.value} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">YouTube</a>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mb-6">
                <h3 className="text-lg font-semibold">Top Tracks on Spotify</h3>
                <ul className="list-decimal list-inside">
                  {artistData.top_tracks.value.map((track, index) => (
                    <li key={index}>
                      <a href={`/track/${track.id}`} className="text-blue-500 hover:underline">
                        {track.name}
                      </a>
                      <span className="text-gray-600"> - {track.album}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>

        <div className="mb-6">
          <h3 className="text-lg font-semibold">Description</h3>
          <p className="text-gray-600 mt-4">{artistData.description.value}</p>
        </div>
      </div>
  );
}
