// src/components/Tabs.jsx
import React, { createContext, useContext, useState } from "react";

// 1. Context shared across all tab components
const TabsContext = createContext(null);

// 2. Tabs container component
export const Tabs = ({ defaultValue, children }) => {
  const [value, setValue] = useState(defaultValue);
  return (
    <TabsContext.Provider value={{ value, setValue }}>
      <div>{children}</div>
    </TabsContext.Provider>
  );
};

// 3. Tabs list wrapper (e.g., a horizontal row of tab buttons)
export const TabsList = ({ children, className }) => {
  return <div className={className}>{children}</div>;
};

// 4. Tabs trigger button
export const TabsTrigger = ({ value: tabValue, children }) => {
  const context = useContext(TabsContext);
  if (!context) throw new Error("TabsTrigger must be used inside Tabs");

  const { value, setValue } = context;
  const isActive = value === tabValue;

  return (
    <button
      onClick={() => setValue(tabValue)}
      className={`px-4 py-2 rounded-md transition ${
        isActive ? "bg-blue-500 text-white" : "bg-gray-200 text-black"
      }`}
    >
      {children}
    </button>
  );
};

// 5. Tabs content
export const TabsContent = ({ value: contentValue, children, className }) => {
  const context = useContext(TabsContext);
  if (!context) throw new Error("TabsContent must be used inside Tabs");

  const { value } = context;

  if (value !== contentValue) return null;

  return <div className={className}>{children}</div>;
};
