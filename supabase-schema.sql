-- Supabaseの管理画面 > SQL Editor でこのSQLを実行してください

-- 回答テーブル
CREATE TABLE IF NOT EXISTS responses (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,

  -- 回答月（例: 2026-06）
  month VARCHAR(7) NOT NULL,

  -- 第1セクション：お子さんについて
  child_name VARCHAR(100) NOT NULL,
  child_age INTEGER,
  child_grade VARCHAR(50),
  diagnosis TEXT,
  current_support TEXT,

  -- 第2セクション：得意なこと（自由記述）
  favorite_play TEXT,
  favorite_subject TEXT,
  strengths TEXT,
  focus_areas TEXT,
  praised_for TEXT,

  -- 第3セクション：困りごと（1〜5段階）行動・学習面
  restlessness INTEGER CHECK (restlessness BETWEEN 1 AND 5),
  concentration INTEGER CHECK (concentration BETWEEN 1 AND 5),
  posture_bad INTEGER CHECK (posture_bad BETWEEN 1 AND 5),
  fatigue INTEGER CHECK (fatigue BETWEEN 1 AND 5),
  rigidity INTEGER CHECK (rigidity BETWEEN 1 AND 5),
  switching INTEGER CHECK (switching BETWEEN 1 AND 5),
  emotion_control INTEGER CHECK (emotion_control BETWEEN 1 AND 5),
  group_behavior INTEGER CHECK (group_behavior BETWEEN 1 AND 5),
  peer_relations INTEGER CHECK (peer_relations BETWEEN 1 AND 5),
  verbal_communication INTEGER CHECK (verbal_communication BETWEEN 1 AND 5),
  reading_difficulty INTEGER CHECK (reading_difficulty BETWEEN 1 AND 5),
  writing_difficulty INTEGER CHECK (writing_difficulty BETWEEN 1 AND 5),
  motor_clumsiness INTEGER CHECK (motor_clumsiness BETWEEN 1 AND 5),
  sleep_issues INTEGER CHECK (sleep_issues BETWEEN 1 AND 5),
  eating_issues INTEGER CHECK (eating_issues BETWEEN 1 AND 5),

  -- 第3セクション：身体面
  bumping INTEGER CHECK (bumping BETWEEN 1 AND 5),
  posture_concern INTEGER CHECK (posture_concern BETWEEN 1 AND 5),
  body_stiffness INTEGER CHECK (body_stiffness BETWEEN 1 AND 5),
  body_tension INTEGER CHECK (body_tension BETWEEN 1 AND 5),
  fatigue_body INTEGER CHECK (fatigue_body BETWEEN 1 AND 5),
  waking_difficulty INTEGER CHECK (waking_difficulty BETWEEN 1 AND 5),
  color_changes INTEGER CHECK (color_changes BETWEEN 1 AND 5),
  constipation INTEGER CHECK (constipation BETWEEN 1 AND 5),

  -- 第3セクション：感覚面
  loud_sounds INTEGER CHECK (loud_sounds BETWEEN 1 AND 5),
  crowds INTEGER CHECK (crowds BETWEEN 1 AND 5),
  touch_sensitivity INTEGER CHECK (touch_sensitivity BETWEEN 1 AND 5),
  specific_dislikes INTEGER CHECK (specific_dislikes BETWEEN 1 AND 5),
  smell_sensitivity INTEGER CHECK (smell_sensitivity BETWEEN 1 AND 5),
  light_sensitivity INTEGER CHECK (light_sensitivity BETWEEN 1 AND 5),

  -- その他（自由記述）
  concerns_other TEXT,

  -- 第4セクション：将来への希望
  future_hopes TEXT,

  -- メタデータ
  submitted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  -- 同月同名は上書き（ユニーク制約）
  UNIQUE (month, child_name)
);

-- 管理者がデータを読めるようにする（RLSを無効化）
ALTER TABLE responses DISABLE ROW LEVEL SECURITY;
