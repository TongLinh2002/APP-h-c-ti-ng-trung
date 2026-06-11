<template>
  <div class="flashcard-wrap">
    <div class="flashcard" :class="{ flipped }" @click="flip">
      <div class="card-face card-front">
        <p class="hanzi">{{ card.Vocabulary?.hanzi }}</p>
        <p class="hint">{{ $t('flashcard.hint') }}</p>
      </div>
      <div class="card-face card-back">
        <p class="hanzi">{{ card.Vocabulary?.hanzi }}</p>
        <p class="pinyin">{{ card.Vocabulary?.pinyin }}</p>
        <p class="meaning">{{ card.Vocabulary?.meaning_vi }}</p>
        <p v-if="card.Vocabulary?.example_sentence" class="example">
          {{ card.Vocabulary.example_sentence }}
        </p>
      </div>
    </div>

    <div v-if="flipped" class="rating-row">
      <button class="btn-rating forget" @click.stop="$emit('rate', 0)">{{ $t('flashcard.forget') }}</button>
      <button class="btn-rating hard"   @click.stop="$emit('rate', 1)">{{ $t('flashcard.hard') }}</button>
      <button class="btn-rating ok"     @click.stop="$emit('rate', 2)">{{ $t('flashcard.ok') }}</button>
      <button class="btn-rating easy"   @click.stop="$emit('rate', 3)">{{ $t('flashcard.easy') }}</button>
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()
const props = defineProps({ card: Object })
defineEmits(['rate'])
const flipped = ref(false)
watch(() => props.card, () => { flipped.value = false })
function flip() { flipped.value = !flipped.value }
</script>

<style scoped>
.flashcard-wrap { display: flex; flex-direction: column; align-items: center; gap: 20px; }
.flashcard { width: 340px; height: 200px; cursor: pointer; perspective: 1000px; }
.card-face { position: absolute; width: 100%; height: 100%; backface-visibility: hidden; border-radius: 12px; box-shadow: 0 4px 16px rgba(0,0,0,0.12); display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 20px; }
.card-front { background: white; }
.card-back { background: #fff8e1; transform: rotateY(180deg); }
.flashcard.flipped .card-front { transform: rotateY(180deg); }
.flashcard.flipped .card-back { transform: rotateY(0deg); }
.hanzi { font-size: 3rem; margin-bottom: 8px; }
.hint { color: #aaa; font-size: 0.85rem; }
.pinyin { color: #e65100; font-size: 1.2rem; margin-bottom: 6px; }
.meaning { font-size: 1.1rem; font-weight: 600; }
.example { font-size: 0.85rem; color: #666; margin-top: 8px; text-align: center; }
.rating-row { display: flex; gap: 12px; }
.btn-rating { padding: 10px 20px; border: none; border-radius: 8px; cursor: pointer; font-size: 0.95rem; font-weight: 600; }
.forget { background: #ffcdd2; color: #c62828; }
.hard { background: #ffe0b2; color: #e65100; }
.ok { background: #dcedc8; color: #33691e; }
.easy { background: #b3e5fc; color: #01579b; }
</style>
