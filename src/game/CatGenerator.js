// Procedural Cat Generator - Karpathy Style
// Simple parameters → Infinite variety

export class CatGenerator {
  static idCounter = 0

  // Natural cat color ranges (HSL)
  static colorRanges = {
    orange: { h: [20, 40], s: [60, 80], l: [55, 75] },
    cream: { h: [30, 50], s: [30, 50], l: [75, 90] },
    brown: { h: [20, 35], s: [40, 60], l: [35, 55] },
    gray: { h: [0, 360], s: [0, 10], l: [40, 70] },
    black: { h: [0, 360], s: [0, 10], l: [5, 20] },
    white: { h: [40, 60], s: [5, 15], l: [90, 98] },
  }

  static eyeColors = {
    green: { h: [80, 140], s: [50, 70], l: [40, 55] },
    gold: { h: [40, 55], s: [70, 90], l: [50, 60] },
    blue: { h: [200, 230], s: [60, 80], l: [50, 65] },
    amber: { h: [30, 45], s: [80, 95], l: [45, 55] },
    copper: { h: [15, 30], s: [70, 85], l: [40, 50] },
  }

  static patternTypes = ['solid', 'tabby', 'calico', 'tuxedo', 'spots', 'bicolor']
  static patternWeights = [25, 30, 10, 15, 10, 10] // Probability weights

  static generate() {
    const id = `cat_${++this.idCounter}_${Date.now()}`

    // Base color
    const baseColorType = this.randomChoice(Object.keys(this.colorRanges))
    const baseColor = this.randomColorInRange(this.colorRanges[baseColorType])

    // Pattern
    const patternType = this.weightedChoice(this.patternTypes, this.patternWeights)
    const patternColor = this.generatePatternColor(baseColorType, patternType)
    const patternIntensity = 0.3 + Math.random() * 0.5

    // Eyes
    const eyeColorType = this.randomChoice(Object.keys(this.eyeColors))
    const eyeColor = this.randomColorInRange(this.eyeColors[eyeColorType])

    // Physical traits
    const eyeSize = 0.85 + Math.random() * 0.3
    const earSize = 0.85 + Math.random() * 0.3
    const tailLength = 0.7 + Math.random() * 0.6
    const bodySize = 0.85 + Math.random() * 0.3
    const fluffiness = Math.random()

    // Calculate rarity
    const rarity = this.calculateRarity({
      baseColorType, patternType, eyeColorType, eyeSize, fluffiness
    })

    // Generate unique name
    const name = this.generateName()

    return {
      id,
      name,

      // Appearance
      baseColor,
      baseColorType,
      patternType,
      patternColor,
      patternIntensity,
      eyeColor,
      eyeColorType,
      eyeSize,
      earSize,
      tailLength,
      bodySize,
      fluffiness,
      rarity,

      // Will be set by Cat class
      personality: this.generatePersonality(),
    }
  }

  static generatePatternColor(baseColorType, patternType) {
    if (patternType === 'solid') {
      return null
    }

    if (patternType === 'tuxedo') {
      return { h: 0, s: 0, l: 95 } // White
    }

    if (patternType === 'calico') {
      // Orange or black patches on white
      return Math.random() > 0.5
        ? this.randomColorInRange(this.colorRanges.orange)
        : this.randomColorInRange(this.colorRanges.black)
    }

    // Tabby, spots, bicolor - darker version of base
    const base = this.colorRanges[baseColorType]
    return {
      h: this.randomInRange(base.h[0], base.h[1]),
      s: this.randomInRange(base.s[0], base.s[1]),
      l: this.randomInRange(base.l[0] * 0.5, base.l[1] * 0.7),
    }
  }

  static generatePersonality() {
    return {
      curiosity: Math.random(),      // 탐험 vs 한자리
      energy: Math.random(),         // 활발 vs 느긋
      friendliness: Math.random(),   // 친화적 vs 독립적
      playfulness: Math.random(),    // 장난 vs 진지
      boldness: Math.random(),       // 대담 vs 소심
    }
  }

  static calculateRarity(traits) {
    let score = 0

    // Rare base colors
    if (traits.baseColorType === 'white') score += 2
    if (traits.baseColorType === 'black') score += 1

    // Rare patterns
    if (traits.patternType === 'calico') score += 2
    if (traits.patternType === 'spots') score += 1

    // Rare eye colors
    if (traits.eyeColorType === 'blue') score += 2
    if (traits.eyeColorType === 'copper') score += 1

    // Extreme traits
    if (traits.eyeSize > 1.1) score += 1
    if (traits.fluffiness > 0.8) score += 1

    // Special combo: white + blue eyes
    if (traits.baseColorType === 'white' && traits.eyeColorType === 'blue') {
      score += 3
    }

    // Black cat with gold eyes
    if (traits.baseColorType === 'black' && traits.eyeColorType === 'gold') {
      score += 2
    }

    if (score >= 6) return 'legendary'
    if (score >= 4) return 'rare'
    if (score >= 2) return 'uncommon'
    return 'common'
  }

  static generateName() {
    const prefixes = [
      '꼬마', '아기', '새침', '졸린', '배고픈',
      '도도한', '귀여운', '포근한', '말랑', '동글'
    ]
    const names = [
      '모찌', '콩이', '두부', '감자', '고구마', '밤이',
      '호떡', '찹쌀', '인절미', '송편', '약과', '단팥',
      '구름', '달이', '별이', '해피', '러키', '초코',
      '우유', '라떼', '카푸', '모카', '바닐라', '캬라멜',
      '솜이', '뭉치', '포도', '귤이', '복숭아', '딸기',
      '치즈', '버터', '푸딩', '마카롱', '쿠키', '타르트'
    ]

    if (Math.random() < 0.25) {
      return `${this.randomChoice(prefixes)} ${this.randomChoice(names)}`
    }
    return this.randomChoice(names)
  }

  // Utility functions
  static randomInRange(min, max) {
    return min + Math.random() * (max - min)
  }

  static randomColorInRange(range) {
    return {
      h: this.randomInRange(range.h[0], range.h[1]),
      s: this.randomInRange(range.s[0], range.s[1]),
      l: this.randomInRange(range.l[0], range.l[1]),
    }
  }

  static randomChoice(arr) {
    return arr[Math.floor(Math.random() * arr.length)]
  }

  static weightedChoice(items, weights) {
    const total = weights.reduce((a, b) => a + b, 0)
    let random = Math.random() * total
    for (let i = 0; i < items.length; i++) {
      random -= weights[i]
      if (random <= 0) return items[i]
    }
    return items[items.length - 1]
  }

  static hslToHex(hsl) {
    const h = hsl.h / 360
    const s = hsl.s / 100
    const l = hsl.l / 100

    const hue2rgb = (p, q, t) => {
      if (t < 0) t += 1
      if (t > 1) t -= 1
      if (t < 1/6) return p + (q - p) * 6 * t
      if (t < 1/2) return q
      if (t < 2/3) return p + (q - p) * (2/3 - t) * 6
      return p
    }

    let r, g, b
    if (s === 0) {
      r = g = b = l
    } else {
      const q = l < 0.5 ? l * (1 + s) : l + s - l * s
      const p = 2 * l - q
      r = hue2rgb(p, q, h + 1/3)
      g = hue2rgb(p, q, h)
      b = hue2rgb(p, q, h - 1/3)
    }

    const toHex = x => {
      const hex = Math.round(x * 255).toString(16)
      return hex.length === 1 ? '0' + hex : hex
    }

    return parseInt(`${toHex(r)}${toHex(g)}${toHex(b)}`, 16)
  }
}
