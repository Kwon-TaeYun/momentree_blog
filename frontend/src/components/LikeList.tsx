import React, { useState } from 'react';
import Image from 'next/image';

interface LikeListProps {
  isOpen: boolean;
  onClose: () => void;
  postId: string;
}

interface LikeUser {
  id: string;
  name: string;
  username: string;
  imageUrl: string;
  isFollowing: boolean;
}

const LikeList: React.FC<LikeListProps> = ({ isOpen, onClose, postId }) => {
  const [searchQuery, setSearchQuery] = useState('');
  
  // 좋아요 누른 사용자 목록 샘플 데이터
  const [likeUsers, setLikeUsers] = useState<LikeUser[]>([
    { id: '1', name: '권태윤', username: 'taeyun_gwon1118', imageUrl: '/images/user1.jpg', isFollowing: false },
    { id: '2', name: '김기한', username: 'until__01', imageUrl: '/images/user2.jpg', isFollowing: false },
    { id: '3', name: '조현성', username: 'hyeon.sg', imageUrl: '/images/user3.jpg', isFollowing: false },
    { id: '4', name: '이도진', username: 'soonsoo0_0', imageUrl: '/images/user4.jpg', isFollowing: false },
  ]);

  // 팔로우/언팔로우 토글
  const handleFollowToggle = (userId: string) => {
    setLikeUsers(
      likeUsers.map(user =>
        user.id === userId
          ? { ...user, isFollowing: !user.isFollowing }
          : user
      )
    );
  };

  // 검색어로 사용자 필터링
  const filteredUsers = likeUsers.filter(user =>
    user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.username.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* 블러 배경 */}
      <div className="absolute inset-0 bg-black bg-opacity-50 backdrop-blur-sm" onClick={onClose}></div>
      
      {/* 좋아요 모달 */}
      <div className="relative bg-white w-full max-w-[400px] mx-4 rounded-xl overflow-hidden">
        {/* 헤더 */}
        <div className="flex items-center h-12 border-b">
          <button 
            onClick={onClose}
            className="px-4"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <div className="flex-1 text-center font-semibold">게시물</div>
          <div className="w-14"></div>
        </div>

        <div className="text-center py-4 border-b">
          <h2 className="text-base font-semibold">좋아요</h2>
          <p className="text-sm text-gray-500">이 게시물의 총 좋아요 수는 15명입니다.</p>
        </div>
        
        {/* 검색창 */}
        <div className="px-4 py-2">
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
        
        {/* 좋아요 누른 사용자 목록 */}
        <div className="overflow-y-auto max-h-[400px]">
          {filteredUsers.length === 0 ? (
            <div className="text-center py-6 text-gray-500 text-sm">
              {searchQuery ? '검색 결과가 없습니다' : '좋아요가 없습니다'}
            </div>
          ) : (
            filteredUsers.map((user) => (
              <div key={user.id} className="flex items-center justify-between px-4 py-2">
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
                <button
                  onClick={() => handleFollowToggle(user.id)}
                  className="ml-2"
                >
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/>
                  </svg>
                </button>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default LikeList; 