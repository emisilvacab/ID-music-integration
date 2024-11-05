import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';

export default function Track() {
  const router = useRouter();
  const { id } = router.query;
  const [trackData, setTrackData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      fetch(`/api/track/${id}`)
        .then(response => response.json())
        .then(data => {
          setTrackData(data);
          setLoading(false);
        })
        .catch(error => {
          console.error('Error fetching track data:', error);
          setLoading(false);
        });
    }
  }, [id]);

  if (loading) {
    return <p className="text-center">Loading...</p>;
  }

  if (!trackData) {
    return <p className="text-center">No se encontraron datos del track.</p>;
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

        <h1 className="text-3xl font-extrabold text-center mb-6 text-gray-800">{trackData.title.value}</h1>
      </div>
      <div className="flex flex-col md:flex-row mb-8">
        <img
          src={trackData.album.spotifyCoverUrl.value || trackData.album.lastFmCoverUrl.value}
          alt={`${trackData.album.name.value} cover`}
          className="w-full md:w-1/3 rounded-lg shadow-md"
        />
        <div className="md:ml-6 mt-4 md:mt-0">
          <h2 className="text-2xl font-semibold text-gray-800">Album: {trackData.album.name.value}</h2>
          <p className="text-gray-600 mt-2">Release Date: <span className="font-medium">{trackData.album.releaseDate.value}</span></p>
          <p className="text-gray-600">Duration: <span className="font-medium">{trackData.duration.value}</span></p>
          <p className="text-gray-600">Genres: <span className="font-medium">{trackData.genres.value.join(', ')}</span></p>
          <div className='w-full mb-6 md:pr-4'>
            <div className="flex">
              <div className='mr-6'>
                <div className="my-6">
                  <h3 className="text-lg font-semibold">Artist</h3>
                  <a href={`/artist/${trackData.artist.id.value}`} className="text-blue-500 hover:underline">
                    {trackData.artist.name.value}
                  </a>
                  <div className="flex space-x-4 mt-2">
                    <a href={trackData.artist.spotifyUrl.value} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">Spotify</a>
                    <a href={trackData.artist.lastFmUrl.value} target="_blank" rel="noopener noreferrer" className="text-red-500 hover:underline">Last.fm</a>
                  </div>
                </div>
                <div className="mb-6">
                  <h3 className="text-lg font-semibold">Listen</h3>
                  <div className="flex space-x-4 mt-2">
                    <a href={trackData.urls.spotifyTrack.value} target="_blank" rel="noopener noreferrer" className="text-green-500 hover:underline">Spotify</a>
                    <a href={trackData.urls.lastFmTrack.value} target="_blank" rel="noopener noreferrer" className="text-red-500 hover:underline">Last.fm</a>
                    <a href={trackData.urls.youtubeVideo.value} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">YouTube</a>
                  </div>
                </div>
              </div>

              <div className="my-6">
                <h3 className="text-lg font-semibold">Popularity</h3>
                <p className="text-gray-600">Spotify Popularity: <span className="font-medium">{trackData.popularity.spotify.value}</span></p>
                <p className="text-gray-600">Last.fm Listeners: <span className="font-medium">{trackData.popularity.lastFmListeners.value}</span></p>
                <p className="text-gray-600">Last.fm Play Count: <span className="font-medium">{trackData.popularity.lastFmPlayCount.value}</span></p>
                <p className="text-gray-600">YouTube Views: <span className="font-medium">{trackData.popularity.youtubeViews.value}</span></p>
                <p className="text-gray-600">YouTube Likes: <span className="font-medium">{trackData.popularity.youtubeLikes.value}</span></p>
                <p className="text-gray-600">YouTube Comments: <span className="font-medium">{trackData.popularity.youtubeComments.value}</span></p>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className='flex w-full justify-center'>
        <div className="w-full md:w-3/4 lg:w-2/3 mb-8">
          <h3 className="text-lg font-semibold">YouTube Video</h3>
          <iframe
            className="w-full h-96 rounded-lg shadow-md"
            src={trackData.urls.youtubeVideo.value.replace('watch?v=', 'embed/')}
            title={trackData.title.value}
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          ></iframe>
        </div>
      </div>

      <h3 className="text-lg font-semibold">Description</h3>
      <p className="text-gray-600 mt-4">{trackData.description.value}</p>
    </div>
  );
}
