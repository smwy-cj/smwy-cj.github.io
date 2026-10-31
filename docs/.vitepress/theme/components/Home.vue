<script setup lang="ts">
import { computed } from 'vue'
import { withBase } from 'vitepress'
import { profile } from '../site'
import { data } from '../content.data'
import Landscape from './Landscape.vue'
import Icon from './Icon.vue'
defineProps<{ motion: boolean }>()
const projects = computed(() => data.filter(p => p.layout === 'project').slice(0, 3))
const articles = computed(() => data.filter(p => p.layout === 'article').slice(0, 3))
</script>
<template>
  <main id="main-content" class="river-home">
    <Landscape :motion="motion" />
    <section class="river-hero" aria-label="山水之间，个人主页">
      <div class="river-identity home-ui">
        <h1>{{ profile.name }}</h1>
        <p>记录技术、项目与一路所想。</p>
      </div>
      <div class="river-destinations home-ui">
        <span class="river-label">沿途所记</span>
        <a :href="withBase('/projects/')"><span>项目实践</span><Icon name="arrow" :size="27" /></a>
        <a :href="withBase('/journal/')"><span>进入知识库</span><Icon name="arrow" :size="27" /></a>
      </div>
      <a href="#along-the-river" class="river-scroll home-ui"><span>沿河，慢慢看</span><Icon name="down" :size="16" /></a>
      <span class="river-coordinate home-ui">一山一水，皆是序章</span>
    </section>
    <section id="along-the-river" class="river-chapter chapter-projects">
      <div class="bank-copy bank-light">
        <div class="bank-heading" data-reveal><div class="eyebrow">01 / SELECTED WORKS</div><h2>所行，皆有迹。</h2></div>
        <p class="bank-description" data-reveal>从一个想法出发，让探索在实践中生长。</p>
        <div class="bank-entries">
          <a v-for="(entry,index) in projects" :key="entry.url" :href="withBase(entry.url)" class="bank-entry" data-reveal>
            <span class="bank-number">0{{ index + 1 }}</span>
            <div><small>{{ entry.category }}<span v-if="entry.sample"> · 示例</span></small><h3>{{ entry.title }}</h3><p>{{ entry.description }}</p></div>
            <Icon name="diagonal" :size="20" />
          </a>
        </div>
        <a class="bank-more" :href="withBase('/projects/')" data-reveal>全部项目<Icon name="arrow" :size="18" /></a>
      </div>
    </section>
    <section class="river-chapter chapter-journal">
      <div class="bank-copy bank-dark">
        <div class="bank-heading" data-reveal><div class="eyebrow">02 / NOTES & REFLECTIONS</div><h2>所思，皆成章。</h2></div>
        <p class="bank-description" data-reveal>把零散的知识，慢慢织成自己的地图。</p>
        <div class="bank-entries">
          <a v-for="entry in articles" :key="entry.url" :href="withBase(entry.url)" class="bank-entry" data-reveal>
            <div><small>{{ entry.category }}<span v-if="entry.sample"> · 示例</span></small><h3>{{ entry.title }}</h3><p>{{ entry.description }}</p></div>
            <Icon name="diagonal" :size="20" />
          </a>
        </div>
        <a class="bank-more" :href="withBase('/journal/')" data-reveal>翻阅 {{ data.filter(p => p.layout === 'article').length }} 篇笔记<Icon name="arrow" :size="18" /></a>
      </div>
    </section>
    <section class="river-chapter chapter-about">
      <div class="bank-copy bank-light">
        <div class="bank-heading" data-reveal><div class="eyebrow">03 / A LITTLE ABOUT ME</div><h2>山水一程，<br />很高兴与你相遇。</h2></div>
        <p class="bank-description" data-reveal>{{ profile.introduction }}</p>
        <div class="bank-interests" data-reveal><span v-for="interest in profile.interests" :key="interest">{{ interest }}</span></div>
        <a class="bank-more" :href="withBase('/about.html')" data-reveal>认识一下<Icon name="arrow" :size="18" /></a>
      </div>
    </section>
  </main>
</template>
