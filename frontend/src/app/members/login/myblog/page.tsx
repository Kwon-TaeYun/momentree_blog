"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import UserFollower from "../../../../components/user_follower";
import { useGlobalLoginMember } from "@/stores/auth/loginMember";

interface Post {
  id: number;
  title: string;
  content: string;
  createdAt: string;
  likes: number;
  comments: number;
  currentMainPhotoUrls?: {
    key: string;
    url: string;
  }[];
  currentMainPhotoUrl?: string;
  currentProfilePhoto?: {
    url: string;
    key: string;
  };
}

interface UserInfo {
  id: number;
  name: string;
  email: string;
  username?: string;
  blogName?: string;
  viewCount?: number;
  profilePhoto?: {
    url: string;
    key: string;
  };
  profileImage?: string;
  posts: number;
  visitors: number;
  followers: number;
  following: number;
}

export default function MyBlogPage() {
  const router = useRouter();
  const [userInfo, setUserInfo] = useState<UserInfo>({
    id: 0,
    name: "",
    email: "",
    username: "",
    profilePhoto: undefined,
    posts: 0,
    visitors: 0,
    followers: 0,
    following: 0,
    viewCount: 0,
    blogName: "",
  });

  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");

  const [isFollowerModalOpen, setIsFollowerModalOpen] = useState(false);
  const [activeFollowTab, setActiveFollowTab] = useState<
    "followers" | "following"
  >("followers");

  useEffect(() => {
    const fetchUserInfo = async () => {
      try {
        const userResponse = await fetch(
          `${
            process.env.NEXT_PUBLIC_API_BASE_URL ||
            "https://api.blog.momentree.site"
          }/api/v1/members/me`,
          {
            credentials: "include",
          }
        );

        if (!userResponse.ok) {
          throw new Error("로그인이 필요합니다.");
        }

        const userData = await userResponse.json();

        // 프로필 사진 호출 제거 - API 엔드포인트가 존재하지 않음
        // 대신 게시글 데이터에서 프로필 사진 정보를 가져와서 사용
        setUserInfo({
          id: userData.id,
          name: userData.name || "사용자",
          email: userData.email || "",
          profilePhoto: undefined, // fetchMyPosts에서 설정
          profileImage: userData.profileImage || "",
          posts: 0,
          visitors: 0,
          followers: 0,
          following: 0,
          viewCount: userData.viewCount || 0,
          blogName: userData.blogName || "",
        });
      } catch (err) {
        console.error("사용자 정보 로딩 오류:", err);
        // 로그인 페이지로 리디렉션
        router.push("/members/login");
      }
    };

    fetchUserInfo();
  }, [router]);

  // 내 게시글 가져오기
  useEffect(() => {
    const fetchMyPosts = async () => {
      if (userInfo.id === 0) return; // 사용자 정보가 로드되지 않았으면 스킵

      try {
        console.log("게시글 데이터 요청 시작, 유저 ID:", userInfo.id);
        const res = await fetch(
          `${
            process.env.NEXT_PUBLIC_API_BASE_URL ||
            "https://api.blog.momentree.site"
          }/api/v1/boards/searchById`,
          {
            method: "GET",
            credentials: "include",
          }
        );

        const data = await res.json();
        console.log("게시글 응답 데이터 전체:", data);

        if (!res.ok) {
          setErrorMsg(data.message || "게시글을 불러오는 데 실패했습니다.");
        } else if (Array.isArray(data.content)) {
          console.log("게시글 개수:", data.content.length);

          // 백엔드 응답 구조에 맞게 처리
          const processedPosts = data.content.map((post: any) => {
            const urls = post.currentMainPhotoUrls || [];
            console.log(`게시글 ${post.id}의 메인 이미지:`, urls);

            return {
              id: post.id,
              title: post.title,
              content: post.content || "",
              createdAt: post.createdAt || new Date().toISOString(),
              likes: post.likeCount || 0,
              comments: post.commentCount || 0,
              currentMainPhotoUrls: urls,
              currentMainPhotoUrl: urls[0]?.url,
              currentProfilePhoto: post.currentProfilePhoto,
            };
          });

          console.log("처리된 게시글:", processedPosts);
          setPosts(processedPosts);

          // 첫 번째 게시물의 프로필 사진 정보를 사용자 정보에 설정
          if (
            processedPosts.length > 0 &&
            processedPosts[0].currentProfilePhoto
          ) {
            setUserInfo((prev) => ({
              ...prev,
              posts: processedPosts.length,
              profilePhoto: processedPosts[0].currentProfilePhoto,
            }));
          } else {
            setUserInfo((prev) => ({
              ...prev,
              posts: processedPosts.length,
            }));
          }

          // 조회수 증가
          setUserInfo((prev) => ({
            ...prev,
            viewCount: (prev.viewCount || 0) + 1,
          }));
        } else {
          setErrorMsg("게시글이 존재하지 않습니다.");
        }
      } catch (err) {
        console.error("게시글 로딩 오류:", err);
        setErrorMsg("서버 오류가 발생했습니다.");
      } finally {
        setLoading(false);
      }
    };

    fetchMyPosts();
  }, [userInfo.id]);

  // 팔로워/팔로잉 정보를 가져오는 함수 추가
  useEffect(() => {
    const fetchFollowStats = async () => {
      if (userInfo.id === 0) return; // 사용자 정보가 로드되지 않았으면 스킵

      try {
        const followersResponse = await fetch(
          `${
            process.env.NEXT_PUBLIC_API_BASE_URL ||
            "https://api.blog.momentree.site"
          }/api/v1/follows/members/${userInfo.id}/followers/counts`,
          { credentials: "include" }
        );

        // 팔로잉 수 가져오기

        const followingResponse = await fetch(
          `${
            process.env.NEXT_PUBLIC_API_BASE_URL ||
            "https://api.blog.momentree.site"
          }/api/v1/follows/members/${userInfo.id}/followings/counts`,
          { credentials: "include" }
        );

        if (followersResponse.ok && followingResponse.ok) {
          const followersCount = await followersResponse.json();
          const followingCount = await followingResponse.json();

          setUserInfo((prev) => ({
            ...prev,
            followers: followersCount,
            following: followingCount,
          }));
        }
      } catch (error) {
        console.error("팔로우 정보 로딩 오류:", error);
      }
    };

    fetchFollowStats();
  }, [userInfo.id]);

  const handleFollowClick = (tab: "followers" | "following") => {
    setActiveFollowTab(tab);
    setIsFollowerModalOpen(true);
  };

  const handlePostClick = (postId: number) => {
    router.push(`/boards/${postId}`);
  };

  if (loading && userInfo.id === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <p className="text-xl text-gray-600">로딩 중...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white text-black">
      <main className="max-w-7xl mx-auto py-8 px-6">
        <div className="flex flex-col md:flex-row gap-8">
          <div className="w-full md:w-72 shrink-0">
            <div className="bg-white border border-gray-100 rounded-lg p-6 mb-6">
              <div className="flex flex-col items-center">
                <div className="w-32 h-32 relative rounded-full overflow-hidden mb-4 bg-gray-200">
                  {userInfo.profilePhoto?.url ? (
                    <Image
                      src={userInfo.profilePhoto.url}
                      alt="프로필 이미지"
                      fill
                      sizes="128px"
                      className="object-cover"
                      priority
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-4xl font-semibold text-gray-400">
                      {userInfo.name.charAt(0)}
                    </div>
                  )}
                </div>
                <h2 className="text-xl font-bold mb-1">
                  {userInfo.name}의 나무
                </h2>
                <p className="text-xs text-gray-400 mb-2">
                  {userInfo.blogName}
                </p>
                <p className="text-gray-500 mb-4">{userInfo.email}</p>

                <div className="w-full flex flex-col space-y-3 mb-4">
                  <InfoRow label="게시글" value={userInfo.posts} />
                  <InfoRow label="조회수" value={userInfo.viewCount || 0} />
                  <InfoRow
                    label="팔로워"
                    value={userInfo.followers}
                    onClick={() => handleFollowClick("followers")}
                    isClickable={true}
                  />
                  <InfoRow
                    label="팔로잉"
                    value={userInfo.following}
                    onClick={() => handleFollowClick("following")}
                    isClickable={true}
                  />
                </div>

                <button
                  onClick={() => router.push(`/blog/${userInfo.id}`)} // userInfo.id를 사용하여 blog/[id]로 이동
                  className="w-full bg-green-50 text-green-700 font-medium py-2 px-4 rounded-md flex items-center justify-center gap-2"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <rect
                      x="3"
                      y="3"
                      width="18"
                      height="18"
                      rx="2"
                      ry="2"
                    ></rect>
                    <line x1="12" y1="8" x2="12" y2="16"></line>
                    <line x1="8" y1="12" x2="16" y2="12"></line>
                  </svg>
                  블로그 형식으로 보기
                </button>
              </div>
            </div>
          </div>

          <div className="flex-1">
            <h1 className="text-2xl font-bold mb-6">나의 순간들</h1>

            {loading && <p>로딩 중...</p>}
            {errorMsg && <p className="text-red-500">{errorMsg}</p>}

            <div className="space-y-8">
              {posts.length === 0 && !loading && !errorMsg ? (
                <div className="text-center py-10 bg-gray-50 rounded-lg">
                  <p className="text-gray-500">
                    아직 작성한 게시글이 없습니다.
                  </p>
                  <button
                    onClick={() => router.push("/boards/new")}
                    className="mt-4 px-4 py-2 bg-[#2c714c] text-white rounded-md hover:bg-[#225c3d] transition-colors"
                  >
                    첫 게시글 작성하기
                  </button>
                </div>
              ) : (
                posts.map((post) => (
                  <div
                    key={post.id}
                    className="border border-gray-100 rounded-lg overflow-hidden cursor-pointer hover:shadow-md transition-shadow duration-200"
                    onClick={() => handlePostClick(post.id)}
                  >
                    <div className="w-full h-80 bg-gray-100 relative">
                      {post.currentMainPhotoUrl ? (
                        <Image
                          src={post.currentMainPhotoUrl}
                          alt={post.title}
                          fill
                          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                          className="object-cover"
                          priority
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gray-200">
                          <span className="text-gray-400">
                            이미지가 없습니다
                          </span>
                        </div>
                      )}
                    </div>

                    <div className="p-6">
                      <h2 className="text-xl font-bold mb-2">{post.title}</h2>
                      <p className="text-gray-800 mb-4">{post.content}</p>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-500 text-sm">
                          {post.createdAt}
                        </span>
                        <div className="flex items-center space-x-4">
                          <LikeIcon count={post.likes} />
                          <CommentIcon count={post.comments} />
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </main>

      <UserFollower
        isOpen={isFollowerModalOpen}
        onClose={() => setIsFollowerModalOpen(false)}
        userId={userInfo.id.toString()}
        initialTab={activeFollowTab}
      />
    </div>
  );
}

function InfoRow({
  label,
  value,
  onClick,
  isClickable = false,
}: {
  label: string;
  value: string | number;
  onClick?: () => void;
  isClickable?: boolean;
}) {
  return (
    <div
      className={`flex justify-between ${
        isClickable ? "cursor-pointer hover:bg-gray-50" : ""
      }`}
      onClick={onClick}
    >
      <p className="text-black">{label}</p>
      <p className="font-bold">{value}</p>
    </div>
  );
}

function LikeIcon({ count }: { count: number }) {
  return (
    <div className="flex items-center text-red-500">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        className="h-5 w-5 mr-1"
        viewBox="0 0 20 20"
        fill="currentColor"
      >
        <path
          fillRule="evenodd"
          d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z"
          clipRule="evenodd"
        />
      </svg>
      <span>{count}</span>
    </div>
  );
}

function CommentIcon({ count }: { count: number }) {
  return (
    <div className="flex items-center text-blue-500">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        className="h-5 w-5 mr-1"
        viewBox="0 0 20 20"
        fill="currentColor"
      >
        <path
          fillRule="evenodd"
          d="M18 10c0 3.866-3 7-8 7a8.841 8.841 0 01-4.083-.98L2 17l1.338-3.123C2.493 12.767 2 11.434 2 10c0-3.866 3-7 8-7s8 3.134 8 7zM7 9H5v2h2V9zm8 0h-2v2h2V9zM9 9h2v2H9V9z"
          clipRule="evenodd"
        />
      </svg>
      <span>{count}</span>
    </div>
  );
}
