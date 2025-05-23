import SideNav from "../components/SideNav";

export default function MainLayout({ children }: { children: React.ReactNode }) {
  return (
    <div>
      <SideNav />
      <main>
        {children}
      </main>
    </div>
  );
}