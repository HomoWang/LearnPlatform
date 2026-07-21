export type GuideLink = {
  label: string;
  href: string;
  note: string;
};

export type DecisionItem = {
  need: string;
  choices: string[];
  tone: "net" | "dba" | "dev" | "butter";
};

export const guideSections = [
  { id: "classification", number: "01", label: "先建立分類方式" },
  { id: "relationships", number: "02", label: "整體產品關係" },
  { id: "work-modes", number: "03", label: "Chat、Cowork 與 Work" },
  { id: "coding-agents", number: "04", label: "Claude Code 與 Codex" },
  { id: "design", number: "05", label: "Claude Design 與 Cowork" },
  { id: "same-prompt", number: "06", label: "同一 Prompt 的差異" },
  { id: "powerpoint", number: "07", label: "PowerPoint 情境" },
  { id: "excel", number: "08", label: "Excel 情境" },
  { id: "interfaces", number: "09", label: "桌面、VS Code、Web、CLI" },
  { id: "skill", number: "10", label: "Skill" },
  { id: "mcp", number: "11", label: "MCP" },
  { id: "skill-vs-mcp", number: "12", label: "Skill 與 MCP" },
  { id: "chooser", number: "13", label: "工具選擇指南" },
  { id: "summary", number: "14", label: "最終濃縮" }
] as const;

export const classificationLayers = [
  {
    number: "第一層",
    title: "AI 助手與平台",
    items: ["Claude", "ChatGPT"],
    tone: "bg-butter/45"
  },
  {
    number: "第二層",
    title: "Agent 或工作模式",
    items: ["Chat", "Claude Cowork", "ChatGPT Work", "Claude Code", "Codex", "Claude Design"],
    tone: "bg-dev-tint"
  },
  {
    number: "第三層",
    title: "操作介面",
    items: ["網頁版", "桌面版", "VS Code 擴充套件", "CLI"],
    tone: "bg-net-tint"
  },
  {
    number: "第四層",
    title: "擴充能力",
    items: ["Skill", "MCP"],
    tone: "bg-dba-tint"
  }
];

export const providerTrees = [
  {
    provider: "Anthropic",
    platform: "Claude",
    tone: "border-dev bg-dev-tint",
    branches: [
      ["Chat", "一般問答、討論、分析與寫作"],
      ["Cowork", "文件、研究、資料整理與多步驟知識工作"],
      ["Claude Code", "程式開發、測試、Git 與自動化"],
      ["Claude Design", "視覺設計、簡報、設計稿與互動原型（研究預覽）"]
    ]
  },
  {
    provider: "OpenAI",
    platform: "ChatGPT",
    tone: "border-net bg-net-tint",
    branches: [
      ["Chat", "一般問答、討論、分析與寫作"],
      ["Work", "研究、文件、資料整理與完整成果交付"],
      ["Codex", "程式開發、修改程式、測試、Git 與自動化"]
    ]
  }
];

export const excelComparison = [
  ["主要目標", "完成可直接交付的試算表", "把資料轉成圖表、報告或設計稿", "建立可重複、可驗證的處理流程"],
  ["適合規模", "單份或少量檔案", "需要視覺呈現的資料", "大量、固定週期或複雜規則"],
  ["典型工作", "整理資料、公式、合併、統計、報告", "資訊圖表、儀表板與簡報版面", "批次工作表、自動轉檔、測試、Web／CLI 工具"],
  ["最終產物", "完成的 Excel 與說明", "視覺化成果或設計方向", "原始碼、驗證結果與輸出檔案"],
  ["優先選擇時機", "這次做好就能交付", "重視品牌、排版與敘事", "下個月還要用同一套規則再做"]
];

export const skillMcpComparison = [
  ["主要用途", "定義工作方法", "連接外部資料與工具"],
  ["回答的問題", "這件事要怎麼做？", "可以用什麼做？"],
  ["比喻", "SOP、工作手冊", "USB-C、工具接頭"],
  ["內容", "步驟、規則、範本、檢查表", "Tools、Resources、Prompts"],
  ["外部系統", "不一定需要", "通常涉及系統或資料來源"]
];

export const decisionItems: DecisionItem[] = [
  { need: "一般問題、討論與分析", choices: ["Claude Chat", "ChatGPT Chat"], tone: "butter" },
  { need: "文件、研究與完整辦公任務", choices: ["Claude Cowork", "ChatGPT Work"], tone: "dba" },
  { need: "程式開發、除錯、測試與 Git", choices: ["Claude Code", "Codex"], tone: "dev" },
  { need: "視覺設計、簡報設計與原型", choices: ["Claude Design"], tone: "net" },
  { need: "邊寫程式邊讓 AI 協助", choices: ["VS Code + Claude Code", "VS Code + Codex"], tone: "net" },
  { need: "Terminal、Linux、SSH 或 CI/CD", choices: ["Claude Code CLI", "Codex CLI"], tone: "dev" },
  { need: "固定執行公司 SOP", choices: ["Skill"], tone: "butter" },
  { need: "連接 GitLab、資料庫、Jira 等系統", choices: ["MCP"], tone: "dba" },
  { need: "單次 Excel／PowerPoint 工作", choices: ["優先考慮 Cowork"], tone: "dba" },
  { need: "重複、批次或需要程式化的文件工作", choices: ["優先考慮 Claude Code 或 Codex"], tone: "dev" },
  { need: "簡報最重視視覺、品牌與排版", choices: ["優先考慮 Claude Design"], tone: "net" }
];

export const finalSummary = [
  ["Claude / ChatGPT", "整體 AI 助手與平台", "平台"],
  ["Chat", "和 AI 對話、詢問及分析", "顧問"],
  ["Cowork / Work", "把整件辦公、研究或文件工作交給 AI", "辦公與專案助理"],
  ["Claude Design", "協助視覺設計、簡報與原型", "設計師"],
  ["Claude Code / Codex", "承接軟體開發及技術工作", "工程師"],
  ["Skill", "告訴 Agent 應按照什麼流程做", "公司 SOP"],
  ["MCP", "讓 Agent 連接資料與工具", "工具箱與系統連接線"],
  ["桌面版 / Web / VS Code / CLI", "操作 Agent 的不同介面", "不同工作場所"]
];

export const officialLinks: GuideLink[] = [
  {
    label: "Claude Cowork",
    href: "https://www.anthropic.com/product/claude-cowork",
    note: "Anthropic 產品介紹"
  },
  {
    label: "Claude Code",
    href: "https://www.anthropic.com/product/claude-code",
    note: "Anthropic 產品介紹"
  },
  {
    label: "Claude Design",
    href: "https://www.anthropic.com/news/claude-design-anthropic-labs",
    note: "Anthropic Labs 研究預覽公告"
  },
  {
    label: "ChatGPT Work 與 Codex",
    href: "https://help.openai.com/en/articles/20001275-chatgpt-work-and-codex",
    note: "OpenAI Help Center"
  },
  {
    label: "Codex",
    href: "https://openai.com/codex/get-started/",
    note: "OpenAI 產品介紹"
  },
  {
    label: "Model Context Protocol",
    href: "https://modelcontextprotocol.io/docs/getting-started/intro",
    note: "MCP 官方文件"
  }
];
