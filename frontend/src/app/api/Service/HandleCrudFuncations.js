import { createDb } from "../CreateDb/route";
import { DeleteCollection } from "../DeleteCollection/route";
import { DeleteConditionBased } from "../DeleteConditionBased/route";
import { insertData } from "../InsertData/route";
import { readAllData } from "../ReadAllData/route";
import { readConditionData } from "../ReadConditionBased/route";
import { updateData } from "../Update/route";
import { parseQuery } from "../../../../samarth/ExtraFuncation_Jenil/Read_Condition_based";
import { ExtractDataFromPara } from "../InsertData/ExtractDataFromInsert";
// data = [dataTOInsert , atrbs  , changeAtrbs]

export async function HandleCrudFuncutions(
  intent,
  nameOfDB,
  nameOfCollection,
  MongoDbUri,
  paragraph,
 
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
    const dataTOInsert = ExtractDataFromPara(paragraph);


    const res = await insertData(
      nameOfDB,
      nameOfCollection,
      dataTOInsert,
      MongoDbUri
    );
    const responseFromNextServer =  res;
    return responseFromNextServer;
  } else {
    const filter = parseQuery(paragraph)
    const dataTOInsert = ExtractDataFromPara(paragraph);
    const res = await updateData(
      nameOfDB,
      nameOfCollection,
      filter,
      dataTOInsert,
      MongoDbUri
    );
    const responseFromNextServer =  res;
    return responseFromNextServer;
  }
}
