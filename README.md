# changelog-writer
A tool to help you generate or write your project changelog file

## How to use changelog-writer
### Installation
Inside your project run this command to install changelog-witer:
> sudo npm install changelog-writer --save 

### Start
For the first input run this command:
> npm run change
* You will asked to "Enter initial version (ex 1.0.0):"
* Key in your initial version, then press ENTER.
* Next, you be asked "Specify change (added, changed, deprecated, removed, fixed, security):"
* Here use the following format to input the type of change you want to log:
added=[created login function, created registration form, created a validation function]
* Once you press ENTER, a "write successful" message should appear.
* Next, Next, you be asked "Specify change (added, changed, deprecated, removed, fixed, security):"
* Repeat

### Input change
For inputs after the first session:
* npm run change type <SPECIFY INPUT TYPE>
* INPUT TYPES: patch, minor, major
* For PATCH: Inputs will can be FIXED,CHANGED or REMOVED and the command should be "fixed=[bug1,bug2, etc..]"
* For MINOR: Inputs will can be ADDED, CHANGED, DEPRECATED, SECURITY and the command should be "added=[feature1, feature2, etc..]".  
