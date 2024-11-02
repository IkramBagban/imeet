import React from "react";
import { Button, Input } from "@/Exports/UI";

const Login = () => {
  return (
    <div className="flex-1 p-8 bg-white">
      <h2 className="text-2xl font-bold mb-6">Log In</h2>
      <Input type="text" placeholder="UID"  className="mb-4" />
      <Input type="text" placeholder="Password" className="mb-4" />
      <Button className="w-full">Log In</Button>
    </div>
  );
};

export default Login;
