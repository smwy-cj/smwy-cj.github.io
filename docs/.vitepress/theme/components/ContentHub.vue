<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { data } from '../content.data'
import Icon from './Icon.vue'
import EntryCard from './EntryCard.vue'
import ArticleRow from './ArticleRow.vue'
const props = defineProps<{ kind: 'projects' | 'journal' }>()
const category = ref('全部')
const directory = ref('全部')
const tag = ref('全部')
const entries = computed(() => data.filter(p => p.layout === (props.kind === 'projects' ? 'project' : 'article')))
const categories = computed(() => ['全部', ...new Set(entries.value.map(p => p.category))])
const directories = computed(() => [...new Set(entries.value.filter(p => category.value === '全部' || p.category === category.value).map(p => p.directory).filter(Boolean))])
const tags = computed(() => [...new Set(entries.value.map(p => p.tags).flat())])
const filtered = computed(() => entries.value.filter(p => (category.value === '全部' || p.category === category.value) && (directory.value === '全部' || p.directory === directory.value) && (tag.value === '全部' || p.tags.includes(tag.value))))
function reset() { category.value = '全部'; directory.value = '全部'; tag.value = '全部' }
function selectCategory(value: string) { category.value = value; directory.value = '全部' }
watch(() => props.kind, reset)
</script>
<template>
  <main id="main-content" class="hub-page page-width">
    <header class="page-intro" data-reveal><div class="eyebrow">{{ kind === 'projects' ? 'A COLLECTION OF EXPLORATIONS' : 'A GARDEN OF KNOWLEDGE' }}</div><h1>{{ kind === 'projects' ? '所行，皆有迹。' : '所思，皆成章。' }}</h1><p>{{ kind === 'projects' ? '从一个想法出发，让探索在实践中生长。' : '把零散的知识，慢慢织成自己的地图。' }}</p><span class="page-intro-mark">{{ kind === 'projects' ? '行' : '思' }}</span></header>
    <div v-if="kind === 'projects'" class="project-filter-bar"><div class="filter-tabs" aria-label="项目分类"><button v-for="item in categories" :key="item" :class="{ active: category === item }" :aria-pressed="category === item" @click="selectCategory(item)">{{ item }}<span>{{ item === '全部' ? entries.length : entries.filter(p => p.category === item).length }}</span></button></div><span class="result-count" aria-live="polite">{{ filtered.length }} 个项目</span></div>
    <div :class="{ 'journal-hub-layout': kind === 'journal' }">
      <aside v-if="kind === 'journal'" class="library-sidebar"><div class="sidebar-title"><Icon name="folder" :size="17" /> 知识目录</div><button v-for="item in categories" :key="item" :class="['directory-button', { active: category === item }]" :aria-pressed="category === item" @click="selectCategory(item)"><span>{{ item === '全部' ? '全部笔记' : item }}</span><small>{{ item === '全部' ? entries.length : entries.filter(p => p.category === item).length }}</small></button><template v-if="category !== '全部' && directories.length"><button v-for="item in directories" :key="item" :class="['subdirectory-button', { active: directory === item }]" :aria-pressed="directory === item" @click="directory = directory === item ? '全部' : item">↳ {{ item }}</button></template><div class="sidebar-note"><Icon name="leaf" :size="23"/><p>日拱一卒，<br>功不唐捐。</p></div></aside>
      <div class="hub-content">
        <div v-if="kind === 'projects' && category !== '全部' && directories.length" class="subdirectory-tabs" aria-label="项目子目录"><button :class="{ active: directory === '全部' }" @click="directory = '全部'">全部方向</button><button v-for="item in directories" :key="item" :class="{ active: directory === item }" @click="directory = item">{{ item }}</button></div>
        <div class="tag-filter" aria-label="标签筛选"><span>标签</span><button :class="{ active: tag === '全部' }" :aria-pressed="tag === '全部'" @click="tag = '全部'">全部</button><button v-for="item in tags" :key="item" :class="{ active: tag === item }" :aria-pressed="tag === item" @click="tag = tag === item ? '全部' : item">{{ item }}</button></div>
        <div v-if="kind === 'journal'" class="list-caption"><span>{{ category === '全部' ? '全部笔记' : category }}<span v-if="directory !== '全部'"> / {{ directory }}</span></span><span aria-live="polite">{{ filtered.length }} 篇</span></div>
        <TransitionGroup v-if="kind === 'projects'" name="list" tag="div" class="project-grid"><EntryCard v-for="entry in filtered" :key="entry.url" :entry="entry" /></TransitionGroup>
        <TransitionGroup v-else name="list" tag="div" class="article-list"><ArticleRow v-for="entry in filtered" :key="entry.url" :entry="entry" /></TransitionGroup>
        <div v-if="!filtered.length" class="empty-state"><Icon name="book" :size="38"/><h2>这一页，留待书写。</h2><p>当前分类与标签下还没有内容。</p><button class="button button-outline" @click="reset">查看全部内容<Icon name="arrow" :size="16"/></button></div>
        <p class="sample-note">带有“示例”标记的内容用于展示版式，可替换为你的真实项目与笔记。</p>
      </div>
    </div>
  </main>
</template>
