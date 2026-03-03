import { Children, cloneElement } from 'react'
import './ScrollStack.css'

export const ScrollStackItem = ({ children, itemClassName = '', style = {} }) => (
  <div className={`scroll-stack-card ${itemClassName}`.trim()} style={style}>
    {children}
  </div>
)

const ScrollStack = ({ children, className = '' }) => {
  const items = Children.map(children, (child, index) => {
    if (!child) return child
    const childStyle = child.props?.style || {}
    return cloneElement(child, {
      style: {
        ...childStyle,
        '--stack-index': index,
      },
    })
  })

  return (
    <div className={`scroll-stack-scroller ${className}`.trim()}>
      <div className="scroll-stack-inner">
        {items}
        <div className="scroll-stack-end" />
      </div>
    </div>
  )
}

export default ScrollStack
