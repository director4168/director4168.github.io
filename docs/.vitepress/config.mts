import { defineConfig } from 'vitepress'

export default defineConfig({
  base: '/docs/',
  srcDir: 'docs',
  outDir: 'docs/.vitepress/dist',

  title: "测试4",
  description: "测试",

  themeConfig: {
    nav: [
      { text: '首页', link: '/' },
      { text: 'VitePress 示例', link: '/docs/' }
    ],

    sidebar: [
      {
        text: '示例',
        items: [
          { text: 'Markdown 示例', link: '/docs/markdown-examples' },
          { text: 'API 示例', link: '/docs/api-examples' }
        ]
      }
    ]
  }
})