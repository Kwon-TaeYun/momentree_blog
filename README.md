<div align="center">
  <h1>🌳모먼트리 (Momentree)🌳</h1> 
  <img src="https://github.com/user-attachments/assets/65746376-3b86-40a4-b538-761e83be8261">
  <img src="https://github.com/user-attachments/assets/803a61ca-4793-4d3c-9a70-bacae60910af">
</div>
<br/>

<div>
  <div align="center">
    <h2>📷Moment(순간) + 🌳Tree(나무)</h2> 
  </div>
  <h4> 🌳개인 블로그 형태로 일상 / 사진을 정리할 수 있는 시스템 </h4>
  <h4> 🌳카테고리로 개인 일상 블로그 관리, 사진 모음집처럼 사진만 모아서 관리가 가능한 사진 블로그 </h4>
</div>


<br/>
<br/>

## 목차
1. 프로젝트 개요
2. 팀 소개
3. 프로젝트 주요 기능
4. 기획서, 정의서
5. ERD
6. 프로젝트에서 사용한 기술 스택들
7. 시스템 아키텍처
8. 프로젝트 구조
9. 실행 화면

<br/>
<br/>

# 1. Project Overview (프로젝트 개요)
- 프로젝트 이름: 모먼트리 (Momentree)
- 프로젝트 설명: 일상의 순간들이 모여 성장하는 나무처럼 쌓이는 공간

<br/>
<br/>

# 2. Team Members (팀원 및 팀 소개)
| 권태윤 | 노봉준 | 박혁 | 전병우 | 김동규 |
|:------:|:------:|:------:|:------:|:------:|
| <img src="https://github.com/user-attachments/assets/62c8cb4e-ac08-46c0-a5c7-1d44c58d8f19" alt="권태윤" width="150"> | <img src="https://github.com/user-attachments/assets/156e3f4c-35a6-46e2-a8b4-7b66642b3215" alt="노봉준" width="150"> | <img src="https://github.com/user-attachments/assets/fd5d971f-2d70-4465-8ee9-b1332809d7b0" alt="박혁" width="150"> | <img src="https://github.com/user-attachments/assets/b9ead087-608e-4292-b500-4e3a66dff848" alt="전병우" width="150"> | <img src="https://github.com/user-attachments/assets/314cb918-df22-47fa-874e-fe142e7e7584" alt="김동규" width="150">
| PL | BE/FE | BE/FE | BE/FE | BE/FE |
| [GitHub](https://github.com/Kwon-TaeYun) | [GitHub](https://github.com/pickipi) | [GitHub](https://github.com/Vincentius7) | [GitHub](https://github.com/ddoonge) | [GitHub](https://github.com/Morgan-EE) |
| [Blog](https://github.com/Kwon-TaeYun) | [Blog](https://lefton.tistory.com/) | [Blog](https://velog.io/@vincentius/posts) | [Blog]() | [Blog](https://mmatrix.tistory.com/) |

<br/>
<br/>

## 2-1. Tasks & Responsibilities (작업 및 역할 분담)
|  |  |  |
|-----------------|-----------------|-----------------|
| 권태윤    |  <img src="https://github.com/user-attachments/assets/62c8cb4e-ac08-46c0-a5c7-1d44c58d8f19" alt="권태윤" width="100"> | <ul><li>프로젝트 계획 및 관리</li><li>팀 리딩 및 커뮤니케이션</li><li>커스텀훅 개발</li></ul>     |
| 노봉준   |  <img src="https://github.com/user-attachments/assets/156e3f4c-35a6-46e2-a8b4-7b66642b3215" alt="노봉준" width="100">| <ul><li>메인 페이지 개발</li><li>동아리 만들기 페이지 개발</li><li>커스텀훅 개발</li></ul> |
| 박혁   |  <img src="https://github.com/user-attachments/assets/fd5d971f-2d70-4465-8ee9-b1332809d7b0" alt="박혁" width="100">    |<ul><li>홈 페이지 개발</li><li>로그인 페이지 개발</li><li>동아리 찾기 페이지 개발</li><li>동아리 프로필 페이지 개발</li><li>커스텀훅 개발</li></ul>  |
| 전병우    |  <img src="https://github.com/user-attachments/assets/b9ead087-608e-4292-b500-4e3a66dff848" alt="전병우" width="100">    | <ul><li>회원가입 페이지 개발</li><li>마이 프로필 페이지 개발</li><li>커스텀훅 개발</li></ul>    |
| 김동규    |  <img src="https://github.com/user-attachments/assets/314cb918-df22-47fa-874e-fe142e7e7584" alt="김동규" width="100">    | <ul><li>회원가입 페이지 개발</li><li>마이 프로필 페이지 개발</li><li>커스텀훅 개발</li></ul>    |

<br/>
<br/>

# 3. Key Features (주요 기능)
- **회원 및 인증 관리**:
  - 일반 회원가입/ 로그인
    - 이메일, 비밀번호 등 기본정보를 통해 가입 및 로그인
    - DB에 유저정보 등록
  - 카카오 소셜 로그인 (OAuth2)
    - 별도의 회원가입 없이 카카오 계정으로 로그인
    - OAuth 2.0 기반으로 인증 및 사용자 정보 연동
  - 비밀번호 찾기
    - 이메일 인증을 통해 비밀번호 재설정
  - 마이페이지
    - 회원 정보 수정 및 회원 탈퇴
    
- **게시글 및 콘텐츠 관리**:
  - 게시글 CRUD
    - 게시글 작성, 수정, 삭제
    - 게시글 본문에 여러 장의 이미지를 첨부할 수 있고, 대표 이미지를 통해 썸네일 지정
    - 이미지는 AWS S3에 저장되며, 저장된 이미지의 URL을 반환
  - 게시글 카테고리
    - 기존 카테고리 선택 및 새로운 카테고리 생성
  - 게시글 검색
    - 키워드 기반으로 게시글을 검색
    - 최신순 정렬 및 10개 단위 페이징 처리

- **소셜 기능**:
  - 팔로우
    - 회원 간에 팔로우 및 언팔로우 가능
    - 팔로워/팔로잉 개수 확인 및 해당 사용자 목록 조회
    - 프로필 정보는 팝업 형태로 제공
  - 좋아요
    - 게시글에 좋아요를 누를 수 있고, 좋아요 개수 및 사용자 목록을 확인
  - 댓글 CRUD
    - 게시글에 댓글을 작성, 수정, 삭제

- **기타 기능**:
  - 이미지 관리
    - 게시글 및 프로필 등에 첨부된 이미지는 AWS S3에 저장되어 대용량 이미지 관리에 최적화
  - 통계 및 피드
    - 인기 블로그, 인기 콘텐츠, 최신 콘텐츠 등 통계 정보 제공

<br/>
<br/>

# 4. 기획서, 정의서

## 4.1 기획서
[기획서](https://docs.google.com/document/d/1yqykSqAJP7rT0gRzcH1ejz4d1ZKBfGOBhKH4VKb8skI/edit?usp=sharing)

## 4.2 정의서
[정의서](https://docs.google.com/spreadsheets/d/1FCHJoJ2tc7w20aNp11prWuBEmehtbjFN-n2wbCZb0Ok/edit?gid=0#gid=0)

<br/>
<br/>

# 5. ERD
![Momentree ERD](Momentree_ERD.png)

<br/>
<br/>

# 6. Technology Stack (기술 스택)
## 6.1 Language
|            |                                                                                                                          |
|------------|--------------------------------------------------------------------------------------------------------------------------|
| Java       | <img src="https://img.icons8.com/?size=100&id=13679&format=png&color=000000" alt="Java" width="100">                     | 
| Typescript | <img src="https://img.icons8.com/?size=100&id=uJM6fQYqDaZK&format=png&color=000000" alt="typescipt" width="100">         |
| Javascript | <img src="https://img.icons8.com/?size=100&id=108784&format=png&color=000000" alt="Javascript" width="100"> | 

<br/>

## 6.2 Backend
|          |  |
|----------|-----------------|
| Spring Boot | <img src="https://github.com/user-attachments/assets/c91ae7e0-20db-45a0-ab60-77097cd84e92" alt="Spring Boot" width="100" /> 
| MySQL       |  <img src="https://github.com/user-attachments/assets/693ae058-ab2b-4fc8-a6b6-8b9552dfcf83" alt="MySQL" width="100">   |
| Docker      |  <img src="https://github.com/user-attachments/assets/aed14a22-87ad-4734-bce1-746c8ae4c535" alt="Docker" width="100">    | 5.0.0  |

<br/>

## 6.3 Frontend
|          |  |
|----------|-----------------|
| Next.js |  <img src="https://github.com/user-attachments/assets/0c0c8c2f-9aee-4b25-b88f-e2fe3397b3b7" alt="Next.js" width="100"> | 

<br/>

## 6.4 Cloud Storage
|        |  |
|--------|-----------------|
| AWS S3 |  <img src="https://github.com/user-attachments/assets/e81ea437-de5d-4538-a93b-2cec54da25be" alt="AWS S3" width="100">    |


<br/>

## 6.5 Authentication
|          |  |
|----------|-----------------|
| OAuth2.0 |  <img src="https://github.com/user-attachments/assets/51d38179-4f40-4162-ba72-65019801cf53" alt="OAuth2.0" width="100">    |


<br/>

## 6.6 CI/CD
|         |  |
|---------|-----------------|
| AWS EC2 |  <img src="https://github.com/user-attachments/assets/483abc38-ed4d-487c-b43a-3963b33430e6" alt="git" width="100">    |
| Vercel      |  <img src="https://github.com/user-attachments/assets/32c615cb-7bc0-45cd-91ea-0d1450bfc8a9" alt="git kraken" width="100">    |
| Terraform  |  <img src="https://github.com/user-attachments/assets/34141eb9-deca-416a-a83f-ff9543cc2f9a" alt="Notion" width="100">    |

<br/>

## 6.7 Cooperation
|            |  |
|------------|-----------------|
| GitHub     |  <img src="https://github.com/user-attachments/assets/24e0de28-e2c1-4122-8069-dd599236f8e6" alt="GitHub" width="100">    |
| Creatie.ai |  <img src="https://github.com/user-attachments/assets/47e5853e-ca82-49a5-be01-aa9219836fbc" alt="git kraken" width="100">    |
| Notion     |  <img src="https://github.com/user-attachments/assets/34141eb9-deca-416a-a83f-ff9543cc2f9a" alt="Notion" width="100">    |

<br/>
<br/>

# 7. System Architecture (시스템 아키텍처)

<br/>
<br/>

<img src="https://github.com/user-attachments/assets/20eb8440-8a2d-41d6-b566-a2b85f025ede" alt="시스템아키텍처">    

<br/>
<br/>


# 8. Project Structure (프로젝트 구조) (프론트엔드는 수정 예정)

```
momentree_blog/
├── .github/
│   ├── ISSUE_TEMPLATE           
│   |   ├── custom.md         # 이슈 작성 시 사용되는 템플릿
│   └── workflows         
│       ├── deploy.yml        # 백엔드 CI/CD 시 사용되는 yml 파일
│       ├── gemini-code-review.yml  # PR 시 AI가 코드 점검해주는 yml 파일
|
├── backend/src/main/
│   ├── java/com/likelion/momentreeblog/              
│   |   ├── config        
│   |   |   ├── error         
│   |   |   |    └── GlobalExceptionError.java         # 전체적인 오류들을 한 곳에 모아둔 java 파일
│   |   |   ├── s3Config         
|   |   |   |    └── s3Config.java         # S3 사용 시 설정 정보들
│   |   |   ├── security       #시큐리티 관련 파일들
│   |   |   |    ├── dto
│   |   |   |    |    └── CustomUserDetails.java       
│   |   |   |    ├── exception
│   |   |   |    |    ├── CustomAuthenticationEntryPoint.java
│   |   |   |    |    └── jwtExceptionCode.java      
│   |   |   |    ├── token
│   |   |   |    |    └── jwtAuthenticationToken.java 
│   |   |   |    └── CustomAuthenticationFilter.java           
│   |   |   ├── securityConfig         # 시큐리티 사용 시 설정 정보들
│   |   |   └── swaggerConfig         # swagger api 사용 시 설정 정보들
│   |   ├── domain
│   |   |   ├── blog/blog      
│   |   |   |    ├── controller
│   |   |   |    |    └── BlogApiV1Controller.java
│   |   |   |    ├── dto
│   |   |   |    |    ├── BlogCreateRequestDto.java
│   |   |   |    |    ├── BlogDetailResponseDto.java
│   |   |   |    |    ├── BlogResponseDto.java
│   |   |   |    |    ├── BlogRequestDto.java
│   |   |   |    |    └── BlogUpdateRequestDto.java
│   |   |   |    ├── entity
│   |   |   |    |    └── Blog.java
│   |   |   |    ├── repository
│   |   |   |    |    └── BlogService.java
│   |   |   |    └── service
│   |   |   ├── board       
│   |   |   |    ├── board
│   |   |   |    |    ├── controller
│   |   |   |    |    |   └── BoardApiV1Controller.java
│   |   |   |    |    ├── dto
│   |   |   |    |    |   ├── BoardDetailResponseDto.java
│   |   |   |    |    |   ├── BoardListResponseDto.java
│   |   |   |    |    |   ├── BoardMyBlogResponseDto.java
│   |   |   |    |    |   ├── BoardRequestDto.java
│   |   |   |    |    |   └── BoardResponseDto.java
│   |   |   |    |    ├── entity
│   |   |   |    |    |   └── Board.java
│   |   |   |    |    ├── repository
│   |   |   |    |    |   └── BoardRepository.java
│   |   |   |    |    └── service
│   |   |   |    |        └── BoardService.java
│   |   |   |    ├── category
│   |   |   |    |    ├── controller
│   |   |   |    |    |   └── CategoryController.java
│   |   |   |    |    ├── dto
│   |   |   |    |    |   ├── CategoryCreateRequestDto.java
│   |   |   |    |    |   ├── CategoryResponseDto.java
│   |   |   |    |    |   └── CategoryUpdateRequestDto.java
│   |   |   |    |    ├── entity
│   |   |   |    |    |   └── Category.java
│   |   |   |    |    ├── repository
│   |   |   |    |    |   └── CategoryRepository.java
│   |   |   |    |    └── service
│   |   |   |    |        └── CategoryService.java
│   |   |   |    ├── comment
│   |   |   |    |    ├── dto
│   |   |   |    |    |   ├── CommentDto.java
│   |   |   |    |    |   └── CommentRequestDto.java
│   |   |   |    |    ├── entity
│   |   |   |    |    |   └── Comment.java
│   |   |   |    |    ├── repository
│   |   |   |    |    |   └── CommentRepository.java
│   |   |   |    |    └── service
│   |   |   |    |        └── CommentService.java
│   |   |   |    └── like
│   |   |   |         ├── dto
│   |   |   |         |   └── BoardLikeInfoDto.java
│   |   |   |         ├── entity
│   |   |   |         |   └── Like.java
│   |   |   |         ├── repository
│   |   |   |         |   └── LikeRepository.java
│   |   |   |         └── service
│   |   |   |             └── LikeService.java
│   |   |   ├── photo/photo       
│   |   |   |    ├── controller
│   |   |   |    |    ├── BoardPhotoApiV1Controller.java
│   |   |   |    |    └── ProfilePhotoApiV1Controller.java
│   |   |   |    ├── dto
│   |   |   |    |    ├── board
│   |   |   |    |    |   ├── BoardPhotoResponseDto.java
│   |   |   |    |    |   └── PhotoAlbumDto.java
│   |   |   |    |    └── photo
│   |   |   |    |        └── PhotoUploadResponseDto.java
│   |   |   |    ├── entity
│   |   |   |    |    └── Photo.java
│   |   |   |    ├── photoenum
│   |   |   |    |    └── PhotoType.java
│   |   |   |    ├── repository
│   |   |   |    |    └── PhotoRepository.java
│   |   |   |    └── service
│   |   |   |         └── PhotoService.java
│   |   |   ├── s3       
│   |   |   |    ├── controller
│   |   |   |    |    └── S3ApiV1Controller.java
│   |   |   |    ├── dto
│   |   |   |    |    ├── request
│   |   |   |    |    |   ├── PhotoUploadMultiRequestDto.java
│   |   |   |    |    |   └── PhotoUploadRequestDto.java
│   |   |   |    |    └── response
│   |   |   |    |        ├── PresignedUrlMutiResponseDto.java
│   |   |   |    |        └── PresignedUrlResponseDto.java
│   |   |   |    └── service
│   |   |   |         └── S3V1Service.java
│   |   |   └── user       
│   |   |        ├── follower/entity
│   |   |        |    └── FollowerManagement.java
│   |   |        ├── role/entity
│   |   |        |    └── Role.java
│   |   |        └── user
│   |   |             ├── controller
│   |   |             |   ├── FollowerApiV1Controller.java
│   |   |             |   ├── UserApiV1Controller.java
│   |   |             |   └── UserFindApiV1Controller.java
│   |   |             ├── dto
│   |   |             |   ├── UserDeleteRequest.java
│   |   |             |   ├── UserDto.java
│   |   |             |   ├── UserFollowerDto.java
│   |   |             |   ├── UserLikeDto.java
│   |   |             |   ├── UserLoginDto.java
│   |   |             |   ├── UserLoginResponseDto.java
│   |   |             |   ├── UserResponseDto.java
│   |   |             |   ├── UserSignupDto.java
│   |   |             |   └── UserUpdateDto.java
│   |   |             ├── entity
│   |   |             |   └── User.java
│   |   |             ├── repository
│   |   |             |   ├── FollowerRepository.java
│   |   |             |   ├── UserFindRepository.java
│   |   |             |   └── UserRepository.java
│   |   |             ├── service
│   |   |             |   ├── AuthTokenService.java
│   |   |             |   ├── FollowerService.java
│   |   |             |   ├── FollowerServiceImpl.java
│   |   |             |   ├── UserFindService.java
│   |   |             |   ├── UserFindServiceImpl.java
│   |   |             |   └── UserService.java
│   |   |             └── userenum
│   |   |                 └── UserService.java    
│   |   ├── global
│   |   |   ├── jpa
│   |   |   |   └── BaseEntity.java
│   |   |   ├── rq
│   |   |   |   └── Rq.java
│   |   |   ├── ut
│   |   |   |   └── Ut.java
│   |   |   ├── util
│   |   |   |   ├── jwt
│   |   |   |   |    └── JwtTokenizer.java
│   |   |   |   └── security
│   |   |   |        ├── CustomAuthorizationRequestResolver.java
│   |   |   |        ├── CustomOAuth2AuthenticationSuccessHandler.java
│   |   |   |        ├── CustomOAuth2UserService.java
│   |   |   |        └── SecurityUser.java
│   |   |   └── AppConfig.java    
│   |   ├── main/controller         # 이슈 작성 시 사용되는 템플릿
│   |   └── MomentreeblogApplication.java   # 이슈 작성 시 사용되는 템플릿
|   |
│   └── resources/          
│       ├── applicaion-dev.yml        # 개발 환경 시 사용되는 환경 설정 yml 파일
│       ├── application-prod.yml         # 배포 환경 시 사용되는 환경 설정 yml 파일
│       ├── application-test.yml         # 테스트 케이스 작성 시 사용되는 환경 설정 yml 파일
│       ├── application-secret.yml         # 공개하면 안되는 정보 작성 시 사용되는 환경 설정 yml 파일
│       └── application.yml         # 전체적으로 사용되는 환경 설정 yml 파일
|
│── frontend/    
│   ├── public/
│   |   ├── images/
│   |   |   ├── logo.png
│   |   |   └── momentree-logo.svg
│   |   ├── default-content.jpg
│   |   ├── file.svg
│   |   ├── globe.svg
│   |   ├── kakao_login.svg
│   |   ├── logo.png
│   |   ├── next.svg
│   |   ├── vercel.svg
│   |   └── window.svg        
│   ├── src/
│   |   ├── app/
│   |   |   ├── blog/[id] - page.tsx
│   |   |   ├── boards
│   |   |   |   ├── [boardId]
│   |   |   |   |   ├── edit - page.tsx
│   |   |   |   |   ├── photos - page.tsx 
│   |   |   |   |   └── page.tsx
│   |   |   |   ├── new - page.tsx
│   |   |   |   └── search - page.tsx
│   |   |   ├── home - page.tsx
│   |   |   ├── members
│   |   |   |   ├── edit/[id] - page.tsx
│   |   |   |   ├── find/password - page.tsx
│   |   |   |   ├── login - page.tsx
│   |   |   |   └── signup - page.tsx
│   |   |   ├── mypage
│   |   |   |   ├── account - page.tsx
│   |   |   |   ├── withdraw - page.tsx
│   |   |   |   └── page.tsx
│   |   |   ├── photoList - page.tsx
│   |   |   ├── .env
│   |   |   ├── ClientLayout.tsx
│   |   |   ├── favicon.ico
│   |   |   ├── globals.css
│   |   |   ├── layout.tsx
│   |   |   ├── page.tsx
│   |   |   └── prettierrc.json
│   |   ├── components/
│   |   |   ├── layout/
│   |   |   |   ├── Footer.tsx
│   |   |   |   └── Header.tsx
│   |   |   ├── likeList.tsx
│   |   |   ├── Navigation.tsx
│   |   |   ├── Sidebar.tsx
│   |   |   └── user_follower.tsx
│   |   ├── stores/auth/
│   |   |   └── loginMember.tsx
│   |   └── toastui-i18n.d.ts       
│   ├── .env.development              
│   ├── .env.production               
│   ├── .gitignore              
│   ├── packages.json           
│   ├── next.config.js            
│   ├── tsconfig.json    
|   └── etc ....  
├── infra
│   ├── .gitignore             
│   ├── main.tf            
│   ├── secrets.tf            
│   └── variables.tf                 
├── README.md                # 팀 소개 및 프로젝트 소개
├── .gitignore               # github 커밋 및 push시 안넣는 파일들 , Git 무시 파일 목록
├── package-lock.json        
└── docker-compose.yml       # docker에서 프로젝트와 db를 연결시키기 위한 yml 파일
<br/>

```

# 9. 실행화면 예시
## 0. 메인 페이지
![image](https://github.com/user-attachments/assets/51e704b3-f055-4699-ace7-b3667e8f473d)

## 1. 로그인 / 회원가입
![image](https://github.com/user-attachments/assets/e357298a-115b-4ca1-8b7f-470c91787c19)
![image](https://github.com/user-attachments/assets/4a518ae9-389d-4534-9acc-3414cad42af9)
![image](https://github.com/user-attachments/assets/94531b5d-77d8-4f45-a3ad-d6ee1c29bf1a)

***ex. 회원가입***
<br/>
![1_회원가입_resize](https://github.com/user-attachments/assets/3502d0f4-d2a0-424e-86a0-27af4b5fc70b)
<br/>

***ex. 로그인***
<br/>
![2_로그인-및-좋아요_resize](https://github.com/user-attachments/assets/62747b37-fa75-4075-941e-2e4232d61947)
<br/>
<br/>

## 2. 마이페이지
![image](https://github.com/user-attachments/assets/599eac65-c989-4686-8799-7afecfe1d475)
![image](https://github.com/user-attachments/assets/966fcd87-1ce8-4d05-a547-969c30ed4a08)
![image](https://github.com/user-attachments/assets/d0371998-d97b-40cf-a168-56c3b2338db3)
<br/>
***ex. 마이페이지***
<br/>
![4_마이페이지](https://github.com/user-attachments/assets/7369836f-7d62-44df-bc59-46e49af6f80b)
<br/>
<br/>

## 3. 홈 페이지
![image](https://github.com/user-attachments/assets/03dfac53-293c-4051-ab3d-ad4b88014b14)

## 4. 게시글 작성 페이지
![image](https://github.com/user-attachments/assets/43dfaeeb-9787-453f-b909-5a50b7a23750)
![image](https://github.com/user-attachments/assets/144ab656-59e4-40a0-8545-3c110916421b)


## 5. 나의 나무
![image](https://github.com/user-attachments/assets/7b3dca63-adaa-4f99-8f0c-c979dba00762)

## 6. 게시글 상세 페이지
![image](https://github.com/user-attachments/assets/ac74d45c-f6c9-4cc7-9076-3fed9dd59ee3)
![image](https://github.com/user-attachments/assets/23f30ceb-14db-463a-b096-c99d056a1cbf)
![image](https://github.com/user-attachments/assets/ffc15655-b667-41b5-9d97-8a445bd6fde5)


## 7. 게시글 수정 페이지
![image](https://github.com/user-attachments/assets/acbdb5a6-ff94-4876-b015-697e39d67119)


## 8. 사진첩 페이지
![image](https://github.com/user-attachments/assets/14bce02f-cea4-4a31-9a36-ab55eaaa42f6)
![image](https://github.com/user-attachments/assets/e43941f0-adaf-47c8-b570-ecca435cfc4d)
![image](https://github.com/user-attachments/assets/4565a444-0692-49a2-b662-eae7372210ab)


## 9. 검색 페이지
![image](https://github.com/user-attachments/assets/40ef3ece-3abb-49bf-b199-17a1fcce84a0)
<br/>
***ex. 검색 기능***
<br/>
![3_검색기능-및-좋아요_resize](https://github.com/user-attachments/assets/dac00d4a-412f-4b4d-9471-48e288fec8c9)
<br/>
<br/>


## 10. 블로그 형식으로 보기 페이지
![image](https://github.com/user-attachments/assets/1ccccc4d-88fe-4102-81bc-f84b90827bef)
![image](https://github.com/user-attachments/assets/c39d9278-bf9b-4948-9587-741008e76c6f)


