<script setup lang="ts">
import { computed } from 'vue'
import { useData, withBase } from 'vitepress'
import { profile } from '../site'
import { data } from '../content.data'
import Icon from './Icon.vue'
import ProjectArt from './ProjectArt.vue'
const { frontmatter: f, page } = useData()
const current = computed(() => data.find(entry => entry.url === `/${page.value.relativePath.replace(/\.md$/, '.html')}`))
const peers = computed(() => data.filter(entry => entry.layout === f.value.layout))
const index = computed(() => peers.value.findIndex(entry => entry.url === current.value?.url))
const previous = computed(() => peers.value[index.value - 1])
const next = computed(() => peers.value[index.value + 1])
const headers = computed(() => page.value.headers.flatMap(h => [h, ...h.children]))
</script>
<template>
  <main id="main-content" class="article-page page-width">
    <nav class="breadcrumbs" aria-label="当前位置"><a :href="withBase('/')">首页</a><Icon name="chevron" :size="13"/><a :href="withBase(f.layout === 'project' ? '/projects/' : '/journal/')">{{ f.layout === 'project' ? '项目集' : '知识库' }}</a><Icon name="chevron" :size="13"/><span>{{ f.category }}</span></nav>
    <header class="article-header"><div class="eyebrow">{{ f.category }} / {{ f.directory }}<span v-if="f.sample" class="sample-label">{{ f.layout === 'project' ? '示例项目' : '示例文章' }}</span></div><h1>{{ f.title }}</h1><p>{{ f.description }}</p><div class="article-meta"><img :src="withBase(profile.avatar)" alt="" width="27" height="27"><span>{{ profile.name }}</span><span class="meta-dot">·</span><time :datetime="current?.date">{{ current?.date }}</time><span class="meta-dot">·</span><span>{{ current?.readingTime || 1 }} 分钟阅读</span></div><div class="article-tags"><span v-for="tag in f.tags" :key="tag">{{ tag }}</span></div></header>
    <div class="reading-layout"><article class="reading-body"><div v-if="f.sample" class="sample-callout"><Icon name="leaf" :size="18"/><p>这是一篇用于展示网站结构与排版的示例内容，不代表已完成的个人成果。</p></div><ProjectArt v-if="f.layout === 'project'" :variant="f.cover || 'mountain'"/><div v-if="f.source || f.demo" class="project-actions"><a v-if="f.source" :href="f.source" target="_blank" rel="noopener noreferrer" class="button button-outline"><Icon name="github" :size="16"/>查看源码<Icon name="diagonal" :size="15"/></a><a v-if="f.demo" :href="f.demo" target="_blank" rel="noopener noreferrer" class="button button-solid">访问演示<Icon name="diagonal" :size="15"/></a></div><div class="prose"><Content /></div><div class="article-end"><Icon name="leaf" :size="21"/><span>纸短情长，感谢阅读。</span></div><nav class="article-pagination" aria-label="更多阅读"><a v-if="previous" :href="withBase(previous.url)"><span>上一篇</span><strong>{{ previous.title }}</strong></a><span v-else></span><a v-if="next" :href="withBase(next.url)"><span>下一篇</span><strong>{{ next.title }}</strong></a></nav></article>
      <aside v-if="headers.length" class="article-toc"><div class="toc-inner"><span>此页目录</span><a v-for="header in headers" :key="header.slug" :href="`#${header.slug}`" :class="{ 'toc-sub': header.level > 2 }">{{ header.title }}</a><a class="toc-top" href="#main-content">回到顶部 ↑</a></div></aside>
    </div>
  </main>
</template>
