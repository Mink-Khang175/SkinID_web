const MAX_IMAGE_BYTES = 4 * 1024 * 1024;
const MAX_TOTAL_IMAGE_BYTES = 10 * 1024 * 1024;
const DAILY_LIMIT = 10;

function validateInput(data) {
  const images = data?.images;
  const skinType = typeof data?.skinType === 'string' ? data.skinType.trim().slice(0, 80) : '';
  if (!Array.isArray(images) || images.length !== 3) {
    throw new Error('Cần đúng 3 ảnh khuôn mặt.');
  }

  let totalBytes = 0;
  const cleanImages = images.map((image, index) => {
    if (typeof image !== 'string' || !/^[A-Za-z0-9+/]+={0,2}$/.test(image)) {
      throw new Error(`Ảnh #${index + 1} không phải JPEG base64 hợp lệ.`);
    }
    const bytes = Math.floor(image.length * 3 / 4);
    if (bytes > MAX_IMAGE_BYTES) throw new Error(`Ảnh #${index + 1} vượt quá 4 MB.`);
    totalBytes += bytes;
    return image;
  });

  if (totalBytes > MAX_TOTAL_IMAGE_BYTES) throw new Error('Tổng dung lượng ảnh vượt quá 10 MB.');
  return { images: cleanImages, skinType: skinType || 'Chưa xác định' };
}

function buildPrompt(skinType, baseline) {
  const baselineText = baseline
    ? `Kết quả gần nhất để tham khảo độ ổn định: điểm ${baseline.healthScore}/100, loại da ${baseline.skinType}, tuổi da ${baseline.skinAge}.`
    : 'Không có lịch sử phân tích trước đó.';

  return `Bạn là hệ thống hỗ trợ quan sát tình trạng da từ ảnh, không phải bác sĩ và không đưa ra chẩn đoán y khoa.
Kiểm tra cả 3 ảnh có phải cùng là khuôn mặt người rõ ràng hay không. Nếu không, trả về JSON {"isNotFace":true,"reason":"No human face detected"}.
Thông tin người dùng tự khai: ${skinType}. ${baselineText}
Nếu ảnh hợp lệ, chỉ trả về JSON tiếng Việt theo cấu trúc:
{
  "isNotFace": false,
  "skinTypeSummary": "mô tả ngắn",
  "analysis3Angles": "nhận xét 4-5 câu dựa trên vùng nhìn thấy",
  "activeIngredients": ["hoạt chất"],
  "overallGrade": "A|B|C|D|F",
  "overallGradeComment": "nhận xét ngắn",
  "skinConditions": [{"name":"tình trạng quan sát được","severity":"Nhẹ|Trung bình|Nặng","location":"vị trí","description":"mô tả"}],
  "recoveryTimeline": "khoảng thời gian tham khảo",
  "healthScore": 75,
  "skinAge": 26,
  "moisture": 65,
  "elasticity": 70,
  "sebum": 60,
  "pigmentation": 45,
  "pores": 60,
  "eyeWrinkles": 70,
  "nasolabialFolds": 68,
  "redness": 62,
  "acneBacteria": 55,
  "texture": 66,
  "darkCircles": 60,
  "melasma": 50,
  "detailedAdvice": {
    "moisture":{"why":"...","shouldDo":"...","avoid":"..."},
    "sebum":{"why":"...","shouldDo":"...","avoid":"..."},
    "pores":{"why":"...","shouldDo":"...","avoid":"..."},
    "pigmentation":{"why":"...","shouldDo":"...","avoid":"..."},
    "elasticity":{"why":"...","shouldDo":"...","avoid":"..."}
  }
}
Mọi chỉ số phải là số nguyên 0-100 và chỉ mang tính tham khảo từ điều kiện ảnh.`;
}

function validateAnalysis(value) {
  if (!value || typeof value !== 'object') throw new Error('Gemini không trả về JSON object.');
  if (value.isNotFace === true) return { isNotFace: true, reason: String(value.reason || 'No human face detected') };
  if (!value.skinTypeSummary || !value.analysis3Angles) throw new Error('Kết quả Gemini thiếu trường bắt buộc.');
  const metrics = ['healthScore', 'skinAge', 'moisture', 'elasticity', 'sebum', 'pigmentation', 'pores', 'eyeWrinkles', 'nasolabialFolds', 'redness', 'acneBacteria', 'texture', 'darkCircles', 'melasma'];
  for (const key of metrics) {
    const number = Number(value[key]);
    if (!Number.isFinite(number)) throw new Error(`Kết quả Gemini thiếu chỉ số ${key}.`);
    value[key] = Math.max(0, Math.min(100, Math.round(number)));
  }
  return value;
}

function utcDateKey(date = new Date()) {
  return date.toISOString().slice(0, 10);
}

module.exports = { DAILY_LIMIT, buildPrompt, utcDateKey, validateAnalysis, validateInput };
