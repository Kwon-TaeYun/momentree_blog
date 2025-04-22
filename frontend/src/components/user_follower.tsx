import React, { useState, useEffect } from 'react';
import Image from 'next/image';

interface UserFollowerProps {
  isOpen: boolean;
  onClose: () => void;
  userId?: string; // 현재 보고 있는 프로필의 사용자 ID
}

interface User {
  id: string;
  name: string;
  username: string;
  imageUrl: string;
  isFollowing: boolean;
}

const UserFollower: React.FC<UserFollowerProps> = ({ isOpen, onClose, userId }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'followers' | 'following'>('followers');
  const [followers, setFollowers] = useState<User[]>([]);
  const [following, setFollowing] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);

  // 팔로워와 팔로잉 목록을 가져오는 함수
  const fetchFollowData = async () => {
    setLoading(true);
    try {
      // 팔로워 목록 가져오기
      const followersResponse = await fetch(`http://localhost:8090/api/v1/follows/followers/${userId}`);
      const followersData = await followersResponse.json();
      setFollowers(followersData);

      // 팔로잉 목록 가져오기
      const followingResponse = await fetch(`http://localhost:8090/api/v1/follows/following/${userId}`);
      const followingData = await followingResponse.json();
      setFollowing(followingData);
    } catch (error) {
      console.error('Failed to fetch follow data:', error);
    } finally {
      setLoading(false);
    }
  };

  // 팔로우/언팔로우 처리 함수
  const handleFollowToggle = async (targetUserId: string) => {
    try {
      const isCurrentlyFollowing = activeTab === 'following' 
        ? following.find(user => user.id === targetUserId)?.isFollowing
        : followers.find(user => user.id === targetUserId)?.isFollowing;

      const endpoint = isCurrentlyFollowing ? 'unfollow' : 'follow';
      
      const response = await fetch(`http://localhost:8090/api/v1/follows/${endpoint}/${targetUserId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include' // 쿠키 포함
      });

      if (!response.ok) {
        throw new Error('Failed to toggle follow status');
      }

      // 상태 업데이트
      const updateFollowStatus = (users: User[]) =>
        users.map(user =>
          user.id === targetUserId
            ? { ...user, isFollowing: !isCurrentlyFollowing }
            : user
        );

      if (activeTab === 'following') {
        setFollowing(updateFollowStatus(following));
      } else {
        setFollowers(updateFollowStatus(followers));
      }
    } catch (error) {
      console.error('Failed to toggle follow status:', error);
    }
  };

  // 컴포넌트 마운트 시 데이터 가져오기
  useEffect(() => {
    if (isOpen && userId) {
      fetchFollowData();
    }
  }, [isOpen, userId]);

  // 현재 탭에 따른 사용자 목록
  const currentUsers = activeTab === 'followers' ? followers : following;

  // 검색어로 필터링된 사용자 목록
  const filteredUsers = currentUsers.filter(user =>
    user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.username.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black bg-opacity-50 backdrop-blur-sm" onClick={onClose}></div>
      
      <div className="relative bg-white rounded-xl w-full max-w-[400px] mx-4">
        <div className="flex items-center justify-between px-4 py-2 border-b">
          <button onClick={onClose} className="p-2 hover:opacity-50">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
          <div className="flex-1 text-center font-semibold">
            {activeTab === 'followers' ? '팔로워' : '팔로우'}
          </div>
          <div className="w-10"></div>
        </div>

        <div className="flex border-b">
          <button 
            onClick={() => setActiveTab('followers')}
            className={`flex-1 text-sm font-medium py-3 ${
              activeTab === 'followers' 
                ? 'border-b border-black text-black' 
                : 'text-gray-500'
            }`}
          >
            팔로워
          </button>
          <button 
            onClick={() => setActiveTab('following')}
            className={`flex-1 text-sm font-medium py-3 ${
              activeTab === 'following' 
                ? 'border-b border-black text-black' 
                : 'text-gray-500'
            }`}
          >
            팔로우
          </button>
        </div>
        
        <div className="p-2">
          <div className="relative bg-gray-100 rounded-lg">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg className="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <input
              type="text"
              placeholder="검색"
              className="w-full pl-10 pr-4 py-2 bg-transparent text-sm focus:outline-none"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
        
        <div className="overflow-y-auto max-h-[400px]">
          {loading ? (
            <div className="text-center py-6 text-gray-500 text-sm">
              로딩 중...
            </div>
          ) : filteredUsers.length === 0 ? (
            <div className="text-center py-6 text-gray-500 text-sm">
              {searchQuery ? '검색 결과가 없습니다' : `${activeTab === 'followers' ? '팔로워' : '팔로우'}가 없습니다`}
            </div>
          ) : (
            filteredUsers.map((user) => (
              <div key={user.id} className="flex items-center justify-between px-4 py-2 hover:bg-gray-50">
                <div className="flex items-center flex-1 min-w-0">
                  <div className="relative h-11 w-11 rounded-full overflow-hidden border">
                    <div className="absolute inset-0 bg-gray-200 flex items-center justify-center">
                      {user.imageUrl ? (
                        <Image
                          src={user.imageUrl}
                          alt={user.name}
                          fill
                          className="object-cover"
                          onError={(e) => {
                            e.currentTarget.style.display = 'none';
                          }}
                        />
                      ) : null}
                      <span className="text-sm font-medium text-gray-600">
                        {user.name.charAt(0)}
                      </span>
                    </div>
                  </div>
                  <div className="ml-3 min-w-0">
                    <p className="text-sm font-semibold truncate">{user.username}</p>
                    <p className="text-sm text-gray-500 truncate">{user.name}</p>
                  </div>
                </div>
                {activeTab === 'followers' ? (
                  <button
                    onClick={() => handleFollowToggle(user.id)}
                    className={`ml-2 text-sm font-semibold px-4 py-1 rounded-md transition-colors ${
                      user.isFollowing
                        ? 'bg-gray-100 text-gray-900 hover:bg-gray-200'
                        : 'bg-blue-500 text-white hover:bg-blue-600'
                    }`}
                  >
                    {user.isFollowing ? '팔로잉' : '팔로우'}
                  </button>
                ) : (
                  <button
                    onClick={() => handleFollowToggle(user.id)}
                    className={`ml-2 text-sm font-semibold px-4 py-1 rounded-md transition-colors ${
                      user.isFollowing
                        ? 'bg-gray-100 text-gray-900 hover:bg-gray-200'
                        : 'bg-blue-500 text-white hover:bg-blue-600'
                    }`}
                  >
                    {user.isFollowing ? '팔로잉' : '팔로우'}
                  </button>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default UserFollower;
