import Sidebar from "@/components/dashboard/Sidebar";
import Topbar from "@/components/dashboard/Topbar";

export default function Layout({

children,

}:{

children:React.ReactNode

}){

return(

<div className="flex">

<Sidebar/>

<div className="flex-1">

<Topbar/>

<div className="p-6">

{children}

</div>

</div>

</div>

);

}