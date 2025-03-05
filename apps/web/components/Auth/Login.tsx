"use client";
import React, { ChangeEvent, useState } from "react";
// import { Button, Input } from "@/Exports/UI";
import { signIn } from "next-auth/react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";


const Login = () => {
  const [meta, setMeta] = useState({
    uid: "",
    password: "",
  });

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    setMeta((prevMeta) => ({ ...prevMeta, [name]: value }));
  };

  const handleSubmit = async (e: SubmitEvent): Promise<any> => {
    e.preventDefault();

    const response = await signIn("credentials", {
      uid: meta.uid,
      password: meta.password,
      redirect: false,
    });
    console.log("repsonse", response);
    // toast.
  };

  return (
    <div className="flex-1 p-8 bg-white">
      <h2 className="text-2xl font-bold mb-6">Log In</h2>
      <form onSubmit={handleSubmit}>
        <Input
          type="text"
          name="uid"
          placeholder="UID"
          className="mb-4"
          onChange={handleInputChange}
        />
        <Input
          type="text"
          name="password"
          placeholder="Password"
          className="mb-4"
          onChange={handleInputChange}
        />
        <Button className="w-full" type="submit">
          Log In
        </Button>
      </form>
    </div>
  );
};

export default Login;
