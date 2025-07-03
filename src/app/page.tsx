import Link from "next/link"

export default function Home(){
    return (
      <>
        <h1>Welcome to Breadboard</h1>
        <Link href="/login">Logins</Link>
      </>
    )
}