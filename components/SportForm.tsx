"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

const SportForm = () => {
  const router = useRouter();
  const startingSportData = {
    name: "",
    description: "",
    imageUrl: "",
    status: 0,
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setSportData((prev) => ({
      ...prev,
      [name]: name === "status" ? Number(value) : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const data = Object.fromEntries(formData.entries());
    const response = await fetch("/api/sports", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });
    if (response.ok) {
      setSportData(startingSportData);
      router.push("/sports");
    } else {
      const error = await response.json();
      console.error("Error:", error);
    }
  };

  const [sportData, setSportData] = useState(startingSportData);
  return (
    <div className="flex justify-center items-center h-screen">
      <form
        className="flex flex-col gap-4 w-1/2"
        method="POST"
        onSubmit={handleSubmit}
      >
        <input
          type="text"
          name="name"
          id="name"
          placeholder="Sport Name"
          value={sportData.name}
          onChange={handleChange}
          required={true}
          className="border border-gray-300 p-2 rounded"
        />
        <input
          type="text"
          name="description"
          id="description"
          placeholder="Description"
          value={sportData.description}
          onChange={handleChange}
          required={true}
          className="border border-gray-300 p-2 rounded"
        />
        <input
          type="text"
          name="imageUrl"
          id="imageUrl"
          placeholder="img URL"
          value={sportData.imageUrl}
          onChange={handleChange}
          required={true}
          className="border border-gray-300 p-2 rounded"
        />
        <input
          type="number"
          name="status"
          id="status"
          placeholder="Status (0 or 1)"
          value={sportData.status}
          onChange={handleChange}
          required={true}
          className="border border-gray-300 p-2 rounded"
        />
        <button type="submit" className="bg-blue-500 text-white p-2 rounded">
          Submit
        </button>
      </form>
    </div>
  );
};

export default SportForm;
