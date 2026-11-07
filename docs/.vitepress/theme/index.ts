import type { Theme } from 'vitepress'
import Layout from './Layout.vue'
import './styles.css'
import './reading.css'
import MermaidDiagram from './components/MermaidDiagram.vue'
import CodeSteps from './components/CodeSteps.vue'

export default {
  Layout,
  enhanceApp({ app }) {
    app.component('MermaidDiagram', MermaidDiagram)
    app.component('CodeSteps', CodeSteps)
  }
} satisfies Theme
