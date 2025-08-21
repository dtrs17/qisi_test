"use client";

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faMusic, faPlus, faRandom, faSearch, faSave, faTrash, faUser, faSignOutAlt, faList, faStar } from '@fortawesome/free-solid-svg-icons';

interface Song {
  id: string;
  name: string;
  artist?: string;
  duration?: string;
}

interface StoredSong extends Song {
  userId: string;
  storedAt: string;
}

interface Playlist {
  id: string;
  name: string;
  isPublic: boolean;
  songs: Song[];
  createdAt: string;
  userId: string;
  userName?: string;
}

export default function MusicApp() {
  // Authentication state
  const { data: session, status } = useSession();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // User song management state
  const [songName, setSongName] = useState('');
  const [songs, setSongs] = useState<Song[]>([]);
  const [selectedSong, setSelectedSong] = useState<Song | null>(null);

  // Admin storage state
  const [storedSongs, setStoredSongs] = useState<StoredSong[]>([]);
  const [searchUserId, setSearchUserId] = useState('');

  // Playlist state
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [newPlaylistName, setNewPlaylistName] = useState('');
  const [isPublic, setIsPublic] = useState(true);
  const [activePlaylist, setActivePlaylist] = useState<Playlist | null>(null);
  const [publicPlaylists, setPublicPlaylists] = useState<Playlist[]>([]);

  // Load data when component mounts or user session changes
  useEffect(() => {
    if (status === 'authenticated') {
      loadUserData();
      loadPublicPlaylists();
    } else if (status === 'unauthenticated') {
      setIsLoading(false);
      setSongs([]);
      setStoredSongs([]);
      setPlaylists([]);
    }
  }, [session, status]);

  // Data loading functions
  const loadUserData = async () => {
    try {
      setIsLoading(true);
      // Fetch user's songs
      const songsResponse = await fetch('/api/songs');
      if (!songsResponse.ok) throw new Error('Failed to load songs');
      const userSongs = await songsResponse.json();
      setSongs(userSongs);

      // Fetch user's playlists
      const playlistsResponse = await fetch('/api/playlists/my');
      if (!playlistsResponse.ok) throw new Error('Failed to load playlists');
      const userPlaylists = await playlistsResponse.json();
      setPlaylists(userPlaylists);

      // Fetch stored songs
      const storedResponse = await fetch('/api/songs/stored');
      if (!storedResponse.ok) throw new Error('Failed to load stored songs');
      const storedData = await storedResponse.json();
      setStoredSongs(storedData);

      setError(null);
    } catch (err) {
      console.error('Error loading user data:', err);
      setError('Failed to load your music data. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  };

  const loadPublicPlaylists = async () => {
    try {
      const response = await fetch('/api/playlists/public');
      if (!response.ok) throw new Error('Failed to load public playlists');
      const publicData = await response.json();
      setPublicPlaylists(publicData);
    } catch (err) {
      console.error('Error loading public playlists:', err);
    }
  };

  // Song management functions
  const addSong = async () => {
    if (!songName.trim() || !session?.user) return;

    try {
      const newSong: Song = {
        id: Date.now().toString(),
        name: songName.trim(),
      };

      const response = await fetch('/api/songs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newSong),
      });

      if (!response.ok) throw new Error('Failed to add song');

      setSongs([...songs, newSong]);
      setSongName('');
    } catch (err) {
      console.error('Error adding song:', err);
      setError('Failed to add song. Please try again.');
    }
  };

  const selectRandomSong = () => {
    if (songs.length === 0) return;
    const randomIndex = Math.floor(Math.random() * songs.length);
    setSelectedSong(songs[randomIndex]);
  };

  // Playlist functions
  const createPlaylist = async () => {
    if (!newPlaylistName.trim() || !session?.user) return;

    try {
      const newPlaylist: Omit<Playlist, 'id' | 'createdAt' | 'songs' | 'userName'> = {
        name: newPlaylistName.trim(),
        isPublic,
        userId: session.user.id,
      };

      const response = await fetch('/api/playlists', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newPlaylist),
      });

      if (!response.ok) throw new Error('Failed to create playlist');

      const createdPlaylist = await response.json();
      setPlaylists([...playlists, createdPlaylist]);
      setNewPlaylistName('');
    } catch (err) {
      console.error('Error creating playlist:', err);
      setError('Failed to create playlist. Please try again.');
    }
  };

  const addToPlaylist = async (playlistId: string, song: Song) => {
    try {
      const response = await fetch(`/api/playlists/${playlistId}/songs`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(song),
      });

      if (!response.ok) throw new Error('Failed to add song to playlist');

      // Update local state
      setPlaylists(playlists.map(playlist => 
        playlist.id === playlistId
          ? { ...playlist, songs: [...playlist.songs, song] }
          : playlist
      ));

      if (activePlaylist?.id === playlistId) {
        setActivePlaylist(prev => prev ? {
          ...prev,
          songs: [...prev.songs, song]
        } : null);
      }
    } catch (err) {
      console.error('Error adding song to playlist:', err);
      setError('Failed to add song to playlist. Please try again.');
    }
  };

  // Filter stored songs based on search
  const filteredStoredSongs = searchUserId
    ? storedSongs.filter(song => song.userId.includes(searchUserId))
    : storedSongs;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-100 dark:bg-gray-900 flex flex-col items-center justify-center p-4">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mb-4"></div>
          <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200">Loading your music collection...</h2>
        </div>
      </div>
    );
  }

  if (status === 'unauthenticated') {
    return (
      <div className="min-h-screen bg-gray-100 dark:bg-gray-900 flex flex-col items-center justify-center p-4 text-center">
        <FontAwesomeIcon icon={faMusic} className="text-6xl text-blue-500 mb-6" />
        <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-4">Welcome to Music Manager</h1>
        <p className="text-gray-600 dark:text-gray-300 mb-8 max-w-md">
          Please sign in to manage your music collection, create playlists, and discover public playlists.
        </p>
        <div className="flex space-x-4">
          <a
            href="/login"
            className="px-6 py-3 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
          >
            Sign In
          </a>
          <a
            href="/register"
            className="px-6 py-3 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-white rounded-md hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
          >
            Register
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 flex flex-col">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow-sm p-4">
        <div className="container mx-auto flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <FontAwesomeIcon icon={faMusic} className="text-blue-500 text-2xl" />
            <h1 className="text-xl font-bold text-gray-800 dark:text-white">Music Manager</h1>
          </div>

          {session?.user && (
            <div className="flex items-center space-x-4">
              <span className="text-gray-600 dark:text-gray-300">
                Welcome, {session.user.name || session.user.email}
              </span>
              <a
                href="/api/auth/signout"
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              >
                <FontAwesomeIcon icon={faSignOutAlt} />
              </a>
            </div>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-grow container mx-auto p-4 md:p-6">
        {error && (
          <div className="bg-red-100 dark:bg-red-900 border border-red-400 text-red-700 dark:text-red-300 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Personal Music Management */}
          <div className="lg:col-span-2 space-y-6">
            {/* Song Management Section */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-4 flex items-center">
                <FontAwesomeIcon icon={faMusic} className="mr-2 text-blue-500" />
                Your Songs
              </h2>

              <div className="flex flex-col sm:flex-row gap-2 mb-4">
                <input
                  type="text"
                  value={songName}
                  onChange={(e) => setSongName(e.target.value)}
                  placeholder="Enter song name"
                  className="flex-grow px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white"
                />
                <button
                  onClick={addSong}
                  className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
                >
                  <FontAwesomeIcon icon={faPlus} className="mr-1" />
                  Add Song
                </button>
              </div>

              <button
                onClick={selectRandomSong}
                className="mb-4 px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 transition-colors"
                disabled={songs.length === 0}
              >
                <FontAwesomeIcon icon={faRandom} className="mr-1" />
                Select Random Song
              </button>

              {selectedSong && (
                <div className="mb-4 p-3 bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800 rounded-md">
                  <p className="text-gray-800 dark:text-white font-medium">
                    Selected Song: <span className="text-blue-600 dark:text-blue-400">{selectedSong.name}</span>
                  </p>
                </div>
              )}

              <div>
                <h3 className="font-semibold text-gray-700 dark:text-gray-300 mb-2">Your Song List:</h3>
                {songs.length === 0 ? (
                  <p className="text-gray-500 dark:text-gray-400 italic">No songs added yet.</p>
                ) : (
                  <ul className="space-y-2 max-h-60 overflow-y-auto pr-2">
                    {songs.map((song) => (
                      <li
                        key={song.id}
                        className="flex justify-between items-center p-2 bg-gray-50 dark:bg-gray-700 rounded"
                      >
                        <span className="text-gray-800 dark:text-white">{song.name}</span>
                        <div className="flex space-x-2">
                          <button
                            onClick={() => activePlaylist && addToPlaylist(activePlaylist.id, song)}
                            disabled={!activePlaylist}
                            className="text-blue-500 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
                            title={activePlaylist ? `Add to ${activePlaylist.name}` : "Select a playlist first"}
                          >
                            <FontAwesomeIcon icon={faSave} />
                          </button>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>

            {/* Playlist Management Section */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-4 flex items-center">
                <FontAwesomeIcon icon={faList} className="mr-2 text-blue-500" />
                Your Playlists
              </h2>

              <div className="flex flex-col sm:flex-row gap-2 mb-4">
                <input
                  type="text"
                  value={newPlaylistName}
                  onChange={(e) => setNewPlaylistName(e.target.value)}
                  placeholder="New playlist name"
                  className="flex-grow px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white"
                />
                <div className="flex items-center gap-2">
                  <label className="text-gray-600 dark:text-gray-300">Public</label>
                  <input
                    type="checkbox"
                    checked={isPublic}
                    onChange={(e) => setIsPublic(e.target.checked)}
                    className="rounded text-blue-500"
                  />
                </div>
                <button
                  onClick={createPlaylist}
                  className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
                >
                  Create Playlist
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <h3 className="font-semibold text-gray-700 dark:text-gray-300 mb-2">Your Playlists:</h3>
                  {playlists.length === 0 ? (
                    <p className="text-gray-500 dark:text-gray-400 italic">No playlists created yet.</p>
                  ) : (
                    <div className="space-y-2 max-h-40 overflow-y-auto pr-2">
                      {playlists.map((playlist) => (
                        <div
                          key={playlist.id}
                          onClick={() => setActivePlaylist(playlist)}
                          className={`p-3 rounded-md cursor-pointer transition-colors ${
                            activePlaylist?.id === playlist.id
                              ? 'bg-blue-100 dark:bg-blue-900/50 border border-blue-300 dark:border-blue-700'
                              : 'bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600'
                          }`}
                        >
                          <div className="font-medium text-gray-800 dark:text-white">{playlist.name}</div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">
                            {playlist.songs.length} songs • {playlist.isPublic ? 'Public' : 'Private'}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {activePlaylist && (
                  <div>
                    <h3 className="font-semibold text-gray-700 dark:text-gray-300 mb-2">
                      {activePlaylist.name} Songs
                    </h3>
                    <div className="space-y-2 max-h-40 overflow-y-auto pr-2">
                      {activePlaylist.songs.length === 0 ? (
                        <p className="text-gray-500 dark:text-gray-400 italic">No songs in this playlist.</p>
                      ) : (
                        activePlaylist.songs.map((song) => (
                          <div key={song.id} className="p-2 bg-gray-50 dark:bg-gray-700 rounded-md">
                            {song.name}
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right Column - Public Playlists & Admin Section */}
          <div className="space-y-6">
            {/* Public Playlists Section */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-4 flex items-center">
                <FontAwesomeIcon icon={faStar} className="mr-2 text-yellow-500" />
                Public Playlists
              </h2>

              <div className="space-y-3 max-h-80 overflow-y-auto pr-2">
                {publicPlaylists.length === 0 ? (
                  <p className="text-gray-500 dark:text-gray-400 italic">No public playlists available.</p>
                ) : (
                  publicPlaylists.map((playlist) => (
                    <div key={playlist.id} className="p-3 bg-gray-50 dark:bg-gray-700 rounded-md">
                      <div className="font-medium text-gray-800 dark:text-white">{playlist.name}</div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        By {playlist.userName || 'Unknown User'} • {playlist.songs.length} songs
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Admin Storage Section */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-4 flex items-center">
                <FontAwesomeIcon icon={faSave} className="mr-2 text-green-500" />
                Admin Song Storage
              </h2>

              {/* Search Section with blue background for visibility */}
              <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-md border border-blue-200 dark:border-blue-800 mb-4">
                <h3 className="font-semibold text-gray-800 dark:text-white mb-2">Search Stored Songs</h3>
                <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">Filter stored songs by user ID</p>
                <div className="flex">
                  <input
                    type="text"
                    value={searchUserId}
                    onChange={(e) => setSearchUserId(e.target.value)}
                    placeholder="Enter user ID to search"
                    className="flex-grow px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white"
                  />
                  <button
                    onClick={() => setSearchUserId('')}
                    className="ml-2 px-4 py-2 bg-gray-200 dark:bg-gray-600 text-gray-800 dark:text-white rounded-md hover:bg-gray-300 dark:hover:bg-gray-500 transition-colors"
                  >
                    Clear
                  </button>
                </div>
              </div>

              <div>
                <h3 className="font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Stored Songs {searchUserId ? `for User ID: ${searchUserId}` : ''}:
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                  Total: {filteredStoredSongs.length} {filteredStoredSongs.length === 1 ? 'song' : 'songs'}
                </p>

                {filteredStoredSongs.length === 0 ? (
                  <p className="text-gray-500 dark:text-gray-400 italic">
                    {searchUserId ? 'No songs found for this user ID.' : 'No songs stored yet.'}
                  </p>
                ) : (
                  <div className="space-y-2 max-h-80 overflow-y-auto pr-2 text-sm">
                    {filteredStoredSongs.map((song) => (
                      <div key={song.id} className="p-2 bg-gray-50 dark:bg-gray-700 rounded-md">
                        <div><strong>User:</strong> {song.userId}</div>
                        <div><strong>Song:</strong> {song.name}</div>
                        <div><strong>Stored:</strong> {new Date(song.storedAt).toLocaleString()}</div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white dark:bg-gray-800 shadow-inner p-4 text-center text-gray-600 dark:text-gray-400 text-sm">
        Music Manager © {new Date().getFullYear()}
      </footer>
    </div>
  );
}
}