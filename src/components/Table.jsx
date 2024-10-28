"use client";
import { FaEdit, FaTrash } from "react-icons/fa";
import React, { useEffect, useState } from "react";
import Toast from "./MessageToast";
import usePositionStore from "@/store";


const PositionsTable = () => {
    const getPositions = usePositionStore((state) => state.fetchPositions);

    const [parents1, setParents1] = useState([])
    const [selectedParentId, setSelectedParentId] = useState("");

    // const refreshPage = () => {
    //     router.reload(window.location.pathname);
    // };
    const handleSelectChange2 = (event) => {
        setSelectedParentId(event.target.value); // Update the state with selected value
        console.log("Selected parent ID:", event.target.value); // Optional: for debugging
    };

    const [positionName, setPositionName] = useState(""); // State for the new position name
    const [positionDescription, setPositionDescription] = useState("")
    const [addModalOpen, setAddModalOpen] = useState(false)
    const [loading, setLoading] = useState(false)
    const [loadingAdd, setLoadingAdd] = useState(false)

    // Function to handle adding a new position
    const handleAddPosition = async () => {
        if (positionName.trim() == "" || positionDescription.trim() == "") {
            showToast("All fields are required", "error")
            setLoadingAdd(false)
            return
        }
        else {
            setLoadingAdd(true)
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
                    await fetchPositions(0, 10)
                    await getPositions()
                    showToast('Position added successfully', 'success')
                    setPositionName("")
                    setPositionDescription("")
                    console.log("Position Addded")
                    setLoadingAdd(false)
                    setAddModalOpen(false)

                } else {
                    showToast(added, 'error')
                    setLoadingAdd(false)
                    setAddModalOpen(false)
                    console.log(added)
                }
            } catch (error) {
                setLoadingAdd(false)
                showToast("Unable to add position", "error")
            }
        }
    };

    const fetchPeginatedData = usePositionStore((state) => state.fetchPaginationPositions);
    // const peginatedPositions = usePositionStore((state) => state.positions);
    const paginatedData = usePositionStore((state) => state.positionByPagination);
    const [deletePending, setDeletePending] = useState(false)
    const [newParentId, setNewParentId] = useState()
    const [toast, setToast] = useState(null);
    const showToast = (message, type) => {
        setToast({ message, type });
    };
    const [positions, setPositions] = useState([]);
    const [page, setPage] = useState(0);
    const [pageSize, setPageSize] = useState(10);
    const [total, setTotal] = useState(0);
    const [parents, setParents] = useState([])
    const [filteredParents, setFilteredParents] = useState("")
    // State for Modals
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [currentPosition, setCurrentPosition] = useState(null);
    const [previousName, setPreviousName] = useState("")
    const fetchPositions = async (page, pageSize) => {
        try {
            console.log(page, pageSize)
            setLoading(true)
            const response = await fetch(
                `http://localhost:5005/position/get-by-pagination?page=${page + 1}&pageSize=${pageSize}`
            );
            //getting the parents to be filtered later
            let all_parents = await fetch(
                `http://localhost:5005/position/get-parents`
            );
            all_parents = await all_parents.json()
            const data = await response.json();
            setPositions(data.positions);
            setParents(all_parents)
            setTotal(data.total);
            setLoading(false)

        } catch (error) {
            setToast("Error fetching positions:", "error")
            setLoading(false)

        }
    };
    useEffect(() => {
        console.log("Hello")
        const getPaginatedPositions = async () => {
            await fetchPeginatedData(0, 10)
        }
        console.log(paginatedData)
        getPaginatedPositions()
    }, [])
    useEffect(() => {
        fetchPositions(page, pageSize);
    }, [page, pageSize]);


    const handlePageChange = (newPage) => {
        setPage(newPage);
    };

    const handlePageSizeChange = (event) => {
        setPageSize(parseInt(event.target.value, 10));
        setPage(0);
    };

    const openEditModal = (position) => {
        setCurrentPosition(position);
        setIsEditModalOpen(true);
    };

    const closeEditModal = () => {
        setIsEditModalOpen(false);
        setCurrentPosition(null);
    };

    const openDeleteModal = (position) => {
        setCurrentPosition(position);
        setIsDeleteModalOpen(true);
    };

    const closeDeleteModal = () => {
        setIsDeleteModalOpen(false);
        setCurrentPosition(null);
    };

    const handleDeleteConfirm = async (id) => {
        setDeletePending(true)
        try {
            var deleteResponse = await fetch(`http://localhost:5005/position/delete-position/${id}`, {
                method: "DELETE",
                headers: {
                    "Content-Type": "application/json"
                },
            })
            deleteResponse = await deleteResponse.json()
            await getPositions()
            if (deleteResponse.done) {
                await fetchPositions(0, 10)
                showToast(deleteResponse.message, "success")
                setDeletePending(false)
                closeDeleteModal();

            }
            else {
                showToast(deleteResponse.message, "error")
                setDeletePending(false)
                closeDeleteModal();
            }

        } catch (error) {
            showToast(deleteResponse.message, "error")
            setDeletePending(false)
            closeDeleteModal();

        }

    };
    useEffect(() => {
        const getParents = async () => {
            try {
                let parentPositions = await fetch("http://localhost:5005/position/get-parents",
                    { cache: 'no-store' }
                )
                parentPositions = await parentPositions.json()
                setParents1(parentPositions)
                setSelectedParentId(parentPositions[0].id)
            } catch (error) {
                setToast("Unable to fetch positions", "error")
            }
        }
        getParents()
    }, [addModalOpen])
    const handleSelectChange = (event) => {
        setNewParentId(event.target.value)
    }

    const handleSaveChanges = async () => {
        if (currentPosition.name.trim() == "" || currentPosition.description.trim() == "") {
            showToast("All fields are required", "error")
            return
        }
        try {
            // If previous name equals current name and no new parentId, just close the modal
            if (previousName === currentPosition.name && !newParentId) {
                closeEditModal();
                return;
            }

            // If names are different and there's no parentId, check if a parent exists
            if (previousName !== currentPosition.name && !newParentId) {
                const parentExistResponse = await fetch(`http://localhost:5005/position/parent-exist/${currentPosition.name}`);
                const parentExist = await parentExistResponse.json();

                // If parent exists, do nothing; otherwise, proceed with the update
                if (parentExist.found) {
                    showToast("Position with that name exists", "error")
                    return;
                }
            }

            // Set the new parentId if present
            if (newParentId) {
                currentPosition.parentId = newParentId;
            }

            // Update position name to uppercase
            currentPosition.name = currentPosition.name.toUpperCase();

            // Perform the update request
            const updateResponse = await fetch(`http://localhost:5005/position/update-position/${currentPosition.id}`, {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(currentPosition)
            });

            const updateResult = await updateResponse.json();

            // Refresh position list and display success or error message
            await fetchPositions(0, 10);
            await getPositions();

            if (updateResult.done) {
                showToast(updateResult.message, 'success');
            } else {
                showToast("Can't update the position", 'error');
            }
        } catch (error) {
            console.error("Error updating position:", error);
        }

        closeEditModal();
    };

    const getFilteredParents = async (id) => {
        try {
            let eligible_parents = await fetch(`http://localhost:5005/position/get-eligible-parents/${id}`)
            eligible_parents = await eligible_parents.json()
            setFilteredParents(eligible_parents)
            return
        } catch (error) {
            showToast("Connection lost, try again", "error")
        }


        // setFilteredParents([])
        // if (id == null) {
        //     setFilteredParents([])

        // } else {
        //     if (!parentName || !parentPositions) return;  // safety check
        //     const filteredParents = parentPositions.filter(
        //         (par) => {

        //             return par.parent?.name !== parentName && par.name != parentName
        //         }
        //     );
        //     setFilteredParents(filteredParents);
        // }
    };

    useEffect(() => {
        if (currentPosition && parents.length > 0) {
            getFilteredParents(currentPosition.id);
        }
    }, [currentPosition, parents]);
    return (
        <div className="p-4">
            <h1 className="text-4xl font-bold text-green-500 mb-6 text-center">
                Perago's Organizational Structure
            </h1>
            <button
                onClick={() => { setAddModalOpen(true), fetchPositions(page, pageSize) }}
                className="bg-green-500 text-white rounded-lg px-4 py-2 hover:bg-green-600 transition"
            >
                Add Position
            </button>
            {addModalOpen ? <div className="fixed inset-0 z-10 flex items-center justify-center bg-black bg-opacity-10">
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
                        onChange={handleSelectChange2}
                    >
                        {parents1 ? parents1.map((parent) => {
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
            <div className="overflow-x-auto">
                {loading ? <p className="text-lg text-slate-400 text-center mt-2">Loading...</p> : <table className="min-w-full bg-white border border-gray-200 shadow-md">
                    <thead>
                        <tr>
                            <th className="px-4 py-2 border-b text-left text-sm font-semibold text-gray-600">
                                Name
                            </th>
                            <th className="px-4 py-2 border-b text-left text-sm font-semibold text-gray-600">
                                Description
                            </th>
                            <th className="px-4 py-2 border-b text-left text-sm font-semibold text-gray-600">
                                Parent Position
                            </th>
                            <th className="px-4 py-2 border-b text-left text-sm font-semibold text-gray-600">
                                Actions
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        {positions && positions.length > 0 ? (
                            positions.map((position) => (
                                <tr key={position.id} className="border-b hover:bg-gray-50">
                                    <td className="px-4 py-2 text-sm text-gray-800">{position.name}</td>
                                    <td className="px-4 py-2 text-sm text-gray-800">{position.description}</td>
                                    <td className="px-4 py-2 text-sm text-gray-800">
                                        {position.parentPosition === "N/A" ? "Root" : position.parentPosition}
                                    </td>
                                    <td className="px-4 py-2">
                                        <div className="flex flex-row gap-4">
                                            <FaEdit
                                                size={15}
                                                color="cyan"
                                                className="cursor-pointer"
                                                onClick={() => {
                                                    setPreviousName(position.name)
                                                    openEditModal(position)
                                                }}
                                            />
                                            <FaTrash
                                                size={15}
                                                color="red"
                                                className="cursor-pointer"
                                                onClick={() => openDeleteModal(position)}
                                            />
                                        </div>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="4" className="px-4 py-2 text-center text-gray-500">
                                    No positions to display
                                </td>
                            </tr>
                        )}
                    </tbody>

                </table>}

            </div>

            <div className="flex items-center justify-between mt-4">
                <div className="flex items-center">
                    <span className="text-sm text-gray-700 mr-2">Rows per page:</span>
                    <select
                        className="border border-gray-300 rounded p-1"
                        value={pageSize}
                        onChange={handlePageSizeChange}
                    >
                        <option value={5}>5</option>
                        <option value={10}>10</option>
                        <option value={15}>15</option>
                        <option value={20}>20</option>
                    </select>
                </div>
                <div className="flex items-center space-x-2">
                    <button
                        onClick={() => handlePageChange(page - 1)}
                        disabled={page === 0}
                        className="px-2 py-1 text-sm text-gray-600 bg-gray-200 rounded hover:bg-gray-300 disabled:opacity-50"
                    >
                        Previous
                    </button>
                    <span className="text-sm text-gray-700">
                        Page {page + 1} of {Math.ceil(total / pageSize)}
                    </span>
                    <button
                        onClick={() => handlePageChange(page + 1)}
                        disabled={(page + 1) * pageSize >= total}
                        className="px-2 py-1 text-sm text-gray-600 bg-gray-200 rounded hover:bg-gray-300 disabled:opacity-50"
                    >
                        Next
                    </button>
                </div>
            </div>

            {/* Edit Modal */}
            {isEditModalOpen && currentPosition && (
                <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">

                    <div className="bg-white p-6 rounded-lg shadow-lg w-1/2">
                        <h2 className="text-xl font-bold mb-4">Edit Position</h2>
                        <label className="block mb-2 text-sm font-medium text-gray-700">Name</label>
                        <input
                            type="text"
                            className="w-full border border-gray-300 rounded p-2 mb-4"
                            value={currentPosition.name}
                            onChange={(e) =>
                                setCurrentPosition({ ...currentPosition, name: e.target.value })
                            }
                        />
                        <label className="block mb-2 text-sm font-medium text-gray-700">Description</label>
                        <input
                            type="text"
                            className="w-full border border-gray-300 rounded p-2 mb-4"
                            value={currentPosition.description}
                            onChange={(e) =>
                                setCurrentPosition({ ...currentPosition, description: e.target.value })
                            }
                        />
                        <label className="block mb-2 text-sm font-medium text-gray-700">Current Parent</label>
                        <p>{currentPosition.parentPosition}</p>
                        <label className="block mb-2 text-sm font-medium text-gray-700">New Parent(leave blank if no change is needed)</label>


                        <select name="new_parent" id="new_parent"
                            className="w-[50%] border border-gray-300 rounded p-2 mb-4"
                            // value={selectedParentId ? selectedParentId : parents[0].id}
                            onChange={handleSelectChange}
                        ><option key={"majemkfsd"} value={""}></option>
                            {filteredParents ? filteredParents.map((parent) => {
                                return <option key={parent.id} value={parent.id}>{parent.name}</option>
                            }) : ""}

                        </select>

                        <div className="flex justify-end space-x-4">
                            <button
                                onClick={closeEditModal}
                                className="px-4 py-2 text-sm text-gray-700 bg-gray-200 rounded hover:bg-gray-300"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={() => {
                                    handleSaveChanges()

                                }}
                                className="px-4 py-2 text-sm text-white bg-blue-500 rounded hover:bg-blue-600"
                            >
                                Save Changes
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Delete Confirmation Modal */}
            {isDeleteModalOpen && (
                <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
                    <div className="bg-white p-6 rounded-lg shadow-lg w-1/3">
                        <h2 className="text-xl font-bold mb-4">Confirm Deletion</h2>
                        <p>Are you sure you want to delete this position?</p>
                        <div className="flex justify-end space-x-4 mt-6">
                            <button
                                onClick={closeDeleteModal}
                                className="px-4 py-2 text-sm text-gray-700 bg-gray-200 rounded hover:bg-gray-300"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={() => { handleDeleteConfirm(currentPosition.id) }}
                                className={`${deletePending ? "disabled" : ""} disabled:bg-slate-400 px-4 py-2 text-sm text-white bg-red-500 rounded hover:bg-red-600`}
                            >
                                {deletePending ? "Deleting" : "Yes, Delete"}

                            </button>
                        </div>
                    </div>
                </div>
            )}
            {toast && (
                <Toast
                    message={toast.message}
                    type={toast.type}
                    onClose={() => setToast(null)}
                />
            )}
        </div>
    );
};

export default PositionsTable;
