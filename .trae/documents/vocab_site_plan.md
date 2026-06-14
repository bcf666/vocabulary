# 背单词网站 实现计划（基于九大记忆规律 · Version 2）

> 生成日期：2026-06-14
> 工作目录：`/workspace`
> 核心指导原则：间隔重复 + 提取练习 + 深度编码 + 双重编码 + 生成效应 + 情境编码 + 交错学习 + 元认知 + 心流注意力

---

## 0. 设计哲学：每一条规律都要有代码对应

| 规律 | 对应程序模块（而非"功能"） | 可量化验收 |
| --- | --- | --- |
| 1. 间隔重复 | `algorithm/scheduler.ts`（拒绝固定时间表，走 SM-2 / FSRS-4.5 简化版） | 每个单词的 `nextReviewAt` 因本次"容易/困难"而**动态变化 |
| 2. 测试效应 | 卡片默认是**问题态**；答案需主动点/按空格才揭示；题面支持 5 种模态 | 用户不能"浏览"而不测试 |
| 3. 精细加工 | `components/DeepCard.tsx`：**默认先显示英英释义/同义词/词根拆解，中文释义放在第二屏需手动点开**；含用户自由涂鸦助记区（`doodle`） | 中文释义不可默认显示 |
| 4. 双重编码 | `hooks/useSpeech.ts` 强制朗读先行；`components/ImageSlot.tsx` 占位 + 用户上传；未来接入发音评分 | 每个单词必须先听再看 |
| 5. 生成效应 | `pages/Output.tsx`：原创造句 + 词块拼装；每次复习组结束后**强制进入一个输出任务**才能解锁下一组 | 不输入句子就不前进 |
| 6. 情境编码 | `pages/Article.tsx`：粘贴文章→自动提取生词→原句绑定；`components/SpeakAndRate.tsx`：语音跟读评分（Web Speech API 简易版） | 每个生词可回溯到原文句子 |
| 7. 交错学习 | `hooks/useInterleave.ts`：**新:旧 ≈ 3:7 混洗；易错词按权重超额采样** | 顺序不可设置为"只刷新词" |
| 8. 元认知 | `components/JolRate.tsx`（学习前预估 难中易 + 复习后判断是否掌握）；自动生成弱点 Boss 战 | 每个词有个人记忆曲线 |
| 9. 心流与注意力 | `components/FlowTimer.tsx` 限时闪卡 3–5 秒、专注计时、连击进度条、阶段动画（陌生人→点头之交→挚友） | 有紧迫感；有可视化进步 |

---

## 1. 项目调研结论

- `/workspace` 当前仅含默认 `index.html`，无既有代码、无构建配置、无依赖。
- 用户要求**高度定制化**：不做"最小工具"，要做一个**强制提取、强制编码、强制输出**的闭环学习系统。
- 第一阶段仍然是纯前端 SPA + localStorage 持久化；AI 生成故事与图像匹配作为 Phase 2（需外部 API）。

## 2. 技术选型

| 层次 | 选择 | 备注 |
| --- | --- | --- |
| 构建 | **Vite 5 + React 18 + TypeScript** | — |
| 样式 | **Tailwind CSS 3** | 自定义主题（见第 6 节） |
| 状态管理 | **Zustand + persist** | 跨组件共享所有学习状态 |
| 路由 | **React Router v6** | 7 个主页面 + 若干子视图 |
| 图标 | **lucide-react** | 保持图标风格统一 |
| 算法 | **SM-2 简化自适应版（Phase 1）/ FSRS-4.5（Phase 2）** | 拒绝固定 1/3/7/15 天时间表 |
| 数据 | `src/data/words.json`（内置 500 词演示词库）+ 用户导入 JSON | 含英英释义、词根、例句 |
| 语音 | **Web Speech API**（浏览器内可用；离线降级） | 强制发音先行；跟读评分 |
| 涂鸦助记 | **Canvas 2D**（用户自由手绘） | 存 DataURL |

## 3. 页面与信息架构

```
src/App.tsx
├── /                   Dashboard（今日队列·今日目标·今日新:旧比例·连击·心流曲线）
├── /learn              学习新词（先听音 → 英英释义 → 词根 → 猜词 → 用户涂鸦 → 预估难中易）
├── /review             复习-测试循环（5 种提取模态自动混洗）
├── /output             输出闭环（造句 / 词块拼装）
├── /article            真实语料导入（粘贴文章 → 自动提取生词 → 绑定原句）
├── /boss               弱点 Boss 战（连对 3 次出池）
├── /stats              统计与个人记忆曲线
├── /library            词库浏览与导入
└── /settings           设置（目标/主题/语音/限时秒数/新:旧比）
```

### 3.1 提取模态（5 种，自动交错）

```ts
type QuestionMode =
  | "en→cn"          // 看英文→写/选中文（基础）
  | "cn→spell"       // 看中文→拼写英文（高强度）
  | "listen→spell"      // 听音→写词（听觉）
  | "cloze"            // 句中填空（语境）
  | "speak"            // 跟读并自我评分（输出）
```

### 3.2 三大核心闭环（对应您的"综合闭环设计"

1. **学习循环**：`/learn`
   `听音 → 英英释义/词根 → 猜词 → 详解 → 自由涂鸦联想 → 预估难中易 → 进入间隔队列`
2. **复习-测试循环**：`/review`
   `5 种提取模态自动混洗 → 答错题重置间隔 → 连对 2 次才视为可能已掌握`
3. **应用闭环**：`/output` + `/article`
   `造句 / 词块拼装 / 跟读评分 / 原文回溯`

## 4. 数据模型（扩展版）

```ts
interface Word {
  id: string;
  word: string;
  phonetic?: string;
  partOfSpeech?: string;
  meaning: string;              // 中文释义（默认隐藏，需手动揭示）
  enDef: string;                // ★ 英英释义（默认显示）
  synonyms?: string[];            // 同义词
  roots?: RootPart[];             // ★ 词根拆解
  example: string;             // 例句
  exampleCn?: string;
  sourceSentences?: string[];   // 来自用户导入文章的原句（情境编码）
  tags?: string[];             // 分类标签
  imageDataUrl?: string;         // 用户上传配图（双重编码）
  userDoodleUrl?: string;        // ★ 用户自由涂鸦助记（生成效应）
  userSentences?: string[];   // ★ 用户自造例句
}

interface RootPart {
  root: string;        // 如 "spect"
  meaning: string;  // "看"
  relatedWords?: string[]; // 同根词（inspect, respect...）
}

interface WordProgress {
  wordId: string;
  initialDifficulty: "easy" | "medium" | "hard";  // 元认知：学习前预估
  status: "stranger" | "acquaintance" | "friend";  // 陌生人→点头之交→挚友
  reps: number;           // 成功复现次数
  lapses: number;       // 遗忘次数
  easeFactor: number; // SM-2 难度因子
  intervalDays: number;  // 当前间隔（天）
  lastReviewedAt: number;
  nextReviewAt: number;
  history: ReviewEvent[];  // 个人记忆曲线（时间序列）
}

interface ReviewEvent {
  at: number;          // 时间戳
  mode: QuestionMode;   // 当时用的是哪种模态
  score: 0 | 1 | 2 | 3 | 4 | 5;  // SM-2 自评分（0=完全黑, 5=完美）
  jol: boolean;       // JOL（用户判断是否已掌握）
  responseMs: number; // 反应时长
}

interface UserSettings {
  dailyGoal: number;
  theme: "light" | "dark";
  defaultCnHidden: true;    // ★ 中文释义默认隐藏（精细加工强制）
  autoSpeakFirst: true; // ★ 发音先行（双重编码强制）
  flashCardSecs: number; // 限时闪卡 3-5 秒
  newOldRatio: [number, number]; // 新:旧 默认 [3, 7]
  activeLibraryTag: string;
}

interface DailyStat { date: string; learned: number; reviewed: number; correct: number; wrong: number; focusMinutes: number; }
```

## 5. 目录结构

```
/workspace
├── index.html
├── package.json / tsconfig.json / vite.config.ts
├── tailwind.config.js / postcss.config.js
└── src/
    ├── main.tsx, App.tsx, index.css
    ├── data/words.json
    ├── types/index.ts              （Word / Progress / Settings 类型）
    ├── algorithm/
    │   └── scheduler.ts         （SM-2 自适应：score→intervalDays）
    ├── hooks/
    │   ├── useTodayQueue.ts    （新:旧 ≈ 3:7 混洗 + 易错词加权）
    │   ├── useSpeech.ts        （发音先行 + 跟读自评分）
    │   ├── useInterleave.ts    （交错学习调度）
    │   └── useDailyStats.ts
    ├── store/vocabStore.ts     （Zustand persist）
    ├── components/
    │   ├── NavBar.tsx
    │   ├── DeepCard.tsx          （英英→词根→中文第二屏）
    │   ├── DoodlePad.tsx       （Canvas 手绘助记）
    │   ├── FlowTimer.tsx         （限时 + 心流计时）
    │   ├── JOLRate.tsx         （学习前预估 + 学习后判断）
    │   ├── SpeakAndRate.tsx      （跟读评分）
    │   ├── ChoiceQuestion.tsx  （en→cn）
    │   ├── SpellQuestion.tsx   （cn→spell / listen→spell）
    │   ├── ClozeQuestion.tsx  （句中填空）
    │   ├── ProgressBar.tsx
    │   ├── StatChart.tsx        （SVG：每日 + 个人记忆曲线）
    │   └── StageReveal.tsx       （阶段动画：陌生人→…→挚友）
    └── pages/
        ├── Dashboard.tsx, Learn.tsx, Review.tsx
        ├── Output.tsx, Article.tsx, Boss.tsx
        ├── Stats.tsx, Library.tsx, Settings.tsx
        └── NotFound.tsx
```

## 6. 美学与设计语言（"学术/严肃学习感）

- **主基调**：旧书店 + 学术论文感。**拒绝**所有紫蓝渐变 / 糖果色。
- **字体**：标题 `Fraunces`（衬线 · 可变字重）；正文 `Lora`；中文正文 `Noto Serif SC`；音标 `JetBrains Mono`。
- **色板**（高对比度、WCAG AA 通过）：
  - 背景：`#F4EFE3`（奶黄纸）→ 深色 `#18160F`（墨夜）
  - 字色：`#1A1A1A` → 深色 `#E8E0C9`
  - 主色 / 进步：`#2F4F4F`（暗青绿，比深绿更深沉）
  - 警示 / 不熟：`#8B2635`（酒红墨）
  - 高亮 / 重点词：`#D4A017`（赭金）
  - 卡片纸 / 卡片投影：`#FFFFFF`→`#2A271E`（毛玻璃深色卡片）
- **布局**：最大宽度 `1180px`；侧栏（桌面）/ 顶部 Tab（移动）；**大量留白 + 分割线。
- **动效**：
  - 卡片进入：`fade-up 420ms cubic-bezier(.2,.7,.2,1)` 带 stagger
  - 翻转：`perspective(1200px) rotateY(180deg)` 3D
  - 阶段升级：SVG 粒子（3–5 个从卡片向上飘散并渐隐）
  - 禁用：任何"花哨弹窗"。一切动意均服务于"专注-反馈"
- **可访问性**：色彩对比度 ≥ 4.5；`<button>` 有 `aria-label`；键盘导航完整（见第 7.D）。

## 7. 实施步骤（分 5 阶段 · 每阶段构建通过才前进）

### 阶段 A：工程脚手架
A1. `pnpm create vite-init@latest . --template react-ts`（pnpm 不可用时 npm 回退）。
A2. 安装依赖：`tailwindcss@3 postcss autoprefixer zustand react-router-dom lucide-react`；Google Fonts 引入 `Fraunces` + `Lora` + `Noto Serif SC` + `JetBrains Mono`。
A3. 配置 `vite.config.ts`（`@/` alias）、`tailwind.config.js`（自定义 colors / fontFamily）、`postcss.config.js`。
A4. `src/index.css` 写入 Tailwind 指令 + 全局样式 + 动画 keyframes。
A5. `src/types/index.ts` 写入第 4 节的所有类型。
**验证**：`npm run build` 通过；`http://localhost:5173` 可见首页骨架。

### 阶段 B：算法与状态层（核心科学规律 1/7/8 的代码化）
B1. `src/algorithm/scheduler.ts`：实现 SM-2 简化版（score 0–5 → 更新 `intervalDays` / `easeFactor` / `status` 跃迁）；**坚决拒绝固定 1/3/7/15**。
B2. `src/utils/storage.ts`：localStorage 封装（try/catch + 降级内存回退）。
B3. `src/store/vocabStore.ts`：Zustand `persist`；`words`、`progressMap`、`settings`、`dailyStats`。Actions：`markScore(wordId, score, mode)`、`recordSession(kind='learn'|'review'|'wrong'|'correct')`、`importWords`、`setDoodle`、`setUserSentence`、`reset`。
B4. `src/hooks/useInterleave.ts`：新:旧 ≈ 3:7 混洗；按 `lapses` 给易错词加权采样（最多占当日队列 20–30%）。
B5. `src/data/words.json`：500 个高质量词条（带 `enDef`、`roots[]`、`example`、`tags`）。
**验证**：单元级手动测试 SM-2 `describe`；`build` 通过。

### 阶段 C：UI 组件（规律 2–6 的实现）
C1. `components/DeepCard.tsx`：默认正面仅 **发音按钮 + 英文 + 英英释义 + 词根**；**中文释义在 "揭示"后显示。
C2. `components/DoodlePad.tsx`：Canvas 2D（画笔/清除/保存为 DataURL。
C3. `components/JOLRate.tsx`：学习前预估 难中易 + 复习后判断掌握。
C4. `components/ChoiceQuestion.tsx / `SpellQuestion.tsx / `ClozeQuestion.tsx`：4 选 1 / 拼写 / 填空；随机生成干扰项来自同 tag 其它词。
C5. `components/SpeakAndRate.tsx`：Web Speech 朗读 → 用户录音自评分 1–5（仅前端，无需 ASR）。
C6. `components/FlowTimer.tsx`：限时 3–5 秒倒计时 + 专注计时。
C7. `components/StageReveal.tsx`：陌生人→点头之交→挚友三阶段 SVG 粒子动画。
C8. `components/StatChart.tsx`：纯 SVG 柱状图 + 个人记忆曲线折线。

### 阶段 D：页面装配
D1. `pages/Dashboard.tsx`：今日目标 / 连击 / 新:旧 / 心流曲线 / 快捷入口。
D2. `pages/Learn.tsx`：DeepCard + JOL 预估 + Doodle + 进入队列（规律 1+3+4+8）。
D3. `pages/Review.tsx`：5 模态交错出现、答错重置间隔、答对延长；FlowTimer 限时（规律 1+2+7+9）。
D4. `pages/Output.tsx`：造句 + 词块拼装（规律 5）。
D5. `pages/Article.tsx`：粘贴文章 → 自动提取生词（空格分词 + 已学过滤）→ 绑定原句（规律 6）。
D6. `pages/Boss.tsx`：弱点 Boss 战（规律 8）。
D7. `pages/Stats.tsx`：统计 + 个人记忆曲线。
D8. `pages/Library.tsx` + `pages/Settings.tsx` + `pages/NotFound.tsx`。
D9. `App.tsx` 装配路由；`main.tsx` 入口。
**键盘导航**：空格 = 揭示/下一题；← → = 不熟/熟；Enter = 确认提交。

### 阶段 E：体验与验收
E1. 深色模式：`settings.theme` → `<html>` 的 `dark` 类；Tailwind `dark:` 覆盖所有关键颜色。
E2. 持久化回归：学习 10 个 → 到统计 → 到复习 → 改主题 → 刷新 → 数据仍在。
E3. 响应式：≤390px 无水平滚动。
E4. `npm run build` 零 TS 错误零构建警告。
E5. 清理所有 `console.debug`；保留错误日志。
E6. 浏览器端到端走三遍闭环。

## 8. Phase 2（后续扩展 · 不在本次交付）

- AI 自动生成故事（OpenAI / 本地 LLM）：当日 10 词串成小故事。
- 配图自动匹配（Unsplash / 图像 API）。
- 影视剧片段切片（需版权素材库）。
- 用户账户 + 云同步（Express + Supabase/Postgres）。
- FSRS-4.5 完整算法（替换 SM-2）。
- 真实 ASR 跟读评分（Web Speech 升级 Whisper）。

## 9. 潜在依赖与注意事项

- **Web Speech API**：中文发音若无语音包，降级为仅显示文字，不报错。
- **Canvas DataURL 体积**：限 500KB；每张；每张词的 `doodle` 自动压缩（降低 localStorage 压力。
- **localStorage 容量**：进度与词库超过 4MB 时提示用户「导出备份」。
- **SM-2 的「默认中文隐藏**：中文释义必须点击才显示，这是**精细加工的硬性约束，绝不可做「开
- **时区**：`DailyStat.date` 用本地 `YYYY-MM-DD`。

## 10. 完成验收标准（DOD）

- `npm run build` 零错误、零 TS 警告。
- 每条科学规律对应至少一个功能模块（见第 0 节）实际代码对应实现并有可观察行为。
- 中文释义默认不直接呈现（需手动点击才出现）。
- 每次学习与复习至少有 3 种以上模态自动交替出现。
- 刷新后学习进度仍在。
- 移动端 ≤ 390px 无水平滚动。
- 深色/浅色主题切换生效。

---

## 下一步

如您确认本计划，我将按 A→E 顺序实施，并在每个阶段完成后执行 `build` 与关键路径验证。
