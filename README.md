# gaw
simple [google analytics](https://developers.google.com/analytics/) wrapper

# Usage
```sh
npm install gaw
```

```js
import { Tracker } from 'gaw';
const tracker = Tracker.init({ trackingId: 'UA-XXXX-Y' });
tracker.startSession();
// tracker.trackPage('/blabla'); // for single page application
// tracker.trackEvent('Carousel', 'slide to left');
```
