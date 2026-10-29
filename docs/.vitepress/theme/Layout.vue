<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useData, useRoute, withBase } from 'vitepress'
import { profile, navigation } from './site'
import { useExperience } from './useExperience'
import { useRiverNavigation } from './useRiverNavigation'
useRiverNavigation()
import { useImageZoom } from './useImageZoom'
useImageZoom()
import Home from './components/Home.vue'
import ContentHub from './components/ContentHub.vue'
import About from './components/About.vue'
import ArticlePage from './components/ArticlePage.vue'
import SearchDialog from './components/SearchDialog.vue'
import Icon from './components/Icon.vue'
const { frontmatter, page } = useData()
const route = useRoute()
const search = ref<InstanceType<typeof SearchDialog>>()
const menuOpen = ref(false)
const { dark, motion, progress, scrolled, toast, ripples, toggleTheme, toggleMotion } = useExperience()
const layout = computed(() => frontmatter.value.layout)
const isReading = computed(() => ['article', 'project'].includes(layout.value))
const notFound = computed(() => page.value.isNotFound || layout.value === 'not-found')
function isActive(href: string) { return href === '/' ? route.path === withBase('/') : route.path.startsWith(withBase(href.replace('.html', ''))) }
watch(() => route.path, () => menuOpen.value = false)
</script>
<template>
  <a class="skip-link" href="#main-content">跳到主要内容</a>
  <div :class="['site-shell', { 'experience-home': layout === 'home' }]">
    <header :class="['site-header', { scrolled }]"><div class="header-inner page-width"><a :href="withBase('/')" class="brand" aria-label="山水之间，回到首页"><span class="brand-symbol"><svg viewBox="0 0 32 32" fill="none" aria-hidden="true"><path d="m4 23 7-13 5 7 5-12 7 18M6 27h20" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round"/></svg></span><span class="brand-type">{{ profile.siteName }}<small>{{ profile.name }}'s space</small></span></a><nav class="desktop-nav" aria-label="主导航"><a v-for="item in navigation" :key="item.href" :href="withBase(item.href)" :class="{ active: isActive(item.href) }" :aria-current="isActive(item.href) ? 'page' : undefined">{{ item.text }}</a></nav><div class="header-actions"><button class="icon-button search-trigger" aria-label="搜索文章与项目" title="搜索 (Ctrl / ⌘ K)" @click="search?.open()"><Icon name="search" :size="19"/><kbd>⌘ K</kbd></button><button v-if="layout === 'home'" class="header-motion" :aria-pressed="motion" :aria-label="motion ? '关闭动态效果' : '开启动效'" @click="toggleMotion"><Icon name="motion" :size="16"/><span>{{ motion ? '动态' : '静态' }}</span></button><span class="header-action-divider"></span><button class="icon-button" :aria-label="dark ? '切换到日读主题' : '切换到夜读主题'" :title="dark ? '日读' : '夜读'" @click="toggleTheme"><Icon :name="dark ? 'sun' : 'moon'" :size="19"/></button><button class="icon-button mobile-menu-trigger" :aria-expanded="menuOpen" aria-controls="mobile-nav" :aria-label="menuOpen ? '收起导航' : '展开导航'" @click="menuOpen = !menuOpen"><Icon :name="menuOpen ? 'close' : 'menu'" :size="21"/></button></div></div><Transition name="menu"><nav v-if="menuOpen" id="mobile-nav" class="mobile-nav" aria-label="手机导航" @keydown.esc="menuOpen = false"><a v-for="item in navigation" :key="item.href" :href="withBase(item.href)" :aria-current="isActive(item.href) ? 'page' : undefined"><span>{{ item.text }}</span><small>{{ item.en }}</small></a></nav></Transition><div v-if="isReading" class="reading-progress" :style="{ transform: `scaleX(${progress / 100})` }" aria-hidden="true"></div></header>
    <div class="route-view"><div :key="route.path" class="route-content"><main v-if="notFound" id="main-content" class="not-found page-width"><div class="eyebrow">404 / A PATH LESS TRAVELLED</div><h1>此处，山路未至。</h1><p>你寻找的页面可能已搬迁，或还在书写中。</p><a class="button button-solid" :href="withBase('/')">回到首页<Icon name="arrow" :size="17"/></a></main><Home v-else-if="layout === 'home'" :motion="motion"/><ContentHub v-else-if="layout === 'projects' || layout === 'journal'" :kind="layout"/><About v-else-if="layout === 'about'"/><ArticlePage v-else/></div></div>
    <footer class="site-footer page-width"><div class="footer-top"><a :href="withBase('/')" class="footer-brand">{{ profile.siteName }}<span>／</span><small>{{ profile.footer }}</small></a><div class="footer-links"><a :href="profile.github" target="_blank" rel="noopener noreferrer" aria-label="访问 GitHub"><Icon name="github" :size="19"/></a><button class="motion-toggle" :aria-pressed="motion" :aria-label="motion ? '关闭动态效果' : '开启动效（遵循系统偏好）'" @click="toggleMotion"><Icon name="motion" :size="18"/><span>{{ motion ? '轻动态' : '静态阅读' }}</span></button><a href="#main-content" class="footer-top-link">回到顶部 ↑</a></div></div><div class="footer-bottom"><span>© {{ new Date().getFullYear() }} {{ profile.name }} · 于此记录，自在生长</span><span>BUILT WITH VUE & A LITTLE CURIOSITY</span></div></footer>
    <div class="cursor-aura" aria-hidden="true"></div><span v-for="ripple in ripples" :key="ripple.id" class="click-ripple" :style="{ left: `${ripple.x}px`, top: `${ripple.y}px` }" aria-hidden="true" @animationend="ripples = ripples.filter(r => r.id !== ripple.id)"></span><Transition name="toast"><div v-if="toast" class="toast" role="status">{{ toast }}</div></Transition><SearchDialog ref="search"/>
  </div>
</template>
