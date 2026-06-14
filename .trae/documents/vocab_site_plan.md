# 背单词网站 实现计划（Vocabulary Builder）

> 生成日期：2026-06-14
> 工作目录：`/workspace`
> 执行范围：全新前端单页应用（SPA）+ 本地持久化（localStorage）

---

## 1. 项目调研结论

- `/workspace` 当前仅包含默认脚手架 `index.html`，无既有代码、无构建配置、无依赖。
- 用户未指定后端、数据库或第三方账号系统，因此**第一阶段以纯前端为目标**，使用浏览器 `localStorage` 保存学习进度与用户词库；后端接口保留扩展性（Express.js）。
- 核心价值：让用户可以"打开即用"的单词学习工具，具备：词卡浏览、记忆反馈（熟/不熟）、每日目标、进度统计、错词本、听写/拼写练习。

## 2. 技术选型（前端主导方案）

| 层次 | 选择 | 理由 |
| --- | --- | --- |
| 构建工具 | **Vite 5** | 启动快、零配置、HMR 流畅。 |
| 前端框架 | **React 18 + TypeScript** | 组件化开发、易维护、社区资源丰富。 |
| 样式 | **Tailwind CSS 3** | 原子化类，支持主题色切换（深色/浅色）。 |
| 状态管理 | **Zustand** | 极简 API，跨组件共享"学习会话 + 用户设置"状态。 |
| 路由 | **React Router v6** | 首页 / 学习 / 复习 / 统计 / 设置 多页面。 |
| 图标 | **lucide-react** | 轻量 SVG 图标库，符合现代 UI。 |
| 数据持久化 | **localStorage（带 zustand persist 中间件）** | 离线可用、无需后端即可交付 MVP。 |
| 数据 | 内置中英文词表（JSON，放在 `src/data/`） | 提供"四六级 / 考研 / 日常高频"等基础词表 + 用户可导入。 |

> 若后续需要多端同步、多人使用，再引入 `Express.js` + `Supabase/PostgreSQL` 作为 Phase 2。

## 3. 页面与功能结构

### 3.1 页面路由

| 路径 | 页面 | 主要功能 |
| --- | --- | --- |
| `/` | 首页 Dashboard | 今日学习进度条、连续打卡天数、快速开始、词表选择 |
| `/learn` | 学习页 | 卡片式单词展示（词→释义）、熟/不熟/跳过、例句、音标 |
| `/review` | 复习页 | 错词本 / 遗忘曲线复习（基于最近学习时间的简单 SM-2 启发式） |
| `/quiz` | 练习页 | 选择题 / 拼写题（听音拼词） |
| `/stats` | 统计页 | 柱状图（每日学习量）、总词数、正确率、最近 7 天热力 |
| `/library` | 词库页 | 浏览所有词、搜索、导入 JSON、重置词表 |
| `/settings` | 设置页 | 每日目标、主题（浅色/深色）、是否显示音标、是否开启语音 |

### 3.2 核心交互流程

```
首页（选择词表 + 今日目标）
  └─→ 学习页（卡片翻转 + 熟/不熟/跳过）
         └─→ 错词自动进入 "复习队列"
                └─→ 复习页 / 练习页
                       └─→ 统计页 记录每次行为
```

## 4. 数据模型（TypeScript 类型）

```ts
// 单个单词
interface Word {
  id: string;              // 稳定 id（hash 或 uuid）
  word: string;            // 目标语单词
  phonetic?: string;       // 音标
  partOfSpeech?: string;   // 词性：n./v./adj.…
  meaning: string;         // 中文释义（多义用 ; 分隔）
  example?: string;        // 例句（英文）
  exampleCn?: string;      // 例句翻译
  tags?: string[];         // 用于分类：CET4 / CET6 / daily…
}

// 单词学习记录（与 Word 一一对应）
interface WordProgress {
  wordId: string;
  status: "new" | "learning" | "known";
  correctCount: number;
  wrongCount: number;
  lastReviewedAt: number;   // 时间戳
  nextReviewAt: number;     // 下次复习时间戳（简单 SM-2）
  easeFactor: number;       // 默认 2.5
}

// 用户设置
interface UserSettings {
  dailyGoal: number;        // 每日新学目标数
  theme: "light" | "dark";
  showPhonetic: boolean;
  autoSpeak: boolean;       // 自动朗读英文
  activeLibraryTag: string; // 当前激活的词表
}

// 学习统计（按天）
interface DailyStat {
  date: string;             // YYYY-MM-DD
  learned: number;          // 当日新学
  reviewed: number;         // 当日复习
  correct: number;
  wrong: number;
}
```

## 5. 目录结构（Phase 1 完成后期望）

```
/workspace
├── index.html                    (入口 HTML)
├── package.json                  (依赖 & 脚本)
├── tsconfig.json                 (TS 配置)
├── vite.config.ts                (Vite 配置)
├── tailwind.config.js            (Tailwind 主题)
├── postcss.config.js
└── src/
    ├── main.tsx                  (应用入口)
    ├── App.tsx                   (路由装配)
    ├── index.css                 (Tailwind 入口 + 全局样式)
    ├── data/
    │   └── words.json            (内置示例词表 500+ 词)
    ├── pages/
    │   ├── Dashboard.tsx
    │   ├── Learn.tsx
    │   ├── Review.tsx
    │   ├── Quiz.tsx
    │   ├── Stats.tsx
    │   ├── Library.tsx
    │   └── Settings.tsx
    ├── components/
    │   ├── NavBar.tsx
    │   ├── WordCard.tsx          (翻转卡片)
    │   ├── ProgressBar.tsx
    │   ├── ChoiceQuestion.tsx
    │   ├── SpellQuestion.tsx
    │   ├── StatChart.tsx        (纯 SVG 轻量柱状图)
    │   └── EmptyState.tsx
    ├── hooks/
    │   ├── useTodayQueue.ts      (生成今日学习队列)
    │   ├── useSpeech.ts          (Web Speech API 朗读)
    │   └── useDailyStats.ts
    ├── store/
    │   └── vocabStore.ts         (Zustand: 词表 + 进度 + 设置)
    └── utils/
        ├── sm2.ts                (简单 SM-2 调度算法)
        ├── storage.ts            (localStorage 封装)
        └── id.ts                 (hash / uuid 工具)
```

## 6. 美学与设计方向

- **主基调**：学习 / 专注 / 纸张感。选择 "柔和纸质 + 一抹墨绿" 方向，避免紫蓝渐变套模板。
- **字体**：标题使用 `Fraunces`（衬线、书卷气）；正文使用 `Lora` 或 `Noto Serif SC`（中文）；等宽用于音标。
- **色彩**：
  - 背景：奶油白 `#F6F1E7` / 深色模式下为 `#1C1B1F`（深棕）
  - 主色：墨绿 `#2F6F4E`（按钮、进度条）
  - 辅助：砖红 `#B4452E`（错误 / 不熟）、金黄 `#D4A21A`（高亮）
- **动效**：
  - 卡片翻转 3D（CSS `transform-style: preserve-3d`）
  - 页面进入：staggered fade-up（CSS `animation-delay`）
  - 按钮按压：轻微 scale + 颜色过渡
  - 进度条：从 0 平滑填充到目标值
- **布局**：最大内容宽度 `1100px`，居中留白；小屏自适应单列；顶栏 Logo + 主导航。

## 7. 实施步骤（有序）

### 阶段 A：工程脚手架（1 个主要命令 + 配置文件）
1. 使用 `pnpm create vite-init@latest . --template react-ts`（如果 pnpm 可用）；否则回退到 `npm init vite-init@latest -y . -- --template react-ts`。
2. 安装并配置 `tailwindcss@3`、`postcss`、`autoprefixer`、`zustand`、`react-router-dom`、`lucide-react`。
3. 配置 `tailwind.config.js` 的 `content` 与自定义 `theme.extend.colors`、`fontFamily`。
4. 更新 `src/index.css` 引入 `@tailwind base/components/utilities`，并写入字体声明。

### 阶段 B：数据与状态层
5. 在 `src/data/words.json` 内置一个 200–500 条的演示词表（含音标、释义、例句、tags）。
6. 在 `src/utils/` 实现：`sm2.ts`（基于熟/不熟更新 `nextReviewAt`）、`storage.ts`（带 JSON parse/stringify 的 localStorage 封装 + 错误回退）、`id.ts`。
7. 在 `src/store/vocabStore.ts` 用 Zustand `persist` 实现：`words`、`progressMap`、`settings`、`dailyStats[]`；提供 actions：`markKnown`、`markUnknown`、`skip`、`resetProgress`、`importWords`、`updateSettings`、`recordSession`。

### 阶段 C：UI 组件与页面
8. 通用组件：`NavBar.tsx`、`ProgressBar.tsx`、`EmptyState.tsx`、`StatChart.tsx`（纯 SVG）。
9. 学习组件：`WordCard.tsx`（支持翻转：正面单词+音标，反面释义+例句+朗读按钮）、`ChoiceQuestion.tsx`（4 选 1）、`SpellQuestion.tsx`（输入框 + Web Speech 朗读）。
10. 页面逐一实现：Dashboard、Learn、Review、Quiz、Stats、Library、Settings；使用 React Router 装配到 `App.tsx`。
11. 在 `Learn.tsx` 与 `Review.tsx` 中接入 `sm2` 调度：每次反馈后更新下一次复习时间。
12. 在 `Stats.tsx` 展示最近 14 天学习 / 复习柱状图、累计单词、正确率、连续打卡。

### 阶段 D：体验与可访问性
13. 深色模式：基于 `settings.theme` 在 `<html>` 上切换 `class="dark"`，Tailwind `dark:` 生效。
14. 语音朗读：封装 `useSpeech.ts`（`window.speechSynthesis`，检测可用性），在卡片和拼写题中使用；`autoSpeak` 设置控制是否自动播放。
15. 键盘支持：学习页支持 **空格** 翻转卡片、**← / →** 表示不熟/熟、**Enter** 进入下一张（减少鼠标操作）。
16. 响应式：`sm/md/lg` 断点；大屏双栏，小屏卡片占满宽。
17. 可访问性：`<button>` 语义化、`aria-label`、颜色对比度 ≥ 4.5；图片装饰使用 CSS。

### 阶段 E：验证与交付
18. 类型检查：`npm run build`（Vite 构建 + TS 校验）零错误通过。
19. 浏览器自测路径：首页 → 学习 10 个 → 到统计 → 去复习 → 改设置为深色主题；刷新后数据仍在（localStorage 持久化验证）。
20. 清理调试 `console.debug`；保留必要错误日志。

## 8. 潜在依赖与注意事项

- **Web Speech API** 非所有浏览器/语言包都支持，中文发音在无语音包时需降级为仅显示文字（不报错）。
- **localStorage 容量** 通常 5MB，足以存放数万条进度记录；若用户导入超大型词表（>1 万词），建议提示"分批导入"。
- **单词版权**：内置词表为通用高频词 + 手工示例释义，用于学习用途；不搬运第三方版权词表。
- **时区与日期**：`DailyStat.date` 使用本地时区 `YYYY-MM-DD`，避免跨天统计错误。
- **跨浏览器字体**：`Fraunces`、`Lora` 通过 Google Fonts `preconnect` 引入；离线环境降级为系统衬线。

## 9. 风险处理

| 风险 | 影响 | 应对 |
| --- | --- | --- |
| 用户刷新后丢失进度 | 高 | 使用 `zustand/persist` + 写入前校验；首次打开检测并恢复默认设置 |
| 内置词表质量不足 | 中 | 在 `Library` 提供"导入 JSON"入口，字段与 `Word` 接口一致，附带示例格式 |
| SM-2 算法过于简单 | 低 | 先实现"轻量版"：不熟 24h 内再出现，熟则按 easeFactor 指数延长；后续可替换为完整算法 |
| 深色模式对比度不够 | 中 | 选定色值后以 WCAG AA 校验（可在 tailwind 主题中一次性固定） |
| 移动端字体过大溢出卡片 | 中 | 单词用 `break-words` + 长单词 `scroll-x`；设置最大字体尺寸上限 |

## 10. 完成的验收标准（Definition of Done）

- `pnpm build` 或 `npm run build` 零错误、零 TypeScript 警告。
- 打开页面（`pnpm dev` → `http://localhost:5173`）可立刻进入首页并看到示例词表。
- 可以完整走完：学习 → 记录熟/不熟 → 复习 → 练习 → 统计 → 刷新后保留进度 的全流程。
- 深色模式切换生效，导航各页面均可访问，404 路由有兜底。
- 移动端（宽度 ≤ 390px）无水平滚动，卡片可读。

---

## 下一步

审核通过后，我将按 "阶段 A → E" 的顺序开始实施，并在关键节点（脚手架完成、状态层完成、页面完成、交付前）构建验证。
