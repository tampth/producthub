import { NewsSection } from '@/components/news/NewsSection'
import { BarChart3 } from 'lucide-react'

export default function MetricsPage() {
  return <NewsSection category="metrics" title="Product Metrics" icon={<BarChart3 size={16} />} color="text-orange-600" />
}
