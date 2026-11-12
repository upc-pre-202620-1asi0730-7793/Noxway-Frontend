import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { VectorTile } from '@mapbox/vector-tile';
import { CRS, latLng, type LatLng } from 'leaflet';
import { PbfReader } from 'pbf';
import { forkJoin, map, shareReplay, switchMap, timeout } from 'rxjs';

const zoom = 14;
const radius = 3000;
const tileCount = 2 ** zoom;

export interface NearbyPlace {
  id: string;
  category: string;
  name: string;
  lat: number;
  lon: number;
  distance: number;
  openAllDay?: boolean;
}

@Injectable({ providedIn: 'root' })
export class NearbyPlaces {
  private readonly http = inject(HttpClient);
  private readonly source = this.http.get<{ tiles: string[] }>('https://tiles.openfreemap.org/planet')
    .pipe(timeout(6000), shareReplay({ bufferSize: 1, refCount: true }));

  load(center: LatLng) {
    const latitudeDelta = radius / 111195;
    const longitudeDelta = latitudeDelta / Math.max(0.09, Math.cos(center.lat * Math.PI / 180));
    const tile = (lat: number, lon: number) => CRS.EPSG3857.latLngToPoint(latLng(lat, lon), zoom).divideBy(256).floor();
    const start = tile(center.lat + latitudeDelta, center.lng - longitudeDelta);
    const end = tile(center.lat - latitudeDelta, center.lng + longitudeDelta);

    return this.source.pipe(switchMap(({ tiles: [template] }) => {
      const requests = [];
      for (let x = start.x; x <= end.x; x++) {
        for (let y = Math.max(0, start.y); y <= Math.min(tileCount - 1, end.y); y++) {
          const wrappedX = ((x % tileCount) + tileCount) % tileCount;
          const url = template.replace('{z}', String(zoom)).replace('{x}', String(wrappedX)).replace('{y}', String(y));
          requests.push(this.http.get(url, { responseType: 'arraybuffer' })
            .pipe(timeout(6000), map((data) => data?.byteLength ? this.decode(data, wrappedX, y, center) : [])));
        }
      }
      return forkJoin(requests).pipe(map((groups) => {
        const unique = new Map(groups.flat().map((place) => [place.id, place]));
        return [...unique.values()].sort((a, b) => a.distance - b.distance);
      }));
    }));
  }

  private decode(data: ArrayBuffer, x: number, y: number, center: LatLng): NearbyPlace[] {
    const layer = new VectorTile(new PbfReader(new Uint8Array(data))).layers['poi'];
    const places: NearbyPlace[] = [];
    for (let index = 0; layer && index < layer.length; index++) {
      const feature = layer.feature(index);
      const category = String(feature.properties['subclass'] ?? feature.properties['class']);
      if (!['pharmacy', 'supermarket', 'fuel'].includes(category)) continue;

      const geometry = feature.toGeoJSON(x, y, zoom).geometry;
      if (geometry.type !== 'Point') continue;

      const [lon, lat] = geometry.coordinates;
      const distance = center.distanceTo(latLng(lat, lon));
      if (distance > radius) continue;

      const name = String(feature.properties['name'] ?? '');
      const id = `${category}/${lat.toFixed(5)}/${lon.toFixed(5)}/${name}`;
      places.push({ id, category, name, lat, lon, distance, openAllDay: feature.properties['opening_hours'] === '24/7' });
    }
    return places;
  }
}
