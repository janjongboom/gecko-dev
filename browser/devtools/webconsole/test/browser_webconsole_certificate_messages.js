/* vim:set ts=2 sw=2 sts=2 et: */
/* Any copyright is dedicated to the Public Domain.
 * http://creativecommons.org/publicdomain/zero/1.0/ */

// Tests that the Web Console shows weak crypto warnings (SHA-1 Certificate, SSLv3, and RC4)

const TEST_URI_PATH = "/browser/browser/devtools/webconsole/test/test-certificate-messages.html";
let gWebconsoleTests = [
  {url: "https://sha1ee.example.com" + TEST_URI_PATH,
   name: "SHA1 warning displayed successfully",
   warning: ["SHA-1"], nowarning: ["SSL 3.0", "RC4"]},
  {url: "https://ssl3.example.com" + TEST_URI_PATH,
   name: "SSL3 warning displayed successfully",
   pref: [["security.tls.version.min", 0]],
   warning: ["SSL 3.0"], nowarning: ["SHA-1", "RC4"]},
  {url: "https://rc4.example.com" + TEST_URI_PATH,
   name: "RC4 warning displayed successfully",
   warning: ["RC4"], nowarning: ["SHA-1", "SSL 3.0"]},
  {url: "https://ssl3rc4.example.com" + TEST_URI_PATH,
   name: "SSL3 and RC4 warning displayed successfully",
   pref: [["security.tls.version.min", 0]],
   warning: ["SSL 3.0", "RC4"], nowarning: ["SHA-1"]},
  {url: "https://sha256ee.example.com" + TEST_URI_PATH,
   name: "SSL warnings appropriately not present",
   warning: [], nowarning: ["SHA-1", "SSL 3.0", "RC4"]},
];
const TRIGGER_MSG = "If you haven't seen ssl warnings yet, you won't";

let gHud = undefined;
let gCurrentTest;

function test() {
  registerCleanupFunction(function () {
    gHud = null;
  });

  addTab("data:text/html;charset=utf8,Web Console weak crypto warnings test");
  browser.addEventListener("load", function _onLoad() {
    browser.removeEventListener("load", _onLoad, true);
    openConsole(null, runTestLoop);
  }, true);
}

function runTestLoop(theHud) {
  gCurrentTest = gWebconsoleTests.shift();
  if (!gCurrentTest) {
    finishTest();
  }
  if (!gHud) {
    gHud = theHud;
  }
  gHud.jsterm.clearOutput();
  browser.addEventListener("load", onLoad, true);
  if (gCurrentTest.pref) {
    SpecialPowers.pushPrefEnv({"set": gCurrentTest.pref},
      function() {
        content.location = gCurrentTest.url;
      });
  } else {
    content.location = gCurrentTest.url;
  }
}

function onLoad(aEvent) {
  browser.removeEventListener("load", onLoad, true);
  let aOutputNode = gHud.outputNode;

  waitForSuccess({
      name: gCurrentTest.name,
      validatorFn: function() {
        if (gHud.outputNode.textContent.indexOf(TRIGGER_MSG) >= 0) {
          for (let warning of gCurrentTest.warning) {
            if (gHud.outputNode.textContent.indexOf(warning) < 0) {
              return false;
            }
          }
          for (let nowarning of gCurrentTest.nowarning) {
            if (gHud.outputNode.textContent.indexOf(nowarning) >= 0) {
              return false;
            }
          }
          return true;
        }
      },
      successFn: runTestLoop,
      failureFn: finishTest,
    });
}
