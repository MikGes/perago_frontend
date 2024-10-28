"use client"
import { useEffect, useState } from 'react';
import usePositionStore from "@/store";

function PositionNode({ position }) {

    const [isOpen, setIsOpen] = useState(false);

    const toggleOpen = () => setIsOpen(!isOpen);

    return (
        <div style={{ marginLeft: '20px' }}>
            <div onClick={toggleOpen} style={{ cursor: 'pointer' }}>
                {position.name} {position.children?.length > 0 && (isOpen ? '▼' : '►')}
            </div>
            {isOpen && position.children.length > 0 && (
                <div style={{ paddingLeft: '20px' }}>
                    {position.children.map((child) => (
                        <PositionNode key={child.id} position={child} />
                    ))}
                </div>
            )}
        </div>
    );
}

export default function PositionTree() {
    const positions = usePositionStore((state) => state.positions);
    const fetchPositions = usePositionStore((state) => state.fetchPositions);

    useEffect(() => {
        fetchPositions();
    }, [fetchPositions]);
    return (
        <div>
            <h1 className='text-lg p-2'>Organizational Structure</h1>
            {positions ? positions?.map((position) => (
                <PositionNode key={position.id} position={position} />
            )) : <p className='text-slate-400 text-center'>There are no positions to display</p>}
        </div>
    );
}
