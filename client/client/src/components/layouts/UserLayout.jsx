import { Outlet } from 'react-router-dom';
import Navbar from '../Navbar';

export default function UserLayout() {
  return (
    <>
      <Navbar />
      <main className="flex-grow w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Outlet />
      </main>
    </>
  );
}
