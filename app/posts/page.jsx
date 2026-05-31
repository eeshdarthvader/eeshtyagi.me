import fs from 'node:fs'
import path from 'node:path'
import Link from 'next/link'
import matter from 'gray-matter'

function getPosts() {
  const postsDir = path.join(process.cwd(), 'content', 'posts')
  const files = fs
    .readdirSync(postsDir)
    .filter((file) => /\.(md|mdx)$/.test(file) && !file.startsWith('index.'))

  return files
    .map((file) => {
      const slug = file.replace(/\.(md|mdx)$/, '')
      const source = fs.readFileSync(path.join(postsDir, file), 'utf8')
      const { data } = matter(source)

      return {
        slug,
        title: data.title || slug,
        date: data.date || ''
      }
    })
    .sort((a, b) => new Date(b.date) - new Date(a.date))
}

export default function PostsPage() {
  const posts = getPosts()

  return (
    <main>
      <h1>Posts</h1>
      <ul>
        {posts.map((post) => (
          <li key={post.slug} style={{ marginBottom: '0.75rem' }}>
            <Link href={`/posts/${post.slug}`}>{post.title}</Link>
          </li>
        ))}
      </ul>
    </main>
  )
}
