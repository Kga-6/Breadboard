export default function HomeLayout({
  children,
  friends,
  calendar,
  onboarding
}:{
  children: React.ReactNode;
  friends: React.ReactNode;
  calendar: React.ReactNode;
  onboarding: React.ReactNode;
}){
  return(
    <div>
      <div>{children}</div>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <div>{onboarding}</div>
        <div>{friends}</div>
        <div>{calendar}</div>
      </div>
    </div>
  )
}