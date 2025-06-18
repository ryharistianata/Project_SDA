import React from 'react'
import "@app/globals.css";

const LayoutAuth = ({
    children 
}: Readonly<{children: React.ReactNode}>) => {
  return (
    <section className='flex justify-center items-center my-5 mt-10'>
      {children}
    </section>
  )
}

export default LayoutAuth
