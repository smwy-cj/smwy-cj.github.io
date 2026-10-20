<script setup lang="ts">
import { computed } from 'vue'
import { withBase } from 'vitepress'
import { profile } from '../site'
import { data } from '../content.data'
import Landscape from './Landscape.vue'
import EntryCard from './EntryCard.vue'
import ArticleRow from './ArticleRow.vue'
import Icon from './Icon.vue'
const projects = computed(() => data.filter(p => p.layout === 'project').slice(0, 3))
const articles = computed(() => data.filter(p => p.layout === 'article').slice(0, 3))
</script>
<template>
  <main id="main-content">
    <section class="hero page-width">
      <div class="hero-copy">
        <div class="hero-eyebrow"><span></span> 不识庐山真面目，只缘身在此山中</div>
        <h1>小舟从此逝，<br>江海<span class="ink-word">寄余生</span>。</h1>
        <p class="hero-description">{{ profile.introduction }}</p>
        <div class="hero-actions"><a class="button button-solid" :href="withBase('/projects/')">探索项目<Icon name="arrow" :size="17" /></a><a class="button button-text" :href="withBase('/journal/')">翻阅笔记<Icon name="book" :size="17" /></a></div>
        <div class="hero-person"><img :src="withBase(profile.avatar)" :alt="`${profile.name} 的头像`" width="38" height="38"><div><span>{{ profile.name }}</span><p>{{ profile.interests.join(' / ') }}</p></div><span class="person-divider"></span><span class="hero-person-note">保持好奇，步履不停</span></div>
      </div>
      <Landscape />
      <div class="hero-vertical">看人间 · 天地宽</div>
      <a href="#selected-projects" class="scroll-cue"><span class="scroll-track"><i></i></span><span>向下，慢慢看</span></a>
      <span class="hero-corner">THOUGHTS TAKE ROOT HERE.</span>
    </section>

    <div class="intro-strip page-width" data-reveal><span class="tiny-label">在这里</span><p>山重水复疑无路，柳暗花明又一村。</p><span class="intro-strip-note">探索 / 实践 / 沉淀</span></div>

    <section id="selected-projects" class="section page-width">
      <div class="section-heading" data-reveal><div><div class="eyebrow">01 / SELECTED WORKS</div><h2>让想法，落地生长<span>。</span></h2><p>一些实践，一些尝试，以及从零到一的过程。</p></div><a class="inline-link" :href="withBase('/projects/')">全部项目<Icon name="arrow" :size="17" /></a></div>
      <div class="project-grid"><EntryCard v-for="(project, index) in projects" :key="project.url" :entry="project" :number="index + 1" /></div>
    </section>

    <section class="journal-section">
      <div class="section page-width"><div class="section-heading" data-reveal><div><div class="eyebrow">02 / NOTES & REFLECTIONS</div><h2>知有所积，思有所记<span>。</span></h2><p>整理知识的脉络，也记录探索时的灵光。</p></div><a class="inline-link" :href="withBase('/journal/')">进入知识库<Icon name="arrow" :size="17" /></a></div>
        <div class="journal-home-layout"><div class="journal-aside" data-reveal><span class="journal-mark">记</span><p>温故而知新，<br>落笔即生根。</p><span>NOTES ALONG THE WAY</span><a :href="withBase('/journal/')" class="inline-link">{{ data.filter(p => p.layout === 'article').length }} 篇笔记<Icon name="arrow" :size="16" /></a></div><div class="article-list"><ArticleRow v-for="article in articles" :key="article.url" :entry="article" /></div></div>
      </div>
    </section>

    <section class="about-banner page-width" data-reveal><div class="about-banner-icon"><Icon name="leaf" :size="34" /></div><div><div class="eyebrow">NICE TO MEET YOU</div><h2>山水一程，很高兴与你相遇。</h2><p>关于我，关于热爱，也关于仍在继续的探索。</p></div><a :href="withBase('/about.html')" class="button button-outline">认识一下<Icon name="diagonal" :size="17" /></a></section>
  </main>
</template>
