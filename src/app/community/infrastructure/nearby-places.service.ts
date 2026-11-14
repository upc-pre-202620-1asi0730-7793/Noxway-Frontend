import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { VectorTile } from '@mapbox/vector-tile';
import { CRS, latLng, type LatLng } from 'leaflet';
import { PbfReader } from 'pbf';
import { catchError, forkJoin, map, Observable, of, shareReplay, switchMap, timeout } from 'rxjs';

const POI_ZOOM = 14;
export const NEARBY_RADIUS_METERS = 3000;
const TILE_COUNT = 2 ** POI_ZOOM;
const ALLOWED_OSM_CATEGORIES = new Set(['pharmacy', 'supermarket', 'fuel']);

export type OsmPoiCategory = 'pharmacy' | 'supermarket' | 'fuel';

export interface NearbyPlace {
  id: string;
  category: string;
  name: string;
  lat: number;
  lon: number;
  distance: number;
  openAllDay?: boolean;
}

/**
 * Decodes an OpenFreeMap MVT vector tile buffer into POI records within the target radius.
 */
export function decodePoiVectorTile(
  data: ArrayBuffer,
  x: number,
  y: number,
  center: LatLng,
  radiusMeters = NEARBY_RADIUS_METERS,
  zoom = POI_ZOOM,
): NearbyPlace[] {
  const layer = new VectorTile(new PbfReader(new Uint8Array(data))).layers['poi'];
  if (!layer) return [];

  const places: NearbyPlace[] = [];
  for (let index = 0; index < layer.length; index++) {
    const feature = layer.feature(index);
    const category = String(feature.properties['subclass'] ?? feature.properties['class'] ?? '');
    if (!ALLOWED_OSM_CATEGORIES.has(category)) continue;

    const geometry = feature.toGeoJSON(x, y, zoom).geometry;
    if (geometry.type !== 'Point') continue;

    const [lon, lat] = geometry.coordinates;
    const distance = center.distanceTo(latLng(lat, lon));
    if (distance > radiusMeters) continue;

    const name = String(feature.properties['name'] ?? '');
    const id = `${category}/${lat.toFixed(5)}/${lon.toFixed(5)}/${name}`;
    places.push({
      id,
      category,
      name,
      lat,
      lon,
      distance,
      openAllDay: feature.properties['opening_hours'] === '24/7',
    });
  }
  return places;
}

@Injectable({ providedIn: 'root' })
export class NearbyPlacesService {
  private readonly http = inject(HttpClient);
  private readonly source = this.http
    .get<{ tiles: string[] }>('https://tiles.openfreemap.org/planet')
    .pipe(timeout(6000), shareReplay({ bufferSize: 1, refCount: true }));

  load(center: LatLng): Observable<NearbyPlace[]> {
    const latitudeDelta = NEARBY_RADIUS_METERS / 111195;
    const longitudeDelta =
      latitudeDelta / Math.max(0.09, Math.cos((center.lat * Math.PI) / 180));
    const tile = (lat: number, lon: number) =>
      CRS.EPSG3857.latLngToPoint(latLng(lat, lon), POI_ZOOM).divideBy(256).floor();

    const start = tile(center.lat + latitudeDelta, center.lng - longitudeDelta);
    const end = tile(center.lat - latitudeDelta, center.lng + longitudeDelta);

    return this.source.pipe(
      switchMap(({ tiles: [template] }) => {
        if (!template) return of([]);

        const requests: Observable<NearbyPlace[]>[] = [];
        for (let x = start.x; x <= end.x; x++) {
          for (let y = Math.max(0, start.y); y <= Math.min(TILE_COUNT - 1, end.y); y++) {
            const wrappedX = ((x % TILE_COUNT) + TILE_COUNT) % TILE_COUNT;
            const url = template
              .replace('{z}', String(POI_ZOOM))
              .replace('{x}', String(wrappedX))
              .replace('{y}', String(y));
            requests.push(
              this.http.get(url, { responseType: 'arraybuffer' }).pipe(
                timeout(6000),
                map((data) =>
                  data?.byteLength ? decodePoiVectorTile(data, wrappedX, y, center) : [],
                ),
                catchError(() => of([] as NearbyPlace[])),
              ),
            );
          }
        }

        if (requests.length === 0) return of([]);

        return forkJoin(requests).pipe(
          map((groups) => {
            const unique = new Map(groups.flat().map((place) => [place.id, place]));
            return [...unique.values()].sort((a, b) => a.distance - b.distance);
          }),
        );
      }),
    );
  }
}
