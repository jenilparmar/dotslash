import React from "react";
import { BsDatabaseFillAdd } from "react-icons/bs";

const Databases = ({ name , setDbname }) => {
  return (
    <div className="w-full h-10 flex flex-row justify-between hover:bg-[#292929] transition-all px-2 rounded-2xl duration-150">
      <p className="self-center text-sm">{name}</p> <BsDatabaseFillAdd className=" text-sm self-center"/>
    </div>
  );
};

export default Databases;
