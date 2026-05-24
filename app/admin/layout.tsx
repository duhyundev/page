import "./admin.css";

// Applies admin chrome tokens/classes to every /admin route. Each page composes
// its own chrome (the list has a sidebar; the editor and login are full-screen).
export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return children;
}
