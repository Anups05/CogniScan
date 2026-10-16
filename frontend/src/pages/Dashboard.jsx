import React from "react";
import { useStore } from "../store/useStore";
import PatientDashboard from "./PatientDashboard";
import CaregiverDashboard from "./caregiver/CaregiverDashboard";

// Dashboard routes to the correct view based on the stored role.
// The role is set correctly at login time in Login.jsx.
const Dashboard = () => {
  const role = useStore((state) => state.role);

  if (role === "caregiver") {
    return <CaregiverDashboard />;
  }
  return <PatientDashboard />;
};

export default Dashboard;
