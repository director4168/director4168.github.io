import { defineConfig } from 'vitepress'

export default defineConfig({

  base: '/docs/', 

  srcDir: '.', 

  outDir: 'docs/.vitepress/dist',

  title: "测试4",
  description: "测试",

  themeConfig: {
    nav: [
      { text: '回到主页', link: '/' }, 
      { text: '文档首页', link: '/' } 
    ],

    sidebar: [
      {
        text: '示例',
        items: [
          { text: 'Markdown 示例', link: '/markdown-examples' },
          { text: 'API 示例', link: '/api-examples' }
        ]
      }
    ]
  }
})
