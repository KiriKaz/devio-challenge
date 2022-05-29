export const toJSON = (document: any, returnedObj: any) => {
  returnedObj.id = returnedObj._id.toString();
  delete returnedObj._id;
  delete returnedObj.__v;
};