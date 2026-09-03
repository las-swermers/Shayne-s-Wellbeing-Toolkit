/* Add a tool by creating tools/<slug>/index.html and one object below. */
const tools = [
  { id: 'sleep-lab', name: 'Sleep Lab', cat: 'Experiment', blurb: 'How sleep works, a fortnight-long experiment, and what the whole school is finding.', href: 'sleep-lab.html', access: 'open', icon: 'moon' },
  { id: 'first-weeks-away', name: 'First weeks away', cat: 'Settling in', blurb: 'A gentle guide for the first stretch of term.', href: '#', access: 'soon', icon: 'compass' },
  { id: 'exam-nerves', name: 'Exam nerves', cat: 'Study', blurb: 'Practical ways to make room for nerves and keep moving.', href: '#', access: 'soon', icon: 'spark' },
  { id: 'roommate-treaty', name: 'Roommate treaty', cat: 'Living together', blurb: 'A simple conversation starter for shared rooms.', href: '#', access: 'soon', icon: 'home' }
];
const icons = {
  moon: '<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M20.7 15.2A8.7 8.7 0 0 1 8.8 3.3 9 9 0 1 0 20.7 15.2Z"/></svg>',
  compass: '<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="m14.8 9.2-2.1 3.5-3.5 2.1 2.1-3.5 3.5-2.1ZM12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18Zm0 16.4a7.4 7.4 0 1 1 0-14.8 7.4 7.4 0 0 1 0 14.8Z"/></svg>',
  spark: '<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M12 2l1.8 7.2L21 12l-7.2 1.8L12 21l-1.8-7.2L3 12l7.2-2.8L12 2Z"/></svg>',
  home: '<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M12 3 2.5 11h2.7v9h5.2v-5.3h3.2V20h5.2v-9h2.7L12 3Z"/></svg>'
};
const shelf = document.querySelector('#tools');
shelf.innerHTML = tools.map(tool => {
  const soon = tool.access === 'soon';
  const content = `<span class="tool-icon">${icons[tool.icon]}</span><span><h3>${tool.name}</h3><p>${tool.blurb}</p>${soon ? '<span class="tag">Coming soon</span>' : ''}</span><span class="arrow" aria-hidden="true">${soon ? '·' : '→'}</span>`;
  return soon ? `<div class="tool soon" aria-label="${tool.name}, coming soon">${content}</div>` : `<a class="tool" href="${tool.href}">${content}</a>`;
}).join('');
