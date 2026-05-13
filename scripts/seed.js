require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');
const News = require('../models/News');
const { Settings, Stats, Announcement, About } = require('../models');

const seed = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Create Super Admin
    const existingAdmin = await User.findOne({ email: 'superadmin@school.uz' });
    if (!existingAdmin) {
      await User.create({
        name: 'Super Admin',
        email: 'superadmin@school.uz',
        password: 'admin123',
        role: 'superadmin'
      });
      console.log('✅ Super Admin created: superadmin@school.uz / admin123');
    } else {
      console.log('ℹ️  Super Admin already exists');
    }

    // Create default settings
    const defaultSettings = [
      { key: 'site_name_uz', value: 'Prezident Maktabi' },
      { key: 'site_name_ru', value: 'Президентская Школа' },
      { key: 'site_name_en', value: 'Presidential School' },
      { key: 'primary_color', value: '#1e3a5f' },
      { key: 'secondary_color', value: '#c8a84b' },
      { key: 'bg_type', value: 'color' },
      { key: 'bg_color', value: '#f8fafc' },
      { key: 'banner_title_uz', value: "Bilimli avlod – kelajak poydevori" },
      { key: 'banner_title_ru', value: "Знающее поколение — основа будущего" },
      { key: 'banner_title_en', value: "Educated Generation — Foundation of the Future" },
      { key: 'banner_subtitle_uz', value: "Zamonaviy ta'lim, ilm va innovatsiya markazi" },
      { key: 'banner_subtitle_ru', value: "Центр современного образования, науки и инноваций" },
      { key: 'banner_subtitle_en', value: "Center of modern education, science and innovation" },
      { key: 'footer_phone', value: '+998 71 200 00 00' },
      { key: 'footer_email', value: 'info@school.uz' },
      { key: 'footer_address_uz', value: "Toshkent shahri, Yunusobod tumani" },
    ];

    for (const s of defaultSettings) {
      await Settings.findOneAndUpdate({ key: s.key }, { value: s.value }, { upsert: true });
    }
    console.log('✅ Default settings created');

    // Stats
    await Stats.findOneAndUpdate({}, {
      students_count: 1200,
      teachers_count: 85,
      awards_count: 340,
      graduates_count: 3500
    }, { upsert: true });
    console.log('✅ Stats created');

    // Sample announcement
    const annCount = await Announcement.countDocuments();
    if (annCount === 0) {
      await Announcement.create({
        title_uz: "2025-2026 o'quv yili uchun qabul boshlandi!",
        title_ru: "Открыт прием на 2025-2026 учебный год!",
        title_en: "Admission for 2025-2026 academic year is open!",
        content_uz: "Ariza topshirish muddati: 1-may dan 30-iyungacha",
        content_ru: "Срок подачи заявок: с 1 мая по 30 июня",
        content_en: "Application deadline: May 1 to June 30",
        isActive: true
      });
      console.log('✅ Sample announcement created');
    }

    // Sample About content
    const aboutCount = await About.countDocuments();
    if (aboutCount === 0) {
      await About.create({
        mission_uz: "Prezident maktabining missiyasi – O'zbekiston yoshlarini zamonaviy bilim va ko'nikmalar bilan qurollantirish, ularni kelajak rahbarlari sifatida tarbiyalash.",
        mission_ru: "Миссия Президентской школы — вооружить молодёжь Узбекистана современными знаниями и навыками, воспитать их как будущих лидеров.",
        mission_en: "The mission of the Presidential School is to equip Uzbekistan's youth with modern knowledge and skills, raising them as future leaders.",
        vision_uz: "O'zbekistonning ta'lim tizimida yetakchi o'rinda turish va jahon miqyosida raqobatbardosh xatimuvchilarni tayyorlash.",
        vision_ru: "Занять лидирующее место в системе образования Узбекистана и подготовить конкурентоспособных выпускников мирового уровня.",
        vision_en: "To be the leader in Uzbekistan's education system and produce world-class competitive graduates.",
        history_uz: "Prezident maktablari 2019 yilda O'zbekiston Prezidentining farmoni asosida tashkil etilgan. Ushbu maktablar mamlakat bo'ylab eng qobiliyatli o'quvchilarni qabul qilib, ularga yuqori sifatli ta'lim beradi.",
        history_ru: "Президентские школы были основаны в 2019 году по указу Президента Узбекистана. Эти школы принимают самых одарённых учеников со всей страны и дают им высококачественное образование.",
        history_en: "Presidential Schools were established in 2019 by decree of the President of Uzbekistan. These schools admit the most talented students from across the country and provide them with high-quality education.",
        directors: [
          { name: "Aziz Karimov", position_uz: "Maktab direktori", position_ru: "Директор школы", position_en: "School Principal", order: 1 },
          { name: "Nilufar Rashidova", position_uz: "O'quv ishlari direktori", position_ru: "Заместитель по учебной части", position_en: "Academic Director", order: 2 },
          { name: "Bobur Yusupov", position_uz: "Tarbiya ishlari direktori", position_ru: "Заместитель по воспитательной работе", position_en: "Student Affairs Director", order: 3 }
        ]
      });
      console.log('✅ Sample About content created');
    }

    // Sample news
    const newsCount = await News.countDocuments();
    if (newsCount === 0) {
      const adminUser = await User.findOne({ role: 'superadmin' });
      const sampleNews = [
        {
          title_uz: "Prezident maktabi olimpiada g'oliblarini tantanali kutib oldi",
          title_ru: "Президентская школа торжественно встретила победителей олимпиады",
          title_en: "Presidential School Celebrates Olympiad Champions",
          excerpt_uz: "Xalqaro matematika olimpiadasida 3 ta oltin medal qo'lga kiritildi",
          excerpt_ru: "Завоёваны 3 золотые медали на международной олимпиаде по математике",
          excerpt_en: "3 gold medals won at the International Mathematics Olympiad",
          content_uz: "Prezident maktabi o'quvchilari xalqaro matematika olimpiadasida ajoyib natijalar ko'rsatdi. Ular 3 ta oltin, 5 ta kumush va 2 ta bronza medal qo'lga kiritdi.\n\nBu natija maktabimizning ta'lim sifati va o'qituvchilarimizning fidokorona mehnatining yorqin dalilidir. Barcha g'olib va sovrindorlarga tabriklar!",
          content_ru: "Ученики Президентской школы показали выдающиеся результаты на международной математической олимпиаде. Они завоевали 3 золотые, 5 серебряных и 2 бронзовые медали.\n\nЭти результаты являются ярким свидетельством качества образования в нашей школе и самоотверженного труда наших учителей.",
          content_en: "Presidential School students showed outstanding results at the International Mathematics Olympiad. They won 3 gold, 5 silver and 2 bronze medals.\n\nThese results are a bright testament to the quality of education at our school and the dedicated work of our teachers.",
          category: 'science',
          status: 'published',
          author: adminUser._id
        },
        {
          title_uz: "Yangi o'quv yili boshlanishi munosabati bilan tantanali bayram",
          title_ru: "Торжественный праздник в честь начала нового учебного года",
          title_en: "Celebrating the Start of the New Academic Year",
          excerpt_uz: "O'quvchilar va ota-onalar uchun tantanali qabul marosimi bo'lib o'tdi",
          excerpt_ru: "Прошла торжественная церемония приёма для учеников и родителей",
          excerpt_en: "A grand welcome ceremony was held for students and parents",
          content_uz: "Prezident maktabida yangi o'quv yilining boshlanishi munosabati bilan tantanali bayram bo'lib o'tdi. Tadbirda maktab direktori, o'qituvchilar, o'quvchilar va ularning ota-onalari ishtirok etdi.\n\nBu yil maktabimizga 120 nafar yangi o'quvchi qabul qilindi.",
          content_ru: "В Президентской школе прошёл торжественный праздник в честь начала нового учебного года. В мероприятии приняли участие директор школы, учителя, ученики и их родители.\n\nВ этом году в нашу школу принято 120 новых учеников.",
          content_en: "A grand celebration was held at the Presidential School to mark the beginning of the new academic year. The event was attended by the school principal, teachers, students and their parents.\n\nThis year, 120 new students were admitted to our school.",
          category: 'events',
          status: 'published',
          author: adminUser._id
        },
        {
          title_uz: "Robototexnika to'garagi o'quvchilarimiz yangi loyiha ustida ishlamoqda",
          title_ru: "Кружок робототехники: наши ученики работают над новым проектом",
          title_en: "Robotics Club Students Working on a New Breakthrough Project",
          excerpt_uz: "Sun'iy intellektga asoslangan robot loyihasi yaratilmoqda",
          excerpt_ru: "Создаётся проект робота на основе искусственного интеллекта",
          excerpt_en: "An AI-powered robot project is being created",
          content_uz: "Maktabimizning robototexnika to'garagi a'zolari sun'iy intellektga asoslangan yangi loyiha ustida faol ishlashmoqda. Ushbu loyiha respublika ko'rik-tanlovida ishtirok etadi.\n\nO'quvchilarimiz Python va Arduino texnologiyalaridan foydalanib, mustaqil harakatlanuvchi robot yaratmoqdalar.",
          content_ru: "Члены кружка робототехники нашей школы активно работают над новым проектом на основе искусственного интеллекта. Этот проект будет участвовать в республиканском конкурсе.\n\nНаши ученики создают самодвижущегося робота с использованием технологий Python и Arduino.",
          content_en: "Members of our school's robotics club are actively working on a new AI-based project. This project will participate in the national competition.\n\nOur students are creating a self-moving robot using Python and Arduino technologies.",
          category: 'science',
          status: 'published',
          author: adminUser._id
        }
      ];

      for (const n of sampleNews) {
        await News.create(n);
      }
      console.log('✅ Sample news created');
    }

    console.log('\n🎉 Database seeded successfully!');
    console.log('\n🔐 Admin credentials:');
    console.log('   URL:      http://localhost:3000/admin/login');
    console.log('   Email:    superadmin@school.uz');
    console.log('   Password: admin123\n');

    process.exit(0);
  } catch (err) {
    console.error('❌ Seed error:', err);
    process.exit(1);
  }
};

seed();
