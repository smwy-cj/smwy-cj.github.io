<script setup lang="ts">
import { withBase } from 'vitepress'
import { profile } from '../site'
import Icon from './Icon.vue'
</script>
<template>
  <main id="main-content" class="about-page page-width">
    <header class="page-intro" data-reveal><div class="eyebrow">A LITTLE ABOUT ME</div><h1>见天地，也见自己。</h1><p>每一次探索，都让世界清晰一点。</p></header>
    <section class="profile-section" data-reveal><div class="profile-portrait"><img :src="withBase(profile.avatar)" :alt="`${profile.name} 的头像`" width="220" height="220"><span>山水之间 · 保持好奇</span></div><div class="profile-copy"><div class="eyebrow">HELLO, WORLD.</div><h2>你好，我是 {{ profile.name }}。</h2><p>{{ profile.introduction }}</p><p>{{ profile.description }}</p><div class="profile-interests"><span v-for="interest in profile.interests" :key="interest">{{ interest }}</span></div><div class="profile-links"><a :href="profile.github" target="_blank" rel="noopener noreferrer" class="button button-solid"><Icon name="github" :size="18"/>在 GitHub 相遇<Icon name="diagonal" :size="16"/></a><a v-if="profile.email" :href="`mailto:${profile.email}`" class="button button-outline"><Icon name="mail" :size="17"/>写封邮件</a></div></div></section>
    <section class="about-principles"><div data-reveal><span>01 / 探索</span><h3>好奇，是出发的理由。</h3><p>把不理解的事情拆开来看，在学习中寻找新的可能。</p></div><div data-reveal><span>02 / 实践</span><h3>动手，让想法有形。</h3><p>从一个小问题开始，让知识在真实的构建中得到检验。</p></div><div data-reveal><span>03 / 记录</span><h3>落笔，让思考留下。</h3><p>记录路径与困惑，给未来的自己留下一份可以回看的地图。</p></div></section>
    <div class="about-bottom" data-reveal><span>行远自迩，笃行不怠。</span><a class="inline-link" :href="withBase('/journal/')">看看最近的记录<Icon name="arrow" :size="17"/></a></div>
  </main>
</template>
