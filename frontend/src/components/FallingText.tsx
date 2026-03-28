import { useRef, useState, useEffect } from 'react';
import Matter from 'matter-js';

interface FallingTextProps {
  text: string;
  highlightWords?: string[];
  highlightClass?: string;
  trigger?: 'auto' | 'scroll' | 'click' | 'hover';
  backgroundColor?: string;
  wireframes?: boolean;
  gravity?: number;
  mouseConstraintStiffness?: number;
  fontSize?: string;
}

const FallingText = ({
  text = '',
  highlightWords = [],
  highlightClass = 'text-violet-400 font-bold',
  trigger = 'auto',
  backgroundColor = 'transparent',
  wireframes = false,
  gravity = 1,
  mouseConstraintStiffness = 0.2,
  fontSize = '1rem',
}: FallingTextProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLDivElement>(null);
  const canvasContainerRef = useRef<HTMLDivElement>(null);

  const [effectStarted, setEffectStarted] = useState(false);

  useEffect(() => {
    if (!textRef.current) return;
    const words = text.split(' ');

    const newHTML = words
      .map((word) => {
        const cleanWord = word.replace(/[^a-z0-9]/gi, '').toLowerCase();
        const isHighlighted = highlightWords.some((hw) => cleanWord === hw.toLowerCase());
        return `<span class="inline-block mx-[2px] select-none ${isHighlighted ? highlightClass : ''}" data-highlight="${isHighlighted}">${word}</span>`;
      })
      .join(' ');

    textRef.current.innerHTML = newHTML;
  }, [text, highlightWords, highlightClass]);

  useEffect(() => {
    if (trigger === 'auto') {
      setEffectStarted(true);
      return;
    }
    if (trigger === 'scroll' && containerRef.current) {
      const observer = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) {
            setEffectStarted(true);
            observer.disconnect();
          }
        },
        { threshold: 0.1 },
      );
      observer.observe(containerRef.current);
      return () => observer.disconnect();
    }
  }, [trigger]);

  useEffect(() => {
    if (!effectStarted || !containerRef.current || !canvasContainerRef.current || !textRef.current) return;

    const { Engine, Render, World, Bodies, Runner, Mouse, MouseConstraint, Body: MatterBody } = Matter;
    let cancelInit = false;
    let canvasRender: Matter.Render | null = null;
    let runner: Matter.Runner | null = null;
    let animFrame: number | null = null;
    let resizeFrame: number | null = null;

    const initPhysics = () => {
      if (cancelInit || !containerRef.current || !canvasContainerRef.current || !textRef.current) return;

      const containerRect = containerRef.current.getBoundingClientRect();
      const width = containerRect.width;
      const height = containerRect.height;

      if (width <= 0 || height <= 0) {
        resizeFrame = requestAnimationFrame(initPhysics);
        return;
      }

      const engine = Engine.create();
      engine.world.gravity.y = gravity;

      canvasRender = Render.create({
        element: canvasContainerRef.current,
        engine,
        options: {
          width,
          height,
          background: backgroundColor,
          wireframes,
        },
      });

      const boundaryOptions = {
        isStatic: true,
        render: { fillStyle: 'transparent' },
      };
      const floor = Bodies.rectangle(width / 2, height + 25, width, 50, boundaryOptions);
      const leftWall = Bodies.rectangle(-25, height / 2, 50, height, boundaryOptions);
      const rightWall = Bodies.rectangle(width + 25, height / 2, 50, height, boundaryOptions);
      const ceiling = Bodies.rectangle(width / 2, -25, width, 50, boundaryOptions);

      const wordSpans = textRef.current.querySelectorAll('span');
      const wordBodies = [...wordSpans].map((elem) => {
        const isHighlighted = elem.dataset.highlight === 'true';
        const rect = elem.getBoundingClientRect();
        const x = rect.left - containerRect.left + rect.width / 2;
        const y = rect.top - containerRect.top + rect.height / 2;

        const body = Bodies.rectangle(x, y, rect.width, rect.height, {
          isStatic: isHighlighted,
          render: { fillStyle: 'transparent' },
          restitution: isHighlighted ? 0.2 : 0.8,
          frictionAir: isHighlighted ? 0.02 : 0.01,
          friction: isHighlighted ? 0.1 : 0.2,
        });

        if (!isHighlighted) {
          MatterBody.setVelocity(body, {
            x: (Math.random() - 0.5) * 5,
            y: 0,
          });
          MatterBody.setAngularVelocity(body, (Math.random() - 0.5) * 0.05);
        }

        return { elem: elem as HTMLElement, body };
      });

      wordBodies.forEach(({ elem, body }) => {
        elem.style.position = 'absolute';
        elem.style.left = `${body.position.x}px`;
        elem.style.top = `${body.position.y}px`;
        elem.style.transform = 'translate(-50%, -50%)';
      });

      const mouse = Mouse.create(containerRef.current);
      const mouseConstraint = MouseConstraint.create(engine, {
        mouse,
        constraint: {
          stiffness: mouseConstraintStiffness,
          render: { visible: false },
        },
      });
      if (canvasRender) {
        canvasRender.mouse = mouse;
      }

      World.add(engine.world, [
        floor,
        leftWall,
        rightWall,
        ceiling,
        mouseConstraint,
        ...wordBodies.map((wb) => wb.body),
      ]);

      runner = Runner.create();
      Runner.run(runner, engine);
      if (canvasRender) {
        Render.run(canvasRender);
      }

      const updateLoop = () => {
        wordBodies.forEach(({ body, elem }) => {
          const { x, y } = body.position;
          elem.style.left = `${x}px`;
          elem.style.top = `${y}px`;
          elem.style.transform = `translate(-50%, -50%) rotate(${body.angle}rad)`;
        });
        animFrame = requestAnimationFrame(updateLoop);
      };
      updateLoop();
    };

    initPhysics();

    return () => {
      cancelInit = true;
      if (resizeFrame) cancelAnimationFrame(resizeFrame);
      if (animFrame) cancelAnimationFrame(animFrame);
      if (canvasRender) {
        Render.stop(canvasRender);
        if (canvasRender.canvas && canvasContainerRef.current) {
          canvasContainerRef.current.removeChild(canvasRender.canvas);
        }
      }
      if (runner) {
        Runner.stop(runner);
      }
    };
  }, [effectStarted, gravity, wireframes, backgroundColor, mouseConstraintStiffness]);

  const handleTrigger = () => {
    if (!effectStarted && (trigger === 'click' || trigger === 'hover')) {
      setEffectStarted(true);
    }
  };

  return (
    <div
      ref={containerRef}
      className="relative z-[1] w-full h-full cursor-pointer text-center pt-8 overflow-hidden"
      onClick={trigger === 'click' ? handleTrigger : undefined}
      onMouseEnter={trigger === 'hover' ? handleTrigger : undefined}
    >
      <div
        ref={textRef}
        className="inline-block relative z-10"
        style={{ fontSize, lineHeight: 1.4 }}
      />
      <div className="absolute inset-0 z-0" ref={canvasContainerRef} />
    </div>
  );
};

export default FallingText;
