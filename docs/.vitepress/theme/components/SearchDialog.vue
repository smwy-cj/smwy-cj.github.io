<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, ref } from 'vue'
import { useRouter, withBase } from 'vitepress'
import { data } from '../content.data'
import Icon from './Icon.vue'
const dialog = ref<HTMLDialogElement>()
const input = ref<HTMLInputElement>()
const query = ref('')
const router = useRouter()
const results = computed(() => {
  const words = query.value.trim().toLocaleLowerCase().split(/\s+/).filter(Boolean)
  return data.map(entry => {
    const title = entry.title.toLocaleLowerCase()
    const meta = `${entry.category} ${entry.directory} ${entry.tags.join(' ')} ${entry.description}`.toLocaleLowerCase()
    const text = entry.text.toLocaleLowerCase()
    return { ...entry, score: words.every(w => `${title} ${meta} ${text}`.includes(w)) ? words.reduce((s, w) => s + (title.includes(w) ? 10 : 0) + (meta.includes(w) ? 4 : 0) + 1, 0) : 0 }
  }).filter(e => !words.length || e.score > 0).sort((a, b) => b.score - a.score).slice(0, 8)
})
function open() { query.value = ''; dialog.value?.showModal(); nextTick(() => input.value?.focus()) }
function close() { dialog.value?.close() }
function navigate(url: string) { close(); router.go(withBase(url)) }
function shortcut(e: KeyboardEvent) { if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') { e.preventDefault(); dialog.value?.open ? close() : open() } }
function inputKey(e: KeyboardEvent) {
  if (e.key === 'ArrowDown') { e.preventDefault(); dialog.value?.querySelector<HTMLButtonElement>('.search-result')?.focus() }
  if (e.key === 'Enter' && results.value.length) { e.preventDefault(); e.stopPropagation(); navigate(results.value[0].url) }
}
function resultKey(e: KeyboardEvent, index: number) {
  if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
    e.preventDefault()
    const next = index + (e.key === 'ArrowDown' ? 1 : -1)
    if (next < 0) input.value?.focus()
    else dialog.value?.querySelectorAll<HTMLButtonElement>('.search-result')[next]?.focus()
  }
}
onMounted(() => window.addEventListener('keydown', shortcut))
onBeforeUnmount(() => window.removeEventListener('keydown', shortcut))
defineExpose({ open })
</script>
<template>
  <dialog ref="dialog" class="search-dialog" aria-labelledby="search-title" @click="e => { if(e.target === dialog) close() }">
    <div class="search-panel"><div class="search-input-row"><Icon name="search" :size="22"/><label id="search-title" class="sr-only" for="site-search">搜索文章与项目</label><input id="site-search" ref="input" v-model="query" placeholder="搜索文章、项目或关键词…" autocomplete="off" type="search" @keydown="inputKey"><button class="icon-button" aria-label="关闭搜索" @click="close"><Icon name="close" :size="19"/></button></div><div class="search-caption" aria-live="polite">{{ query.trim() ? `找到 ${results.length} 条结果` : '随手翻阅' }}</div><div class="search-results"><button v-for="(entry,index) in results" :key="entry.url" class="search-result" @click="navigate(entry.url)" @keydown="resultKey($event,index)"><Icon :name="entry.layout === 'article' ? 'book' : 'code'" :size="20"/><span><small>{{ entry.layout === 'article' ? '笔记' : '项目' }} / {{ entry.category }}<span v-if="entry.sample"> · 示例</span></small><strong>{{ entry.title }}</strong><p>{{ entry.description }}</p></span><Icon name="chevron" :size="17"/></button><div v-if="!results.length" class="search-empty"><Icon name="search" :size="30"/><p>暂时没有找到“{{ query }}”</p><span>试试更短的关键词，例如“Vue”或“知识”。</span></div></div><div class="search-footer"><span>↑ ↓ 选择 · Enter 打开</span><span>Esc 关闭</span></div></div>
  </dialog>
</template>
