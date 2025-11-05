"use client";

import { createContext, useContext, useState, ReactNode } from "react";
import { WarehouseItem } from "@/types/warehouse";
import { warehouseMockData } from "@/mocks/warehouse-mock";

interface WarehouseContextType {
  data: WarehouseItem[];
  addItem: (item: Omit<WarehouseItem, "id">) => void;
  updateItem: (id: string, item: Omit<WarehouseItem, "id">) => void;
  deleteItem: (id: string) => void;
}

const WarehouseContext = createContext<WarehouseContextType | undefined>(
  undefined
);

export function WarehouseProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<WarehouseItem[]>(warehouseMockData);

  const addItem = (item: Omit<WarehouseItem, "id">) => {
    const newItem: WarehouseItem = {
      id: String(Date.now()),
      ...item,
    };
    setData((prev) => [newItem, ...prev]);
  };

  const updateItem = (id: string, item: Omit<WarehouseItem, "id">) => {
    setData((prev) =>
      prev.map((i) => (i.id === id ? { ...item, id } : i))
    );
  };

  const deleteItem = (id: string) => {
    setData((prev) => prev.filter((i) => i.id !== id));
  };

  return (
    <WarehouseContext.Provider value={{ data, addItem, updateItem, deleteItem }}>
      {children}
    </WarehouseContext.Provider>
  );
}

export function useWarehouse() {
  const context = useContext(WarehouseContext);
  if (context === undefined) {
    throw new Error("useWarehouse must be used within a WarehouseProvider");
  }
  return context;
}
