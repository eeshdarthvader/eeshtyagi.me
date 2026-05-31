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
    <div style={{ position: 'relative' }}>
      <input
        type="search"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search docs..."
        style={{
          border: '1px solid #334155',
          borderRadius: 8,
          padding: '8px 10px',
          background: 'transparent',
          minWidth: 220
        }}
      />

      {results.length > 0 && (
        <div
          style={{
            position: 'absolute',
            right: 0,
            top: '110%',
            width: 320,
            maxWidth: '90vw',
            border: '1px solid #334155',
            borderRadius: 10,
            background: 'var(--x-color-nextra-bg, #0b1220)',
            zIndex: 50,
            overflow: 'hidden'
          }}
        >
          {results.map((result) => (
            <Link
              key={result.route}
              href={result.route}
              style={{
                display: 'block',
                padding: '10px 12px',
                borderBottom: '1px solid #1e293b',
                textDecoration: 'none'
              }}
              onClick={() => setQuery('')}
            >
              {result.title}
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
