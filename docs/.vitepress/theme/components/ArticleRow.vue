<script setup lang="ts">
import { withBase } from 'vitepress'
import type { Entry } from '../types'
import Icon from './Icon.vue'
defineProps<{ entry: Entry }>()
</script>
<template>
  <a :href="withBase(entry.url)" class="article-row" data-reveal>
    <div class="article-date"><span>{{ entry.date.slice(5).replace('-', '.') }}</span><small>{{ entry.date.slice(0, 4) }}</small></div>
    <div class="article-row-main"><div class="article-kicker">{{ entry.category }}<span v-if="entry.sample"> · 示例文章</span></div><h3>{{ entry.title }}</h3><p>{{ entry.description }}</p><div class="article-row-tags"><span v-for="tag in entry.tags" :key="tag"># {{ tag }}</span></div></div>
    <div class="article-row-tail"><span>{{ entry.readingTime }} 分钟阅读</span><Icon name="diagonal" :size="19" /></div>
  </a>
</template>
