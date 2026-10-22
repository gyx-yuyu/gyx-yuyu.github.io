# 郭奕炫 · 个人作品网站（2026 版）

给 HR 一眼看完的个人作品站：深色工程风 + 粒子网络背景 + 玻璃卡片 + 图片灯箱 + 滚动动效。
纯静态（HTML / CSS / JS），没有构建步骤、没有 npm、没有 CDN、没有外部字体，断网也能打开。

**上线后的地址：** <https://gyx-yuyu.github.io/>

---

## 一、网站上有什么

| 区块 | 内容 |
| --- | --- |
| 首屏 | 姓名、岗位轮播、一句话自我定位、三张项目实拍照片堆叠、STM32H750 / ESP32-S3 / Cat.1 4G 浮标签 |
| 数字条 | 全国二等奖 · 4778 支参赛队伍 · 专业前 5%（16/324）· 3 个完整项目 |
| 项目 1 | 智巡六足 AI 救援机器人：帧协议、4G 联网、云端平台、整机联调，13 个技术标签 |
| 项目 2 | 基于 STM32F103 的传感器音响：电路、TRGO 硬件触发 ADC、消抖验证 |
| 项目 3 | 机械零部件测绘建模与结构仿真：CATIA 16 零件 + 工程图 + ABAQUS 模态分析 |
| 图墙 | 9 张实拍／图纸／上位机截图，点任意一张放大 |
| 技能 | 编程与系统、MCU 与 RTOS、联网与云、开发工具与 AI 工作流、动手与验证 |
| 荣誉 | 国赛二等奖、官方账号收录的演示视频、专业排名与 CET-4、金工实习、测绘实训 |
| 联系 | 邮箱／电话一键复制、GitHub、B 站演示视频，**3 份简历 + 2 份作品集 PDF 可直接下载** |

---

## 二、目录结构

```
04_个人网站/
├─ index.html                 页面结构（所有文字内容都在这里）
├─ assets/
│  ├─ style.css               样式：配色、字号、间距都在文件开头的 :root 变量里
│  ├─ main.js                 交互：粒子背景、滚动进场、数字滚动、灯箱、复制、3D 倾斜
│  ├─ img/                    12 张压缩后的项目图片
│  └─ resume/                 3 份简历 PDF + 2 份作品集 PDF（HR 点按钮直接下载）
├─ 一键发布到GitHub.cmd        双击运行：自动提交并推送到 GitHub
├─ 发布到GitHub.ps1            （上面那个 cmd 调用的脚本）
└─ README.md
```

---

## 三、本地先看一眼

直接双击 `index.html` 就能打开；想更接近线上效果，在本目录执行：

```powershell
python -m http.server 8000
```

然后浏览器访问 <http://localhost:8000>。

---

## 四、发布到 GitHub Pages（第一次）

1. 登录 GitHub（账号 `gyx-yuyu`），打开 <https://github.com/new?name=gyx-yuyu.github.io>；
2. 仓库名填 **`gyx-yuyu.github.io`**，可见性选 **Public**，点 **Create repository**；
3. 回到本目录，双击 **`一键发布到GitHub.cmd`**，第一次会让浏览器登录 GitHub，登录后脚本自动 push；
4. 打开仓库 → **Settings** → 左侧 **Pages** → Source 选 **Deploy from a branch** → Branch 选 **main** + **/ (root)** → **Save**；
5. 等 1–2 分钟，访问 <https://gyx-yuyu.github.io/> 检查。


> 以后想更新内容，再双击一次 `一键发布到GitHub.cmd` 就行，1 分钟左右自动生效。

---

## 五、以后要改内容

- **改文字**：编辑 `index.html`，搜索想改的那句话直接改。
- **换图片**：把新图放进 `assets/img/`，替换同名文件即可（建议宽度 ≤ 1400px、压缩过的 JPG）。
- **换简历 PDF**：把新的简历 PDF 复制进 `assets/resume/`，改名覆盖 `embedded.pdf` / `iot.pdf` / `structure.pdf`。
- **改配色**：`assets/style.css` 开头的 `:root` 里改 `--c1 / --c2 / --c3`，全站渐变和按钮会一起变。
- **改完务必在手机宽度下再看一眼**（浏览器 F12 → 切手机模式），确认没有横向滚动条。

---

## 六、技术说明（写给自己看的）

- 无障碍：语义化标签、键盘可达的按钮、灯箱可用 `Esc` / `←` / `→`、焦点可见样式。
- 性能：图片已压缩到 1.2 MB 以内；JS 全部 `defer`；粒子数量按屏幕面积自适应。
- 兼容：内容默认可见，只有脚本正常运行时才启用进场动画；即使浏览器不支持 `IntersectionObserver`，文字也不会消失。
- 动效尊重系统设置：`prefers-reduced-motion` 打开时自动关闭粒子与动效。
