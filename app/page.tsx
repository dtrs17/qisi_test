"use client";

import { useState } from 'react';
import Image from 'next/image';

export default function Home() {
  // 歌曲状态管理
  const [songName, setSongName] = useState('');
  const [playlist, setPlaylist] = useState<string[]>([]);
  const [randomSong, setRandomSong] = useState<string | null>(null);
  const [adminSong, setAdminSong] = useState('');
  const [adminUserId, setAdminUserId] = useState('');
  const [storedSongs, setStoredSongs] = useState<{
    userId: string;
    name: string;
    time: string;
  }[]>([]);
  const [searchUserId, setSearchUserId] = useState('');

  // 添加歌曲到歌单
  const addToPlaylist = (e: React.FormEvent) => {
    e.preventDefault();
    if (songName.trim() && !playlist.includes(songName.trim())) {
      setPlaylist([...playlist, songName.trim()]);
      setSongName('');
    }
  };

  // 从歌单删除歌曲
  const removeFromPlaylist = (index: number) => {
    const newPlaylist = [...playlist];
    newPlaylist.splice(index, 1);
    setPlaylist(newPlaylist);
    // 如果删除的是当前随机选中的歌曲，清空随机结果
    if (randomSong === playlist[index]) {
      setRandomSong(null);
    }
  };

  // 从歌单随机选择歌曲
  const selectRandomSong = () => {
    if (playlist.length > 0) {
      const randomIndex = Math.floor(Math.random() * playlist.length);
      setRandomSong(playlist[randomIndex]);
    }
  };

  // 管理员存储歌曲
  const storeSong = (e: React.FormEvent) => {
    e.preventDefault();
    if (adminSong.trim() && adminUserId.trim()) {
      const newSong = {
        userId: adminUserId.trim(),
        name: adminSong.trim(),
        time: new Date().toLocaleString(),
      };
      setStoredSongs([...storedSongs, newSong]);
      setAdminSong('');
      setAdminUserId('');
    }
  };

  // 清空歌单
  const clearPlaylist = () => {
    setPlaylist([]);
    setRandomSong(null);
  };

  // 过滤后的存储记录
  const filteredSongs = storedSongs.filter(
    song => !searchUserId || song.userId.toLowerCase() === searchUserId.toLowerCase()
  );

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-center text-gray-900 dark:text-white mb-12">
          音乐管理系统
        </h1>

        {/* 用户歌曲添加区域 */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-8 transition-all duration-300 hover:shadow-lg">
          <h2 className="text-2xl font-semibold mb-4 text-gray-800 dark:text-gray-200">添加歌曲到歌单</h2>
          <form onSubmit={addToPlaylist} className="flex gap-2">
            <input
              type="text"
              value={songName}
              onChange={(e) => setSongName(e.target.value)}
              placeholder="输入歌曲名称"
              className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
            />
            <button
              type="submit"
              className="px-6 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors duration-200"
            >
              添加
            </button>
          </form>

          {/* 歌单显示 */}
          {playlist.length > 0 && (
            <div className="mt-6">
              <div className="flex justify-between items-center mb-2">
                <h3 className="text-lg font-medium text-gray-700 dark:text-gray-300">
                  我的歌单 ({playlist.length})
                </h3>
                <button
                  onClick={clearPlaylist}
                  className="text-sm text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                >
                  清空歌单
                </button>
              </div>
              
              <ul className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {playlist.map((song, index) => (
                  <li key={index} className="bg-gray-100 dark:bg-gray-700 p-2 rounded-md text-gray-800 dark:text-gray-200 flex justify-between items-center">
                    <span>{song}</span>
                    <button
                      onClick={() => removeFromPlaylist(index)}
                      className="text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 text-sm ml-2"
                    >
                      ×
                    </button>
                  </li>
                ))}
              </ul>

              {/* 随机选择按钮 */}
              <button
                onClick={selectRandomSong}
                className="mt-4 px-6 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-colors duration-200"
              >
                随机选择歌曲
              </button>

              {/* 随机结果显示 */}
              {randomSong && (
                <div className="mt-4 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-md animate-fade-in">
                  <p className="text-green-800 dark:text-green-200 font-medium">随机选中: {randomSong}</p>
                </div>
              )}
            </div>
          )}
          
          {playlist.length === 0 && (
            <p className="mt-4 text-gray-500 dark:text-gray-400">歌单为空，请添加歌曲</p>
          )}
        </div>

        {/* 管理员存储区域 */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 transition-all duration-300 hover:shadow-lg">
          <h2 className="text-2xl font-semibold mb-4 text-gray-800 dark:text-gray-200">管理员歌曲存储</h2>
          
          {/* 添加搜索框 */}
          <div className="mb-4">
            <input
              type="text"
              value={searchUserId}
              onChange={(e) => setSearchUserId(e.target.value)}
              placeholder="输入用户ID搜索"
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
            />
          </div>

          <form onSubmit={storeSong} className="space-y-4">
            <div className="flex gap-2">
              <input
                type="text"
                value={adminUserId}
                onChange={(e) => setAdminUserId(e.target.value)}
                placeholder="用户ID"
                className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 dark:bg-gray-700 dark:text-white"
              />
              <input
                type="text"
                value={adminSong}
                onChange={(e) => setAdminSong(e.target.value)}
                placeholder="歌曲名称"
                className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 dark:bg-gray-700 dark:text-white"
              />
            </div>
            <button
              type="submit"
              className="w-full px-6 py-2 bg-purple-500 text-white rounded-md hover:bg-purple-600 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 transition-colors duration-200"
            >
              存储歌曲
            </button>
          </form>

          {/* 存储记录显示 - 完整表格实现 */}
          {storedSongs.length > 0 ? (
            <div className="mt-6">
              <h3 className="text-lg font-medium mb-2 text-gray-700 dark:text-gray-300">
                存储记录 ({filteredSongs.length})
              </h3>
              <div className="overflow-x-auto">
                <table className="min-w-full bg-white dark:bg-gray-700 rounded-lg overflow-hidden">
                  <thead className="bg-gray-100 dark:bg-gray-800">
                    <tr>
                      <th className="px-4 py-2 text-left text-sm font-medium text-gray-600 dark:text-gray-300">用户ID</th>
                      <th className="px-4 py-2 text-left text-sm font-medium text-gray-600 dark:text-gray-300">歌曲名称</th>
                      <th className="px-4 py-2 text-left text-sm font-medium text-gray-600 dark:text-gray-300">存储时间</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredSongs.length > 0 ? (
                      filteredSongs.map((song, index) => (
                        <tr 
                          key={index} 
                          className={`${
                            index % 2 === 0 
                              ? 'bg-gray-50 dark:bg-gray-800' 
                              : 'bg-white dark:bg-gray-700'
                          } hover:bg-gray-100 dark:hover:bg-gray-800/80 transition-colors`}
                        >
                          <td className="px-4 py-3 text-sm text-gray-900 dark:text-gray-100">{song.userId}</td>
                          <td className="px-4 py-3 text-sm text-gray-900 dark:text-gray-100">{song.name}</td>
                          <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">{song.time}</td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={3} className="px-4 py-8 text-center text-gray-500 dark:text-gray-400">
                          没有找到匹配的记录
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            <p className="mt-6 text-gray-500 dark:text-gray-400">暂无存储记录</p>
          )}
        </div>
      </div>
    </div>
  );
}
