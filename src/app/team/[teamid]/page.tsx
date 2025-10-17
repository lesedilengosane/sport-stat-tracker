"use client"

import { useParams } from "next/navigation"
import TeamDetails from "../../../components/fanComponents/TeamDetails"

export default function TeamPage() {
  const params = useParams()
  const teamId = params?.teamid as string

  if (!teamId) {
    return <p className="text-center mt-10 text-gray-900">Invalid team ID</p>
  }

  return <TeamDetails teamId={teamId} />
}
