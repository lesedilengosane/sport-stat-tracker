
"use client"

import { ColumnDef } from "@tanstack/react-table"
import Image from "next/image"

// This type is used to define the shape of our data.
// You can use a Zod schema here if you want.
export type Player_details = {
  id: string
  avatarUrl?: string
  name: string
  surname: string
  position: string
}

export const columns: ColumnDef<Player_details>[] = [
  {
    accessorKey: "name",
    header: "Name",
  },
  {
    accessorKey: "surname",
    header: "Surname",
  },
  {
    accessorKey: "position",
    header: "Position",
  },
]
