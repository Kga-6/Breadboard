import Link from "next/link"

export default function Register(){
  return (
    <>
      <h1>Register</h1>
      <Link href="/login">Login</Link>
      <Link href="/register">Register</Link>
      <Link href="/forgot-password">Forgot Password</Link>
    </>
  )
}