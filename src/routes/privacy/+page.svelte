<script lang="ts">
  import { base } from '$app/paths';
</script>

<svelte:head>
  <title>개인정보처리방침 - SHIFT</title>
</svelte:head>

<div class="page">
  <header class="page-header">
    <a href="{base}/mypage" class="back-link">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <polyline points="15,18 9,12 15,6"/>
      </svg>
    </a>
    <h1>개인정보처리방침</h1>
  </header>

  <article class="policy-content">
    <section class="policy-section">
      <p class="effective-date">시행일: 2025년 1월 1일</p>
    </section>

    <section class="policy-section">
      <h2>1. 개인정보의 처리 목적</h2>
      <p>SHIFT(이하 "회사")는 다음의 목적을 위하여 개인정보를 처리합니다. 처리하고 있는 개인정보는 다음의 목적 이외의 용도로는 이용되지 않으며, 이용 목적이 변경되는 경우에는 별도의 동의를 받는 등 필요한 조치를 이행할 예정입니다.</p>
      <ul>
        <li><strong>회원가입 및 관리:</strong> 회원 가입의사 확인, 회원제 서비스 제공에 따른 본인 식별·인증, 회원자격 유지·관리, 서비스 부정이용 방지, 각종 고지·통지 목적으로 개인정보를 처리합니다.</li>
        <li><strong>서비스 제공:</strong> 콘텐츠 제공, 맞춤서비스 제공을 목적으로 개인정보를 처리합니다.</li>
        <li><strong>서비스 개선:</strong> 서비스 이용 통계 분석, 서비스 개선 및 신규 서비스 개발을 목적으로 개인정보를 처리합니다.</li>
      </ul>
    </section>

    <section class="policy-section">
      <h2>2. 개인정보의 처리 및 보유 기간</h2>
      <p>회사는 법령에 따른 개인정보 보유·이용기간 또는 정보주체로부터 개인정보를 수집 시에 동의받은 개인정보 보유·이용기간 내에서 개인정보를 처리·보유합니다.</p>
      <ul>
        <li><strong>회원 가입 및 관리:</strong> 회원 탈퇴 시까지. 다만, 관계 법령 위반에 따른 수사·조사 등이 진행 중인 경우에는 해당 수사·조사 종료 시까지</li>
        <li><strong>서비스 이용 기록:</strong> 3년 (통신비밀보호법)</li>
      </ul>
    </section>

    <section class="policy-section">
      <h2>3. 처리하는 개인정보의 항목</h2>
      <p>회사는 다음의 개인정보 항목을 처리하고 있습니다.</p>
      <ul>
        <li><strong>필수항목:</strong> 아이디, 비밀번호, 이메일 주소</li>
        <li><strong>선택항목:</strong> 성별, 연령대</li>
        <li><strong>자동 수집항목:</strong> 서비스 이용 기록, 접속 로그, 기기 정보</li>
      </ul>
    </section>

    <section class="policy-section">
      <h2>4. 개인정보의 제3자 제공</h2>
      <p>회사는 정보주체의 개인정보를 제1조에서 명시한 범위 내에서만 처리하며, 정보주체의 동의, 법률의 특별한 규정 등 개인정보 보호법 제17조 및 제18조에 해당하는 경우에만 개인정보를 제3자에게 제공합니다.</p>
      <p>현재 회사는 개인정보를 제3자에게 제공하고 있지 않습니다.</p>
    </section>

    <section class="policy-section">
      <h2>5. 개인정보의 파기</h2>
      <p>회사는 개인정보 보유기간의 경과, 처리목적 달성 등 개인정보가 불필요하게 되었을 때에는 지체없이 해당 개인정보를 파기합니다.</p>
      <ul>
        <li><strong>파기절차:</strong> 불필요한 개인정보 및 개인정보파일은 개인정보보호책임자의 책임 하에 내부 방침 절차에 따라 파기합니다.</li>
        <li><strong>파기방법:</strong> 전자적 파일 형태의 정보는 기록을 재생할 수 없는 기술적 방법을 사용합니다.</li>
      </ul>
    </section>

    <section class="policy-section">
      <h2>6. 정보주체의 권리·의무 및 행사방법</h2>
      <p>정보주체는 회사에 대해 언제든지 개인정보 열람·정정·삭제·처리정지 요구 등의 권리를 행사할 수 있습니다.</p>
      <ul>
        <li>개인정보 열람 요구</li>
        <li>오류 등이 있을 경우 정정 요구</li>
        <li>삭제 요구</li>
        <li>처리정지 요구</li>
      </ul>
      <p>권리 행사는 서비스 내 '마이페이지' 또는 서면, 이메일을 통하여 하실 수 있으며, 회사는 이에 대해 지체없이 조치하겠습니다.</p>
    </section>

    <section class="policy-section">
      <h2>7. 개인정보의 안전성 확보 조치</h2>
      <p>회사는 개인정보의 안전성 확보를 위해 다음과 같은 조치를 취하고 있습니다.</p>
      <ul>
        <li><strong>개인정보 암호화:</strong> 이용자의 비밀번호는 암호화되어 저장 및 관리됩니다.</li>
        <li><strong>접속기록의 보관:</strong> 개인정보처리시스템에 접속한 기록을 최소 1년 이상 보관·관리하고 있습니다.</li>
        <li><strong>개인정보에 대한 접근 제한:</strong> 개인정보를 처리하는 데이터베이스시스템에 대한 접근권한의 부여, 변경, 말소를 통하여 개인정보에 대한 접근통제를 위하여 필요한 조치를 하고 있습니다.</li>
      </ul>
    </section>

    <section class="policy-section">
      <h2>8. 개인정보 보호책임자</h2>
      <p>회사는 개인정보 처리에 관한 업무를 총괄해서 책임지고, 개인정보 처리와 관련한 정보주체의 불만처리 및 피해구제 등을 위하여 아래와 같이 개인정보 보호책임자를 지정하고 있습니다.</p>
      <div class="contact-info">
        <p><strong>개인정보 보호책임자</strong></p>
        <p>이메일: privacy@shift-news.kr</p>
      </div>
    </section>

    <section class="policy-section">
      <h2>9. 개인정보 처리방침 변경</h2>
      <p>이 개인정보처리방침은 2025년 1월 1일부터 적용됩니다. 변경 시에는 변경사항을 서비스 공지사항을 통하여 공지합니다.</p>
    </section>
  </article>
</div>

<style>
  .page {
    display: flex;
    flex-direction: column;
    gap: var(--space-4);
  }

  .page-header {
    display: flex;
    align-items: center;
    gap: var(--space-2);
  }

  .back-link {
    width: 32px;
    height: 32px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: var(--text-sub);
    border-radius: var(--radius);
    transition: all 0.2s var(--ease);
  }

  .back-link:hover {
    color: var(--text-main);
    background: var(--card);
  }

  .back-link svg {
    width: 20px;
    height: 20px;
  }

  .page-header h1 {
    font-size: 20px;
    font-weight: 700;
    color: var(--text-main);
  }

  .policy-content {
    background: var(--card);
    border: 1px solid var(--border);
    border-radius: var(--radius-lg);
    padding: var(--space-4);
  }

  .policy-section {
    margin-bottom: var(--space-5);
  }

  .policy-section:last-child {
    margin-bottom: 0;
  }

  .effective-date {
    font-size: 13px;
    color: var(--text-sub);
    padding-bottom: var(--space-3);
    border-bottom: 1px solid var(--border);
  }

  .policy-section h2 {
    font-size: 16px;
    font-weight: 600;
    color: var(--text-main);
    margin-bottom: var(--space-2);
  }

  .policy-section p {
    font-size: 14px;
    color: var(--text-body);
    line-height: 1.7;
    margin-bottom: var(--space-2);
  }

  .policy-section ul {
    margin-left: var(--space-3);
    margin-bottom: var(--space-2);
  }

  .policy-section li {
    font-size: 14px;
    color: var(--text-body);
    line-height: 1.7;
    margin-bottom: var(--space-1);
    position: relative;
    padding-left: var(--space-2);
  }

  .policy-section li::before {
    content: "•";
    position: absolute;
    left: 0;
    color: var(--text-sub);
  }

  .policy-section strong {
    color: var(--text-main);
    font-weight: 500;
  }

  .contact-info {
    background: var(--card-hover);
    border-radius: var(--radius);
    padding: var(--space-3);
    margin-top: var(--space-2);
  }

  .contact-info p {
    margin-bottom: var(--space-1);
  }

  .contact-info p:last-child {
    margin-bottom: 0;
  }
</style>
