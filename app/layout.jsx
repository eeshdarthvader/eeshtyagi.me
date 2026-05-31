import { Footer, Layout, Navbar, ThemeSwitch } from 'nextra-theme-blog'
import { Head } from 'nextra/components'
import { getPageMap } from 'nextra/page-map'
import SiteSearch from './components/SiteSearch'
import 'nextra-theme-blog/style.css'
import '../styles/main.css'

export const metadata = {
  title: 'Eesh Tyagi'
}

export default async function RootLayout({ children }) {
  const pageMap = await getPageMap()

  return (
    <html lang="en" suppressHydrationWarning>
      <Head />
      <body>
        <Layout>
          <Navbar pageMap={pageMap}>
            <SiteSearch pageMap={pageMap} />
            <ThemeSwitch />
          </Navbar>

          {children}

          <Footer>
            <small>
              <time>{new Date().getFullYear()}</time> © Eesh Tyagi.
              <a href="/feed.xml" style={{ float: 'right' }}>
                RSS
              </a>
            </small>
          </Footer>
        </Layout>
      </body>
    </html>
  )
}
