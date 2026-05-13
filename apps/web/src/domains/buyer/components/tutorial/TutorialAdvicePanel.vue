<template>
  <aside class="advice-panel page-lite">
    <section class="weather-block">
      <div class="panel-kicker">今日天气</div>
      <div class="weather-info">
        <span class="weather-icon">☀</span>
        <div>
          <strong>晴转多云 22°C ~ 28°C</strong>
          <span class="weather-meta">湿度 65% · 微风 · 适合阳台养护</span>
        </div>
      </div>
    </section>

    <section class="suggestion-block">
      <div class="panel-kicker">种植建议</div>
      <div class="suggestion-list">
        <div class="suggestion-item">
          <span class="suggestion-icon">🌱</span>
          <div>
            <strong>适合播种</strong>
            <p>生菜、罗勒和向日葵都适合当前温度段。</p>
          </div>
        </div>
        <div class="suggestion-item">
          <span class="suggestion-icon">💧</span>
          <div>
            <strong>浇水节奏</strong>
            <p>建议傍晚少量多次浇水，避免中午高温蒸发过快。</p>
          </div>
        </div>
        <div class="suggestion-item">
          <span class="suggestion-icon">📝</span>
          <div>
            <strong>本周任务</strong>
            <p>检查育苗盆通风情况，及时间苗，避免幼苗徒长。</p>
          </div>
        </div>
      </div>
    </section>
  </aside>
</template>

<style scoped>
.advice-panel {
  display: grid;
  gap: 16px;
  align-content: start;
  background: linear-gradient(180deg, #fbfefb, #f5fbf6);
  width: 100%;
  max-width: 260px;
  justify-self: end;
  min-height: 0;
  max-height: 100%;
  overflow-y: auto;
  padding-right: 6px;
}

.panel-kicker {
  font-size: 12px;
  font-weight: 700;
  color: #1f7a41;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.weather-block,
.suggestion-block {
  display: grid;
  gap: 10px;
}

.weather-info {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  border-radius: 14px;
  background: #f8fcf8;
  border: 1px solid #e4efe6;
}

.weather-icon {
  font-size: 24px;
}

.weather-info strong {
  display: block;
  color: #1f2937;
}

.weather-meta {
  display: block;
  margin-top: 4px;
  color: #6b7280;
  font-size: 12px;
}

.suggestion-list {
  display: grid;
  gap: 10px;
}

.suggestion-item {
  display: grid;
  grid-template-columns: 38px minmax(0, 1fr);
  gap: 10px;
  align-items: start;
  padding: 12px;
  border-radius: 14px;
  background: #fff;
  border: 1px solid #e4efe6;
}

.suggestion-icon {
  width: 38px;
  height: 38px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #edf9ef;
  color: #1f7a41;
}

.suggestion-item strong {
  color: #1f2937;
}

.suggestion-item p {
  margin: 4px 0 0;
  color: #6b7280;
  font-size: 13px;
  line-height: 1.6;
}

@media (max-width: 1100px) {
  .advice-panel {
    max-width: none;
    justify-self: stretch;
  }
}
</style>
