import Link from "next/link"

export default function Login(){
  return (
    <>
      <h1>Login</h1>
      <Link href="/login">Login</Link>
      <Link href="/register">Register</Link>
      <Link href="/forgot-password">Forgot Password</Link>
    </>
  )
}