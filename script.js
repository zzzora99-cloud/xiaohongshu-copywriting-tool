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
    highlights: ["整墙电视柜弱化杂物感", "开放格展示区让空间更有层次", "柜体与墙面同色更显大"],
    storage: "电视柜、家政柜与展示格组合，兼顾囤货、清洁工具和日常小物",
    tags: ["#客厅收纳", "#电视柜设计", "#全屋定制"]
  },
  厨房: {
    highlights: ["高柜嵌入电器减少台面凌乱", "吊地柜比例清爽", "动线围绕洗切炒更顺手"],
    storage: "高柜、抽屉拉篮和转角收纳分区，把锅具、电器、调味品都藏进柜里",
    tags: ["#厨房设计", "#餐边柜", "#橱柜定制"]
  },
  卧室: {
    highlights: ["一门到顶衣柜拉伸层高", "床头与衣柜保持统一立面", "低饱和色让睡眠区更安静"],
    storage: "长衣区、叠放区、被褥区和抽屉区独立规划，换季衣物也能有序收纳",
    tags: ["#卧室衣柜", "#衣柜设计", "#卧室装修"]
  },
  衣帽间: {
    highlights: ["开放与封闭收纳结合", "玻璃柜门提升精品感", "灯带让衣物陈列更像展厅"],
    storage: "挂衣、包包、饰品、抽屉和行李箱位分层规划，拿取路径更短",
    tags: ["#衣帽间设计", "#高定衣柜", "#收纳规划"]
  },
  玄关: {
    highlights: ["入户鞋柜承担第一眼高级感", "悬空区方便常穿鞋", "中部留空承接钥匙包袋"],
    storage: "鞋柜、换鞋凳、挂衣区和杂物柜一体化，进门动线更干净",
    tags: ["#玄关设计", "#鞋柜设计", "#入户收纳"]
  },
  儿童房: {
    highlights: ["书桌柜一体节省面积", "圆角与低饱和配色更温和", "成长型收纳适配不同年龄"],
    storage: "衣物、玩具、书本和学习用品分区，给孩子留出更多活动空间",
    tags: ["#儿童房设计", "#书桌柜", "#成长型儿童房"]
  }
};

const materialMap = {
  warm: ["暖木饰面", "奶油白门板", "柔光肤感膜"],
  cool: ["浅灰柜门", "岩板台面", "金属线条"],
  dark: ["深木纹", "哑光柜门", "黑钛玻璃"],
  bright: ["白色烤漆", "浅木纹", "通透玻璃门"]
};

const styleMap = {
  warm: "奶油原木风",
  cool: "现代极简风",
  dark: "轻奢高定风",
  bright: "法式简雅风"
};

function getAverageColor(image) {
  const canvas = document.createElement("canvas");
  const context = canvas.getContext("2d", { willReadFrequently: true });
  const sampleSize = 80;
  canvas.width = sampleSize;
  canvas.height = sampleSize;
  context.drawImage(image, 0, 0, sampleSize, sampleSize);
  const { data } = context.getImageData(0, 0, sampleSize, sampleSize);
  let red = 0;
  let green = 0;
  let blue = 0;
  let count = 0;

  for (let index = 0; index < data.length; index += 16) {
    red += data[index];
    green += data[index + 1];
    blue += data[index + 2];
    count += 1;
  }

  return {
    red: Math.round(red / count),
    green: Math.round(green / count),
    blue: Math.round(blue / count)
  };
}

function classifyPalette({ red, green, blue }) {
  const brightness = (red + green + blue) / 3;
  const warmth = red - blue;

  if (brightness < 92) {
    return "dark";
  }

  if (brightness > 190) {
    return "bright";
  }

  if (warmth > 16) {
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
    ["厨房", ["kitchen", "厨房", "橱柜", "餐边"]],
    ["卧室", ["bedroom", "卧室", "衣柜", "bed"]],
    ["衣帽间", ["cloak", "衣帽间", "walkin", "closet"]],
    ["玄关", ["entry", "玄关", "鞋柜", "hall"]],
    ["儿童房", ["kids", "child", "儿童", "书桌"]],
    ["客厅", ["living", "客厅", "电视", "tv"]]
  ];

  const matched = keywordMap.find(([, keywords]) => keywords.some((keyword) => normalizedName.includes(keyword)));
  if (matched) {
    return matched[0];
  }

  return image.naturalWidth > image.naturalHeight * 1.18 ? "客厅" : "卧室";
}

function buildInsights(file) {
  const color = getAverageColor(previewImage);
  const palette = classifyPalette(color);
  const room = inferRoom(file.name, previewImage);
  const profile = roomProfiles[room];
  const material = materialMap[palette];
  const style = styleMap[palette];
  const ratio = previewImage.naturalWidth / previewImage.naturalHeight;
  const layout = ratio > 1.2 ? "横向大面柜体，适合突出整体立面和空间延展感" : "竖向构图明显，适合强调一门到顶和收纳高度";
  const hook = palette === "dark" ? "把高级感做进柜子里" : palette === "bright" ? "小户型也能拥有通透高级感" : "越住越舒服的定制细节";

  return {
    room,
    style,
    materials: material.join("、"),
    highlights: profile.highlights,
    storage: profile.storage,
    layout,
    hook,
    palette,
    tags: profile.tags
  };
}

function toneSentence(tone) {
  const toneMap = {
    高级克制: "不堆砌复杂造型，只把比例、留白和材质做干净，越看越耐看。",
    真实种草: "真正入住后才知道，柜子好不好用，关键都藏在这些细节里。",
    设计师专业: "从立面比例、收口关系到内部功能分区，每一步都围绕日常动线展开。"
  };
  return toneMap[tone];
}

function generateCopy(insights) {
  const tone = toneSelect.value;
  const positioning = positioningSelect.value;
  const [primaryHighlight, secondaryHighlight, thirdHighlight] = insights.highlights;

  const title = `${insights.room}这样做全屋定制，真的把高级感和收纳都拿捏了`;
  const body = `这套${insights.room}定制方案，第一眼就很适合发小红书：${insights.style}的基调，加上${insights.materials}，整体干净但不寡淡。

我最想放大的 3 个亮点：
1. ${primaryHighlight}，视觉上更完整，也更显空间尺度。
2. ${secondaryHighlight}，不是为了好看牺牲实用，而是把日常拿取顺手度一起考虑。
3. ${thirdHighlight}，拍照有层次，入住后也不容易乱。

收纳设计上，${insights.storage}。${insights.layout}。

${toneSentence(tone)}如果你正在做${positioning}，这类方案很适合收藏给设计师参考：看起来高级，住起来也能保持清爽。`;
  const cover = `${insights.hook}\n${insights.room}定制这样拍更容易被收藏`;
  const tags = [
    ...insights.tags,
    `#${insights.style}`,
    "#全屋定制设计",
    "#定制柜",
    "#小红书家居文案",
    "#装修灵感"
  ].join(" ");

  return { title, body, cover, tags };
}

function renderInsights(insights) {
  const insightItems = [
    ["空间判断", insights.room],
    ["风格倾向", insights.style],
    ["材质识别", insights.materials],
    ["收纳亮点", insights.storage],
    ["小红书爆点", insights.hook],
    ["构图建议", insights.layout]
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
