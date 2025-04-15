export default function Home() {
  const socialLoginForKakaoUrl =
    "http://localhost:8090/oauth2/authorization/kakao";
  const redirectUrlAfterSocialLogin = "http://localhost:3000";
  return (
    <div className="flex-1 flex justify-center items-center">
      <a
        href={`${socialLoginForKakaoUrl}?redirectUrl=${redirectUrlAfterSocialLogin}`}
      >
        <span className="font-bold">카카오 로그인</span>
      </a>
    </div>
  );
}
