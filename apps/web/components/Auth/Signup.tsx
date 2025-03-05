"use client";

import React, { ChangeEvent, useState } from "react";
import axios from "axios";
// import { Button, Input } from "@/Exports/UI";


// import { generateUID } from "@/Utils/generateUID";

import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { generateUID } from "../../Utils/generateUID";

const Signup = () => {
  const [meta, setMeta] = useState(() => ({
    name: "",
    password: "",
    uid: generateUID(),
  }));

  console.log("meta==>", meta);

  // useEffect(() => {
  //   const generateUID;
  // }, []);

  const handleInputChange = (e: ChangeEvent) => {
    const { name, value } = e.target;

    setMeta((prevMeta) => ({ ...prevMeta, [name]: value }));
  };

  const handleSubmit = async (e: SubmitEvent): Promise<any> => {
    e.preventDefault();

    console.log("submit clicked");
    const response = await axios.post("/api/auth/signup", meta);
    console.log("repsonse", response);
    // toast.
  };

  return (
    <div className="flex-1 p-8 bg-white">
      <h2 className="text-2xl font-bold mb-6">Sign Up</h2>
      <form onSubmit={handleSubmit}>
        <Input
          type="text"
          placeholder="UID"
          value={meta.uid}
          disabled={true}
          name="uid"
          className="mb-4"
        />
        <Input
          type="text"
          placeholder="Enter your Name"
          value={meta.name}
          onChange={handleInputChange}
          name="name"
          className="mb-4"
        />
        <Input
          type="text"
          placeholder="Enter your password"
          value={meta.password}
          name="password"
          onChange={handleInputChange}
          className="mb-4"
        />
        <Button className="w-full" type="submit">
          Create Account
        </Button>
      </form>
    </div>
  );
};

export default Signup;
