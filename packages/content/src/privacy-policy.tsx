import type { ReactNode } from "react";

const serviceName = "동글";
const effectiveDate = "2026년 4월 22일";

const collectedItems = [
  {
    category: "관리자 및 동아리 회장 계정",
    items: "이름, 로그인 ID, 비밀번호, 권한, 휴대폰 번호, 소속 동아리, 계정 생성/수정/삭제 일시",
    purpose: "관리자 및 동아리 회장 계정 생성, 인증, 권한 관리, 서비스 운영",
    retention: "계정 삭제 또는 권한 회수 시까지",
  },
  {
    category: "동아리 등록 및 관리",
    items:
      "동아리명, 분과, 동아리방 위치, 소개, 주요 활동, 태그, 모집 여부와 모집 기간, SNS 주소, 동아리 아이콘, 회장 이름과 휴대폰 번호",
    purpose: "동아리 등록, 공개 페이지 표시, 동아리 정보 관리, 모집 정보 제공",
    retention: "동아리 삭제 또는 공개 종료 시까지",
  },
  {
    category: "활동보고서",
    items: "보고서 제목, 내용, 첨부 이미지, 작성/수정/삭제 일시, 동아리 식별 정보",
    purpose: "동아리 활동보고서 작성, 조회, 수정, 삭제 및 활동 이력 관리",
    retention: "보고서 삭제 또는 동아리 삭제 시까지",
  },
  {
    category: "인증 및 접속 정보",
    items: "Access Token, Refresh Token, 접속 일시, 요청 경로, 브라우저 및 기기 정보, IP 주소",
    purpose: "로그인 상태 유지, 접근 권한 확인, 보안 사고 예방, 오류 분석",
    retention: "토큰 만료 시까지 또는 보안 로그 보관 목적 달성 시까지",
  },
  {
    category: "메인 배너 및 이미지",
    items: "배너 이미지, 이미지 URL, 게시 시작/종료 일시, 사용 여부",
    purpose: "서비스 화면 구성, 배너 노출 관리, 업로드 이미지 관리",
    retention: "배너 삭제 또는 이미지 삭제 시까지",
  },
];

const processors = [
  {
    name: "Amazon Web Services, Inc.",
    work: "서비스 인프라 운영, 이미지 파일 저장 및 전송",
    items: "서비스 데이터, 이미지 파일, 접속 로그",
  },
  {
    name: "Sentry",
    work: "오류 모니터링 및 장애 분석",
    items: "오류 발생 경로, 브라우저 및 기기 정보, IP 주소 등 기술 정보",
  },
];

function PolicySection({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <section className="space-y-4">
      <h2 className="text-xl font-semibold text-zinc-900">{title}</h2>
      <div className="space-y-3 text-sm leading-7 text-zinc-700">{children}</div>
    </section>
  );
}

function PolicyTable({
  columns,
  rows,
}: {
  columns: string[];
  rows: Array<Record<string, string>>;
}) {
  return (
    <div className="overflow-x-auto rounded-md border border-zinc-200">
      <table className="min-w-full divide-y divide-zinc-200 text-left text-sm">
        <thead className="bg-zinc-50 text-zinc-700">
          <tr>
            {columns.map((column) => (
              <th key={column} scope="col" className="whitespace-nowrap px-4 py-3 font-semibold">
                {column}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-zinc-200 bg-white text-zinc-700">
          {rows.map((row, index) => (
            <tr key={index}>
              {columns.map((column) => (
                <td key={column} className="min-w-40 px-4 py-3 align-top">
                  {row[column]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function PrivacyPolicy({ actions }: { actions?: ReactNode }) {
  return (
    <article className="mx-auto w-full max-w-4xl space-y-10 py-12">
      {actions ? (
        <nav aria-label="개인정보처리방침 이동" className="flex flex-wrap items-center gap-2">
          {actions}
        </nav>
      ) : null}
      <header className="space-y-3 border-b border-zinc-200 pb-6">
        <p className="text-sm font-medium text-primary">개인정보처리방침</p>
        <h1 className="text-3xl font-bold tracking-normal text-zinc-950">
          {serviceName} 개인정보처리방침
        </h1>
        <p className="text-sm leading-7 text-zinc-600">
          {serviceName}은 개인정보 보호법 제30조에 따라 정보주체의 개인정보를 보호하고 관련 고충을
          신속하게 처리하기 위하여 다음과 같이 개인정보처리방침을 수립·공개합니다.
        </p>
        <p className="text-sm text-zinc-500">시행일: {effectiveDate}</p>
      </header>

      <PolicySection title="1. 개인정보의 처리 목적">
        <p>
          {serviceName}은 동아리 정보 제공, 동아리 등록 및 관리, 관리자와 동아리 회장 계정 운영,
          활동보고서 관리, 서비스 보안과 장애 대응을 위하여 개인정보를 처리합니다. 처리 목적이
          변경되는 경우에는 관련 법령에 따라 별도의 동의를 받는 등 필요한 조치를 이행합니다.
        </p>
      </PolicySection>

      <PolicySection title="2. 처리하는 개인정보 항목과 보유 기간">
        <PolicyTable
          columns={["구분", "처리 항목", "처리 목적", "보유 기간"]}
          rows={collectedItems.map((item) => ({
            구분: item.category,
            "처리 항목": item.items,
            "처리 목적": item.purpose,
            "보유 기간": item.retention,
          }))}
        />
        <p>
          법령에 따라 보존할 필요가 있는 경우에는 해당 법령에서 정한 기간 동안 보관할 수 있습니다.
          백업, 감사, 보안 사고 대응을 위한 자료는 목적 달성 후 지체 없이 파기합니다.
        </p>
      </PolicySection>

      <PolicySection title="3. 개인정보의 제3자 제공">
        <p>
          {serviceName}은 정보주체의 개인정보를 처리 목적 범위 내에서만 이용하며, 법령에 근거가 있거나
          정보주체의 동의를 받은 경우를 제외하고 개인정보를 제3자에게 제공하지 않습니다.
        </p>
      </PolicySection>

      <PolicySection title="4. 개인정보 처리업무의 위탁">
        <p>
          안정적인 서비스 제공을 위해 다음과 같이 개인정보 처리업무를 외부 서비스에 위탁할 수 있습니다.
          위탁업무의 내용이나 수탁자가 변경되는 경우 이 방침을 통해 공개합니다.
        </p>
        <PolicyTable
          columns={["수탁자", "위탁업무", "처리 항목"]}
          rows={processors.map((processor) => ({
            수탁자: processor.name,
            위탁업무: processor.work,
            "처리 항목": processor.items,
          }))}
        />
      </PolicySection>

      <PolicySection title="5. 개인정보의 국외 이전">
        <p>
          오류 모니터링 서비스가 활성화된 경우 Sentry로 오류 진단 정보가 국외 이전될 수 있습니다.
          이전되는 정보는 오류 분석에 필요한 기술 정보로 제한되며, 서비스 장애 대응과 품질 개선을
          목적으로 처리됩니다.
        </p>
      </PolicySection>

      <PolicySection title="6. 개인정보의 파기 절차 및 방법">
        <p>
          개인정보는 보유 기간의 경과, 처리 목적 달성, 계정 또는 동아리 삭제 등 개인정보가 불필요하게
          되었을 때 지체 없이 파기합니다. 전자적 파일은 복구할 수 없도록 삭제하고, 출력물 등 종이
          문서는 분쇄 또는 소각합니다.
        </p>
      </PolicySection>

      <PolicySection title="7. 정보주체의 권리와 행사 방법">
        <p>
          정보주체는 언제든지 개인정보 열람, 정정, 삭제, 처리정지, 동의 철회를 요청할 수 있습니다.
          동아리 회장과 관리자는 서비스 내 계정 및 동아리 관리 기능을 통해 일부 정보를 직접 확인하거나
          수정할 수 있으며, 직접 처리가 어려운 경우 개인정보 보호 담당자에게 요청할 수 있습니다.
        </p>
      </PolicySection>

      <PolicySection title="8. 개인정보의 안전성 확보 조치">
        <p>
          {serviceName}은 개인정보 보호를 위해 접근 권한 관리, 인증 토큰의 HttpOnly 쿠키 저장, 전송구간
          암호화, 접근 기록 관리, 오류 및 보안 이벤트 모니터링 등 필요한 기술적·관리적 보호조치를
          적용합니다.
        </p>
      </PolicySection>

      <PolicySection title="9. 개인정보 자동 수집 장치">
        <p>
          {serviceName}은 로그인 상태 유지와 인증 처리를 위해 Access Token 및 Refresh Token 쿠키를
          사용할 수 있습니다. 해당 쿠키는 인증과 접근 권한 확인을 위한 필수 쿠키이며, 브라우저 설정을
          통해 쿠키를 차단할 수 있으나 이 경우 로그인이 필요한 기능 이용이 제한될 수 있습니다.
        </p>
      </PolicySection>

      <PolicySection title="10. 개인정보 보호책임자 및 문의">
        <p>
          개인정보 처리에 관한 문의, 권리 행사 요청, 피해 구제 요청은 아래 담당자에게 연락할 수
          있습니다.
        </p>
        <ul className="list-disc space-y-1 pl-5">
          <li>개인정보 보호책임자: 동글 운영팀</li>
          <li>문의: privacy@dongle.wavers.kr</li>
        </ul>
      </PolicySection>

      <PolicySection title="11. 권익침해 구제 방법">
        <p>
          정보주체는 개인정보 침해에 대한 상담이나 구제를 위해 개인정보침해신고센터, 개인정보분쟁조정위원회,
          대검찰청, 경찰청 등 관련 기관에 문의할 수 있습니다.
        </p>
      </PolicySection>

      <PolicySection title="12. 개인정보처리방침의 변경">
        <p>
          이 개인정보처리방침은 시행일부터 적용됩니다. 법령, 서비스, 처리 항목, 위탁업무 변경이 있는
          경우 변경 내용을 서비스 화면에 공지하거나 이 페이지를 통해 공개합니다.
        </p>
      </PolicySection>
    </article>
  );
}
