workspace "Noxway Frontend SPA - C4 Model" "Frontend software architecture for the Noxway Angular 21 Single-Page Application." {

    model {
        worker = person "Night-Shift Worker" "Uses Worker Portal (/dashboard, /journey, /map, /community, /wellness, /benefits, /trusted-contacts, /profile)."
        companion = person "Trusted Contact (Companion)" "Uses Companion Portal (/companion/live, /history, /alerts, /emergency, /invitations, /profile)."

        noxwayBackend = softwareSystem "Noxway Platform REST API" "Spring Boot 3.5.7 backend providing /api/v1 endpoints and RFC 9457 Problem Details." {
            tags "External System"
        }

        osmTiles = softwareSystem "OpenStreetMap Raster Tiles" "Provides interactive street map tiles rendered via Leaflet." {
            tags "External System"
        }

        openFreeMap = softwareSystem "OpenFreeMap Vector Tiles (Planet PBF)" "Provides zoom-14 Mapbox Vector Tiles decoded in-browser with pbf and @mapbox/vector-tile for 24h POIs." {
            tags "External System"
        }

        frontendSystem = softwareSystem "Noxway Frontend Web Application" "Angular 21 Single-Page Application with Signals, Day/Night adaptive theme, bilingual UI (ES/EN), and interactive OpenStreetMap workflows." {

            spaContainer = container "Angular 21 SPA" "Runs in the user's browser and coordinates Worker Portal and Companion Portal." "Angular 21, TypeScript 5.9, Leaflet 1.9" {
                tags "Web Browser"

                shellModule = component "Shared Shell & Interceptors" "Layout, ThemeService (Day/Night), LanguageService (ES/EN), ActorContextService, actorContextInterceptor." "Angular Module"
                dashboardModule = component "Dashboard Module" "Aggregates live KPIs from profile, commutes, trust links, community, wellness, and subscriptions." "Angular Module"
                commuteModule = component "Commute & Journey Module" "Active commute check-in, interactive OSM GPS telemetry ping picker, delay notices, SOS trigger, and route ratings." "Angular Module"
                communityMapModule = component "Community & 24h Map Module" "MapView (OSM + OpenFreeMap PBF POIs + Noxway 24h points + Risk Zones), Community feed, and <dialog> notice composer with ReportLocation picker." "Angular Module"
                wellnessModule = component "Wellness & Sleep Module" "7-day sleep chart, daily target goal configuration, and rest session log." "Angular Module"
                subscriptionsModule = component "Subscriptions & Benefits Module" "Plans catalog, offline payments, collective benefits, FAMILY_CREW invitations, and referral program." "Angular Module"
                iamModule = component "IAM, Profile & Trusted Contacts Module" "Personal profile, shift schedule, notification preferences, and TrustLink invitations." "Angular Module"
                companionModule = component "Companion Portal Module" "Live worker monitoring with map links, alert feed, delivery queue, emergency lines, and invitations." "Angular Module"
            }
        }

        worker -> spaContainer "Operates Worker Portal" "HTTPS"
        companion -> spaContainer "Operates Companion Portal" "HTTPS"

        shellModule -> noxwayBackend "Attaches X-Actor-Id and Accept-Language headers" "JSON/HTTPS"
        dashboardModule -> noxwayBackend "GET /accounts/me, /commutes/mine, /trust-links, /community/*, /wellness/summary, /subscriptions" "JSON/HTTPS"
        commuteModule -> noxwayBackend "GET/POST /commutes/*, /incidents/*, /community/route-ratings" "JSON/HTTPS"
        communityMapModule -> noxwayBackend "GET/POST/PUT /community/services, /risk-zones, /posts, /moderation/reports" "JSON/HTTPS"
        communityMapModule -> osmTiles "Loads interactive street tiles in MapView and ReportLocation" "HTTPS"
        communityMapModule -> openFreeMap "Fetches and decodes zoom-14 PBF vector tiles for nearby pharmacies, fuel stations, supermarkets, hospitals, and police" "HTTPS"
        wellnessModule -> noxwayBackend "GET/POST/DELETE /wellness/rest-sessions, GET/PUT /wellness/goal, GET /wellness/summary" "JSON/HTTPS"
        subscriptionsModule -> noxwayBackend "GET/POST /plans, /subscriptions, /payments, /benefits, /referrals" "JSON/HTTPS"
        iamModule -> noxwayBackend "GET/PUT /accounts/me, /notification-preferences, GET/POST/DELETE /trust-links" "JSON/HTTPS"
        companionModule -> noxwayBackend "GET /companion/live, /companion/alerts, GET/POST /alerts/deliveries*" "JSON/HTTPS"
    }

    views {
        systemContext frontendSystem "FrontendSystemContext" "System context of Noxway Frontend SPA." {
            include worker
            include companion
            include frontendSystem
            include noxwayBackend
            include osmTiles
            include openFreeMap
            autoLayout lr
        }

        component spaContainer "FrontendComponents" "Internal Bounded-Context modules of the Angular 21 SPA." {
            include shellModule
            include dashboardModule
            include commuteModule
            include communityMapModule
            include wellnessModule
            include subscriptionsModule
            include iamModule
            include companionModule
            include noxwayBackend
            include osmTiles
            include openFreeMap
            autoLayout lr
        }

        styles {
            element "Person" {
                shape Person
                background "#08427b"
                color "#ffffff"
            }
            element "Software System" {
                background "#2563eb"
                color "#ffffff"
            }
            element "External System" {
                background "#64748b"
                color "#ffffff"
            }
            element "Web Browser" {
                shape WebBrowser
                background "#1e293b"
                color "#ffffff"
            }
            element "Component" {
                background "#93c5fd"
                color "#0f172a"
            }
        }

        theme default
    }
}
