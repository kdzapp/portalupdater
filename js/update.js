//Check Database for Update
function checkForUpdate() {
  document.getElementById("status").innerHTML = "Checking for Update...";
  var db = firebase.firestore();
  db.settings({ timestampsInSnapshots: true });
  var appInfo = db.collection("app").doc("info");

  return new Promise(resolve => {
    appInfo.get().then(function(info) {
      if (info.exists) {
        resolve(info.data().build);
      } else {
        reject(Error("No such document!"))
      }
    });
  });
}

function getOs() {
  var os = require('os');
  var platform = os.platform()
  if(platform == "darwin") {
    //return "mac"; // Currently Mac not supported
    return null;
  } else if(platform == "win32") {
    var arch = os.arch();
      if(arch == "x32" || arch == "arm") {
        return "win32";
      } else {
        return "win64";
      }
  } else {
    // Not Supported OS
    return null;
  }
}

function InstallUpdate(build_version) {
  //Unzip & Save
  document.getElementById("status").innerHTML = "Installing...";

  var DecompressZip = require('decompress-zip');
  var unzipper = new DecompressZip("./install.zip");

  // Add the error event listener
  unzipper.on('error', function (err) {
      console.log('ERROR', err);
  });

  // Notify when everything is extracted
  unzipper.on('extract', function (log) {
      console.log('Finished extracting', log);
      require('fs').unlinkSync("install.zip"); //Clean up Zip
      //win.setProgressBar(1);
      setTimeout(function() {
          store.set("build", build_version);
          window.location = "login.html";
      }, 1000);
  });

  // Notify "progress" of the decompressed files
  unzipper.on('progress', function (fileIndex, fileCount) {
      console.log('Extracted file ' + (fileIndex + 1) + ' of ' + fileCount);
  });

  // Start extraction of the content
  unzipper.extract({
      path: ""
      // You can filter the files that you want to unpack using the filter option
      //filter: function (file) {
          //console.log(file);
          //return file.type !== "SymbolicLink";
      //}
  });

}
// Update it
async function Update(win, store) {
  var build_version = await checkForUpdate();

  //TODO: for testing
  store.set("build", -1);
  // REMOVE

  if(build_version != store.get("build", -1)) {
    document.getElementById("status").innerHTML = "Downloading...";

    // This can be downloaded directly:
    var os = getOs();
    if(!os) {
      document.getElementById("status").innerHTML = "OS Not Supported";
      return;
    }

    //Download
    // Imports the Google Cloud client library
    const {Storage} = require('@google-cloud/storage');

    // Creates a client
    const storage = new Storage();

    const bucketName = 'portalspaces-install';
    const srcFilename = os + '/install.zip';
    const destFilename = './install.zip'

    const options = {
      destination: destFilename,
    };

    // Downloads the file
    await storage
      .bucket(bucketName)
      .file(srcFilename)
      .download(options);

    console.log(
      `gs://${bucketName}/${srcFilename} downloaded to ${destFilename}.`
    );

    InstallUpdate(build_version);

    // percent_done = e.loaded/(total_bytes*4); // Approximation because of GZIP issue
    // var ele = document.getElementById("progress");
    // ele.setAttribute("style", "width:"+(percent_done*100)+"%;")
    //
    // //win.setProgressBar(percent_done);
    // var ele = document.getElementById("progress");
    // ele.setAttribute("style", "width:0%;");
    //win.setProgressBar(0);

  } else {
    // No Update Needed, go to next html page
    window.location = "login.html";
  }
}
