'use client'

import MapComponent from "./components/MapComponent";
import Sidebar from "./components/Sidebar";

export default function Home() {
  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <div className="flex-1 bg-gray-100 dark:bg-gray-900 p-4">
        <div className="h-full w-full rounded-lg bg-white dark:bg-gray-800 shadow-lg overflow-hidden">
          <MapComponent />
        </div>
      </div>
    </div>
  );
}
