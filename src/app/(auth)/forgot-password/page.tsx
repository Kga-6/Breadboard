import Link from "next/link"

export default function Forgot(){
  return (
    <>
      <h1>Change password</h1>
      <Link href="/login">Login</Link>
      <Link href="/register">Register</Link>
      <Link href="/forgot-password">Forgot Password</Link>
    </>
  )
}