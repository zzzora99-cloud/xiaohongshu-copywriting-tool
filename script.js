const imageInput = document.querySelector("#imageInput");
const dropZone = document.querySelector("#dropZone");
const previewCard = document.querySelector("#previewCard");
const previewImage = document.querySelector("#previewImage");
const resetButton = document.querySelector("#resetButton");
const generateButton = document.querySelector("#generateButton");
const roomTypeSelect = document.querySelector("#roomType");
const toneSelect = document.querySelector("#tone");
const positioningSelect = document.querySelector("#positioning");
const statusText = document.querySelector("#statusText");
const emptyState = document.querySelector("#emptyState");
const results = document.querySelector("#results");
const analysisGrid = document.querySelector("#analysisGrid");
const analysisOutput = document.querySelector("#analysisOutput");
const hooksList = document.querySelector("#hooksList");
const hooksOutput = document.querySelector("#hooksOutput");
const titleList = document.querySelector("#titleList");
const titlesOutput = document.querySelector("#titlesOutput");
const bodyOutput = document.querySelector("#bodyOutput");
const coverList = document.querySelector("#coverList");
const coverOutput = document.querySelector("#coverOutput");
const tagsOutput = document.querySelector("#tagsOutput");

let uploadedImage = null;
let latestResult = null;

const roomProfiles = {
  客厅: {
    cabinetDesign: ["满墙电视柜", "悬浮地台", "开放格", "隐形拉手"],
    storage: ["展示收纳", "隐藏收纳", "家政收纳"],
    details: ["电视墙不靠造型取胜，而是靠柜体比例把墙面做完整", "悬浮地台能让客厅少一点厚重感", "开放格只留一小段，避免后期变成杂物展示区"],
    people: ["改善型住宅用户", "高审美装修人群", "大宅业主"]
  },
  餐厅: {
    cabinetDesign: ["餐边柜", "玻璃柜", "嵌入式柜体", "中部留空"],
    storage: ["餐边收纳", "展示收纳", "隐藏收纳"],
    details: ["餐边柜的中部留空很关键，咖啡机和小家电不用全堆在餐桌上", "玻璃柜适合放杯具和收藏，但比例不能太满", "柜体和餐桌保持同一色系，空间会更连贯"],
    people: ["新房装修用户", "高审美装修人群", "改善型住宅用户"]
  },
  厨房: {
    cabinetDesign: ["高柜", "嵌入式柜体", "隐形拉手", "吊地柜组合"],
    storage: ["分区收纳", "餐边收纳", "隐藏收纳"],
    details: ["高柜把电器和囤货都收进去，台面才不会越住越乱", "隐形拉手比明装拉手更适合窄厨房动线", "吊柜和地柜的比例决定厨房看起来是清爽还是压抑"],
    people: ["新房装修用户", "改善型住宅用户", "高审美装修人群"]
  },
  卧室: {
    cabinetDesign: ["一门到顶", "隐形拉手", "床头柜一体", "嵌入式衣柜"],
    storage: ["衣物收纳", "隐藏收纳", "分区收纳"],
    details: ["卧室柜子不是越多越好，门板比例和床头留白更影响睡眠区氛围", "一门到顶能拉伸层高，但收口一定要干净", "衣柜内部要提前分长衣区、叠放区和被褥区"],
    people: ["新房装修用户", "改善型住宅用户", "高审美装修人群"]
  },
  衣帽间: {
    cabinetDesign: ["玻璃柜", "开放格", "一门到顶", "灯带"],
    storage: ["衣物收纳", "展示收纳", "分区收纳"],
    details: ["衣帽间真正显贵的不是柜子多，而是挂衣、包包和抽屉的比例", "玻璃柜门适合做展示，但要配合灯带才有精品店感", "开放区要克制，不然后期很容易显乱"],
    people: ["别墅业主", "大宅业主", "高审美装修人群"]
  },
  玄关: {
    cabinetDesign: ["通顶鞋柜", "悬浮柜", "中部留空", "隐形拉手"],
    storage: ["隐藏收纳", "分区收纳", "家政收纳"],
    details: ["玄关是回家第一眼，底部悬空和中部留空比单纯做满更实用", "常穿鞋、雨伞、钥匙和外套要有各自的位置", "柜门越干净，入户越不容易显乱"],
    people: ["新房装修用户", "改善型住宅用户", "高审美装修人群"]
  },
  儿童房: {
    cabinetDesign: ["书桌柜一体", "开放格", "圆角柜体", "一门到顶"],
    storage: ["衣物收纳", "展示收纳", "分区收纳"],
    details: ["儿童房要留成长弹性，书桌、衣柜和玩具收纳不能只看当下", "开放格适合放书和玩具，但高度要让孩子能自己拿", "低饱和配色比高饱和主题房更耐看"],
    people: ["新房装修用户", "改善型住宅用户", "高审美装修人群"]
  },
  书房: {
    cabinetDesign: ["满墙书柜", "开放格", "玻璃柜", "悬浮书桌"],
    storage: ["展示收纳", "分区收纳", "隐藏收纳"],
    details: ["书房的高级感来自书柜比例，不是把每一面墙都塞满", "开放区和封闭区要分开，文件杂物才不会影响画面", "灯带能补充氛围，但位置要避开直射眼睛"],
    people: ["大宅业主", "高审美装修人群", "改善型住宅用户"]
  },
  展厅: {
    cabinetDesign: ["高定木作", "玻璃柜", "金属线条", "灯带"],
    storage: ["展示收纳", "分区收纳", "隐藏收纳"],
    details: ["展厅图最值得参考的是比例和收口，不是照搬造型", "玻璃、金属和灯带要服务于材质展示，不能堆得太满", "高定木作的质感通常藏在门板缝隙和转角收口里"],
    people: ["别墅业主", "大宅业主", "高审美装修人群"]
  },
  其他: {
    cabinetDesign: ["嵌入式柜体", "隐形拉手", "开放格", "灯带"],
    storage: ["分区收纳", "隐藏收纳", "展示收纳"],
    details: ["先看柜体和墙面的关系，再决定要不要做满", "留白比堆造型更能影响落地质感", "柜门、灯光和地面材质要保持同一个节奏"],
    people: ["高审美装修人群", "新房装修用户", "改善型住宅用户"]
  }
};

const colorProfiles = {
  warm: {
    mainColors: ["木色", "米白", "暖白"],
    style: "奶油风",
    materials: ["木皮", "混油", "灯带"],
    lighting: "暖色氛围光明显，适合用木色和米白做柔和过渡"
  },
  warmDeep: {
    mainColors: ["木色", "深咖", "暖白"],
    style: "高定木作",
    materials: ["木皮", "金属", "灯带"],
    lighting: "低位灯带或重点照明更适合突出木作纹理"
  },
  cool: {
    mainColors: ["灰色", "暖白", "黑色"],
    style: "现代简约",
    materials: ["烤漆", "岩板", "金属"],
    lighting: "无主灯或线性光让柜体立面更利落"
  },
  dark: {
    mainColors: ["深咖", "黑色", "木色"],
    style: "意式轻奢",
    materials: ["木皮", "玻璃", "金属", "皮革"],
    lighting: "低照度氛围光能压住深色材质，更适合大宅尺度"
  },
  bright: {
    mainColors: ["米白", "暖白", "灰色"],
    style: "法式",
    materials: ["混油", "烤漆", "玻璃"],
    lighting: "自然光占比高，浅色柜体更容易放大空间"
  }
};

const titleOpeners = [
  "装修前一定要看",
  "高审美的人都在这样做",
  "这不是样板间，是落地后的家",
  "柜子做到这几个细节，家里直接高级一倍",
  "全屋定制不是越满越好"
];

const mandatoryTags = ["#装修", "#全屋定制", "#柜子设计", "#别墅装修", "#高定木作", "#空间美学"];


function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll("\"", "&quot;")
    .replaceAll("'", "&#039;");
}

function normalizeList(value) {
  if (Array.isArray(value)) {
    return value.filter(Boolean);
  }

  if (!value) {
    return [];
  }

  return String(value)
    .split(/[、,，\n]/)
    .map((item) => item.trim())
    .filter(Boolean);
}

function analyzeImageMetrics(image) {
  const canvas = document.createElement("canvas");
  const context = canvas.getContext("2d", { willReadFrequently: true });
  const sampleSize = 96;
  canvas.width = sampleSize;
  canvas.height = sampleSize;
  context.drawImage(image, 0, 0, sampleSize, sampleSize);
  const { data } = context.getImageData(0, 0, sampleSize, sampleSize);

  let red = 0;
  let green = 0;
  let blue = 0;
  let brightnessTotal = 0;
  let warmthTotal = 0;
  let warmPixels = 0;
  let brightPixels = 0;
  let shadowPixels = 0;
  let edgeTotal = 0;
  let count = 0;

  for (let y = 0; y < sampleSize; y += 2) {
    for (let x = 0; x < sampleSize; x += 2) {
      const index = (y * sampleSize + x) * 4;
      const r = data[index];
      const g = data[index + 1];
      const b = data[index + 2];
      const brightness = (r + g + b) / 3;
      const warmth = r - b;

      red += r;
      green += g;
      blue += b;
      brightnessTotal += brightness;
      warmthTotal += warmth;
      warmPixels += warmth > 14 ? 1 : 0;
      brightPixels += brightness > 205 ? 1 : 0;
      shadowPixels += brightness < 82 ? 1 : 0;
      count += 1;

      if (x > 0 && y > 0) {
        const left = ((y * sampleSize + (x - 2)) * 4);
        const top = (((y - 2) * sampleSize + x) * 4);
        const leftBrightness = (data[left] + data[left + 1] + data[left + 2]) / 3;
        const topBrightness = (data[top] + data[top + 1] + data[top + 2]) / 3;
        edgeTotal += Math.abs(brightness - leftBrightness) + Math.abs(brightness - topBrightness);
      }
    }
  }

  const average = {
    red: Math.round(red / count),
    green: Math.round(green / count),
    blue: Math.round(blue / count)
  };
  const brightness = brightnessTotal / count;
  const warmth = warmthTotal / count;

  return {
    average,
    brightness,
    warmth,
    warmRatio: warmPixels / count,
    brightRatio: brightPixels / count,
    shadowRatio: shadowPixels / count,
    edgeScore: edgeTotal / count,
    ratio: image.naturalWidth / image.naturalHeight
  };
}

function classifyPalette(metrics) {
  if (metrics.shadowRatio > 0.36 || metrics.brightness < 86) {
    return "dark";
  }

  if (metrics.brightness > 188 && metrics.brightRatio > 0.16) {
    return "bright";
  }

  if (metrics.warmRatio > 0.48 && metrics.brightness < 152) {
    return "warmDeep";
  }

  if (metrics.warmRatio > 0.4 || metrics.warmth > 12) {
    return "warm";
  }

  return "cool";
}

function inferRoom(fileName, image) {
  const selectedRoom = roomTypeSelect.value;
  if (selectedRoom !== "auto") {
    return selectedRoom;
  }

  const normalizedName = fileName.toLowerCase();
  const keywordMap = [
    ["餐厅", ["dining", "餐厅", "餐边", "dinner"]],
    ["厨房", ["kitchen", "厨房", "橱柜", "cook"]],
    ["卧室", ["bedroom", "卧室", "衣柜", "bed"]],
    ["衣帽间", ["cloak", "衣帽间", "walkin", "closet", "wardrobe"]],
    ["玄关", ["entry", "玄关", "鞋柜", "hall"]],
    ["儿童房", ["kids", "child", "儿童", "书桌"]],
    ["书房", ["study", "书房", "书柜", "office"]],
    ["展厅", ["showroom", "展厅", "展馆", "sample"]],
    ["客厅", ["living", "客厅", "电视", "tv"]]
  ];

  const matched = keywordMap.find(([, keywords]) => keywords.some((keyword) => normalizedName.includes(keyword)));
  if (matched) {
    return matched[0];
  }

  const ratio = image.naturalWidth / image.naturalHeight;
  if (ratio > 1.45) {
    return "客厅";
  }

  if (ratio < 0.78) {
    return "卧室";
  }

  return "其他";
}

function getCabinetEvidence(metrics, roomProfile) {
  const evidence = [];

  if (metrics.ratio > 1.28) {
    evidence.push("画面横向展开明显，优先看满墙柜、电视柜或餐边柜的整体比例");
  } else if (metrics.ratio < 0.82) {
    evidence.push("画面竖向比例更突出，适合判断一门到顶、柜门分缝和层高关系");
  } else {
    evidence.push("画面比例接近方正，重点看柜体和墙面、地面材质是否连贯");
  }

  if (metrics.edgeScore > 42) {
    evidence.push("画面线条和明暗边界较多，可能存在开放格、玻璃柜、金属线条或复杂柜体分区");
  } else {
    evidence.push("整体线条较克制，更适合强调隐形拉手、平板柜门和留白比例");
  }

  if (metrics.brightRatio > 0.2) {
    evidence.push("高光区域较多，浅色柜门、玻璃或自然光会成为画面记忆点");
  }

  if (metrics.shadowRatio > 0.28) {
    evidence.push("暗部占比偏高，深色木作、灯带和局部重点光更影响落地质感");
  }

  return [...evidence, ...roomProfile.details].slice(0, 5);
}

function buildLocalAnalysis(file) {
  const metrics = analyzeImageMetrics(previewImage);
  const paletteKey = classifyPalette(metrics);
  const colorProfile = colorProfiles[paletteKey];
  const spaceType = inferRoom(file.name, previewImage);
  const roomProfile = roomProfiles[spaceType] || roomProfiles.其他;
  const decorationHighlights = getCabinetEvidence(metrics, roomProfile);
  const likelyGlassOrMetal = metrics.edgeScore > 46 || metrics.brightRatio > 0.24;
  const cabinetDesign = [...roomProfile.cabinetDesign];
  const materialHighlights = [...colorProfile.materials];

  if (likelyGlassOrMetal && !cabinetDesign.includes("玻璃柜")) {
    cabinetDesign.push("玻璃柜/金属展示区");
  }

  if (metrics.ratio > 1.3 && !cabinetDesign.includes("满墙柜")) {
    cabinetDesign.push("满墙柜");
  }

  if (metrics.ratio < 0.86 && !cabinetDesign.includes("一门到顶")) {
    cabinetDesign.push("一门到顶");
  }

  if (metrics.brightRatio > 0.18 && !materialHighlights.includes("玻璃")) {
    materialHighlights.push("玻璃");
  }

  if (metrics.shadowRatio > 0.25 && !materialHighlights.includes("灯带")) {
    materialHighlights.push("灯带");
  }

  return {
    sourceConfidence: "本地兜底分析：基于图片色彩、明暗、比例和文件名提示推断；接入后端视觉模型后会更精准。",
    spaceType,
    style: colorProfile.style,
    mainColors: colorProfile.mainColors,
    cabinetDesign: cabinetDesign.slice(0, 5),
    materialHighlights: materialHighlights.slice(0, 5),
    storageHighlights: roomProfile.storage,
    lighting: colorProfile.lighting,
    decorationHighlights,
    xiaohongshuHooks: [
      `柜子不是做满就高级，${spaceType}真正值得抄的是比例和留白`,
      `${roomProfile.details[0]}，这个点比单纯堆柜子更影响落地效果`,
      `主色调控制在${colorProfile.mainColors.slice(0, 2).join("、")}，更容易做出耐看的全屋定制`,
      "这个细节很多人会忽略：收口、灯光、柜门分缝要一起看",
      `${roomProfile.storage.slice(0, 2).join("、")}不是口号，而是决定入住后会不会乱的关键`
    ],
    targetAudience: roomProfile.people,
    postingAngle: `适合从“${spaceType}柜体比例 + ${colorProfile.mainColors[0]}配色 + ${roomProfile.storage[0]}”切入写种草笔记`
  };
}

function buildCopywriting(analysis) {
  const tone = toneSelect.value;
  const positioning = positioningSelect.value;
  const colors = normalizeList(analysis.mainColors).join("、") || "低饱和配色";
  const cabinets = normalizeList(analysis.cabinetDesign);
  const materials = normalizeList(analysis.materialHighlights);
  const storage = normalizeList(analysis.storageHighlights);
  const hooks = normalizeList(analysis.xiaohongshuHooks);
  const details = normalizeList(analysis.decorationHighlights);
  const people = normalizeList(analysis.targetAudience);
  const cabinetText = cabinets.slice(0, 3).join("、") || "柜体比例、收口和留白";
  const materialText = materials.slice(0, 3).join("、") || "木作、灯光和柜门材质";
  const storageText = storage.slice(0, 3).join("、") || "分区收纳、隐藏收纳和展示收纳";
  const firstDetail = details[0] || "先看柜体和墙面的关系，再决定要不要做满";
  const secondDetail = details[1] || "灯光、材质和门板分缝要一起考虑";
  const targetText = people[0] || positioning;

  const titles = [
    `${titleOpeners[0]}！${analysis.spaceType}柜子别再只想着做满`,
    `${titleOpeners[1]}：${analysis.spaceType}都在抠${cabinetText}`,
    `${titleOpeners[2]}，${analysis.style}${analysis.spaceType}落地太稳了`,
    `${titleOpeners[3]}，关键是${colors}和灯光`,
    `${titleOpeners[4]}，${storageText}才是入住后不乱的关键`
  ];

  const body = `先说结论：这张${analysis.spaceType}图，不是靠“柜子多”赢的。

真正值得参考的是它把${cabinetText}、${materialText}和${colors}放在同一个节奏里，所以看起来不是硬装出来的样板间感，而是能落地、也能住进去的全屋定制思路。

我会重点拆这 4 个细节：

① 柜子不是做满就高级
${firstDetail}。很多人做全屋定制，一上来就想把墙面全部填满，但真正显贵的是比例和留白。柜门分缝、开放区大小、底部是否悬浮，这些比多加一组柜子更重要。

② 材质别只看名字，要看光感
这套主色调是${colors}，搭配${materialText}。普通人很容易忽略：木皮、烤漆、混油、玻璃这些材质，换一个光感就完全不一样。${analysis.lighting || "灯光最好用来修正材质层次，而不是把空间照得过亮。"}

③ 收纳要分区，不要全部藏死
这里能借鉴的是${storageText}。常用物、展示物、囤货区要分开，不然后期台面和开放格一定会乱。好用的柜子不是一眼看不到东西，而是每一类东西都有顺手的位置。

④ 落地效果看收口，不看滤镜
${secondDetail}。尤其是${targetText}做${tone}，不要只收藏氛围图，要看门板到顶怎么收、转角怎么处理、灯带有没有见光不见灯。

如果你正在做${positioning}，这套思路可以直接收藏给设计师：少堆造型，多看比例、材质、灯光和收纳动线。${hooks[0] || "柜子不是做满就高级，真正显贵的是比例和留白。"}`;

  const coverPhrases = [
    "柜子别只做满",
    "显贵靠比例留白",
    `${analysis.spaceType}这样更耐看`,
    "收口比造型重要"
  ];

  const tags = [
    ...mandatoryTags,
    `#${analysis.spaceType}设计`,
    `#${analysis.style}`,
    "#装修避坑",
    "#小红书家居",
    "#定制柜",
    "#家居美学"
  ];

  return { titles, body, coverPhrases, tags };
}

async function requestBackendGeneration() {
  const formData = new FormData();
  formData.append("image", uploadedImage);
  formData.append("roomHint", roomTypeSelect.value);
  formData.append("tone", toneSelect.value);
  formData.append("targetAudience", positioningSelect.value);

  const response = await fetch("/api/generate", {
    method: "POST",
    body: formData
  });

  if (!response.ok) {
    const message = response.status === 404 ? "当前部署环境没有后端接口，已切换本地兜底分析。" : "后端接口暂不可用，已切换本地兜底分析。";
    throw new Error(message);
  }

  return response.json();
}

function normalizeResult(result) {
  const analysis = result.analysis || {};
  const copywriting = result.copywriting || buildCopywriting(analysis);

  return {
    source: result.source || "local-fallback",
    notice: result.notice || "",
    analysis: {
      spaceType: analysis.spaceType || "其他",
      style: analysis.style || "其他",
      mainColors: normalizeList(analysis.mainColors),
      cabinetDesign: normalizeList(analysis.cabinetDesign),
      materialHighlights: normalizeList(analysis.materialHighlights),
      storageHighlights: normalizeList(analysis.storageHighlights),
      lighting: analysis.lighting || "结合图片光线判断灯光层次",
      decorationHighlights: normalizeList(analysis.decorationHighlights),
      xiaohongshuHooks: normalizeList(analysis.xiaohongshuHooks).slice(0, 5),
      targetAudience: normalizeList(analysis.targetAudience),
      sourceConfidence: analysis.sourceConfidence || "",
      postingAngle: analysis.postingAngle || ""
    },
    copywriting: {
      titles: normalizeList(copywriting.titles).slice(0, 5),
      body: copywriting.body || "",
      coverPhrases: normalizeList(copywriting.coverPhrases).slice(0, 4),
      tags: normalizeList(copywriting.tags)
    }
  };
}

function renderAnalysis(analysis) {
  const fields = [
    ["空间类型", analysis.spaceType],
    ["整体风格", analysis.style],
    ["主色调", analysis.mainColors.join("、")],
    ["柜体设计", analysis.cabinetDesign.join("、")],
    ["材质亮点", analysis.materialHighlights.join("、")],
    ["收纳亮点", analysis.storageHighlights.join("、")],
    ["灯光判断", analysis.lighting],
    ["适合人群", analysis.targetAudience.join("、")],
    ["发布角度", analysis.postingAngle],
    ["分析说明", analysis.sourceConfidence]
  ];

  analysisGrid.innerHTML = fields
    .map(([label, value]) => `<div class="analysis-item"><span>${escapeHtml(label)}</span><strong>${escapeHtml(value || "待补充")}</strong></div>`)
    .join("");
  analysisOutput.textContent = fields.map(([label, value]) => `${label}: ${value || "待补充"}`).join("\n");
}

function renderList(container, items) {
  container.innerHTML = items.map((item) => `<li>${escapeHtml(item)}</li>`).join("");
}

function renderResult(result) {
  const normalized = normalizeResult(result);
  latestResult = normalized;

  renderAnalysis(normalized.analysis);
  renderList(hooksList, normalized.analysis.xiaohongshuHooks);
  hooksOutput.textContent = normalized.analysis.xiaohongshuHooks.join("\n");

  renderList(titleList, normalized.copywriting.titles);
  titlesOutput.textContent = normalized.copywriting.titles.join("\n");

  bodyOutput.textContent = normalized.copywriting.body;

  coverList.innerHTML = normalized.copywriting.coverPhrases.map((phrase) => `<span>${escapeHtml(phrase)}</span>`).join("");
  coverOutput.textContent = normalized.copywriting.coverPhrases.join("\n");

  tagsOutput.textContent = normalized.copywriting.tags.join(" ");

  emptyState.hidden = true;
  results.hidden = false;
}

function renderLocalFallback(notice) {
  const analysis = buildLocalAnalysis(uploadedImage);
  renderResult({
    source: "local-fallback",
    notice,
    analysis,
    copywriting: buildCopywriting(analysis)
  });
}

function handleFile(file) {
  if (!file || !file.type.startsWith("image/")) {
    statusText.textContent = "请上传 PNG、JPG、WEBP 或 GIF 图片。";
    return;
  }

  const reader = new FileReader();
  reader.addEventListener("load", () => {
    uploadedImage = file;
    generateButton.disabled = true;
    statusText.textContent = "图片已读取，等待预览加载完成。";
    previewImage.addEventListener(
      "load",
      () => {
        previewCard.hidden = false;
        generateButton.disabled = false;
        statusText.textContent = "图片已准备好，可以开始分析。";
      },
      { once: true }
    );
    previewImage.src = reader.result;
  });
  reader.readAsDataURL(file);
}

imageInput.addEventListener("change", (event) => {
  handleFile(event.target.files[0]);
});

["dragenter", "dragover"].forEach((eventName) => {
  dropZone.addEventListener(eventName, (event) => {
    event.preventDefault();
    dropZone.classList.add("is-dragging");
  });
});

["dragleave", "drop"].forEach((eventName) => {
  dropZone.addEventListener(eventName, (event) => {
    event.preventDefault();
    dropZone.classList.remove("is-dragging");
  });
});

dropZone.addEventListener("drop", (event) => {
  handleFile(event.dataTransfer.files[0]);
});

resetButton.addEventListener("click", () => {
  uploadedImage = null;
  latestResult = null;
  imageInput.value = "";
  previewImage.removeAttribute("src");
  previewCard.hidden = true;
  generateButton.disabled = true;
  emptyState.hidden = false;
  results.hidden = true;
  statusText.textContent = "";
});

generateButton.addEventListener("click", async () => {
  if (!uploadedImage) {
    return;
  }

  generateButton.disabled = true;
  generateButton.textContent = "正在分析图片...";
  statusText.textContent = "正在请求后端视觉分析接口。";

  try {
    const result = await requestBackendGeneration();
    renderResult(result);
    statusText.textContent = result.source === "openai" ? "已完成视觉模型分析与小红书文案生成。" : "已使用后端兜底逻辑生成。";
  } catch (error) {
    renderLocalFallback(error.message);
    statusText.textContent = error.message;
  } finally {
    generateButton.disabled = false;
    generateButton.textContent = "分析图片并生成小红书文案";
  }
});

[roomTypeSelect, toneSelect, positioningSelect].forEach((select) => {
  select.addEventListener("change", () => {
    if (!uploadedImage || !latestResult) {
      return;
    }

    const analysis = latestResult.source === "local-fallback" ? buildLocalAnalysis(uploadedImage) : latestResult.analysis;
    renderResult({
      ...latestResult,
      analysis,
      copywriting: buildCopywriting(analysis)
    });
  });
});

document.addEventListener("click", async (event) => {
  const copyButton = event.target.closest("[data-copy-target]");
  if (!copyButton) {
    return;
  }

  const target = document.querySelector(`#${copyButton.dataset.copyTarget}`);
  const originalText = copyButton.textContent;

  try {
    await navigator.clipboard.writeText(target.textContent);
    copyButton.textContent = "已复制";
  } catch {
    copyButton.textContent = "复制失败";
  }

  setTimeout(() => {
    copyButton.textContent = originalText;
  }, 1200);
});
