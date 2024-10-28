"use client"
import { useState, useEffect } from "react";
import Toast from "@/components/MessageToast"
import usePositionStore from "@/store"

export default function MainPage() {
    const getByPagination = usePositionStore((state) => state.fetchPaginationPositions);
    const getPositions = usePositionStore((state) => state.fetchPositions);
    const [toast, setToast] = useState(null);
    const showToast = (message, type) => {
        setToast({ message, type });
    };
    const [parents, setParents] = useState([])
    const [selectedParentId, setSelectedParentId] = useState("");

    // const refreshPage = () => {
    //     router.reload(window.location.pathname);
    // };
    const handleSelectChange = (event) => {
        setSelectedParentId(event.target.value); // Update the state with selected value
        console.log("Selected parent ID:", event.target.value); // Optional: for debugging
    };
    useEffect(() => {
        const getParents = async () => {
            try {
                let parentPositions = await fetch("http://localhost:5005/position/get-parents",
                    { cache: 'no-store' }
                )
                parentPositions = await parentPositions.json()
                setParents(parentPositions)
                setSelectedParentId(parentPositions[0].id)
            } catch (error) {
                setToast("Unable to fetch positions", "error")
            }
        }
        getParents()
    }, [])
    const [positionName, setPositionName] = useState(""); // State for the new position name
    const [positionDescription, setPositionDescription] = useState("")
    const [addModalOpen, setAddModalOpen] = useState(false)
    const [loading, setLoading] = useState(false)
    // Function to handle adding a new position
    const handleAddPosition = async () => {
        setLoading(true)
        console.log("Adding position:", positionName, selectedParentId, positionDescription);
        const positionToAdd = {
            name: positionName,
            parentId: selectedParentId,
            description: positionDescription
        }
        try {
            let added = await fetch("http://localhost:5005/position/createpos",
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify(positionToAdd)
                }
            )
            added = await added.json()
            if (added == true) {
                await getByPagination(0, 1)
                await getPositions()
                showToast('Position added successfully', 'success')
                setPositionName("")
                setPositionDescription("")
                console.log("Position Addded")
                setLoading(false)
                setAddModalOpen(false)

            } else {
                showToast(added, 'error')
                setLoading(false)
                setAddModalOpen(false)
                console.log(added)
            }
        } catch (error) {
            setLoading(false)
            showToast("Unable to add position", "error")
        }
    };
    return <>
        {toast && (
            <Toast
                message={toast.message}
                type={toast.type}
                onClose={() => setToast(null)}
            />
        )}
        <h1 className="text-4xl font-bold text-green-500 mb-6 text-center">
            Perago's Organizational Structure
        </h1>


        <button
            onClick={() => { setAddModalOpen(true) }}
            className="bg-green-500 text-white rounded-lg px-4 py-2 hover:bg-green-600 transition"
        >
            Add Position
        </button>
        {addModalOpen ? <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
            <div className="bg-white p-6 rounded-lg shadow-lg w-1/2">
                <h2 className="text-xl font-bold mb-4">Add Position</h2>
                <label className="block mb-2 text-sm font-medium text-gray-700">Position Name</label>
                <input
                    type="text"
                    className="w-full border border-gray-300 rounded p-2 mb-4"
                    required
                    value={positionName}
                    onChange={(e) =>
                        setPositionName(e.target.value)
                    }
                />
                <label className="block mb-2 text-sm font-medium text-gray-700">Description</label>
                <input
                    type="text"
                    className="w-full border border-gray-300 rounded p-2 mb-4"
                    required
                    value={positionDescription}
                    onChange={(e) =>
                        setPositionDescription(e.target.value)
                    }
                />
                <label className="block mb-2 text-sm font-medium text-gray-700">Parent</label>

                <select name="parent" id="parent"
                    className="w-[50%] border border-gray-300 rounded p-2 mb-4"
                    value={selectedParentId ? selectedParentId : parents[0]?.id}
                    onChange={handleSelectChange}
                >
                    {parents ? parents.map((parent) => {
                        return <option key={parent.id} value={parent.id}>{parent.name}</option>
                    }) : ""}

                </select>
                <div className="flex justify-end space-x-4">
                    <button
                        onClick={() => { setAddModalOpen(false) }}
                        className="px-4 py-2 text-sm text-gray-700 bg-gray-200 rounded hover:bg-gray-300"
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        onClick={() => {
                            console.log("Position Id:", selectedParentId);
                            handleAddPosition()
                            setAddModalOpen(false)
                        }}
                        className={`${loading ? "disabled" : ""} disabled:bg-slate-400 px-4 py-2 text-sm text-white bg-blue-500 rounded hover:bg-blue-600`}
                    >
                        {loading ? "Adding..." : "Add"}

                    </button>
                </div>
            </div>
        </div> : ""}
    </>
}