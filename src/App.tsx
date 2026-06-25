import { useEffect, useMemo, useRef, useState } from 'react'
import ChatWidget from './ChatWidget'
import engrave from './assets/elysia-engrave.png'
import heroImg from './assets/elysia-hero.png'
import './App.css'

const profile = [
  { label: '称号', value: '「真我」\n粉色妖精小姐' },
  { label: '别称', value: '爱莉\n始源之律者\n「人之律者」' },
  { label: '身体数据', value: '163cm · 54.8kg\n（不许四舍五入）' },
  { label: '生日', value: '11月11日' },
]

const floatQuotes = [
  '执拗的花朵永远不会因暴雨而褪去颜色，你的决心也一定能在绝境中绽放真我。',
  '愿你前行的道路有群星闪耀。愿你留下的足迹有百花绽放。你即是上帝的馈赠，世界因你而瑰丽。',
  '悲剧并非终结，而是希望的起始。只有人类会这样想，也只有人类会将这样的信念化为现实。',
  '告别过去，是为了走向未来。',
  '说起粉色头发的可爱女孩，你第一个会想到谁？3，2，1，回答！',
  '你好像有不少问题想问我呢，别心急，我们还有很多很多时间。',
  '至此，我们的故事结束了。而从今以后，就是「你」的故事了。',
  '不论何时何地，爱莉希雅都会回应你的期待。',
  '嗨，我又来啦。多夸夸我好吗？我会很开心的～♪',
  '你可以更光明正大的看向我噢，毕竟我也一直在看着你嘛。来，让我们更深入地了解彼此吧？',
  '唉，要做的事好多～但焦虑可是女孩子的大敌，保持优雅得体，从容愉快地前进吧。',
  '别看我这样，其实我也是很忙的。不过，我的日程上永远有为你预留的时间。',
  '可爱的少女心可是无所不能的噢～♪',
  '这束鲜花，要心怀感激的收下哦～♪',
  '要好好看着我哦～♪',
  '这身衣服是伊甸做的噢，喜欢吗，还是说，喜欢的是我呢～♪',
  '别动噢，借你的眼睛照照镜子……好啦，我看起来怎么样？',
  '嗯～和女孩子独处时，可要好好看向对方的眼睛噢～♪',
  '有空多来陪陪我好吗，你一定不忍心让可爱的我孤独寂寞吧。',
  '这可是你选的衣服，要好好看着，不许移开视线噢。',
  '哇谢谢！我就知道你对我最好啦。',
  '你说，我要是把头发留的和樱那么长，会不会更好看呀？嗯？',
  '咦，你在看哪？哦……很在意这对耳朵？它们很漂亮对吗，我也这么觉得。',
  '离别总是会到来的，就像故事一定会有自己的结局。',
  '少女的心意，可要心怀感激地收下哟。',
  '我的过去？别急嘛。现在，我只想和你创造「未来」♪',
  '你看那朵白白软软的云，是不是有点像我呢？',
  '这里有好多和我一样漂亮的女孩子呀！是天堂吗？',
  '有些事不用太在意，美丽的少女总有些小秘密，不是吗？',
  '你会不会嫌我话多呢？可我就是有好多话想对你说呀。',
  '不许叫错我的名字哦，不然……我会有小情绪的。',
  '别动哦，借你的眼睛照照镜子……好了，我看起来怎么样？',
  '我经常会和别的女孩子谈论你哦。内容……是不是很想知道呀？',
  '你好像有不少问题想问我呢。别心急，我们还有很多很多时间。',
  '那个白头发的漂亮女孩就是芽衣的……被发现咯♪',
  '说起粉色头发的可爱女孩，你第一个会想到谁？3，2，1，回答！',
  '你比我想像中还可爱许多呢。是不是很在意我想像了什么？',
  '这身衣服是伊甸做的哦，喜欢吗？还是说……喜欢的是我呢？',
  '有空多来陪陪我，好吗？你一定不忍心让可爱的我孤独寂寞吧？',
  '你喜欢脚踩在落叶或是新雪上的感觉吗？我很喜欢哦。',
  '和女孩子独处时，可要好好看向对方的眼睛哦~',
]

const theySay = [
  { name: '凯文', quote: '英桀制度的建立者，强大且可靠的战士。' },
  { name: '伊甸', quote: '爱莉总是给人一种热情活泼的感觉，甚至有些调皮，但这恰恰是她真诚的表达。她喜欢有趣的人，热爱有趣的事，也从来不会掩饰这一点。' },
  { name: '樱', quote: '大多数时候我们的工作交集很少。不过听说爱莉希雅接手的任务，基本没有失败过。那些在我看来有些棘手的敌人，在她的报告中都是「非常简单！」，或许这就是「第二位」的实力吧。' },
  { name: '千劫', quote: '你问我？' },
  { name: '华', quote: '在入队之初，我受过爱莉希雅许多关照。她似乎和每个人都很亲近，也总能以旁人意想不到的方式解决问题。好像没有什么能难倒她的事。尽管风格不同，但她毫无疑问是和凯文一样杰出的领袖。' },
  { name: '本人', quote: '呀，这张我拍的真好看！原图发我一份，谢谢~' },
]

const story = [
  {
    title: '飞花坠落凡尘',
    text: '她并非生于人类的襁褓，而是作为崩坏的化身——「第零律者」降临于世。但在睁开眼的那一刻，她没有带来毁灭，反而被人类世界那些微小而闪耀的美好所打动。从那一刻起，一个没有过去的少女，拥有了世界上最炽热的人类之心。',
  },
  {
    title: '维系群星的纽带',
    text: '面对不断崩塌的末日，她作为逐火之英桀的第二位，背负着「真我」之铭。她用不知疲倦的热情、看似轻佻却无比真挚的温柔，将十三位性格迥异、身处孤独与阴影中的强者聚集在一起。她是唯一的纽带，是黑暗中最后的向日葵。',
  },
  {
    title: '神明的人性之选',
    text: '当神明将律者的神冠加冕于她，她却毫不犹豫地将其踩碎。她不愿成为高高在上的神明，而是选择以「人之律者」的身份走完最后一程。她想用自己的存在告诉世界：律者也可以像人类一样去爱，崩坏并非不可战胜的宿命。',
  },
  {
    title: '无瑕的末路悲歌',
    text: '为了给绝望的前文明留下唯一的希望，也为了让后世的律者夺回属于人类的自由，她精心编排了自己最后的谢幕演出。在前文明的第十三次崩坏中，她自愿走向无瑕的消逝，将自己化作最初与最后的始源刻印，永远封入世界的命途。',
  },
  {
    title: '永恒的粉色箭矢',
    text: '她的躯体消逝于终焉之前，但她的微笑与爱却化作了永恒的飞花。时隔万年，当后世的律者（芽衣、琪亚娜）在往世乐土中寻得那份无瑕的真我时，那支粉色的水晶长箭依旧闪耀——她用生命留下的奇迹，终于在千万年后绽放出了名为「人性」的花朵。',
  },
]

const timeQuotes: Record<string, string[]> = {
  morning: [
    '你好！新的一天，从一场美妙的邂逅开始。',
    '嗨！今天天气真好，和我一样闪闪发光呢。',
    '嗨，早上好！一天的好心情，从见到你开始。',
    '嗨，早上好呀！看见我，有没有很开心呢？',
  ],
  afternoon: [
    '甜甜的点心是不是跟甜甜的少女很相配？我也这么觉得。',
  ],
  evening: [
    '天色暗了。接下来……就是「调皮捣蛋」的时间了呢♪',
    '白天的我也很可爱，晚上的我也很可爱，你更喜欢哪个我呢？',
  ],
  night: [
    '哎呀，你也睡不着吗？那我们来聊聊天，好不好？',
    '这么晚了还不睡吗？是在想我，对不对？',
  ],
  dawn: [
    '夜深了……你还在呀？那就让我再陪你一会儿吧。',
    '凌晨了呢。世界好安静，只有你和我。',
    '你该休息啦，约好了，我们明天再见哦。',
  ],
}

const scrambleChars = '爱莉希雅ABCDEFGHIJKLMNOPQRSTUVWXYZあいうえお♡♪'

function getTimeSlot(h: number) {
  if (h >= 6 && h < 12) return 'morning'
  if (h >= 12 && h < 18) return 'afternoon'
  if (h >= 18 && h < 21) return 'evening'
  if (h >= 21) return 'night'
  return 'dawn'
}

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)]
}

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

function useScramble(target: string, trigger: boolean, duration = 1200) {
  const [display, setDisplay] = useState(target)

  useEffect(() => {
    if (!trigger) return
    const start = performance.now()
    const chars = target.split('')
    let raf: number

    const tick = (now: number) => {
      const elapsed = now - start
      const progress = Math.min(elapsed / duration, 1)
      const revealed = Math.floor(progress * chars.length)
      const text = chars.map((c, i) => {
        if (i < revealed) return c
        if (c === ' ') return ' '
        return scrambleChars[Math.floor(Math.random() * scrambleChars.length)]
      }).join('')
      setDisplay(text)
      if (progress < 1) {
        raf = requestAnimationFrame(tick)
      } else {
        setDisplay(target)
      }
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [target, trigger, duration])

  return display
}

function useElapsed() {
  const [sec, setSec] = useState(0)
  useEffect(() => {
    const t = setInterval(() => setSec((s) => s + 1), 1000)
    return () => clearInterval(t)
  }, [])
  const m = Math.floor(sec / 60)
  const s = sec % 60
  return m > 0 ? `${m}分${String(s).padStart(2, '0')}秒` : `${s}秒`
}

function useDaysSinceFirstVisit() {
  const [days, setDays] = useState(1)
  useEffect(() => {
    const key = 'elysia-first-visit'
    const stored = localStorage.getItem(key)
    if (stored) {
      const first = new Date(stored)
      const now = new Date()
      const diff = Math.floor((now.getTime() - first.getTime()) / 86400000)
      setDays(diff + 1)
    } else {
      localStorage.setItem(key, new Date().toISOString())
    }
  }, [])
  return days
}

function App() {
  const shellRef = useRef<HTMLDivElement>(null)
  const petalCanvasRef = useRef<HTMLCanvasElement>(null)
  const trailCanvasRef = useRef<HTMLCanvasElement>(null)
  const whisperRef = useRef<HTMLDivElement>(null)
  const mainRef = useRef<HTMLParagraphElement>(null)
  const [entered, setEntered] = useState(false)
  const [scrollProgress, setScrollProgress] = useState(0)
  const elapsed = useElapsed()
  const daysSinceVisit = useDaysSinceFirstVisit()

  const timeSlot = getTimeSlot(new Date().getHours())

  const greeting = useMemo(() => pick(timeQuotes[timeSlot]), [timeSlot])

  // shared time-filtered quote pool — shuffle once, draw sequentially, reshuffle when exhausted
  const now = new Date()
  const isBirthday = now.getMonth() === 10 && now.getDate() === 11 // 11月11日
  const birthdayQuote = '今天是我的生日哦。要一起庆祝吗？就我们两个人。'

  const poolRef = useRef<{ pool: string[]; idx: number }>({ pool: [], idx: 0 })
  if (poolRef.current.pool.length === 0) {
    const combined = [...floatQuotes, ...timeQuotes[timeSlot]]
    if (isBirthday) combined.push(birthdayQuote)
    const shuffled = shuffle(combined)
    poolRef.current = { pool: shuffled, idx: 0 }
  }

  const getNext = (skip?: string): string => {
    const s = poolRef.current
    if (s.idx >= s.pool.length) {
      s.pool = shuffle(s.pool)
      s.idx = 0
    }
    let q = s.pool[s.idx]
    s.idx++
    if (q === skip && s.pool.length > 1) {
      q = s.pool[s.idx % s.pool.length]
      s.idx++
    }
    return q
  }

  const [mainQuote, setMainQuote] = useState(() => isBirthday ? birthdayQuote : getNext())
  const mainQuoteRef = useRef(mainQuote)

  const titleText = useScramble('爱莉希雅', entered, 1000)

  useEffect(() => {
    const t = setTimeout(() => setEntered(true), 200)
    return () => clearTimeout(t)
  }, [])

  // main quote: slow breathe cycle
  useEffect(() => {
    const t = setInterval(() => {
      const next = getNext(mainQuoteRef.current)
      mainQuoteRef.current = next
      setMainQuote(next)
    }, 10000)
    return () => clearInterval(t)
  }, [])

  // ambient whispers — drifting starlight around the main quote
  useEffect(() => {
    const container = whisperRef.current
    const main = mainRef.current
    if (!container || !main) return

    const timeoutIds = new Set<ReturnType<typeof setTimeout>>()
    const cleanups = new Set<() => void>()

    const spawn = () => {
      if (container.childElementCount >= 9) return

      const text = getNext(mainQuoteRef.current)

      // measure main quote bounds relative to container
      const cr = container.getBoundingClientRect()
      const mr = main.getBoundingClientRect()
      const pad = 40
      const mBox = {
        l: ((mr.left - cr.left - pad) / cr.width) * 100,
        r: ((mr.right - cr.left + pad) / cr.width) * 100,
        t: ((mr.top - cr.top - pad) / cr.height) * 100,
        b: ((mr.bottom - cr.top + pad) / cr.height) * 100,
      }

      // measure existing whispers
      const siblings = Array.from(container.querySelectorAll<HTMLElement>('.whisper-ambient'))
      const hitPad = 3
      const existing = siblings.map((el) => {
        const r = el.getBoundingClientRect()
        return {
          l: ((r.left - cr.left - hitPad) / cr.width) * 100,
          r: ((r.right - cr.left + hitPad) / cr.width) * 100,
          t: ((r.top - cr.top - hitPad) / cr.height) * 100,
          b: ((r.bottom - cr.top + hitPad) / cr.height) * 100,
        }
      })

      // estimated new whisper size in %
      const nw = 22  // ~22% width
      const nh = 10  // ~10% height

      // rectangle-rectangle overlap test
      const overlaps = (a: {l:number;r:number;t:number;b:number}, bl:number, bt:number, br:number, bb: number) =>
        a.l < br && a.r > bl && a.t < bb && a.b > bt

      let cx = 0, cy = 0
      for (let attempt = 0; attempt < 50; attempt++) {
        cx = 3 + Math.random() * (94 - nw)
        cy = 5 + Math.random() * (90 - nh)
        const hitMain = overlaps(mBox, cx, cy, cx + nw, cy + nh)
        const hitExisting = existing.some((r) => overlaps(r, cx, cy, cx + nw, cy + nh))
        if (!hitMain && !hitExisting) break
      }

      const dur = 25 + Math.random() * 15
      const delay = Math.random() * 2
      const size = 0.7 + Math.random() * 0.5
      // drift direction: slow, elegant, random angle
      const angle = Math.random() * Math.PI * 2
      const drift = 12 + Math.random() * 20
      const dx = Math.cos(angle) * drift
      const dy = Math.sin(angle) * drift

      const el = document.createElement('span')
      el.className = 'whisper-ambient'
      el.textContent = text
      el.style.setProperty('--w-top', `${cy}%`)
      el.style.setProperty('--w-left', `${cx}%`)
      el.style.setProperty('--w-dur', `${dur}s`)
      el.style.setProperty('--w-delay', `${delay}s`)
      el.style.setProperty('--w-size', `${size}`)
      el.style.setProperty('--w-dx', `${dx.toFixed(1)}px`)
      el.style.setProperty('--w-dy', `${dy.toFixed(1)}px`)
      const cleanup = () => {
        el.removeEventListener('animationend', cleanup)
        el.remove()
        cleanups.delete(cleanup)
      }
      cleanups.add(cleanup)
      el.addEventListener('animationend', cleanup)
      const tid = setTimeout(() => {
        cleanup()
        timeoutIds.delete(tid)
      }, (dur + delay) * 1000 + 1000)
      timeoutIds.add(tid)
      container.appendChild(el)
    }

    const t = setInterval(spawn, 3000)
    return () => {
      clearInterval(t)
      timeoutIds.forEach(id => clearTimeout(id))
      cleanups.forEach(fn => fn())
    }
  }, [])

  useEffect(() => {
    const onScroll = () => {
      const max = document.documentElement.scrollHeight - window.innerHeight
      setScrollProgress(max > 0 ? Math.min(window.scrollY / max, 1) : 0)
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    const el = shellRef.current
    if (!el) return
    let raf = 0
    const onMove = (e: PointerEvent) => {
      cancelAnimationFrame(raf)
      raf = requestAnimationFrame(() => {
        const x = (e.clientX / window.innerWidth - 0.5) * 2
        const y = (e.clientY / window.innerHeight - 0.5) * 2
        el.style.setProperty('--mx', `${x}`)
        el.style.setProperty('--my', `${y}`)
        el.style.setProperty('--gx', `${e.clientX}px`)
        el.style.setProperty('--gy', `${e.clientY}px`)
      })
    }
    window.addEventListener('pointermove', onMove, { passive: true })
    return () => { cancelAnimationFrame(raf); window.removeEventListener('pointermove', onMove) }
  }, [])

  useEffect(() => {
    const els = document.querySelectorAll<HTMLElement>('.anim-in')
    const obs = new IntersectionObserver(
      (entries) => entries.forEach((e) => {
        e.target.classList.toggle('visible', e.isIntersecting)
      }),
      { threshold: 0.12, rootMargin: '0px 0px -50px 0px' },
    )
    els.forEach((el) => obs.observe(el))

    const footer = document.querySelector<HTMLElement>('.footer')
    if (footer && !footer.classList.contains('visible')) {
      const footObs = new IntersectionObserver(
        ([e]) => { if (e.isIntersecting) footer.classList.add('visible') },
        { threshold: 0.1 },
      )
      footObs.observe(footer)
      return () => { obs.disconnect(); footObs.disconnect() }
    }

    return () => obs.disconnect()
  }, [])


  useEffect(() => {
    const canvas = petalCanvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const dpr = window.devicePixelRatio || 1
    let w = 0, h = 0
    const resize = () => {
      w = window.innerWidth
      h = window.innerHeight
      canvas.width = w * dpr
      canvas.height = h * dpr
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    }
    resize()
    window.addEventListener('resize', resize)

    interface Petal {
      x: number; y: number; size: number; speedY: number
      rot: number; rotSpeed: number; opacity: number
      swayAmp: number; swayFreq: number; swayPhase: number
      grad: CanvasGradient
    }

    const petals: Petal[] = Array.from({ length: 25 }, () => {
      const size = 6 + Math.random() * 10
      const hue = 330 + Math.random() * 30
      const grad = ctx.createRadialGradient(0, 0, 0, 0, 0, size)
      grad.addColorStop(0, `hsla(${hue}, 80%, 88%, 0.9)`)
      grad.addColorStop(1, `hsla(${hue}, 70%, 75%, 0.6)`)
      return {
        x: Math.random() * w,
        y: Math.random() * h - h,
        size,
        speedY: 0.15 + Math.random() * 0.25,
        rot: Math.random() * Math.PI * 2,
        rotSpeed: (Math.random() - 0.5) * 0.008,
        opacity: 0.35 + Math.random() * 0.35,
        swayAmp: 30 + Math.random() * 50,
        swayFreq: 0.003 + Math.random() * 0.004,
        swayPhase: Math.random() * Math.PI * 2,
        grad,
      }
    })

    let frame = 0
    let raf = 0
    let running = true
    const draw = () => {
      ctx.clearRect(0, 0, w, h)
      frame++

      for (const p of petals) {
        p.y += p.speedY
        p.rot += p.rotSpeed
        const swayX = Math.sin(frame * p.swayFreq + p.swayPhase) * p.swayAmp

        if (p.y > h + 20) { p.y = -20; p.x = Math.random() * w }
        if (p.x < -40) p.x = w + 20
        if (p.x > w + 40) p.x = -20

        const px = p.x + swayX
        ctx.save()
        ctx.translate(px, p.y)
        ctx.rotate(p.rot)
        ctx.globalAlpha = p.opacity

        // petal shape
        ctx.beginPath()
        ctx.moveTo(0, -p.size * 0.5)
        ctx.bezierCurveTo(p.size * 0.5, -p.size * 0.3, p.size * 0.4, p.size * 0.4, 0, p.size * 0.5)
        ctx.bezierCurveTo(-p.size * 0.4, p.size * 0.4, -p.size * 0.5, -p.size * 0.3, 0, -p.size * 0.5)

        ctx.fillStyle = p.grad
        ctx.fill()

        ctx.restore()
      }

      raf = requestAnimationFrame(draw)
    }

    // pause animation when tab is not visible
    const onVisibility = () => {
      if (document.hidden) {
        running = false
        cancelAnimationFrame(raf)
      } else if (!running) {
        running = true
        raf = requestAnimationFrame(draw)
      }
    }
    document.addEventListener('visibilitychange', onVisibility)

    draw()

    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('resize', resize)
      document.removeEventListener('visibilitychange', onVisibility)
    }
  }, [])

  // mouse trail particles
  useEffect(() => {
    const canvas = trailCanvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const dpr = window.devicePixelRatio || 1
    let w = 0, h = 0
    const resize = () => {
      w = window.innerWidth
      h = window.innerHeight
      canvas.width = w * dpr
      canvas.height = h * dpr
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    }
    resize()
    window.addEventListener('resize', resize)

    interface Particle {
      x: number; y: number
      vx: number; vy: number
      life: number; maxLife: number
      size: number
      hue: number
    }

    const particles: Particle[] = []
    let lastX = 0, lastY = 0
    let lastTime = 0
    let raf = 0

    const spawnAt = (x: number, y: number, vx: number, vy: number) => {
      const speed = Math.sqrt(vx * vx + vy * vy)
      const count = Math.min(Math.floor(speed / 6), 4) + 1
      for (let i = 0; i < count; i++) {
        const angle = Math.atan2(vy, vx) + (Math.random() - 0.5) * 1.2
        const v = 0.3 + Math.random() * 0.8
        particles.push({
          x: x + (Math.random() - 0.5) * 8,
          y: y + (Math.random() - 0.5) * 8,
          vx: Math.cos(angle) * v,
          vy: Math.sin(angle) * v,
          life: 1,
          maxLife: 0.5 + Math.random() * 0.5,
          size: 2 + Math.random() * 3,
          hue: 330 + Math.random() * 30,
        })
      }
    }

    const onMove = (e: PointerEvent) => {
      const now = performance.now()
      const dt = (now - lastTime) / 1000
      if (dt > 0 && lastTime > 0) {
        const vx = (e.clientX - lastX) / dt
        const vy = (e.clientY - lastY) / dt
        const speed = Math.sqrt(vx * vx + vy * vy)
        if (speed > 80) spawnAt(e.clientX, e.clientY, vx, vy)
      }
      lastX = e.clientX
      lastY = e.clientY
      lastTime = now
    }
    window.addEventListener('pointermove', onMove, { passive: true })

    let prev = 0
    const draw = (now: number) => {
      raf = requestAnimationFrame(draw)
      const dt = prev ? (now - prev) / 1000 : 0.016
      prev = now

      ctx.clearRect(0, 0, w, h)
      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i]
        p.life -= dt / p.maxLife
        if (p.life <= 0) { particles.splice(i, 1); continue }
        p.x += p.vx
        p.y += p.vy
        p.vy += 0.02 // gentle gravity
        const alpha = p.life * 0.7
        const s = p.size * p.life
        ctx.beginPath()
        ctx.arc(p.x, p.y, s, 0, Math.PI * 2)
        ctx.fillStyle = `hsla(${p.hue}, 80%, 82%, ${alpha})`
        ctx.fill()
      }
    }
    raf = requestAnimationFrame(draw)

    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('pointermove', onMove)
      window.removeEventListener('resize', resize)
    }
  }, [])

  return (
    <div ref={shellRef} className={`shell ${entered ? 'entered' : ''}`}>
      <div className="scroll-progress" style={{ transform: `scaleX(${scrollProgress})` }} />

      <div className="bg-aurora" />
      <div className="bg-grid" />
      <div className="glow-cursor" />

      <canvas ref={petalCanvasRef} className="petal-canvas" aria-hidden />
      <canvas ref={trailCanvasRef} className="trail-canvas" aria-hidden />

      <div className="elapsed" aria-hidden>
        <div className="elapsed-days">我们相遇的第 {daysSinceVisit} 天</div>
        <div className="elapsed-row">
          <span className="elapsed-dot" />
          <span>已相伴 {elapsed}</span>
        </div>
      </div>

      {/* ─── HERO ─── */}
      <section className="hero">
        <div className="hero-inner">
          <div className="hero-text">
            <div className="hero-rank">
              <span className="rank-num">II</span>
              <span className="rank-label">逐火十三英桀</span>
            </div>
            <h1 className="title">
              <span className="title-cn">{titleText}</span>
              <span className="title-en">Elysia</span>
            </h1>
            <p className="subtitle">如飞花般绚丽的少女</p>
            <p className="greeting">{greeting}</p>
          </div>

          <div className="hero-art">
            <div className="art-ring art-ring-1" />
            <div className="art-ring art-ring-2" />
            <div className="art-glow" />
            <img className="art-engrave-back" src={engrave} alt="" aria-hidden />
            <img className="art-shadow" src={heroImg} alt="" aria-hidden />
            <img className="art-hero" src={heroImg} alt="爱莉希雅" fetchPriority="high" />
          </div>
        </div>

        <a className="scroll-hint" href="#profile">
          <span>Scroll</span>
          <svg width="16" height="24" viewBox="0 0 16 24" fill="none">
            <rect x="1" y="1" width="14" height="22" rx="7" stroke="currentColor" strokeWidth="1.5" />
            <circle className="scroll-dot" cx="8" cy="8" r="2" fill="currentColor" />
          </svg>
        </a>
      </section>

      {/* ─── PROFILE ─── */}
      <section className="profile-section anim-in" id="profile">
        <div className="section-label">Profile</div>
        <h2 className="section-title">档案</h2>
        <div className="profile-grid">
          {profile.map((item) => (
            <div key={item.label} className="profile-card">
              <span className="profile-label">{item.label}</span>
              <span className="profile-value">
                {item.value.split('\n').map((line, i) => (
                  <span key={i}>{i > 0 && <br />}{line}</span>
                ))}
              </span>
            </div>
          ))}
        </div>
        <p className="profile-desc">
          凡事任凭心意而为，自由自在，与副首领的身份格格不入的少女。亦是逐火英桀的创立者，聚集并维系此十三人的核心人物。
        </p>
      </section>

      <div className="divider anim-in">
        <span className="divider-line" />
        <img className="divider-mark" src={engrave} alt="" />
        <span className="divider-line" />
      </div>

      {/* ─── STORY ─── */}
      <section className="story-section anim-in" id="story">
        <div className="section-label">Story</div>
        <h2 className="section-title">故事</h2>
        <div className="story-list">
          {story.map((item, i) => (
            <article key={i} className="story-card" style={{ animationDelay: `${i * 0.1}s` }}>
              <span className="story-num">{String(i + 1).padStart(2, '0')}</span>
              <div>
                <h3>{item.title}</h3>
                <p>{item.text}</p>
              </div>
            </article>
          ))}
        </div>
      </section>

      <div className="divider anim-in">
        <span className="divider-line" />
        <img className="divider-mark" src={engrave} alt="" />
        <span className="divider-line" />
      </div>

      {/* ─── QUOTES ─── */}
      <section className="whisper-section anim-in" id="quotes">
        <div className="section-label">She Says</div>
        <h2 className="section-title">她说...</h2>

        <div className="whisper-space">
          <div className="whisper-ambient-layer" ref={whisperRef} />
          <p key={mainQuote} className="whisper-main" ref={mainRef}>
            {mainQuote}
          </p>
        </div>
      </section>

      <div className="divider anim-in">
        <span className="divider-line" />
        <img className="divider-mark" src={engrave} alt="" />
        <span className="divider-line" />
      </div>

      {/* ─── RELATIONS ─── */}
      <section className="relations-section anim-in">
        <div className="section-label">Relations</div>
        <h2 className="section-title">英桀关系网</h2>
        <div className="relations-frame-wrap">
          <iframe className="relations-frame" src="/rolemap/index.html" title="英桀关系网" loading="lazy" />
        </div>
      </section>

      <div className="divider anim-in">
        <span className="divider-line" />
        <img className="divider-mark" src={engrave} alt="" />
        <span className="divider-line" />
      </div>

      {/* ─── THEY SAY ─── */}
      <section className="theysay-section anim-in">
        <div className="section-label">They Say</div>
        <h2 className="section-title">他们说</h2>
        <div className="theysay-grid">
          {theySay.map((item) => (
            <article key={item.name} className="theysay-card">
              <h3 className="theysay-name">{item.name}</h3>
              <p className="theysay-quote">{item.quote}</p>
            </article>
          ))}
        </div>
      </section>

      <div className="divider anim-in">
        <span className="divider-line" />
        <img className="divider-mark" src={engrave} alt="" />
        <span className="divider-line" />
      </div>

      {/* ─── SIGNET ─── */}
      <section className="signet-section anim-in">
        <div className="signet-hero">
          <img className="signet-img" src={engrave} alt="" aria-hidden />
          <div className="signet-glow" />
        </div>
        <h2 className="section-title">「真我」之铭</h2>
        <p className="signet-sub">Realme</p>
      </section>

      {/* ─── FOOTER ─── */}
      <footer className="footer anim-in">
        <div className="footer-divider"></div>
        <div className="footer-content">
          <p className="footer-powered">Crafted by Sakura.小文</p>
          <div className="footer-links">
            <a href="https://sakura.elysia.cc/" target="_blank" rel="noopener noreferrer">
              <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
              <span>主页</span>
            </a>
            <span className="footer-sep">·</span>
            <a href="https://space.bilibili.com/22750961" target="_blank" rel="noopener noreferrer">
              <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor"><path d="M17.813 4.653h.854c1.51.054 2.769.578 3.773 1.574 1.004.995 1.524 2.249 1.56 3.76v7.36c-.036 1.51-.556 2.769-1.56 3.773s-2.262 1.524-3.773 1.56H5.333c-1.51-.036-2.769-.556-3.773-1.56S.036 18.858 0 17.347v-7.36c.036-1.511.556-2.765 1.56-3.76 1.004-.996 2.262-1.52 3.773-1.574h.774l-1.174-1.12a1.234 1.234 0 0 1-.373-.906c0-.356.124-.658.373-.907l.027-.027c.267-.249.573-.373.92-.373.347 0 .653.124.92.373L9.653 4.44c.071.071.134.142.187.213h4.267a.836.836 0 0 1 .16-.213l2.853-2.747c.267-.249.573-.373.92-.373.347 0 .662.151.929.4.267.249.391.551.391.907 0 .355-.124.657-.373.906zM5.333 7.24c-.746.018-1.373.276-1.88.773-.506.498-.769 1.13-.786 1.894v7.52c.017.764.28 1.395.786 1.893.507.498 1.134.756 1.88.773h13.334c.746-.017 1.373-.275 1.88-.773.506-.498.769-1.129.786-1.893v-7.52c-.017-.765-.28-1.396-.786-1.894-.507-.497-1.134-.755-1.88-.773zM8 11.107c.373 0 .684.124.933.373.25.249.383.569.4.96v1.173c-.017.391-.15.711-.4.96-.249.25-.56.374-.933.374s-.684-.125-.933-.374c-.25-.249-.383-.569-.4-.96V12.44c.017-.391.15-.711.4-.96.249-.249.56-.373.933-.373zm8 0c.373 0 .684.124.933.373.25.249.383.569.4.96v1.173c-.017.391-.15.711-.4.96-.249.25-.56.374-.933.374s-.684-.125-.933-.374c-.25-.249-.383-.569-.4-.96V12.44c.017-.391.15-.711.4-.96.249-.249.56-.373.933-.373z"/></svg>
              <span>Bilibili</span>
            </a>
            <span className="footer-sep">·</span>
            <a href="https://www.douyin.com/user/MS4wLjABAAAAoTAuAfXYKNUkqrWirhNF5iw-sP-7sTUqCvaBYWk8Y0s" target="_blank" rel="noopener noreferrer">
              <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor"><path d="M19.589 6.686a4.793 4.793 0 0 1-3.77-4.245V2h-3.445v13.672a2.896 2.896 0 0 1-2.893 2.869 2.896 2.896 0 0 1-2.893-2.869 2.896 2.896 0 0 1 2.893-2.869c.298 0 .585.046.853.131V9.508a6.332 6.332 0 0 0-.853-.058 6.34 6.34 0 0 0-6.34 6.34 6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.34-6.34V9.23a8.224 8.224 0 0 0 4.857 1.576V7.36a4.807 4.807 0 0 1-1.092-.674z"/></svg>
              <span>抖音</span>
            </a>
          </div>
        </div>
      </footer>

      <ChatWidget />
    </div>
  )
}

export default App
