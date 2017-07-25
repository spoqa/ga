# gaw
simple [google analytics](https://developers.google.com/analytics/) wrapper

# Usage
```sh
npm install gaw
```

```js
import { Tracker } from 'gaw';
const tracker = Tracker.init({ trackingId: 'UA-XXXX-Y' });
if (traditional_web_page) {
    tracker.trackCurrentPage();
}
if (single_page_application) {
    tracker.startSession('pageview');
    tracker.trackPage('/blabla');
    // tracker.endSession('pageview');
}
tracker.trackEvent('Carousel', 'slide to left');
```
