'use client'
import { useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
import { useEffect } from "react"
import { stat } from "fs"
import Link from "next/link"

export default function Patient_Settings (){
    const {data : session , status} = useSession()
    const router = useRouter()
    const userType = session?.user.userType
    useEffect(()=>{
        if(userType !="patient"){
            router.push("/dashboard")
        }
        if(status === "unauthenticated"){
            router.push("/Register")
        }
    },[session,status])

    if(status === "loading"){
        return(
            <div>
                Loading
            </div>
        )
    }
    return(
        <div>
            <ul className="flex flex-col items-center justify-center space-y-9"  >
                <li className=""><Link href={"/patient/profile"} >Update Profile</Link></li>
                <li className=""><Link href={""} >HELLO</Link></li>
                <li className=""><Link href={""} >HELLO</Link></li>
                <li className=""><Link href={""} >HELLO</Link></li>
                <li className=""><Link href={""} >HELLO</Link></li>
            </ul>
        </div>
    )
}