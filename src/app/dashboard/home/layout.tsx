export default function DashboardLayout({
  children,
  friends
}:{
  children: React.ReactNode;
  friends: React.ReactNode;
}){
  return(
    <div>
      <div>{children}</div>
      <div>{friends}</div>
    </div>
  )
}