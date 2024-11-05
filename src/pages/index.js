import { useState } from 'react';

export default function Home() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchType, setSearchType] = useState('track'); // Estado para el tipo de búsqueda (track o artist)

  const handleSearch = () => {
    setLoading(true);

    fetch(`/api/search/${searchTerm}?type=${searchType}`)
      .then(response => response.json())
      .then(data => {
        setData(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch(error => {
        console.error('Error fetching Spotify data:', error);
        setLoading(false);
      });
  };

  const renderData = () => (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
      {data.map((item, index) => (
        <div key={index} className="bg-white shadow-md rounded-lg overflow-hidden">
          <img src={item.image} alt={`${item.name} cover`} className="w-full h-48 object-cover" />
          <div className="p-4">
            <a className="text-lg font-semibold" href={`/${searchType}/${item.id}`}>{item.name}</a>
            <p className="text-gray-600">{item.artist || item.genres?.join(', ')}</p>
            {searchType === 'track' && <p className="text-gray-600">{item.album}</p>}
            {searchType === 'track' && <p className="text-gray-600">{item.release_date}</p>}
          </div>
        </div>
      ))}
    </div>
  );

  return (
    <div className="container mx-auto p-6 bg-gray-100 rounded-lg shadow-lg">
      <h1 className="text-3xl font-extrabold text-center mb-6 text-gray-800">Music Integration</h1>

      {/* Toggle para seleccionar el tipo de búsqueda */}
      <div className="flex justify-center mb-4">
        <button
          onClick={() => setSearchType('track')}
          className={`px-4 py-2 mx-1 font-semibold rounded-lg ${searchType === 'track' ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-800'}`}
        >
          Track
        </button>
        <button
          onClick={() => setSearchType('artist')}
          className={`px-4 py-2 mx-1 font-semibold rounded-lg ${searchType === 'artist' ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-800'}`}
        >
          Artist
        </button>
      </div>

      <div className="flex justify-center mb-8">
        <div className="w-full max-w-md">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder={searchType === 'track' ? "Track name..." : "Artist name..."}
            className="px-4 py-3 border border-gray-300 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-green-500 transition duration-200 ease-in-out"
            required
          />
          <button
            onClick={handleSearch}
            className={`mt-3 w-full py-3 bg-green-500 text-white font-semibold rounded-lg hover:bg-green-600 transition duration-200 ease-in-out ${!searchTerm ? 'opacity-50 cursor-not-allowed' : ''}`}
            disabled={!searchTerm}
          >
            Search
          </button>
        </div>
      </div>

      {loading ? (
        <p className="text-center text-gray-600">Loading...</p>
      ) : (
        renderData()
      )}
    </div>
  );
}
