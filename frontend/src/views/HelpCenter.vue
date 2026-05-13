<template>
  <div class="help-center-page">
    <section class="help-hero">
      <div class="hero-copy">
        <div class="hero-kicker">
          <el-icon><QuestionFilled /></el-icon>
          <span>帮助中心</span>
        </div>
        <h1>按工作流查找使用指南</h1>
        <p>围绕文件、分享、账户和空间管理整理常见问题，减少在长列表里来回翻找。</p>
      </div>

      <div class="hero-panel" aria-label="帮助中心概览">
        <div class="panel-item">
          <strong>{{ totalGuideCount }}</strong>
          <span>篇指南</span>
        </div>
        <div class="panel-item">
          <strong>{{ helpCategories.length }}</strong>
          <span>个分类</span>
        </div>
        <div class="panel-item">
          <strong>{{ faqCount }}</strong>
          <span>常见问题</span>
        </div>
      </div>
    </section>

    <section class="quick-entry-section" aria-label="常用入口">
      <router-link class="quick-entry" to="/">
        <el-icon><Folder /></el-icon>
        <span>文件管理</span>
      </router-link>
      <router-link class="quick-entry" to="/dashboard">
        <el-icon><InfoFilled /></el-icon>
        <span>仪表盘</span>
      </router-link>
      <router-link class="quick-entry" to="/user-center">
        <el-icon><User /></el-icon>
        <span>个人资料</span>
      </router-link>
      <router-link class="quick-entry" to="/recycle-bin">
        <el-icon><Delete /></el-icon>
        <span>回收站</span>
      </router-link>
    </section>

    <div class="help-layout">
      <aside class="help-nav" aria-label="帮助分类">
        <button
          v-for="category in helpCategories"
          :key="category.key"
          class="nav-item"
          :class="{ active: activeCategory === category.key }"
          type="button"
          @click="setActiveCategory(category.key)"
        >
          <el-icon>
            <component :is="category.icon" />
          </el-icon>
          <span>{{ category.title }}</span>
        </button>
      </aside>

      <main class="guide-stack">
        <section
          v-for="category in helpCategories"
          :id="`help-${category.key}`"
          :key="category.key"
          class="guide-section"
        >
          <div class="section-heading">
            <div class="section-icon">
              <el-icon>
                <component :is="category.icon" />
              </el-icon>
            </div>
            <div>
              <h2>{{ category.title }}</h2>
              <p>{{ category.summary }}</p>
            </div>
          </div>

          <div class="guide-grid">
            <article v-for="item in category.items" :key="item.title" class="guide-card">
              <div class="card-heading">
                <el-icon>
                  <component :is="item.icon" />
                </el-icon>
                <h3>{{ item.title }}</h3>
              </div>
              <p class="guide-intro">{{ item.intro }}</p>

              <ol class="step-list">
                <li v-for="step in item.steps" :key="step">{{ step }}</li>
              </ol>

              <p v-if="item.tip" class="guide-tip">
                {{ item.tip }}
              </p>
            </article>
          </div>
        </section>
      </main>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, markRaw, nextTick, onMounted, onUnmounted, ref } from 'vue'
import {
  Delete,
  Folder,
  FolderAdd,
  InfoFilled,
  Lock,
  Picture,
  QuestionFilled,
  RefreshLeft,
  Search,
  Share,
  Upload,
  User
} from '@element-plus/icons-vue'

const helpCategories = [
  {
    key: 'files',
    title: '文件与整理',
    summary: '上传、建目录、搜索和批量处理都集中在文件管理页面完成。',
    icon: markRaw(Folder),
    items: [
      {
        title: '上传文件',
        intro: '在当前目录上传图片或视频，上传后会进入文件列表并生成预览资源。',
        icon: markRaw(Upload),
        steps: [
          '进入文件管理页面',
          '点击上传按钮',
          '选择图片或视频文件',
          '等待上传完成后查看缩略图'
        ],
        tip: '支持常见图片和视频格式，单次上传数量受系统设置限制。'
      },
      {
        title: '创建文件夹',
        intro: '用文件夹拆分不同项目、日期或用途，减少根目录堆叠。',
        icon: markRaw(FolderAdd),
        steps: [
          '在文件管理页面点击新建',
          '输入文件夹名称',
          '确认创建',
          '点击文件夹进入下级目录'
        ]
      },
      {
        title: '全局搜索',
        intro: '通过文件名、类型、日期和排序条件快速缩小结果范围。',
        icon: markRaw(Search),
        steps: [
          '在顶部搜索框输入关键词',
          '按文件类型筛选图片或视频',
          '按上传日期范围筛选',
          '使用排序菜单调整结果顺序'
        ]
      },
      {
        title: '批量下载',
        intro: '选择多个文件后打包下载，适合一次导出一组素材。',
        icon: markRaw(Folder),
        steps: [
          '在文件列表中勾选多个文件',
          '点击批量下载',
          '等待系统生成压缩包',
          '保存下载文件'
        ]
      }
    ]
  },
  {
    key: 'media',
    title: '预览与分享',
    summary: '文件预览、旋转和分享链接都从文件详情或预览界面进入。',
    icon: markRaw(Picture),
    items: [
      {
        title: '分享文件',
        intro: '生成带访问令牌的链接，接收者可通过链接查看或下载。',
        icon: markRaw(Share),
        steps: [
          '点击文件缩略图打开预览',
          '在详情区域点击分享',
          '生成分享链接',
          '复制链接发送给对方'
        ],
        tip: '分享能力可能受管理员开关控制，若看不到入口请联系管理员。'
      },
      {
        title: '图片旋转',
        intro: '在预览中修正图片方向，并保存到原文件。',
        icon: markRaw(RefreshLeft),
        steps: [
          '打开图片预览',
          '点击左旋或右旋按钮',
          '确认预览方向正确',
          '点击保存'
        ]
      },
      {
        title: '相册整理',
        intro: '把同一主题的图片汇总到相册，便于后续查看和管理。',
        icon: markRaw(Picture),
        steps: [
          '进入我的相册',
          '点击新建相册',
          '填写名称和描述',
          '进入相册后添加文件'
        ]
      }
    ]
  },
  {
    key: 'account',
    title: '账户与安全',
    summary: '个人资料、头像、邮箱和密码相关操作都集中在个人中心。',
    icon: markRaw(User),
    items: [
      {
        title: '修改头像',
        intro: '头像在个人资料页维护，更新后会同步到侧边栏和用户菜单。',
        icon: markRaw(User),
        steps: [
          '从左侧菜单进入个人资料',
          '点击头像上传区域',
          '选择新的头像图片',
          '等待上传成功'
        ]
      },
      {
        title: '忘记密码',
        intro: '通过注册邮箱接收验证码或重置邮件，然后设置新密码。',
        icon: markRaw(Lock),
        steps: [
          '在登录页点击忘记密码',
          '填写用户名和邮箱',
          '完成验证码校验',
          '设置新密码并重新登录'
        ],
        tip: '没有收到邮件时，先检查垃圾邮件或确认邮箱是否已绑定。'
      },
      {
        title: '绑定邮箱',
        intro: '邮箱用于安全验证、找回密码和接收重要通知。',
        icon: markRaw(InfoFilled),
        steps: [
          '进入个人资料',
          '填写邮箱地址',
          '获取并输入邮箱验证码',
          '保存资料'
        ]
      }
    ]
  },
  {
    key: 'storage',
    title: '空间与回收站',
    summary: '空间不足时，优先检查大文件、无用文件和回收站占用。',
    icon: markRaw(Delete),
    items: [
      {
        title: '查看存储占用',
        intro: '顶部和仪表盘会展示当前使用量，便于判断是否接近限制。',
        icon: markRaw(InfoFilled),
        steps: [
          '查看顶部存储进度',
          '进入仪表盘查看分类统计',
          '按文件大小排序定位大文件',
          '删除不再需要的文件'
        ]
      },
      {
        title: '使用回收站',
        intro: '删除后的文件会先进入回收站，可恢复或彻底删除。',
        icon: markRaw(Delete),
        steps: [
          '进入回收站页面',
          '选择需要恢复或删除的文件',
          '点击恢复可放回原位置',
          '点击彻底删除可释放空间'
        ],
        tip: '回收站保留时间取决于个人设置或系统默认策略。'
      }
    ]
  }
]

const activeCategory = ref(helpCategories[0].key)

const totalGuideCount = computed(() => helpCategories.reduce((total, category) => total + category.items.length, 0))
const faqCount = computed(() => 0)

let scrollContainer: HTMLElement | Window | null = null
let scrollRaf = 0

const findScrollContainer = () => {
  const page = document.querySelector('.help-center-page')
  let current = page?.parentElement

  while (current && current !== document.body) {
    const overflowY = window.getComputedStyle(current).overflowY
    if (/(auto|scroll|overlay)/.test(overflowY) && current.scrollHeight > current.clientHeight) {
      return current
    }
    current = current.parentElement
  }

  return window
}

const getScrollElement = () => {
  if (scrollContainer === window) {
    return document.scrollingElement || document.documentElement
  }
  return scrollContainer
}

const updateActiveCategoryFromScroll = () => {
  scrollRaf = 0
  if (!scrollContainer) return

  const scrollElement = getScrollElement()
  if (!scrollElement) return

  const containerTop = scrollContainer === window ? 0 : scrollContainer.getBoundingClientRect().top
  const activationOffset = 112
  let currentKey = helpCategories[0].key

  for (const category of helpCategories) {
    const section = document.getElementById(`help-${category.key}`)
    if (!section) continue

    const sectionTop = section.getBoundingClientRect().top - containerTop
    if (sectionTop <= activationOffset) {
      currentKey = category.key
    } else {
      break
    }
  }

  const scrollTop = scrollContainer === window ? window.scrollY : scrollContainer.scrollTop
  const maxScrollTop = scrollElement.scrollHeight - scrollElement.clientHeight
  if (maxScrollTop - scrollTop <= 8) {
    currentKey = helpCategories[helpCategories.length - 1].key
  }

  activeCategory.value = currentKey
}

const queueActiveCategoryUpdate = () => {
  if (scrollRaf) return
  scrollRaf = window.requestAnimationFrame(updateActiveCategoryFromScroll)
}

const setActiveCategory = (key: string) => {
  activeCategory.value = key
  const target = document.getElementById(`help-${key}`)
  target?.scrollIntoView({ behavior: 'smooth', block: 'start' })
}

onMounted(() => {
  nextTick(() => {
    scrollContainer = findScrollContainer()
    scrollContainer.addEventListener('scroll', queueActiveCategoryUpdate, { passive: true })
    window.addEventListener('resize', queueActiveCategoryUpdate, { passive: true })
    updateActiveCategoryFromScroll()
  })
})

onUnmounted(() => {
  if (scrollRaf) {
    window.cancelAnimationFrame(scrollRaf)
    scrollRaf = 0
  }
  scrollContainer?.removeEventListener('scroll', queueActiveCategoryUpdate)
  window.removeEventListener('resize', queueActiveCategoryUpdate)
})
</script>

<style lang="scss" scoped>
.help-center-page {
  min-height: 100%;
  padding: 28px;
  color: #111827;
  background:
    linear-gradient(180deg, rgba(248, 250, 252, 0.96), rgba(255, 255, 255, 0.98));
}

.help-hero {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 320px;
  gap: 24px;
  align-items: stretch;
  max-width: 1180px;
  margin: 0 auto 18px;
  padding: 28px;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  background: #ffffff;
  box-shadow: 0 16px 36px rgba(15, 23, 42, 0.08);
}

.hero-copy {
  display: flex;
  flex-direction: column;
  justify-content: center;
  min-width: 0;
}

.hero-kicker {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  width: fit-content;
  margin-bottom: 14px;
  padding: 6px 10px;
  border: 1px solid #dbeafe;
  border-radius: 6px;
  background: #eff6ff;
  color: #2563eb;
  font-size: 13px;
  font-weight: 700;
}

.hero-copy h1 {
  margin: 0;
  font-size: 34px;
  line-height: 1.2;
  font-weight: 800;
  letter-spacing: 0;
}

.hero-copy p {
  max-width: 620px;
  margin: 12px 0 0;
  color: #64748b;
  font-size: 15px;
  line-height: 1.8;
}

.hero-panel {
  display: grid;
  grid-template-columns: 1fr;
  gap: 10px;
}

.panel-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  min-height: 64px;
  padding: 14px 16px;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  background: #f8fafc;

  strong {
    font-size: 24px;
    color: #0f172a;
  }

  span {
    color: #64748b;
    font-size: 14px;
  }
}

.quick-entry-section {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 12px;
  max-width: 1180px;
  margin: 0 auto 18px;
}

.quick-entry {
  display: flex;
  align-items: center;
  gap: 10px;
  min-height: 52px;
  padding: 0 16px;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  background: #ffffff;
  color: #1f2937;
  text-decoration: none;
  font-weight: 700;
  box-shadow: 0 8px 20px rgba(15, 23, 42, 0.05);
  transition: border-color 0.2s ease, transform 0.2s ease, box-shadow 0.2s ease;

  .el-icon {
    color: #2563eb;
  }

  &:hover {
    border-color: #bfdbfe;
    box-shadow: 0 12px 28px rgba(37, 99, 235, 0.12);
    transform: translateY(-1px);
  }
}

.help-layout {
  display: grid;
  grid-template-columns: 220px minmax(0, 1fr);
  gap: 18px;
  max-width: 1180px;
  margin: 0 auto;
  align-items: start;
}

.help-nav {
  position: sticky;
  top: 84px;
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 10px;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  background: #ffffff;
  box-shadow: 0 10px 24px rgba(15, 23, 42, 0.05);
}

.nav-item {
  display: flex;
  align-items: center;
  gap: 10px;
  width: 100%;
  min-height: 42px;
  padding: 0 12px;
  border: 1px solid transparent;
  border-radius: 6px;
  background: transparent;
  color: #475569;
  text-align: left;
  font-size: 14px;
  font-weight: 700;
  cursor: pointer;
  transition: background 0.2s ease, border-color 0.2s ease, color 0.2s ease;

  .el-icon {
    font-size: 16px;
  }

  &:hover,
  &.active {
    border-color: #dbeafe;
    background: #eff6ff;
    color: #1d4ed8;
  }
}

.guide-stack {
  display: flex;
  flex-direction: column;
  gap: 18px;
  min-width: 0;
}

.guide-section {
  scroll-margin-top: 88px;
  padding: 22px;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  background: #ffffff;
  box-shadow: 0 12px 30px rgba(15, 23, 42, 0.06);
}

.section-heading {
  display: flex;
  gap: 12px;
  align-items: flex-start;
  margin-bottom: 18px;

  h2 {
    margin: 0;
    font-size: 22px;
    line-height: 1.3;
    font-weight: 800;
    color: #0f172a;
  }

  p {
    margin: 6px 0 0;
    color: #64748b;
    font-size: 14px;
    line-height: 1.7;
  }
}

.section-icon {
  display: grid;
  place-items: center;
  flex: 0 0 40px;
  width: 40px;
  height: 40px;
  border-radius: 8px;
  background: #f0fdf4;
  color: #16a34a;
}

.guide-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 14px;
}

.guide-card {
  min-width: 0;
  padding: 18px;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  background: #fbfdff;
}

.card-heading {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 10px;

  .el-icon {
    flex: 0 0 auto;
    color: #2563eb;
    font-size: 18px;
  }

  h3 {
    margin: 0;
    min-width: 0;
    color: #111827;
    font-size: 16px;
    line-height: 1.4;
    font-weight: 800;
    overflow-wrap: anywhere;
  }
}

.guide-intro {
  margin: 0 0 12px;
  color: #64748b;
  font-size: 14px;
  line-height: 1.7;
}

.step-list {
  margin: 0;
  padding: 0;
  list-style: none;
  counter-reset: guide-step;

  li {
    position: relative;
    min-height: 28px;
    padding: 4px 0 4px 34px;
    color: #334155;
    font-size: 14px;
    line-height: 1.5;
    counter-increment: guide-step;

    &::before {
      content: counter(guide-step);
      position: absolute;
      left: 0;
      top: 3px;
      display: grid;
      place-items: center;
      width: 22px;
      height: 22px;
      border-radius: 50%;
      background: #e0f2fe;
      color: #0369a1;
      font-size: 12px;
      font-weight: 800;
    }
  }
}

.guide-tip {
  margin: 12px 0 0;
  padding: 10px 12px;
  border: 1px solid #bfdbfe;
  border-radius: 6px;
  background: #eff6ff;
  color: #1e40af;
  font-size: 13px;
  line-height: 1.6;
}

@media (max-width: 1024px) {
  .help-center-page {
    padding: 20px;
  }

  .help-hero {
    grid-template-columns: 1fr;
  }

  .hero-panel {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }

  .quick-entry-section {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .help-layout {
    grid-template-columns: 1fr;
  }

  .help-nav {
    position: static;
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 720px) {
  .help-center-page {
    padding: 14px;
  }

  .help-hero,
  .guide-section {
    padding: 18px;
  }

  .hero-copy h1 {
    font-size: 26px;
  }

  .hero-panel,
  .quick-entry-section,
  .help-nav,
  .guide-grid {
    grid-template-columns: 1fr;
  }

  .panel-item {
    min-height: 56px;
  }

  .quick-entry {
    min-height: 48px;
  }

  .section-heading {
    align-items: center;
  }
}
</style>
