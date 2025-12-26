import { Link } from 'react-router-dom'

const Button = ({ children, variant = 'primary', to, href, onClick, className = '', ...props }) => {
  const baseClasses = 'px-6 py-3 rounded-lg font-semibold transition-all duration-200 inline-flex items-center justify-center'
  
  const variants = {
    primary: 'bg-blue-600 text-white hover:bg-blue-700 shadow-lg hover:shadow-xl',
    secondary: 'bg-white text-blue-600 border-2 border-blue-600 hover:bg-blue-50',
    outline: 'bg-transparent text-blue-600 border-2 border-blue-600 hover:bg-blue-50',
  }
  
  const classes = `${baseClasses} ${variants[variant]} ${className}`
  
  if (to) {
    return (
      <Link to={to} className={classes} {...props}>
        {children}
      </Link>
    )
  }
  
  if (href) {
    return (
      <a href={href} className={classes} {...props}>
        {children}
      </a>
    )
  }
  
  return (
    <button onClick={onClick} className={classes} {...props}>
      {children}
    </button>
  )
}

export default Button



