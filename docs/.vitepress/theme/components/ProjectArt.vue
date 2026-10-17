<script setup lang="ts">
defineProps<{ variant: string }>()
</script>
<template>
  <div class="project-art" :class="`art-${variant}`" aria-hidden="true">
    <template v-if="variant === 'network'">
      <svg viewBox="0 0 600 300"><g class="network-lines" fill="none" stroke="currentColor" stroke-width=".7" opacity=".32"><path d="m170 90 100-25 95 66 82-55M170 90l77 99 118-58 57 88M170 90l-42 111 119-12 75 66 100-36M270 65l-23 124m118-58-43 124m-75-66 200-113M128 201l142-136"/></g><g fill="currentColor"><circle cx="170" cy="90" r="5"/><circle cx="270" cy="65" r="4"/><circle cx="365" cy="131" r="7"/><circle cx="447" cy="76" r="4"/><circle cx="128" cy="201" r="3"/><circle cx="247" cy="189" r="6"/><circle cx="322" cy="255" r="3"/><circle cx="422" cy="219" r="5"/></g><g fill="none" stroke="currentColor" opacity=".18"><circle cx="365" cy="131" r="28"/><circle cx="365" cy="131" r="45"/><circle cx="170" cy="90" r="19"/></g></svg>
      <span class="art-label">从连接中，发现可能</span><span class="art-corner">01 / INTELLIGENCE</span>
    </template>
    <template v-else-if="variant === 'window'">
      <div class="mini-browser"><div class="mini-bar"><i></i><i></i><i></i><span>山水之间</span></div><div class="mini-body"><div class="mini-sidebar"><b></b><i></i><i></i><i></i></div><div class="mini-content"><span>所思 · 所行</span><div></div><div></div><p></p><p></p></div><svg viewBox="0 0 130 130"><path d="m0 110 30-60 20 19 24-46 56 87Z" fill="currentColor" opacity=".18"/><path d="m35 130 34-61 23 29 17-35 31 67Z" fill="currentColor" opacity=".32"/></svg></div></div>
      <span class="art-corner">02 / WEB EXPERIENCE</span>
    </template>
    <template v-else>
      <svg viewBox="0 0 600 300" class="art-contours"><g fill="none" stroke="currentColor" stroke-width=".8" opacity=".38"><path v-for="i in 9" :key="i" :d="`M ${80-i*12} ${280-i*8} C ${160-i*12} ${90-i*9}, ${240+i*10} ${280-i*8}, ${300+i*11} ${130-i*9} S ${470+i*12} ${80-i*6}, ${550+i*8} ${180+i*7}`"/></g></svg>
      <div class="art-tool"><span>知</span><i>记录，让知识生根。</i></div><span class="art-corner">03 / TOOLS & THOUGHTS</span>
    </template>
  </div>
</template>
