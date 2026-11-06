export const profile = {
  name: '山抹微云',
  handle: 'smwy-cj',
  siteName: '山水之间',
  github: 'https://github.com/smwy-cj',
  email: '241830179@smail.nju.edu.cn',
  zh: {
    tagline: '技术笔记与项目实践。',
    description: '你好，我是山抹微云（smwy-cj）。这里收藏我的技术笔记、项目实践，以及一路走来的所思所想。',
    interests: ['AI 与 Agent', '东玄'],
    focus: '关注 AI、Agent 和检索增强生成，记录开发工具与个人网站的实践。'
  },
  en: {
    tagline: 'Technical notes and projects.',
    description: 'Hi, I’m smwy-cj. This is where I share technical notes, projects, and things I learn along the way.',
    interests: ['AI and agents', 'Eastern fantasy'],
    focus: 'I explore AI, agents, and retrieval-augmented generation, and write about developer tools and building my personal site.'
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
    home: '主页', journal: '文章', projects: '项目', about: '关于', navigation: '主导航',
    skip: '跳到主要内容', profile: '个人概览', more: '关于我的更多信息', allArticles: '查看全部文章',
    allProjects: '查看全部项目', read: '阅读文章', details: '项目简介', visit: '访问项目',
    previous: '上一张', next: '下一张', carousel: '轮播', slide: '第 {n} 张', drag: '拖动卡片 / 左右切换',
    end: '关于我，以及我最近在关注的事。', top: '回到顶部',
    writingTitle: '思考，留在这里。', writingIntro: '关于开发、交互和持续学习的记录。按时间阅读，也可以从一个感兴趣的主题开始。',
    workTitle: '构建，也分享。', workIntro: '我制作的项目和进行中的实验。', topicCount: '个标签',
    latest: '最新', tags: '按标签', all: '全部', entries: '篇文章', works: '个项目', gallery: '画廊', list: '列表',
    empty: '这里暂时没有内容。', minutes: '分钟阅读', undated: '未标日期', moreEntries: '加载更多',
    aboutTitle: '关于我', intro: '自我介绍', focus: '技术方向', interests: '个人兴趣', contact: '联系方式',
    back: '返回', original: '阅读中文原文', unavailable: '译文暂未提供', unavailableBody: '这篇内容目前可以阅读中文原文。',
    toc: '本文目录', published: '发布', updated: '更新', related: '相关内容',
    notFound: '页面未找到', notFoundBody: '请从主页、文章或项目重新进入。',
    code: '代码', copy: '复制代码', copied: '已复制', copyFailed: '复制失败，请手动选择代码。', step: '步骤'
  },
  en: {
    home: 'Home', journal: 'Writing', projects: 'Projects', about: 'About', navigation: 'Main navigation',
    skip: 'Skip to content', profile: 'Personal overview', more: 'More about me', allArticles: 'View all writing',
    allProjects: 'View all projects', read: 'Read article', details: 'Project notes', visit: 'Visit project',
    previous: 'Previous slide', next: 'Next slide', carousel: 'Carousel', slide: 'Slide {n}', drag: 'Drag to explore / Use arrows',
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
