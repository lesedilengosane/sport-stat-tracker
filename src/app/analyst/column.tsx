// app/analyst/column.tsx
"use client";

import { ColumnDef } from "@tanstack/react-table";

export type Player_details = {
  id: string;
  avatarUrl?: string;
  name: string;
  surname: string;
  position: string;
};

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
];
