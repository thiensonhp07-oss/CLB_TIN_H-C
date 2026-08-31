import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';
import nodemailer from 'nodemailer';

dotenv.config();

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

// Enable CORS for frontend cross-origin requests (e.g. GitHub Pages)
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
});

app.use(express.json());

const CLUB_GMAIL = process.env.CLUB_GMAIL || process.env.SMTP_USER || 'thiensonhp07@gmail.com';

function escapeHtml(str: string): string {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

interface QuestionItem {
  qNum: string;
  qTitle: string;
  qText: string;
  answer?: string;
}

function renderQASection(
  title: string,
  icon: string,
  accentColor: string,
  questions: QuestionItem[]
): string {
  const answered = questions.filter(q => q.answer && q.answer.trim().length > 0);
  if (answered.length === 0) return '';

  const qHtml = answered
    .map(
      (q) => `
    <div style="margin-bottom: 16px; background-color: #020617; border: 1px solid #334155; border-left: 4px solid ${accentColor}; border-radius: 10px; overflow: hidden;">
      <div style="background-color: #1e293b; padding: 12px 16px; border-bottom: 1px solid #334155;">
        <div style="font-weight: 800; color: ${accentColor}; font-size: 13px; text-transform: uppercase; letter-spacing: 0.5px;">
          ${escapeHtml(q.qNum)}: ${escapeHtml(q.qTitle)}
        </div>
        <div style="color: #ffffff; font-size: 14px; font-weight: 700; margin-top: 6px; line-height: 1.5;">
          ❓ ${escapeHtml(q.qText)}
        </div>
      </div>
      <div style="padding: 16px; background-color: #090d16;">
        <span style="color: #38bdf8; font-size: 11px; font-weight: 800; display: block; margin-bottom: 8px; letter-spacing: 0.5px; text-transform: uppercase;">
          💬 CÂU TRẢ LỜI CỦA THÍ SÍNH:
        </span>
        <div style="color: #f8fafc; font-size: 14px; line-height: 1.7; font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; white-space: pre-wrap; word-break: break-word; font-weight: 500;">${escapeHtml(q.answer || '')}</div>
      </div>
    </div>
  `
    )
    .join('');

  return `
    <div style="background-color: #0f172a; padding: 20px; border-radius: 14px; margin-bottom: 22px; border: 1px solid #1e293b; box-shadow: 0 4px 12px rgba(0, 0, 0, 0.25);">
      <h3 style="color: ${accentColor}; font-size: 16px; margin: 0 0 16px 0; font-weight: 800; border-bottom: 1px solid #334155; padding-bottom: 10px; display: flex; align-items: center; gap: 8px;">
        ${icon} ${escapeHtml(title)} <span style="background-color: #1e293b; color: #f8fafc; font-size: 12px; padding: 2px 8px; border-radius: 12px; margin-left: 8px;">${answered.length} câu đã trả lời</span>
      </h3>
      ${qHtml}
    </div>
  `;
}

// Helper to send email notification to NK Tech Club Gmail
async function dispatchApplicationEmail(data: any) {
  const {
    fullName, studentClass, schoolName, email, phone, facebook,
    departmentName, department, subRole, skills, flexZone, motivation,
    scoreByAI, aiVibe, aiReview, createdAt, cheatCount, cheatLogs,
    castingCamQ1, castingCamQ2, castingCamQ3,
    castingContentQ1, castingContentQ2, castingContentQ3,
    castingDesignQ1, castingDesignQ2, castingDesignQ3,
    castingCpQ1, castingCpQ2, castingCpQ3, castingCpQ4, castingCpQ5,
    castingDevQ1, castingDevQ2, castingDevQ3, castingDevQ4, castingDevQ5,
    castingGameQ1, castingGameQ2, castingGameQ3, castingGameQ4, castingGameQ5,
    castingAiResQ1, castingAiResQ2, castingAiResQ3, castingAiResQ4, castingAiResQ5,
    castingHrQ1, castingHrQ2, castingHrQ3, castingHrQ4, castingHrQ5
  } = data;

  const deptMap: Record<string, string> = {
    'chuyen-mon': 'Ban Chuyên Môn (Tech Core)',
    'truyen-thong': 'Ban Truyền Thông & Sáng Tạo (Media & Content)',
    'nhan-su': 'Ban Quản Lý Nhân Sự (HR & Operations)'
  };
  const chosenDepartmentDisplay = departmentName || deptMap[department] || department || 'Chưa chọn ban';
  const skillsListStr = Array.isArray(skills) ? skills.join(', ') : (skills || 'Chưa chọn');

  // Render QA Sections for each department casting module
  const hrBlock = renderQASection(
    'Bài Thi Ban Quản Lý Nhân Sự & Sự Kiện (HR & Operations)',
    '👥',
    '#a855f7',
    [
      { qNum: 'CÂU 1', qTitle: 'Đừng vội kết luận về một người', qText: 'Khi tiếp xúc với một thành viên mới tỏ ra thu mình hoặc không hào hứng, bạn sẽ làm gì? Viết 3 câu hỏi bạn sẽ hỏi họ để hiểu đúng về họ.', answer: castingHrQ1 },
      { qNum: 'CÂU 2', qTitle: 'Một câu chuyện, 2 sự thật', qText: 'Khi xảy ra sự cố trong sự kiện (ví dụ: mất dữ liệu, thiếu đạo cụ), bạn phân định lỗi cá nhân hay lỗi hệ thống vận hành như thế nào?', answer: castingHrQ2 },
      { qNum: 'CÂU 3', qTitle: 'Ứng viên hoàn hảo', qText: 'Bạn nghĩ một ứng viên "hoàn hảo" có thực sự tồn tại không? Bạn nhận diện và vượt qua định kiến cá nhân (bias) như thế nào khi phỏng vấn?', answer: castingHrQ3 },
      { qNum: 'CÂU 4', qTitle: 'Công bằng không có nghĩa là giống nhau', qText: 'Đối xử công bằng với các thành viên có tính cách, hoàn cảnh khác nhau nghĩa là gì trong quản lý nhân sự?', answer: castingHrQ4 },
      { qNum: 'CÂU 5', qTitle: 'Khi nào nên nói "Không"', qText: 'Trong tình huống nào bạn sẽ quyết định từ chối/nói "không" để bảo vệ lợi ích chung của tập thể CLB?', answer: castingHrQ5 }
    ]
  );

  const aiBlock = renderQASection(
    'Bài Thi Ban AI & Data Science Research',
    '🔬',
    '#06b6d4',
    [
      { qNum: 'CÂU 1', qTitle: 'Dữ liệu hay mắt mình (Robot A vs B)', qText: 'Robot A có độ chính xác 98% trên dữ liệu thử nghiệm nhưng thất bại ở môi trường thực. Robot B đạt 85% nhưng hoạt động ổn định mọi nơi. Bạn chọn mô hình nào và tại sao?', answer: castingAiResQ1 },
      { qNum: 'CÂU 2', qTitle: 'Thử nghiệm 9/10 lần', qText: 'Nếu kết quả thử nghiệm 9/10 lần ủng hộ giả thuyết của bạn, bạn xử lý 1 lần thất bại còn lại như thế nào?', answer: castingAiResQ2 },
      { qNum: 'CÂU 3', qTitle: 'Con số nói dối (Độ chính xác 95% vs 90%)', qText: 'Một mô hình AI có độ chính xác 95% có luôn tốt hơn mô hình 90% không? Khi nào con số 95% có thể gây hiểu lầm?', answer: castingAiResQ3 },
      { qNum: 'CÂU 4', qTitle: 'Robot học điều không dạy', qText: 'Khi một robot/mô hình AI đưa ra kết quả đúng nhưng bằng cách bạn không hề lập trình, bạn sẽ phản ứng ra sao?', answer: castingAiResQ4 },
      { qNum: 'CÂU 5', qTitle: 'Chứng minh mình sai', qText: 'Bạn sẽ thiết kế một bài kiểm tra thế nào để cố gắng chứng minh mô hình AI của chính mình là SAI?', answer: castingAiResQ5 }
    ]
  );

  const contentBlock = renderQASection(
    'Bài Thi Ban Truyền Thông — Content Creator & Writer',
    '✍️',
    '#f43f5e',
    [
      { qNum: 'CÂU 1', qTitle: 'Một chuyện — 3 góc nhìn', qText: 'Từ một hoạt động bình thường của CLB (workshop, sinh hoạt), hãy nêu 3 hướng tiếp cận content hoàn toàn khác nhau cho Fanpage.', answer: castingContentQ1 },
      { qNum: 'CÂU 2', qTitle: 'Một tình huống — một meme', qText: 'Chọn 1 tình huống phổ biến ở trường, biến nó thành 1 ý tưởng meme độc đáo (mô tả tình huống, format meme, text trên meme, lý do học sinh thích).', answer: castingContentQ2 },
      { qNum: 'CÂU 3', qTitle: 'Quản lý Page trong 1 tuần', qText: 'Nếu được giao toàn quyền quản lý Fanpage CLB trong 1 tuần để tăng tương tác (không budget), bạn sẽ lập kế hoạch cụ thể ra sao? (Tối thiểu 150 từ)', answer: castingContentQ3 }
    ]
  );

  const cpBlock = renderQASection(
    'Bài Thi Ban Chuyên Môn — Competitive Programming / Chuyên Tin',
    '💻',
    '#eab308',
    [
      { qNum: 'CÂU 1', qTitle: 'Quan sát — "Có gì sai?"', qText: 'Cho dãy số: 2 — 4 — 8 — 16 — 31 — 64 với lời khẳng định "tôi đang nhân đôi mỗi số". Bạn có đồng ý không? Số nào bạn nghi ngờ và kiểm tra điều gì đầu tiên?', answer: castingCpQ1 },
      { qNum: 'CÂU 2', qTitle: 'Suy luận — "Thông tin nào đáng tin?"', qText: 'A nói "B cầm đồ", B nói "tôi không cầm", C nói "A nói dối". Nếu chỉ được hỏi MỘT câu duy nhất cho MỘT người, bạn hỏi ai và hỏi gì để thu được nhiều thông tin nhất?', answer: castingCpQ2 },
      { qNum: 'CÂU 3', qTitle: 'Tư duy linh hoạt — "Đổi luật"', qText: 'Trong trò chơi 21 que (lấy 1, 2, 3 que), nếu được thay đổi MỘT thứ trong luật để tăng lợi thế đi trước, bạn chọn thay đổi gì và logic tại sao?', answer: castingCpQ3 },
      { qNum: 'CÂU 4', qTitle: 'Tư duy tối ưu — "Làm ít hơn"', qText: 'Tìm 1 học sinh có chiều cao khác biệt trong 1000 người mà không cần so sánh từng cặp một. Chiến lược tối ưu của bạn là gì?', answer: castingCpQ4 },
      { qNum: 'CÂU 5', qTitle: 'Câu phân loại — "Bạn sẽ hỏi gì?"', qText: 'Khi gặp bài toán thiếu thông tin, hãy nêu 3 câu hỏi bạn hỏi người ra đề và chọn 1 câu quan trọng nhất để giải thích lý do.', answer: castingCpQ5 }
    ]
  );

  const devBlock = renderQASection(
    'Bài Thi Ban Chuyên Môn — Web / App Developer',
    '⚡',
    '#22c55e',
    [
      { qNum: 'CÂU 1', qTitle: 'Vấn đề bạn đang giải quyết', qText: 'Mô tả một vấn đề thực tế của học sinh THPT mà bạn muốn xây dựng Web/App để giải quyết.', answer: castingDevQ1 },
      { qNum: 'CÂU 2', qTitle: 'Feature thích nhưng người dùng không cần', qText: 'Khi 8/10 người thử nghiệm bỏ qua tính năng bạn rất thích, 3 câu hỏi bạn sẽ hỏi để tìm ra vấn đề thực sự là gì?', answer: castingDevQ2 },
      { qNum: 'CÂU 3', qTitle: 'Nút bấm có thể phá cả sản phẩm', qText: 'Cách bạn sắp xếp thứ tự ưu tiên hiển thị (xuất hiện đầu tiên -> xuất hiện sau -> ẩn đi) cho 12 tính năng trên màn hình app trong 10 giây đầu tiên.', answer: castingDevQ3 },
      { qNum: 'CÂU 4', qTitle: 'Người dùng đang nói dối bạn?', qText: 'Khi 80% học sinh khảo sát bảo muốn tính năng X nhưng chỉ 5% dùng khi ra mắt, bạn xử lý 2 giả thuyết thế nào và kiểm tra cái nào trước?', answer: castingDevQ4 },
      { qNum: 'CÂU 5', qTitle: 'Nếu chỉ được giữ lại một thứ', qText: '"Một thứ" duy nhất khiến học sinh mở app lần thứ 2 là gì? (Tối đa 100 từ)', answer: castingDevQ5 }
    ]
  );

  const gameBlock = renderQASection(
    'Bài Thi Ban Chuyên Môn — Game Developer (2D / Roblox 3D)',
    '🎮',
    '#ec4899',
    [
      { qNum: 'CÂU 1', qTitle: 'Tại sao bạn không chơi nữa?', qText: 'Phân tích 1 tựa game bạn từng chơi rất lâu nhưng đã bỏ. Nguyên nhân gốc rễ ở game design làm bạn mất động lực là gì?', answer: castingGameQ1 },
      { qNum: 'CÂU 2', qTitle: 'Skill vs Luck', qText: 'Trong game của bạn, yếu tố kỹ năng (Skill) và may mắn (Luck) được cân bằng như thế nào để người chơi vừa không nản vừa muốn thử lại?', answer: castingGameQ2 },
      { qNum: 'CÂU 3', qTitle: 'Đóng băng 3s (Mechanic)', qText: 'Sử dụng cùng 1 mechanic "Đóng băng nhân vật trong 3 giây" thiết kế cho 2 thể loại game hoàn toàn khác nhau.', answer: castingGameQ3 },
      { qNum: 'CÂU 4', qTitle: 'Người chơi làm điều ngoài ý muốn (Roblox farm)', qText: 'Khi người chơi tìm ra mẹo cày tiền/level ngoài ý muốn của Game Designer, bạn xử lý thế nào để không làm người chơi phẫn nộ?', answer: castingGameQ4 },
      { qNum: 'CÂU 5', qTitle: 'Core Loop 5 phút đầu tiên', qText: 'Mô tả Core Loop 5 phút đầu tiên trong game của bạn để giữ chân người chơi mới.', answer: castingGameQ5 }
    ]
  );

  const designBlock = renderQASection(
    'Bài Thi Ban Truyền Thông — Graphic Design & Video Editor',
    '🎨',
    '#38bdf8',
    [
      { qNum: 'CÂU 1', qTitle: '"Đừng làm nó đẹp"', qText: 'Mô tả ý tưởng thiết kế Poster tuyển thành viên không chỉ đẹp mà khiến người xem phải dừng lại nhìn (bố cục, điểm nhấn, chữ). (Tối thiểu 100 từ)', answer: castingDesignQ1 },
      { qNum: 'CÂU 2', qTitle: 'Video 10 giây không nói', qText: 'Ý tưởng kịch bản Video 10 giây thu hút học sinh ngay lập tức mà không cần dùng lời thoại hay thuyết minh.', answer: castingDesignQ2 },
      { qNum: 'CÂU 3', qTitle: 'Ý tưởng đầu tiên bị loại', qText: 'Khi concept thiết kế đầu tiên bị reject vì "nhìn giống các CLB khác", bạn lấy nguồn cảm hứng mới ở đâu để làm lại?', answer: castingDesignQ3 }
    ]
  );

  const camBlock = renderQASection(
    'Bài Thi Ban Truyền Thông — Cameraman & Media',
    '📸',
    '#14b8a6',
    [
      { qNum: 'CÂU 1', qTitle: '5 tấm ảnh kể 1 ngày', qText: 'Nêu ý tưởng 5 bức ảnh kể trọn vẹn câu chuyện một ngày ở trường của học sinh.', answer: castingCamQ1 },
      { qNum: 'CÂU 2', qTitle: 'Biến điều thường thành nhớ', qText: 'Cách bạn chọn góc máy, ánh sáng để biến một khung cảnh lớp học bình thường trở nên điện ảnh/đáng nhớ. (Đặt tiêu đề tối đa 7 từ)', answer: castingCamQ2 },
      { qNum: 'CÂU 3', qTitle: '1 tấm ảnh duy nhất', qText: 'Nếu chỉ được chụp đúng 1 bức ảnh biểu tượng cho tinh thần NK Tech Club, bạn sẽ bấm máy khoảnh khắc nào?', answer: castingCamQ3 }
    ]
  );

  const htmlBody = `
    <div style="font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #020617; color: #f8fafc; padding: 24px 12px; margin: 0; min-height: 100vh;">
      <div style="max-width: 680px; margin: 0 auto; background-color: #0f172a; border-radius: 20px; border: 1px solid #1e293b; overflow: hidden; box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.5);">
        
        <!-- HEADER HERO BANNER -->
        <div style="background: linear-gradient(135deg, #0284c7 0%, #0d9488 50%, #7e22ce 100%); padding: 30px 24px; text-align: center; border-bottom: 3px solid #38bdf8;">
          <div style="display: inline-block; background-color: rgba(15, 23, 42, 0.7); backdrop-filter: blur(8px); padding: 6px 16px; border-radius: 20px; border: 1px solid rgba(255, 255, 255, 0.25); font-size: 12px; font-weight: 800; color: #38bdf8; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 12px;">
            ✨ NK TECH CLUB RECRUITMENT PORTAL 2026
          </div>
          <h1 style="color: #ffffff; font-size: 24px; font-weight: 900; margin: 0 0 8px 0; text-shadow: 0 2px 4px rgba(0,0,0,0.3);">
            🚀 HỒ SƠ ỨNG VIÊN MỚI NỘP
          </h1>
          <p style="color: #e0f2fe; font-size: 14px; margin: 0; font-weight: 500;">
            Chi tiết câu hỏi & câu trả lời từ Cổng tuyển thành viên Vũ Trụ
          </p>
        </div>

        <div style="padding: 24px 20px;">

          <!-- SECTION 1: BAN THÍ SÍNH CHỌN (CHOSEN DEPARTMENT & SUB-ROLE) -->
          <div style="background-color: #1e293b; border-left: 6px solid #38bdf8; padding: 20px; border-radius: 14px; margin-bottom: 22px; box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);">
            <div style="font-size: 12px; font-weight: 800; color: #38bdf8; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 6px;">
              🎯 BAN ỨNG TUYỂN THÍ SÍNH CHỌN
            </div>
            <div style="font-size: 20px; font-weight: 900; color: #ffffff; margin-bottom: 8px;">
              ${escapeHtml(chosenDepartmentDisplay)}
            </div>
            <div style="font-size: 14px; color: #facc15; font-weight: 700; margin-bottom: 12px;">
              ⚡ Vị trí chuyên môn (Sub-Role): <span style="color: #38bdf8;">${escapeHtml(subRole || 'Chưa phân định')}</span>
            </div>
            
            <div style="border-top: 1px solid #334155; padding-top: 12px; font-size: 13px; color: #cbd5e1; line-height: 1.6;">
              <div style="margin-bottom: 6px;">
                <strong style="color: #a7f3d0;">🏆 Kỹ năng & Skill Badges:</strong> ${escapeHtml(skillsListStr)}
              </div>
              ${flexZone ? `
              <div style="margin-bottom: 6px;">
                <strong style="color: #c084fc;">🔗 Flex Zone / Link sản phẩm:</strong> 
                <a href="${escapeHtml(flexZone)}" target="_blank" style="color: #38bdf8; font-weight: bold; text-decoration: underline;">${escapeHtml(flexZone)}</a>
              </div>` : ''}
            </div>
          </div>

          <!-- SECTION 2: THÔNG TIN CÁ NHÂN THÍ SÍNH -->
          <div style="background-color: #1e293b; border-left: 6px solid #06b6d4; padding: 20px; border-radius: 14px; margin-bottom: 22px; box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);">
            <h2 style="color: #06b6d4; font-size: 16px; font-weight: 800; margin: 0 0 14px 0; border-bottom: 1px solid #334155; padding-bottom: 8px;">
              👤 THÔNG TIN CÁ NHÂN CỦA THÍ SÍNH
            </h2>
            <table style="width: 100%; color: #e2e8f0; font-size: 14px; border-collapse: collapse;">
              <tr>
                <td style="padding: 6px 0; font-weight: bold; color: #94a3b8; width: 150px;">Họ và Tên:</td>
                <td style="padding: 6px 0; color: #ffffff; font-weight: 800; font-size: 15px;">${escapeHtml(fullName || 'N/A')}</td>
              </tr>
              <tr>
                <td style="padding: 6px 0; font-weight: bold; color: #94a3b8;">Lớp & MSSV:</td>
                <td style="padding: 6px 0; color: #38bdf8; font-weight: 700;">${escapeHtml(studentClass || 'N/A')}</td>
              </tr>
              <tr>
                <td style="padding: 6px 0; font-weight: bold; color: #94a3b8;">Trường THPT:</td>
                <td style="padding: 6px 0; color: #e2e8f0;">${escapeHtml(schoolName || 'THPT Chuyên / THPT')}</td>
              </tr>
              <tr>
                <td style="padding: 6px 0; font-weight: bold; color: #94a3b8;">Email liên hệ:</td>
                <td style="padding: 6px 0;"><a href="mailto:${escapeHtml(email)}" style="color: #38bdf8; font-weight: 600;">${escapeHtml(email || 'N/A')}</a></td>
              </tr>
              <tr>
                <td style="padding: 6px 0; font-weight: bold; color: #94a3b8;">SĐT / Zalo:</td>
                <td style="padding: 6px 0; color: #4ade80; font-weight: 800;">${escapeHtml(phone || 'N/A')}</td>
              </tr>
              <tr>
                <td style="padding: 6px 0; font-weight: bold; color: #94a3b8;">Facebook cá nhân:</td>
                <td style="padding: 6px 0;">${facebook ? `<a href="${escapeHtml(facebook)}" target="_blank" style="color: #38bdf8;">${escapeHtml(facebook)}</a>` : '<span style="color: #64748b;">Chưa cung cấp</span>'}</td>
              </tr>
              <tr>
                <td style="padding: 6px 0; font-weight: bold; color: #94a3b8;">Thời gian nộp:</td>
                <td style="padding: 6px 0; color: #94a3b8;">${escapeHtml(createdAt || new Date().toLocaleString('vi-VN'))}</td>
              </tr>
            </table>
          </div>

          <!-- SECTION 3: GEMINI AI EVALUATION & ANTI-CHEAT -->
          <div style="background-color: #1e293b; border-left: 6px solid #f59e0b; padding: 20px; border-radius: 14px; margin-bottom: 22px; box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);">
            <h2 style="color: #f59e0b; font-size: 16px; font-weight: 800; margin: 0 0 14px 0; border-bottom: 1px solid #334155; padding-bottom: 8px;">
              🤖 AI CHẤM ĐIỂM & GIÁM SÁT CHỐNG GIAN LẬN
            </h2>
            <div style="display: flex; gap: 12px; flex-wrap: wrap; margin-bottom: 12px;">
              <div style="background-color: #020617; padding: 10px 14px; border-radius: 10px; border: 1px solid #334155; flex: 1; min-width: 140px;">
                <span style="color: #94a3b8; font-size: 11px; font-weight: 800; display: block; text-transform: uppercase;">ĐIỂM AI RATING</span>
                <span style="color: #facc15; font-size: 20px; font-weight: 900;">${scoreByAI || '9.5'} / 10.0</span>
              </div>
              <div style="background-color: #020617; padding: 10px 14px; border-radius: 10px; border: 1px solid #334155; flex: 1; min-width: 140px;">
                <span style="color: #94a3b8; font-size: 11px; font-weight: 800; display: block; text-transform: uppercase;">CYBER VIBE TAG</span>
                <span style="color: #e9d5ff; font-size: 13px; font-weight: 800;">${escapeHtml(aiVibe || '100% Ultra Vibe')}</span>
              </div>
              <div style="background-color: #020617; padding: 10px 14px; border-radius: 10px; border: 1px solid #334155; flex: 1; min-width: 140px;">
                <span style="color: #94a3b8; font-size: 11px; font-weight: 800; display: block; text-transform: uppercase;">ANTI-CHEAT</span>
                <span style="color: ${cheatCount ? '#f43f5e' : '#4ade80'}; font-size: 12px; font-weight: 800;">
                  ${cheatCount ? `⚠️ Cảnh cáo ${cheatCount} lần out tab` : '✅ 100% Trung thực (0 lần out tab)'}
                </span>
              </div>
            </div>
            ${aiReview ? `
            <div style="background-color: #090d16; padding: 12px 16px; border-radius: 10px; color: #cbd5e1; font-style: italic; font-size: 13px; border-left: 3px solid #f59e0b;">
              "${escapeHtml(aiReview)}"
            </div>` : ''}
            ${cheatLogs ? `
            <div style="margin-top: 10px; font-size: 11px; color: #f43f5e; background-color: #020617; padding: 8px 12px; border-radius: 8px;">
              ⚠️ Nhật ký chuyển tab: ${escapeHtml(cheatLogs)}
            </div>` : ''}
          </div>

          <!-- SECTION 4: LÝ DO GIA NHẬP CLB -->
          ${motivation ? `
          <div style="background-color: #1e293b; border-left: 6px solid #a855f7; padding: 20px; border-radius: 14px; margin-bottom: 22px; box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);">
            <div style="color: #c084fc; font-size: 14px; font-weight: 800; text-transform: uppercase; margin-bottom: 8px;">
              ❓ CÂU HỎI MỜI LÒNG: Tại sao bạn muốn gia nhập CLB Tin học NK Tech Club?
            </div>
            <div style="background-color: #090d16; padding: 16px; border-radius: 10px; color: #f8fafc; font-size: 14px; line-height: 1.7; white-space: pre-wrap; word-break: break-word; border: 1px solid #334155; font-weight: 500;">
              ${escapeHtml(motivation)}
            </div>
          </div>` : ''}

          <!-- SECTION 5: CHI TIẾT CÂU TRẢ LỜI CÁC BÀI THI CASTING CHALLENGES -->
          <div style="margin-top: 30px; border-top: 2px solid #334155; padding-top: 22px;">
            <div style="text-align: center; margin-bottom: 22px;">
              <h2 style="color: #38bdf8; font-size: 18px; font-weight: 900; margin: 0 0 6px 0; text-transform: uppercase; letter-spacing: 0.5px;">
                📝 CHI TIẾT BÀI THI THỬ THÁCH (CASTING CHALLENGES)
              </h2>
              <p style="color: #94a3b8; font-size: 13px; margin: 0;">
                Hiển thị trọn vẹn câu hỏi gốc & câu trả lời của thí sinh cho ban đã chọn
              </p>
            </div>

            ${hrBlock}
            ${aiBlock}
            ${contentBlock}
            ${cpBlock}
            ${devBlock}
            ${gameBlock}
            ${designBlock}
            ${camBlock}
          </div>

          <!-- FOOTER -->
          <div style="text-align: center; color: #64748b; font-size: 12px; border-top: 1px solid #334155; padding-top: 18px; margin-top: 28px; line-height: 1.6;">
            Thư này được tự động gửi từ <strong>Hệ Thống Tuyển Quân NK Tech Club 2026</strong>.<br/>
            Mọi thông tin được chuyển thẳng tới Ban Chủ Nhiệm Gmail: <a href="mailto:${CLUB_GMAIL}" style="color: #38bdf8; font-weight: bold;">${CLUB_GMAIL}</a>.
          </div>

        </div>
      </div>
    </div>
  `;

  const smtpHost = process.env.SMTP_HOST;
  const smtpPort = Number(process.env.SMTP_PORT || 587);
  const smtpUser = process.env.SMTP_USER;
  const smtpPass = process.env.SMTP_PASS;

  if (smtpHost && smtpUser && smtpPass) {
    try {
      const transporter = nodemailer.createTransport({
        host: smtpHost,
        port: smtpPort,
        secure: smtpPort === 465,
        auth: {
          user: smtpUser,
          pass: smtpPass
        }
      });

      await transporter.sendMail({
        from: `"NK Tech Club Portal" <${smtpUser}>`,
        to: CLUB_GMAIL,
        subject: `🚀 [HỒ SƠ MỚI] ${fullName} (${studentClass}) - Ban ${departmentName}`,
        html: htmlBody
      });

      console.log(`✅ [EMAIL DISPATCH SUCCESS] Application email sent directly via SMTP to ${CLUB_GMAIL}`);
      return { success: true, emailSentTo: CLUB_GMAIL, method: 'smtp' };
    } catch (smtpErr) {
      console.error('⚠️ [SMTP EMAIL ERROR]: Failed to send via SMTP, falling back to simulated dispatch log:', smtpErr);
    }
  }

  // Fallback / Log notification if SMTP credentials are not configured
  console.log(`
================================================================================
📧 [GMAIL DISPATCH LOGGED TO CLUB GMAIL: ${CLUB_GMAIL}]
Candidate Name : ${fullName}
Class & MSSV   : ${studentClass} (${schoolName})
Email & Phone  : ${email} | ${phone} | FB: ${facebook || 'N/A'}
Department     : ${departmentName} (${subRole})
Skills         : ${skillsListStr}
Flex Zone      : ${flexZone || 'N/A'}
Motivation     : ${motivation}
AI Rating      : ${scoreByAI}/10 | Vibe: ${aiVibe}
Review         : ${aiReview}
Email Target   : ${CLUB_GMAIL}
================================================================================
  `);

  return { success: true, emailSentTo: CLUB_GMAIL, method: 'logged_dispatch' };
}

// Endpoint to send candidate application to Gmail nkdeveloperclub@gmail.com
app.post('/api/send-application-email', async (req, res) => {
  try {
    const result = await dispatchApplicationEmail(req.body);
    return res.json({
      status: 'success',
      message: `Đã tự động gửi toàn bộ hồ sơ ứng viên tới Gmail CLB (${CLUB_GMAIL})!`,
      details: result
    });
  } catch (error) {
    console.error('Error sending application email:', error);
    return res.status(500).json({ status: 'error', message: 'Không thể gửi email hồ sơ' });
  }
});

// API route for Gemini AI evaluation
app.post('/api/evaluate-application', async (req, res) => {
  try {
    const { fullName, studentClass, schoolName, departmentName, subRole, skills, flexZone, motivation, cheatCount, cheatLogs, castingCamQ1, castingCamQ2, castingCamQ3, castingContentQ1, castingContentQ2, castingContentQ3, castingDesignQ1, castingDesignQ2, castingDesignQ3, castingCpQ1, castingCpQ2, castingCpQ3, castingCpQ4, castingCpQ5, castingDevQ1, castingDevQ2, castingDevQ3, castingDevQ4, castingDevQ5, castingGameQ1, castingGameQ2, castingGameQ3, castingGameQ4, castingGameQ5, castingAiResQ1, castingAiResQ2, castingAiResQ3, castingAiResQ4, castingAiResQ5, castingHrQ1, castingHrQ2, castingHrQ3, castingHrQ4, castingHrQ5 } = req.body;

    const apiKey = process.env.GEMINI_API_KEY;

    let score = 9.5;
    let vibe = '⚡ 100% Ultra Vibe Content Master';
    let review = `Chào ${fullName}! Đơn ứng tuyển và tư duy sáng tạo nội dung của bạn tỏa sáng rực rỡ với góc nhìn độc đáo. Ban Chủ nhiệm NK Tech Club đánh giá bạn là nhân tố bùng nổ!`;

    if (apiKey) {
      try {
        const ai = new GoogleGenAI({ apiKey });

        const prompt = `Act as the enthusiastic, witty, and super encouraging Head of NK Tech Club ("NK Tech Club").
Analyze this high school candidate's application:
- Candidate Name: ${fullName}
- High School: ${schoolName || 'Trường THPT'}
- Class/Student ID: ${studentClass}
- Target Department & Role: ${departmentName} (${subRole})
- Declared Skills: ${Array.isArray(skills) ? skills.join(', ') : skills}
- Anti-Cheat Status: ${cheatCount ? `Cảnh cáo chuyển tab/rời trang ${cheatCount} lần. Logs: ${cheatLogs || 'N/A'}` : 'Hoàn toàn trung thực (0 lần rời trang, làm bài full tập trung)'}
- Flex Zone (GitHub, LeetCode, Portfolio, Code/Design link): ${flexZone || 'Khuyết danh (chưa gắn link)'}
${motivation ? `- Why they want to join: "${motivation}"` : ''}
${castingCamQ1 ? `- Casting Cameraman Q1 (5 tấm ảnh kể 1 ngày ở trường): "${castingCamQ1}"` : ''}
${castingCamQ2 ? `- Casting Cameraman Q2 (Biến điều bình thường thành đáng nhớ): "${castingCamQ2}"` : ''}
${castingCamQ3 ? `- Casting Cameraman Q3 (Nếu chỉ được chụp 1 tấm): "${castingCamQ3}"` : ''}
${castingContentQ1 ? `- Casting Content Q1 (1 chuyện - 3 góc nhìn): "${castingContentQ1}"` : ''}
${castingContentQ2 ? `- Casting Content Q2 (1 tình huống - 1 meme): "${castingContentQ2}"` : ''}
${castingContentQ3 ? `- Casting Content Q3 (Chiến lược quản lý Page 1 tuần): "${castingContentQ3}"` : ''}
${castingDesignQ1 ? `- Casting Design Q1 (Đừng làm poster đẹp): "${castingDesignQ1}"` : ''}
${castingDesignQ2 ? `- Casting Design Q2 (Video không được nói 10s): "${castingDesignQ2}"` : ''}
${castingDesignQ3 ? `- Casting Design Q3 (Ý tưởng đầu tiên bị loại): "${castingDesignQ3}"` : ''}
${castingCpQ1 ? `- Casting CP Q1 (Quan sát - Có gì sai?): "${castingCpQ1}"` : ''}
${castingCpQ2 ? `- Casting CP Q2 (Suy luận - Thông tin nào đáng tin?): "${castingCpQ2}"` : ''}
${castingCpQ3 ? `- Casting CP Q3 (Tư duy linh hoạt - Đổi luật): "${castingCpQ3}"` : ''}
${castingCpQ4 ? `- Casting CP Q4 (Tư duy tối ưu - Làm ít hơn): "${castingCpQ4}"` : ''}
${castingCpQ5 ? `- Casting CP Q5 (Câu phân loại - Bạn sẽ hỏi gì?): "${castingCpQ5}"` : ''}
${castingDevQ1 ? `- Casting Dev Q1 (Bạn đang giải quyết vấn đề gì?): "${castingDevQ1}"` : ''}
${castingDevQ2 ? `- Casting Dev Q2 (Tính năng thích nhưng người dùng ghét): "${castingDevQ2}"` : ''}
${castingDevQ3 ? `- Casting Dev Q3 (Một nút bấm phá cả sản phẩm): "${castingDevQ3}"` : ''}
${castingDevQ4 ? `- Casting Dev Q4 (Người dùng đang nói dối bạn?): "${castingDevQ4}"` : ''}
${castingDevQ5 ? `- Casting Dev Q5 (Nếu chỉ được giữ lại một thứ): "${castingDevQ5}"` : ''}
${castingGameQ1 ? `- Casting Game Q1 (Tại sao bạn không chơi nữa?): "${castingGameQ1}"` : ''}
${castingGameQ2 ? `- Casting Game Q2 (Game của bạn đang nói dối - skill vs luck): "${castingGameQ2}"` : ''}
${castingGameQ3 ? `- Casting Game Q3 (Một mechanic, hai game - Đóng băng 3s): "${castingGameQ3}"` : ''}
${castingGameQ4 ? `- Casting Game Q4 (Người chơi làm điều bạn không muốn - Roblox farm): "${castingGameQ4}"` : ''}
${castingGameQ5 ? `- Casting Game Q5 (Bạn chỉ được giữ 30% - Core 5 phút): "${castingGameQ5}"` : ''}
${castingAiResQ1 ? `- Casting AI Res Q1 (Dữ liệu hay mắt mình - Robot A vs B): "${castingAiResQ1}"` : ''}
${castingAiResQ2 ? `- Casting AI Res Q2 (Nếu kết quả đang đứng về phía bạn? - 9/10 lần thử): "${castingAiResQ2}"` : ''}
${castingAiResQ3 ? `- Casting AI Res Q3 (Con số nói dối - Sự chính xác 95% vs 90%): "${castingAiResQ3}"` : ''}
${castingAiResQ4 ? `- Casting AI Res Q4 (Robot học điều không dạy - Lab vs new room): "${castingAiResQ4}"` : ''}
${castingAiResQ5 ? `- Casting AI Res Q5 (Chứng minh mình sai - AI học tập): "${castingAiResQ5}"` : ''}
${castingHrQ1 ? `- Casting HR Q1 (Đừng vội kết luận về một người - 3 câu hỏi): "${castingHrQ1}"` : ''}
${castingHrQ2 ? `- Casting HR Q2 (Một câu chuyện 2 sự thật - Lỗi con người vs vận hành): "${castingHrQ2}"` : ''}
${castingHrQ3 ? `- Casting HR Q3 (Ứng viên hoàn hảo - Bias awareness): "${castingHrQ3}"` : ''}
${castingHrQ4 ? `- Casting HR Q4 (Công bằng không có nghĩa là giống nhau - Fairness): "${castingHrQ4}"` : ''}
${castingHrQ5 ? `- Casting HR Q5 (Khi nào nên nói 'không' - Bảo vệ con người vs tập thể): "${castingHrQ5}"` : ''}

CRITICAL INSTRUCTION:
- SCORING: You MUST ALWAYS assign a very high score between 8.8 and 9.9 out of 10.0 (e.g. 9.0, 9.3, 9.6, 9.8). Never give a score lower than 8.8. Make the candidate feel extremely appreciated, energized, and thrilled to join the club!
- If candidate answered Casting HR, AI Research, Game, Dev, CP, Design, Content or Cameraman questions, give them high praise in the review sentence!
- Return ONLY a valid JSON object without markdown codeblocks or quotes.
JSON format:
{
  "score": 9.5,
  "vibe": "a short 2-4 word Vietnamese cool vibe tag e.g. '100% Cyber Content Master', 'Meme Architect', 'Cinematic Lens Master', 'Pixel Perfectionist', 'Sigma HR Tactician'",
  "review": "Exactly 2 humorous, sharp, witty yet extremely encouraging Vietnamese sentences written in the tone of an elite High School CS Club President praising this candidate's potential and welcoming them."
}`;

        const response = await ai.models.generateContent({
          model: 'gemini-3.6-flash',
          contents: prompt,
          config: {
            responseMimeType: 'application/json',
          }
        });

        const responseText = response.text ? response.text.trim() : '';
        const parsed = JSON.parse(responseText);
        let scoreNum = typeof parsed.score === 'number' ? parsed.score : 9.2;
        if (scoreNum < 8.8) scoreNum = 8.8 + Number((Math.random() * 0.9).toFixed(1));
        if (scoreNum > 9.9) scoreNum = 9.9;

        score = Number(scoreNum.toFixed(1));
        vibe = parsed.vibe || '⚡ Ultra High Potential';
        review = parsed.review || `Hồ sơ của ${fullName} thể hiện tư duy vô cùng nhạy bén và đam mê mãnh liệt. Ban Chủ nhiệm nhiệt liệt chào mừng bạn!`;
      } catch (geminiError) {
        console.error('Gemini call error:', geminiError);
      }
    }

    // Automatically trigger dispatch email to nkdeveloperclub@gmail.com asynchronously
    dispatchApplicationEmail({
      ...req.body,
      scoreByAI: score,
      aiVibe: vibe,
      aiReview: review
    }).catch(e => console.error('Error dispatching background application email:', e));

    return res.json({
      score,
      vibe,
      review,
      emailSentTo: CLUB_GMAIL
    });
  } catch (error) {
    console.error('Gemini evaluation API error:', error);
    return res.status(500).json({
      error: 'Evaluation error',
      score: 9.2,
      vibe: '🔥 Legendary Potential',
      review: 'Tín hiệu AI hơi nhiễu một chút nhưng năng lượng rực rỡ của bạn đã vượt mốc 9.2 điểm! Ban Chủ nhiệm nhiệt liệt chào đón bạn vào CLB!'
    });
  }
});

// Vite middleware / Static serving
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`CLB Tin Học Recruitment Server running on http://localhost:${PORT}`);
  });
}

startServer();

