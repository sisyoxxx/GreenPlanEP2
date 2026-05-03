<template>
  <div class="page-lite products-swiper-wrap">
    <Swiper
      :modules="[Autoplay, Pagination, EffectCoverflow]"
      effect="coverflow"
      :slides-per-view="'auto'"
      :centered-slides="true"
      :loop="slides.length > 1"
      :autoplay="{ delay: 3200 }"
      :pagination="{ clickable: true }"
      :coverflow-effect="{
        rotate: 0,
        stretch: 0,
        depth: 150,
        scale: 0.92,
        modifier: 1,
        slideShadows: false
      }"
      class="products-swiper"
    >
      <SwiperSlide v-for="slide in slides" :key="slide.title" class="products-swiper-slide">
        <div class="products-banner" :class="{ 'has-image': slide.imageUrl }">
          <img
            v-if="slide.imageUrl"
            class="banner-image"
            :src="slide.imageUrl"
            :alt="slide.title"
            loading="lazy"
          />
          <div class="banner-overlay">
            <p class="hero-tag">{{ slide.tag }}</p>
            <h1>{{ slide.title }}</h1>
            <p class="hero-subtitle">{{ slide.desc }}</p>
          </div>
        </div>
      </SwiperSlide>
    </Swiper>
  </div>
</template>

<script setup lang="ts">
import { Swiper, SwiperSlide } from 'swiper/vue'
import { Autoplay, EffectCoverflow, Pagination } from 'swiper/modules'
import 'swiper/css'
import 'swiper/css/effect-coverflow'
import 'swiper/css/pagination'

export interface SlideItem {
  tag: string
  title: string
  desc: string
  imageUrl?: string | null
}

defineProps<{
  slides: SlideItem[]
}>()
</script>

<style scoped>
.products-swiper-wrap {
  padding: 16px 20px 34px;
  overflow: visible;
  position: relative;
  z-index: 2;
}

.products-swiper {
  width: 100%;
  overflow: visible;
}

.products-swiper-slide {
  width: min(460px, 72%);
  transition: transform 0.35s ease, opacity 0.35s ease;
}

.products-banner {
  position: relative;
  overflow: hidden;
  min-height: 240px;
  display: flex;
  align-items: flex-end;
  padding: 0;
  background: linear-gradient(135deg, #ecf7ea, #f8fcf5);
  border-radius: 20px;
  box-shadow: 0 20px 38px rgba(31, 122, 65, 0.12);
}

.banner-image {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
  border-radius: 20px;
}

.banner-overlay {
  position: relative;
  z-index: 1;
  width: 100%;
  padding: 24px 28px;
}

.products-banner.has-image .banner-overlay {
  background: linear-gradient(to top, rgba(0, 0, 0, 0.72) 0%, rgba(0, 0, 0, 0.35) 55%, transparent 100%);
  border-radius: 0 0 20px 20px;
}

.products-banner.has-image .hero-tag,
.products-banner.has-image h1,
.products-banner.has-image .hero-subtitle {
  color: #fff;
}

.hero-tag {
  margin: 0 0 10px;
  color: #1f7a41;
  font-size: 12px;
  font-weight: 700;
}

.hero-subtitle {
  color: #4b5563;
  line-height: 1.7;
  margin: 0;
}

h1 {
  margin: 0 0 6px;
  font-size: 24px;
  line-height: 1.3;
}

:deep(.products-swiper .swiper-slide) {
  opacity: 0.55;
}

:deep(.products-swiper .swiper-slide-active) {
  opacity: 1;
  z-index: 3;
}

:deep(.products-swiper .swiper-slide-prev),
:deep(.products-swiper .swiper-slide-next) {
  opacity: 0.78;
  z-index: 1;
}

:deep(.products-swiper.swiper) {
  overflow: visible;
}

:deep(.products-swiper .swiper-pagination) {
  z-index: 5;
}

@media (max-width: 1280px) {
  .products-swiper-slide {
    width: min(420px, 78%);
  }
}

@media (max-width: 760px) {
  .products-swiper-slide {
    width: 88%;
  }
}
</style>
