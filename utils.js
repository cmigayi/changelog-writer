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

  // DateTime
  let dateTime = formatDate(new Date());

  switch(type[0]){
    case "added":
      items.forEach(function(item){
        changelog.type.added.push(dateTime+':'+item);
      });
    break;
    case "changed":
      items.forEach(function(item){
        changelog.type.changed.push(dateTime+':'+item);
      });
    break;
    case "deprecated":
      items.forEach(function(item){
        changelog.type.deprecated.push(dateTime+':'+item);
      });
    break;
    case "removed":
      items.forEach(function(item){
        changelog.type.removed.push(dateTime+':'+item);
      });
    break;
    case "fixed":
      items.forEach(function(item){
        changelog.type.fixed.push(dateTime+':'+item);
      });
    break;
    case "security":
      items.forEach(function(item){
        changelog.type.security.push(dateTime+':'+item);
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

function updateVersion(changeType, jsonfile){
  version = jsonfile[jsonfile.length-1].version;
  versions = version.split('.');
  switch(changeType){
    case "patch":
      patch = Number(versions[2])+1;
      version = versions[0]+'.'+versions[1]+'.'+patch;
    break;
    case "minor":
      minor = Number(versions[1])+1;
      version = versions[0]+'.'+minor+'.'+versions[2];
    break;
    case "major":
      major = Number(versions[0])+1;
      version = major+'.'+versions[1]+'.'+versions[2];
    break;
  }
  return version;
}

function askForTypeChangeQuestionOnly(jsonfile, position){
  rl.question(`Specify change (added, changed, deprecated, removed, fixed, security):`, (type) => {
    addChangedItem(type, jsonfile[position]);
    fs.writeFile('./changelog.json', JSON.stringify(jsonfile), (err) => {
      if(err) console.log("write error: "+err);
      console.log("update successful");
      askForTypeChangeQuestionOnly(jsonfile, position);
    });
  });
}

function askAllQuestionsAtStart(changelog){
  rl.question(`Enter initial version (ex. 1.0.0):`, (version) => {
    //rl.question(`Enter date (ex. 14-10-2020):`, (date) => {
      rl.question(`Specify change (added, changed, deprecated, removed, fixed, security):`, (type) => {

        // Add data to array and json
        changelog[0].version = version;
        //changelog[0].date = date;

        addChangedItem(type, changelog[0]);

        fs.writeFileSync('./changelog.json', JSON.stringify(changelog), { flag: 'wx' });
        console.log("write successful");
        askForTypeChangeQuestionOnly(changelog, 0);
      });
  //  });
  });
}

function askQuestionsForAnotherVersion(changeType, jsonfile, changelog){
//  rl.question(`Enter version (ex. 1.0.0):`, (version) => {
    //rl.question(`Enter date (ex. 14-10-2020):`, (date) => {
      rl.question(`Specify change (added, changed, deprecated, removed, fixed, security):`, (type) => {

        // Add data to array and json
        changelog[0].version = updateVersion(changeType, jsonfile);
      //  changelog[0].date = date;

        addChangedItem(type, changelog[0]);
        jsonfile[jsonfile.length] = changelog[0];

        fs.writeFileSync('./changelog.json', JSON.stringify(jsonfile));
        console.log("write successful", jsonfile);
        askForTypeChangeQuestionOnly(jsonfile, jsonfile.length);
      });
  //  });
//  });
}

function generateChangelogFile(jsonfile){
  let template  = changelogTemplate(jsonfile);
  if(fs.existsSync('./CHANGELOG.md')){
    fs.writeFileSync('./CHANGELOG.md', template);
    console.log("update successful");
  }else{
    fs.writeFileSync('./CHANGELOG.md', template, { flag: 'wx' });
    console.log("write successful");
  }
}

function changelogTemplate(jsonfile){
  let template = "\# Changelog \r\n"+
  "All notable changes to this project will be documented in this file.\r\n"+
  "The format is based on Keep a Changelog and this project adheres to Semantic Versioning."+
  "\r\n\r\n";

  jsonfile.forEach((json)=>{
    let typeKeys = Object.keys(json.type);

    template+="## \["+json.version+"\] \-date \r\n"+
    "### "+typeKeys[0]+"\r\n";

    json.type.added.forEach((content)=>{
      let contents = content.split(':');
      template += "* "+contents[0]+": "+contents[1]+"\r\n";
    });

    json.type.changed.forEach((content)=>{
      template += "* "+content+"\r\n";
    });

    json.type.deprecated.forEach((content)=>{
      template += "* "+content+"\r\n";
    });

    json.type.removed.forEach((content)=>{
      template += "* "+content+"\r\n";
    });

    json.type.fixed.forEach((content)=>{
      template += "* "+content+"\r\n";
    });

    json.type.security.forEach((content)=>{
      template += "* "+content+"\r\n";
    });

    template += "\r\n\r\n";
  });

  return template;
}

function formatDate(date_ob){
  // adjust 0 before single digit date
  let date = date_ob.getDate();
  if(date.length == 1){
    date = "0" + date;
  }

  // current month
  let month = date_ob.getMonth() + 1;
  if(month.length == 1){
    month = "0" + month;
  }

  // current year
  let year = date_ob.getFullYear();

  return year + "-" + month + "-" + date;
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
  askQuestionsForAnotherVersion,
  generateChangelogFile
}
