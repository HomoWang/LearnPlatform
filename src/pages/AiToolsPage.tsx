import PageHeader from "../components/PageHeader";
import {
  classificationLayers,
  decisionItems,
  excelComparison,
  finalSummary,
  guideSections,
  officialLinks,
  providerTrees,
  skillMcpComparison
} from "../data/aiTools";

type Tone = "net" | "dba" | "dev" | "butter";

const toneClasses: Record<Tone, string> = {
  net: "border-net bg-net-tint",
  dba: "border-dba bg-dba-tint",
  dev: "border-dev bg-dev-tint",
  butter: "border-teal-400 bg-teal-50"
};

function Section({
  id,
  number,
  title,
  children
}: {
  id: string;
  number: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section id={id} className="scroll-mt-6 pt-9 first:pt-0" aria-labelledby={`${id}-title`}>
      <div className="flex items-center gap-3">
        <span className="flex h-9 w-9 flex-none -rotate-2 items-center justify-center rounded-full border-2 border-ink bg-butter font-hn text-xs shadow-sticker-sm">
          {number}
        </span>
        <h2 id={`${id}-title`} className="section-title min-w-0 flex-1 text-xl">
          {title}
        </h2>
      </div>
      <div className="mt-4">{children}</div>
    </section>
  );
}

function BulletList({ items }: { items: string[] }) {
  return (
    <ul className="mt-3 space-y-2 text-sm leading-6 text-slate-700">
      {items.map((item) => (
        <li key={item} className="flex gap-2">
          <span aria-hidden="true" className="mt-[9px] h-2 w-2 flex-none rounded-full bg-teal-400" />
          <span>{item}</span>
        </li>
      ))}
    </ul>
  );
}

function Note({ children, tone = "butter" }: { children: React.ReactNode; tone?: Tone }) {
  return (
    <div className={`rounded-xl border-l-4 p-4 text-sm leading-6 ${toneClasses[tone]}`}>
      {children}
    </div>
  );
}

function Flow({ steps }: { steps: string[] }) {
  return (
    <ol className="mt-3 flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center" aria-label="工作流程">
      {steps.map((step, index) => (
        <li key={step} className="flex items-center gap-2">
          <span className="rounded-lg border-[1.5px] border-slate-300 bg-white px-3 py-2 text-xs leading-5 text-slate-700">
            {step}
          </span>
          {index < steps.length - 1 ? <span className="text-slate-400" aria-hidden="true">→</span> : null}
        </li>
      ))}
    </ol>
  );
}

function ComparisonTable({
  headers,
  rows,
  caption
}: {
  headers: string[];
  rows: string[][];
  caption: string;
}) {
  return (
    <div className="mt-4 overflow-x-auto rounded-xl border-2 border-ink bg-white">
      <table className="min-w-[720px] w-full border-collapse text-left text-sm">
        <caption className="sr-only">{caption}</caption>
        <thead>
          <tr className="table-head">
            {headers.map((header) => (
              <th key={header} scope="col" className="border-b-2 border-ink px-4 py-3">
                {header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-200">
          {rows.map((row) => (
            <tr key={row[0]} className="align-top">
              {row.map((cell, index) => (
                <td key={`${row[0]}-${index}`} className={`px-4 py-3 leading-6 ${index === 0 ? "font-medium text-ink" : "text-slate-600"}`}>
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function scrollToSection(id: string) {
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  document.getElementById(id)?.scrollIntoView({ behavior: reducedMotion ? "auto" : "smooth", block: "start" });
}

export default function AiToolsPage() {
  return (
    <>
      <PageHeader
        title="AI 工具指南"
        description="一次弄懂平台、工作模式、操作介面與擴充能力：它們不是互相取代，而是在不同層次一起工作。"
        actions={<span className="sticker-tag bg-dba-tint">2026 年 7 月資料</span>}
      />

      <div className="card relative overflow-hidden p-5 sm:p-7">
        <div className="absolute -right-8 -top-8 h-28 w-28 rounded-full border-2 border-dashed border-net bg-net-tint" aria-hidden="true" />
        <div className="relative max-w-4xl">
          <span className="sticker-tag bg-butter/70">先記住這一句</span>
          <h2 className="mt-4 text-2xl leading-relaxed text-ink sm:text-3xl">工作模式說「做什麼」，介面說「在哪裡做」，Skill 與 MCP 說「怎麼擴充」。</h2>
          <p className="mt-3 text-sm leading-7 text-slate-600">
            Claude 與 ChatGPT 是平台；Cowork、Work、Claude Code、Codex、Claude Design 是針對不同成果設計的工作模式或 Agent；桌面版、Web、VS Code、CLI 則是操作入口。
          </p>
        </div>
      </div>

      <div className="mt-6 grid items-start gap-6 xl:grid-cols-[220px_minmax(0,1fr)]">
        <nav className="card p-4 xl:sticky xl:top-6" aria-label="AI 工具指南章節目錄">
          <div className="font-hn text-sm text-ink">頁面目錄</div>
          <ol className="mt-3 grid gap-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-1">
            {guideSections.map((section) => (
              <li key={section.id}>
                <button
                  type="button"
                  onClick={() => scrollToSection(section.id)}
                  className="flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-left text-xs leading-5 text-slate-600 hover:bg-teal-100 hover:text-ink"
                >
                  <span className="font-hn text-teal-700">{section.number}</span>
                  <span>{section.label}</span>
                </button>
              </li>
            ))}
          </ol>
        </nav>

        <div className="min-w-0">
          <Section id="classification" number="01" title="先建立正確的分類方式">
            <p className="text-sm leading-7 text-slate-600">這些名詞不在同一層級。先分成四層，就不會再拿「Codex」和「CLI」直接比較。</p>
            <div className="mt-4 grid gap-4 md:grid-cols-2">
              {classificationLayers.map((layer) => (
                <article key={layer.number} className={`rounded-sticker border-2 border-ink p-4 shadow-sticker-sm ${layer.tone}`}>
                  <span className="text-xs font-medium text-slate-500">{layer.number}</span>
                  <h3 className="mt-1 text-lg text-ink">{layer.title}</h3>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {layer.items.map((item) => (
                      <span key={item} className="rounded-full border-[1.5px] border-slate-300 bg-white px-3 py-1 text-xs text-ink">{item}</span>
                    ))}
                  </div>
                </article>
              ))}
            </div>
            <div className="mt-4 grid gap-3 md:grid-cols-3">
              <Note tone="dev"><b>Cowork、Claude Code、Codex</b><br />主要說明它負責什麼工作。</Note>
              <Note tone="net"><b>桌面版、VS Code、CLI</b><br />主要說明使用者從哪裡操作。</Note>
              <Note tone="dba"><b>Skill、MCP</b><br />主要說明如何擴充流程與外部能力。</Note>
            </div>
          </Section>

          <Section id="relationships" number="02" title="整體產品關係">
            <div className="grid gap-5 lg:grid-cols-2">
              {providerTrees.map((tree) => (
                <article key={tree.provider} className={`rounded-sticker border-2 p-5 shadow-sticker ${tree.tone}`}>
                  <div className="text-xs tracking-[0.16em] text-slate-500">{tree.provider}</div>
                  <h3 className="mt-1 text-2xl text-ink">{tree.platform}</h3>
                  <ul className="mt-4 space-y-3 border-l-2 border-ink/25 pl-5">
                    {tree.branches.map(([name, description]) => (
                      <li key={name} className="relative rounded-xl border-[1.5px] border-slate-300 bg-white p-3 before:absolute before:-left-[22px] before:top-5 before:w-5 before:border-t-2 before:border-slate-300">
                        <b className="text-sm text-ink">{name}</b>
                        <p className="mt-1 text-xs leading-5 text-slate-600">{description}</p>
                      </li>
                    ))}
                  </ul>
                </article>
              ))}
            </div>
            <div className="mt-4"><Note>Claude 不等於 Claude Code；ChatGPT 也不等於 Codex。前者是整體平台，後者是平台中的開發 Agent。Cowork 與 Work 偏完整知識工作；Claude Design 偏視覺設計與原型。</Note></div>
          </Section>

          <Section id="work-modes" number="03" title="Chat、Cowork 與 Work">
            <div className="grid gap-4 lg:grid-cols-3">
              <article className="card p-5">
                <span className="sticker-tag bg-butter/60">顧問</span>
                <h3 className="mt-3 text-lg">Chat</h3>
                <p className="mt-2 text-sm leading-6 text-slate-600">適合問問題、討論想法、寫作、分析資料、規劃方案與取得建議。核心是「對話與分析」。</p>
                <Flow steps={["提出問題", "AI 回答", "繼續追問"]} />
              </article>
              <article className="card p-5">
                <span className="sticker-tag bg-dba-tint">辦公與專案助理</span>
                <h3 className="mt-3 text-lg">Claude Cowork</h3>
                <p className="mt-2 text-sm leading-6 text-slate-600">把一項完整、多步驟工作交給 Agent，而不只是問一個問題。</p>
                <BulletList items={["文件整理與研究彙整", "跨 Excel、Word、PDF 處理", "建立報告、試算表與簡報", "完成一整套辦公流程"]} />
              </article>
              <article className="card p-5">
                <span className="sticker-tag bg-net-tint">綜合工作 Agent</span>
                <h3 className="mt-3 text-lg">ChatGPT Work</h3>
                <p className="mt-2 text-sm leading-6 text-slate-600">適合較長時間的研究、多步驟任務、跨檔案整理與正式成果交付。</p>
                <BulletList items={["研究與分析", "文件、表格、簡報與報告", "連接工具與檔案後完成任務", "依方案及工作區設定提供能力"]} />
              </article>
            </div>
            <div className="mt-4"><Note tone="dba"><b>典型 Cowork 流程：</b>讀取資料夾中的 Excel、Word、PDF → 整理與分析 → 建立主管報告 → 產出簡報與試算表。</Note></div>
          </Section>

          <Section id="coding-agents" number="04" title="Claude Code 與 Codex">
            <div className="card p-5 sm:p-6">
              <div className="flex flex-wrap gap-2">
                <span className="sticker-tag bg-dev-tint">Claude Code = Anthropic 的工程師</span>
                <span className="sticker-tag bg-net-tint">Codex = OpenAI 的工程師</span>
              </div>
              <p className="mt-4 text-sm leading-7 text-slate-600">兩者都是開發 Agent。它們不只回答程式問題，也能在取得適當權限後，實際讀取專案、修改檔案並使用開發工具。</p>
              <div className="mt-4 grid gap-x-8 md:grid-cols-2">
                <BulletList items={["讀取整個專案與搜尋程式碼", "修改多個檔案、新增功能、修正 Bug", "重構程式與分析錯誤訊息", "建立自動化工具"]} />
                <BulletList items={["執行 Terminal 指令與測試", "使用 Git 與檢查差異", "根據驗證結果反覆修正", "在權限邊界內操作工具"]} />
              </div>
            </div>
            <div className="mt-4 grid gap-4 md:grid-cols-2">
              <Note tone="dba"><b>Cowork：</b>比較像「直接完成這份辦公文件」。</Note>
              <Note tone="dev"><b>Claude Code / Codex：</b>比較像「建立一個可以重複處理文件的程式」。</Note>
            </div>
            <p className="mt-4 text-sm leading-7 text-slate-600">開發 Agent 也能操作 Excel、PowerPoint、PDF，但通常採工程方式，例如 Python、Node.js、C#、Shell、openpyxl、python-pptx、Office Open XML 或其他程式庫。</p>
          </Section>

          <Section id="design" number="05" title="Claude Design 與 Cowork">
            <div className="grid gap-4 lg:grid-cols-3">
              <article className="card border-dba bg-dba-tint p-5"><h3 className="text-lg">Cowork</h3><p className="mt-2 text-sm leading-6 text-slate-600">重視資料完整、數字正確、步驟完成與可交付成果。</p><p className="mt-4 font-hn text-base">把事情做完</p></article>
              <article className="card border-net bg-net-tint p-5"><h3 className="text-lg">Claude Design</h3><p className="mt-2 text-sm leading-6 text-slate-600">重視視覺層級、排版、字體、色彩、品牌、圖表、敘事、原型與互動。</p><p className="mt-4 font-hn text-base">把成果設計好</p></article>
              <article className="card border-dev bg-dev-tint p-5"><h3 className="text-lg">Claude Code / Codex</h3><p className="mt-2 text-sm leading-6 text-slate-600">重視把需求變成可執行、可測試、可維護的程式或系統。</p><p className="mt-4 font-hn text-base">把需求開發出來</p></article>
            </div>
            <details className="card mt-4 p-5">
              <summary className="cursor-pointer font-hn text-base text-ink">用「活動發表會」看三者分工</summary>
              <div className="mt-4 grid gap-5 md:grid-cols-3">
                <div><b className="text-sm text-dba-deep">Cowork</b><BulletList items={["整理參加名單與預算", "製作流程表與活動規劃", "整理 Excel", "建立初版簡報"]} /></div>
                <div><b className="text-sm text-net-deep">Claude Design</b><BulletList items={["設計活動主視覺", "設計簡報版型", "統一品牌色與排版", "製作網頁或 App 原型"]} /></div>
                <div><b className="text-sm text-dev-deep">Claude Code / Codex</b><BulletList items={["建立活動網站", "建立報名系統", "串接資料庫", "自動寄信與報表程式"]} /></div>
              </div>
            </details>
          </Section>

          <Section id="same-prompt" number="06" title="相同 Prompt 在不同工具中的差異">
            <blockquote className="card border-teal-400 bg-teal-50 p-5 font-hn text-lg leading-8">「修改這份 Excel，新增毛利率、保留格式、修正公式並建立圖表。」</blockquote>
            <div className="mt-4 grid gap-4 lg:grid-cols-2">
              <article className="card p-5"><h3 className="text-lg">Cowork 的典型方式</h3><Flow steps={["讀取 Excel", "理解用途", "修改欄位與公式", "保持可讀性", "輸出 Excel"]} /><BulletList items={["關注這份報表是否完成", "公式與內容是否正確、好懂", "是否可以直接交付", "適合單次、臨時或少量檔案"]} /></article>
              <article className="card p-5"><h3 className="text-lg">開發 Agent 的典型方式</h3><Flow steps={["分析結構", "撰寫腳本", "程式化修改", "執行驗證", "保留原始碼"]} /><BulletList items={["關注規則能否程式化", "是否能重跑、批次與自動驗證", "是否需要保存原始碼", "是否需要 Git 版本管理"]} /></article>
            </div>
            <div className="mt-4 grid gap-3 sm:grid-cols-2"><Note tone="dba"><b>只需完成這一次</b><br />優先考慮 Cowork</Note><Note tone="dev"><b>未來要重複執行</b><br />優先考慮 Claude Code 或 Codex</Note></div>
            <p className="mt-4 text-xs leading-6 text-slate-500">這是一般判斷，不是絕對限制。結果仍會受模型、工具、Skill、權限、檔案格式與 Prompt 清晰度影響。</p>
          </Section>

          <Section id="powerpoint" number="07" title="PowerPoint 情境比較">
            <blockquote className="rounded-xl border-2 border-dashed border-slate-300 bg-white p-4 text-sm leading-6 text-slate-700">範例：「保留公司模板，重新整理第 3 到第 8 頁，統一字體並優化圖表。」</blockquote>
            <div className="mt-4 grid gap-4 lg:grid-cols-3">
              <article className="card p-5"><h3 className="text-dba-deep">Cowork</h3><BulletList items={["修改現有簡報與整理內容", "縮短文字、匯入 Excel 數據", "完成跨文件流程", "交付這一份簡報"]} /></article>
              <article className="card p-5"><h3 className="text-net-deep">Claude Design</h3><BulletList items={["重新設計視覺風格與版型", "統一品牌色與資訊層級", "優化圖表與簡報敘事", "做出展示效果更強的版本"]} /></article>
              <article className="card p-5"><h3 className="text-dev-deep">Claude Code / Codex</h3><BulletList items={["批次修改大量簡報", "自動替換文字或公司名稱", "從資料庫定期產生簡報", "檢查字體、頁數或物件並接入排程／CI"]} /></article>
            </div>
          </Section>

          <Section id="excel" number="08" title="Excel 情境比較">
            <ComparisonTable
              caption="Cowork、Claude Design、開發 Agent 的 Excel 使用情境比較"
              headers={["比較面向", "Cowork", "Claude Design", "Claude Code / Codex"]}
              rows={excelComparison}
            />
          </Section>

          <Section id="interfaces" number="09" title="桌面版、VS Code、Web 與 CLI">
            <Note tone="net">這些不是不同種類的 Agent，而是操作介面。同一位「工程師」可以在不同工作場所出現。</Note>
            <div className="mt-4 grid gap-4 md:grid-cols-2">
              {[
                ["桌面版", "工程師的任務管理辦公室", ["圖形化操作", "管理多個任務與查看進度", "查看修改結果", "使用滑鼠與視覺介面"]],
                ["VS Code 擴充套件", "工程師坐在程式編輯器旁邊", ["一邊寫程式一邊協作", "直接查看程式碼與 Diff", "修改檔案與執行 Terminal", "處理錯誤與測試結果"]],
                ["Web", "透過瀏覽器進入工作空間", ["不安裝程式即可使用", "跨裝置與雲端環境", "一般問答、研究或遠端任務", "實際能力依產品與方案而異"]],
                ["CLI", "用純文字命令指揮工程師", ["Terminal、PowerShell、Linux、SSH", "遠端伺服器與自動化腳本", "CI/CD 與其他命令列工具", "適合可重複、可組合的流程"]]
              ].map(([title, metaphor, items]) => (
                <article key={title as string} className="card p-5">
                  <h3 className="text-lg">{title as string}</h3>
                  <p className="mt-1 text-xs text-slate-500">{metaphor as string}</p>
                  <BulletList items={items as string[]} />
                </article>
              ))}
            </div>
            <p className="mt-4 text-sm leading-7 text-slate-600"><b>CLI</b> 全名是 Command-Line Interface（命令列介面）。本頁的 <code className="rounded bg-slate-100 px-1.5 py-0.5">claude</code> 與 <code className="rounded bg-slate-100 px-1.5 py-0.5">codex</code> 分別指 Claude Code CLI 與 Codex CLI；但 git、npm、dotnet、docker、python 也都是 CLI 工具。</p>
          </Section>

          <Section id="skill" number="10" title="Skill：告訴 Agent 怎麼做">
            <div className="grid gap-4 lg:grid-cols-[1fr_1.2fr]">
              <article className="card p-5"><p className="text-sm leading-7 text-slate-600">Skill 提供工作流程、SOP、規則、檢查表、範本與特定領域操作方法。</p><p className="mt-4 font-hn text-xl">Skill = 公司 SOP 或工作手冊</p></article>
              <article className="card p-5"><h3 className="text-base">.NET 安全檢查 Skill 範例</h3><ol className="mt-3 grid gap-2 text-sm text-slate-600 sm:grid-cols-2">{["執行套件弱點掃描", "執行 SonarQube", "檢查 SQL Injection", "檢查硬編碼密碼", "執行單元測試", "按公司格式產出報告"].map((item, index) => <li key={item} className="rounded-lg bg-slate-50 px-3 py-2"><span className="mr-2 text-teal-700">{index + 1}.</span>{item}</li>)}</ol></article>
            </div>
          </Section>

          <Section id="mcp" number="11" title="MCP：讓 Agent 連接外部能力">
            <div className="card p-5 sm:p-6">
              <div className="flex flex-wrap items-baseline gap-3"><h3 className="text-xl">Model Context Protocol</h3><span className="text-sm text-slate-500">模型上下文協定</span></div>
              <p className="mt-3 text-sm leading-7 text-slate-600">MCP 是讓 AI 應用程式連接外部系統的開放標準，例如 GitHub、GitLab、Jira、資料庫、本機檔案、Notion、Calendar 或公司內部 API。</p>
              <div className="mt-4 grid gap-3 md:grid-cols-3">
                <Note tone="dev"><b>Tools</b><br />讓模型呼叫可執行的操作。</Note>
                <Note tone="dba"><b>Resources</b><br />提供應用程式可讀取的情境資料。</Note>
                <Note tone="net"><b>Prompts</b><br />提供可重複使用的互動模板。</Note>
              </div>
              <p className="mt-4 font-hn text-lg">MCP = AI 的工具接頭、連接線或 USB-C</p>
            </div>
          </Section>

          <Section id="skill-vs-mcp" number="12" title="Skill 與 MCP 的差異">
            <ComparisonTable caption="Skill 與 MCP 比較" headers={["比較面向", "Skill", "MCP"]} rows={skillMcpComparison} />
            <div className="card mt-4 p-5">
              <h3 className="text-base">實際搭配：處理 GitLab Issue</h3>
              <div className="mt-4 grid gap-5 md:grid-cols-2">
                <div><b className="text-sm text-teal-700">Skill 負責公司規定的做法</b><ol className="mt-3 space-y-1.5 text-sm text-slate-600">{["讀取 Issue", "建立分支", "修改程式", "執行測試", "建立 Merge Request", "禁止直接合併正式分支"].map((item, index) => <li key={item}>{index + 1}. {item}</li>)}</ol></div>
                <div><b className="text-sm text-dba-deep">MCP 負責實際連接 GitLab</b><BulletList items={["讀取 GitLab Issue", "建立分支", "查詢 Pipeline", "建立 Merge Request", "更新 Issue"]} /></div>
              </div>
              <div className="mt-5 rounded-xl bg-slate-50 p-4 text-center text-sm leading-7"><b>Claude Code / Codex</b><br />├─ Skill：知道公司規定的做法<br />└─ MCP：能連接並操作 GitLab</div>
            </div>
          </Section>

          <Section id="chooser" number="13" title="工具選擇指南">
            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
              {decisionItems.map((item) => (
                <article key={item.need} className={`rounded-sticker border-2 p-4 shadow-sticker-sm ${toneClasses[item.tone]}`}>
                  <h3 className="text-sm leading-6 text-ink">{item.need}</h3>
                  <div className="mt-3 flex flex-wrap gap-2">{item.choices.map((choice) => <span key={choice} className="rounded-full border-[1.5px] border-ink bg-white px-3 py-1 text-xs">{choice}</span>)}</div>
                </article>
              ))}
            </div>
          </Section>

          <Section id="summary" number="14" title="最終濃縮">
            <div className="card overflow-hidden p-0">
              <div className="bg-butter/55 px-5 py-4"><h3 className="text-xl">一張卡片帶走全部關係</h3></div>
              <div className="grid gap-px bg-slate-200 sm:grid-cols-2">
                {finalSummary.map(([name, meaning, role]) => (
                  <div key={name} className="bg-card p-5"><div className="flex flex-wrap items-center gap-2"><b className="text-sm text-ink">{name}</b><span className="rounded-full bg-slate-100 px-2 py-0.5 text-[11px] text-slate-500">{role}</span></div><p className="mt-2 text-sm leading-6 text-slate-600">{meaning}</p></div>
                ))}
              </div>
            </div>
          </Section>

          <section className="mt-9" aria-labelledby="official-sources-title">
            <h2 id="official-sources-title" className="section-title text-xl">官方參考資料</h2>
            <div className="card mt-4 p-5">
              <div className="grid gap-3 sm:grid-cols-2">
                {officialLinks.map((link) => (
                  <a key={link.href} href={link.href} target="_blank" rel="noreferrer" className="rounded-xl border-[1.5px] border-slate-200 bg-white p-3 transition hover:border-ink">
                    <span className="block text-sm font-medium text-ink">{link.label} ↗</span>
                    <span className="mt-1 block text-xs text-slate-500">{link.note}</span>
                  </a>
                ))}
              </div>
              <div className="mt-5 rounded-xl border-2 border-dashed border-teal-400 bg-teal-50 p-4 text-xs leading-6 text-slate-600">
                <b className="text-ink">版本與供應提醒：</b> ChatGPT Work 正依方案與工作區逐步提供；Claude Design 目前是研究預覽。功能、介面、支援平台、方案與地區可能隨版本更新，請以官方文件與帳號中實際可用項目為準。
              </div>
            </div>
          </section>
        </div>
      </div>
    </>
  );
}
