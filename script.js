const imageInput = document.querySelector("#imageInput");
const dropZone = document.querySelector("#dropZone");
const previewCard = document.querySelector("#previewCard");
const previewImage = document.querySelector("#previewImage");
const resetButton = document.querySelector("#resetButton");
const generateButton = document.querySelector("#generateButton");
const roomTypeSelect = document.querySelector("#roomType");
const toneSelect = document.querySelector("#tone");
const positioningSelect = document.querySelector("#positioning");
const emptyState = document.querySelector("#emptyState");
const results = document.querySelector("#results");
const insightGrid = document.querySelector("#insightGrid");
const titleOutput = document.querySelector("#titleOutput");
const bodyOutput = document.querySelector("#bodyOutput");
const coverOutput = document.querySelector("#coverOutput");
const tagsOutput = document.querySelector("#tagsOutput");

let uploadedImage = null;
let latestInsights = null;

const roomProfiles = {
  客厅: {
    sceneWords: ["整墙电视柜", "客厅主视觉", "公共区收纳"],
    highlights: ["整墙柜把电视、展示和杂物统一进一个立面", "开放格留出呼吸感，拍照不会像一整面柜墙", "柜体与墙面顺色，客厅视觉面积被悄悄放大"],
    storage: "电视柜、家政柜与展示格组合，囤货、清洁工具和日常小物都有位置",
    painPoint: "客厅容易显乱、杂物露在外面",
    tags: ["#客厅收纳", "#电视柜设计", "#全屋定制"]
  },
  厨房: {
    sceneWords: ["橱柜", "餐厨动线", "高柜收纳"],
    highlights: ["高柜把电器嵌进去，台面能长期保持清爽", "吊柜与地柜比例更克制，小厨房也不压抑", "洗切炒动线被顺手串起来，做饭少走回头路"],
    storage: "高柜、抽屉拉篮和转角收纳分区，锅具、电器、调味品都能藏进柜里",
    painPoint: "厨房台面堆满小家电、做饭动线来回绕",
    tags: ["#厨房设计", "#餐边柜", "#橱柜定制"]
  },
  卧室: {
    sceneWords: ["一门到顶衣柜", "睡眠区", "衣物分区"],
    highlights: ["一门到顶衣柜拉伸层高，卧室立面更利落", "床头与衣柜保持统一色系，睡眠区更安静", "低饱和配色减少视觉噪音，越住越耐看"],
    storage: "长衣区、叠放区、被褥区和抽屉区独立规划，换季衣物也能有序收纳",
    painPoint: "衣物换季难整理、床边容易堆东西",
    tags: ["#卧室衣柜", "#衣柜设计", "#卧室装修"]
  },
  衣帽间: {
    sceneWords: ["步入式衣帽间", "精品陈列", "衣物管理"],
    highlights: ["开放与封闭收纳结合，常穿衣物一眼能找到", "玻璃柜门提升精品感，也能减少落灰", "灯带强化陈列氛围，衣帽间更像小展厅"],
    storage: "挂衣、包包、饰品、抽屉和行李箱位分层规划，拿取路径更短",
    painPoint: "衣服多、包包配饰难展示也难维护",
    tags: ["#衣帽间设计", "#高定衣柜", "#收纳规划"]
  },
  玄关: {
    sceneWords: ["入户鞋柜", "归家动线", "换鞋区"],
    highlights: ["入户鞋柜承担第一眼高级感，进门就有秩序", "底部悬空放常穿鞋，回家不用弯腰翻找", "中部留空承接钥匙包袋，零碎物品不再乱放"],
    storage: "鞋柜、换鞋凳、挂衣区和杂物柜一体化，进门动线更干净",
    painPoint: "一进门鞋子、外套和快递容易堆成一片",
    tags: ["#玄关设计", "#鞋柜设计", "#入户收纳"]
  },
  儿童房: {
    sceneWords: ["学习收纳一体", "成长型空间", "儿童房定制"],
    highlights: ["书桌柜一体节省面积，学习和收纳动线更短", "圆角与低饱和配色更温和，视觉压力更小", "成长型收纳适配不同年龄，后期不用频繁大改"],
    storage: "衣物、玩具、书本和学习用品分区，给孩子留出更多活动空间",
    painPoint: "玩具书本增长快、学习区容易乱",
    tags: ["#儿童房设计", "#书桌柜", "#成长型儿童房"]
  }
};

const materialMap = {
  warm: ["暖木饰面", "奶油白门板", "柔光肤感膜"],
  cool: ["浅灰柜门", "岩板台面", "金属线条"],
  dark: ["深木纹", "哑光柜门", "黑钛玻璃"],
  bright: ["白色烤漆", "浅木纹", "通透玻璃门"],
  natural: ["原木纹理", "米白柜门", "藤编或棉麻软装"]
};

const styleMap = {
  warm: "奶油原木风",
  cool: "现代极简风",
  dark: "轻奢高定风",
  bright: "法式简雅风",
  natural: "侘寂自然风"
};

const paletteLabels = {
  warm: "暖调柔和",
  cool: "冷调清爽",
  dark: "深色高级",
  bright: "明亮通透",
  natural: "自然木色"
};

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function getImageMetrics(image) {
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
  let saturationTotal = 0;
  let warmPixels = 0;
  let neutralPixels = 0;
  let darkPixels = 0;
  let brightPixels = 0;
  let woodLikePixels = 0;
  let verticalEdges = 0;
  let horizontalEdges = 0;
  let edgeChecks = 0;

  for (let y = 0; y < sampleSize; y += 1) {
    for (let x = 0; x < sampleSize; x += 1) {
      const index = (y * sampleSize + x) * 4;
      const r = data[index];
      const g = data[index + 1];
      const b = data[index + 2];
      const max = Math.max(r, g, b);
      const min = Math.min(r, g, b);
      const brightness = (r + g + b) / 3;
      const saturation = max === 0 ? 0 : (max - min) / max;

      red += r;
      green += g;
      blue += b;
      brightnessTotal += brightness;
      saturationTotal += saturation;

      if (r - b > 18 && r > 110) warmPixels += 1;
      if (Math.abs(r - g) < 14 && Math.abs(g - b) < 14) neutralPixels += 1;
      if (brightness < 82) darkPixels += 1;
      if (brightness > 205) brightPixels += 1;
      if (r > g && g > b && r - b > 24 && saturation > 0.12 && brightness > 92 && brightness < 210) {
        woodLikePixels += 1;
      }

      if (x < sampleSize - 1 && y < sampleSize - 1) {
        const rightIndex = (y * sampleSize + x + 1) * 4;
        const bottomIndex = ((y + 1) * sampleSize + x) * 4;
        const rightBrightness = (data[rightIndex] + data[rightIndex + 1] + data[rightIndex + 2]) / 3;
        const bottomBrightness = (data[bottomIndex] + data[bottomIndex + 1] + data[bottomIndex + 2]) / 3;
        const verticalDiff = Math.abs(brightness - rightBrightness);
        const horizontalDiff = Math.abs(brightness - bottomBrightness);

        if (verticalDiff > 22) verticalEdges += 1;
        if (horizontalDiff > 22) horizontalEdges += 1;
        edgeChecks += 1;
      }
    }
  }

  const pixelCount = sampleSize * sampleSize;
  const averageColor = {
    red: Math.round(red / pixelCount),
    green: Math.round(green / pixelCount),
    blue: Math.round(blue / pixelCount)
  };
  const brightness = brightnessTotal / pixelCount;
  const saturation = saturationTotal / pixelCount;
  const contrast = (darkPixels + brightPixels) / pixelCount;

  return {
    averageColor,
    brightness,
    saturation,
    contrast,
    warmRatio: warmPixels / pixelCount,
    neutralRatio: neutralPixels / pixelCount,
    darkRatio: darkPixels / pixelCount,
    brightRatio: brightPixels / pixelCount,
    woodRatio: woodLikePixels / pixelCount,
    verticalEdgeRatio: verticalEdges / edgeChecks,
    horizontalEdgeRatio: horizontalEdges / edgeChecks,
    ratio: image.naturalWidth / image.naturalHeight
  };
}

function classifyPalette(metrics) {
  const { averageColor, brightness, saturation, warmRatio, darkRatio, brightRatio, woodRatio, neutralRatio } = metrics;
  const warmth = averageColor.red - averageColor.blue;

  if (darkRatio > 0.34 || brightness < 92) {
    return "dark";
  }

  if (brightRatio > 0.32 || (brightness > 190 && saturation < 0.2)) {
    return "bright";
  }

  if (woodRatio > 0.16 || (warmRatio > 0.38 && saturation > 0.14)) {
    return "natural";
  }

  if (warmth > 14 && warmRatio > neutralRatio * 0.7) {
    return "warm";
  }

  return "cool";
}

function getVisualQuality(metrics) {
  const light = metrics.brightness > 185 ? "采光很足，适合用浅色柜体放大通透感" : metrics.brightness < 95 ? "画面偏暗，文案要强调灯带、玻璃和深色质感" : "明暗适中，材质和柜体线条都比较容易被看见";
  const texture = metrics.woodRatio > 0.16 ? "木纹占比较高，适合突出温润、耐看和自然松弛感" : metrics.neutralRatio > 0.38 ? "中性色占比较高，适合走干净克制的高级感表达" : "色彩层次较明显，适合强调软装与柜体的搭配关系";
  const structure = metrics.verticalEdgeRatio > metrics.horizontalEdgeRatio * 1.12 ? "竖向线条更强，可强调一门到顶、拉伸层高" : metrics.horizontalEdgeRatio > metrics.verticalEdgeRatio * 1.12 ? "横向延展更明显，可强调整墙统一和空间放大" : "横竖线条均衡，可强调比例、留白和收口细节";

  return { light, texture, structure };
}

function inferRoom(fileName, image, metrics) {
  const selectedRoom = roomTypeSelect.value;
  if (selectedRoom !== "auto") {
    return selectedRoom;
  }

  const normalizedName = fileName.toLowerCase();
  const keywordMap = [
    ["厨房", ["kitchen", "厨房", "橱柜", "餐边", "厨", "pantry"]],
    ["衣帽间", ["cloak", "衣帽间", "walkin", "walk-in", "closet", "衣帽"]],
    ["儿童房", ["kids", "kid", "child", "children", "儿童", "书桌", "学习"]],
    ["玄关", ["entry", "entrance", "foyer", "玄关", "鞋柜", "hall", "porch"]],
    ["卧室", ["bedroom", "bed", "wardrobe", "卧室", "衣柜", "床", "主卧"]],
    ["客厅", ["living", "客厅", "电视", "tv", "sofa", "沙发"]]
  ];

  const matched = keywordMap.find(([, keywords]) => keywords.some((keyword) => normalizedName.includes(keyword)));
  if (matched) {
    return matched[0];
  }

  if (metrics.ratio > 1.45 && metrics.horizontalEdgeRatio >= metrics.verticalEdgeRatio * 0.88) {
    return "客厅";
  }

  if (metrics.ratio < 0.78 && metrics.verticalEdgeRatio > metrics.horizontalEdgeRatio * 1.08) {
    return "玄关";
  }

  if (metrics.woodRatio > 0.18 && metrics.verticalEdgeRatio > 0.18) {
    return "卧室";
  }

  return image.naturalWidth > image.naturalHeight * 1.18 ? "客厅" : "卧室";
}

function buildLayoutSuggestion(metrics) {
  if (metrics.ratio > 1.35) {
    return "横向大面柜体更占优势，封面建议突出整墙统一和空间延展感";
  }

  if (metrics.ratio < 0.82) {
    return "竖图更适合小红书信息流，封面建议放大一门到顶、留空区和灯带细节";
  }

  return "画面比例接近方图，正文适合拆解材质、收纳和动线三个卖点";
}

function buildHook(palette, room, metrics) {
  if (palette === "dark") return `深色${room}不压抑的关键`;
  if (palette === "bright") return `${room}显大显干净的定制思路`;
  if (palette === "natural") return `把松弛感装进${room}`;
  if (metrics.verticalEdgeRatio > metrics.horizontalEdgeRatio * 1.12) return `${room}一门到顶这样做更显高`;
  return `越住越舒服的${room}定制细节`;
}

function buildInsights(file) {
  const metrics = getImageMetrics(previewImage);
  const palette = classifyPalette(metrics);
  const room = inferRoom(file.name, previewImage, metrics);
  const profile = roomProfiles[room];
  const material = materialMap[palette];
  const style = styleMap[palette];
  const visualQuality = getVisualQuality(metrics);
  const layout = buildLayoutSuggestion(metrics);
  const hook = buildHook(palette, room, metrics);
  const confidence = roomTypeSelect.value === "auto" ? clamp(Math.round(62 + Math.abs(metrics.ratio - 1) * 16 + metrics.verticalEdgeRatio * 65 + metrics.woodRatio * 28), 68, 92) : 98;

  return {
    room,
    style,
    palette,
    paletteLabel: paletteLabels[palette],
    materials: material.join("、"),
    highlights: profile.highlights,
    storage: profile.storage,
    painPoint: profile.painPoint,
    sceneWords: profile.sceneWords,
    layout,
    hook,
    tags: profile.tags,
    visualQuality,
    confidence,
    metrics
  };
}

function toneSentence(tone) {
  const toneMap = {
    高级克制: "不堆复杂造型，只把比例、留白和材质做干净，镜头里高级，住进去也耐看。",
    真实种草: "这不是只适合样板间的设计，真正入住后会发现：顺手、好收、少显乱，才是定制柜最值的地方。",
    设计师专业: "从立面比例、收口关系到内部功能分区，每一步都围绕日常动线展开，视觉统一和使用效率可以同时成立。"
  };
  return toneMap[tone];
}

function positioningSentence(positioning) {
  const positioningMap = {
    中高端定制: "适合想要质感、收纳和长期耐看度都在线的中高端定制客户。",
    轻奢预算友好: "预算不必一味堆满，把钱花在门板质感、关键五金和高频收纳区，会更容易出效果。",
    高定品质: "如果定位高定，建议把灯光、玻璃、收口和内部配件一起讲清楚，用户更容易感知价值。"
  };
  return positioningMap[positioning];
}

function generateCopy(insights) {
  const tone = toneSelect.value;
  const positioning = positioningSelect.value;
  const [primaryHighlight, secondaryHighlight, thirdHighlight] = insights.highlights;
  const [primarySceneWord] = insights.sceneWords;
  const titleOptions = [
    `${insights.room}这样做全屋定制，收纳和高级感都稳了`,
    `被问爆的${primarySceneWord}：显大、好收、还很上镜`,
    `${insights.paletteLabel}${insights.room}｜越住越舒服的定制细节`
  ];

  const body = `这张图最适合提炼成「${insights.hook}」的小红书选题。

先说画面判断：整体是${insights.paletteLabel}的${insights.style}，我会把镜头重点放在${insights.materials}，再用${primarySceneWord}去承接用户一眼能看懂的卖点。${insights.visualQuality.light}；${insights.visualQuality.texture}。

用户最容易共鸣的痛点是：${insights.painPoint}。所以正文不要只写“好看”，要把解决方案讲具体：
1. ${primaryHighlight}，第一眼更完整，封面也更容易被点开。
2. ${secondaryHighlight}，不是为了造型牺牲实用，而是让日常拿取更顺手。
3. ${thirdHighlight}，拍照有层次，入住后也不容易乱。

收纳设计可以这样讲：${insights.storage}。${insights.visualQuality.structure}，${insights.layout}。

${toneSentence(tone)}${positioningSentence(positioning)}建议收藏给设计师沟通，少走弯路，也更容易把效果落地。`;

  const cover = `${insights.hook}
${insights.room}定制照着这 3 点拍
显大｜好收｜更像小红书爆款`;
  const tags = [
    ...insights.tags,
    `#${insights.style}`,
    `#${insights.paletteLabel}`,
    "#全屋定制设计",
    "#定制柜",
    "#小红书家居文案",
    "#装修灵感"
  ].join(" ");

  return { title: titleOptions.join("\n"), body, cover, tags };
}

function renderInsights(insights) {
  const insightItems = [
    ["空间判断", `${insights.room} · 置信度 ${insights.confidence}%`],
    ["风格倾向", `${insights.style} / ${insights.paletteLabel}`],
    ["材质识别", insights.materials],
    ["画面线索", insights.visualQuality.light],
    ["结构判断", insights.visualQuality.structure],
    ["小红书爆点", insights.hook],
    ["收纳亮点", insights.storage],
    ["封面建议", insights.layout]
  ];

  insightGrid.innerHTML = insightItems
    .map(([label, value]) => `<div class="insight-item"><span>${label}</span><strong>${value}</strong></div>`)
    .join("");
}

function renderCopy(copy) {
  titleOutput.textContent = copy.title;
  bodyOutput.textContent = copy.body;
  coverOutput.textContent = copy.cover;
  tagsOutput.textContent = copy.tags;
  emptyState.hidden = true;
  results.hidden = false;
}

function handleFile(file) {
  if (!file || !file.type.startsWith("image/")) {
    return;
  }

  const reader = new FileReader();
  reader.addEventListener("load", () => {
    uploadedImage = file;
    latestInsights = null;
    results.hidden = true;
    emptyState.hidden = false;
    generateButton.disabled = true;
    previewImage.addEventListener(
      "load",
      () => {
        previewCard.hidden = false;
        generateButton.disabled = false;
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
  latestInsights = null;
  imageInput.value = "";
  previewImage.removeAttribute("src");
  previewCard.hidden = true;
  generateButton.disabled = true;
  emptyState.hidden = false;
  results.hidden = true;
});

generateButton.addEventListener("click", () => {
  if (!uploadedImage) {
    return;
  }

  latestInsights = buildInsights(uploadedImage);
  const copy = generateCopy(latestInsights);
  renderInsights(latestInsights);
  renderCopy(copy);
});

roomTypeSelect.addEventListener("change", () => {
  if (!uploadedImage || !latestInsights) {
    return;
  }

  latestInsights = buildInsights(uploadedImage);
  renderInsights(latestInsights);
  renderCopy(generateCopy(latestInsights));
});

[toneSelect, positioningSelect].forEach((select) => {
  select.addEventListener("change", () => {
    if (!latestInsights) {
      return;
    }

    renderCopy(generateCopy(latestInsights));
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
