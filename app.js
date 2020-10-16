const fs = require('fs');
const util = require('./utils');

var args = process.argv;

var changelog = [{
  "version": "",
  "date": "",
  "type": { // added, changed, deprecated, removed, fixed, security
    "added": [],
    "changed": [],
    "deprecated": [],
    "removed": [],
    "fixed": [],
    "security": []
  }
}];

console.log("Action (args): ", args[2]+' '+args[3]);

//check if changelog.json has been created
if(fs.existsSync('./changelog.json')){
  const jsonfile = require('./changelog.json');

  switch(args[2]){
    case "type":
      util.askQuestionsForAnotherVersion(args[3], jsonfile, changelog);
    break;
    default:
      // Check if file format is ok
      util.checkIfThisFileFormatIsOk(jsonfile);

      // Check if there is version value
      util.checkIfThereIsVersionOrDateValue(jsonfile, "version");

      // Check if there is date value
      //util.checkIfThereIsVersionOrDateValue(jsonfile, "date");

      // Ask question related to this
      util.askForTypeChangeQuestionOnly(jsonfile, jsonfile.length-1);
    break;
  }

}else{
  // Get input version, date, type, Changes
  util.askAllQuestionsAtStart(changelog);
}
