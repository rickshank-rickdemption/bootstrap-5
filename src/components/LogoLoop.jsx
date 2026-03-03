import './LogoLoop.css'

function LogoLoop({ items = [], speed = 34 }) {
  const loopItems = [...items, ...items]

  return (
    <div className="logo-loop" style={{ '--loop-duration': `${speed}s` }}>
      <div className="logo-loop-track">
        {loopItems.map((item, index) => (
          <div className="logo-loop-item" key={`${item.name}-${index}`}>
            <span className="logo-loop-icon" aria-hidden="true">
              <i className={`bi ${item.icon}`} />
            </span>
            <span className="logo-loop-name">{item.name}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

export default LogoLoop
