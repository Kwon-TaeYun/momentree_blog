"use client";

import Image from "next/image";
import Link from "next/link";
import {useState, useEffect, useRef} from "react";
import {useParams, useRouter} from "next/navigation";
import {
    HiOutlinePencilAlt,
    HiOutlineTrash,
    HiOutlineDocumentText,
} from "react-icons/hi";
import {
    MdOutlineDateRange,
    MdOutlineRemoveRedEye,
    MdKeyboardArrowDown,
} from "react-icons/md";
import {FaRegComment} from "react-icons/fa";
import {IoPersonOutline, IoImagesOutline} from "react-icons/io5";
import {BiSearch} from "react-icons/bi";

export default function BoardDetailPage() {
    const params = useParams();
    const router = useRouter();
    const boardId = params?.boardId as string;
    const [comment, setComment] = useState("");
    const [showDropdown, setShowDropdown] = useState<boolean>(false);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const [isAuthenticated, setIsAuthenticated] = useState(false); // 로그인 여부
    const [isAuthor, setIsAuthor] = useState(false); // 게시물 작성자 여부
    const [liked, setLiked] = useState(false); // 좋아요 상태
    const [likeCount, setLikeCount] = useState(156); // 좋아요 개수

    // 임시 인증 상태 체크 (실제로는 API 호출 등으로 대체)
    useEffect(() => {
        // 예: 실제 인증 상태 확인 로직
        // checkAuthStatus().then(status => setIsAuthenticated(status));
        setIsAuthenticated(true); // 테스트를 위해 로그인 상태로 설정

        // 현재 로그인한 사용자가 게시물 작성자인지 확인
        // 실제로는 API에서 게시물 정보를 가져올 때 작성자 ID와 현재 사용자 ID를 비교해야 함
        setIsAuthor(true); // 테스트를 위해 작성자가 아닌 것으로 설정
    }, []);

    // 드롭다운 외부 클릭 감지
    useEffect(() => {
        // ... existing code ...
    }, []);

    // 예시 데이터 (실제로는 API로 가져올 것)
    const post = {
        id: boardId,
        title: "2024년 상반기 신제품 출시 안내",
        author: "김민수",
        blogName: "민수의 테크노트",
        date: "2024.03.15 14:30",
        views: 238,
        likes: 156,
        content: `안녕하세요, 2024년 상반기 신제품 출시 일정을 안내드립니다. 이번 신제품은 고객님들의 의견을 적극 반영하여 개발되었으며, 향상된 성능과 디자인으로 여러분을 찾아뵙게 되었습니다.`,
        image:
            "https://images.unsplash.com/photo-1517420704952-d9f39e95b43e?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1170&q=80",
        keyFeatures: [
            "획기적 배터리 성능",
            "새로운 디자인 적용",
            "AI 기능 탑재",
            "사용자 편의성 개선",
        ],
    };

    const comments = [
        {
            id: 1,
            author: "홍길동",
            date: "2024.03.15 15:30",
            content:
                "신제품 출시가 기대되네요. 특히 AI 기능이 어떻게 구현되는지 궁금합니다.",
        },
        {
            id: 2,
            author: "이영희",
            date: "2024.03.15 16:45",
            content:
                "배터리 성능이 향상되었다니 반가운 소식이네요. 실제 사용 시간이 얼마나 되는지 자세히 알고 싶습니다.",
        },
    ];

    const navigation = {
        prev: {id: "이전글", title: "2024년 신년 인사말"},
        next: {id: "다음글", title: "2024년 하반기 전략 회의 결과"},
    };

    const handleSubmitComment = (e: React.FormEvent) => {
        e.preventDefault();
        // 댓글 제출 로직 (API 호출 등)
        console.log("댓글 제출:", comment);
        setComment("");
    };

    // 좋아요 클릭 처리
    const handleLikeClick = () => {
        // 실제로는 API 호출을 통해 좋아요 상태 변경
        if (liked) {
            setLikeCount((prev) => prev - 1);
        } else {
            setLikeCount((prev) => prev + 1);
        }
        setLiked(!liked);
    };

    return (
        <div className="min-h-screen flex flex-col bg-white">

            {/* 메인 콘텐츠 */}
            <main className="flex-grow">
                <div className="max-w-screen-lg mx-auto px-4 py-12">
                    {/* 제목 및 메타 정보 */}
                    <div className="mb-12">
                        <div className="flex justify-between items-start mb-6">
                            <h1 className="text-4xl font-bold text-gray-900 leading-tight">
                                {post.title}
                            </h1>

                            {/* 작성자인 경우 수정/삭제 버튼 */}
                            {isAuthor && (
                                <div className="flex gap-3 ml-4">
                                    <Link
                                        href={`/boards/${boardId}/edit`}
                                        className="flex items-center px-4 py-2 text-sm bg-white border border-gray-300 rounded hover:bg-gray-50 active:bg-gray-100 active:shadow-inner transition-colors"
                                    >
                                        <HiOutlinePencilAlt className="mr-1.5 text-lg"/>
                                        수정
                                    </Link>
                                    <button
                                        className="flex items-center px-4 py-2 text-sm bg-white border border-gray-300 rounded hover:bg-gray-50 active:bg-gray-100 active:shadow-inner transition-colors">
                                        <HiOutlineTrash className="mr-1.5 text-lg"/>
                                        삭제
                                    </button>
                                </div>
                            )}
                        </div>

                        <div className="flex items-center text-gray-500 mb-8">
                            <Link
                                href={`/users/${post.author}`}
                                className="flex items-center justify-center border border-gray-200 rounded-full w-9 h-9 mr-2 hover:border-gray-300 transition-colors"
                            >
                                <IoPersonOutline className="text-gray-500"/>
                            </Link>
                            <Link
                                href={`/users/${post.author}`}
                                className="bg-gradient-to-r from-[#2c714c]/10 to-[#2c714c]/5 px-3 py-1 rounded-md font-medium text-[#2c714c] hover:from-[#2c714c]/20 hover:to-[#2c714c]/10 transition-all mr-4"
                            >
                                {post.blogName}
                            </Link>
                            <span className="flex items-center mr-4">
                <MdOutlineDateRange className="mr-1"/>
                                {post.date}
              </span>
                        </div>

                        {/* 상단 액션 버튼 */}
                        <div className="flex justify-between items-center">
                            <div className="flex items-center space-x-2 text-sm text-gray-500">
                <span className="flex items-center">
                  <MdOutlineRemoveRedEye className="mr-1"/>
                    {post.views}
                </span>
                                <span className="flex items-center">
                  <FaRegComment className="mr-1"/>
                                    {comments.length}
                </span>
                            </div>

                            <div className="flex items-center space-x-3">
                                {/* 좋아요 버튼 */}
                                <button
                                    onClick={handleLikeClick}
                                    className="flex items-center justify-center w-10 h-10 rounded-full border-2 transition-colors active:scale-90 active:shadow-inner hover:shadow-md"
                                    style={{
                                        borderColor: liked ? "#ff6b6b" : "#e9ecef",
                                        color: liked ? "#ff6b6b" : "#868e96",
                                        backgroundColor: liked ? "#fff5f5" : "white",
                                    }}
                                >
                                    {liked ? (
                                        <svg
                                            xmlns="http://www.w3.org/2000/svg"
                                            viewBox="0 0 24 24"
                                            fill="currentColor"
                                            className="w-5 h-5"
                                        >
                                            <path
                                                d="m11.645 20.91-.007-.003-.022-.012a15.247 15.247 0 0 1-.383-.218 25.18 25.18 0 0 1-4.244-3.17C4.688 15.36 2.25 12.174 2.25 8.25 2.25 5.322 4.714 3 7.688 3A5.5 5.5 0 0 1 12 5.052 5.5 5.5 0 0 1 16.313 3c2.973 0 5.437 2.322 5.437 5.25 0 3.925-2.438 7.111-4.739 9.256a25.175 25.175 0 0 1-4.244 3.17 15.247 15.247 0 0 1-.383.219l-.022.012-.007.004-.003.001a.752.752 0 0 1-.704 0l-.003-.001Z"/>
                                        </svg>
                                    ) : (
                                        <svg
                                            xmlns="http://www.w3.org/2000/svg"
                                            fill="none"
                                            viewBox="0 0 24 24"
                                            strokeWidth={1.5}
                                            stroke="currentColor"
                                            className="w-5 h-5"
                                        >
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12Z"
                                            />
                                        </svg>
                                    )}
                                </button>
                                <span className="text-gray-600">{likeCount}</span>

                                {/* 게시글/사진 뷰 선택 */}
                                <div className="flex rounded-md overflow-hidden border border-gray-200 ml-2 shadow-sm">
                                    <button
                                        className="flex items-center gap-1 bg-gray-100 text-gray-700 px-3 py-1.5 text-sm border-0 active:bg-gray-200 transition-colors"
                                        disabled
                                    >
                                        <HiOutlineDocumentText className="text-lg"/>
                                        <span>게시글</span>
                                    </button>
                                    <Link
                                        href={`/boards/${boardId}/photos`}
                                        className="flex items-center gap-1 bg-white text-gray-600 hover:bg-gray-50 active:bg-gray-100 px-3 py-1.5 text-sm border-0 transition-colors"
                                    >
                                        <IoImagesOutline className="text-lg"/>
                                        <span>사진</span>
                                    </Link>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* 구분선 */}
                    <div className="w-full h-px bg-gray-200 mb-8"></div>

                    {/* 게시물 내용 */}
                    <div className="prose max-w-none mb-12">
                        <p className="text-lg leading-relaxed text-gray-800 mb-8">
                            {post.content}
                        </p>

                        <div className="mb-10">
                            <img
                                src={post.image}
                                alt="신제품 이미지"
                                className="w-full rounded-lg"
                            />
                        </div>

                        <div className="mb-8">
                            <p className="font-medium text-lg mb-4">주요 특징:</p>
                            <ul className="list-disc pl-6 space-y-2 text-gray-800">
                                {post.keyFeatures.map((feature, index) => (
                                    <li key={index} className="text-lg">
                                        {feature}
                                    </li>
                                ))}
                            </ul>
                        </div>

                        <div className="text-sm text-gray-500 mt-10 pt-4 border-t border-gray-200">
                            최초 등록일: {post.date}
                        </div>
                    </div>

                    {/* 댓글 섹션 */}
                    <div className="mt-16">
                        <h3 className="text-xl font-bold mb-6">
                            댓글 <span className="text-gray-500">({comments.length})</span>
                        </h3>

                        <div className="space-y-6 mb-8">
                            {comments.map((comment) => (
                                <div
                                    key={comment.id}
                                    className="pt-4 pb-5 border-b border-gray-200"
                                >
                                    <div className="flex justify-between items-center mb-3">
                                        <div className="flex items-center">
                                            <div className="w-8 h-8 bg-gray-300 rounded-full mr-3"></div>
                                            <span className="font-medium">{comment.author}</span>
                                        </div>
                                        <div className="text-sm text-gray-400 flex items-center">
                                            <span>{comment.date}</span>
                                            {/* 댓글 작성자 또는 게시물 작성자만 삭제 가능 */}
                                            {isAuthenticated && (
                                                <button className="ml-2 hover:text-gray-600">×</button>
                                            )}
                                        </div>
                                    </div>
                                    <p className="text-gray-800 pl-11">{comment.content}</p>
                                </div>
                            ))}
                        </div>

                        {/* 댓글 입력 - 로그인한 사용자만 표시 */}
                        {isAuthenticated ? (
                            <form onSubmit={handleSubmitComment}>
                                <div className="border border-gray-300 rounded-md overflow-hidden">
                  <textarea
                      placeholder="댓글을 입력하세요..."
                      value={comment}
                      onChange={(e) => setComment(e.target.value)}
                      className="w-full p-4 outline-none resize-none text-gray-800"
                      rows={3}
                  />
                                </div>
                                <div className="flex justify-end mt-3">
                                    <button
                                        type="submit"
                                        className="px-4 py-2 bg-[#2c714c] text-white text-sm font-medium rounded-md hover:bg-[#225c3d] transition-colors"
                                    >
                                        댓글 작성
                                    </button>
                                </div>
                            </form>
                        ) : (
                            <div className="bg-gray-50 p-4 rounded-lg text-center">
                                <p className="text-gray-600">
                                    댓글을 작성하려면{" "}
                                    <Link
                                        href="/login"
                                        className="text-[#2c714c] hover:underline"
                                    >
                                        로그인
                                    </Link>
                                    이 필요합니다.
                                </p>
                            </div>
                        )}
                    </div>

                    {/* 이전/다음 글 네비게이션 */}
                    <div className="mt-16 border-t border-gray-200 pt-6">
                        <div className="space-y-4">
                            <div className="flex">
                                <span className="w-16 text-gray-500">{navigation.prev.id}</span>
                                <Link href="#" className="text-gray-700 hover:underline">
                                    {navigation.prev.title}
                                </Link>
                            </div>
                            <div className="flex">
                                <span className="w-16 text-gray-500">{navigation.next.id}</span>
                                <Link href="#" className="text-gray-700 hover:underline">
                                    {navigation.next.title}
                                </Link>
                            </div>
                        </div>
                    </div>

                    {/* 목록으로 버튼 */}
                    <div className="flex justify-center mt-10">
                        <button
                            onClick={() => router.push("/boards")}
                            className="px-6 py-2.5 bg-gray-800 text-white font-medium rounded-md hover:bg-gray-700 transition-colors"
                        >
                            목록으로
                        </button>
                    </div>
                </div>
            </main>

        </div>
    );
}