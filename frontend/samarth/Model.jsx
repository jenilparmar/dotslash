"use client";
import React, { useState } from "react";

const Model = () => {
  const [fields, setFields] = useState([]);

  const addField = () => {
    setFields([
      ...fields,
      {
        fieldName: "",
        fieldType: "String",
        isRequired: false,
        defaultValue: "",
      },
    ]);
  };

  const updateField = (index, key, value) => {
    const updatedFields = fields.map((field, i) =>
      i === index ? { ...field, [key]: value } : field
    );
    setFields(updatedFields);
  };

  const removeField = (index) => {
    setFields(fields.filter((_, i) => i !== index));
  };

  const handleSubmit = () => {
    const schemaObject = fields.reduce((acc, field) => {
      acc[field.fieldName] = {
        type: field.fieldType,
        required: field.isRequired,
        ...(field.defaultValue && { default: field.defaultValue }),
      };
      return acc;
    }, {});

    console.log("Generated Schema:", schemaObject);

    fetch("/api/create-schema", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ schema: schemaObject }),
    })
      .then((res) => res.json())
      .then((data) => {
        alert("Schema submitted successfully!");
        console.log(data);
      })
      .catch((err) => {
        console.error("Error:", err);
        alert("An error occurred.");
      });
  };

  return (
    <div className="p-6 max-w-xl mx-auto bg-white rounded shadow">
      <h1 className="text-2xl font-bold mb-4">MongoDB Schema Builder</h1>
      {fields.map((field, index) => (
        <div key={index} className="mb-4 border p-4 rounded bg-gray-50">
          <div className="flex gap-4 mb-2">
            <input
              type="text"
              placeholder="Field Name"
              className="border p-2 flex-1 rounded"
              value={field.fieldName}
              onChange={(e) => updateField(index, "fieldName", e.target.value)}
            />
            <select
              className="border p-2 rounded"
              value={field.fieldType}
              onChange={(e) => updateField(index, "fieldType", e.target.value)}
            >
              <option value="String">String</option>
              <option value="Number">Number</option>
              <option value="Boolean">Boolean</option>
              <option value="Date">Date</option>
              <option value="Object">Object</option>
              <option value="Array">Array</option>
            </select>
          </div>
          <div className="flex gap-4 mb-2">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={field.isRequired}
                onChange={(e) =>
                  updateField(index, "isRequired", e.target.checked)
                }
              />
              Required
            </label>
            <input
              type="text"
              placeholder="Default Value"
              className="border p-2 flex-1 rounded"
              value={field.defaultValue}
              onChange={(e) =>
                updateField(index, "defaultValue", e.target.value)
              }
            />
          </div>
          <button
            className="text-red-500 text-sm"
            onClick={() => removeField(index)}
          >
            Remove Field
          </button>
        </div>
      ))}
      <button
        className="bg-blue-500 text-white px-4 py-2 rounded mb-4"
        onClick={addField}
      >
        Add Field
      </button>
      <button
        className="bg-green-500 text-white px-4 py-2 rounded"
        onClick={handleSubmit}
      >
        Submit Schema
      </button>
    </div>
  );
};

export default Model;
