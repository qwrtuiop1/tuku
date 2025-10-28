<template>
  <div class="nf">
    <div class="grid">
      <div class="code">404</div>
      <div class="title">页面不存在</div>
      <div class="desc">抱歉，您访问的页面不存在或已被删除</div>
      <div class="actions">
        <button class="btn primary" @click="goHome">
          <span>返回首页</span>
        </button>
        <button class="btn ghost" @click="goBack">
          <span>返回上页</span>
        </button>
      </div>
    </div>
    <div class="lines" aria-hidden="true">
      <div class="l l1"></div>
      <div class="l l2"></div>
      <div class="l l3"></div>
      <div class="l l4"></div>
      <div class="l l5"></div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'
import { House, Back } from '@element-plus/icons-vue'

const router = useRouter()

const goHome = () => {
  router.push('/')
}

const goBack = () => {
  router.go(-1)
}
</script>

<style lang="scss" scoped>
.nf {
  min-height: 100vh;
  display: grid;
  place-items: center;
  background: #0f0f10;
  color: #fff;
  position: relative;
  overflow: hidden;
}

.grid {
  display: grid;
  gap: 16px;
  justify-items: center;
  text-align: center;
  padding: 40px 28px;
}

.code {
  font-size: 128px;
  font-weight: 900;
  letter-spacing: 6px;
  line-height: 1;
  background: linear-gradient(90deg, #fff, #cfcfcf);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  text-shadow: 0 0 40px rgba(255,255,255,0.08);
}

.title {
  font-size: 22px;
  font-weight: 700;
  color: #e5e5e5;
}

.desc {
  font-size: 14px;
  color: #a7a7a7;
  max-width: 520px;
}

.actions {
  display: flex;
  gap: 12px;
  margin-top: 4px;
  flex-wrap: wrap;
}

.btn {
  --bg: #151515;
  --fg: #fff;
  --bd: #2a2a2a;
  position: relative;
  overflow: hidden;
  padding: 12px 18px;
  border-radius: 10px;
  border: 1px solid var(--bd);
  background: var(--bg);
  color: var(--fg);
  font-weight: 700;
  letter-spacing: .4px;
  cursor: pointer;
  transition: transform .2s ease, box-shadow .2s ease, border-color .2s ease;
}

.btn.primary { --bg: #111; --bd: #3a3a3a; }
.btn.ghost { --bg: transparent; --bd: #3a3a3a; }

.btn::before {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(120deg, transparent, rgba(255,255,255,.12), transparent);
  transform: translateX(-100%);
  transition: transform .5s ease;
}

.btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 10px 30px rgba(0,0,0,.35), 0 0 0 1px #2a2a2a inset;
  border-color: #5a5a5a;
}

.btn:hover::before { transform: translateX(100%); }

.lines { position: absolute; inset: 0; opacity: .5; }
.l { position: absolute; left: -20%; width: 140%; height: 1px; background: linear-gradient(90deg, transparent, #2a2a2a, transparent); animation: move 6s linear infinite; }
.l1 { top: 15%; }
.l2 { top: 35%; animation-delay: .6s; }
.l3 { top: 55%; animation-delay: 1.2s; }
.l4 { top: 75%; animation-delay: 1.8s; }
.l5 { top: 90%; animation-delay: 2.4s; }

@keyframes move {
  0% { transform: translateX(0); opacity: .2; }
  50% { opacity: .6; }
  100% { transform: translateX(10%); opacity: .2; }
}

@media (max-width: 768px) {
  .code { font-size: 96px; }
  .title { font-size: 20px; }
  .grid { padding: 32px 20px; }
}
</style>
