import { useRef, useEffect, useCallback, useState } from 'react'
import { gsap } from 'gsap'
import StackIcon from './StackIcon'
import './MagicBento.css'

const DEFAULT_PARTICLE_COUNT = 12
const DEFAULT_SPOTLIGHT_RADIUS = 300
const DEFAULT_GLOW_COLOR = '148, 163, 184'
const MOBILE_BREAKPOINT = 768

const cardData = [
  {
    color: '#101317',
    title: '',
    description: '',
    label: '',
    liquid: true,
    layout: 'music',
    terminalDemo: {
      title: 'bootstrap5-dev',
      cwd: '~/Bootstrap5/react-app',
      script: [
        'npm run dev',
        'vite v5.4.0 ready in 422 ms',
        'Local: http://localhost:5173/',
        'plugin: alert, dropdown, modal initialized',
        'theme: dark (default) | light (toggle ready)',
        'status: build healthy',
      ],
    },
  },
  {
    color: '#101317',
    title: 'Built with',
    description: '',
    label: '',
    layout: 'mini',
    loopTech: [
      'reactquery',
      'vitejs',
      'bootstrap5',
      'threejs',
      'reactrouter',
      'react',
      'openai',
      'netlify',
      'git',
      'arc',
    ],
  },
  {
    color: '#101317',
    title: 'Interactive Demos',
    description: 'Each plugin section includes functional usage and UI behavior.',
    label: 'Practice',
    layout: 'practice',
    details: [
      { icon: 'bi-cursor', text: 'Real click/hover triggers' },
      { icon: 'bi-play-circle', text: 'Live component preview' },
      { icon: 'bi-sliders', text: 'Behavior-focused examples' },
    ],
  },
  {
    color: '#101317',
    title: 'Required Plugins',
    description: 'Alert to Pre-loader set completed.',
    label: 'Coverage',
    layout: 'chip1',
  },
  {
    color: '#101317',
    title: 'Docs Style',
    description: 'Tree nav, usage blocks, and live demos.',
    label: 'Structure',
    layout: 'chip2',
  },
  {
    color: '#101317',
    title: 'Interactive',
    description: 'State-driven components and demos.',
    label: 'UX',
    layout: 'chip3',
    ghost: true,
  },
  {
    color: '#101317',
    title: 'Project Scope',
    description: 'Complete Bootstrap 5 plugin showcase aligned with course requirements.',
    label: '',
    layout: 'stack',
    details: [
      { icon: 'bi-check-circle', text: '13 required plugins implemented' },
      { icon: 'bi-phone', text: 'Responsive desktop and mobile layout' },
      { icon: 'bi-cursor', text: 'Interactive trigger-based demos' },
      { icon: 'bi-image', text: 'Modal image preview for local assets' },
      { icon: 'bi-moon-stars', text: 'Dark/light theme toggle support' },
      { icon: 'bi-cloud-arrow-up', text: 'Deployment-ready frontend structure' },
    ],
  },
  {
    color: '#101317',
    title: '',
    description: '',
    label: '',
    layout: 'delivery',
    pixelDemo: true,
  },
  {
    color: '#101317',
    title: 'Demo Flow',
    description: 'Each section transitions clearly from trigger to visible result for smoother presentation.',
    label: 'Walkthrough',
    layout: 'spotlight',
  },
  {
    color: '#101317',
    title: 'Final Output',
    description: 'A complete Bootstrap 5 project with polished layout, interactions, and clean code structure.',
    label: 'Academic',
    layout: 'academic',
  },
]

const createParticleElement = (x, y, color = DEFAULT_GLOW_COLOR) => {
  const el = document.createElement('div')
  el.className = 'particle'
  el.style.cssText = `
    position: absolute;
    width: 4px;
    height: 4px;
    border-radius: 50%;
    background: rgba(${color}, 1);
    box-shadow: 0 0 6px rgba(${color}, 0.6);
    pointer-events: none;
    z-index: 100;
    left: ${x}px;
    top: ${y}px;
  `
  return el
}

const calculateSpotlightValues = (radius) => ({
  proximity: radius * 0.5,
  fadeDistance: radius * 0.75,
})

const updateCardGlowProperties = (card, mouseX, mouseY, glow, radius) => {
  const rect = card.getBoundingClientRect()
  const relativeX = ((mouseX - rect.left) / rect.width) * 100
  const relativeY = ((mouseY - rect.top) / rect.height) * 100

  card.style.setProperty('--glow-x', `${relativeX}%`)
  card.style.setProperty('--glow-y', `${relativeY}%`)
  card.style.setProperty('--glow-intensity', glow.toString())
  card.style.setProperty('--glow-radius', `${radius}px`)
}

const CommandConsoleMini = ({ title, cwd, script = [] }) => {
  const [history, setHistory] = useState([])
  const [activeLine, setActiveLine] = useState('')

  useEffect(() => {
    if (!script.length) return
    let cancelled = false
    let lineIndex = 0
    let charIndex = 0

    const typeNext = () => {
      if (cancelled) return
      const line = script[lineIndex]
      if (charIndex < line.length) {
        charIndex += 1
        setActiveLine(line.slice(0, charIndex))
        setTimeout(typeNext, 28)
        return
      }

      setHistory((prev) => [...prev, line].slice(-4))
      setActiveLine('')
      lineIndex = (lineIndex + 1) % script.length
      charIndex = 0
      setTimeout(typeNext, lineIndex === 0 ? 900 : 460)
    }

    typeNext()
    return () => {
      cancelled = true
    }
  }, [script])

  return (
    <div className="command-mini">
      <div className="command-mini__head">
        <div className="command-mini__meta">
          <h4>{title}</h4>
          <p>{cwd}</p>
        </div>
        <div className="command-mini__status" aria-hidden="true">
          <span />
          <span />
          <span />
        </div>
      </div>

      <div className="command-mini__surface" role="img" aria-label="Animated command line preview">
        <div className="command-mini__scanline" />
        {history.map((line, idx) => (
          <p className="command-mini__line" key={`${line}-${idx}`}>
            <span className="prompt">$</span> {line}
          </p>
        ))}
        <p className="command-mini__line command-mini__line--active">
          <span className="prompt">$</span> {activeLine}
          <span className="command-mini__cursor" />
        </p>
      </div>
    </div>
  )
}

const DeliveryInteractive = () => {
  return (
    <div className="delivery-interactive" aria-label="Interactive deployment controls">
      <div className="delivery-head">
        <span>Quick Context</span>
      </div>
      <p className="delivery-simple-copy">
        This section highlights the project goal, structure, and core interaction behavior in one compact view.
      </p>
    </div>
  )
}

const ParticleCard = ({
  children,
  className = '',
  disableAnimations = false,
  style,
  particleCount = DEFAULT_PARTICLE_COUNT,
  glowColor = DEFAULT_GLOW_COLOR,
  enableTilt = true,
  clickEffect = false,
  enableMagnetism = false,
}) => {
  const cardRef = useRef(null)
  const particlesRef = useRef([])
  const timeoutsRef = useRef([])
  const isHoveredRef = useRef(false)
  const memoizedParticles = useRef([])
  const particlesInitialized = useRef(false)
  const magnetismAnimationRef = useRef(null)

  const initializeParticles = useCallback(() => {
    if (particlesInitialized.current || !cardRef.current) return

    const { width, height } = cardRef.current.getBoundingClientRect()
    memoizedParticles.current = Array.from({ length: particleCount }, () =>
      createParticleElement(Math.random() * width, Math.random() * height, glowColor)
    )
    particlesInitialized.current = true
  }, [particleCount, glowColor])

  const clearAllParticles = useCallback(() => {
    timeoutsRef.current.forEach(clearTimeout)
    timeoutsRef.current = []
    magnetismAnimationRef.current?.kill()

    particlesRef.current.forEach((particle) => {
      gsap.to(particle, {
        scale: 0,
        opacity: 0,
        duration: 0.3,
        ease: 'back.in(1.7)',
        onComplete: () => {
          particle.parentNode?.removeChild(particle)
        },
      })
    })
    particlesRef.current = []
  }, [])

  const animateParticles = useCallback(() => {
    if (!cardRef.current || !isHoveredRef.current) return

    if (!particlesInitialized.current) {
      initializeParticles()
    }

    memoizedParticles.current.forEach((particle, index) => {
      const timeoutId = setTimeout(() => {
        if (!isHoveredRef.current || !cardRef.current) return

        const clone = particle.cloneNode(true)
        cardRef.current.appendChild(clone)
        particlesRef.current.push(clone)

        gsap.fromTo(clone, { scale: 0, opacity: 0 }, { scale: 1, opacity: 1, duration: 0.3, ease: 'back.out(1.7)' })

        gsap.to(clone, {
          x: (Math.random() - 0.5) * 100,
          y: (Math.random() - 0.5) * 100,
          rotation: Math.random() * 360,
          duration: 2 + Math.random() * 2,
          ease: 'none',
          repeat: -1,
          yoyo: true,
        })

        gsap.to(clone, {
          opacity: 0.3,
          duration: 1.5,
          ease: 'power2.inOut',
          repeat: -1,
          yoyo: true,
        })
      }, index * 100)

      timeoutsRef.current.push(timeoutId)
    })
  }, [initializeParticles])

  useEffect(() => {
    if (disableAnimations || !cardRef.current) return

    const element = cardRef.current

    const handleMouseEnter = () => {
      isHoveredRef.current = true
      animateParticles()

      if (enableTilt) {
        gsap.to(element, {
          rotateX: 5,
          rotateY: 5,
          duration: 0.3,
          ease: 'power2.out',
          transformPerspective: 1000,
        })
      }
    }

    const handleMouseLeave = () => {
      isHoveredRef.current = false
      clearAllParticles()

      if (enableTilt) {
        gsap.to(element, {
          rotateX: 0,
          rotateY: 0,
          duration: 0.3,
          ease: 'power2.out',
        })
      }

      if (enableMagnetism) {
        gsap.to(element, {
          x: 0,
          y: 0,
          duration: 0.3,
          ease: 'power2.out',
        })
      }
    }

    const handleMouseMove = (e) => {
      if (!enableTilt && !enableMagnetism) return

      const rect = element.getBoundingClientRect()
      const x = e.clientX - rect.left
      const y = e.clientY - rect.top
      const centerX = rect.width / 2
      const centerY = rect.height / 2

      if (enableTilt) {
        const rotateX = ((y - centerY) / centerY) * -10
        const rotateY = ((x - centerX) / centerX) * 10

        gsap.to(element, {
          rotateX,
          rotateY,
          duration: 0.1,
          ease: 'power2.out',
          transformPerspective: 1000,
        })
      }

      if (enableMagnetism) {
        const magnetX = (x - centerX) * 0.05
        const magnetY = (y - centerY) * 0.05

        magnetismAnimationRef.current = gsap.to(element, {
          x: magnetX,
          y: magnetY,
          duration: 0.3,
          ease: 'power2.out',
        })
      }
    }

    const handleClick = (e) => {
      if (!clickEffect) return

      const rect = element.getBoundingClientRect()
      const x = e.clientX - rect.left
      const y = e.clientY - rect.top

      const maxDistance = Math.max(Math.hypot(x, y), Math.hypot(x - rect.width, y), Math.hypot(x, y - rect.height), Math.hypot(x - rect.width, y - rect.height))

      const ripple = document.createElement('div')
      ripple.style.cssText = `
        position: absolute;
        width: ${maxDistance * 2}px;
        height: ${maxDistance * 2}px;
        border-radius: 50%;
        background: radial-gradient(circle, rgba(${glowColor}, 0.4) 0%, rgba(${glowColor}, 0.2) 30%, transparent 70%);
        left: ${x - maxDistance}px;
        top: ${y - maxDistance}px;
        pointer-events: none;
        z-index: 1000;
      `

      element.appendChild(ripple)

      gsap.fromTo(
        ripple,
        {
          scale: 0,
          opacity: 1,
        },
        {
          scale: 1,
          opacity: 0,
          duration: 0.8,
          ease: 'power2.out',
          onComplete: () => ripple.remove(),
        }
      )
    }

    element.addEventListener('mouseenter', handleMouseEnter)
    element.addEventListener('mouseleave', handleMouseLeave)
    element.addEventListener('mousemove', handleMouseMove)
    element.addEventListener('click', handleClick)

    return () => {
      isHoveredRef.current = false
      element.removeEventListener('mouseenter', handleMouseEnter)
      element.removeEventListener('mouseleave', handleMouseLeave)
      element.removeEventListener('mousemove', handleMouseMove)
      element.removeEventListener('click', handleClick)
      clearAllParticles()
    }
  }, [animateParticles, clearAllParticles, disableAnimations, enableTilt, enableMagnetism, clickEffect, glowColor])

  return (
    <div ref={cardRef} className={`${className} particle-container`} style={{ ...style, position: 'relative', overflow: 'hidden' }}>
      {children}
    </div>
  )
}

const GlobalSpotlight = ({ gridRef, disableAnimations = false, enabled = true, spotlightRadius = DEFAULT_SPOTLIGHT_RADIUS, glowColor = DEFAULT_GLOW_COLOR }) => {
  const spotlightRef = useRef(null)

  useEffect(() => {
    if (disableAnimations || !gridRef?.current || !enabled) return

    const spotlight = document.createElement('div')
    spotlight.className = 'global-spotlight'
    spotlight.style.cssText = `
      position: fixed;
      width: 800px;
      height: 800px;
      border-radius: 50%;
      pointer-events: none;
      background: radial-gradient(circle,
        rgba(${glowColor}, 0.15) 0%,
        rgba(${glowColor}, 0.08) 15%,
        rgba(${glowColor}, 0.04) 25%,
        rgba(${glowColor}, 0.02) 40%,
        rgba(${glowColor}, 0.01) 65%,
        transparent 70%
      );
      z-index: 200;
      opacity: 0;
      transform: translate(-50%, -50%);
      mix-blend-mode: screen;
    `
    document.body.appendChild(spotlight)
    spotlightRef.current = spotlight

    const handleMouseMove = (e) => {
      if (!spotlightRef.current || !gridRef.current) return

      const section = gridRef.current.closest('.bento-section')
      const rect = section?.getBoundingClientRect()
      const mouseInside = rect && e.clientX >= rect.left && e.clientX <= rect.right && e.clientY >= rect.top && e.clientY <= rect.bottom
      const cards = gridRef.current.querySelectorAll('.magic-bento-card')

      if (!mouseInside) {
        gsap.to(spotlightRef.current, { opacity: 0, duration: 0.3, ease: 'power2.out' })
        cards.forEach((card) => card.style.setProperty('--glow-intensity', '0'))
        return
      }

      const { proximity, fadeDistance } = calculateSpotlightValues(spotlightRadius)
      let minDistance = Infinity

      cards.forEach((card) => {
        const cardRect = card.getBoundingClientRect()
        const centerX = cardRect.left + cardRect.width / 2
        const centerY = cardRect.top + cardRect.height / 2
        const distance = Math.hypot(e.clientX - centerX, e.clientY - centerY) - Math.max(cardRect.width, cardRect.height) / 2
        const effectiveDistance = Math.max(0, distance)
        minDistance = Math.min(minDistance, effectiveDistance)

        let glowIntensity = 0
        if (effectiveDistance <= proximity) glowIntensity = 1
        else if (effectiveDistance <= fadeDistance) glowIntensity = (fadeDistance - effectiveDistance) / (fadeDistance - proximity)

        updateCardGlowProperties(card, e.clientX, e.clientY, glowIntensity, spotlightRadius)
      })

      gsap.to(spotlightRef.current, { left: e.clientX, top: e.clientY, duration: 0.1, ease: 'power2.out' })

      const targetOpacity = minDistance <= proximity ? 0.8 : minDistance <= fadeDistance ? ((fadeDistance - minDistance) / (fadeDistance - proximity)) * 0.8 : 0
      gsap.to(spotlightRef.current, { opacity: targetOpacity, duration: targetOpacity > 0 ? 0.2 : 0.5, ease: 'power2.out' })
    }

    const handleMouseLeave = () => {
      gridRef.current?.querySelectorAll('.magic-bento-card').forEach((card) => card.style.setProperty('--glow-intensity', '0'))
      if (spotlightRef.current) gsap.to(spotlightRef.current, { opacity: 0, duration: 0.3, ease: 'power2.out' })
    }

    document.addEventListener('mousemove', handleMouseMove)
    document.addEventListener('mouseleave', handleMouseLeave)

    return () => {
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseleave', handleMouseLeave)
      spotlightRef.current?.parentNode?.removeChild(spotlightRef.current)
    }
  }, [gridRef, disableAnimations, enabled, spotlightRadius, glowColor])

  return null
}

const BentoCardGrid = ({ children, gridRef }) => (
  <div className="card-grid bento-section" ref={gridRef}>
    {children}
  </div>
)

const useMobileDetection = () => {
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth <= MOBILE_BREAKPOINT)
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  return isMobile
}

const MagicBento = ({
  textAutoHide = true,
  enableStars = true,
  enableSpotlight = true,
  enableBorderGlow = true,
  disableAnimations = false,
  spotlightRadius = DEFAULT_SPOTLIGHT_RADIUS,
  particleCount = DEFAULT_PARTICLE_COUNT,
  enableTilt = false,
  glowColor = DEFAULT_GLOW_COLOR,
  clickEffect = true,
  enableMagnetism = true,
}) => {
  const gridRef = useRef(null)
  const isMobile = useMobileDetection()
  const shouldDisableAnimations = disableAnimations || isMobile

  return (
    <>
      {enableSpotlight && (
        <GlobalSpotlight gridRef={gridRef} disableAnimations={shouldDisableAnimations} enabled={enableSpotlight} spotlightRadius={spotlightRadius} glowColor={glowColor} />
      )}

      <BentoCardGrid gridRef={gridRef}>
        {cardData.map((card, index) => {
          const baseClassName = `magic-bento-card ${textAutoHide ? 'magic-bento-card--text-autohide' : ''} ${enableBorderGlow ? 'magic-bento-card--border-glow' : ''} ${card.techCards ? 'magic-bento-card--tech' : ''} ${card.liquid ? 'magic-bento-card--liquid' : ''} ${card.terminalDemo ? 'magic-bento-card--music' : ''} ${card.layout ? `magic-bento-card--${card.layout}` : ''} ${card.ghost ? 'magic-bento-card--ghost' : ''}`
          const cardProps = {
            className: baseClassName,
            style: { backgroundColor: card.color, '--glow-color': glowColor, '--card-delay': `${index * 0.22}s` },
          }

          if (enableStars) {
            return (
              <ParticleCard
                key={index}
                {...cardProps}
                disableAnimations={shouldDisableAnimations}
                particleCount={particleCount}
                glowColor={glowColor}
                enableTilt={enableTilt}
                clickEffect={clickEffect}
                enableMagnetism={enableMagnetism}
              >
                {card.terminalDemo ? (
                  <CommandConsoleMini {...card.terminalDemo} />
                ) : card.pixelDemo ? (
                  <DeliveryInteractive />
                ) : (
                  <>
                    {card.label ? (
                      <div className="magic-bento-card__header">
                        <div className="magic-bento-card__label">{card.label}</div>
                      </div>
                    ) : null}
                    <div className="magic-bento-card__content">
                      <h2 className="magic-bento-card__title">{card.title}</h2>
                      <p className="magic-bento-card__description">{card.description}</p>
                      {card.loopTech && (
                        <div className="mini-tech-loop" aria-label="Tech stack loop">
                          <div className="mini-tech-loop__track">
                            {[...card.loopTech, ...card.loopTech].map((name, i) => (
                              <StackIcon key={`${name}-${i}`} name={name} className="mini-tech-item" />
                            ))}
                          </div>
                        </div>
                      )}
                      {card.details && (
                        <div className="magic-bento-details">
                          {card.details.map((item) => (
                            <div className="magic-bento-details__item" key={item.text}>
                              <i className={`bi ${item.icon}`} />
                              <span>{item.text}</span>
                            </div>
                          ))}
                        </div>
                      )}
                      {card.techCards && (
                        <div className="magic-bento-techstack-cards" aria-label="Project tech stack">
                          {card.techCards.map((name) => (
                            <div className="magic-bento-techstack-card" key={name}>
                              <StackIcon name={name} />
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </>
                )}
              </ParticleCard>
            )
          }

          return (
            <div key={index} {...cardProps}>
              {card.terminalDemo ? (
                <CommandConsoleMini {...card.terminalDemo} />
              ) : card.pixelDemo ? (
                <DeliveryInteractive />
              ) : (
                <>
                  {card.label ? (
                    <div className="magic-bento-card__header">
                      <div className="magic-bento-card__label">{card.label}</div>
                    </div>
                  ) : null}
                  <div className="magic-bento-card__content">
                    <h2 className="magic-bento-card__title">{card.title}</h2>
                    <p className="magic-bento-card__description">{card.description}</p>
                    {card.loopTech && (
                      <div className="mini-tech-loop" aria-label="Tech stack loop">
                        <div className="mini-tech-loop__track">
                          {[...card.loopTech, ...card.loopTech].map((name, i) => (
                            <StackIcon key={`${name}-${i}`} name={name} className="mini-tech-item" />
                          ))}
                        </div>
                      </div>
                    )}
                    {card.details && (
                      <div className="magic-bento-details">
                        {card.details.map((item) => (
                          <div className="magic-bento-details__item" key={item.text}>
                            <i className={`bi ${item.icon}`} />
                            <span>{item.text}</span>
                          </div>
                        ))}
                      </div>
                    )}
                    {card.techCards && (
                      <div className="magic-bento-techstack-cards" aria-label="Project tech stack">
                        {card.techCards.map((name) => (
                          <div className="magic-bento-techstack-card" key={name}>
                            <StackIcon name={name} />
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>
          )
        })}
      </BentoCardGrid>
    </>
  )
}

export default MagicBento
