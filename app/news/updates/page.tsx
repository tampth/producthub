import { NewsSection } from '@/components/news/NewsSection'
import { Package } from 'lucide-react'

export default function UpdatesPage() {
  return <NewsSection category="updates" title="Product Updates & Releases" icon={<Package size={16} />} color="text-purple-600" />
}
