// components/LastMatchesTable.tsx
"use client";

import { ColumnDef } from "@tanstack/react-table";
import { DataTable } from "./Line-up-table/LineUp-table";

export interface MatchDetails {
  match_id: string;
  home_team_name: string;
  away_team_name: string;
  home_icon_url: string;
  away_icon_url: string;
  home_score: number;
  away_score: number;
  match_date: string;
  completed: boolean;
}

export const matchColumns: ColumnDef<MatchDetails>[] = [
  {
    accessorKey: "match_date",
    header: "Date",
    cell: ({ row }) => new Date(row.getValue("match_date")).toLocaleDateString(),
  },
  {
    accessorKey: "home_team_name",
    header: "Home",
    cell: ({ row }) => (
      <div className="flex items-center gap-2">
        <img
          src={row.original.home_icon_url}
          alt="home logo"
          className="w-6 h-6 rounded-full"
        />
        <span>{row.original.home_team_name}</span>
      </div>
    ),
  },
  {
    accessorKey: "away_team_name",
    header: "Away",
    cell: ({ row }) => (
      <div className="flex items-center gap-2">
        <img
          src={row.original.away_icon_url}
          alt="away logo"
          className="w-6 h-6 rounded-full"
        />
        <span>{row.original.away_team_name}</span>
      </div>
    ),
  },
  {
    accessorKey: "score",
    header: "Score",
    cell: ({ row }) => (
      <span>
        {row.original.home_score} - {row.original.away_score}
      </span>
    ),
  },
];

interface LastMatchesTableProps {
  data: MatchDetails[];
  title: string;
  onRowClick?: (match: MatchDetails) => void;
}

export function LastMatchesTable({ data, title, onRowClick }: LastMatchesTableProps) {
  return (
    <div className="w-full">
      <h3 className="text-lg font-semibold text-white mb-4 text-center">{title}</h3>
      <DataTable columns={matchColumns} data={data} 
      onRowClick={(row) => {
          if (onRowClick) onRowClick(row.original);
        }}
      />
    </div>
  );
}
