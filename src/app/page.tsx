
import PositionsTable from "@/components/Table";
import PositionTree from "@/components/PositionTree";
export default function Home() {


  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center">
      <div className="bg-white shadow-md rounded-lg p-8 w-3/4">
        <PositionsTable />
        <PositionTree />
      </div>
    </div>
  );
}
