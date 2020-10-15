const readline = require('readline');
const fs = require('fs');

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

function checkIfThisFileFormatIsOk(jsonfile){
  console.log("file:",jsonfile);
  let state = false;
  let checklist = [];

  // First check: Is the file content array
  if(Array.isArray(jsonfile)){
    checklist.push(1);
    console.log("checked: File content is an array");
  }

  // Second check: Is the array elements json objects
  jsonfile.forEach((json) => {
    if(isJson(json)){
      checklist.push(1);
      console.log("checked: File array elements are json objects");
    }
  });

  // Third check: Is version, date and type well defined
  if(isVersionOrDateWellDefined(jsonfile, "version")){
    checklist.push(1);
  }
  if(isVersionOrDateWellDefined(jsonfile, "date")){
    checklist.push(1);
  }
  if(isTypeWellDefined(jsonfile)){
    checklist.push(1);
  }
  console.log(checklist);
}

function checkIfItExists(jsonfile, key, value){
  /*
  * This applies to only version and date
  *
  * Check if the version or date specified already exists
  */
  console.log("file:",jsonfile);
  let state = false;
  jsonfile.forEach((json) => {
    console.log("json-key:",Object.keys(json));
    // Check if key exists and confirm keyname
    Object.keys(json).forEach((keyName) => {
      if(keyName === key){
        console.log("key-item:",key);
        if(json[key] === value){
          state = true;
        }
      }
    });
  });
  return state;
}

function checkIfThereIsVersionOrDateValue(jsonfile, key){
  let jsonlist = [];
  let state = false;
  jsonfile.forEach((json) => {
    if(json.version && key === "version"){
      jsonlist.push(1);
    }else if(json.date && key === "date"){
      jsonlist.push(1);
    }
  });
  if(jsonlist.length === jsonfile.length){
    state = true;
    console.log("checked: "+key+" value is given");
  }
  return state;
}
//
function addChangedItem(type, changelog){
  // Split
  type = type.split('=');
  items = type[1].slice(1,-1).split(',');

  switch(type[0]){
    case "added":
      items.forEach(function(item){
        changelog.type.added.push(item);
      });
    break;
    case "changed":
      items.forEach(function(item){
        changelog.type.changed.push(item);
      });
    break;
    case "deprecated":
      items.forEach(function(item){
        changelog.type.deprecated.push(item);
      });
    break;
    case "removed":
      items.forEach(function(item){
        changelog.type.removed.push(item);
      });
    break;
    case "fixed":
      items.forEach(function(item){
        changelog.type.fixed.push(item);
      });
    break;
    case "security":
      items.forEach(function(item){
        changelog.type.security.push(item);
      });
    break;
  }
}

function isVersionOrDateWellDefined(jsonfile, key){
  /*
  *
  * Check if the version or date is defined well
  */
  let jsonlist = [];
  let state = false;
  jsonfile.forEach((json) => {
    Object.keys(json).forEach((keyName) => {
        if(keyName === key && typeof json.version === "string"){
          jsonlist.push(1);
        }else if(keyName === key && typeof json.date === "string"){
          jsonlist.push(1);
        }
    });
  });
  if(jsonlist.length === jsonfile.length){
    state = true;
    console.log("checked: "+key+" is well defined");
  }
  return state;
}

function isTypeWellDefined(jsonfile){
  /*
  *
  * Check if the type is defined well
  */
  let jsonlist = [];
  let state = false;
  jsonfile.forEach((json) => {
    Object.keys(json).forEach((keyName) => {
        if(keyName === "type" && typeof json.type === "object"){
          jsonlist.push(1);
        }
    });
  });
  if(jsonlist.length === jsonfile.length){
    state = true;
    console.log("checked: type is well defined");
  }
  return state;
}

function isJson(item) {
    item = typeof item !== "string"
        ? JSON.stringify(item)
        : item;

    try {
        item = JSON.parse(item);
    } catch (e) {
        return false;
    }

    if (typeof item === "object" && item !== null) {
        return true;
    }
    return false;
}

function askForTypeChangeQuestionOnly(jsonfile){
  rl.question(`Specify change (added, changed, deprecated, removed, fixed, security):`, (type) => {
    addChangedItem(type, jsonfile[0]);
    fs.writeFile('./changelog.json', JSON.stringify(jsonfile), (err) => {
      if(err) console.log("write error: "+err);
      console.log("update successful");
      askForTypeChangeQuestionOnly(jsonfile);
    });
  });
}

function askAllQuestionsAtStart(changelog){
  rl.question(`Enter version (ex. 1.0.0):`, (version) => {
    rl.question(`Enter date (ex. 14-10-2020):`, (date) => {
      rl.question(`Specify change (added, changed, deprecated, removed, fixed, security):`, (type) => {

        // Add data to array and json
        changelog[0].version = version;
        changelog[0].date = date;

        addChangedItem(type, changelog[0]);

        fs.writeFileSync('./changelog.json', JSON.stringify(changelog), { flag: 'wx' });
        console.log("write successful");
        askForTypeChangeQuestionOnly(changelog);
      });
    });
  });
}

function askQuestionsForAnotherVersion(jsonfile, changelog){
  rl.question(`Enter version (ex. 1.0.0):`, (version) => {
    rl.question(`Enter date (ex. 14-10-2020):`, (date) => {
      rl.question(`Specify change (added, changed, deprecated, removed, fixed, security):`, (type) => {

        // Add data to array and json
        changelog[0].version = version;
        changelog[0].date = date;

        addChangedItem(type, changelog[0]);
        jsonfile[jsonfile.length] = changelog[0];

        fs.writeFileSync('./changelog.json', JSON.stringify(jsonfile));
        console.log("write successful", jsonfile);
        askForTypeChangeQuestionOnly(jsonfile);
      });
    });
  });
}

module.exports = {
  checkIfThisFileFormatIsOk,
  checkIfItExists,
  checkIfThereIsVersionOrDateValue,
  addChangedItem,
  isVersionOrDateWellDefined,
  isTypeWellDefined,
  askForTypeChangeQuestionOnly,
  askAllQuestionsAtStart,
  askQuestionsForAnotherVersion
}