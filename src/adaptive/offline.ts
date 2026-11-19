import type { Exercise } from './types';
type L = 'kk' | 'ru';
const T = {
  kk: { pick: 'Дұрыс жауапты таңдаңыз.', pickS: 'Бір жауапты басыңыз.', apples: 'Қай суретте 4 алма бар?', match: 'Есепті жауабымен жұптаңыз.', matchS: 'Әр есепке жауап таңдаңыз.', order: '3 + 2 есептеу қадамдарын ретімен қойыңыз.', orderS: 'Қадамдарды ретімен қойыңыз.',
    s: ['3 санын алыңыз', '2 санын қосыңыз', 'Жауап: 5'], ex5: '3 және 2 бірге 5 болады.', ex4: '4 алма — төртінші сурет.', exm: 'Сандарды қосып, жауабын табамыз.', exo: 'Алдымен санды аламыз, содан соң қосамыз.', ex13: '6 + 7 = 13.',
    h1: ['Саусақтарыңызбен санаңыз.', '3-тен бастап 2 рет санаңыз.'], h2: ['Алмаларды санап көріңіз.'], h3: ['Әр есепті жеке шығарыңыз.'], h4: ['Бірінші не істейміз?'], h5: ['6-дан бастап 7 рет санаңыз.', '6 + 4 = 10, содан 3 қосыңыз.'], take: '3 санын алыңыз', add: '2 санын қосыңыз', ans: 'Жауап: 5' },
  ru: { pick: 'Выберите правильный ответ.', pickS: 'Нажмите один ответ.', apples: 'На какой картинке 4 яблока?', match: 'Соедините пример с ответом.', matchS: 'К каждому примеру выберите ответ.', order: 'Расставьте шаги решения 3 + 2 по порядку.', orderS: 'Поставьте шаги по порядку.',
    s: ['Возьмите число 3', 'Прибавьте число 2', 'Ответ: 5'], ex5: '3 и 2 вместе — это 5.', ex4: '4 яблока — четвёртая картинка.', exm: 'Складываем числа и находим ответ.', exo: 'Сначала берём число, потом прибавляем.', ex13: '6 + 7 = 13.',
    h1: ['Посчитайте на пальцах.', 'Начните с 3 и прибавьте 2 раза по 1.'], h2: ['Попробуйте посчитать яблоки.'], h3: ['Решайте каждый пример отдельно.'], h4: ['С чего мы начнём?'], h5: ['Начните с 6 и прибавьте 7.', '6 + 4 = 10, потом ещё 3.'], take: 'Возьмите число 3', add: 'Прибавьте число 2', ans: 'Ответ: 5' },
};
export function offlineSample(lang: L, maxLevel: number): Exercise[] {
  const x = T[lang];
  const list: Exercise[] = [
    { id: 's1', type: 'choice', level: 1, instruction: x.pick, simpleInstruction: x.pickS, question: '3 + 2 = ?', steps: x.s, hints: x.h1, explanation: x.ex5, visualExample: '🍎🍎🍎 + 🍎🍎 = 🍎🍎🍎🍎🍎',
      options: [{ id: 'o0', text: '4' }, { id: 'o1', text: '5' }, { id: 'o2', text: '6' }], answer: 'o1' },
    { id: 's2', type: 'picture', level: 1, instruction: x.apples, simpleInstruction: x.pickS, question: x.apples, steps: x.s, hints: x.h2, explanation: x.ex4, visualExample: '🍎🍎🍎🍎',
      options: [{ id: 'o0', text: '2', emoji: '🍎🍎' }, { id: 'o1', text: '4', emoji: '🍎🍎🍎🍎' }, { id: 'o2', text: '6', emoji: '🍎🍎🍎🍎🍎🍎' }], answer: 'o1' },
    { id: 's3', type: 'match', level: 2, instruction: x.match, simpleInstruction: x.matchS, question: x.match, steps: x.s, hints: x.h3, explanation: x.exm, visualExample: '2 + 2 = 4',
      pairs: [{ l: '2 + 2', r: '4' }, { l: '3 + 3', r: '6' }, { l: '4 + 4', r: '8' }] },
    { id: 's4', type: 'order', level: 2, instruction: x.order, simpleInstruction: x.orderS, question: x.order, steps: x.s, hints: x.h4, explanation: x.exo, visualExample: '3 → +2 → 5', items: [x.take, x.add, x.ans] },
    { id: 's5', type: 'choice', level: 3, instruction: x.pick, simpleInstruction: x.pickS, question: '6 + 7 = ?', steps: x.s, hints: x.h5, explanation: x.ex13, visualExample: '6 + 4 = 10, 10 + 3 = 13',
      options: [{ id: 'o0', text: '12' }, { id: 'o1', text: '13' }, { id: 'o2', text: '14' }], answer: 'o1' },
  ];
  return list.filter(e => e.level <= maxLevel);
}
