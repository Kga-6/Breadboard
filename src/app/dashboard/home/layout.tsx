export default function HomeLayout({
  children,
  friends,
  calendar
}:{
  children: React.ReactNode;
  friends: React.ReactNode;
  calendar: React.ReactNode;
}){
  return(
    <div>
      <div>
        <div>{children}</div>
        <div>{friends}</div>
        <div>{calendar}</div>
      </div>
    </div>
  )
}