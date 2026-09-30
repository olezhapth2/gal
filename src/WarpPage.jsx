import { useEffect, useMemo, useRef, useState } from 'react';
import { Boxes, Sparkles, CheckCheck, Bot } from 'lucide-react';
import WarpText from './WarpText.jsx';
import MagneticDock from './components/MagneticDock.jsx';
import {
  GlassRows,
  SWITCH_IN_MS,
  SWITCH_OUT_MS,
} from './components/gallery/glass-rows.jsx';
import { CLIPS } from './data/clips.js';

const BASE_WIDTH = 400;
const FONT_RATIO = 0.16;

const SERVICES = [
  {
    id: 'fidelity',
    title: 'UX also',
    desc: 'типографика, иерархия, плотность, адаптивы и доступность по WCAG. Тут глубина: JAVHD и Corgday, где каждый экран меряется конверсией или временем обработки.',
    icon: <span>UX</span>,
  },
  {
    id: 'systems',
    title: 'System',
    desc: 'Токены, компоненты в Figma, документация состояний и говернанс, чтобы системой пользовались, а не хранили в доке. 1 кодовая база, 20+ скинов, −60% времени на передачу макетов.',
    icon: <Boxes />,
  },
  {
    id: 'motion',
    title: 'Motion',
    desc: 'Интерактивные прототипы для проверки до вёрстки, микровзаимодействия и Smart Animate. Готовлю их, чтобы идею показали, а не описали: 300+ туров на геймификации.',
    icon: <Sparkles />,
  },
  {
    id: 'qa',
    title: 'Metrics',
    desc: 'Спеки готовые к разработке, парная с фронтом и ревью стейджинга попиксельно. Плюс вёрстка сам: связка Figma → Cursor/Claude Code → GitHub Pages.',
    icon: <CheckCheck />,
  },
  {
    id: 'ai',
    title: 'Ai Flow',
    desc: 'Генеративные воркфлоу в ежедневной работе и дизайн AI-взаимодействий: чаты, адаптивные паттерны, human-in-the-loop. 3 года ежедневно, конвейер на n8n и 10 000+ креативов с ревью.',
    icon: <Bot />,
  },
];

const DOCK_ITEMS = SERVICES.map((service) => ({
  id: service.id,
  label: service.title,
  icon: service.icon,
}));

const GALLERIES = [
  ...SERVICES.map((service) => ({
    id: service.id,
    label: service.title,
    cards: CLIPS[service.id],
  })),
  { id: 'ui', label: 'UI', cards: CLIPS.ui },
];

/* Плашка профиля по клику на заголовок: имя, почта и две кнопки */
function ProfilePanel() {
  const btn =
    'rounded-[10px] px-3 py-1.5 text-[12.5px] font-bold transition-transform duration-150 ease-[cubic-bezier(0.2,0,0,1)] hover:scale-[1.04] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--motiq-accent,#f5f5f5)]';
  return (
    <div>
      <p className="text-[14px] font-bold leading-snug text-white">
        Девятов Олег Анатольевич
      </p>
      <p className="mt-1 text-[12.5px] font-bold leading-snug text-zinc-300">
        thaiolezha@gmail.com
      </p>
      <div className="mt-2.5 flex items-center gap-2">
        <a
          href="/cv.html"
          download="Oleg-Devyatov-CV.html"
          className={`${btn} bg-[#f5f5f5] text-[#080c14]`}
        >
          Скачать CV
        </a>
        <a
          href="mailto:thaiolezha@gmail.com"
          className={`${btn} border border-white/25 text-white hover:bg-white/10`}
        >
          Написать
        </a>
      </div>
    </div>
  );
}

/* Карточка DOM-fallback (без WebGL): та же геометрия, что и в канвасе */
function GlowCard({ card }) {
  const h = 240;
  const isImg = /\.(png|jpe?g|webp|gif)(\?|#|$)/i.test(card.src);
  return (
    <div
      className="shrink-0 overflow-hidden rounded-2xl border border-white/15"
      style={{
        height: h,
        width: Math.round((h * card.iw) / card.ih),
        background: '#120f17',
      }}
    >
      {isImg ? (
        <img
          src={card.src}
          alt=""
          className="h-full w-full object-cover"
        />
      ) : (
        <video
          src={card.src}
          muted
          loop
          autoPlay
          playsInline
          className="h-full w-full object-cover"
        />
      )}
    </div>
  );
}

/* Дрейфующий ряд: трек из двух одинаковых половин, едет слева направо */
function DriftRow({ cards, duration }) {
  const half = [...cards, ...cards];
  return (
    <div className="marquee-mask overflow-hidden py-3">
      <div
        className="marquee-track flex w-max gap-6 pr-6"
        style={{ animationDuration: duration }}
      >
        {[0, 1].map((copy) => (
          <div key={copy} className="flex gap-6" aria-hidden={copy === 1}>
            {half.map((card, i) => (
              <GlowCard key={`${copy}-${i}-${card.h}`} card={card} />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

export default function WarpPage() {
  const frameRef = useRef(null);
  const [width, setWidth] = useState(BASE_WIDTH);
  const [panelState, setPanelState] = useState(null);
  const [bgOn, setBgOn] = useState(true);
  const [activeId, setActiveId] = useState(GALLERIES[0].id);
  const [transition, setTransition] = useState('out');
  const [switchSignal, setSwitchSignal] = useState(0);
  const [dip, setDip] = useState(false);
  const busyRef = useRef(false);

  useEffect(() => {
    const t = window.setTimeout(
      () => setTransition('idle'),
      SWITCH_OUT_MS + 80
    );
    return () => window.clearTimeout(t);
  }, []);

  useEffect(() => {
    const el = frameRef.current;
    if (!el) return undefined;
    const observer = new ResizeObserver(([entry]) => {
      const next = Math.round(entry.contentRect.width);
      if (next > 0) setWidth((prev) => (prev === next ? prev : next));
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const handleSelect = (id) => {
    const closing = panelState?.id === id && panelState.open;
    setPanelState({ id, open: !closing });
    if (closing || busyRef.current || !bgOn) return;
    const target = GALLERIES.find((g) => g.id === id);
    if (!target || target.id === activeId) return;
    busyRef.current = true;
    setDip(true);
    setTransition('in');
    setSwitchSignal((s) => s + 1);
    window.setTimeout(() => {
      setActiveId(target.id);
      setTransition('out');
      window.setTimeout(() => setDip(false), 140);
      window.setTimeout(() => {
        setTransition('idle');
        busyRef.current = false;
      }, SWITCH_OUT_MS + 80);
    }, SWITCH_IN_MS + 30);
  };

  const profileOpen = Boolean(panelState?.open) && panelState?.id === 'ui';
  const shownService =
    panelState?.open && !profileOpen
      ? SERVICES.find((service) => service.id === panelState.id) ?? null
      : null;

  const active = GALLERIES.find((g) => g.id === activeId) ?? GALLERIES[0];
  const reversed = useMemo(() => [...active.cards].reverse(), [active]);
  const rotated = useMemo(
    () => [...active.cards.slice(2), ...active.cards.slice(0, 2)],
    [active]
  );
  const rows = useMemo(
    () => [
      { cards: active.cards, duration: 75 },
      { cards: reversed, duration: 105 },
      { cards: rotated, duration: 90 },
    ],
    [active, reversed, rotated]
  );

  const fontSize = Math.round(width * FONT_RATIO);

  return (
    <main className="relative flex min-h-screen w-full flex-col items-center justify-between overflow-x-clip bg-[#06030f] px-4 pb-4 pt-3 md:justify-center md:gap-5 md:pb-0 md:pt-0">
      {bgOn && (
        <div className="fixed inset-0 z-0 flex items-center justify-center overflow-hidden">
          <div className="w-screen">
            <GlassRows
              rows={rows}
              className="relative w-full"
              switchSignal={switchSignal}
              transition={transition}
              fallback={
                <div className="space-y-5">
                  <DriftRow cards={active.cards} duration="75s" />
                  <DriftRow cards={reversed} duration="105s" />
                  <DriftRow cards={rotated} duration="90s" />
                </div>
              }
            />
          </div>
        </div>
      )}
      {/* мобильный: края экрана затемнены — в центре остаётся
          яркая строка скролла; заголовок сверху, док снизу */}
      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 z-[60] md:hidden"
        style={{
          background:
            'linear-gradient(to bottom, #06030f 0%, rgba(6,3,15,0.92) 22%, rgba(6,3,15,0) 40%, rgba(6,3,15,0) 60%, rgba(6,3,15,0.92) 78%, #06030f 100%), linear-gradient(to right, rgba(6,3,15,0.88) 0%, rgba(6,3,15,0) 20%, rgba(6,3,15,0) 80%, rgba(6,3,15,0.88) 100%)',
        }}
      />
      {/* dip свапа: ниже контента (80) — заголовок и док остаются яркими */}
      {bgOn && (
        <div
          aria-hidden="true"
          className="pointer-events-none fixed inset-0 z-[70] bg-black"
          style={{
            opacity: dip ? 0.55 : 0,
            transition: `opacity ${dip ? 160 : 260}ms ${
              dip ? 'ease-out' : 'ease-in-out'
            }`,
          }}
        />
      )}
      <div
        ref={frameRef}
        className="relative z-[80] flex w-full max-w-[400px] flex-col gap-5"
      >
        <button
          type="button"
          onClick={() => handleSelect('ui')}
          className="block w-full cursor-pointer border-0 bg-transparent p-0 text-left [font:inherit]"
        >
          <WarpText
            text="UI DESIGNER"
            color="#f8f5ff"
            warpStrength={0.35}
            warpScale={1.7}
            speed={1.15}
            pointerInfluence={0.6}
            pointerStrength={0.25}
            refraction={0.04}
            ripple
            fontSize={fontSize}
            fontWeight={800}
            lineHeight={0.87}
            style={{ height: fontSize, minHeight: 0 }}
          />
        </button>
        <button
          type="button"
          onClick={() => setBgOn((v) => !v)}
          aria-pressed={bgOn}
          className="relative z-[90] mt-3 flex items-center gap-2 self-end rounded-full border border-white/15 bg-black/40 px-4 py-2 text-[11px] font-bold uppercase tracking-[0.14em] text-white/80 backdrop-blur-md transition-colors duration-150 hover:border-white/30 hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white/70 md:fixed md:right-6 md:top-6 md:mt-0"
        >
          <span
            className={`h-2 w-2 rounded-full ${
              bgOn ? 'bg-emerald-400' : 'bg-white/30'
            }`}
          />
          bg {bgOn ? 'on' : 'off'}
        </button>
      </div>
      <div className="relative z-[80] flex w-full max-w-[400px] flex-col">
        <MagneticDock
          items={DOCK_ITEMS}
          onSelect={handleSelect}
          panelOpen={Boolean(panelState?.open)}
          panel={
            profileOpen ? (
              <ProfilePanel />
            ) : shownService ? (
              <div>
                <p className="text-[14px] font-bold leading-snug text-white">
                  {shownService.title}
                </p>
                <p className="mt-1 text-[12.5px] font-bold leading-snug text-zinc-300">
                  {shownService.desc}
                </p>
              </div>
            ) : null
          }
        />
      </div>
    </main>
  );
}
