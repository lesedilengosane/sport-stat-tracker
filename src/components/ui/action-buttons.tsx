"use client"

interface ActionButtonsProps {
  onAction: (action: string, points: number) => void
  disabled: boolean
}

export default function ActionButtons({ onAction, disabled }: ActionButtonsProps) {
  const actionButtons = [
    { label: "+1 FT", action: "+1 FT", points: 1, color: "bg-red-500 hover:bg-red-600" },
    { label: "+2 FG", action: "+2 FG", points: 2, color: "bg-red-500 hover:bg-red-600" },
    { label: "+3 FG", action: "+3 FG", points: 3, color: "bg-red-500 hover:bg-red-600" },
    { label: "Reb", action: "Reb", points: 0, color: "bg-gray-500 hover:bg-gray-600" },
    { label: "Ast", action: "Ast", points: 0, color: "bg-gray-500 hover:bg-gray-600" },
    { label: "Stl", action: "Stl", points: 0, color: "bg-gray-500 hover:bg-gray-600" },
    { label: "Blk", action: "Blk", points: 0, color: "bg-gray-500 hover:bg-gray-600" },
    { label: "TO", action: "TO", points: 0, color: "bg-yellow-500 hover:bg-yellow-600" },
    { label: "Foul", action: "Foul", points: 0, color: "bg-orange-500 hover:bg-orange-600" },
  ]

  return (
    <div className="space-y-2">
      {actionButtons.map((button, index) => (
        <button
          key={index}
          onClick={() => onAction(button.action, button.points)}
          className={`w-full h-10 ${button.color} text-white font-bold text-sm border-2 border-gray-300 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed`}
          disabled={disabled}
        >
          {button.label}
        </button>
      ))}
    </div>
  )
}
