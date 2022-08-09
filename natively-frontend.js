let natively = {
  isDebug: false,
  min_app_version: "",
  app_version: "",
  injected: false,
  observers: [],
  oneSignalAppId: "",

  setDebug: function (isDebug) {
    natively.isDebug = isDebug;
  },

  notify: function () {
    natively.injected = true;
    const observers = natively.observers;
    if (natively.isDebug) {
      console.log("[INFO] Notify observers: ", observers.length);
    }
    while (observers.length > 0) {
      const observer = observers.shift();
      observer();
    }
  },

  addObserver: function (fn) {
    if (natively.injected) {
      fn();
    } else {
      if (natively.isDebug) {
        console.log(`[DEBUG] addObserver: ${fn}`);
      }
      natively.observers.push(fn);
    }
  },

  trigger: function (respId, minVersion, callback, method, body) {
    const isTestVersion = natively.isDebug;
    if (!natively.injected) {
      natively.addObserver(() => {
        natively.trigger(respId, minVersion, callback, method, body);
      });
      return;
    }
    if (isTestVersion && minVersion > natively.app_version) {
      alert(
        `[ERROR] Please rebuild the app to use this functionality. App Version: ${natively.app_version}, feature version: ${minVersion}`
      );
      return;
    }
    if (callback) {
      let fullMethodName;
      if (respId) {
        fullMethodName = method + "_response" + "_" + respId;
      } else {
        fullMethodName = method + "_response";
      }
      window[fullMethodName] = function (resp, err) {
        $agent.response();
        if (err.message && isTestVersion) {
          alert(`[ERROR] Error message: ${err.message}`);
          return;
        }
        if (isTestVersion) {
          console.log(
            `[DEBUG] Callback method: ${fullMethodName}, body: ${JSON.stringify(
              resp
            )}, respId: ${respId}`
          );
        }
        callback(resp);
      };
      if (body) {
        body.response_id = respId;
      } else {
        body = { response_id: respId };
      }
    }
    if (isTestVersion) {
      console.log(
        `[DEBUG] Trigger method: ${method}, body: ${JSON.stringify(body)}`
      );
    }
    $agent.trigger(method, body);
  },

  shareImage(image_url) {
    window.natively_injector(undefined, 0, undefined, "share_image", {
      url: image_url,
    });
  },

  shareText(text) {
    window.natively_injector(undefined, 0, undefined, "share_text", {
      text,
    });
  },

  shareTextAndImage(text, image_url) {
    window.natively_injector(undefined, 0, undefined, "share_text_and_image", {
      url: image_url,
      text,
    });
  },

  shareFile(file_url) {
    window.natively_injector(undefined, 2, undefined, "share_file", {
      url: file_url,
    });
  },

  openExternalURL(url) {
    window.natively_injector(undefined, 0, undefined, "open_link", {
      url,
    });
  },

  openExternalAppIOS(url) {
    window.natively_injector(undefined, 0, undefined, "open_app", {
      url,
    });
  },

  openAppSettings() {
    window.natively_injector(undefined, 0, undefined, "open_appsettings");
  },

  showAppToast(type, text) {
    const params = { type, text };
    window.natively_injector(undefined, 0, undefined, "show_toast", params);
  },

  showAppBanner(type, title, description) {
    const params = { type, title, description };
    window.natively_injector(undefined, 0, undefined, "show_banner", params);
  },

  requestAppReview() {
    window.natively_injector(undefined, 0, undefined, "request_review");
  },

  setAppBackgroundColor(color) {
    const params = { color };
    window.natively.trigger(undefined, 1, undefined, "app_background", params);
  },

  setAppProgressColor(color) {
    const params = { color };
    window.natively.trigger(undefined, 1, undefined, "app_progress", params);
  },

  setAppSwipeNavigationIOS(toggle) {
    const params = { toggle };
    window.natively.trigger(undefined, 1, undefined, "app_navigation", params);
  },

  setAppPullToRefresh(toggle) {
    const params = { toggle };
    window.natively.trigger(undefined, 1, undefined, "app_pull", params);
  },

  setAppStatusBarStyleIOS(style) {
    const params = { style };
    window.natively.trigger(
      undefined,
      2,
      undefined,
      "status_bar_style",
      params
    );
  },
};

window.natively = natively;
window.natively.isDebug = false;
window.natively.observers = [];
window.natively.injected = false;
const initialCallback = (resp) => {
  window.natively.min_app_version = resp.minSDKVersion;
  window.natively.app_version = resp.sdkVersion;
};
const initial = () =>
  window.natively.trigger(undefined, 0, initialCallback, "app_info", {});
window.natively.addObserver(initial);

class NativelyInfo {
  constructor() {
    const id = generateID();
    this.getAppInfo = function (app_info_callback) {
      window.natively.trigger(id, 0, app_info_callback, "app_info");
    };
  }
}

class NativelyNotifications {
  constructor() {
    const id = generateID();
    this.getOneSignalId = function (onesignal_playerid_callback) {
      window.natively.trigger(
        id,
        0,
        onesignal_playerid_callback,
        "onesignal_playerid"
      );
    };
    this.requestPermissionIOS = function (
      fallbackToSettings,
      push_register_callback
    ) {
      window.natively.trigger(id, 0, push_register_callback, "push_register", {
        fallbackToSettings,
      });
    };
    this.getPermissionStatusIOS = function (push_permission_callback) {
      window.natively.trigger(
        id,
        0,
        push_permission_callback,
        "push_permission"
      );
    };
  }
}

class NativelyGeolocation {
  constructor() {
    const id = generateID();
    this.getUserGeolocation = function (distance, geolocation_callback) {
      window.natively.trigger(id, 0, geolocation_callback, "geolocation", {
        distance,
      });
    };
    this.requestPermission = function (geo_register_callback) {
      window.natively.trigger(id, 0, geo_register_callback, "geo_register");
    };
    this.getPermissionStatus = function (geo_permission_callback) {
      window.natively.trigger(id, 0, geo_permission_callback, "geo_permission");
    };
  }
}

class NativelyMessage {
  constructor() {
    const id = generateID();
    this.sendSMS = function (body, recipient, send_sms_callback) {
      const params = {};
      params.body = typeof body === undefined ? "" : body;
      params.recipient = typeof recipient === undefined ? "" : recipient;
      window.natively.trigger(id, 0, send_sms_callback, "send_sms", params);
    };
    this.sendEmail = function (subject, body, recipient, send_email_callback) {
      const params = {};
      params.subject = typeof subject === undefined ? "" : subject;
      params.body = typeof body === undefined ? "" : body;
      params.recipient = typeof recipient === undefined ? "" : recipient;
      window.natively.trigger(id, 0, send_email_callback, "send_email", params);
    };
  }
}

class NativelyStorage {
  constructor() {
    const id = generateID();
    this.setStorageValue = function (key, value) {
      window.natively.trigger(id, 0, undefined, "set_storage_value", {
        key,
        value,
      });
    };
    this.getStorageValue = function (key, get_storage_value_callback) {
      window.natively.trigger(
        id,
        0,
        get_storage_value_callback,
        "get_storage_value",
        { key }
      );
    };
    this.removeStorageValue = function (key) {
      window.natively.trigger(id, 0, undefined, "remove_storage_value", {
        key,
      });
    };
    this.resetStorage = function () {
      window.natively.trigger(id, 0, undefined, "reset_storage");
    };
  }
}

class NativelyBiometrics {
  constructor(allowPass) {
    //const allowPasscode = allowPasscode;
    const id = generateID();
    this.checkBiometricsSupport = function (biometrics_support_callback) {
      window.natively.trigger(
        id,
        0,
        biometrics_support_callback,
        "biometrics_support",
        { allowPass }
      );
    };
    this.verifyUserIdentify = function (biometrics_verify_callback) {
      window.natively.trigger(
        id,
        0,
        biometrics_verify_callback,
        "biometrics_verify",
        { allowPass }
      );
    };
    this.getUserCredentials = function (biometrics_auth_callback) {
      window.natively.trigger(
        id,
        0,
        biometrics_auth_callback,
        "biometrics_auth",
        { allowPass }
      );
    };
    this.removeUserCredentials = function (
      biometrics_remove_credentials_callback
    ) {
      window.natively.trigger(
        id,
        0,
        biometrics_remove_credentials_callback,
        "biometrics_remove_credentials"
      );
    };
    this.saveUserCredentials = function (
      login,
      password,
      biometrics_auth_callback
    ) {
      window.natively.trigger(
        id,
        0,
        biometrics_auth_callback,
        "biometrics_auth",
        {
          allowPass,
          login,
          password,
        }
      );
    };
  }
}

class NativelyDatePicker {
  constructor() {
    const id = generateID();
    this.showDatePicker = function (
      title,
      description,
      type,
      style,
      datepicker_callback
    ) {
      let params = {};
      params.type = typeof type === undefined ? "DATE" : type;
      params.style = typeof style === undefined ? "LIGHT" : style;
      params.title = typeof title === undefined ? "" : title;
      params.description = typeof description === undefined ? "" : description;
      window.natively.trigger(id, 0, datepicker_callback, "datepicker", params);
    };
  }
}

class NativelyCamera {
  constructor() {
    const id = generateID();
    this.showCamera = function (type, quality, open_camera_callback) {
      let params = {};
      params.type = typeof type === undefined ? "photo" : type;
      params.quality = typeof quality === undefined ? "high" : quality;
      window.natively.trigger(
        id,
        2,
        open_camera_callback,
        "open_camera",
        params
      );
    };
  }
}

class NativelyScanner {
  constructor() {
    const id = generateID();
    this.showScanner = function (open_scanner_callback) {
      window.natively.trigger(id, 2, open_scanner_callback, "open_scanner", {});
    };
  }
}

class NativelyPurchases {
  constructor() {
    const id = generateID();
    this.purchaseIOS = function (productId, inapp_purchase_callback) {
      window.natively.trigger(
        id,
        3,
        inapp_purchase_callback,
        "inapp_purchase",
        { productId }
      );
    };
    this.purchaseAndroid = function (
      productType,
      productId,
      offerTag,
      inapp_purchase_callback
    ) {
      const tag = typeof offerTag === undefined ? "" : offerTag;
      let params = { productId, productType, offerTag: tag };
      window.natively.trigger(
        id,
        3,
        inapp_purchase_callback,
        "inapp_purchase",
        params
      );
    };
  }
}

class NativelyContacts {
  constructor() {
    const id = generateID();
    this.getAllContacts = function (contacts_all_callback) {
      window.natively.trigger(id, 3, contacts_all_callback, "contacts_all", {});
    };
    this.createContact = function (
      firstName,
      lastName,
      email,
      phone,
      contacts_save_callback
    ) {
      let params = { firstName };
      params.lastName = typeof lastName === undefined ? "" : lastName;
      params.email = typeof email === undefined ? "" : email;
      params.phone = typeof phone === undefined ? "" : phone;
      window.natively.trigger(
        id,
        3,
        contacts_save_callback,
        "contacts_save",
        params
      );
    };
  }
}

function generateID() {
  return Date.now().toString(36) + Math.random().toString(36).substring(2);
}