'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'

function flatten(items = []) {
  const pages = []

  for (const item of items) {
    if (!item) continue

    if (item.kind === 'MdxPage' && item.route) {
      pages.push({
        route: item.route,
        title: item.frontMatter?.title || item.name || item.route
      })
    }

    if (Array.isArray(item.children)) {
      pages.push(...flatten(item.children))
    }
  }

  return pages
}

export default function SiteSearch({ pageMap }) {
  const [query, setQuery] = useState('')

  const pages = useMemo(() => flatten(pageMap), [pageMap])

  const isOpen = query.trim().length > 0

  const results = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return []

    return pages
      .filter(
        (page) =>
          page.title.toLowerCase().includes(q) || page.route.toLowerCase().includes(q)
      )
      .slice(0, 8)
  }, [query, pages])

  return (
    <div className="site-search" onBlur={() => setTimeout(() => setQuery(''), 120)}>
      <input
        className="site-search-input"
        type="search"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search docs..."
      />

      {isOpen && (
        <div className="site-search-results">
          {results.length ? (
            results.map((result) => (
              <Link
                key={result.route}
                href={result.route}
                className="site-search-result"
                onClick={() => setQuery('')}
              >
                <span>{result.title}</span>
                <small>{result.route}</small>
              </Link>
            ))
          ) : (
            <div className="site-search-empty">No matches</div>
          )}
        </div>
      )}
    </div>
  )
}
