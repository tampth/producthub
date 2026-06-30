import { NewsSection } from '@/components/news/NewsSection'
import { Rss } from 'lucide-react'

export default function BlogPage() {
  return <NewsSection category="blog" title="Product Update Blog" icon={<Rss size={16} />} color="text-teal-600" />
}
