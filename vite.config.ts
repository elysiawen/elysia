import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { readFileSync, writeFileSync } from 'node:fs'
import { resolve } from 'node:path'
import type { Plugin } from 'vite'

// 1. 构建时自动更新 sitemap lastmod 日期
function autoSitemap(): Plugin {
  return {
    name: 'auto-sitemap',
    closeBundle() {
      const sitemapPath = resolve(__dirname, 'public/sitemap.xml')
      try {
        let xml = readFileSync(sitemapPath, 'utf-8')
        const today = new Date().toISOString().split('T')[0]
        xml = xml.replace(/<lastmod>[\d-]+<\/lastmod>/g, `<lastmod>${today}</lastmod>`)
        writeFileSync(sitemapPath, xml, 'utf-8')
        console.log(`✅ sitemap lastmod → ${today}`)
      } catch {
        // sitemap 不存在时静默跳过
      }
    },
  }
}

// 2. 构建时注入 SEO 友好的静态 HTML 片段（爬虫无需 JS 即可读取核心内容）
function seoStaticContent(): Plugin {
  return {
    name: 'seo-static-content',
    transformIndexHtml(html) {
      // 在 <div id="root"> 之后、<script> 之前注入静态内容
      // noscript 块确保 JS 不可用时爬虫也能抓取完整内容
      const staticBlock = `
    <noscript>
      <div class="seo-static">
        <h1>爱莉希雅 — Elysia</h1>
        <p>逐火十三英桀第二位，「真我」之铭。如飞花般绚丽的少女，始源之律者，人之律者。</p>
        <h2>档案</h2>
        <p>称号：「真我」粉色妖精小姐 · 别称：爱莉、始源之律者、「人之律者」 · 身体数据：163cm · 54.8kg · 生日：11月11日</p>
        <p>凡事任凭心意而为，自由自在，与副首领的身份格格不入的少女。亦是逐火英桀的创立者，聚集并维系此十三人的核心人物。</p>
        <h2>故事</h2>
        <p><strong>飞花坠落凡尘</strong> — 她并非生于人类的襁褓，而是作为崩坏的化身——「第零律者」降临于世。但在睁开眼的那一刻，她没有带来毁灭，反而被人类世界那些微小而闪耀的美好所打动。</p>
        <p><strong>维系群星的纽带</strong> — 她用不知疲倦的热情、看似轻佻却无比真挚的温柔，将十三位性格迥异、身处孤独与阴影中的强者聚集在一起。</p>
        <p><strong>神明的人性之选</strong> — 当神明将律者的神冠加冕于她，她却毫不犹豫地将其踩碎，选择以「人之律者」的身份走完最后一程。</p>
        <p><strong>无瑕的末路悲歌</strong> — 为了给绝望的前文明留下唯一的希望，她精心编排了自己最后的谢幕演出，自愿走向无瑕的消逝。</p>
        <p><strong>永恒的粉色箭矢</strong> — 她的微笑与爱化作了永恒的飞花。时隔万年，那支粉色的水晶长箭依旧闪耀。</p>
        <h2>他们说</h2>
        <p>伊甸：「爱莉总是给人一种热情活泼的感觉，甚至有些调皮，但这恰恰是她真诚的表达。」</p>
        <p>樱：「听说爱莉希雅接手的任务，基本没有失败过，或许这就是『第二位』的实力吧。」</p>
        <p>华：「在入队之初，我受过爱莉希雅许多关照。她似乎和每个人都很亲近，也总能以旁人意想不到的方式解决问题。」</p>
      </div>
    </noscript>`
      return html.replace('<div id="root"></div>', `<div id="root"></div>${staticBlock}`)
    },
  }
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), seoStaticContent(), autoSitemap()],
  build: {
    assetsInlineLimit: 4096,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules/react') || id.includes('node_modules/react-dom')) {
            return 'react'
          }
        },
      },
    },
  },
})
