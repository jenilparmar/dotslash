import { MongoClient } from "mongodb";
import { NextResponse } from "next/server";
import { sendReqToModel } from "./SendReqToModel.js";
import { HandleCrudFuncutions } from "./HandleCrudFuncations.js";

export async function POST(req) {
  try {
    // Extract data from the request body
    const { nameOfDB, nameOfCollection, paragraph, MongoDbUri, dataToInsert } =
      await req.json();
    console.log("Request data:", {
      nameOfDB,
      nameOfCollection,
      paragraph,
      MongoDbUri,
      dataToInsert,
    });

    // Validate the required parameters
    if (!nameOfDB || !nameOfCollection || !MongoDbUri || !paragraph) {
      return new NextResponse(
        JSON.stringify({
          success: false,
          message:
            "Missing required fields (nameOfDB, nameOfCollection, MongoDbUri, paragraph)",
        }),
        { status: 400 }
      );
    }

    
    // Send paragraph to model
    const responseFromModel = await sendReqToModel(paragraph);
    console.log("Response from sendReqToModel:", responseFromModel);
    
    const [intent, ...rest] = responseFromModel;
    if (String(intent).toLowerCase() == "update" && String(intent).toLowerCase() == "delete_conditioned_based") {
      if (dataToInsert.length == 0)
        return NextResponse(
          JSON.stringify({
            success: false,
            data: ["Nothing To Insert!!!"],
          })
        );
    }
    console.log("Intent:", intent);

    // Call CRUD handling function
    const resFromHandleCRUD = await HandleCrudFuncutions(
      intent,
      nameOfDB,
      nameOfCollection,
      MongoDbUri,
      paragraph,
      dataToInsert
    );
    console.log("Response from HandleCrudFuncutions:", resFromHandleCRUD);

    // Check if resFromHandleCRUD has a .json() method
    let resonse;
    if (typeof resFromHandleCRUD.json === "function") {
      resonse = await resFromHandleCRUD.json();
    } else {
      resonse = resFromHandleCRUD; // Assuming it's already parsed
    }
    console.log("Parsed response:", resonse);

    // Respond with the data
    return new NextResponse(JSON.stringify({ success: true, data: resonse }), {
      status: 200,
    });
  } catch (error) {
    console.error("Error in POST function:", error);
    return new NextResponse(
      JSON.stringify({ success: false, message: error.message }),
      { status: 500 }
    );
  }
}
