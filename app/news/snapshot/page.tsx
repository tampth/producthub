import { NewsSection } from '@/components/news/NewsSection'
import { Eye } from 'lucide-react'

export default function SnapshotPage() {
  return <NewsSection category="snapshot" title="Product Snapshot" icon={<Eye size={16} />} color="text-blue-600" />
}
