import React, { useEffect, useState } from "react";

interface Room {
  id: number;
  title: string;
  main_image_url: string;
  price: number;
  location: string;
  max_people: number;
}

interface APIResponse {
  results: Room[];
}

function RoomList() {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("http://localhost:8000/api/rooms/") // endpoint backend
      .then((res) => {
        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`);
        }
        return res.json();
      })
      .then((data: APIResponse) => {
        setRooms(data.results);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setError(err.message);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center p-8">
        <div className="text-lg">Loading rooms...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center p-8">
        <div className="text-red-500">Error: {error}</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">Available Rooms</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {rooms.map((room) => (
          <div key={room.id} className="border rounded p-4 shadow">
            <h2 className="text-lg font-bold">{room.title}</h2>
            <img
              src={room.main_image_url}
              alt={room.title}
              className="w-full h-48 object-cover rounded"
              onError={(e) => {
                // Fallback to placeholder if image fails to load
                e.currentTarget.src = '/placeholder.jpg';
              }}
            />
            <p className="mt-2">💰 {room.price.toLocaleString()} VNĐ</p>
            <p>📍 {room.location}</p>
            <p>👥 Tối đa {room.max_people} người</p>
          </div>
        ))}
      </div>
      
      {rooms.length === 0 && (
        <div className="text-center py-8">
          <p className="text-gray-500">No rooms available</p>
        </div>
      )}
    </div>
  );
}

export default RoomList;