

import { columns, Player_details } from "./column"
import { DataTable } from "@/components/Line-up-table/LineUp-table";

async function getData(): Promise<Player_details[]> {
  // Fetch data from your API here.
return [
  {
    id: "728ed52f",
    name: "Michael",
    surname: "Jordan",
    position: "Shooting Guard",
    avatarUrl: "/avatars/player3.jpg",
  },
  {
    id: "9a12bc34",
    name: "Alice",
    surname: "Smith",
    position: "Point Guard",
    avatarUrl: "/avatars/player2.jpg",
  },
  {
    id: "c67de89f",
    name: "Bob",
    surname: "Johnson",
    position: "Center",
    avatarUrl: "/avatars/player3.jpg",
  },
  {
    id: "ef34ab56",
    name: "Carol",
    surname: "Davis",
    position: "Small Forward",
    avatarUrl: "/avatars/player4.jpg",
  },
  {
    id: "12cd34ef",
    name: "Dave",
    surname: "Wilson",
    position: "Power Forward",
    avatarUrl: "/avatars/player5.jpg",
  },
  {
    id: "78gh56ij",
    name: "Eve",
    surname: "Miller",
    position: "Shooting Guard",
    avatarUrl: "/avatars/player6.jpg",
  },
  {
    id: "34kl78mn",
    name: "Frank",
    surname: "Brown",
    position: "Center",
    avatarUrl: "/avatars/player7.jpg",
  },
  {
    id: "90op12qr",
    name: "Grace",
    surname: "Taylor",
    position: "Point Guard",
    avatarUrl: "/avatars/player8.jpg",
  },
  {
    id: "56st34uv",
    name: "Henry",
    surname: "Anderson",
    position: "Small Forward",
    avatarUrl: "/avatars/player9.jpg",
  },
  {
    id: "ab89wx12",
    name: "Ivy",
    surname: "Thomas",
    position: "Power Forward",
    avatarUrl: "/avatars/player10.jpg",
  },
];



}

export default async function DemoPage() {
  const data = await getData()

  return (
    <div className="container mx-auto py-10 flex gap-6">
  <div className="w-1/2">
    <DataTable columns={columns} data={data} />
  </div>
  <div className="w-1/2">
    <DataTable columns={columns} data={data} />
  </div>
</div>
  )
}