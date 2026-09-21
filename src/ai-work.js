// Each diagram plays once when visible. All content is readable without JavaScript.
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
document.querySelectorAll('[data-walkthrough]').forEach((diagram) => {
  const controls = diagram.querySelector('.ai-walk-controls');
  const buttons = [...diagram.querySelectorAll('[data-go]')];
  const play = diagram.querySelector('.ai-play');
  const name = diagram.closest('section').querySelector('h2').textContent.replace(/\.$/, '');
  let step = 0;
  let timer;
  let started = false;
  let visible = false;
  let playing = false;

  function render() {
    diagram.dataset.step = String(step);
    buttons.forEach((button, index) => button.setAttribute('aria-pressed', String(step === index)));
    diagram.classList.toggle('is-playing', playing);
    play.textContent = playing ? 'Pause' : step === buttons.length - 1 ? 'Replay' : 'Play';
    play.setAttribute('aria-label', `${play.textContent} ${name} animation`);
  }
  function stop() {
    clearTimeout(timer);
    playing = false;
    render();
  }
  function tick() {
    timer = setTimeout(() => {
      if (step >= buttons.length - 1) return stop();
      step += 1;
      render();
      tick();
    }, 3800);
  }
  function start() {
    clearTimeout(timer);
    started = true;
    playing = true;
    if (step === buttons.length - 1) step = 0;
    render();
    tick();
  }
  buttons.forEach((button, index) => button.addEventListener('click', () => {
    started = true;
    step = index;
    stop();
  }));
  play.addEventListener('click', () => playing ? stop() : start());
  document.addEventListener('visibilitychange', () => { if (document.hidden) stop(); });
  reducedMotion.addEventListener('change', () => { if (reducedMotion.matches) stop(); });
  new IntersectionObserver(([entry]) => {
    visible = entry.isIntersecting;
    if (!visible) stop();
    else if (!started && !reducedMotion.matches && !document.hidden) start();
  }, {threshold: 0.45}).observe(diagram);
  diagram.classList.add('is-enhanced');
  controls.hidden = false;
  render();
});
