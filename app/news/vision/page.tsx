import { NewsSection } from '@/components/news/NewsSection'
import { Target } from 'lucide-react'

export default function VisionPage() {
  return <NewsSection category="vision" title="Product Vision & Strategy" icon={<Target size={16} />} color="text-red-600" />
}
