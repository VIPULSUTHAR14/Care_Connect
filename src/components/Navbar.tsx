'use client'
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { signOut } from "next-auth/react"
import { useEffect, useState } from "react"
import Link from "next/link"
import { Bell } from "lucide-react"


export default function Navbar (){
    const router = useRouter()
    const [authenticatedstatus,setAuthenticatedstatus] = useState(false)

    const {data: session ,status} = useSession();
    const user = session?.user.userType
    useEffect(()=>{
        if(status === "unauthenticated"){
            setAuthenticatedstatus(false)
        } else if(status === "authenticated"){
            setAuthenticatedstatus(true)
        }
    },[session,status])
    return(
        <div className="w-full h-[10vh] flex items-center justify-between bg-slate-50 drop-shadow-sm drop-shadow-green-300 " >
            <p className="font-mono font-bold text-2xl text-cyan-800 px-10 hover:cursor-pointer " onClick={()=>{
                router.push("/dashboard")
            }} > Nabha Health Care</p>
            <div>
                <ul className="flex space-x-10">
                {/* <li className={authenticatedstatus?"text-xl text-cyan-800 font-mono font-bold":"hidden"} >{<Link href={"/Settings/Patient_Settings"} >Profile</Link>}</li> */}
                <li className={authenticatedstatus?"text-xl text-cyan-800 font-mono font-bold":"hidden"} >{<Link href={"/hospitals"} >Book-Appointment</Link>}</li>
                <li className={authenticatedstatus?"text-xl text-cyan-800 font-mono font-bold":"hidden"} >{<Link href={"/chatbot"} >Chatbot</Link>}</li>
                <li className={authenticatedstatus?"text-xl text-cyan-800 font-mono font-bold":"hidden"} >{<Link href={"/patient/profile"} >Update-profile</Link>}</li>
                <li className="text-xl text-cyan-800 font-mono font-bold" >{<Link href={"/about"} >About-Us</Link>}</li>
                <li className="text-xl text-cyan-800 font-mono font-bold" >{<Link href={"/contact"} >Contect-Us</Link>}</li>
                <li className={authenticatedstatus?"text-xl text-cyan-800 font-mono font-bold":"hidden"} >{<Link href={"/notification"} ><Bell/></Link>}</li>
                </ul>
            </div>
            <div>
            <button className="px-4 py-2 bg-red-500 text-2xl font-mono font-bold text-white rounded-full animate-none  transition-all"  onClick={()=>{router.push("/emergency")}} >Emergency</button>
            <button className={authenticatedstatus?"font-mono bg-cyan-800 px-10 m-10 rounded-full border border-cyan-800  h-[50px] text-2xl font-bold text-white  underline transition-all hover:bg-cyan-600 hover:animate-pulse ":"hidden"} onClick={()=>signOut()} >Sign Out</button>
            </div>
        </div>
    )
}