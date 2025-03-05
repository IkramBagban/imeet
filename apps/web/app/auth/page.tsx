import React from "react";

// import Signup from "../../Components/Auth/Signup";
import Login from "../../components/Auth/Login";
import Signup from "../../components/Auth/Signup";
// import Login from "@/Components/Auth/Login";

const Auth = () => {
  return (
    <div className="flex items-center justify-center min-h-screen  bg-background">
      <div className="flex border rounded-lg  overflow-hidden w-3/4 md:w-1/2">
        {/* Sign Up Section */}

        <Signup />
        <div className="w-px bg-gray-300"></div>

        {/* Log In Section */}
        <Login />
      </div>
    </div>
  );
};

export default Auth;
