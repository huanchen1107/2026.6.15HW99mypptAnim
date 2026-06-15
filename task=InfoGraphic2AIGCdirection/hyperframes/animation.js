const slideRoot = document.getElementById('slide');
const keywordRoot = document.getElementById('keywords');
const caption = document.getElementById('caption');
const playButton = document.getElementById('play');
const subtitleButton = document.getElementById('subtitles');
let subtitlesOn = true;

function keywordsForSlide(slideNum) {
  return {
    1: ['Narrow AI', 'General AI', 'Vibe Coding', 'Workflow Automation'],
    2: ['Single Task', 'Multi-step', 'Tools', 'Quality Control'],
    3: ['Manual Coding', 'Natural Language', 'Execution', 'Director'],
    4: ['Operator', 'Director', 'Design', 'Analysis'],
    5: ['Workflow Automation', 'Input', 'Split Tasks', 'Output'],
    6: ['PDF', 'Storyboard', 'Microphone', 'Subtitle', 'AI Check'],
    7: ['Operator → Director', 'User → Flow Designer'],
    8: ['Vibe Coding', 'Workflow Automation', 'Ultimate AI System'],
    9: ['Blueprint', 'Prototype', 'Test & Iterate', 'Workflow Design'],
    10: ['Prompt Design', 'Task Deconstruction', 'Workflow Design', 'Quality Control'],
  }[slideNum] || [];
}

subtitleButton.addEventListener('click', () => {
  subtitlesOn = !subtitlesOn;
  subtitleButton.textContent = subtitlesOn ? 'Subtitles On' : 'Subtitles Off';
  caption.classList.toggle('on', subtitlesOn);
});

const sleep = ms => new Promise(r => setTimeout(r, ms));
const pad = n => String(n).padStart(2, '0');

async function loadProject() {
  const res = await fetch('project.json');
  return res.json();
}

function showSlide(slide, timing) {
  slideRoot.innerHTML = '';
  keywordRoot.innerHTML = '';
  const base = document.createElement('img');
  base.className = 'bg';
  base.src = `../output/slide_${pad(slide.slide)}/background.png`;
  slideRoot.appendChild(base);
  for (const layer of slide.layers) {
    const img = document.createElement('img');
    img.className = `layer ${layer.animation}`;
    img.src = `../output/slide_${pad(slide.slide)}/${layer.name}`;
    img.style.left = `${layer.x / slide.width * 100}%`;
    img.style.top = `${layer.y / slide.height * 100}%`;
    img.style.width = `${layer.width / slide.width * 100}%`;
    img.style.height = `${layer.height / slide.height * 100}%`;
    img.style.zIndex = layer.z_index;
    img.style.setProperty('--dur', `${layer.duration}s`);
    slideRoot.appendChild(img);
    window.setTimeout(() => img.classList.add('show'), layer.start * 1000);
  }
  const keywords = keywordsForSlide(slide.slide);
  if (keywords.length) {
    keywordRoot.style.display = 'flex';
    const cueStarts = (timing.cues || [])
      .filter(c => c.spoken_content !== 'title')
      .map(c => c.time);
    keywords.forEach((text, idx) => {
      const chip = document.createElement('span');
      chip.className = 'kw';
      chip.textContent = text;
      keywordRoot.appendChild(chip);
      const ms = Math.max(0, ((cueStarts[idx] ?? timing.start) - timing.start) * 1000);
      window.setTimeout(() => chip.classList.add('show'), ms);
    });
  } else {
    keywordRoot.style.display = 'none';
  }
  caption.textContent = timing.script;
  caption.classList.toggle('on', subtitlesOn);
}

async function play() {
  playButton.disabled = true;
  const project = await loadProject();
  for (const slide of project.slides) {
    const timing = project.timing[`slide_${pad(slide.slide)}`];
    showSlide(slide, timing);
    const audio = new Audio(`../audio/slide_${pad(slide.slide)}_voiceover.mp3`);
    try { await audio.play(); } catch (e) {}
    await sleep(slide.duration * 1000 + 500);
  }
  playButton.disabled = false;
}

playButton.addEventListener('click', play);
loadProject().then(p => showSlide(p.slides[0], p.timing[`slide_${pad(p.slides[0].slide)}`]));
