
import { Tabspage } from "@/components/Line-up-table/line-up-page";
import { columns, Player_details } from "./match-lineup/column"



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
];

}

export default async function AdminDashboard(){

    //Here we simulate fetching all the data
  const my_data=await getData();



    return(<>
    
    <div>
        <Tabspage data={my_data}></Tabspage>
    </div>
    
    </>)

}