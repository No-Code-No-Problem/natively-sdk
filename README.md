# natively-sdk

### Installation

Add to the website page header:

```
<script src="https://cdn.jsdelivr.net/npm/natively@1.3.6/natively-frontend.min.js"></script>
```

### Usage

```
// Elements (with callback from the App)
const notifications = new NativelyNotifications();
const playerId_callback = function(resp) {
    console.log(resp);
    console.log(resp.playerId);
};
notifications.getOneSignalId(playerId_callback);

// Actions (without callback from the App)
window.natively.shareText("Hello world!");
```

More in [documentation](https://docs.buildnatively.com/guides/integration/how-to-get-started#javascript-sdk)

