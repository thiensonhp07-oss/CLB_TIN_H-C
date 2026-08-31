import { DepartmentInfo } from '../types';

export const DEPARTMENTS: DepartmentInfo[] = [
  {
    id: 'chuyen-mon',
    name: 'Ban Chuyên Môn (Tech Core)',
    tagline: 'Lò luyện cao thủ C++, Python, Game 2D, Roblox 3D & Research KHKT & Robotics',
    description: 'Nơi tập trung các "pháp sư code", coder hệ chiến, Game Developer(Game 2D, Roblox 3D) và AI & Data Science Researcher (Science and technology project, robotic). Chịu trách nhiệm chinh phục các giải HSG, KHKT, Robotics và Game.',
    subRoles: [
      'Competitive Programmer (C++ / Python)',
      'Web/App Developer (Full-stack Vibe Coding)',
      'Game Developer(Game 2D, Roblox 3D)',
      'AI & Data Science Researcher (Science and technology project, robotic)'
    ],
    skillsList: [
      // Competitive Programming (CP)
      'C++', 'Python', 'Algorithms & Data Structures', 'Competitive Coding', 'VNOI / Codeforces / LeetCode', 'Chuyên Tin HSG', 'Dynamic Programming (QHQ)', 'Graph Theory (Đồ thị)', 'Math & Combinatorics', 'C++ STL & Optimization',
      // Web / App Dev
      'Web/App Dev (React/Node/Next.js)', 'HTML/CSS/JS & Tailwind', 'TypeScript & Modern JS', 'REST API & GraphQL', 'Git & GitHub', 'Vibe Coding (AI-Assisted)', 'Database & SQL/Firestore', 'UI/UX Integration', 'Vite & Webpack', 'Fullstack Architecture',
      // Game Dev
      'Game 2D (Unity/Pygame)', 'Roblox 3D Studio & LuaScript', 'Blender 3D Modeling', 'Game Design & Mechanics', 'Animation 2D/3D in Game', 'Pixel Art & Sprites', 'Sound FX & Game Audio', 'Game Physics & Collision', 'Level Design & World Building', 'Godot Engine',
      // AI & Robotics
      'AI & Data Science (ML/Prompting)', 'Prompt Engineering & Gemini API', 'Python Data Stack (NumPy/Pandas)', 'Robotics & Hardware (Arduino/ESP32)', 'IoT & Cảm biến (Sensors)', 'OpenCV & Computer Vision', 'TensorFlow / PyTorch Basics', 'Mạch điện & Hàn mạch (Soldering)', 'Thiết kế 3D In 3D (CAD/Fusion 360)', 'NCKH / Cuộc thi KHKT'
    ],
    color: 'from-cyan-500 to-blue-600',
    accentGlow: 'rgba(6, 182, 212, 0.4)',
    iconName: 'Code'
  },
  {
    id: 'truyen-thong',
    name: 'Ban Truyền Thông & Sáng Tạo (Media & Content)',
    tagline: 'Linh hồn thị giác & tiếng nói Gen Z của CLB',
    description: 'Chủ nhân của những bài post triệu reach, sáng tạo bài viết post Facebook Fanpage, thiết kế poster đậm chất cyberpunk, video ngắn xu hướng TikTok/Shorts và chiến dịch xây dựng thương hiệu NK Tech Club.',
    subRoles: [
      'Content Writer (Meme x Tech / Trendy School Posts)',
      'Designer & Video Editor (Graphic Design, Poster & Video Short/Reels)',
      'Cameraman / Photographer (Quay phim & Chụp ảnh)'
    ],
    skillsList: [
      // Photography & Cameraman
      'Nhiếp ảnh & Chụp ảnh Sự kiện', 'Chỉnh ảnh Lightroom & Color Grading', 'Quay phim & Videography', 'Bố cục & Ánh sáng (Lighting & Composition)', 'Chụp ảnh chân dung & Cảnh trường', 'Góc máy & Storyboard Visual', 'Chỉnh ảnh điện thoại (Lightroom/Snapseed/VSCO)', 'Quản lý Máy ảnh & Thiết bị Lens', 'Quay Storyline & B-roll', 'Phối màu Cinematic (LUTs)', 'Chụp sản phẩm & Model',
      // Graphic Design & Video Editing
      'Photoshop & Illustrator', 'Figma UI/UX Design', 'Canva Design Pro', 'Thiết kế Poster & Banner', 'CapCut / Edit Video Ngắn (TikTok/Shorts/Reels)', 'Premiere Pro & After Effects', 'Motion Graphics & Animation', 'Typo & Font Pairing (Typography)', 'Brand Identity & Kit', 'Infographic Design', 'Visual Storytelling', '3D Graphic Design (Blender/C4D)',
      // Content & Copywriting & Social Media
      'Viết bài Post Facebook', 'Facebook Content & Copywriting', 'Quản lý Fanpage Facebook', 'Content Writing & Storytelling', 'Copywriting & Memes Gen Z', 'Viết kịch bản Video (Scriptwriter)', 'Xây kênh TikTok & Shorts', 'Bắt Trend & Sáng tạo Ý tưởng', 'SEO Content & Keyword', 'Tạo Mini Game Facebook', 'Lên Kế hoạch Content (Content Calendar)', 'PR & Đi bài Nhóm Trường'
    ],
    color: 'from-purple-500 to-pink-500',
    accentGlow: 'rgba(168, 85, 247, 0.4)',
    iconName: 'Sparkles'
  },
  {
    id: 'nhan-su',
    name: 'Ban Quản Lý Nhân Sự (HR & Operations)',
    tagline: 'Bộ não vận hành, nhịp đập sự kiện & kết nối thành viên',
    description: 'Chịu trách nhiệm lên kế hoạch sự kiện (Hackathon, Workshop, Teambuilding), quản lý nhân sự, lưu trữ giấy tờ trường lớp và giữ ngọn lửa gắn kết cho hơn 100+ thành viên.',
    subRoles: [
      'Quản Lý Nhân Sự & Sự Kiện (HR, Event, Logistics & Hậu Cần)'
    ],
    skillsList: [
      'Event Planning & Chạy Sự kiện', 'Logistics & Hậu Cần', 'Quản lý Nhân sự & Kết nối', 'Public Speaking & MC',
      'Team Leadership & Điều phối', 'Google Sheets & Excel Pro', 'Dự trù Kinh phí & Budgeting', 'Task Management & Notion/Trello',
      'Phỏng vấn & Casting', 'Lên kịch bản Teambuilding', 'Gắn kết Thành viên (Engagement)', 'Soạn thảo Văn bản & Giấy tờ Trường',
      'Xử lý Khủng hoảng (Crisis Management)', 'Quản lý Nhà tài trợ & Đối ngoại', 'Điều phối Kỹ thuật & Âm thanh Ánh sáng', 'Trò chơi & Warm-up Facilitator'
    ],
    color: 'from-emerald-400 to-teal-600',
    accentGlow: 'rgba(16, 185, 129, 0.4)',
    iconName: 'Users'
  }
];

export const ALL_SKILL_TAGS = Array.from(new Set([
  ...DEPARTMENTS[0].skillsList,
  ...DEPARTMENTS[1].skillsList,
  ...DEPARTMENTS[2].skillsList,
  'Kỹ năng Giao tiếp (Communication)', 'Tư duy Sáng tạo (Creative Thinking)', 'Giải quyết Vấn đề (Problem Solving)', 'Làm việc Nhóm (Teamwork)', 'Quản lý Thời gian (Time Management)', 'Ngoại ngữ / Tiếng Anh (IELTS/TOEIC)', 'Tự học & Thích nghi Nhanh (Fast Learner)', 'Chịu áp lực Cao (Under Pressure)'
]));
