import { JiraTimeline } from "@/components/jira-timeline"

export default function Home() {
  return (
    <div className="container mx-auto py-8">
      <h1 className="text-2xl font-bold mb-6">Project Timeline</h1>
      <JiraTimeline />
    </div>
  )
}
