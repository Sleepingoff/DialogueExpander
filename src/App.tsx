import { Outlet } from "react-router";
import AppLayout from "./components/AppLayout";

export default function App() {
  return (
    <AppLayout>
      <Outlet />
    </AppLayout>
  );
}
