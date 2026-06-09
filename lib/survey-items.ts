export const BEHAVIOR_ITEMS = [
  { key: 'restlessness', label: '落ち着きがない' },
  { key: 'concentration', label: '集中が続かない' },
  { key: 'posture_bad', label: '姿勢が悪い' },
  { key: 'fatigue', label: '疲れやすい' },
  { key: 'rigidity', label: 'こだわりが強い' },
  { key: 'switching', label: '切り替えが苦手' },
  { key: 'emotion_control', label: '感情のコントロールが難しい' },
  { key: 'group_behavior', label: '集団行動が苦手' },
  { key: 'peer_relations', label: '友達との関わり' },
  { key: 'verbal_communication', label: '言葉で伝えることが苦手' },
  { key: 'reading_difficulty', label: '読むことが苦手' },
  { key: 'writing_difficulty', label: '書くことが苦手' },
  { key: 'motor_clumsiness', label: '運動が苦手' },
  { key: 'clumsiness', label: '不器用さ' },
  { key: 'sleep_issues', label: '睡眠' },
  { key: 'eating_issues', label: '食事' },
] as const

export const BODY_ITEMS = [
  { key: 'bumping', label: 'ぶつかりやすい' },
  { key: 'falling', label: '転びやすい' },
  { key: 'posture_concern', label: '姿勢が気になる' },
  { key: 'body_stiffness', label: '身体が硬い' },
  { key: 'body_tension', label: '身体が緊張しやすい' },
  { key: 'fatigue_body', label: '疲れやすい' },
  { key: 'waking_difficulty', label: '朝起きにくい' },
  { key: 'color_changes', label: '偏食がある' },
  { key: 'constipation', label: '便秘がある' },
] as const

export const SENSORY_ITEMS = [
  { key: 'loud_sounds', label: '大きな音が苦手' },
  { key: 'crowds', label: '人混みが苦手' },
  { key: 'touch_sensitivity', label: '触られるのが苦手' },
  { key: 'specific_dislikes', label: '特定のものを嫌がる' },
  { key: 'smell_sensitivity', label: '匂いに敏感' },
  { key: 'light_sensitivity', label: '光に敏感' },
] as const

export const ALL_SCALE_ITEMS = [...BEHAVIOR_ITEMS, ...BODY_ITEMS, ...SENSORY_ITEMS]

export type ScaleKey = typeof ALL_SCALE_ITEMS[number]['key']
