import React, { useState } from 'react';
import Image from 'next/image';

interface UserFollowerProps {
  isOpen: boolean;
  onClose: () => void;
}

interface User {
  id: string;
  name: string;
  username: string;
  imageUrl: string;
  isFollowing: boolean;
}

const UserFollower: React.FC<UserFollowerProps> = ({ isOpen, onClose }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'followers' | 'following'>('followers');
  
  // 팔로워 목록 샘플 데이터 (나를 팔로우하는 사람들)
  const [followers, setFollowers] = useState<User[]>([
    { id: '1', name: 'Gourmet Food Blog', username: 'gourmetfood', imageUrl: '/images/food.jpg', isFollowing: true },
    { id: '2', name: 'Nature Explorer Blog', username: 'natureexplorer', imageUrl: '/images/nature.jpg', isFollowing: true },
    { id: '3', name: 'Asian Business Blog', username: 'asianbiz', imageUrl: '/images/business.jpg', isFollowing: true },
    { id: '4', name: 'Urban Life Blog', username: 'urbanlife', imageUrl: '/images/urban.jpg', isFollowing: true },
    { id: '5', name: 'Business Insights Blog', username: 'bizinsights', imageUrl: '/images/insights.jpg', isFollowing: true },
  ]);

  // 팔로우 목록 샘플 데이터 (내가 팔로우하는 사람들)
  const [following, setFollowing] = useState<User[]>([
    { id: '6', name: 'Tech Review Blog', username: 'techreview', imageUrl: '/images/tech.jpg', isFollowing: true },
    { id: '7', name: 'Travel Stories', username: 'travelstories', imageUrl: '/images/travel.jpg', isFollowing: true },
    { id: '8', name: 'Fitness Guide', username: 'fitguide', imageUrl: '/images/fitness.jpg', isFollowing: true },
  ]);

  // 팔로우/언팔로우 상태 변경 핸들러
  const handleFollowToggle = (id: string) => {
    if (activeTab === 'followers') {
      // 팔로워 탭에서는 삭제(차단)시 목록에서 제거
      setFollowers(followers.filter(user => user.id !== id));
    } else {
      // 팔로우 탭에서는 팔로우/언팔로우 토글
      setFollowing(
        following.map(user => 
          user.id === id 
            ? { ...user, isFollowing: !user.isFollowing } 
            : user
        )
      );
    }
  };

  // 현재 탭에 따른 사용자 목록과 필터링
  const currentUsers = activeTab === 'followers' ? followers : following;
  const filteredUsers = currentUsers.filter(user => 
    user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.username.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* 블러 배경 */}
      <div className="absolute inset-0 bg-black bg-opacity-50 backdrop-blur-sm" onClick={onClose}></div>
      
      {/* 팔로워 모달 */}
      <div className="relative bg-white rounded-xl w-full max-w-[400px] mx-4">
        {/* 헤더 */}
        <div className="flex items-center justify-between px-4 py-2 border-b">
          <button 
            onClick={onClose}
            className="p-2 hover:opacity-50"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
          <div className="flex-1 text-center font-semibold">
            {activeTab === 'followers' ? '팔로워' : '팔로우'}
          </div>
          <div className="w-10"></div>
        </div>

        {/* 탭 */}
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
        
        {/* 검색창 */}
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
        
        {/* 사용자 목록 */}
        <div className="overflow-y-auto max-h-[400px]">
          {filteredUsers.length === 0 ? (
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
                    className="ml-2 text-sm font-semibold text-red-500 hover:text-red-600"
                  >
                    삭제
                  </button>
                ) : (
                  <button
                    onClick={() => handleFollowToggle(user.id)}
                    className={`ml-2 text-sm font-semibold ${
                      user.isFollowing 
                        ? 'text-gray-900 hover:text-gray-600' 
                        : 'text-blue-500 hover:text-blue-600'
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
