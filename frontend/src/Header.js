import React from 'react'

const Header = ({title}) => {
     
  return (
    <header>
      <h1>{title}</h1>

    </header>
  )
}

Header.deafultProps = {
    title: 'Default List'
}
export default Header
