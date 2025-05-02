# 모멘트리 (Momentree) 사진 블로그 
![image](https://github.com/user-attachments/assets/3264bbaf-78c7-4471-8568-7b7e3e592059)
![image](https://github.com/user-attachments/assets/803a61ca-4793-4d3c-9a70-bacae60910af)
### Moment(순간) + Tree(나무)
- 개인 블로그 형태로 일상 / 사진을 정리할 수 있는 시스템
- 카테고리로 개인 일상 블로그 관리, 사진 모음집처럼 사진만 모아서 관리가 가능한 사진 블로그

<br/>
<br/>

## 목차
- 1. 프로젝트 개요
- 2. 팀 소개
- 3. 프로젝트 주요 기능
- 4. 기획서, 정의서
- 5. ERD
- 6. 프로젝트에서 사용한 기술 스택들
- 7. 시스템 아키텍처
- 8. 프로젝트 구조
- 9. 실행 화면

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
| <img src="https://github.com/user-attachments/assets/c1c2b1e3-656d-4712-98ab-a15e91efa2da" alt="이동규" width="150"> | <img src="https://github.com/user-attachments/assets/78ec4937-81bb-4637-975d-631eb3c4601e" alt="신유승" width="150"> | <img src="https://github.com/user-attachments/assets/78ce1062-80a0-4edb-bf6b-5efac9dd992e" alt="김나연" width="150"> | <img src="https://github.com/user-attachments/assets/beea8c64-19de-4d91-955f-ed24b813a638" alt="이승준" width="150"> | <img src="https://github.com/user-attachments/assets/beea8c64-19de-4d91-955f-ed24b813a638" alt="이승준" width="150">
| PL | BE | BE | BE | BE |
| [GitHub](https://github.com/LDK1009) | [GitHub](https://github.com/SinYusi) | [GitHub](https://github.com/nay3on) | [GitHub](https://github.com/conconcc) | [GitHub](https://github.com/conconcc) |

<br/>
<br/>

Tasks & Responsibilities (작업 및 역할 분담)
|  |  |  |
|-----------------|-----------------|-----------------|
| 이동규    |  <img src="https://github.com/user-attachments/assets/c1c2b1e3-656d-4712-98ab-a15e91efa2da" alt="이동규" width="100"> | <ul><li>프로젝트 계획 및 관리</li><li>팀 리딩 및 커뮤니케이션</li><li>커스텀훅 개발</li></ul>     |
| 신유승   |  <img src="https://github.com/user-attachments/assets/78ec4937-81bb-4637-975d-631eb3c4601e" alt="신유승" width="100">| <ul><li>메인 페이지 개발</li><li>동아리 만들기 페이지 개발</li><li>커스텀훅 개발</li></ul> |
| 김나연   |  <img src="https://github.com/user-attachments/assets/78ce1062-80a0-4edb-bf6b-5efac9dd992e" alt="김나연" width="100">    |<ul><li>홈 페이지 개발</li><li>로그인 페이지 개발</li><li>동아리 찾기 페이지 개발</li><li>동아리 프로필 페이지 개발</li><li>커스텀훅 개발</li></ul>  |
| 이승준    |  <img src="https://github.com/user-attachments/assets/beea8c64-19de-4d91-955f-ed24b813a638" alt="이승준" width="100">    | <ul><li>회원가입 페이지 개발</li><li>마이 프로필 페이지 개발</li><li>커스텀훅 개발</li></ul>    |

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

# 6. Technology Stack (기술 스택)
## 6.1 Language
|  |  |
|-----------------|-----------------|
| HTML5    |<img src="https://github.com/user-attachments/assets/2e122e74-a28b-4ce7-aff6-382959216d31" alt="HTML5" width="100">| 
| CSS3    |   <img src="https://github.com/user-attachments/assets/c531b03d-55a3-40bf-9195-9ff8c4688f13" alt="CSS3" width="100">|
| Javascript    |  <img src="https://github.com/user-attachments/assets/4a7d7074-8c71-48b4-8652-7431477669d1" alt="Javascript" width="100"> | 

<br/>

## 6.2 Frotend
|  |  |  |
|-----------------|-----------------|-----------------|
| React    |  <img src="https://github.com/user-attachments/assets/e3b49dbb-981b-4804-acf9-012c854a2fd2" alt="React" width="100"> | 18.3.1    |
| StyledComponents    |  <img src="https://github.com/user-attachments/assets/c9b26078-5d79-40cc-b120-69d9b3882786" alt="StyledComponents" width="100">| 6.1.12   |
| MaterialUI    |  <img src="https://github.com/user-attachments/assets/75a46fa7-ebc0-4a9d-b648-c589f87c4b55" alt="MUI" width="100">    | 5.0.0  |
| DayJs    |  <img src="https://github.com/user-attachments/assets/3632d7d6-8d43-4dd5-ba7a-501a2bc3a3e4" alt="DayJs" width="100">    | 1.11.12    |

<br/>

## 6.3 Backend
|  |  |  |
|-----------------|-----------------|-----------------|
| Firebase    |  <img src="https://github.com/user-attachments/assets/1694e458-9bb0-4a0b-8fe6-8efc6e675fa1" alt="Firebase" width="100">    | 10.12.5    |

<br/>

## 6.4 Cooperation
|  |  |
|-----------------|-----------------|
| Git    |  <img src="https://github.com/user-attachments/assets/483abc38-ed4d-487c-b43a-3963b33430e6" alt="git" width="100">    |
| Git Kraken    |  <img src="https://github.com/user-attachments/assets/32c615cb-7bc0-45cd-91ea-0d1450bfc8a9" alt="git kraken" width="100">    |
| Notion    |  <img src="https://github.com/user-attachments/assets/34141eb9-deca-416a-a83f-ff9543cc2f9a" alt="Notion" width="100">    |

<br/>
<br/>

# 7. System Architecture (시스템 아키텍처)

<공란>

<br/>
<br/>

# 8. Project Structure (프로젝트 구조)
```plaintext
project/
├── public/
│   ├── index.html           # HTML 템플릿 파일
│   └── favicon.ico          # 아이콘 파일
├── src/
│   ├── assets/              # 이미지, 폰트 등 정적 파일
│   ├── components/          # 재사용 가능한 UI 컴포넌트
│   ├── hooks/               # 커스텀 훅 모음
│   ├── pages/               # 각 페이지별 컴포넌트
│   ├── App.js               # 메인 애플리케이션 컴포넌트
│   ├── index.js             # 엔트리 포인트 파일
│   ├── index.css            # 전역 css 파일
│   ├── firebaseConfig.js    # firebase 인스턴스 초기화 파일
│   package-lock.json    # 정확한 종속성 버전이 기록된 파일로, 일관된 빌드를 보장
│   package.json         # 프로젝트 종속성 및 스크립트 정의
├── .gitignore               # Git 무시 파일 목록
└── README.md                # 프로젝트 개요 및 사용법
```

<br/>
<br/>

# 9. 실행화면 예시

<공란>
