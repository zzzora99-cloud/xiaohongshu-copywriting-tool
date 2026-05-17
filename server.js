const http = require("http");
const { readFile } = require("fs/promises");
const { extname, join, normalize } = require("path");

const PORT = Number(process.env.PORT || 4173);
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const OPENAI_MODEL = process.env.OPENAI_MODEL || "gpt-4.1-mini";
const MAX_UPLOAD_BYTES = 10 * 1024 * 1024;
const PUBLIC_FILES = new Set(["/", "/index.html", "/styles.css", "/script.js", "/.nojekyll"]);

const contentTypes = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  "": "text/plain; charset=utf-8"
};

function sendJson(response, statusCode, payload) {
  response.writeHead(statusCode, { "Content-Type": "application/json; charset=utf-8" });
  response.end(JSON.stringify(payload));
}

function readRequestBody(request) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    let total = 0;

    request.on("data", (chunk) => {
      total += chunk.length;
      if (total > MAX_UPLOAD_BYTES) {
        reject(new Error("图片过大，请上传 10MB 以内的图片。"));
        request.destroy();
        return;
      }

      chunks.push(chunk);
    });

    request.on("end", () => resolve(Buffer.concat(chunks)));
    request.on("error", reject);
  });
}

function parseMultipartForm(body, contentType) {
  const boundaryMatch = contentType.match(/boundary=(?:(?:"([^"]+)")|([^;]+))/i);
  if (!boundaryMatch) {
    throw new Error("缺少 multipart boundary。");
  }

  const boundary = Buffer.from(`--${boundaryMatch[1] || boundaryMatch[2]}`);
  const fields = {};
  const files = {};
  let cursor = 0;

  while (cursor < body.length) {
    const boundaryStart = body.indexOf(boundary, cursor);
    if (boundaryStart === -1) {
      break;
    }

    const partStart = boundaryStart + boundary.length;
    if (body.slice(partStart, partStart + 2).toString() === "--") {
      break;
    }

    const headerStart = partStart + 2;
    const headerEnd = body.indexOf(Buffer.from("\r\n\r\n"), headerStart);
    if (headerEnd === -1) {
      break;
    }

    const rawHeaders = body.slice(headerStart, headerEnd).toString("utf8");
    const nextBoundary = body.indexOf(boundary, headerEnd + 4);
    if (nextBoundary === -1) {
      break;
    }

    const contentEnd = Math.max(headerEnd + 4, nextBoundary - 2);
    const content = body.slice(headerEnd + 4, contentEnd);
    const disposition = rawHeaders.match(/content-disposition: form-data;([^\r\n]+)/i)?.[1] || "";
    const name = disposition.match(/name="([^"]+)"/)?.[1];
    const filename = disposition.match(/filename="([^"]*)"/)?.[1];
    const mimeType = rawHeaders.match(/content-type:\s*([^\r\n]+)/i)?.[1]?.trim() || "application/octet-stream";

    if (name && filename) {
      files[name] = { filename, mimeType, buffer: content };
    } else if (name) {
      fields[name] = content.toString("utf8");
    }

    cursor = nextBoundary;
  }

  return { fields, files };
}


function getResponseJsonSchema() {
  const stringArray = { type: "array", items: { type: "string" } };

  return {
    type: "object",
    additionalProperties: false,
    required: ["analysis", "copywriting"],
    properties: {
      analysis: {
        type: "object",
        additionalProperties: false,
        required: [
          "sourceConfidence",
          "spaceType",
          "style",
          "mainColors",
          "cabinetDesign",
          "materialHighlights",
          "storageHighlights",
          "lighting",
          "decorationHighlights",
          "xiaohongshuHooks",
          "targetAudience",
          "postingAngle"
        ],
        properties: {
          sourceConfidence: { type: "string" },
          spaceType: { type: "string" },
          style: { type: "string" },
          mainColors: stringArray,
          cabinetDesign: stringArray,
          materialHighlights: stringArray,
          storageHighlights: stringArray,
          lighting: { type: "string" },
          decorationHighlights: stringArray,
          xiaohongshuHooks: stringArray,
          targetAudience: stringArray,
          postingAngle: { type: "string" }
        }
      },
      copywriting: {
        type: "object",
        additionalProperties: false,
        required: ["titles", "body", "coverPhrases", "tags"],
        properties: {
          titles: stringArray,
          body: { type: "string" },
          coverPhrases: stringArray,
          tags: stringArray
        }
      }
    }
  };
}

function buildPrompt({ roomHint, tone, targetAudience }) {
  return `你是“全屋定制/高定木作/别墅大宅”方向的小红书内容总监，同时具备室内设计师的视觉判断能力。请先像设计师一样看图，再像真实装修博主一样写文案。

重要原则：
1. 只写图片中能直接观察到、或基于室内设计常识能合理推断的内容；不确定就写“可能/偏向”，不要编造品牌、尺寸、价格。
2. 禁止堆砌空泛词：高级、大气、品质感、满满高级感、轻奢范。必须改写为具体证据：比例、留白、柜门分缝、收口、材质光感、灯光层次、开放/封闭收纳关系。
3. 小红书语气要像懂行的人在分享，不要像招商广告或产品详情页。多写“为什么值得参考”“普通人容易忽略什么”“这个地方落地怎么避免翻车”。
4. 标题要有收藏欲和装修参考价值；正文开头 3 秒必须有钩子。

用户补充信息：
- 空间提示：${roomHint || "auto"}
- 发布口吻：${tone || "真实装修分享"}
- 目标客群：${targetAudience || "高审美装修人群"}

请输出严格 JSON，不要 Markdown，不要解释。字段必须完整，数组数量也要满足要求：
{
  "analysis": {
    "sourceConfidence": "说明哪些是图片可见，哪些是合理推断，控制在40字内",
    "spaceType": "客厅 / 餐厅 / 厨房 / 卧室 / 衣帽间 / 玄关 / 儿童房 / 书房 / 展厅 / 其他，只能选一个",
    "style": "意式轻奢 / 现代简约 / 奶油风 / 现代东方 / 法式 / 老钱风 / 高定木作 / 其他，只能选一个",
    "mainColors": ["米白/木色/深咖/灰色/黑色/暖白等，3个以内"],
    "cabinetDesign": ["从图里判断柜体做法，3-6条，如一门到顶、隐形拉手、开放格、玻璃柜、悬浮柜、嵌入式柜体、满墙柜"],
    "materialHighlights": ["从图里判断材质/光感，3-6条，如木皮、烤漆、混油、岩板、玻璃、金属、皮革、灯带"],
    "storageHighlights": ["收纳类型，3-5条，如分区收纳、隐藏收纳、展示收纳、家政收纳、衣物收纳、餐边收纳"],
    "lighting": "具体描述自然光/无主灯/灯带/重点照明如何影响柜体和材质",
    "decorationHighlights": ["4-6条图中可见或合理推断的落地亮点，每条都要具体到位置/做法/原因"],
    "xiaohongshuHooks": ["4-5条种草爆点，每条格式：卖点 + 为什么值得参考"],
    "targetAudience": ["大宅业主/别墅业主/高审美装修人群/新房装修用户/改善型住宅用户等，2-4个"],
    "postingAngle": "给账号发布时最建议的切入角度，控制在45字内"
  },
  "copywriting": {
    "titles": [
      "必须给5个标题；参考方向：装修前一定要看 / 高审美的人都在这样做 / 这不是样板间，是落地后的家 / 柜子做到这几个细节，家里直接高级一倍 / 全屋定制不是越满越好"
    ],
    "body": "一篇550-850字小红书正文。结构：3秒钩子开头；4个细节拆解；每个细节都要结合图片里的空间、柜体、材质、比例、灯光、收纳或落地效果；加入真实表达，如‘这个细节很多人会忽略’‘柜子不是做满就高级’‘真正显贵的是比例和留白’。不要广告腔，不要招商口吻。",
    "coverPhrases": ["4条封面短句，每条不超过12个汉字，有冲击力"],
    "tags": ["12-16个标签，必须包含#装修 #全屋定制 #柜子设计 #别墅装修 #高定木作 #空间美学"]
  }
}`;
}

function extractJson(text) {
  const trimmed = text.trim();
  if (trimmed.startsWith("{") && trimmed.endsWith("}")) {
    return JSON.parse(trimmed);
  }

  const jsonMatch = trimmed.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    throw new Error("视觉模型没有返回 JSON。 ");
  }

  return JSON.parse(jsonMatch[0]);
}

async function callOpenAI({ image, fields }) {
  if (!OPENAI_API_KEY) {
    throw new Error("后端未配置 OPENAI_API_KEY。 ");
  }

  const dataUrl = `data:${image.mimeType};base64,${image.buffer.toString("base64")}`;
  const response = await fetch("https://api.openai.com/v1/responses", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${OPENAI_API_KEY}`
    },
    body: JSON.stringify({
      model: OPENAI_MODEL,
      input: [
        {
          role: "user",
          content: [
            { type: "input_text", text: buildPrompt(fields) },
            { type: "input_image", image_url: dataUrl, detail: "high" }
          ]
        }
      ],
      text: {
        format: {
          type: "json_schema",
          name: "xiaohongshu_custom_home_copy",
          description: "Structured interior image analysis and Xiaohongshu copywriting for whole-house custom cabinetry.",
          schema: getResponseJsonSchema(),
          strict: true
        }
      },
      temperature: 0.72,
      max_output_tokens: 2600
    })
  });

  const payload = await response.json();
  if (!response.ok) {
    throw new Error(payload.error?.message || "OpenAI 视觉分析请求失败。 ");
  }

  const outputText = payload.output_text || payload.output?.flatMap((item) => item.content || []).find((item) => item.type === "output_text")?.text;
  if (!outputText) {
    throw new Error("OpenAI 响应缺少文本输出。 ");
  }

  return extractJson(outputText);
}

async function handleGenerate(request, response) {
  const contentType = request.headers["content-type"] || "";
  if (!contentType.includes("multipart/form-data")) {
    sendJson(response, 415, { error: "请使用 multipart/form-data 上传图片。" });
    return;
  }

  try {
    const body = await readRequestBody(request);
    const { fields, files } = parseMultipartForm(body, contentType);
    const image = files.image;

    if (!image) {
      sendJson(response, 400, { error: "缺少 image 文件字段。" });
      return;
    }

    if (!/^image\/(png|jpe?g|webp|gif)$/i.test(image.mimeType)) {
      sendJson(response, 400, { error: "仅支持 PNG、JPG、WEBP 或 GIF 图片。" });
      return;
    }

    const result = await callOpenAI({ image, fields });
    sendJson(response, 200, { ...result, source: "openai" });
  } catch (error) {
    const statusCode = error.message.includes("OPENAI_API_KEY") ? 503 : 500;
    sendJson(response, statusCode, {
      error: error.message,
      source: "backend-error",
      notice: "前端会自动切换为本地兜底分析；生产环境请在后端配置 OPENAI_API_KEY。"
    });
  }
}

async function serveStatic(request, response) {
  const url = new URL(request.url, `http://${request.headers.host}`);
  const pathname = url.pathname === "/" ? "/index.html" : url.pathname;

  if (!PUBLIC_FILES.has(url.pathname) && !PUBLIC_FILES.has(pathname)) {
    response.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
    response.end("Not found");
    return;
  }

  const safePath = normalize(pathname).replace(/^\.\.(\/|\\|$)/, "");
  const filePath = join(process.cwd(), safePath);
  const extension = extname(filePath);
  const content = await readFile(filePath);
  response.writeHead(200, { "Content-Type": contentTypes[extension] || "application/octet-stream" });
  response.end(content);
}

const server = http.createServer(async (request, response) => {
  if (request.method === "POST" && request.url?.startsWith("/api/generate")) {
    await handleGenerate(request, response);
    return;
  }

  if (request.method === "GET" || request.method === "HEAD") {
    try {
      await serveStatic(request, response);
    } catch {
      response.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
      response.end("Not found");
    }
    return;
  }

  response.writeHead(405, { "Content-Type": "text/plain; charset=utf-8" });
  response.end("Method not allowed");
});

server.listen(PORT, () => {
  console.log(`全屋定制小红书文案生成器已启动：http://localhost:${PORT}`);
});
