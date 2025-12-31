const Card = ({ children, className = '', hover = true }) => {
  const hoverClasses = hover ? 'hover:shadow-xl transition-all duration-300' : ''
  return (
    <div className={`bg-white rounded-xl shadow-lg p-6 ${hoverClasses} ${className}`}>
      {children}
    </div>
  )
}

export default Card



