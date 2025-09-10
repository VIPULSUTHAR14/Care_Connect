'use client'
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { signOut } from "next-auth/react"
import { useEffect, useState } from "react"
import Link from "next/link"


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
            <p className="font-mono font-bold text-2xl text-green-500 px-10"> Nabha Health Care</p>
            <div>
                <ul className="flex space-x-6">
                    <li className={authenticatedstatus?"text-xl text-green-400 font-mono font-bold":"hidden"} >{<Link href={"/chatbot"} >Chatbot</Link>}</li>
                    <li className={authenticatedstatus?"text-xl text-green-400 font-mono font-bold":"hidden"} >{<Link href={"/Settings/Patient_Settings"} >Setting</Link>}</li>
                </ul>
            </div>
            <button className={authenticatedstatus?"font-mono w-[100px] h-[50px] text-xl font-bold px-10 text-green-500 ":"hidden"} onClick={()=>signOut()} >Sign Out</button>
        </div>
    )
}