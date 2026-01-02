<script lang="ts">
  import { base } from '$app/paths';
</script>

<svelte:head>
  <title>서비스 이용약관 - SHIFT</title>
</svelte:head>

<div class="page">
  <header class="page-header">
    <a href="{base}/mypage" class="back-link">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <polyline points="15,18 9,12 15,6"/>
      </svg>
    </a>
    <h1>서비스 이용약관</h1>
  </header>

  <article class="policy-content">
    <section class="policy-section">
      <p class="effective-date">시행일: 2025년 1월 1일</p>
    </section>

    <section class="policy-section">
      <h2>제1조 (목적)</h2>
      <p>이 약관은 SHIFT(이하 "회사")가 제공하는 뉴스 브리핑 서비스(이하 "서비스")의 이용조건 및 절차, 회사와 이용자의 권리·의무 및 책임사항을 규정함을 목적으로 합니다.</p>
    </section>

    <section class="policy-section">
      <h2>제2조 (정의)</h2>
      <ul>
        <li><strong>"서비스"</strong>란 회사가 제공하는 경제 뉴스 브리핑 및 관련 정보 서비스를 의미합니다.</li>
        <li><strong>"이용자"</strong>란 이 약관에 따라 회사가 제공하는 서비스를 이용하는 회원을 말합니다.</li>
        <li><strong>"회원"</strong>이란 회사에 개인정보를 제공하여 회원등록을 한 자로서, 회사의 서비스를 지속적으로 이용할 수 있는 자를 말합니다.</li>
        <li><strong>"아이디(ID)"</strong>란 회원의 식별과 서비스 이용을 위하여 회원이 정하고 회사가 승인하는 문자와 숫자의 조합을 의미합니다.</li>
        <li><strong>"비밀번호"</strong>란 회원이 부여받은 아이디와 일치되는 회원임을 확인하고 회원의 비밀 보호를 위해 회원 자신이 정한 문자와 숫자의 조합을 의미합니다.</li>
      </ul>
    </section>

    <section class="policy-section">
      <h2>제3조 (약관의 효력 및 변경)</h2>
      <ul>
        <li>이 약관은 서비스를 이용하고자 하는 모든 회원에게 적용됩니다.</li>
        <li>회사는 필요한 경우 약관을 변경할 수 있으며, 변경된 약관은 서비스 내 공지사항을 통해 공지합니다.</li>
        <li>회원이 변경된 약관에 동의하지 않는 경우 서비스 이용을 중단하고 탈퇴할 수 있습니다.</li>
      </ul>
    </section>

    <section class="policy-section">
      <h2>제4조 (서비스의 제공 및 변경)</h2>
      <p>회사는 다음과 같은 서비스를 제공합니다.</p>
      <ul>
        <li>경제 뉴스 브리핑 서비스</li>
        <li>뉴스 트렌드 분석 정보 제공</li>
        <li>북마크 및 개인화 기능</li>
        <li>기타 회사가 정하는 서비스</li>
      </ul>
      <p>회사는 서비스의 내용을 변경하거나 중단할 수 있으며, 이 경우 회원에게 공지합니다.</p>
    </section>

    <section class="policy-section">
      <h2>제5조 (서비스 이용시간)</h2>
      <p>서비스 이용시간은 연중무휴, 1일 24시간을 원칙으로 합니다. 다만, 다음 각 호의 경우에는 서비스 이용이 제한될 수 있습니다.</p>
      <ul>
        <li>시스템 정기점검, 서버 증설 및 교체, 네트워크 불안정 등의 시스템 운영상 필요한 경우</li>
        <li>정전, 서비스 설비의 장애, 서비스 이용 폭주 등으로 정상적인 서비스 제공이 불가능한 경우</li>
        <li>기타 천재지변, 국가비상사태 등 불가항력적 사유가 있는 경우</li>
      </ul>
    </section>

    <section class="policy-section">
      <h2>제6조 (회원가입)</h2>
      <ul>
        <li>이용자는 회사가 정한 가입 양식에 따라 회원정보를 기입한 후 이 약관에 동의한다는 의사표시를 함으로써 회원가입을 신청합니다.</li>
        <li>회사는 전항과 같이 회원으로 가입할 것을 신청한 이용자 중 다음 각 호에 해당하지 않는 한 회원으로 등록합니다.
          <ul>
            <li>가입신청자가 이 약관에 의하여 이전에 회원자격을 상실한 적이 있는 경우</li>
            <li>등록 내용에 허위, 기재누락, 오기가 있는 경우</li>
            <li>기타 회원으로 등록하는 것이 회사의 서비스 운영에 현저히 지장이 있다고 판단되는 경우</li>
          </ul>
        </li>
      </ul>
    </section>

    <section class="policy-section">
      <h2>제7조 (회원 탈퇴 및 자격 상실)</h2>
      <ul>
        <li>회원은 회사에 언제든지 탈퇴를 요청할 수 있으며, 회사는 즉시 회원 탈퇴를 처리합니다.</li>
        <li>회원이 다음 각 호의 사유에 해당하는 경우, 회사는 회원자격을 제한 또는 정지시킬 수 있습니다.
          <ul>
            <li>가입 신청 시 허위 내용을 등록한 경우</li>
            <li>다른 사람의 서비스 이용을 방해하거나 그 정보를 도용하는 등 전자거래질서를 위협하는 경우</li>
            <li>서비스를 이용하여 법령과 이 약관이 금지하거나 공서양속에 반하는 행위를 하는 경우</li>
          </ul>
        </li>
      </ul>
    </section>

    <section class="policy-section">
      <h2>제8조 (회원의 의무)</h2>
      <p>회원은 다음 행위를 하여서는 안 됩니다.</p>
      <ul>
        <li>신청 또는 변경 시 허위 내용의 등록</li>
        <li>타인의 정보 도용</li>
        <li>회사가 게시한 정보의 변경</li>
        <li>회사가 정한 정보 이외의 정보(컴퓨터 프로그램 등) 등의 송신 또는 게시</li>
        <li>회사와 기타 제3자의 저작권 등 지적재산권에 대한 침해</li>
        <li>회사 및 기타 제3자의 명예를 손상시키거나 업무를 방해하는 행위</li>
        <li>외설 또는 폭력적인 메시지, 화상, 음성, 기타 공서양속에 반하는 정보를 서비스에 공개 또는 게시하는 행위</li>
      </ul>
    </section>

    <section class="policy-section">
      <h2>제9조 (저작권의 귀속 및 이용제한)</h2>
      <ul>
        <li>회사가 작성한 저작물에 대한 저작권 기타 지적재산권은 회사에 귀속합니다.</li>
        <li>이용자는 서비스를 이용함으로써 얻은 정보 중 회사에게 지적재산권이 귀속된 정보를 회사의 사전 승낙 없이 복제, 송신, 출판, 배포, 방송 기타 방법에 의하여 영리목적으로 이용하거나 제3자에게 이용하게 하여서는 안됩니다.</li>
      </ul>
    </section>

    <section class="policy-section">
      <h2>제10조 (면책조항)</h2>
      <ul>
        <li>회사는 천재지변 또는 이에 준하는 불가항력으로 인하여 서비스를 제공할 수 없는 경우에는 서비스 제공에 관한 책임이 면제됩니다.</li>
        <li>회사는 회원의 귀책사유로 인한 서비스 이용의 장애에 대하여는 책임을 지지 않습니다.</li>
        <li>회사는 서비스를 통해 제공되는 뉴스 및 정보의 정확성, 완전성, 적시성에 대해 보증하지 않으며, 이를 근거로 한 투자 등의 결정에 대해 책임을 지지 않습니다.</li>
        <li>회사는 회원이 서비스를 이용하여 기대하는 수익을 상실한 것에 대하여 책임을 지지 않습니다.</li>
      </ul>
    </section>

    <section class="policy-section">
      <h2>제11조 (분쟁해결)</h2>
      <ul>
        <li>회사는 이용자가 제기하는 정당한 의견이나 불만을 반영하고 그 피해를 보상처리하기 위하여 피해보상처리기구를 설치·운영합니다.</li>
        <li>회사와 이용자 간에 발생한 전자상거래 분쟁에 관한 소송은 제소 당시의 회사의 주소지를 관할하는 법원을 전속관할로 합니다.</li>
      </ul>
    </section>

    <section class="policy-section">
      <h2>부칙</h2>
      <p>이 약관은 2025년 1월 1일부터 시행합니다.</p>
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

  .policy-section li ul {
    margin-top: var(--space-1);
  }

  .policy-section strong {
    color: var(--text-main);
    font-weight: 500;
  }
</style>
