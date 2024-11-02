import React from "react";
import { Button, Input } from "@/Exports/UI";
import { generateUID } from "@/Utils/generateUID";

const Signup = () => {
  return (
    <div className="flex-1 p-8 bg-white">
      <h2 className="text-2xl font-bold mb-6">Sign Up</h2>
      <Input
        type="text"
        value={generateUID()}
        disabled={true}
        className="mb-4"
      />
      <Input type="text" placeholder="Password" className="mb-4" />
      <Button className="w-full">Create Account</Button>
    </div>
  );
};

export default Signup;
