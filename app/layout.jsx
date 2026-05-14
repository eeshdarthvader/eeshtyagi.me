import { Footer, Layout, Navbar, ThemeSwitch } from 'nextra-theme-blog'
import { Head, Search } from 'nextra/components'
import { getPageMap } from 'nextra/page-map'
import 'nextra-theme-blog/style.css'
import '../styles/main.css'

export const metadata = {
  title: 'Eesh Tyagi'
}

export default async function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <Head />
      <body>
        <Layout>
          <Navbar pageMap={await getPageMap()}>
            <Search />
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
