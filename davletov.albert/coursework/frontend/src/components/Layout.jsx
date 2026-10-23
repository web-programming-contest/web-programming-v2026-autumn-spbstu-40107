import { Outlet } from 'react-router'
import Header from './Header.jsx'
import Footer from './Footer.jsx'

function Layout() {
  return (
    <div className="layout">
      <Header />
      <main className="layout__main">
        <Outlet />
      </main>
      <Footer />
    </div>
  )
}

export default Layout
