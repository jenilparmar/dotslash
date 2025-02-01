import { createDb } from "../CreateDb/route";
import { DeleteCollection } from "../DeleteCollection/route";
import { DeleteConditionBased } from "../DeleteConditionBased/route";
import { insertData } from "../InsertData/route";
import { readAllData } from "../ReadAllData/route";
import { readConditionData } from "../ReadConditionBased/route";
import { updateData } from "../Update/route";
import { parseQuery } from "../../../../samarth/ExtraFuncation_Jenil/Read_Condition_based";
// data = [dataTOInsert , atrbs  , changeAtrbs]

export async function HandleCrudFuncutions(
  intent,
  nameOfDB,
  nameOfCollection,
  MongoDbUri,
  paragraph,
  ...data
) {
  if (String(intent).toLowerCase() === "create") {
    const res = await createDb(nameOfDB, nameOfCollection, data[0], MongoDbUri);
    return true;
  } 
  else if (String(intent).toLowerCase() === "read") {
    const res = await readAllData(nameOfDB, nameOfCollection, MongoDbUri);
    const responseFromNextServer =  res;

    return responseFromNextServer;
  } 
  else if (String(intent).toLowerCase() === "delete") {
    const res = await DeleteCollection(nameOfDB, nameOfCollection, MongoDbUri);
    const responseFromNextServer = res;
    return responseFromNextServer;
  } 
  else if (String(intent).toLowerCase() === "delete_conditioned_based") {
    const filter = parseQuery(paragraph)
    const res = await DeleteConditionBased(
      nameOfDB,
      nameOfCollection,
      filter,
      MongoDbUri
    );
    const responseFromNextServer =  res;
    return responseFromNextServer;
  } 
  else if (String(intent).toLowerCase() === "read_condition_based_data") {
    const filter = parseQuery(paragraph);

    const res = await readConditionData(
      nameOfDB,
      nameOfCollection,
      filter,
      MongoDbUri
    );
    const responseFromNextServer =  res;
    return responseFromNextServer;
  } else if (String(intent).toLowerCase() === "insert") {
    const res = await insertData(
      nameOfDB,
      nameOfCollection,
      data[0],
      MongoDbUri
    );
    const responseFromNextServer =  res;
    return responseFromNextServer;
  } else {
    const filter = parseQuery(paragraph)
    ////updation;
    const res = await updateData(
      nameOfDB,
      nameOfCollection,
      filter,
      data[0],
      MongoDbUri
    );
    const responseFromNextServer =  res;
    return responseFromNextServer;
  }
}
