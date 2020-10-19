const fs = require('fs');
const util = require('./utils');
const path = require('path');
const pjson = require('../../package.json');

var args = process.argv;

var changelogJsonTemplate = [{
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

var project = pjson.name;
var jsonLogFromPackage = path.resolve('../'+project+'/node_modules/changelog-writer/changelog.json');

//console.log("Action (args): ", args[2]+' '+args[3]);

//check if changelog.json has been created
if(fs.existsSync(jsonLogFromPackage)){
  const jsonfile = require(jsonLogFromPackage);

  switch(args[2]){
    case "type":
      util.askQuestionsForAnotherVersion(args[3], jsonfile, jsonLogFromPackage, changelogJsonTemplate);
    break;
    case "log":
      util.generateChangelogFile(jsonfile);
    break;
    default:
      // Check if file format is ok
      util.checkIfThisFileFormatIsOk(jsonfile);

      // Check if there is version value
      util.checkIfThereIsVersionOrDateValue(jsonfile, "version");

      // Check if there is date value
      //util.checkIfThereIsVersionOrDateValue(jsonfile, "date");

      // Ask question related to this
      util.askForTypeChangeQuestionOnly(jsonfile, jsonLogFromPackage, jsonfile.length-1);
    break;
  }

}else{
  // Get input version, date, type, Changes
  util.askAllQuestionsAtStart(changelogJsonTemplate, jsonLogFromPackage);
}
