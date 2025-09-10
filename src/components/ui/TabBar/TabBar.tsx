import React from 'react'
interface TabBarProps {
  activeTab: string
  setActiveTab: (tab: string) => void
}
export const TabBar = ({ activeTab, setActiveTab }: TabBarProps) => {
  const tabs = [
    {
      id: 'upcoming',
      label: 'Upcoming Games',
    },
    {
      id: 'booked',
      label: 'Booked Games',
    },
    {
      id: 'live',
      label: 'Live Now',
    },
    {
      id: 'completed',
      label: 'Completed',
    },
  ]
  return (
    <div className="mb-6">
      <div className="border-b border-gray-700">
        <nav className="-mb-px flex space-x-8">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${activeTab === tab.id ? 'border-blue-500 text-blue-500' : 'border-transparent text-gray-400 hover:text-gray-300 hover:border-gray-300'}`}
              onClick={() => setActiveTab(tab.id)}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>
    </div>
  )
}
