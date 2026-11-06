export const profile = {
  name: '山抹微云',
  handle: 'smwy-cj',
  siteName: '微云集',
  avatar: '/images/plush-avatar.jpg',
  github: 'https://github.com/smwy-cj',
  email: '241830179@smail.nju.edu.cn',
  zh: {
    tagline: '个人信息',
    description: '你好，我是山抹微云（smwy-cj），南京大学软件工程（智能化软件）专业大三在读。这里是我的个人博客，记录我的日常学习和思考。欢迎和我联系！',
    interests: ['LLM 与 Agent', '金融','地缘政治','东玄', '体育与音乐'],
    focus: '我喜欢探索 LLM、Agent 和 RAG 等前沿技术革新，也喜欢研究C++、Java与JavaScript等语言与底层架构。'
  },
  en: {
    tagline: 'Technical notes and projects.',
    description: 'Hi, I’m smwy-cj, a third-year undergraduate student majoring in Software Engineering (Intelligent Software) at Nanjing University. This is my personal blog. I write about my learning and thinking. Feel free to reach out!',
    interests: ['AI and agents', 'Finance', 'Geopolitics', 'Eastern fantasy', 'Sports and music'],
    focus: 'I enjoy exploring cutting-edge technologies like LLMs, Agents, and RAG, as well as delving into programming languages and underlying architectures such as C++, Java, and JavaScript.'
  }
}

export type Locale = 'zh' | 'en'
export const sections = ['home', 'journal', 'projects', 'about'] as const
export type Section = typeof sections[number]
export const routes: Record<Locale, Record<Section, string>> = {
  zh: { home: '/', journal: '/journal/', projects: '/projects/', about: '/about.html' },
  en: { home: '/en/', journal: '/en/writing/', projects: '/en/projects/', about: '/en/about.html' }
}

export const labels = {
  zh: {
    avatar: '山抹微云的头像',
    home: '主页', journal: '文章', projects: '项目', about: '关于', navigation: '主导航',
    skip: '跳到主要内容', more: '关于我的更多信息', allArticles: '查看全部文章',
    allProjects: '查看全部项目', read: '阅读文章', details: '项目简介', visit: '访问项目',
    previous: '上一张', next: '下一张', carousel: '轮播',
    end: '山抹微云，天连衰草…… 秦观在一千多年前写下这首词。', top: '回到顶部',
    writingTitle: '学习笔记与思考记录。', writingIntro: '一些杂七杂八的记录……（玻璃心勿喷）',
    workTitle: '我的项目', workIntro: '一些小破烂demo，或许会出现一些有趣的东西……', topicCount: '个标签',
    latest: '最新', tags: '按标签', all: '全部', entries: '篇文章', works: '个项目', gallery: '画廊', list: '列表',
    empty: '这里暂时没有内容。', minutes: '分钟阅读', undated: '未标日期', moreEntries: '加载更多',
    aboutTitle: '关于我', intro: '自我介绍', focus: '技术方向', interests: '个人兴趣', contact: '联系方式',
    back: '返回', original: '阅读中文原文', unavailable: '译文暂未提供', unavailableBody: '这篇内容目前可以阅读中文原文。',
    toc: '本文目录', published: '发布', updated: '更新', related: '相关内容',
    notFound: '页面未找到', notFoundBody: '请从主页、文章或项目重新进入。',
    code: '代码', copy: '复制代码', copied: '已复制', copyFailed: '复制失败，请手动选择代码。', step: '步骤'
  },
  en: {
    avatar: 'Avatar of smwy-cj',
    home: 'Home', journal: 'Writing', projects: 'Projects', about: 'About', navigation: 'Main navigation',
    skip: 'Skip to content', more: 'More about me', allArticles: 'View all writing',
    allProjects: 'View all projects', read: 'Read article', details: 'Project notes', visit: 'Visit project',
    previous: 'Previous slide', next: 'Next slide', carousel: 'Carousel',
    end: 'A little more about me and what I’m exploring.', top: 'Back to top',
    writingTitle: 'Thinking, out loud.', writingIntro: 'Notes on development, interaction, and continuous learning. Read chronologically, or start with a topic.',
    workTitle: 'Build. And share.', workIntro: 'Projects I’ve built and experiments in progress.', topicCount: 'tags',
    latest: 'Latest', tags: 'By tag', all: 'All', entries: 'articles', works: 'projects', gallery: 'Gallery', list: 'List',
    empty: 'There’s nothing here yet.', minutes: 'min read', undated: 'Undated', moreEntries: 'Load more',
    aboutTitle: 'About me', intro: 'Introduction', focus: 'Technical interests', interests: 'Personal interests', contact: 'Contact',
    back: 'Back to', original: 'Read in Chinese', unavailable: 'Translation unavailable', unavailableBody: 'This entry is currently available in Chinese.',
    toc: 'On this page', published: 'Published', updated: 'Updated', related: 'Related reading',
    notFound: 'Page not found', notFoundBody: 'Try the home, writing, or projects page.',
    code: 'Code', copy: 'Copy code', copied: 'Copied', copyFailed: 'Copy failed. Select the code to copy it manually.', step: 'Step'
  }
}

export function tagId(label: string) {
  return label.trim().normalize('NFKC').toLowerCase().replace(/\s+/g, '-')
}

const tagNames: Record<string, string> = {
  '信息检索': 'Information retrieval', '向量检索': 'Vector search',
  '知识管理': 'Knowledge management', '交互设计': 'Interaction design', '学习笔记': 'Study notes'
}
export function tagName(label: string, locale: Locale) {
  return (locale === 'en' && tagNames[tagId(label)]) || label
}

export function dateLabel(value: string, locale: Locale, full = false) {
  return new Intl.DateTimeFormat(locale === 'zh' ? 'zh-CN' : 'en', {
    year: full ? 'numeric' : undefined, month: 'short', day: 'numeric', timeZone: 'UTC'
  }).format(new Date(value + 'T00:00:00Z'))
}

export function tagUrl(locale: Locale, tag: string) {
  return routes[locale].journal + '?' + new URLSearchParams({ view: 'tags', tag: tagId(tag) })
}
