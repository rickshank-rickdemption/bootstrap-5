import { lazy, Suspense, useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import ColorBends from '../components/ColorBends'
import StarBorder from '../components/StarBorder'
import './LandingPage.css'

const InfiniteMenu = lazy(() => import('../components/InfiniteMenu'))
const MagicBento = lazy(() => import('../components/MagicBento'))

function SlideTextLabel({ text, hoverText }) {
  const nextText = hoverText || text
  return (
    <>
      <span className="slide-text-shell" aria-hidden="true">
        <span className="slide-text-track">
          <span className="slide-text-line">{text}</span>
          <span className="slide-text-line slide-text-line--hover">{nextText}</span>
        </span>
      </span>
      <span className="visually-hidden">{text}</span>
    </>
  )
}

const DARK_PALETTES = [
  ['#ff5c7a', '#8a5cff', '#00ffd1'],
  ['#ff7a18', '#ff3d81', '#7a5cff'],
  ['#00d4ff', '#6a5cff', '#ff4ecd'],
  ['#ffd166', '#ff006e', '#8338ec'],
]

const LIGHT_PALETTES = [
  ['#111111', '#4b5563', '#9ca3af'],
  ['#1f2937', '#6b7280', '#d1d5db'],
  ['#0f172a', '#64748b', '#cbd5e1'],
  ['#374151', '#9ca3af', '#f3f4f6'],
]

const PLUGIN_ITEMS = [
  {
    image: '/img/alert-icon.png',
    link: '/components?plugin=alert',
    title: 'Alert',
    description: 'Display contextual status messages.',
    bw: true,
  },
  {
    image: '/img/button.png',
    link: '/components?plugin=button',
    title: 'Button',
    description: 'Trigger primary and secondary actions.',
  },
  {
    image: '/img/carousel.png',
    link: '/components?plugin=carousel',
    title: 'Carousel',
    description: 'Cycle through media slides.',
  },
  {
    image: '/img/collapse.png',
    link: '/components?plugin=collapse',
    title: 'Collapse',
    description: 'Expand and hide content blocks.',
  },
  {
    image: '/img/dropdown.png',
    link: '/components?plugin=dropdown',
    title: 'Dropdown',
    description: 'Show compact option menus.',
  },
  {
    image: '/img/modal.png',
    link: '/components?plugin=modal',
    title: 'Modal',
    description: 'Open focused dialog windows.',
  },
  {
    image: '/img/offcanvas.png',
    link: '/components?plugin=offcanvas',
    title: 'Offcanvas',
    description: 'Slide in side panels.',
  },
  {
    image: '/img/popover.png',
    link: '/components?plugin=popover',
    title: 'Popover',
    description: 'Reveal richer contextual info.',
  },
  {
    image: '/img/scrollspy.png',
    link: '/components?plugin=scrollspy',
    title: 'Scrollspy',
    description: 'Track scroll position in nav.',
  },
  {
    image: '/img/tab.png',
    link: '/components?plugin=tab',
    title: 'Tab',
    description: 'Switch between content panes.',
  },
  {
    image: '/img/toast.png',
    link: '/components?plugin=toast',
    title: 'Toast',
    description: 'Show lightweight notifications.',
  },
  {
    image: '/img/tooltip.png',
    link: '/components?plugin=tooltip',
    title: 'Tooltip',
    description: 'Display short helper labels.',
  },
  {
    image: '/img/preloader.png',
    link: '/components?plugin=preloader',
    title: 'Pre-loader',
    description: 'Show loading state on startup.',
  },
]

function LandingPage() {
  const [theme, setTheme] = useState(() => {
    const saved = localStorage.getItem('theme')
    return saved === 'light' || saved === 'dark' ? saved : 'dark'
  })
  const [paletteIndex, setPaletteIndex] = useState(0)
  const [showSentModal, setShowSentModal] = useState(false)
  const [contactEmail, setContactEmail] = useState('')
  const magicBentoTriggerRef = useRef(null)
  const infiniteMenuTriggerRef = useRef(null)
  const [loadMagicBento, setLoadMagicBento] = useState(false)
  const [loadInfiniteMenu, setLoadInfiniteMenu] = useState(false)

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
    localStorage.setItem('theme', theme)
    window.postMessage({ type: 'bootstrap5-theme-sync', theme }, window.location.origin)
  }, [theme])

  useEffect(() => {
    const onStorage = (event) => {
      if (event.key !== 'theme') return
      const next = event.newValue
      if (next === 'dark' || next === 'light') setTheme(next)
    }

    const onMessage = (event) => {
      if (event.origin !== window.location.origin) return
      const data = event.data
      if (!data || data.type !== 'bootstrap5-theme-sync') return
      if (data.theme === 'dark' || data.theme === 'light') setTheme(data.theme)
    }

    window.addEventListener('storage', onStorage)
    window.addEventListener('message', onMessage)
    return () => {
      window.removeEventListener('storage', onStorage)
      window.removeEventListener('message', onMessage)
    }
  }, [])

  useEffect(() => {
    const activePalettes = theme === 'dark' ? DARK_PALETTES : LIGHT_PALETTES
    const timer = window.setInterval(() => {
      setPaletteIndex((prev) => (prev + 1) % activePalettes.length)
    }, 2200)
    return () => window.clearInterval(timer)
  }, [theme])

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return
          if (entry.target === magicBentoTriggerRef.current) setLoadMagicBento(true)
          if (entry.target === infiniteMenuTriggerRef.current) setLoadInfiniteMenu(true)
          observer.unobserve(entry.target)
        })
      },
      { rootMargin: '260px 0px' }
    )

    const magicTarget = magicBentoTriggerRef.current
    const infiniteTarget = infiniteMenuTriggerRef.current
    if (magicTarget && !loadMagicBento) observer.observe(magicTarget)
    if (infiniteTarget && !loadInfiniteMenu) observer.observe(infiniteTarget)

    return () => observer.disconnect()
  }, [loadInfiniteMenu, loadMagicBento])

  useEffect(() => {
    const targets = Array.from(document.querySelectorAll('.rb-reveal'))
    if (!targets.length) return

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('in-view')
            observer.unobserve(entry.target)
          }
        })
      },
      { threshold: 0.15, rootMargin: '0px 0px -8% 0px' }
    )

    targets.forEach((el) => observer.observe(el))
    return () => observer.disconnect()
  }, [])

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'))
  }

  const handleFooterSubmit = (event) => {
    event.preventDefault()
    setShowSentModal(true)
  }

  return (
    <main className="landing-react-page">
      <nav className="navbar fixed-top landing-react-nav">
        <div className="landing-react-nav-shell landing-react-nav-pill">
          <Link className="landing-react-brand d-inline-flex align-items-center gap-2" to="/">
            <i className="bi bi-wind" />
            <span>bootstrap-5</span>
            <span className="beta-pill">by riri</span>
          </Link>
          <div className="d-flex align-items-center gap-1 ms-auto landing-react-icons">
            <a className="icon-link" href="https://github.com/rickshank-rickdemption" target="_blank" rel="noreferrer" aria-label="GitHub">
              <i className="bi bi-github" />
            </a>
            <button className="icon-link icon-btn" type="button" aria-label="Toggle theme" onClick={toggleTheme}>
              <i className={`bi ${theme === 'dark' ? 'bi-sun' : 'bi-moon'}`} />
            </button>
          </div>
        </div>
      </nav>

      <header className="landing-react-hero">
        <div className="landing-react-beams" aria-hidden="true">
          <ColorBends
            colors={theme === 'light' ? LIGHT_PALETTES[paletteIndex % LIGHT_PALETTES.length] : DARK_PALETTES[paletteIndex % DARK_PALETTES.length]}
            rotation={0}
            speed={0.2}
            scale={1}
            frequency={1}
            warpStrength={1}
            mouseInfluence={1}
            parallax={0.95}
            noise={0.1}
            transparent
            autoRotate={0}
          />
        </div>

        <div className="container landing-react-content">
          <h1 className="landing-react-title">Bootstrap 5 Website</h1>
          <p className="landing-react-sub">
            Complete Bootstrap plugin showcase with working interactions.
          </p>
          <div className="d-flex justify-content-center flex-wrap gap-2">
            <StarBorder
              as={Link}
              to="/components"
              className="hero-cta-star slide-text-btn"
              color="rgba(255,255,255,0.95)"
              speed="5.5s"
              thickness={1}
            >
              <SlideTextLabel text="Browse Components" hoverText="Browse Components" />
            </StarBorder>
          </div>
        </div>
      </header>

      <section id="overview" className="landing-section">
        <div className="container section-shell">
          <div className="rb-reveal">
            <p className="section-kicker overview-kicker-badge">Project Overview</p>
            <h2 className="section-title">Frontend built for my Bootstrap 5 school project</h2>
            <p className="section-copy">
              This project demonstrates my responsive layout work, reusable UI blocks, and fully interactive Bootstrap plugins.
              I built it for school presentation, checking, and deployment.
            </p>
          </div>

          <div ref={magicBentoTriggerRef} className="rb-reveal mt-4">
            {loadMagicBento ? (
              <Suspense fallback={<div className="lazy-panel-placeholder" aria-hidden="true" />}>
                <MagicBento
                  textAutoHide={true}
                  enableStars={false}
                  enableSpotlight
                  enableBorderGlow={true}
                  enableTilt={false}
                  enableMagnetism={false}
                  clickEffect
                  spotlightRadius={400}
                  particleCount={12}
                  glowColor="148, 163, 184"
                  disableAnimations={false}
                />
              </Suspense>
            ) : (
              <div className="lazy-panel-placeholder" aria-hidden="true" />
            )}
          </div>
        </div>
      </section>

      <section id="plugins" className="landing-section">
        <div className="container section-shell">
          <div className="rb-reveal">
            <p className="section-kicker">Required Plugins</p>
            <h2 className="section-title">Complete Bootstrap interaction set</h2>
          </div>
          <div ref={infiniteMenuTriggerRef} className="infinite-menu-shell rb-reveal">
            {loadInfiniteMenu ? (
              <Suspense fallback={<div className="lazy-panel-placeholder menu infinite-menu-stage is-placeholder" aria-hidden="true" />}>
                <div className="infinite-menu-stage">
                  <InfiniteMenu scale={1} items={PLUGIN_ITEMS} />
                </div>
              </Suspense>
            ) : (
              <div className="lazy-panel-placeholder menu" aria-hidden="true" />
            )}
          </div>
        </div>
      </section>

      <footer className="landing-react-footer">
        <div className="container landing-footer-shell">
          <div className="footer-newsletter rb-reveal">
            <p className="footer-label">SEND US A MESSAGE:</p>
            <form className="footer-newsletter-form" onSubmit={handleFooterSubmit}>
              <label className="visually-hidden" htmlFor="footerEmail">
                Email address
              </label>
              <input
                id="footerEmail"
                type="email"
                placeholder="your@email.com"
                autoComplete="email"
                value={contactEmail}
                onChange={(event) => setContactEmail(event.target.value)}
                required
              />
            </form>
            <label className="footer-terms">
              <input type="checkbox" />
              <span>
                I agree to the contact form terms and privacy policy.
              </span>
            </label>
          </div>

          <div className="footer-main rb-reveal">
            <div className="footer-brand-block">
              <Link className="footer-brand" to="/">
                <i className="bi bi-wind" />
                <span>bootstrap-5</span>
              </Link>
              <div className="footer-actions">
                <Link to="/components" className="footer-pill-btn footer-pill-primary slide-text-btn">
                  <SlideTextLabel text="Explore Components" hoverText="Explore Components" />
                  <i className="bi bi-arrow-right-short" />
                </Link>
              </div>
            </div>

            <div className="footer-links-grid">
              <div className="footer-about-links">
                <p className="footer-col-title">Project</p>
                <a href="#overview">About This Build</a>
                <Link to="/components">Plugin Docs</Link>
              </div>

              <div className="footer-connect-links">
                <p className="footer-col-title">Connect</p>
                <a href="https://www.instagram.com/ririaaou/" target="_blank" rel="noreferrer">
                  Instagram
                </a>
                <a href="https://github.com/rickshank-rickdemption" target="_blank" rel="noreferrer">
                  GitHub
                </a>
              </div>
            </div>
          </div>

          <div className="footer-bottom">
            <div className="footer-bottom-legal">
              <p>&copy; 2026 bootstrap-5. All rights reserved.</p>
            </div>
          </div>
        </div>
      </footer>

      {showSentModal && (
        <div className="contact-modal-backdrop" role="presentation" onClick={() => setShowSentModal(false)}>
          <div
            className="contact-modal-card"
            role="dialog"
            aria-modal="true"
            aria-labelledby="contactSentTitle"
            onClick={(event) => event.stopPropagation()}
          >
            <h3 id="contactSentTitle">Email Sent</h3>
            <p>Your message has been sent successfully.</p>
            <button type="button" className="slide-text-btn" onClick={() => setShowSentModal(false)}>
              <SlideTextLabel text="Close" hoverText="Close" />
            </button>
          </div>
        </div>
      )}

    </main>
  )
}

export default LandingPage
