import Nav from "../_components/Nav";
import PageHeader from "./_components/header";
import Account from "./_components/account";
import Personal from "./_components/personal";

export default function Settings() {
  return (
    <div className="p-4 w-[950px] mx-auto dark:bg-[#1a1a1e] flex flex-row gap-8 min-h-screen mt-16">
      <Nav />
      
      <div className="flex-1">
        {/* Header */}
        <PageHeader />

        {/* Account */}
        <Account />
        
        {/* Personal */}
        <Personal />

      </div>
    </div>
  );
}