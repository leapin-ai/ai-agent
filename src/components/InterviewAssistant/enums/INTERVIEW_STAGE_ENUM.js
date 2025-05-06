const INTERVIEW_STAGE_ENUM = [
  { value: 1, description: '开场白', time: '5-10min', info: '暖场，观察表达能力' },
  {
    value: 2,
    description: '核心能力评估',
    time: '30-45min',
    info: '专业问题/行为问题'
  },
  { value: 3, description: '情景模拟', time: '20-30min', info: '实战问题解决能力' },
  {
    value: 4,
    description: '动机与文化匹配',
    time: '15-20min',
    info: '职业规划、团队适配'
  },
  { value: 5, description: '候选人提问', time: '5-10min', info: '判断兴趣与准备程度' }
];

export default INTERVIEW_STAGE_ENUM;
