/**
 * @file: appstore.js
 * @description: This module contains all the methods and functions needed
 *               to store the application, user or session data.
 *               The module contains The following class:
 *                @class {AppStore} which in turn contains the following
 *               methods:
 *                  1. {load} load the data from disk store. generally used
 *                            in application startup. @private
 *                  2. {save} save the collected data into disk store. usually
 *                            after application quit. @private
 *                  3. {set} set the given data with its keyword in the
 *                           datastructure.
 *                  4. {get} get data from the datastructure given the keyword.
 *                  5. {unset} delete data associated with the given keyword.
 *  @author: ...
 */

const fileSystem = require('fs');
const path = require('path');

// root directory for app data files
const dataDirPath = path.join(__dirname, './../../app/appData/');

// default file for storing window and sessiong info.
const windowStateFileName = 'window.json';

var exports = module.exports = {}; // export data structure.

/**
 * @class: AppStore.
 * @private:
 *          @var: dataDirPath, path to directory for data store.
 *                 windowStateFileName, filename for storing the window state.
 *          @static: save, load.
 * @instance @var: dataFromFilePath, a datastructure containing the data.
 *                 filePath, a reference to the file used for storing data.
 * @instance @method: set, get, and unset.
 *
 * @example: var storeObj = new AppStore(relativePathToFile);
 *           // will create an AppStore object and load in its instance variable
 *           // data the content of relativePathToFile.
 *           // if no content is there load empty datastructure.
 */
exports.AppStore = function(fileName) {
  /**
   * @param: fileName(String), file used for storing data.
   *         sync(boolean), if true sychronously create and instance of the class.
   *         done (function), callback to be called after an asynchronous setup.
   * @description: if the file exist, then load the data in it, into the instance
   *               variable appDataFromFile.
   *               else just load and empty object.
   */
    fileName = fileName || windowStateFileName; // default is window.json.
    this.filePath = path.join(dataDirPath, fileName); // default is ./../app/appData/window.json.
    var _dataFromFile = null; // initialise the datastructure.

  /**
   * @name: loadFromFile
   * @param: sync (boolean), if true operations will be performed synchronously.
   *         done (function), if sync is false, a callback to be called after it finished loading.
   *              it will be passed the the class instance as the first argument.
   * @description: asynchronously load data into appDataFromFile if it is not loaded.
   * @return: this, the calling object, if sync if true else none.
   *          we are not returning anything in case of async because, non-sequential
   *          execution can result in returning a stale object instance.
   */
  this.loadFromFile =  () => {

    //sync = sync ? true: false; // default is true.
    //done = sync? null: done;

    // if data has been loaded
    if (_dataFromFile!=null) {
      return this;
    }

    // if the file doesn't exists.
    if (!fileSystem.existsSync(this.filePath)) {
      // load an empty datastructure.
      _dataFromFile = {};
      return this;
    }
      
    //if (sync) {
    let fileObject = fileSystem.readFileSync(this.filePath, 'utf-8');
    _dataFromFile = JSON.parse(fileObject);
    return this; // to make method chaining possible
    //}
    //else {
    //  let outerReference = this;
    //  fileSystem.readFile(this.filePath, 'utf-8', (error, data) => {
    //    if (error) throw error;
    //    outerReference.dataFromFile = data;
    //    if (typeof done === 'function') done.apply(outerReference);
    //    else throw new AppStoreError(`AppStore.loadFromFiles: recieved a ${typeof done} in place of a callback as an argument.`, 'Argument Error!');
    //  });
    //} // end of if sync.
  }

  /**
   * @name: saveToFile
   * @param: sync (boolean), if true operations will be performed synchronously.
   *         done (function), a callback to be called after it finished loading.
   *              the current object instace will be passed as the first argument.
   * @description: asynchronously load data into appDataFromFile if it is not loaded.
   * @return: nothing.
   */
  this.saveToFile = () => {
    //sync = sync || true;
    //done = sync ? null: done;
    let dataObject = JSON.stringify(_dataFromFile);
    if (!dataObject) return;
    //if (sync) {
    fileSystem.writeFileSync(this.filePath, dataObject);
    //}
    //else {
    //  let outerReference = this;
    //  fileSystem.writeFile(this.filePath, dataObject, options, (error, data) => {
    //    if (error) throw error;
    //    if (typeof done === 'function') done(outerReference); // run the callback passed.
    //    else throw new AppStoreError(`AppStore.saveToFile: recieved a ${typeof done} in place of a callback as an argument.`, 'Argument Error!');
    //  });
    //} // end of if (sync).
  }

  /**
   * @name: setData
   * @param {} key : key to be stored in this.dataFromFile.
   * @param {*} value : an object containing data. 
   * @returns: this for method chaining.
   */
  this.setData = (key, value) => {
    _dataFromFile[key] = value;
    return this;
  }

  /**
   * @name : getData
   * @param {} key : key to be searched.
   * @returns : the this.dataFromFile[key], if exists. 
   */
  this.getData = (key) => {
    return key in _dataFromFile ? _dataFromFile[key]: null;
  }

  this.getAllData = () => {
    return _dataFromFile;
  }

  /**
   * @name: unsetKeyFromData.
   * @param {*} key 
   * @returns : this
   */
  this.unsetKeyFromData = (key) => {
    if (key in _dataFromFile) delete _dataFromFile[key];
    return this;
  }

  /**
   * @name: unsetAllData.
   * @description: remove all data in the datastructure.
   * @return: this.
   */
  this.unsetAllData = () => {
    _dataFromFile = null;
    return this;
  }

  if (fileName) this.loadFromFile();
}

/**
 * @name: AppStoreError
 * @description: Error class for this module.
 */
class AppStoreError extends Error {
  /**
   * Constructor for this class.
   * @param {*} message : message to be passed.
   * @param {*} name : name of the error.
   */
  constructor (message, name) {
    super(message);
    this.name = name;
  }
}