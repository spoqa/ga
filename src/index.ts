// https://developers.google.com/analytics/devguides/collection/analyticsjs/field-reference#apptracking
export interface Fields {
    trackingId: string,
    name?: string,
    cookieDomain?: string,
    appName?: string,
    appId?: string,
    appVersion?: string,
    appInstallerId?: string,
    userId?: string,
}

type HitType
    = 'pageview'
    | 'screenview'
    | 'event'
    | 'transaction'
    | 'item'
    | 'social'
    | 'exception'
    | 'timing'
    ;

const ga: UniversalAnalytics.ga = (function () { ga.q.push(arguments); } as any);
ga.l = +new Date();
ga.q = [];

export class Tracker {
    readonly fields: Readonly<Fields>;
    constructor(fields: Fields) {
        if (!Tracker.initializing) throw new Error(`Tracker.init으로 초기화 해주세요.`);
        this.fields = fields;
    }
    private static initializing: boolean = false;
    static get globalGaKey(): string {
        if (typeof window === 'undefined') return 'ga';
        const _window = window as any;
        if (!_window.GoogleAnalyticsObject) Tracker.globalGaKey = 'ga';
        return _window.GoogleAnalyticsObject;
    }
    static set globalGaKey(key: string) {
        if (typeof window === 'undefined') return;
        (window as any).GoogleAnalyticsObject = key;
    }
    // https://developers.google.com/analytics/devguides/collection/analyticsjs/
    static get ga(): UniversalAnalytics.ga {
        if (typeof window === 'undefined') return ga;
        const _window = window as any;
        if (!_window[Tracker.globalGaKey]) {
            _window[Tracker.globalGaKey] = ga;
            const script = document.createElement('script');
            const firstScriptElement = document.getElementsByTagName('script')[0];
            script.async = true;
            script.src = '//www.google-analytics.com/analytics.js';
            firstScriptElement!.parentNode!.insertBefore(script, firstScriptElement);
        }
        return _window[Tracker.globalGaKey];
    }
    static readonly trackers: {[trackerName: string]: Tracker} = {};
    // https://developers.google.com/analytics/devguides/collection/analyticsjs/creating-trackers#naming_trackers
    static readonly defaultTrackerName: string = 't0';
    static init(
        fields: Fields,
        optOut: boolean = false,
    ): Tracker {
        const name = fields.name || Tracker.defaultTrackerName;
        if (Tracker.trackers[name]) return Tracker.trackers[name];
        const trackingId = fields.trackingId;
        if (!/^UA-\d+-\d+$/.test(trackingId)) {
            throw new Error(`올바른 형식의 tracking id를 넣어주세요: https://developers.google.com/analytics/devguides/collection/analyticsjs/field-reference#trackingId`);
        }
        // https://developers.google.com/analytics/devguides/collection/analyticsjs/user-opt-out
        if (optOut) (window as any)[`ga-disable-${ trackingId }`] = true;
        let instance;
        { Tracker.initializing = true;
            instance = new Tracker({
                cookieDomain: 'auto',
                ...fields,
                name,
            });
            Tracker.trackers[name] = instance;
        } Tracker.initializing = false;
        // https://developers.google.com/analytics/devguides/collection/analyticsjs/creating-trackers#specifying_fields_at_creation_time
        Tracker.ga('create', instance.fields);
        return instance;
    }
    private send(hitType: HitType, fields: UniversalAnalytics.FieldsObject) {
        Tracker.ga(`${ this.fields.name }.send`, { ...fields, hitType });
    }
    // https://developers.google.com/analytics/devguides/collection/analyticsjs/field-reference#session
    startSession() { this.send('pageview', { sessionControl: 'start' }); }
    endSession() { this.send('pageview', { sessionControl: 'end' }); }
    // https://developers.google.com/analytics/devguides/collection/analyticsjs/pages
    trackPage(pathname: string, title?: string) { // window.location.pathname
        if (pathname[0] !== '/') throw new Error(`pathname은 슬래시문자('/')로 시작해야 합니다: https://developers.google.com/analytics/devguides/collection/analyticsjs/pages#pageview_fields`);
        this.send('pageview', { page: pathname, title });
    }
    trackPageByFullUrl(href: string, title?: string) { // window.location.href
        if (!/^https?:\/\//.test(href)) throw new Error('온전한 url을 넣어주세요.');
        this.send('pageview', { location: href, title });
    }
    // https://developers.google.com/analytics/devguides/collection/analyticsjs/screens
    trackScreen(screenName: string) {
        if (!this.fields.appName) throw new Error('앱 화면을 트래킹하려면 appName 필드가 채워져있어야 합니다: https://developers.google.com/analytics/devguides/collection/analyticsjs/screens#screen_fields');
        this.send('screenview', { screenName });
    }
    // https://developers.google.com/analytics/devguides/collection/analyticsjs/events
    trackEvent(
        eventCategory: string,
        eventAction: string,
        eventLabel?: string | undefined,
        eventValue?: number | undefined,
        nonInteraction?: boolean | undefined,
        // https://developers.google.com/analytics/devguides/collection/analyticsjs/field-reference#transport
        transport?: 'beacon' | 'xhr' | 'image' | undefined,
    ) {
        this.send('event', {
            eventCategory,
            eventAction,
            eventLabel,
            eventValue,
            nonInteraction,
            transport,
        });
    }
}
