"use client"

interface DiscussionPanelProps {
  questions: string[]
  additions: string[]
}

export function DiscussionPanel({ questions, additions }: DiscussionPanelProps) {
  return (
    <div className="grid grid-cols-2 gap-6 h-full">
      <div className="flex flex-col">
        <h3 className="text-sm font-semibold mb-3 text-primary">Questions to Consider</h3>
        <div className="flex flex-col gap-3 overflow-y-auto">
          {questions.map((question, i) => (
            <div
              key={i}
              className="p-3 rounded-lg bg-card border border-border hover:border-primary/50 transition-colors"
            >
              <p className="text-sm leading-relaxed">{question}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="flex flex-col">
        <h3 className="text-sm font-semibold mb-3 text-blue-400">Potential Additions</h3>
        <div className="flex flex-col gap-3 overflow-y-auto">
          {additions.map((addition, i) => (
            <div
              key={i}
              className="p-3 rounded-lg bg-card border border-border hover:border-blue-500/50 transition-colors"
            >
              <p className="text-sm leading-relaxed">{addition}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
